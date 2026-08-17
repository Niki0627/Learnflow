"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import { cn } from "@lib/utils";
import { sendChatMessage } from "../api";
import type { ChatMessage, ChatSession } from "../types";
import {
  Send, Mic, Bot, User, Plus, Copy, ThumbsUp, ThumbsDown, RefreshCw,
  Lightbulb, Calculator, GraduationCap, Brain, History, X,
  CheckCircle, AlertCircle, Sparkles, StopCircle, Clock, BookOpen,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ─── Markdown Renderer ─────────────────────────────────────────────────────────
const MarkdownContent = React.memo(({ content }: { content: string }) => (
  <div className="markdown-body">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
        code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
          inline ? (
            <code className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[0.85em] font-semibold border border-primary/20">{children}</code>
          ) : (
            <div className="my-3 rounded-xl overflow-hidden border border-border/50">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-muted/60 border-b border-border/50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <pre className="m-0 p-4 bg-muted/30 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap break-words"><code>{children}</code></pre>
            </div>
          ),
        h1: ({ children }) => <h1 className="text-xl font-black mt-4 mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold text-primary mt-3 mb-1.5">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-bold text-primary mt-2.5 mb-1">{children}</h3>,
        ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-0 list-none">{children}</ul>,
        ol: ({ children }) => <ol className="my-2 space-y-1.5 pl-0 list-none">{children}</ol>,
        li: ({ children }) => (
          <li className="flex items-start gap-2.5">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <span className="flex-1 leading-relaxed">{children}</span>
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-3 pl-4 py-2 border-l-4 border-primary bg-primary/5 rounded-r-lg italic text-muted-foreground">{children}</blockquote>
        ),
        hr: () => <hr className="my-3 border-border/50" />,
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border/50 last:border-0">{children}</tr>,
        th: ({ children }) => <th className="px-3 py-2 text-left font-bold whitespace-nowrap">{children}</th>,
        td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline decoration-dotted hover:decoration-solid">{children}</a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
));
MarkdownContent.displayName = "MarkdownContent";

// ─── Voice Input Hook ──────────────────────────────────────────────────────────
const useSpeechRecognition = ({
  onResult, onError, lang = "en-US",
}: {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  lang?: string;
}) => {
  const recognitionRef = useRef<any | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      setSupported(true);
      const recognition: any = new SR();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("");
        onResult(transcript, e.results[e.results.length - 1].isFinal);
      };
      recognition.onerror = (e: any) => { setListening(false); onError?.(e.error); };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, [lang, onResult, onError]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    try { recognitionRef.current.start(); setListening(true); } catch { /* already started */ }
  }, [listening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
};

// ─── Typing Dots ───────────────────────────────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-0.5">
    {[0, 1, 2].map((i) => (
      <span key={i} className="w-2 h-2 rounded-full bg-primary inline-block animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }} />
    ))}
  </div>
);

// ─── Message Bubbles ───────────────────────────────────────────────────────────
const AssistantBubble = ({ msg }: { msg: ChatMessage }) => {
  const [copied, setCopied] = useState(false);
  const [thumbed, setThumbed] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3 items-start group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-md shadow-primary/20">
        <Bot size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0 max-w-[85%]">
        <div className="text-xs font-bold text-muted-foreground mb-1.5">Concept Coach</div>
        <div className={cn("rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed border",
          msg.is_error
            ? "bg-red-50 border-red-200/60 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
            : "bg-card border-primary/10 shadow-sm"
        )}>
          {msg.is_error && (
            <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
              <AlertCircle size={14} />
              <span className="text-xs font-bold uppercase tracking-wide">Error</span>
            </div>
          )}
          <MarkdownContent content={msg.content} />
        </div>
        {msg.hints?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.hints.map((hint, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300">
                <Lightbulb size={11} /> {hint}
              </span>
            ))}
          </div>
        )}
        {!msg.is_error && (
          <div className="mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-semibold text-muted-foreground mr-1">{msg.time}</span>
            <button onClick={handleCopy} className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition">
              {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
            <button onClick={() => setThumbed("up")} className={cn("h-6 w-6 rounded-md flex items-center justify-center transition", thumbed === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              <ThumbsUp size={12} />
            </button>
            <button onClick={() => setThumbed("down")} className={cn("h-6 w-6 rounded-md flex items-center justify-center transition", thumbed === "down" ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              <ThumbsDown size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const UserBubble = ({ msg }: { msg: ChatMessage }) => (
  <div className="flex gap-3 items-start flex-row-reverse animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
      <User size={16} className="text-primary-foreground" />
    </div>
    <div className="flex-1 min-w-0 max-w-[80%]">
      <div className="text-xs font-bold text-right text-muted-foreground mb-1.5">You</div>
      <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm shadow-primary/20 whitespace-pre-wrap leading-relaxed">{msg.content}</div>
      <div className="text-[10px] font-semibold text-right text-muted-foreground mt-1">{msg.time}</div>
    </div>
  </div>
);

// ─── Starter Cards ─────────────────────────────────────────────────────────────
const StarterCards = ({ onSelect }: { onSelect: (text: string) => void }) => {
  const starters = [
    { icon: Calculator, label: "Solve a Math Problem", text: "Help me solve this math problem step by step:", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { icon: Brain, label: "Explain a Concept", text: "Explain this concept simply with examples:", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
    { icon: GraduationCap, label: "Check My Answer", text: "Can you check my answer and tell me if it's correct:", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { icon: Lightbulb, label: "Give Me a Hint", text: "I'm stuck on this problem. Give me a hint:", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {starters.map((s, i) => (
        <button key={i} onClick={() => onSelect(s.text)} className={cn("group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md", s.bg)}>
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl bg-background shadow-sm", s.color)}><s.icon size={16} /></div>
          <span className={cn("text-sm font-bold", s.color)}>{s.label}</span>
        </button>
      ))}
    </div>
  );
};

// ─── History Drawer ────────────────────────────────────────────────────────────
const HistoryDrawer = ({
  open, onClose, sessions, onNew, onClear,
}: {
  open: boolean; onClose: () => void; sessions: ChatSession[];
  onNew: () => void; onClear: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="h-full w-72 bg-card border-r border-border/50 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2"><History size={18} className="text-primary" /><span className="font-black text-base">Chat History</span></div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition"><X size={16} /></button>
        </div>
        <div className="p-4">
          <button onClick={() => { onNew(); onClose(); }} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition">
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 opacity-50">
              <History size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-semibold text-muted-foreground">No history yet</p>
            </div>
          ) : sessions.map((s, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-3 hover:border-primary/30 hover:bg-muted/50 cursor-pointer transition">
              <p className="text-sm font-bold truncate">{s.preview}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={10} className="text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground">{s.time} · {s.messageCount} msgs</span>
              </div>
            </div>
          ))}
        </div>
        {sessions.length > 0 && (
          <div className="p-4 border-t border-border/50">
            <button onClick={onClear} className="w-full rounded-xl border border-red-200 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition dark:border-red-500/20 dark:hover:bg-red-500/10">
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ConceptCoachPage() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try { return JSON.parse(localStorage.getItem("cc_sessions") || "[]"); } catch { return []; }
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const autoExplainFiredRef = useRef(false);

  const autoExplainTopic = searchParams.get("topic") || "";
  const autoExplainSubject = searchParams.get("subject") || "";
  const shouldAutoExplain = searchParams.get("autoExplain") === "true";

  const langMap: Record<string, string> = { en: "en-US", hi: "hi-IN", ta: "ta-IN", fr: "fr-FR" };
  const speechLang = langMap[i18n.language] || "en-US";

  const handleVoiceResult = useCallback((transcript: string, isFinal: boolean) => {
    setInputValue(transcript);
    if (isFinal && transcript.trim()) {
      setTimeout(() => {
        setInputValue((prev) => { if (prev.trim()) sendMessage(prev.trim()); return ""; });
      }, 300);
    }
  }, []);

  const handleVoiceError = useCallback((err: string) => {
    if (err !== "no-speech") setInputValue("");
  }, []);

  const { listening, supported: voiceSupported, start: startListening, stop: stopListening } =
    useSpeechRecognition({ onResult: handleVoiceResult, onError: handleVoiceError, lang: speechLang });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (shouldAutoExplain && autoExplainTopic && !autoExplainFiredRef.current) {
      autoExplainFiredRef.current = true;
      const msg = `Please explain **${autoExplainTopic}**${autoExplainSubject ? ` from ${autoExplainSubject}` : ""} in a clear, comprehensive way.`;
      setTimeout(() => sendMessage(msg), 400);
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const session: ChatSession = {
      id: Date.now(),
      preview: messages[0]?.content?.slice(0, 60) || "Session",
      time: new Date().toLocaleDateString(),
      messageCount: messages.length,
    };
    setChatSessions((prev) => {
      const updated = [session, ...prev.slice(0, 19)];
      localStorage.setItem("cc_sessions", JSON.stringify(updated));
      return updated;
    });
  }, [messages.length]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { role: "user", content: trimmed, hints: [], is_error: false, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);
    inputRef.current?.focus();
    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const data = await sendChatMessage(trimmed, history);
      const responseText = data.response || data.message || "I received your message.";
      const hints = Array.isArray(data.hints) ? data.hints : [];
      setMessages((prev) => [...prev, { role: "assistant", content: responseText, hints, is_error: !!data.is_error, time: formatTime() }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [...prev, { role: "assistant", content: `**Connection error.**\n\nCould not reach the server: \`${errMsg}\`. Please check the app server is running and try again.`, hints: [], is_error: true, time: formatTime() }]);
    } finally { setLoading(false); }
  }, [loading, messages]);

  const handleSend = () => sendMessage(inputValue);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleNewChat = () => { setMessages([]); setInputValue(""); inputRef.current?.focus(); };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] max-w-3xl mx-auto">
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} sessions={chatSessions}
        onNew={handleNewChat} onClear={() => { setChatSessions([]); localStorage.removeItem("cc_sessions"); }} />

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button onClick={() => setHistoryOpen(true)} className="h-9 w-9 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition">
            <History size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-md shadow-primary/20">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black leading-tight">Concept Coach</p>
              <p className="text-[10px] font-semibold text-muted-foreground leading-tight">AI-powered tutor</p>
            </div>
          </div>
        </div>
        <button onClick={handleNewChat} className="flex items-center gap-1.5 rounded-xl border border-border/50 px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition">
          <Plus size={14} /> New Chat
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scroll-smooth custom-scrollbar">
        {shouldAutoExplain && autoExplainTopic && (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 mb-2">
            <BookOpen size={16} className="text-primary flex-shrink-0" />
            <p className="text-sm font-bold text-primary flex-1">
              Explaining: {autoExplainTopic} {autoExplainSubject ? `(${autoExplainSubject})` : ""}
            </p>
            <button onClick={() => window.history.replaceState({}, document.title, window.location.pathname)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        )}

        {isEmpty && !shouldAutoExplain && (
          <div className="flex flex-col items-center pt-6 pb-2 animate-in fade-in duration-500">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/20 border-2 border-primary/20 flex items-center justify-center">
                <Sparkles size={36} className="text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-md">
                <Bot size={14} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center mb-2">{t("coach_welcome_title", "How can I help you learn?")}</h2>
            <p className="text-sm font-medium text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
              {t("coach_welcome_subtitle", "Ask me anything — a concept, a problem, or 'I don't understand...'")}
            </p>
            <StarterCards onSelect={setInputValue} />
            <p className="text-[11px] font-semibold text-muted-foreground text-center opacity-60">
              {t("coach_welcome_footer", "Press Enter to send · Shift+Enter for new line")}
            </p>
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === "user" ? <UserBubble key={idx} msg={msg} /> : <AssistantBubble key={idx} msg={msg} />
        )}

        {loading && (
          <div className="flex gap-3 items-start animate-in fade-in duration-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-md shadow-primary/20">
              <Bot size={16} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-card border border-primary/10 px-4 py-3 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="flex-shrink-0 px-4 pb-5 pt-3 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        {!isEmpty && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {[
              { label: "Give a hint", icon: Lightbulb },
              { label: "Show formula", icon: Calculator },
              { label: "Explain again", icon: RefreshCw },
              { label: "Next step", icon: GraduationCap },
            ].map((chip, i) => (
              <button key={i} onClick={() => sendMessage(chip.label)} disabled={loading}
                className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition disabled:opacity-40">
                <chip.icon size={12} /> {chip.label}
              </button>
            ))}
          </div>
        )}

        {listening && (
          <div className="flex items-center gap-2 mb-2 rounded-xl border border-red-200/60 bg-red-50 px-3 py-2 dark:bg-red-500/10 dark:border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">Listening…</span>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-2xl border border-primary/20 bg-card px-4 py-3 shadow-sm transition focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/10">
          <textarea ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={isEmpty ? t("coach_placeholder_empty", "Ask me anything...") : t("coach_placeholder_followup", "Ask a follow-up question...")}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 leading-relaxed max-h-32 overflow-y-auto disabled:opacity-60 font-medium"
            style={{ minHeight: "24px" }}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 128) + "px";
            }}
          />
          <button onClick={listening ? stopListening : startListening} disabled={loading || !voiceSupported}
            className={cn("flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition",
              listening ? "bg-red-500/10 text-red-500 border border-red-500/30" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>
            {listening ? <StopCircle size={16} /> : <Mic size={16} />}
          </button>
          <button onClick={handleSend} disabled={!inputValue.trim() || loading}
            className={cn("flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-all",
              inputValue.trim() && !loading ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}>
            {loading ? <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-center text-[10px] font-semibold text-muted-foreground mt-2 opacity-60">
          {t("coach_footer_tip", "Press Enter to send · Shift+Enter for new line")}
        </p>
      </div>
    </div>
  );
}
