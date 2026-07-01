import React from "react";
import { useIntelligence } from "@/context/IntelligenceContext";
import { ShieldAlert, Radio } from "lucide-react";

export const MapGrid: React.FC = () => {
  const { selectedDistrictCode, setSelectedDistrictCode } = useIntelligence();

  const handleDistrictClick = (code: string) => {
    setSelectedDistrictCode(code);
  };

  // Centroid coordinate mappings for pulsating hotspots
  const coords: Record<string, { cx: number; cy: number }> = {
    "BLR_U": { cx: 270, cy: 300 },
    "MYS": { cx: 200, cy: 335 },
    "MNG": { cx: 105, cy: 290 },
    "HUB_D": { cx: 160, cy: 195 },
    "BEL": { cx: 110, cy: 125 },
    "KAL": { cx: 240, cy: 95 }
  };

  const activeCoord = coords[selectedDistrictCode] || coords["BLR_U"];

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 flex flex-col items-center justify-center min-h-[480px] relative shadow-sm h-full w-full">
      
      {/* State / Zone toggle */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5 shrink-0">
        <button className="bg-[#f1f5f9] border border-[#e2e8f0] hover:bg-[#e2e8f0] font-mono text-[9.5px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer text-[#001f3f]">
          State Level Map (ISD)
        </button>
        <button className="bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] font-mono text-[9.5px] px-2 py-0.5 rounded transition-all text-[#475569] cursor-pointer">
          Bengaluru Zone Grid
        </button>
      </div>

      {/* Geofence Alert Overlay Banner */}
      {selectedDistrictCode === "MYS" && (
        <div className="absolute top-3 left-3 z-10 bg-[#990000] text-white border border-[#990000] p-2 px-3 rounded shadow-md flex items-center gap-2.5 animate-bounce font-mono text-[10.5px]">
          <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
          <div>
            <div className="font-bold">ALERT: GEOFENCE BREACH DETECTED</div>
            <div className="text-[9.5px] opacity-90">Repeat offender device detected near Mysuru transport corridor.</div>
          </div>
        </div>
      )}

      {/* High-Fidelity Stylized SVG Map */}
      <svg className="w-full max-w-[440px] h-auto max-h-[380px]" viewBox="0 0 400 450">
        
        {/* Latitude lines */}
        <line x1="20" y1="50" x2="380" y2="50" stroke="#CBD5E1" strokeWidth="0.4" strokeDasharray="2 2" />
        <line x1="20" y1="150" x2="380" y2="150" stroke="#CBD5E1" strokeWidth="0.4" strokeDasharray="2 2" />
        <line x1="20" y1="250" x2="380" y2="250" stroke="#CBD5E1" strokeWidth="0.4" strokeDasharray="2 2" />
        <line x1="20" y1="350" x2="380" y2="350" stroke="#CBD5E1" strokeWidth="0.4" strokeDasharray="2 2" />
        
        <text x="350" y="44" className="font-mono text-[8px] fill-[#64748B]">15° N</text>
        <text x="350" y="144" className="font-mono text-[8px] fill-[#64748B]">14° N</text>
        <text x="350" y="244" className="font-mono text-[8px] fill-[#64748B]">13° N</text>
        <text x="350" y="344" className="font-mono text-[8px] fill-[#64748B]">12° N</text>

        {/* --- SURVEILLANCE CORRIDORS (Highways) --- */}
        {/* NH-48 Corridor (Mangaluru -> Hubballi -> Belagavi) */}
        <path 
          d="M105,290 L160,195 L110,125" 
          fill="none" 
          stroke="#E25C24" 
          strokeWidth="1.2" 
          strokeDasharray="3 3" 
          opacity="0.8"
        />
        <text x="130" y="235" className="font-mono text-[6.5px] fill-[#E25C24] font-bold select-none rotate-[-45deg]">NH-48 TRANSIT CORRIDOR</text>

        {/* NH-44 Corridor (Bengaluru -> Mysuru) */}
        <path 
          d="M270,300 L200,335" 
          fill="none" 
          stroke="#1E3A8A" 
          strokeWidth="1.2" 
          strokeDasharray="3 3" 
          opacity="0.8"
        />
        <text x="218" y="312" className="font-mono text-[6.5px] fill-[#1E3A8A] font-bold select-none rotate-[-22deg]">NH-44 CORRIDOR</text>

        {/* Belagavi */}
        <path 
          id="BEL" 
          onClick={() => handleDistrictClick("BEL")}
          className={`cursor-pointer transition-all duration-150 stroke-white stroke-[1.5px] hover:stroke-[#0A192F] hover:stroke-2 hover:brightness-[0.96] fill-[#E2E8F0] ${
            selectedDistrictCode === "BEL" ? "stroke-[#E25C24] stroke-[2.5px]!" : ""
          }`}
          d="M70,80 L160,90 L150,170 L70,160 Z" 
        />
        <text x="110" y="125" className="font-mono text-[8.5px] fill-[#0A192F] font-bold pointer-events-none">BELAGAVI</text>

        {/* Kalaburagi */}
        <path 
          id="KAL" 
          onClick={() => handleDistrictClick("KAL")}
          className={`cursor-pointer transition-all duration-150 stroke-white stroke-[1.5px] hover:stroke-[#0A192F] hover:stroke-2 hover:brightness-[0.96] fill-[#E2E8F0] ${
            selectedDistrictCode === "KAL" ? "stroke-[#E25C24] stroke-[2.5px]!" : ""
          }`}
          d="M210,50 L290,70 L280,150 L210,130 Z" 
        />
        <text x="240" y="95" className="font-mono text-[8.5px] fill-[#0A192F] font-bold pointer-events-none">KALABURAGI</text>

        {/* Hubballi-Dharwad */}
        <path 
          id="HUB_D" 
          onClick={() => handleDistrictClick("HUB_D")}
          className={`cursor-pointer transition-all duration-150 stroke-white stroke-[1.5px] hover:stroke-[#0A192F] hover:stroke-2 hover:brightness-[0.96] fill-[#E2E8F0] ${
            selectedDistrictCode === "HUB_D" ? "stroke-[#E25C24] stroke-[2.5px]!" : ""
          }`}
          d="M150,170 L210,150 L200,230 L130,220 Z" 
        />
        <text x="160" y="195" className="font-mono text-[8px] fill-[#0A192F] font-bold pointer-events-none">HUBBALLI</text>

        {/* Mangaluru */}
        <path 
          id="MNG" 
          onClick={() => handleDistrictClick("MNG")}
          className={`cursor-pointer transition-all duration-150 stroke-white stroke-[1.5px] hover:stroke-[#0A192F] hover:stroke-2 hover:brightness-[0.96] fill-[#FED7AA] ${
            selectedDistrictCode === "MNG" ? "stroke-[#E25C24] stroke-[2.5px]!" : ""
          }`}
          d="M80,260 L160,240 L160,330 L80,330 Z" 
        />
        <text x="105" y="290" className="font-mono text-[8px] fill-[#0A192F] font-bold pointer-events-none">MANGALURU</text>

        {/* Mysuru */}
        <path 
          id="MYS" 
          onClick={() => handleDistrictClick("MYS")}
          className={`cursor-pointer transition-all duration-150 stroke-white stroke-[1.5px] hover:stroke-[#0A192F] hover:stroke-2 hover:brightness-[0.96] fill-[#FED7AA] ${
            selectedDistrictCode === "MYS" ? "stroke-[#E25C24] stroke-[2.5px]!" : ""
          }`}
          d="M160,330 L240,280 L280,340 L190,370 Z" 
        />
        <text x="200" y="335" className="font-mono text-[8.5px] fill-[#0A192F] font-bold pointer-events-none">MYSURU</text>

        {/* Bengaluru Urban */}
        <path 
          id="BLR_U" 
          onClick={() => handleDistrictClick("BLR_U")}
          className={`cursor-pointer transition-all duration-150 stroke-white stroke-[1.5px] hover:stroke-[#0A192F] hover:stroke-2 hover:brightness-[0.96] fill-[#FECACA] ${
            selectedDistrictCode === "BLR_U" ? "stroke-[#E25C24] stroke-[2.5px]!" : ""
          }`}
          d="M240,280 L290,260 L320,310 L280,340 Z" 
        />
        <text x="270" y="300" className="font-mono text-[9px] fill-[#0A192F] font-extrabold pointer-events-none">BLR URBAN</text>

        {/* --- ACTIVE PATROL markers (ISD Force Grid) --- */}
        {/* Hubballi Squad */}
        <circle cx="150" cy="205" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="150" cy="205" r="8" fill="none" stroke="#10B981" strokeWidth="0.8" className="animate-ping" style={{ animationDuration: "3s" }} />

        {/* Bengaluru Squads */}
        <circle cx="285" cy="285" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="260" cy="315" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />

        {/* Mysuru Squad */}
        <circle cx="220" cy="350" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />

        {/* Mangaluru Squad */}
        <circle cx="115" cy="310" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />

        {/* Pulsating geofence alert circle on active district */}
        <circle 
          cx={activeCoord.cx} 
          cy={activeCoord.cy} 
          r="24" 
          fill="none" 
          stroke="#990000" 
          strokeWidth="1.5" 
          className="animate-pulse duration-1000"
        />
        <circle 
          cx={activeCoord.cx} 
          cy={activeCoord.cy} 
          r="10" 
          fill="rgba(153, 0, 0, 0.15)" 
          stroke="#990000" 
          strokeWidth="1"
        />

      </svg>

      {/* Map Severity Legends */}
      <div className="absolute bottom-3 left-3 bg-white/95 border border-[#e2e8f0] rounded p-2 text-[10px] shadow-sm select-none shrink-0 font-mono flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#FECACA]"></div>
          <span>Critical Index (9.0+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#FED7AA]"></div>
          <span>High Index (6.5 - 8.9)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#E0F2FE]"></div>
          <span>Moderate Index (4.0 - 6.4)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#F1F5F9]"></div>
          <span>Safe Grid Index</span>
        </div>
        <div className="flex items-center gap-1.5 border-t border-[#CBD5E1]/40 pt-1 mt-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
          <span>Patrol Deployment Squad</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-0.5 border-t border-[#E25C24] border-dashed"></div>
          <span>Interstate Corridor Watch</span>
        </div>
      </div>

    </div>
  );
};
