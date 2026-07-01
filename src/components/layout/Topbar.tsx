import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Topbar: React.FC = () => {
  const { isLoggedIn, officerProfile, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLoggedIn = mounted ? isLoggedIn : true;

  return (
    /* O.C.R.A Top Navbar: 60px height, #002855 navy-mid bg, subtle white border */
    <header style={{
      height: "60px",
      background: "#002855",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      flexShrink: 0,
      zIndex: 50
    }}>
      
      {/* Search bar — matches O.C.R.A .search-bar */}
      <div style={{ flex: 1, maxWidth: 600, position: "relative", marginRight: 24 }}>
        <Search style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          width: 14,
          height: 14,
          color: "rgba(255,255,255,0.4)"
        }} />
        <input
          type="text"
          suppressHydrationWarning
          disabled={!activeLoggedIn}
          placeholder={
            activeLoggedIn
              ? "SECURE GLOBAL SEARCH: query:suspect_network, node:phone_ping, section:BNS_308..."
              : "SECURE SEARCH OFFLINE — INGRESS REQUIRED"
          }
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: "8px 16px 8px 36px",
            color: "white",
            fontSize: 13,
            fontFamily: "JetBrains Mono, monospace",
            outline: "none",
            opacity: activeLoggedIn ? 1 : 0.5,
            transition: "border-color 0.2s"
          }}
          onFocus={e => { e.target.style.borderColor = "#FF9933"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
        />
      </div>

      {/* Right side: secure link + officer profile — matches O.C.R.A .top-right */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        
        {/* Secure link badge — matches O.C.R.A .secure-link */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: activeLoggedIn ? "#10b981" : "#f87171",
          background: activeLoggedIn ? "rgba(16,185,129,0.1)" : "rgba(248,113,113,0.1)",
          padding: "4px 8px",
          borderRadius: 4
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: activeLoggedIn ? "#10b981" : "#f87171",
            display: "inline-block",
            animation: "pulse 2s infinite"
          }} />
          {activeLoggedIn
            ? `SECURE LINK // ${officerProfile?.clearanceLevel || "ISD-LEVEL-IV"}`
            : "SECURE LINK // INGRESS PENDING"
          }
        </div>

        {/* Officer profile — matches O.C.R.A .user-profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "white", textAlign: "right" }}>
          {isLoggedIn ? (
            <>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {officerProfile?.name || "DSP R. K. Shastry, IPS"}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                  {officerProfile?.rank || "Superintendent of Police"} • {officerProfile?.role || "ADMIN"}
                </span>
                <button
                  onClick={() => logout()}
                  style={{
                    fontSize: 9,
                    color: "#f87171",
                    fontFamily: "JetBrains Mono, monospace",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "right",
                    padding: 0,
                    marginTop: 2,
                    lineHeight: 1,
                    textDecoration: "none"
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
                >
                  [SIGN OUT INGRESS]
                </button>
              </div>
              {/* Gold avatar — matches O.C.R.A .avatar */}
              <div style={{
                width: 32,
                height: 32,
                background: "#FF9933",
                color: "#001f3f",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
                userSelect: "none"
              }}>
                {officerProfile?.name
                  ? officerProfile.name.split(" ").filter(n => n.length > 0 && /^[a-zA-Z]/.test(n)).map(n => n[0]).join("").substring(0, 3).toUpperCase()
                  : "RKS"
                }
              </div>
            </>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11
            }}>
              <span>AWAITING INGRESS</span>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};
