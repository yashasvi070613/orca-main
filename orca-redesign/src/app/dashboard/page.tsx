"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIntelligence } from "@/context/IntelligenceContext";
import { useAuth } from "@/context/AuthContext";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Telemetry } from "@/components/dynamic/Telemetry";
import { Intercepts } from "@/components/dynamic/Intercepts";
import { MapGrid } from "@/components/dynamic/MapGrid";
import { Network } from "@/components/dynamic/Network";
import { Letterhead } from "@/components/dynamic/Letterhead";
import { DocumentVerification } from "@/components/dynamic/DocumentVerification";
import { AIChatbotModule } from "@/components/dynamic/AIChatbotModule";
import { districtDatabase, suspectDossiers } from "@/lib/mock";
import { 
  Plus, 
  UploadCloud, 
  ChevronRight, 
  AlertTriangle, 
  FileCheck, 
  ShieldAlert, 
  Clock, 
  UserCheck,
  Settings,
  Play,
  RotateCcw,
  CheckCircle,
  Loader2,
  Fingerprint
} from "lucide-react";

// ============================================================
// O.C.R.A Design System Tokens (inline, matching dashboard.html)
// ============================================================
const ORCA = {
  navy: "#001f3f",
  navyMid: "#002855",
  navyLight: "#003366",
  gold: "#FF9933",
  white: "#ffffff",
  offWhite: "#f8fafc",
  textDark: "#1e293b",
  textGray: "#475569",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  red: "#ef4444",
  redDark: "#990000",
  green: "#10b981",
  orange: "#f97316",
  blue: "#1E3A8A",
  shadow: "0 1px 3px rgba(0,0,0,0.1)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.1)",
};

// ============================================================
// O.C.R.A Panel Component (matches .panel, .panel-header, .panel-body)
// ============================================================
const Panel: React.FC<{
  header?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  noPadding?: boolean;
}> = ({ header, headerRight, children, style, bodyStyle, noPadding }) => (
  <div className="orca-panel" style={{
    background: ORCA.white,
    border: `1px solid ${ORCA.border}`,
    borderRadius: 8,
    boxShadow: ORCA.shadow,
    overflow: "hidden",
    ...style
  }}>
    {header && (
      <div className="orca-panel-header" style={{
        padding: "12px 16px",
        borderBottom: `1px solid ${ORCA.border}`,
        fontSize: 12,
        fontWeight: 700,
        color: ORCA.navy,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(0,0,0,0.01)",
        fontFamily: "JetBrains Mono, monospace"
      }}>
        <span>{header}</span>
        {headerRight && <span>{headerRight}</span>}
      </div>
    )}
    <div className="orca-panel-body" style={{ padding: noPadding ? 0 : 16, ...bodyStyle }}>
      {children}
    </div>
  </div>
);

// ============================================================
// O.C.R.A Page Header Component (matches .page-header)
// ============================================================
const PageHeader: React.FC<{
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="orca-page-header" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: ORCA.navy, marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: ORCA.textGray }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ============================================================
// O.C.R.A Button Styles
// ============================================================
const BtnNavy: React.FC<{ onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties }> = ({ onClick, children, style }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 14px",
      background: ORCA.navy,
      color: "white",
      border: "none",
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      ...style
    }}
    onMouseEnter={e => (e.currentTarget.style.background = ORCA.navyMid)}
    onMouseLeave={e => (e.currentTarget.style.background = ORCA.navy)}
  >
    {children}
  </button>
);

const BtnOutline: React.FC<{ onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties }> = ({ onClick, children, style }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 12px",
      border: `1px solid ${ORCA.border}`,
      background: ORCA.white,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 600,
      color: ORCA.textGray,
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      ...style
    }}
  >
    {children}
  </button>
);

const BtnOrange: React.FC<{ onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties }> = ({ onClick, children, style }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 12px",
      border: "none",
      background: ORCA.orange,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 600,
      color: "white",
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      alignItems: "center",
      gap: 6,
      ...style
    }}
  >
    {children}
  </button>
);

;

// ============================================================
// Main Content — all 8 tabs with O.C.R.A visual system
// ============================================================
const MainContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    activeFirId, 
    setActiveFirId,
    selectedSuspectId, 
    setSelectedSuspectId,
    selectedDistrictCode,
    firCases,
    aiReportLoading,
    activeReport,
    runAiQuery,
    ingestNewCase,
    demoStep,
    advanceDemo,
    resetDemo,
    isLoggedIn,
    setIsLoggedIn,
    telemetryLogs,
    officerLogs,
    uploadingState,
    uploadLogs
  } = useIntelligence();

  const [dragOver, setDragOver] = useState(false);
  const [customQueryText, setCustomQueryText] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pending = sessionStorage.getItem("orca_pending_query") || localStorage.getItem("orca_pending_query");
      if (pending) {
        setCustomQueryText(pending);
        setActiveTab("copilot");
        sessionStorage.removeItem("orca_pending_query");
        localStorage.removeItem("orca_pending_query");
      }
    }
  }, [setActiveTab]);

  const activeCase = firCases.find(c => c.id === activeFirId) || firCases[0];
  const activeDistrict = districtDatabase[selectedDistrictCode] || districtDatabase["BLR_U"];
  const activeDossier = suspectDossiers[selectedSuspectId] || suspectDossiers["sus-01"];

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) await ingestNewCase(files[0]);
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) await ingestNewCase(files[0]);
  };

  const demoStepDescriptions = [
    "",
    "1 / 8: Officer Ingress Portal Biometric Authentication",
    "2 / 8: Command Overview & Live Ticker Telemetries",
    "3 / 8: Ingesting scanned FIR Evidence into Secure Ingress Vault",
    "4 / 8: Real-time OCR Text Scan & Legal Mappings Complete",
    "5 / 8: Case Incident Forensic Timeline Reconstruction",
    "6 / 8: Suspect Association Relational Target Network Graph",
    "7 / 8: District Geospatial heatmaps & surveillance geofencing alerts",
    "8 / 8: Sealed Cryptographic Court Exhibits PDF Print Export"
  ];

  const isChatbot = activeTab === "chatbot";

  // O.C.R.A .content-area styles
  const contentAreaStyle: React.CSSProperties = isChatbot ? {
    flex: 1,
    padding: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%"
  } : {
    flex: 1,
    padding: "24px 32px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column"
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, background: ORCA.offWhite }}>
      {isLoggedIn && <Sidebar />}

      <main style={{ flex: 1, overflowY: isChatbot ? "hidden" : "auto", display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>

        {/* Content */}
        <div style={contentAreaStyle}>

            {/* ============================================================ */}
            {/* 1. COMMAND OVERVIEW                                           */}
            {/* ============================================================ */}
            {activeTab === "dashboard" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <PageHeader
                  title="Internal Security Division Command Center"
                  subtitle={<>State Intelligence Directorate <span style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: 4, fontWeight: 600, fontSize: 11, marginLeft: 8 }}>INTERNAL SECURITY FORCE DISPATCH</span></>}
                  action={
                    <BtnNavy onClick={() => setActiveTab("fir")}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Plus style={{ width: 14, height: 14 }} /> Import Incident File
                      </span>
                    </BtnNavy>
                  }
                />

                {/* Statewide Telemetry */}
                <Telemetry />

                {/* 3-column feeds grid — matches .feeds-grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

                  {/* Live intercept log */}
                  <Panel
                    header="Live State Threat Intercept Log"
                    headerRight={<span style={{ color: ORCA.orange, fontSize: 11 }}>REALTIME SYNC</span>}
                    bodyStyle={{ padding: 0, maxHeight: 320, overflowY: "auto" }}
                  >
                    <div style={{ padding: 16 }}>
                      <Intercepts />
                    </div>
                  </Panel>

                  {/* Crime Bulletins */}
                  <Panel header="Crime Bulletins & Notices" bodyStyle={{ maxHeight: 320, overflowY: "auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ borderLeft: `3px solid ${ORCA.orange}`, paddingLeft: 12, paddingTop: 8, paddingBottom: 8, borderBottom: `1px solid ${ORCA.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono, monospace", fontSize: 10, fontWeight: 700, color: ORCA.navy, textTransform: "uppercase", marginBottom: 4 }}>
                          <span>Interpol Notice #442</span>
                          <span style={{ color: ORCA.green }}>SECURE</span>
                        </div>
                        <p style={{ fontSize: 12, color: ORCA.textGray, lineHeight: 1.6 }}>
                          Biometric profiles synchronized for domestic maritime borders matching known antiquities smuggling cells entering Karnataka coastal boundaries.
                        </p>
                      </div>
                      <div style={{ borderLeft: "3px solid #1E3A8A", paddingLeft: 12, paddingTop: 8, paddingBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono, monospace", fontSize: 10, fontWeight: 700, color: ORCA.navy, textTransform: "uppercase", marginBottom: 4 }}>
                          <span>Cert-In Advisory</span>
                          <span style={{ color: ORCA.redDark }}>VULN-902</span>
                        </div>
                        <p style={{ fontSize: 12, color: ORCA.textGray, lineHeight: 1.6 }}>
                          Critical zero-day patch released for state government proxy firewalls. Mandating immediate validation of all active municipal terminal links.
                        </p>
                      </div>
                    </div>
                  </Panel>

                  {/* Officer Activity Stream */}
                  <Panel header="Officer Activity Stream" bodyStyle={{ maxHeight: 320, overflowY: "auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {officerLogs.map((item, idx) => (
                        <div key={idx} style={{ borderBottom: `1px solid ${ORCA.border}`, paddingBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: ORCA.textMuted, marginBottom: 4 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 10, height: 10 }} /> {item.time}</span>
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: ORCA.textDark }}>{item.message}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 2. CRIME ANALYTICS                                            */}
            {/* ============================================================ */}
            {activeTab === "analytics" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <PageHeader
                  title="Crime Analytics Directorate"
                  subtitle="Statewide statistics, frequency tables, and geographical crime correlations"
                  action={<BtnNavy>Filter State Records</BtnNavy>}
                />

                <Panel noPadding>
                  {/* Filter bar — matches .filter-bar */}
                  <div style={{
                    display: "flex",
                    gap: 16,
                    padding: "12px 16px",
                    background: "rgba(0,0,0,0.02)",
                    borderBottom: `1px solid ${ORCA.border}`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: ORCA.textGray, textTransform: "uppercase" }}>
                      <label>Sector District:</label>
                      <select style={{ padding: "4px 8px", border: `1px solid ${ORCA.border}`, borderRadius: 4, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                        <option>All Districts (Karnataka)</option>
                        <option>Bengaluru Urban</option>
                        <option>Mysuru</option>
                        <option>Mangaluru</option>
                        <option>Hubballi-Dharwad</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: ORCA.textGray, textTransform: "uppercase" }}>
                      <label>BNS Classification:</label>
                      <select style={{ padding: "4px 8px", border: `1px solid ${ORCA.border}`, borderRadius: 4, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                        <option>All Classifications</option>
                        <option>BNS Section 308 (Extortion)</option>
                        <option>BNS Section 111 (Organized Crime)</option>
                        <option>BNS Section 318 (Cheating)</option>
                      </select>
                    </div>
                  </div>

                  {/* Data table — matches .data-table */}
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["District", "Severe Crimes (BNS 111)", "Financial Cyber Crimes", "Patrol Dispatch Rate", "Avg Resolution", "Threat Index Score"].map(h => (
                          <th key={h} style={{
                            textAlign: "left",
                            padding: "12px 16px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: ORCA.textGray,
                            textTransform: "uppercase",
                            borderBottom: `2px solid ${ORCA.border}`,
                            background: "rgba(0,0,0,0.01)",
                            fontFamily: "'Inter', sans-serif"
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { district: "Bengaluru Urban", severe: "28 Cases", cyber: "1,104 Cases", patrol: "96%", rate: "96% (Optimal)", resolution: "4.2 Hours", threat: "9.4 Critical", threatColor: ORCA.red },
                        { district: "Mysuru", severe: "14 Cases", cyber: "182 Cases", patrol: "88%", rate: "88% (Secured)", resolution: "8.6 Hours", threat: "6.8 High", threatColor: ORCA.orange },
                        { district: "Mangaluru (DK)", severe: "19 Cases", cyber: "241 Cases", patrol: "91%", rate: "91% (Optimal)", resolution: "6.1 Hours", threat: "7.2 High", threatColor: ORCA.orange },
                        { district: "Hubballi-Dharwad", severe: "11 Cases", cyber: "94 Cases", patrol: "82%", rate: "82% (Nominal)", resolution: "12.4 Hours", threat: "5.1 Moderate", threatColor: ORCA.blue },
                      ].map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${ORCA.border}` }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.015)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "16px", fontSize: 13, fontWeight: 600 }}>{row.district}</td>
                          <td style={{ padding: "16px", fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}>{row.severe}</td>
                          <td style={{ padding: "16px", fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}>{row.cyber}</td>
                          <td style={{ padding: "16px", fontSize: 13, fontFamily: "JetBrains Mono, monospace", color: ORCA.green, fontWeight: 600 }}>{row.rate}</td>
                          <td style={{ padding: "16px", fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}>{row.resolution}</td>
                          <td style={{ padding: "16px" }}>
                            <span style={{
                              background: `${row.threatColor}18`,
                              color: row.threatColor,
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600
                            }}>{row.threat}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Panel>
              </div>
            )}

            {/* ============================================================ */}
            {/* 3. FIR EVIDENCE VAULT                                         */}
            {/* ============================================================ */}
            {activeTab === "fir" && (
              <div style={{ animation: "fadeIn 0.3s ease", flex: 1, display: "flex", flexDirection: "column" }}>
                <PageHeader
                  title="FIR Evidence Vault"
                  subtitle="Upload and parse official FIR records using semantic OCR extraction engines"
                />

                {/* vault-grid: 300px left, 1fr mid, 350px right */}
                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 350px", gap: 24, flex: 1, minHeight: 0 }}>

                  {/* Left column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <Panel header="Evidence Vault Ingestion">
                      {uploadingState === "idle" ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("hidden-file-input")?.click()}
                          style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            border: `2px dashed ${dragOver ? ORCA.gold : ORCA.border}`,
                            borderRadius: 8,
                            cursor: "pointer",
                            background: dragOver ? "rgba(255,153,51,0.05)" : ORCA.offWhite,
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = ORCA.gold; }}
                          onMouseLeave={e => { if (!dragOver) (e.currentTarget as HTMLElement).style.borderColor = ORCA.border; }}
                        >
                          <UploadCloud style={{ width: 32, height: 32, color: ORCA.textMuted, margin: "0 auto 8px" }} />
                          <div style={{ fontWeight: 600, fontSize: 14, color: ORCA.navy, marginBottom: 4 }}>Ingest Scanned File</div>
                          <div style={{ fontSize: 11, color: ORCA.textMuted }}>Drag and drop PDF or TXT records here</div>
                          <input type="file" id="hidden-file-input" style={{ display: "none" }} accept=".txt,.pdf" onChange={handleFileChange} />
                        </div>
                      ) : (
                        <div style={{ background: "black", color: "#10b981", fontFamily: "JetBrains Mono, monospace", fontSize: 10, padding: 12, borderRadius: 4, minHeight: 120, display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(16,185,129,0.3)", paddingBottom: 4, marginBottom: 4, fontSize: 9, color: "#34d399" }}>
                            <span>OCR STREAM ENGINE ACTIVE</span>
                            <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                          </div>
                          {uploadLogs.map((logMsg, idx) => (
                            <div key={idx}>&gt; {logMsg}</div>
                          ))}
                        </div>
                      )}
                    </Panel>

                    <Panel header="Active Incident Warrants" noPadding>
                      <div style={{ padding: "8px 0" }}>
                        {firCases.map(fir => (
                          <div
                            key={fir.id}
                            onClick={() => setActiveFirId(fir.id)}
                            style={{
                              padding: "10px 16px",
                              cursor: "pointer",
                              borderLeft: activeFirId === fir.id ? `3px solid ${ORCA.gold}` : "3px solid transparent",
                              background: activeFirId === fir.id ? "rgba(255,153,51,0.05)" : "transparent",
                              borderBottom: `1px solid ${ORCA.border}`,
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={e => { if (activeFirId !== fir.id) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.02)"; }}
                            onMouseLeave={e => { if (activeFirId !== fir.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 700, color: ORCA.navy }}>{fir.id}</div>
                            <div style={{ fontSize: 11, color: ORCA.textDark, marginTop: 2 }}>{fir.title}</div>
                            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, color: ORCA.textGray, display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                              <span>{fir.district}</span>
                              <span style={{ color: fir.severity === "severe" ? ORCA.redDark : ORCA.orange, fontWeight: 700, textTransform: "uppercase" }}>{fir.severity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>

                  {/* Middle column — case workspace */}
                  <div style={{ background: ORCA.white, border: `1px solid ${ORCA.border}`, borderRadius: 8, boxShadow: ORCA.shadow, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{
                      padding: "12px 16px",
                      borderBottom: `1px solid ${ORCA.border}`,
                      background: "rgba(0,0,0,0.01)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexShrink: 0
                    }}>
                      <div>
                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>{activeCase.id}</div>
                        <div style={{ fontSize: 10, color: ORCA.textGray, fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>
                          SECTOR DISTRICT: <strong style={{ color: ORCA.navy }}>{activeCase.district.toUpperCase()}</strong>
                          &nbsp;|&nbsp; UTC RECORDED: {activeCase.datetime}
                          &nbsp;|&nbsp; CLASS: {activeCase.category.toUpperCase()}
                        </div>
                      </div>
                      <BtnOutline onClick={() => window.print()}>Export Sealed Case Summary</BtnOutline>
                    </div>

                    <div style={{ padding: 16, overflowY: "auto", flex: 1, display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ORCA.textGray, textTransform: "uppercase", marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Unified Evidence Summary Brief</div>
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: ORCA.textDark }}>{activeCase.summary}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ORCA.textGray, textTransform: "uppercase", marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Operational Modus Operandi (MO)</div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: ORCA.navy, fontFamily: "JetBrains Mono, monospace" }}>{activeCase.modusOperandi}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ORCA.textGray, textTransform: "uppercase", marginBottom: 12, fontFamily: "JetBrains Mono, monospace" }}>Extracted Suspect Matrix</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          {activeCase.suspects.map(sus => (
                            <div
                              key={sus.id}
                              onClick={() => { setSelectedSuspectId(sus.id); setActiveTab("networks"); }}
                              style={{
                                border: `1px solid ${ORCA.border}`,
                                borderRadius: 6,
                                padding: 12,
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                                cursor: "pointer",
                                transition: "0.15s"
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = ORCA.navyMid; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ORCA.border; }}
                            >
                              <div style={{ width: 40, height: 40, background: "rgba(0,0,0,0.05)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <UserCheck style={{ width: 20, height: 20, color: ORCA.textGray }} />
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{sus.name}</div>
                                <div style={{ fontSize: 11, color: ORCA.textGray }}>{sus.role.split(" / ")[0]}</div>
                                <div style={{ fontSize: 10, color: ORCA.green, marginTop: 2, fontFamily: "JetBrains Mono, monospace" }}>Sync match: {sus.confidence}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ORCA.textGray, textTransform: "uppercase", marginBottom: 12, fontFamily: "JetBrains Mono, monospace" }}>Case Sequence Chronology</div>
                        <div style={{ position: "relative", paddingLeft: 16 }}>
                          <div style={{ position: "absolute", left: 4, top: 4, bottom: 4, width: 1.5, background: ORCA.border }} />
                          {activeCase.timeline.map((item, idx) => (
                            <div key={idx} style={{ position: "relative", marginBottom: 12 }}>
                              <div style={{
                                position: "absolute",
                                left: -12,
                                top: 6,
                                width: 8, height: 8,
                                borderRadius: "50%",
                                background: ORCA.white,
                                border: `1.5px solid ${item.severe ? ORCA.redDark : ORCA.blue}`
                              }} />
                              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, fontWeight: 700, color: ORCA.textGray }}>{item.time} IST</div>
                              <p style={{ fontSize: 12, color: ORCA.textDark, marginTop: 2, lineHeight: 1.5 }}>{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <Panel header="Evidence Chain of Custody">
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: ORCA.textGray, marginBottom: 12, wordBreak: "break-all" }}>
                        PACKET HASH: {activeCase.sha256Hash}
                      </div>
                      {activeCase.chainOfCustody.map((log, idx) => (
                        <div key={idx} style={{ marginBottom: 8, fontSize: 10, fontFamily: "JetBrains Mono, monospace", lineHeight: 1.6 }}>
                          <span style={{ color: ORCA.textMuted }}>[{log.timestamp}]</span> {log.action}<br/>
                          <strong style={{ color: ORCA.textDark }}>{log.operator}</strong> (Key: {log.hash})
                        </div>
                      ))}
                    </Panel>

                    <Panel header="BNS Codified Charges Mapped">
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {activeCase.legalSections.map((section, idx) => (
                          <div key={idx} style={{ border: `1px solid ${ORCA.border}`, borderRadius: 4, padding: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: ORCA.navy, fontFamily: "JetBrains Mono, monospace" }}>{section.code}: {section.title}</div>
                            <div style={{ fontSize: 11, color: ORCA.textGray, marginTop: 4, lineHeight: 1.5 }}>{section.desc}</div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 4. GEOSPATIAL HEATMAP                                         */}
            {/* ============================================================ */}
            {activeTab === "heatmap" && (
              <div style={{ animation: "fadeIn 0.3s ease", flex: 1, display: "flex", flexDirection: "column" }}>
                <PageHeader
                  title="State Incident Density Heatmap"
                  subtitle="Geospatial distribution models mapping threat frequencies across Karnataka sectors"
                />
                {/* visualizer-container layout */}
                <div style={{ display: "flex", gap: 24, flex: 1, minHeight: 480 }}>
                  <MapGrid />

                  {/* Dossier panel — matches .dossier-panel */}
                  <div style={{ width: 350, flexShrink: 0 }}>
                    <Panel header="District Geospatial Dossier" style={{ height: "100%" }} bodyStyle={{ overflowY: "auto" }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: ORCA.navy, textTransform: "uppercase" }}>{activeDistrict.name}</h2>
                      <div style={{ color: ORCA.red, fontSize: 12, fontWeight: 700, marginTop: 4, marginBottom: 24 }}>{activeDistrict.level}</div>

                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${ORCA.border}`, fontSize: 13 }}>
                        <span style={{ color: ORCA.textGray }}>Crime Density Rating</span>
                        <strong style={{ color: ORCA.red }}>{activeDistrict.density}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${ORCA.border}`, fontSize: 13 }}>
                        <span style={{ color: ORCA.textGray }}>Total FIRs (Last 30 Days)</span>
                        <strong>{activeDistrict.firs}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${ORCA.border}`, fontSize: 13 }}>
                        <span style={{ color: ORCA.textGray }}>Force Grid Coverage</span>
                        <strong style={{ color: ORCA.green }}>{activeDistrict.patrol}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${ORCA.border}`, fontSize: 13 }}>
                        <span style={{ color: ORCA.textGray }}>ISD Special Squads</span>
                        <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>{activeDistrict.squads}</strong>
                      </div>
                      <div style={{ marginTop: 16, background: "rgba(255,153,51,0.08)", border: `1px solid rgba(255,153,51,0.3)`, borderRadius: 4, padding: 12 }}>
                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 9, color: ORCA.orange, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                          <AlertTriangle style={{ width: 13, height: 13 }} /> AI Advisory Dispatch Directive
                        </div>
                        <p style={{ fontSize: 12, lineHeight: 1.6, color: ORCA.textDark }}>{activeDistrict.advisory}</p>
                      </div>
                    </Panel>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 5. CRIMINAL NETWORKS                                          */}
            {/* ============================================================ */}
            {activeTab === "networks" && (
              <div style={{ animation: "fadeIn 0.3s ease", flex: 1, display: "flex", flexDirection: "column" }}>
                <PageHeader
                  title="Criminal Networks Visualizer"
                  subtitle="Relational tracking of connected suspects, phone vectors, financial trails, and physical logistics"
                />
                <div style={{ display: "flex", gap: 24, flex: 1, minHeight: 480 }}>
                  <Network />

                  {/* Intelligence dossier — matches .dossier-panel */}
                  <div style={{ width: 350, flexShrink: 0 }}>
                    <Panel header="Official Intelligence Dossier (Form ISD-D-09)" style={{ height: "100%" }} bodyStyle={{ overflowY: "auto" }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
                        <div style={{ width: 50, height: 50, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: ORCA.navy, fontSize: 18, flexShrink: 0 }}>
                          {activeDossier.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: ORCA.navy }}>{activeDossier.name}</div>
                          <div style={{ fontSize: 11, color: ORCA.textGray }}>Aliases: {activeDossier.aliases}</div>
                          <div style={{
                            fontSize: 10,
                            background: `${ORCA.red}18`,
                            color: ORCA.red,
                            padding: "2px 6px",
                            borderRadius: 4,
                            display: "inline-block",
                            marginTop: 4,
                            fontWeight: 700,
                            fontFamily: "JetBrains Mono, monospace"
                          }}>{activeDossier.tier}</div>
                        </div>
                      </div>

                      {[
                        { label: "Clearance Status", value: activeDossier.status, color: ORCA.red },
                        { label: "Last Known Location", value: activeDossier.location },
                        { label: "Linked Case Files", value: activeDossier.firs },
                        { label: "Tower Burners Registered", value: activeDossier.contacts },
                        { label: "Linked Fleet Logistics", value: activeDossier.vehicles },
                        { label: "Mule Accounts Logged", value: activeDossier.accounts },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${ORCA.border}`, fontSize: 13 }}>
                          <span style={{ color: ORCA.textGray }}>{label}</span>
                          <strong style={{ color: color || ORCA.textDark, fontFamily: "JetBrains Mono, monospace", maxWidth: 200, textAlign: "right" }}>{value}</strong>
                        </div>
                      ))}

                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: ORCA.orange, textTransform: "uppercase", marginBottom: 4 }}>Financial Telemetry Anomaly</div>
                        <p style={{ fontSize: 12, lineHeight: 1.6, color: ORCA.textDark }}>{activeDossier.financialAnomaly}</p>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: ORCA.textGray, textTransform: "uppercase", marginBottom: 4 }}>Operational Case Notes</div>
                        <p style={{ fontSize: 12, lineHeight: 1.6, color: ORCA.textGray }}>{activeDossier.notes}</p>
                      </div>
                    </Panel>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 6. INTELLIGENCE COPILOT                                       */}
            {/* ============================================================ */}
            {activeTab === "copilot" && (
              <div style={{ animation: "fadeIn 0.3s ease", flex: 1, display: "flex", flexDirection: "column" }}>
                <PageHeader
                  title="ISD Intelligence Copilot"
                  subtitle="Structured intelligence query workbench & law enforcement correlation system"
                />
                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, flex: 1, minHeight: 0 }}>
                  {/* Query sidebar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <Panel style={{ flex: 1, display: "flex", flexDirection: "column" }} bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ORCA.textGray, textTransform: "uppercase", marginBottom: 12, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>Operational Presets</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            "QUERY: ORG_FINANCIAL_FLOW (SUSPECT: vikram_hegde)",
                            "QUERY: MATCH_MODUS_OPERANDI (CASE: FIR/2026/BLR/104)",
                            "QUERY: COMPILE_CHARGESHEET (BNS_CODES: FIR/104)"
                          ].map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => { setCustomQueryText(q); runAiQuery(`preset-${idx + 1}`); }}
                              style={{
                                background: ORCA.offWhite,
                                border: `1px solid ${ORCA.border}`,
                                borderRadius: 4,
                                padding: 8,
                                textAlign: "left",
                                fontFamily: "JetBrains Mono, monospace",
                                fontSize: 10.5,
                                color: ORCA.textDark,
                                cursor: "pointer",
                                lineHeight: 1.4,
                                transition: "0.2s"
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e8f0fe"; (e.currentTarget as HTMLElement).style.color = ORCA.blue; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ORCA.offWhite; (e.currentTarget as HTMLElement).style.color = ORCA.textDark; }}
                            >
                              {q}
                            </button>
                          ))}
                        </div>

                        <div style={{ marginTop: 20 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: ORCA.textGray, textTransform: "uppercase", marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Custom Analytical Inquiry Console</div>
                          <textarea
                            value={customQueryText}
                            onChange={(e) => setCustomQueryText(e.target.value)}
                            placeholder="COMPILE CHARGESHEET (CASE: ISD-CR-2026-104) or search..."
                            style={{
                              width: "100%",
                              border: `1px solid ${ORCA.border}`,
                              borderRadius: 4,
                              padding: 8,
                              fontSize: 12,
                              fontFamily: "'Inter', sans-serif",
                              height: 96,
                              resize: "none",
                              outline: "none",
                              background: ORCA.offWhite
                            }}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: ORCA.textGray }}>SECURED ENCRYPTED LINK</span>
                            <BtnNavy onClick={() => runAiQuery(null, customQueryText)}>Run Inquiry</BtnNavy>
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: ORCA.offWhite,
                        border: `1px solid ${ORCA.border}`,
                        borderRadius: 4,
                        padding: 10,
                        fontSize: 9.5,
                        color: ORCA.textGray,
                        lineHeight: 1.6,
                        fontFamily: "JetBrains Mono, monospace",
                        marginTop: 16
                      }}>
                        <strong>CRITICAL PROTOCOL:</strong> Every dynamic query executed inside O.R.C.A is logged and linked to user IPS credentials. Generates court-admissible audit reports.
                      </div>
                    </Panel>
                  </div>

                  {/* Report output */}
                  <Panel
                    header="Secured Report Output"
                    headerRight={<BtnOutline onClick={() => window.print()}>Print Secure Letterhead</BtnOutline>}
                    style={{ display: "flex", flexDirection: "column" }}
                    bodyStyle={{ flex: 1, overflowY: "auto", padding: 0 }}
                  >
                    <Letterhead report={activeReport} loading={aiReportLoading} />
                  </Panel>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 7. OFFICIAL BULLETINS                                         */}
            {/* ============================================================ */}
            {activeTab === "reports" && (
              <div style={{ animation: "fadeIn 0.3s ease", flex: 1, display: "flex", flexDirection: "column" }}>
                <PageHeader
                  title="Official Reports & Bulletins"
                  subtitle="Generate signed, certified reports for Karnataka courts and administrative agencies"
                />
                <Panel style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} bodyStyle={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 400 }}>
                  <FileCheck style={{ width: 48, height: 48, color: ORCA.textMuted, marginBottom: 12 }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: ORCA.navy }}>Unified Administrative Records</h3>
                  <p style={{ fontSize: 13, color: ORCA.textGray, marginTop: 8, maxWidth: 400, lineHeight: 1.6 }}>
                    Ready to generate digital copies of state-approved intelligence summaries. All prints are securely encrypted and watermarked.
                  </p>
                </Panel>
              </div>
            )}

            {/* ============================================================ */}
            {/* 8. DOCUMENT VERIFICATION                                      */}
            {/* ============================================================ */}
            {activeTab === "verification-document" && (
              <DocumentVerification />
            )}

            {/* ============================================================ */}
            {/* 9B. AI CHATBOT                                               */}
            {/* ============================================================ */}
            {activeTab === "chatbot" && (
              <AIChatbotModule />
            )}

            {/* ============================================================ */}
            {/* 10. SETTINGS                                                  */}
            {/* ============================================================ */}
            {activeTab === "settings" && (
              <div style={{ animation: "fadeIn 0.3s ease", flex: 1, display: "flex", flexDirection: "column" }}>
                <PageHeader
                  title="Portal Configuration & Settings"
                  subtitle="System administration, role-based access limits, and ISD server cluster configurations"
                />
                <Panel style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} bodyStyle={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 400 }}>
                  <Settings style={{ width: 48, height: 48, color: ORCA.textMuted, marginBottom: 12 }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: ORCA.navy }}>Secure Settings Workspace</h3>
                  <p style={{ fontSize: 13, color: ORCA.textGray, marginTop: 8, maxWidth: 400, lineHeight: 1.6 }}>
                    Access restricted. Only available to ISD Administration level personnel. Contact helpdesk for credentials update.
                  </p>
                </Panel>
              </div>
            )}

          </div>

        {/* Hidden layout trigger */}
        <span id="fir-tab-trigger" style={{ display: "none" }} onClick={() => setActiveTab("fir")} />
      </main>
    </div>
  );
};

// ============================================================
// Auth Loading Skeleton
// ============================================================
const AuthLoadingSkeleton: React.FC = () => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: ORCA.offWhite }}>
    <div style={{
      width: "100%",
      maxWidth: 400,
      border: `1px solid ${ORCA.border}`,
      background: ORCA.white,
      padding: 32,
      borderRadius: 8,
      boxShadow: ORCA.shadowMd,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      textAlign: "center"
    }}>
      <Loader2 style={{ width: 40, height: 40, color: ORCA.gold, animation: "spin 1s linear infinite" }} />
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: ORCA.navy, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ISD Mainframe Connection
        </h3>
        <p style={{ fontSize: 10, color: ORCA.textGray, marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
          Restoring encrypted officer session node...
        </p>
      </div>
      <div style={{
        width: "100%",
        background: ORCA.offWhite,
        border: `1px solid ${ORCA.border}`,
        borderRadius: 4,
        padding: 12,
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontSize: 9.5,
        color: ORCA.green,
        fontFamily: "JetBrains Mono, monospace",
        lineHeight: 1.6
      }}>
        <div>&gt; SYNCING SECURE TOKEN... SUCCESS</div>
        <div>&gt; DECRYPTING PROFILE CACHE... RUNNING</div>
        <div>&gt; INITIATING COMMAND TELEMETRY... PENDING</div>
      </div>
    </div>
  </div>
);

// ============================================================
// Dashboard page export
// ============================================================
export default function DashboardPage() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>
        <Topbar />
        <AuthLoadingSkeleton />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Let the redirect happen
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Topbar />
      <MainContent />
    </div>
  );
}
