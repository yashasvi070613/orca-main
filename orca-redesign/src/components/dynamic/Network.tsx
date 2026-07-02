import React, { useRef, useEffect, useState } from "react";
import { useIntelligence } from "@/context/IntelligenceContext";

export const Network: React.FC = () => {
  const { selectedSuspectId, setSelectedSuspectId } = useIntelligence();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 480 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 600,
          height: entry.contentRect.height || 480
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;

  // Nodes positioning relative to container size
  const nodes = [
    { id: "sus-01", label: "Vikram Hegde", type: "suspect", color: "#990000", x: width * 0.5, y: height * 0.45, info: "Intrusion Expert" },
    { id: "sus-02", label: "Ramesh Gowda", type: "suspect", color: "#1E3A8A", x: width * 0.3, y: height * 0.65, info: "Logistics Mule" },
    { id: "sus-03", label: "Priyanka Shenoy", type: "suspect", color: "#1E3A8A", x: width * 0.7, y: height * 0.65, info: "Shell Broker" },
    { id: "sus-04", label: "Gurudev Patil", type: "suspect", color: "#990000", x: width * 0.25, y: height * 0.25, info: "Syndicate Kingpin" },
    { id: "phone-1", label: "Burner Ph: 99450", type: "item", color: "#E25C24", x: width * 0.5, y: height * 0.18, info: "Cell Node" },
    { id: "account-1", label: "SBI ending 2041", type: "item", color: "#0B6A61", x: width * 0.75, y: height * 0.35, info: "Escrow Ledger" },
    { id: "car-1", label: "KA-03-MM-8924", type: "item", color: "#64748B", x: width * 0.15, y: height * 0.5, info: "Bolero SUV" }
  ];

  const links = [
    { source: "sus-01", target: "sus-02", label: "Direct Coordination" },
    { source: "sus-01", target: "sus-03", label: "Digital Cash routing" },
    { source: "sus-02", target: "car-1", label: "Operates Vehicle" },
    { source: "sus-01", target: "phone-1", label: "Device Registered" },
    { source: "sus-03", target: "account-1", label: "Account Signatory" },
    { source: "sus-04", target: "sus-02", label: "Sponsors Network" },
    { source: "sus-04", target: "sus-01", label: "Infiltration Funding" }
  ];

  const handleNodeClick = (nodeId: string) => {
    setSelectedSuspectId(nodeId);
  };

  return (
    <div ref={containerRef} className="bg-white border border-[#e2e8f0] rounded-lg min-h-[480px] shadow-sm relative overflow-hidden h-full">
      <svg width="100%" height="100%" className="select-none font-sans">
        
        {/* Draw Links */}
        {links.map((link, idx) => {
          const srcNode = nodes.find(n => n.id === link.source);
          const tgtNode = nodes.find(n => n.id === link.target);
          if (!srcNode || !tgtNode) return null;
          
          const midX = (srcNode.x + tgtNode.x) / 2;
          const midY = (srcNode.y + tgtNode.y) / 2;
          const isDashed = link.label.includes("Funding");

          return (
            <g key={`link-${idx}`}>
              <line 
                x1={srcNode.x} 
                y1={srcNode.y} 
                x2={tgtNode.x} 
                y2={tgtNode.y} 
                stroke="#CBD5E1" 
                strokeWidth="1.2" 
                strokeDasharray={isDashed ? "3" : "0"} 
              />
              <rect x={midX - 45} y={midY - 6} width={90} height={12} fill="#FFFFFF" rx={1} />
              <text x={midX} y={midY + 3} textAnchor="middle" className="font-mono text-[8px] fill-[#475569]">
                {link.label}
              </text>
            </g>
          );
        })}

        {/* Draw Nodes */}
        {nodes.map(node => {
          const isSelected = selectedSuspectId === node.id;
          const rValue = node.type === "suspect" ? 20 : 15;
          const dotR = node.type === "suspect" ? 5 : 3;

          return (
            <g 
              key={`node-${node.id}`} 
              onClick={() => handleNodeClick(node.id)}
              className="cursor-pointer"
            >
              {/* Outer border ring */}
              <circle 
                cx={node.x} 
                cy={node.y} 
                r={rValue} 
                fill="#FFFFFF" 
                stroke={node.color} 
                strokeWidth={isSelected ? 3.5 : 2} 
              />
              {/* Core dot */}
              <circle 
                cx={node.x} 
                cy={node.y} 
                r={dotR} 
                fill={node.color} 
              />
              {/* Label */}
              <text 
                x={node.x} 
                y={node.y + (node.type === "suspect" ? 32 : 26)} 
                textAnchor="middle" 
                className="text-[10px] font-bold fill-[#0A192F]"
              >
                {node.label}
              </text>
              {/* Sub-description */}
              <text 
                x={node.x} 
                y={node.y + (node.type === "suspect" ? 40 : 34)} 
                textAnchor="middle" 
                className="font-mono text-[8px] fill-[#64748B]"
              >
                {node.info}
              </text>
            </g>
          );
        })}

      </svg>
    </div>
  );
};
