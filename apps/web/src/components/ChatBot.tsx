"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

interface Msg {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// NEXT_PUBLIC_ vars are inlined at build time — safe to access at module level
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

const SUGGESTIONS = [
  "How does flood risk scoring work?",
  "Route me to the incident dashboard",
  "How do I submit a flood report?",
  "What can the simulator do?",
  "How are rescue teams dispatched?",
  "Show me shelter status",
];

// ── Design tokens (mirrors globals.css) ──────────────────────────────────────
const C = {
  washi: "#F0E3CE",
  washiCard: "#FAF4E8",
  washiMuted: "#E5D5BD",
  ink: "#0D0D15",
  vermilion: "#E85D35",
  prussian: "#003153",
  indigo: "#2A4056",
  ochre: "#CC7722",
  pine: "#2D7F67",
};

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMd(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, `<code style="background:${C.washiMuted};padding:1px 4px;border-radius:3px;font-family:monospace;font-size:0.85em">$1</code>`)
    .replace(/\n- /g, "<br/>• ")
    .replace(/\n/g, "<br/>");
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "**AEGIS online.** I'm your AEGISFLOW operations assistant.\n\n I can help you:\n- **Navigate** the dashboard (command, incidents, resources, responder, report, simulate)\n- **Explain** flood risk scores, deduplication, routing & allocation\n- **Answer doubts** about any AEGISFLOW feature\n- **Route you** to the right page instantly\n\nWhat do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number } | null>(null);
  const [unread, setUnread] = useState(0);
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs, open]);

  // Clear unread when opened
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // Pulse effect when new bot message arrives
  useEffect(() => {
    if (!open && msgs.length > 1) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(t);
    }
  }, [msgs]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Msg = { role: "user", content: trimmed };
      const pendingMsg: Msg = {
        role: "assistant",
        content: "Thinking…",
        pending: true,
      };

      setMsgs((prev) => [...prev, userMsg, pendingMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = [...msgs, userMsg]
          .filter((m) => !m.pending)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch(`${API_BASE}/chat/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            page_context: pathname,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (res.status === 429) {
            setMsgs((prev) =>
              prev.map((m) =>
                m.pending
                  ? {
                      ...m,
                      pending: false,
                      content:
                        "⏳ Rate limit reached — max 20 messages per minute. Please wait a moment.",
                    }
                  : m
              )
            );
            return;
          }
          throw new Error(err?.detail || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setRateLimitInfo({ remaining: data.rate_limit_remaining ?? 20 });
        setMsgs((prev) =>
          prev.map((m) =>
            m.pending
              ? { ...m, pending: false, content: data.reply }
              : m
          )
        );
        if (!open) setUnread((n) => n + 1);
      } catch (err: any) {
        setMsgs((prev) =>
          prev.map((m) =>
            m.pending
              ? {
                  ...m,
                  pending: false,
                  content:
                    "❌ Could not reach the AEGISFLOW API. Make sure the backend is running on port 8000.",
                }
              : m
          )
        );
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [loading, msgs, open, pathname]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMsgs([
      {
        role: "assistant",
        content: "Chat cleared. How can I help?",
      },
    ]);
    setUnread(0);
  };

  return (
    <>
      {/* ── Floating Trigger Button ───────────────────────────────────── */}
      <button
        id="chatbot-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AEGIS Assistant"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: C.prussian,
          border: `2.5px solid ${C.ink}`,
          boxShadow: `3px 3px 0 ${C.ink}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 150ms ease, box-shadow 150ms ease",
          outline: pulse ? `3px solid ${C.vermilion}` : "none",
          outlineOffset: 2,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = `5px 5px 0 ${C.ink}`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = `3px 3px 0 ${C.ink}`;
        }}
      >
        {open ? (
          <span style={{ color: C.washi, fontSize: "1.3rem", lineHeight: 1 }}>✕</span>
        ) : (
          <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>💬</span>
        )}
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: C.vermilion,
              color: C.washiCard,
              fontSize: "0.65rem",
              fontWeight: 900,
              fontFamily: "var(--font-display)",
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: `2px solid ${C.ink}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* ── Chat Panel ───────────────────────────────────────────────── */}
      <div
        id="chatbot-panel"
        role="dialog"
        aria-label="AEGIS AI Assistant"
        style={{
          position: "fixed",
          bottom: 92,
          right: 24,
          zIndex: 9998,
          width: "min(420px, calc(100vw - 32px))",
          height: "min(600px, calc(100dvh - 120px))",
          background: C.washiCard,
          border: `2.5px solid ${C.ink}`,
          boxShadow: `6px 6px 0 ${C.ink}`,
          display: open ? "flex" : "none",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "var(--font-display)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: C.prussian,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2.5px solid ${C.ink}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.2rem" }}>🛡️</span>
            <div>
              <div
                style={{
                  color: C.washi,
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  letterSpacing: "0.1em",
                }}
              >
                AEGIS ASSISTANT
              </div>
              <div
                style={{
                  color: C.washi,
                  opacity: 0.7,
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                }}
              >
                Powered by Groq · Llama 3.3-70B
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {rateLimitInfo && (
              <span
                style={{
                  color: C.washi,
                  opacity: 0.6,
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {rateLimitInfo.remaining}/20 left
              </span>
            )}
            <button
              id="chatbot-clear"
              onClick={clearChat}
              title="Clear chat"
              style={{
                background: "transparent",
                border: `1.5px solid ${C.washi}`,
                color: C.washi,
                opacity: 0.7,
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 7px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              CLEAR
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          id="chatbot-messages"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: C.washi,
          }}
        >
          {msgs.map((msg, i) => {
            const isBot = msg.role === "assistant";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isBot ? "flex-start" : "flex-end",
                  gap: 3,
                  animation: i === msgs.length - 1 ? "fadeSlideIn 0.2s ease" : "none",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "9px 13px",
                    background: isBot ? C.washiCard : C.prussian,
                    color: isBot ? C.ink : C.washi,
                    border: `2px solid ${C.ink}`,
                    boxShadow: isBot ? `2px 2px 0 ${C.ink}` : `2px 2px 0 ${C.ink}`,
                    fontSize: "0.85rem",
                    lineHeight: 1.55,
                    opacity: msg.pending ? 0.6 : 1,
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }}
                />
                <div
                  style={{
                    fontSize: "0.6rem",
                    opacity: 0.4,
                    letterSpacing: "0.05em",
                    color: C.ink,
                  }}
                >
                  {isBot ? "AEGIS" : "YOU"}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions (only show when chat is short) */}
        {msgs.length <= 2 && (
          <div
            style={{
              padding: "8px 12px",
              borderTop: `1.5px solid ${C.ink}`,
              background: C.washiMuted,
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              flexShrink: 0,
            }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  background: C.washiCard,
                  border: `1.5px solid ${C.indigo}`,
                  color: C.indigo,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.03em",
                  transition: "all 100ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = C.indigo;
                  (e.currentTarget as HTMLButtonElement).style.color = C.washi;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = C.washiCard;
                  (e.currentTarget as HTMLButtonElement).style.color = C.indigo;
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div
          style={{
            borderTop: `2.5px solid ${C.ink}`,
            padding: "10px 12px",
            display: "flex",
            gap: 8,
            background: C.washiCard,
            flexShrink: 0,
            alignItems: "flex-end",
          }}
        >
          <textarea
            ref={inputRef}
            id="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AEGIS anything… (Enter to send, Shift+Enter for newline)"
            rows={2}
            disabled={loading}
            style={{
              flex: 1,
              resize: "none",
              border: `2px solid ${C.ink}`,
              background: C.washi,
              color: C.ink,
              fontFamily: "var(--font-display)",
              fontSize: "0.82rem",
              padding: "7px 10px",
              outline: "none",
              boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.06)",
              lineHeight: 1.5,
              opacity: loading ? 0.6 : 1,
            }}
          />
          <button
            id="chatbot-send"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              background: loading ? C.washiMuted : C.prussian,
              color: loading ? C.ink : C.washi,
              border: `2px solid ${C.ink}`,
              boxShadow: `2px 2px 0 ${C.ink}`,
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "0.78rem",
              letterSpacing: "0.06em",
              padding: "8px 14px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 120ms ease",
              height: "fit-content",
              alignSelf: "flex-end",
              opacity: loading || !input.trim() ? 0.6 : 1,
            }}
          >
            {loading ? "…" : "SEND"}
          </button>
        </div>
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
