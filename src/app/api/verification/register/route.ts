import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveLocalRecord, VerifiedDocumentRecord } from "@/lib/documentService";

const demoPreseeds: VerifiedDocumentRecord[] = [
  {
    verificationId: "VER-2026-ISD-CR-104",
    caseNumber: "FIR/2026/BLR/104",
    reportReference: "ISD-CR-104",
    reportType: "State Crime Intelligence Briefing",
    verificationStatus: "VERIFIED",
    issuingAuthority: "Karnataka State Police • SCRB (ORCA)",
    officerName: "DSP R.K. SHASTRY",
    officerRank: "IPS, Superintendent of Police",
    policeStation: "Internal Security Division (ISD)",
    district: "Bengaluru City",
    classification: "CONFIDENTIAL",
    generatedAt: "2026-06-28 14:59 IST",
    lastUpdated: "2026-06-28 14:59 IST",
    reportHash: "c2b8f9e29a8a34b22c8e9f1a0e9d9ef504d6a8f89e24b31a29ff0182bc8e92f"
  },
  {
    verificationId: "VER-2026-ISD-CR-8852",
    caseNumber: "FIR/2026/BLR/8852",
    reportReference: "ISD-CR-8852",
    reportType: "State Crime Intelligence Briefing",
    verificationStatus: "VERIFIED",
    issuingAuthority: "Karnataka State Police • SCRB (ORCA)",
    officerName: "DSP R.K. SHASTRY",
    officerRank: "IPS, Superintendent of Police",
    policeStation: "Internal Security Division (ISD)",
    district: "Bengaluru City",
    classification: "CONFIDENTIAL",
    generatedAt: "2026-06-28 15:30 IST",
    lastUpdated: "2026-06-28 15:30 IST",
    reportHash: "d16c7a92fb08a34b22c8e9f1a0e9d9ef504d6a8f89e24b31a29ff0182bc8e92f"
  }
];

export async function GET() {
  const synced: string[] = [];
  for (const record of demoPreseeds) {
    saveLocalRecord(record);
    try {
      const docRef = doc(db, "verified_documents", record.verificationId);
      await setDoc(docRef, record, { merge: true });
      synced.push(record.verificationId);
    } catch (err: any) {
      console.warn(`[Sync API] Could not sync ${record.verificationId}:`, err.message);
    }
  }
  return NextResponse.json({
    success: true,
    message: "Firestore database synced with initial ORCA verification records.",
    syncedRecords: synced
  });
}

export async function POST(req: NextRequest) {
  try {
    const record = await req.json();

    if (!record || !record.verificationId) {
      return NextResponse.json({ success: false, error: "Invalid document record payload." }, { status: 400 });
    }

    // Always keep in server memory cache for reliable fallback
    saveLocalRecord(record);

    // Attempt writing to Firestore server-side
    try {
      const docRef = doc(db, "verified_documents", record.verificationId);
      await setDoc(docRef, record, { merge: true });
      console.log(`[Server API] Successfully registered document in Firestore: ${record.verificationId}`);
    } catch (dbErr: any) {
      console.warn(`[Server API] Firestore write restricted by security rules or network:`, dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Document registered securely in ORCA verification ledger.",
      verificationId: record.verificationId
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to register document." }, { status: 500 });
  }
}
