"use client";

import React, { useState } from "react";
import { UserCheck, UploadCloud, CheckCircle, XCircle, Loader2, CreditCard, ShieldCheck, AlertTriangle } from "lucide-react";

interface IdentityResult {
  fullName: string;
  aadhaarNumber: string;
  dob: string;
  gender: string;
  address: string;
  state: string;
  pincode: string;
}

export const IdentityVerification: React.FC = () => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!frontFile) {
      setError("Please upload the front image of the Aadhaar card.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("front", frontFile);
      if (backFile) {
        formData.append("back", backFile);
      }

      const res = await fetch("/api/verification/identity", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Aadhaar verification failed.");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to execute Zia Aadhaar OCR extraction.");
    } finally {
      setLoading(false);
    }
  };

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
            <UserCheck style={{ width: 28, height: 28, color: "#FF9933" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-serif, serif)" }}>
              Citizen Identity Verification Console
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            Official Aadhaar document extraction &amp; identity verification powered by Zoho Catalyst (Zia) OCR
          </p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          padding: "8px 16px",
          borderRadius: 4,
          fontFamily: "monospace",
          fontSize: 11,
          color: "#FF9933",
          fontWeight: 700
        }}>
          ZIA AADHAAR OCR
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left Column: Dual Upload UI */}
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
              <CreditCard style={{ width: 18, height: 18, color: "#002855" }} /> Upload Aadhaar Card Documents
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Provide clear front and back scans of the citizen's Aadhaar card for OCR field extraction.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Front Upload Box */}
            <div
              style={{
                border: frontFile ? "2px solid #10b981" : "2px dashed #cbd5e1",
                background: frontFile ? "#f0fdf4" : "#f8fafc",
                borderRadius: 6,
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "0.2s"
              }}
              onClick={() => document.getElementById("aadhaar-front-input")?.click()}
            >
              <input
                id="aadhaar-front-input"
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && setFrontFile(e.target.files[0])}
                style={{ display: "none" }}
              />
              <UploadCloud style={{ width: 32, height: 32, color: frontFile ? "#10b981" : "#94a3b8", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Upload Aadhaar Front *</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {frontFile ? frontFile.name : "Click to select image"}
              </div>
            </div>

            {/* Back Upload Box */}
            <div
              style={{
                border: backFile ? "2px solid #10b981" : "2px dashed #cbd5e1",
                background: backFile ? "#f0fdf4" : "#f8fafc",
                borderRadius: 6,
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "0.2s"
              }}
              onClick={() => document.getElementById("aadhaar-back-input")?.click()}
            >
              <input
                id="aadhaar-back-input"
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && setBackFile(e.target.files[0])}
                style={{ display: "none" }}
              />
              <UploadCloud style={{ width: 32, height: 32, color: backFile ? "#10b981" : "#94a3b8", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Upload Aadhaar Back</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {backFile ? backFile.name : "Click to select image"}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={handleVerify}
              disabled={loading || !frontFile}
              style={{
                flex: 1,
                background: loading || !frontFile ? "#94a3b8" : "#001f3f",
                color: "white",
                border: "none",
                borderRadius: 4,
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading || !frontFile ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "0.2s"
              }}
            >
              {loading ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <UserCheck style={{ width: 18, height: 18, color: "#FF9933" }} />}
              {loading ? "Extracting via Zia OCR..." : "Verify Identity"}
            </button>

            {(frontFile || backFile) && (
              <button
                onClick={() => { setFrontFile(null); setBackFile(null); setResult(null); setError(null); }}
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
              <div>
                <strong style={{ display: "block" }}>🔴 Unable to Verify Identity</strong>
                <span style={{ fontSize: 11 }}>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Identity Dossier Results */}
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
          {!result && !loading && !error && (
            <div style={{ textAlign: "center", color: "#94a3b8" }}>
              <UserCheck style={{ width: 56, height: 56, margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#475569" }}>Awaiting Aadhaar Upload</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Upload Aadhaar front/back scans to perform Zia character extraction.</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", color: "#002855" }}>
              <Loader2 style={{ width: 48, height: 48, animation: "spin 1s linear infinite", margin: "0 auto 16px", color: "#FF9933" }} />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Running Zia Character Extraction</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontFamily: "monospace" }}>zcatalyst-sdk-node // zia.extractAadhaarCharacters()</div>
            </div>
          )}

          {result && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Status Badge */}
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "16px 20px",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CheckCircle style={{ width: 32, height: 32, color: "#10b981" }} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#166534" }}>
                      🟢 Identity Verified
                    </div>
                    <div style={{ fontSize: 11, color: "#15803d", fontFamily: "monospace", marginTop: 2 }}>
                      Aadhaar OCR extraction validated against State Records Database.
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b" }}>
                  ZIA OCR VALID
                </div>
              </div>

              {/* Extracted Details Card */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "monospace", marginBottom: 14 }}>
                  Extracted Citizen Identity Dossier
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13 }}>
                  <div>
                    <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>FULL NAME</span>
                    <strong style={{ color: "#001f3f", fontSize: 14 }}>{result.fullName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>AADHAAR NUMBER</span>
                    <strong style={{ color: "#002855", fontFamily: "monospace", fontSize: 14, letterSpacing: "0.05em" }}>{result.aadhaarNumber}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>DATE OF BIRTH</span>
                    <strong style={{ color: "#334155" }}>{result.dob}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace" }}>GENDER</span>
                    <strong style={{ color: "#334155" }}>{result.gender}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #cbd5e1" }}>
                  <span style={{ fontSize: 10, color: "#64748b", display: "block", fontFamily: "monospace", marginBottom: 2 }}>RESIDENTIAL ADDRESS</span>
                  <div style={{ fontSize: 12, color: "#1e293b", fontWeight: 600 }}>{result.address}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                    STATE: <strong>{result.state}</strong> &nbsp;·&nbsp; PINCODE: <strong style={{ fontFamily: "monospace" }}>{result.pincode}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
