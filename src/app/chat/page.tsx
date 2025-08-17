"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  role: "user" | "bot" | "error";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const flag = sessionStorage.getItem("soksol_crisis_shown");
      if (!flag) {
        setShowCrisis(true);
        sessionStorage.setItem("soksol_crisis_shown", "1");
      }
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    const currentMessages = [...messages, userMsg];
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: currentMessages }) });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "bot", content: data.reply.trim() }]);
      } else {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "error", content: `오류: ${data.message || "응답을 불러오지 못했습니다."}` }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "error", content: "서버 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-3xl mx-auto w-full p-4">
      <header className="flex items-center justify-between py-2 mb-2">
        <Link href="/" className="font-semibold text-lg bg-gradient-to-r from-rose-500 to-amber-500 text-transparent bg-clip-text">
          속솔
        </Link>
        <span className="text-xs text-[#7a6f6e]">대화는 저장되지 않습니다</span>
      </header>
      {showCrisis && (
        <div className="mb-3 text-[11px] leading-relaxed px-3 py-2 flex items-start gap-2 crisis-box">
          <span className="font-semibold">위기 안내:</span>
          <span className="flex-1">자해·타해 위험이나 즉각적 위기라면 112 / 1393 / 1588-9191 등 전문기관에 즉시 연락하세요. 속솔은 의료 서비스가 아닙니다.</span>
          <button onClick={() => setShowCrisis(false)} className="ml-2 text-rose-500 hover:text-rose-600 text-xs font-medium">닫기</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-5 p-5 chat-surface" aria-live="polite" aria-label="채팅 메시지">
        {messages.length === 0 && !loading && (
          <p className="text-center text-sm text-[#7a6f6e] mt-10">마음속에 있는 생각을 편하게 적어보세요.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm readable ${m.role === "user" ? "chat-bubble-user" : m.role === "bot" ? "chat-bubble-bot" : "chat-bubble-error"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 text-sm chat-bubble-loading animate-pulse">... 로딩 중</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="mt-4">
        <div className="relative">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="편하게 털어놓아도 좋아요..." rows={3} className="w-full resize-none rounded-xl border chat-input p-4 pr-24 text-sm" disabled={loading} aria-label="메시지 입력" />
          <button onClick={handleSend} className="absolute bottom-3 right-3 px-5 py-2 rounded-full chat-send text-sm font-medium disabled:cursor-not-allowed" disabled={!input.trim() || loading} aria-disabled={!input.trim() || loading}>
            {loading ? "전송중" : "보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}
