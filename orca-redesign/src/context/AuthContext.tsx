"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getIdToken
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface OfficerProfile {
  uid: string;
  email: string;
  name: string;
  rank: string;
  role: "ADMIN" | "CYBER_CELL" | "INTELLIGENCE" | "ANALYST" | "OBSERVER";
  district: string;
  clearanceLevel: string;
  lastLogin: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  officerProfile: OfficerProfile | null;
  loading: boolean;
  login: (badgeId: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  hasAccess: (allowedRoles: string[]) => boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to query Firestore asynchronously with timeout safeguard
const getDocWithTimeout = (docRef: any, timeoutMs = 1500) => {
  return Promise.race([
    getDoc(docRef),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore Query Timeout")), timeoutMs))
  ]) as Promise<any>;
};

export const mapBadgeToEmail = (badgeId: string) => {
  const trimmed = badgeId.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  const cleanBadge = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `${cleanBadge}@karnatakapolice.gov.in`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [officerProfile, setOfficerProfile] = useState<OfficerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication cookie for Next.js Middleware route checks
  const syncCookie = async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const token = await getIdToken(currentUser);
        document.cookie = `authToken=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;
      } catch (e) {
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } else {
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      await syncCookie(currentUser);

      if (currentUser) {
        // Fetch matching Officer Profile from Firestore
        const docRef = doc(db, "officers", currentUser.uid);
        try {
          const docSnap = await getDocWithTimeout(docRef);
          if (docSnap.exists()) {
            setOfficerProfile(docSnap.data() as OfficerProfile);
          } else {
            // Standard fallback profile constructed strictly for verified Firebase authenticated user
            const fallbackProfile: OfficerProfile = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              name: currentUser.email?.split("@")[0].toUpperCase().replace(/_/g, " ") || "Officer",
              rank: "Investigating Officer",
              role: "CYBER_CELL",
              district: "Bengaluru Urban",
              clearanceLevel: "ISD-LEVEL-IV",
              lastLogin: new Date().toISOString(),
              active: true
            };
            setOfficerProfile(fallbackProfile);
          }
        } catch (error) {
          const fallbackProfile: OfficerProfile = {
            uid: currentUser.uid,
            email: currentUser.email || "",
            name: currentUser.email?.split("@")[0].toUpperCase().replace(/_/g, " ") || "Officer",
            rank: "Investigating Officer",
            role: "CYBER_CELL",
            district: "Bengaluru Urban",
            clearanceLevel: "ISD-LEVEL-IV",
            lastLogin: new Date().toISOString(),
            active: true
          };
          setOfficerProfile(fallbackProfile);
        }
      } else {
        setOfficerProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (badgeId: string, pin: string) => {
    setLoading(true);
    const trimmedBadge = badgeId.trim();
    const trimmedPin = pin.trim();

    if (!trimmedBadge || !trimmedPin) {
      setLoading(false);
      throw new Error("Please enter your Officer Badge ID/Email and Password.");
    }

    const email = mapBadgeToEmail(trimmedBadge);

    try {
      // Direct Firebase Authentication strictly enforcing registered credentials
      await signInWithEmailAndPassword(auth, email, trimmedPin);
    } catch (error: any) {
      setLoading(false);
      console.error("[Firebase Auth Error]:", error.code, error.message);
      
      let friendlyMessage = "Authentication failed. Invalid Officer credentials.";
      if (
        error.code === "auth/user-not-found" || 
        error.code === "auth/wrong-password" || 
        error.code === "auth/invalid-credential"
      ) {
        friendlyMessage = "Access Denied: Invalid Officer Badge ID/Email or Password.";
      } else if (error.code === "auth/invalid-email") {
        friendlyMessage = "Invalid format: Please enter a valid Officer Badge ID or Email.";
      } else if (error.code === "auth/too-many-requests") {
        friendlyMessage = "Access temporarily blocked due to multiple failed login attempts. Please try again later.";
      } else if (error.message) {
        friendlyMessage = error.message;
      }
      
      throw new Error(friendlyMessage);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      await syncCookie(null);
      setUser(null);
      setOfficerProfile(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Sign-out failure: ", error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (allowedRoles: string[]) => {
    if (!officerProfile) return false;
    return allowedRoles.includes(officerProfile.role);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, officerProfile, loading, login, logout, hasAccess, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
