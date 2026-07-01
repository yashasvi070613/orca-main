"use client";

import React, { useState } from "react";
import { UploadCloud, ShieldCheck, FileCheck, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

interface VerificationResult {
  success: boolean;
  errorTitle?: string;
  errorMessage?: string;
  data?: {
    verificationStatus: string;
    caseNumber: string;
    reportReference: string;
    verificationId: string;
    officerName: string;
    officerRank: string;
    policeStation: string;
    district: string;
    classification: string;
    issuingAuthority: string;
    generatedAt: string;
  };
}

export const DocumentVerification: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    const inputEl = document.getElementById("doc-file-input") as HTMLInputElement;
    if (inputEl) {
      inputEl.value = "";
    }
  };

  const handleVerify = async () => {
    if (!file) {
      setError("Please select or drop a report or barcode image to verify.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/verification/document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with Zia verification servers.");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = result?.success && result?.data?.verificationStatus === "VERIFIED";

  return (
    <div style={{ animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #001f3f 0%, #002855 100%)",
        padding: "24px 32px",
        borderRadius: 8,
        color: "white",
        boxShadow: "0 4px 15px rgba(0,31,63,0.15)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck style={{ width: 28, height: 28, color: "#FF9933" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-serif, serif)" }}>
              Official Document Verification Console
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4, fontFamily: "var(--font-sans, sans-serif)" }}>
            Cryptographic forensic verification of O.R.C.A intelligence dossiers &amp; barcodes powered by Zoho Catalyst (Zia) SDK
          </p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          padding: "8px 16px",
          borderRadius: 4,
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 11,
          color: "#FF9933",
          fontWeight: 700
        }}>
          ZIA SCANNER ACTIVE
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left Column: Upload UI */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#001f3f", display: "flex", alignItems: "center", gap: 8 }}>
              <FileCheck style={{ width: 18, height: 18, color: "#002855" }} /> Upload Report or Barcode Image
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Upload an ORCA intelligence brief page or cropped Code 128 barcode image for verification.
            </p>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: dragActive ? "2px dashed #FF9933" : "2px dashed #cbd5e1",
              background: dragActive ? "rgba(255,153,51,0.05)" : "#f8fafc",
              borderRadius: 6,
              padding: "36px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "0.2s"
            }}
            onClick={() => document.getElementById("doc-file-input")?.click()}
          >
            <input
              id="doc-file-input"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
              style={{ display: "none" }}
            />
            <UploadCloud style={{ width: 44, height: 44, color: dragActive ? "#FF9933" : "#94a3b8", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
              {file ? file.name : "Drag & Drop Report Image Here"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to browse from computer (PNG, JPG, PDF)"}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={handleVerify}
              disabled={loading || !file}
              style={{
                flex: 1,
                background: loading || !file ? "#94a3b8" : "#001f3f",
                color: "white",
                border: "none",
                borderRadius: 4,
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading || !file ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "0.2s"
              }}
            >
              {loading ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <ShieldCheck style={{ width: 18, height: 18, color: "#FF9933" }} />}
              {loading ? "Scanning Barcode via Zia..." : "Verify Document"}
            </button>

            {file && (
              <button
                onClick={handleReset}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: 4,
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Reset
              </button>
            )}
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#990000", padding: 12, borderRadius: 4, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Verification Results */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 340
        }}>
          {!result && !loading && (
            <div style={{ textAlign: "center", color: "#94a3b8" }}>
              <ShieldCheck style={{ width: 56, height: 56, margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#475569" }}>Awaiting Verification Request</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Upload an intelligence document or barcode to initiate Catalyst OCR scan.</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", color: "#002855" }}>
              <Loader2 style={{ width: 48, height: 48, animation: "spin 1s linear infinite", margin: "0 auto 16px", color: "#FF9933" }} />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Extracting &amp; Validating Barcode</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontFamily: "monospace" }}>zcatalyst-sdk-node // zia.scanBarcode()</div>
            </div>
          )}

          {result && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Verification Badge */}
              <div style={{
                background: isVerified ? "#f0fdf4" : "#fef2f2",
                border: isVerified ? "1px solid #bbf7d0" : "1px solid #fecaca",
                padding: "16px 20px",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {isVerified ? (
                    <CheckCircle style={{ width: 32, height: 32, color: "#10b981" }} />
                  ) : (
                    <XCircle style={{ width: 32, height: 32, color: "#ef4444" }} />
                  )}
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: isVerified ? "#166534" : "#990000" }}>
                      {isVerified ? "🟢 VERIFIED" : (result.errorTitle || "🔴 INVALID DOCUMENT")}
                    </div>
                    <div style={{ fontSize: 11, color: isVerified ? "#15803d" : "#990000", fontFamily: "monospace", marginTop: 2 }}>
                      {isVerified ? "Cryptographic signature authentic and court admissible." : (result.errorMessage || "Validation failed.")}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b" }}>
                  ZIA VERIFIED
                </div>
              </div>

              {/* Structured Metadata Card (Populated strictly from Firestore Data) */}
              {isVerified && result.data && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "monospace", marginBottom: 12 }}>
                    Authoritative Firestore Record Dossier
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12, fontFamily: "sans-serif" }}>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>VERIFICATION STATUS</span>
                      <strong style={{ color: "#10b981" }}>🟢 {result.data.verificationStatus}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>VERIFICATION ID</span>
                      <strong style={{ color: "#003a75", fontFamily: "monospace" }}>{result.data.verificationId}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>CASE NUMBER</span>
                      <strong style={{ color: "#001f3f" }}>{result.data.caseNumber}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>REPORT REFERENCE</span>
                      <strong style={{ color: "#002855" }}>{result.data.reportReference}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>INVESTIGATING OFFICER</span>
                      <strong style={{ color: "#1e293b" }}>{result.data.officerName}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>OFFICER RANK</span>
                      <strong style={{ color: "#475569" }}>{result.data.officerRank}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>POLICE STATION / UNIT</span>
                      <strong style={{ color: "#334155" }}>{result.data.policeStation}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>DISTRICT / JURISDICTION</span>
                      <strong style={{ color: "#334155" }}>{result.data.district}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>ISSUING AUTHORITY</span>
                      <strong style={{ color: "#002855" }}>{result.data.issuingAuthority}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>GENERATED DATE &amp; TIME</span>
                      <strong style={{ color: "#334155" }}>{result.data.generatedAt}</strong>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #cbd5e1", fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontFamily: "monospace" }}>SECURITY CLASSIFICATION:</span>
                    <span style={{ background: "#001f3f", color: "#FF9933", padding: "2px 8px", borderRadius: 2, fontWeight: 700, fontSize: 10, fontFamily: "monospace" }}>
                      {result.data.classification}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
