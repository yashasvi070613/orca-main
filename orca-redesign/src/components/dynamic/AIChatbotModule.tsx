"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Paperclip, 
  Mic, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  X, 
  FileText, 
  ShieldAlert, 
  Network, 
  DollarSign, 
  Globe, 
  Car, 
  UserSearch,
  Loader2,
  CheckCircle2,
  Printer
} from "lucide-react";
import { Letterhead } from "./Letterhead";
import { aiReportDatabase, AIPresetBrief } from "@/lib/mock";
import { useAuth } from "@/context/AuthContext";

interface AttachmentFile {
  name: string;
  size: number;
  type: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "orca";
  text: string;
  timestamp: string;
  attachments?: AttachmentFile[];
  report?: AIPresetBrief;
}

export const AIChatbotModule: React.FC = () => {
  const { officerProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const emptyFileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomFileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 100);
    const t2 = setTimeout(scrollToBottom, 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [messages, isGenerating]);

  // Handle suggestion prompt click (populates input ONLY, does NOT submit)
  const handleSuggestionClick = (promptText: string) => {
    setInputText(promptText);
  };

  // Handle File Upload Attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type || "document"
      }));
      setPendingAttachments(prev => [...prev, ...filesArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Speech Recognition Simulation
  const toggleMicrophone = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setInputText("Cross-reference call detail records for FIR/2026/BLR/104 and map active tower pings.");
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  // Submit User Prompt with Live Groq LLM API
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    const userPrompt = inputText.trim();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = userPrompt.toLowerCase();
    setInputText("");
    setPendingAttachments([]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, history: messages })
      });
      const data = await res.json();

      let responseText = data.text || "ORCA AI Core processed your directive.";
      let structuredReport: AIPresetBrief | undefined = undefined;

      if (currentQuery.includes("fir") || currentQuery.includes("report") || currentQuery.includes("briefing") || currentQuery.includes("dossier")) {
        structuredReport = aiReportDatabase["preset-1"];
      }

      const orcaMessage: ChatMessage = {
        id: `orca-${Date.now()}`,
        sender: "orca",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        report: structuredReport
      };

      setMessages(prev => [...prev, orcaMessage]);
    } catch (err: any) {
      console.error("[Groq Chat Error]:", err);
      const errorMsg: ChatMessage = {
        id: `orca-${Date.now()}`,
        sender: "orca",
        text: `⚠️ **API Communication Error**: Unable to reach O.C.R.A AI Core backend (${err.message || "Network Error"}). Please verify server connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestionCards = [
    { label: "Analyze FIR", icon: FileText, text: "Perform forensic AI breakdown of FIR/2026/BLR/104 and extract key entities." },
    { label: "Criminal Network Mapping", icon: Network, text: "Map syndicate associate nodes linked to target Vikram Hegde." },
    { label: "Financial Crime Investigation", icon: DollarSign, text: "Audit mule account transactions and initiate BNSS Section 102 freeze order." },
    { label: "Cyber Crime Intelligence", icon: Globe, text: "Trace ransomware C2 server IP addresses and decrypt malware payload headers." },
    { label: "Vehicle Tracking", icon: Car, text: "Query ANPR camera matrix for suspect black SUV registration KA-04-MN-9012." },
    { label: "Missing Person Investigation", icon: UserSearch, text: "Run facial recognition scan across state transport terminal camera feeds." }
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      background: "#f8fafc",
      overflow: "hidden",
      animation: "fadeIn 0.3s ease"
    }}>

      {/* ============================================================ */}
      {/* 1. INDEPENDENTLY SCROLLABLE CHAT THREAD / EMPTY STATE        */}
      {/* ============================================================ */}
      <div 
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: messages.length === 0 ? "0" : "24px 24px 32px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* EMPTY STATE (Centered vertically and horizontally like ChatGPT) */}
        {messages.length === 0 ? (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            maxWidth: 840,
            margin: "0 auto",
            width: "100%",
            textAlign: "center"
          }}>
            {/* Header branding */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #001f3f 0%, #002855 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "0 8px 20px rgba(0,31,63,0.2)",
              border: "1px solid rgba(255,153,51,0.3)"
            }}>
              <Bot style={{ width: 32, height: 32, color: "#FF9933" }} />
            </div>

            <h1 style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#001f3f",
              fontFamily: "var(--font-serif, serif)",
              letterSpacing: "-0.02em"
            }}>
              O.R.C.A'S AI Assistant
            </h1>

            <p style={{
              fontSize: 15,
              color: "#64748b",
              marginTop: 6,
              marginBottom: 32,
              fontWeight: 500
            }}>
              Greetings, {officerProfile?.name || "Officer"}. How can I assist your investigation today?
            </p>

            {/* Main Center Input Container */}
            <div style={{
              width: "100%",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 24,
              padding: "12px 16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              transition: "0.2s border-color, 0.2s box-shadow"
            }}>

              {/* Pending File Attachments Chips */}
              {pendingAttachments.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 6, borderBottom: "1px solid #f1f5f9" }}>
                  {pendingAttachments.map((att, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: 16,
                      padding: "4px 10px",
                      fontSize: 12,
                      color: "#1e293b",
                      fontWeight: 600
                    }}>
                      <FileText style={{ width: 14, height: 14, color: "#002855" }} />
                      <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {att.name}
                      </span>
                      <button onClick={() => removeAttachment(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0 }}>
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask ORCA anything about crime intelligence..."
                rows={2}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: 15,
                  color: "#1e293b",
                  fontFamily: "inherit",
                  background: "transparent"
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => emptyFileInputRef.current?.click()}
                    title="Attach Images or PDF documents"
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#475569",
                      transition: "0.2s"
                    }}
                  >
                    <Paperclip style={{ width: 18, height: 18 }} />
                  </button>
                  <input
                    type="file"
                    ref={emptyFileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                    multiple
                    style={{ display: "none" }}
                  />

                  <button
                    type="button"
                    onClick={toggleMicrophone}
                    title={isListening ? "Listening..." : "Voice input"}
                    style={{
                      background: isListening ? "rgba(239, 68, 68, 0.1)" : "#f1f5f9",
                      border: isListening ? "1px solid #ef4444" : "none",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: isListening ? "#ef4444" : "#475569",
                      transition: "0.2s"
                    }}
                  >
                    <Mic style={{ width: 18, height: 18 }} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!inputText.trim() && pendingAttachments.length === 0}
                  style={{
                    background: (!inputText.trim() && pendingAttachments.length === 0) ? "#cbd5e1" : "#001f3f",
                    color: "white",
                    border: "none",
                    borderRadius: 20,
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: (!inputText.trim() && pendingAttachments.length === 0) ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "0.2s"
                  }}
                >
                  <Sparkles style={{ width: 16, height: 16, color: "#FF9933" }} />
                  <span>Analyze</span>
                </button>
              </div>
            </div>

            {/* Clickable Suggestion Prompts (Populates input ONLY, does NOT submit) */}
            <div style={{ marginTop: 36, width: "100%" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, textAlign: "left" }}>
                Suggested Directives
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {suggestionCards.map((card, idx) => {
                  const IconComp = card.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSuggestionClick(card.text)}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px 16px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "0.2s transform, 0.2s border-color, 0.2s box-shadow",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#002855";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 15px rgba(0,31,63,0.08)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 5px rgba(0,0,0,0.02)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#001f3f", fontWeight: 700, fontSize: 13 }}>
                        <IconComp style={{ width: 16, height: 16, color: "#FF9933" }} />
                        <span>{card.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>
                        {card.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* CONVERSATION THREAD MODE */
          <div style={{ maxWidth: 880, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                width: "100%"
              }}>
                {/* Sender Tag */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                  {msg.sender === "user" ? (
                    <>
                      <span>Investigating Officer</span>
                      <User style={{ width: 14, height: 14, color: "#002855" }} />
                    </>
                  ) : (
                    <>
                      <Bot style={{ width: 14, height: 14, color: "#FF9933" }} />
                      <span>O.C.R.A AI Core</span>
                    </>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                {/* User Message Bubble */}
                {msg.sender === "user" ? (
                  <div style={{
                    background: "#001f3f",
                    color: "white",
                    padding: "14px 18px",
                    borderRadius: "16px 16px 2px 16px",
                    maxWidth: "80%",
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: "0 4px 12px rgba(0,31,63,0.15)"
                  }}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {msg.attachments.map((att, i) => (
                          <div key={i} style={{
                            background: "rgba(255,255,255,0.15)",
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}>
                            <FileText style={{ width: 12, height: 12, color: "#FF9933" }} />
                            <span>{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.text}
                  </div>
                ) : (
                  /* ORCA AI Response Card */
                  <div style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px 16px 16px 2px",
                    maxWidth: "100%",
                    width: "100%",
                    padding: 20,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16
                  }}>
                    <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {msg.text.split("\n").map((line, lIdx) => {
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={lIdx} style={{ marginBottom: line.trim() ? 6 : 10 }}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                return <strong key={pIdx} style={{ color: "#001f3f", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Structured Investigation Report Component Embedded */}
                    {msg.report && (
                      <div style={{ marginTop: 8, border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{
                          background: "#002855",
                          color: "white",
                          padding: "10px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#FF9933" }}>
                            STRUCTURED INTELLIGENCE BRIEFING EMBEDDED
                          </span>
                          <button
                            onClick={() => window.print()}
                            style={{
                              background: "rgba(255,255,255,0.15)",
                              border: "none",
                              color: "white",
                              padding: "4px 10px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4
                            }}
                          >
                            <Printer style={{ width: 12, height: 12 }} /> Print Report
                          </button>
                        </div>
                        <div style={{ padding: 16, background: "#ffffff" }}>
                          <Letterhead report={msg.report} loading={false} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isGenerating && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, width: "fit-content" }}>
                <Loader2 style={{ width: 18, height: 18, color: "#FF9933", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
                  O.C.R.A AI is analyzing statewide crime databases &amp; neural models...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. STACKED COMPOSER BAR (Normal flex flow, NO OVERLAP)       */}
      {/* ============================================================ */}
      {messages.length > 0 && (
        <div style={{
          flexShrink: 0,
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          padding: "16px 24px 24px",
          display: "flex",
          justifyContent: "center"
        }}>
          <div style={{
            maxWidth: 880,
            width: "100%",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 24,
            padding: "10px 16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}>
            {pendingAttachments.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 6, borderBottom: "1px solid #f1f5f9" }}>
                {pendingAttachments.map((att, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: 16,
                    padding: "4px 10px",
                    fontSize: 12,
                    color: "#1e293b",
                    fontWeight: 600
                  }}>
                    <FileText style={{ width: 14, height: 14, color: "#002855" }} />
                    <span>{att.name}</span>
                    <button onClick={() => removeAttachment(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0 }}>
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                onClick={() => bottomFileInputRef.current?.click()}
                title="Attach Images or PDF documents"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}
              >
                <Paperclip style={{ width: 18, height: 18 }} />
              </button>
              <input
                type="file"
                ref={bottomFileInputRef}
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                multiple
                style={{ display: "none" }}
              />

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask ORCA follow-up query..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  color: "#1e293b",
                  background: "transparent"
                }}
              />

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() && pendingAttachments.length === 0}
                style={{
                  background: (!inputText.trim() && pendingAttachments.length === 0) ? "#cbd5e1" : "#001f3f",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: (!inputText.trim() && pendingAttachments.length === 0) ? "not-allowed" : "pointer"
                }}
              >
                <Send style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
