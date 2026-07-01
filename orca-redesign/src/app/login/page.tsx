"use client";

import React, { useState, useEffect } from "react";
import { useAuth, mapBadgeToEmail } from "@/context/AuthContext";
import { useIntelligence } from "@/context/IntelligenceContext";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const ORCA = {
  navy: "#001f3f",
  fontSans: "'Inter', sans-serif",
  fontSerif: "'Libre Baskerville', Georgia, serif",
};

const KARNATAKA_DISTRICTS = [
  "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", 
  "Bidar", "Chamarajanagara", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", 
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", 
  "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", 
  "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", 
  "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"
];

const RANKS = [
  "Police Constable", "Head Constable", "ASI", "PSI", "Inspector", 
  "DYSP", "ACP", "DCP", "SP", "DSP", "IPS Officer", "SCRB Analyst", "Cyber Crime Officer"
];

const ACCESS_MODULES = [
  "Crime Intelligence Dashboard", "FIR Analytics", "Criminal Database Search", 
  "Cyber Crime Intelligence", "Suspect Relationship Mapping", "Full Investigator Access"
];

export default function LoginPage() {
  const { login, loading, isLoggedIn } = useAuth();
  const { advanceDemo } = useIntelligence();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login Form States
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Register Form States
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regBadgeId, setRegBadgeId] = useState("");
  const [regRank, setRegRank] = useState("");
  const [regStation, setRegStation] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regRequestedAccess, setRegRequestedAccess] = useState("");
  const [regDeclaration, setRegDeclaration] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Theme support
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("ocra-theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("ocra-theme", nextTheme);
  };

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleNormalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await login(officerId, password);
      advanceDemo();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Auth error: ", err);
      setErrorMessage(err.message || "Access Denied: Invalid credentials provided.");
    }
  };

  const resetRegisterForm = () => {
    setRegFirstName("");
    setRegLastName("");
    setRegBadgeId("");
    setRegRank("");
    setRegStation("");
    setRegDistrict("");
    setRegEmail("");
    setRegMobile("");
    setRegPassword("");
    setRegConfirmPassword("");
    setRegRequestedAccess("");
    setRegDeclaration(false);
    setShowRegPassword(false);
    setShowRegConfirmPassword(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (!regDeclaration) {
      setErrorMessage("You must accept the security declaration before proceeding.");
      return;
    }

    setRegLoading(true);
    const emailToRegister = regEmail ? regEmail.trim().toLowerCase() : mapBadgeToEmail(regBadgeId);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailToRegister, regPassword);
      const newUser = userCredential.user;

      const officerDocRef = doc(db, "officers", newUser.uid);
      const officerData = {
        uid: newUser.uid,
        email: emailToRegister,
        name: `${regFirstName.trim()} ${regLastName.trim()}`.trim() || regBadgeId || "Officer",
        rank: regRank || "Inspector of Police",
        role: "CYBER_CELL",
        district: regDistrict || "Bengaluru Urban",
        station: regStation || "Internal Security Division",
        badgeId: regBadgeId || "",
        mobile: regMobile || "",
        requestedAccess: regRequestedAccess || "",
        clearanceLevel: "ISD-LEVEL-IV",
        lastLogin: new Date().toISOString(),
        active: true
      };

      try {
        await setDoc(officerDocRef, officerData, { merge: true });
      } catch (docErr) {
        console.warn("Firestore officer doc write warning:", docErr);
      }

      setRegLoading(false);
      setRegSuccess(true);
      resetRegisterForm();
    } catch (err: any) {
      setRegLoading(false);
      console.error("Firebase Registration Error:", err);
      let msg = "Failed to create officer account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "An Officer account with this Email or Badge ID already exists.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Please use a stronger password.";
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    }
  };

  // Password Strength Calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", color: "" };
    if (pass.length < 6) return { label: "Weak", color: "#ef4444" };
    if (pass.length < 10 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { label: "Medium", color: "#eab308" };
    return { label: "Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength(regPassword);

  // Theme colors matching login.html Design System
  const colors = theme === "light" ? {
    navy: "#001f3f",
    navyMid: "#002855",
    navyLight: "#003366",
    gold: "#FF9933",
    goldLight: "#ffaa55",
    white: "#ffffff",
    offWhite: "#f8fafc",
    textPrimary: "#1e293b",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    border: "#e2e8f0",
    cardBg: "#ffffff",
    shadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    inputBg: "#ffffff",
    red: "#ef4444",
    redDark: "#990000",
    purpleBg: "rgba(124, 58, 237, 0.05)",
    purpleBorder: "rgba(124, 58, 237, 0.1)"
  } : {
    navy: "#0a1628",
    navyMid: "#0f2040",
    navyLight: "#1a3460",
    gold: "#E8B04B",
    goldLight: "#F5C96A",
    white: "#e8eef5",
    offWhite: "#0f1e35",
    textPrimary: "#E8EEF5",
    textSecondary: "#9BB3CC",
    textMuted: "#6B8AAA",
    border: "#1e3050",
    cardBg: "#0f1e35",
    shadow: "0 2px 16px rgba(0, 0, 0, 0.4)",
    inputBg: "#0a1628",
    red: "#ef4444",
    redDark: "#990000",
    purpleBg: "rgba(232, 176, 75, 0.05)",
    purpleBorder: "rgba(232, 176, 75, 0.1)"
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.textPrimary,
    fontFamily: ORCA.fontSans,
    fontSize: 14,
    outline: "none",
    transition: "all 0.3s"
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: 6
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden", background: colors.offWhite, transition: "background 0.3s" }}>
      
      {/* Tricolor top strip — canonical O.C.R.A style */}
      <div style={{
        height: 5,
        background: `linear-gradient(to right, #FF9933 33.33%, #ffffff 33.33% 66.66%, #138808 66.66%)`,
        width: "100%",
        zIndex: 1000,
        position: "fixed",
        top: 0,
        left: 0
      }} />

      {/* Embedded CSS for custom hover effects and scrollbars */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        .btn-submit-hover:hover {
          background: ${colors.navyLight} !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 31, 63, 0.2);
        }
        .theme-btn:hover {
          border-color: ${colors.gold} !important;
          transform: translateY(-2px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.04);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #FF9933 0%, #ffffff 50%, #138808 100%);
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          opacity: 0.85;
          cursor: pointer;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ffaa55 0%, #ffffff 50%, #1eb012 100%);
          box-shadow: 0 0 8px rgba(255, 153, 51, 0.6);
          opacity: 1;
        }
      `}} />

      {/* Top controls matching login.html */}
      <div style={{
        position: "absolute",
        top: 24,
        right: 32,
        display: "flex",
        alignItems: "center",
        gap: 20,
        zIndex: 100
      }}>
        <a 
          href="/orca-ai.html" 
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: colors.textSecondary,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            background: "none",
            border: "none",
            textDecoration: "none",
            transition: "color 0.3s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = colors.gold}
          onMouseLeave={e => e.currentTarget.style.color = colors.textSecondary}
        >
          ← Back to Home
        </a>
        <button 
          onClick={handleToggleTheme}
          className="theme-btn"
          suppressHydrationWarning
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: colors.textPrimary,
            cursor: "pointer",
            boxShadow: colors.shadow,
            transition: "all 0.3s"
          }}
        >
          {mounted ? (theme === "dark" ? "☀️" : "🌙") : "🌙"}
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", width: "100%", minHeight: "100vh", marginTop: 5 }}>
        
        {/* Left Side: Branding */}
        <div style={{
          flex: 1,
          background: theme === "light" ? ORCA.navy : colors.navy,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 40px",
          position: "relative",
          overflow: "hidden",
          transition: "background 0.3s"
        }}>
          {/* Watermarked large background logo */}
          <img 
            src="/logo.png" 
            alt="Watermark Logo"
            style={{
              position: "absolute",
              width: "140%",
              opacity: 0.05,
              pointerEvents: "none",
              animation: "pulse 10s infinite alternate"
            }}
          />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 480 }}>
            <img 
              src="/logo.png" 
              alt="KSP Logo" 
              style={{
                height: 120,
                marginBottom: 32,
                marginRight: "auto",
                marginLeft: "auto"
              }}
            />
            <h1 style={{
              fontFamily: ORCA.fontSerif,
              color: "#ffffff",
              fontSize: 42,
              letterSpacing: "0.1em",
              marginBottom: 12,
              fontWeight: 700
            }}>
              <span style={{ color: colors.gold }}>O</span>.
              <span style={{ color: colors.gold }}>R</span>.
              <span style={{ color: colors.gold }}>C</span>.
              <span style={{ color: colors.gold }}>A</span>
            </h1>
            <div style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 13,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 8
            }}>
              Organized Crime Analysis Authority
            </div>
            <div style={{
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 32,
              fontFamily: ORCA.fontSans
            }}>
              ಸಂಘಟಿತ ಅಪರಾಧ ವಿಶ್ಲೇಷಣಾ ಪ್ರಾಧಿಕಾರ
            </div>
            <p style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: 15,
              lineHeight: 1.6,
              marginBottom: 24
            }}>
              Secure access portal for authorized Karnataka State Police and SCRB personnel. Ensure your
              connection is secure before authenticating.
            </p>

            <div style={{
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.5)",
              lineHeight: 1.5,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 20,
              maxWidth: 440,
              margin: "0 auto"
            }}>
              This system is restricted to authorised personnel of the Organised Crime Analysis Authority (ORCA), Karnataka State Police and the State Crime Records Bureau. All authentication attempts are logged, monitored and audited in accordance with Government security policies.
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          background: colors.offWhite,
          position: "relative",
          transition: "background 0.3s"
        }}>
          
          <div style={{
            width: "100%",
            maxWidth: 460,
            maxHeight: "88vh",
            display: "flex",
            flexDirection: "column",
            background: colors.cardBg,
            borderRadius: 20,
            padding: 36,
            boxShadow: colors.shadow,
            border: `1px solid ${colors.border}`,
            transition: "background 0.3s, border-color 0.3s"
          }}>
            
            {/* Tabs Selector Header */}
            <div style={{ 
              display: "flex", 
              background: theme === "light" ? "#e2e8f0" : "#061325", 
              borderRadius: 12, 
              padding: 4, 
              marginBottom: 24, 
              border: `1px solid ${theme === "light" ? "#cbd5e1" : "#1e293b"}` 
            }}>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => { setActiveTab("login"); setErrorMessage(""); setRegSuccess(false); }}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 9,
                  border: activeTab === "login" ? `1px solid ${colors.gold}` : "1px solid transparent",
                  background: activeTab === "login" ? colors.navy : "transparent",
                  color: activeTab === "login" ? "#ffffff" : (theme === "light" ? "#64748b" : "#94a3b8"),
                  fontWeight: activeTab === "login" ? 600 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.25s ease-in-out",
                  boxShadow: activeTab === "login" ? "0 4px 14px rgba(0, 31, 63, 0.35)" : "none"
                }}
                onMouseEnter={e => {
                  if (activeTab !== "login") {
                    e.currentTarget.style.background = theme === "light" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = colors.textPrimary;
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== "login") {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = theme === "light" ? "#64748b" : "#94a3b8";
                  }
                }}
              >
                Login
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => { setActiveTab("register"); setErrorMessage(""); }}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 9,
                  border: activeTab === "register" ? `1px solid ${colors.gold}` : "1px solid transparent",
                  background: activeTab === "register" ? colors.navy : "transparent",
                  color: activeTab === "register" ? "#ffffff" : (theme === "light" ? "#64748b" : "#94a3b8"),
                  fontWeight: activeTab === "register" ? 600 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.25s ease-in-out",
                  boxShadow: activeTab === "register" ? "0 4px 14px rgba(0, 31, 63, 0.35)" : "none"
                }}
                onMouseEnter={e => {
                  if (activeTab !== "register") {
                    e.currentTarget.style.background = theme === "light" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = colors.textPrimary;
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== "register") {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = theme === "light" ? "#64748b" : "#94a3b8";
                  }
                }}
              >
                Register
              </button>
            </div>

            <div className="custom-scrollbar" style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
              
              {errorMessage && (
                <div style={{
                  color: colors.red,
                  background: "rgba(239, 68, 68, 0.1)",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 20,
                  fontSize: 13,
                  border: "1px solid rgba(239, 68, 68, 0.3)"
                }}>
                  {errorMessage}
                </div>
              )}

              {/* LOGIN TAB */}
              {activeTab === "login" && (
                <div style={{ transition: "opacity 0.3s ease" }}>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontFamily: ORCA.fontSerif, fontSize: 26, color: colors.textPrimary, fontWeight: 700, marginBottom: 6 }}>
                      Secure Portal Login
                    </h2>
                    <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>
                      Enter your official credentials to access the platform.
                    </p>
                  </div>

                  <form onSubmit={handleNormalSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div>
                      <label style={labelStyle}>Officer ID / Badge Number</label>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        placeholder="e.g. KA-12345"
                        autoComplete="off"
                        suppressHydrationWarning
                        style={inputStyle}
                        onFocus={e => {
                          e.target.style.borderColor = colors.gold;
                          e.target.style.boxShadow = "0 0 0 3px rgba(255, 153, 51, 0.1)";
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = colors.border;
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <div style={{ position: "relative" }}>
                      <label style={labelStyle}>Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="off"
                        suppressHydrationWarning
                        style={inputStyle}
                        onFocus={e => {
                          e.target.style.borderColor = colors.gold;
                          e.target.style.boxShadow = "0 0 0 3px rgba(255, 153, 51, 0.1)";
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = colors.border;
                          e.target.style.boxShadow = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        suppressHydrationWarning
                        style={{
                          position: "absolute",
                          right: 14,
                          top: 36,
                          color: colors.textMuted,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13
                        }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginTop: 2 }}>
                      <a href="/forgot-password" style={{ color: colors.gold, fontWeight: 500, textDecoration: "none" }}>
                        Forgot Password?
                      </a>
                      <button 
                        type="button"
                        onClick={() => { setActiveTab("register"); setErrorMessage(""); }}
                        suppressHydrationWarning
                        style={{ background: "none", border: "none", color: colors.gold, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.color = colors.goldLight}
                        onMouseLeave={e => e.currentTarget.style.color = colors.gold}
                      >
                        Need Access?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="btn-submit-hover"
                      disabled={loading}
                      suppressHydrationWarning
                      style={{
                        width: "100%",
                        background: colors.navy,
                        color: "#ffffff",
                        fontSize: 15,
                        fontWeight: 600,
                        padding: 14,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 10,
                        opacity: loading ? 0.7 : 1,
                        marginTop: 6
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                          Authenticating...
                        </>
                      ) : (
                        <>Authenticate &rarr;</>
                      )}
                    </button>
                  </form>

                  <div style={{
                    marginTop: 20,
                    fontSize: 12,
                    color: colors.textMuted,
                    textAlign: "center",
                    fontStyle: "italic"
                  }}>
                    This portal is restricted to authorised Karnataka Police and SCRB personnel only.
                  </div>

                  <div style={{
                    marginTop: 24,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: 14,
                    background: colors.purpleBg,
                    borderRadius: 8,
                    border: `1px solid ${colors.purpleBorder}`,
                    transition: "all 0.3s"
                  }}>
                    <div style={{ color: theme === "light" ? "#7C3AED" : colors.gold, fontSize: 18 }}>🛡️</div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
                      <strong style={{ color: colors.textPrimary, display: "block", marginBottom: 2 }}>Restricted Access</strong>
                      Unauthorized access to this system is strictly prohibited under the Information Technology Act, 2000. All activities are logged and monitored.
                    </div>
                  </div>
                </div>
              )}

              {/* REGISTER TAB */}
              {activeTab === "register" && (
                <div style={{ transition: "opacity 0.3s ease" }}>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontFamily: ORCA.fontSerif, fontSize: 24, color: colors.textPrimary, fontWeight: 700, marginBottom: 6 }}>
                      Officer Registration
                    </h2>
                    <p style={{ color: colors.textSecondary, fontSize: 13, margin: 0 }}>
                      Submit official departmental credentials for portal clearance.
                    </p>
                  </div>

                  {regSuccess ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <CheckCircle2 style={{ width: 52, height: 52, color: "#10b981", margin: "0 auto 16px" }} />
                      <h3 style={{ fontSize: 18, color: colors.textPrimary, fontWeight: 700, marginBottom: 8 }}>
                        Registration Request Submitted
                      </h3>
                      <div style={{
                        textAlign: "left",
                        background: colors.purpleBg,
                        border: `1px solid ${colors.purpleBorder}`,
                        padding: 16,
                        borderRadius: 10,
                        fontSize: 13,
                        color: colors.textSecondary,
                        lineHeight: 1.6,
                        marginBottom: 20
                      }}>
                        Your registration request will be reviewed by your reporting officer and the SCRB administrator.
                        <br /><br />
                        <strong>Estimated approval time:</strong> 24–48 hours.
                        <br />
                        You will receive an official email after approval.
                      </div>
                      <button
                        type="button"
                        onClick={() => { setActiveTab("login"); setRegSuccess(false); }}
                        suppressHydrationWarning
                        style={{
                          background: colors.navy,
                          color: "#ffffff",
                          padding: "12px 24px",
                          borderRadius: 8,
                          border: "none",
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: "pointer"
                        }}
                      >
                        Return to Login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      
                      {/* Personal Information */}
                      <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                          Personal Information
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <label style={labelStyle}>First Name</label>
                            <input type="text" required value={regFirstName} onChange={e => setRegFirstName(e.target.value)} placeholder="e.g. Rajesh" suppressHydrationWarning style={inputStyle} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Last Name</label>
                            <input type="text" required value={regLastName} onChange={e => setRegLastName(e.target.value)} placeholder="e.g. Kumar" suppressHydrationWarning style={inputStyle} />
                          </div>
                        </div>
                      </div>

                      {/* Officer Information */}
                      <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                          Officer Information
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={labelStyle}>Badge / Officer ID</label>
                            <input type="text" required value={regBadgeId} onChange={e => setRegBadgeId(e.target.value)} placeholder="e.g. KA-99824" suppressHydrationWarning style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Rank & Designation</label>
                            <select required value={regRank} onChange={e => setRegRank(e.target.value)} suppressHydrationWarning style={{ ...inputStyle, cursor: "pointer" }}>
                              <option value="">Select Rank / Designation...</option>
                              {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Police Station / Unit</label>
                            <input type="text" required value={regStation} onChange={e => setRegStation(e.target.value)} placeholder="e.g. Halasuru PS / Central CEN Unit" suppressHydrationWarning style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>District</label>
                            <select required value={regDistrict} onChange={e => setRegDistrict(e.target.value)} suppressHydrationWarning style={{ ...inputStyle, cursor: "pointer" }}>
                              <option value="">Select Karnataka District...</option>
                              {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Official Contact */}
                      <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                          Official Contact
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={labelStyle}>Government Email (.gov.in)</label>
                            <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="e.g. officer@karnatakapolice.gov.in" suppressHydrationWarning style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Official Mobile Number</label>
                            <input type="tel" required value={regMobile} onChange={e => setRegMobile(e.target.value)} placeholder="e.g. +91 94808 xxxxx" suppressHydrationWarning style={inputStyle} />
                          </div>
                        </div>
                      </div>

                      {/* Security */}
                      <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                          Security
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ position: "relative" }}>
                            <label style={labelStyle}>Create Password</label>
                            <input type={showRegPassword ? "text" : "password"} required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" suppressHydrationWarning style={inputStyle} />
                            <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} suppressHydrationWarning style={{ position: "absolute", right: 14, top: 34, color: colors.textMuted, background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>
                              {showRegPassword ? "Hide" : "Show"}
                            </button>
                            {strength.label && (
                              <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: strength.color }}>
                                Strength: {strength.label}
                              </div>
                            )}
                          </div>
                          <div style={{ position: "relative" }}>
                            <label style={labelStyle}>Confirm Password</label>
                            <input type={showRegConfirmPassword ? "text" : "password"} required value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} placeholder="••••••••" suppressHydrationWarning style={inputStyle} />
                            <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} suppressHydrationWarning style={{ position: "absolute", right: 14, top: 34, color: colors.textMuted, background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>
                              {showRegConfirmPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Requested Access */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                          Requested Access
                        </div>
                        <select required value={regRequestedAccess} onChange={e => setRegRequestedAccess(e.target.value)} suppressHydrationWarning style={{ ...inputStyle, cursor: "pointer" }}>
                          <option value="">Select Module Access Level...</option>
                          {ACCESS_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>

                      {/* Declaration */}
                      <div style={{ marginTop: 6 }}>
                        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
                          <input type="checkbox" required checked={regDeclaration} onChange={e => setRegDeclaration(e.target.checked)} suppressHydrationWarning style={{ accentColor: colors.gold, width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
                          <span>I certify that the information provided is accurate. I understand that ORCA is a restricted Government of Karnataka system and unauthorized access may result in disciplinary and legal action.</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={regLoading}
                        suppressHydrationWarning
                        style={{
                          width: "100%",
                          background: colors.navy,
                          color: "#ffffff",
                          fontSize: 15,
                          fontWeight: 600,
                          padding: 14,
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 10,
                          opacity: regLoading ? 0.7 : 1,
                          marginTop: 10
                        }}
                      >
                        {regLoading ? (
                          <>
                            <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                            Submitting Registration...
                          </>
                        ) : (
                          <>Request Secure Access &rarr;</>
                        )}
                      </button>

                      {/* Approval Notice */}
                      <div style={{
                        marginTop: 16,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: 14,
                        background: colors.purpleBg,
                        borderRadius: 8,
                        border: `1px solid ${colors.purpleBorder}`,
                        transition: "all 0.3s"
                      }}>
                        <ShieldAlert style={{ width: 20, height: 20, color: theme === "light" ? "#7C3AED" : colors.gold, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
                          <strong style={{ color: colors.textPrimary, display: "block", marginBottom: 2 }}>Approval Notice</strong>
                          Your registration request will be reviewed by your reporting officer and the SCRB administrator.
                          <br />
                          <strong>Estimated approval time:</strong> 24–48 hours. You will receive an official email after approval.
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
