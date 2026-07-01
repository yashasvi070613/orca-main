"use client";

import * as React from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "Active cases summary",
  "Top crime hotspots",
  "Critical alerts",
];

export function ChatBubble() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Namaste. I am the O.R.C.A Intelligence Copilot. I can help you analyse crime patterns, look up case details, and generate insights. What would you like to know?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Unable to reach the Intelligence Copilot. Please check your connection and try again.",
        },
      ]);
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen((v) => !v)}
        size="icon"
        aria-label={isOpen ? "Close chat" : "Open O.R.C.A Intelligence Copilot"}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "transition-transform hover:scale-105"
        )}
      >
        {isOpen ? <X className="size-5" /> : <MessageSquare className="size-5" />}
      </Button>

      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-24 right-6 z-50 flex w-[380px] flex-col overflow-hidden p-0",
            "h-[520px] shadow-2xl border-border"
          )}
        >
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-tight">O.R.C.A Intelligence Copilot</p>
              <p className="text-xs opacity-75">Powered by Groq</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-white/10"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "border border-border bg-card text-card-foreground"
                )}
              >
                {m.role === "assistant" && (
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wide opacity-50">
                    O.R.C.A AI
                  </div>
                )}
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Thinking…
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crime data, cases, analytics…"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}