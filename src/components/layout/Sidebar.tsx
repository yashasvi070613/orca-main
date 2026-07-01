import React, { useState, useEffect } from "react";
import { useIntelligence } from "@/context/IntelligenceContext";
import { OrcaBrand } from "./OrcaBrand";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  FolderLock, 
  Map, 
  Network, 
  Cpu, 
  FileText, 
  Settings,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useIntelligence();
  const router = useRouter();
  const pathname = usePathname();
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveTime(now.toTimeString().split(' ')[0] + " IST");
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Command Overview", icon: LayoutDashboard, route: "/dashboard" },
    { id: "analytics", label: "Crime Analytics", icon: BarChart3, route: "/dashboard" },
    { id: "fir", label: "FIR Evidence Vault", icon: FolderLock, route: "/dashboard" },
    { id: "heatmap", label: "Geospatial Heatmap", icon: Map, route: "/dashboard" },
    { id: "networks", label: "Criminal Networks", icon: Network, route: "/dashboard" },
    { id: "copilot", label: "Intelligence Copilot", icon: Cpu, route: "/dashboard" }
  ];

  const verificationItems = [
    { id: "verification-document", label: "Document Verification", icon: ShieldCheck, route: "/verification/document" },
    { id: "verification-identity", label: "Citizen Identity Verification", icon: UserCheck, route: "/verification/identity" }
  ];

  const adminItems = [
    { id: "reports", label: "Official Bulletins", icon: FileText, route: "/dashboard" },
    { id: "settings", label: "Console Settings", icon: Settings, route: "/dashboard" }
  ];

  return (
    /* O.C.R.A Sidebar: 260px width, #001f3f navy bg, gold (#FF9933) accent */
    <aside className="flex flex-col justify-between overflow-y-auto shrink-0 select-none"
      style={{ 
        width: "260px",
        background: "#001f3f",
        color: "white",
        boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
        zIndex: 10
      }}
    >
      {/* Brand header — navy-mid bg, matches O.C.R.A .brand */}
      <div>
        <div style={{
          minHeight: "68px",
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          background: "#002855",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0
        }}>
          <OrcaBrand />
        </div>

        {/* OPERATIONAL MODULES section */}
        <div style={{ padding: "24px 0 0" }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 24px",
            marginBottom: 8,
            fontFamily: "JetBrains Mono, monospace"
          }}>
            Operational Modules
          </div>
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: isActive ? "white" : "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    padding: "10px 24px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                    borderLeft: isActive ? "3px solid #FF9933" : "3px solid transparent",
                    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                    transition: "0.2s",
                    userSelect: "none"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.color = "white";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                >
                  <Icon style={{ width: 16, height: 16, opacity: isActive ? 1 : 0.7, color: isActive ? "#FF9933" : "currentColor", flexShrink: 0 }} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* VERIFICATION SERVICES section */}
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 24px",
            marginBottom: 8,
            fontFamily: "JetBrains Mono, monospace"
          }}>
            Verification Services
          </div>
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {verificationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (pathname !== item.route && item.route !== "/dashboard") {
                      router.push(item.route);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: isActive ? "white" : "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    padding: "10px 24px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                    borderLeft: isActive ? "3px solid #FF9933" : "3px solid transparent",
                    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                    transition: "0.2s",
                    userSelect: "none"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.color = "white";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                >
                  <Icon style={{ width: 16, height: 16, opacity: isActive ? 1 : 0.7, color: isActive ? "#FF9933" : "currentColor", flexShrink: 0 }} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* ADMINISTRATIVE LOGS section */}
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 24px",
            marginBottom: 8,
            fontFamily: "JetBrains Mono, monospace"
          }}>
            Administrative Logs
          </div>
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {adminItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (pathname !== item.route) {
                      router.push(item.route);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: isActive ? "white" : "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    padding: "10px 24px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                    borderLeft: isActive ? "3px solid #FF9933" : "3px solid transparent",
                    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                    transition: "0.2s",
                    userSelect: "none"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.color = "white";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                >
                  <Icon style={{ width: 16, height: 16, opacity: isActive ? 1 : 0.7, color: isActive ? "#FF9933" : "currentColor", flexShrink: 0 }} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sync footer — navy-mid background, matches O.C.R.A .sidebar-footer */}
      <div style={{
        padding: "20px 24px",
        background: "#002855",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        color: "rgba(255,255,255,0.5)",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>ISO SECURE LINK</span>
          <span style={{ color: "#10b981", fontWeight: 700 }}>● ACTIVE</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>GRID TIME</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{liveTime}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>SYNC DELAY</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>12ms</span>
        </div>
      </div>
    </aside>
  );
};
