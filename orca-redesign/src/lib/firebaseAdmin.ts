import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function initAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }
  let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    serviceAccountJson = serviceAccountJson.trim();
    if ((serviceAccountJson.startsWith("'") && serviceAccountJson.endsWith("'")) ||
        (serviceAccountJson.startsWith('"') && serviceAccountJson.endsWith('"'))) {
      serviceAccountJson = serviceAccountJson.slice(1, -1);
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      console.log("[Firebase Admin] Service Account initialized successfully for:", serviceAccount.client_email);
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "orca-ai-india",
      });
    } catch (e: any) {
      console.error("[Firebase Admin Key Parse Error]:", e.message);
    }
  }
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "orca-ai-india",
  });
}

const adminApp = initAdmin();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
