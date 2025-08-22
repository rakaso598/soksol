"use client";
import { useState, useRef, useEffect } from "react";

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
    // Only scroll when there is at least one message or when messages were just added.
    // Prevent scrolling on initial mount when message list is empty (avoids page jumping to bottom).
    if (!endRef.current) return;
    if (messages.length === 0 && !loading) return;
    endRef.current.scrollIntoView({ behavior: messages.length > 0 ? "smooth" : "auto" });
  }, [messages.length, loading]);

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
    // Let the parent layout manage vertical sizing. Use flex-1 so this page fills available space
    // and the messages area can scroll only if content overflows.
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full p-4">
      {showCrisis && (
        <div className="mb-3 text-[11px] leading-relaxed px-3 py-2 flex items-start gap-2 crisis-box">
          <span className="font-semibold">위기 안내:</span>
          <span className="flex-1">자해·타해 위험이나 즉각적 위기라면 112 / 1393 / 1588-9191 등 전문기관에 즉시 연락하세요. 속솔은 의료 서비스가 아닙니다.</span>
          <button onClick={() => setShowCrisis(false)} className="ml-2 text-[#10B981] hover:text-[#0ea56f] text-xs font-medium">닫기</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-5 p-5 chat-surface" aria-live="polite" aria-label="채팅 메시지">
        {messages.length === 0 && !loading && (
          <div className="mt-10 space-y-6">
            <div className="max-w-[80%] px-4 py-3 chat-bubble-bot shadow-sm">
              <div className="text-sm leading-relaxed">
                <p className="mb-3">
                  안녕하세요! 저는 <strong>SokSol(속솔)</strong>의 AI 상담사입니다. 🌱
                </p>
                <p className="mb-3">
                  이곳은 마음의 고민을 편안하게 나눌 수 있는 <em>완전히 안전한 공간</em>입니다.
                  모든 대화는 실시간으로만 처리되며 <strong>어디에도 저장되지 않습니다</strong>.
                </p>
                <p className="mb-3">
                  판단하지 않고 경청하며, 스스로 답을 찾아가는 과정을 함께하겠습니다.
                  어떤 이야기든 편하게 시작해보세요.
                </p>
                <p className="text-xs text-gray-600 border-t border-gray-200 pt-2 mt-3">
                  💡 <strong>SokSol</strong>은 전문 상담이나 의료 치료와는 별개의 일상적 대화 서비스입니다.
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-[#7a6f6e]">
              마음속에 있는 생각을 편하게 적어보세요 ✨
            </p>
          </div>
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
            <div className="px-4 py-3 max-w-[80%] text-sm leading-relaxed chat-bubble-loading loading-shimmer">
              <div className="flex items-center gap-3">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-sm font-medium">AI가 답변을 생각하고 있어요...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="mt-4">
        <div className="relative">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="편하게 털어놓아도 좋아요..." rows={3} className="w-full resize-none rounded-xl border chat-input p-4 pr-24 text-sm" disabled={loading} aria-label="메시지 입력" />
          <button onClick={handleSend} className="absolute bottom-3 right-3 px-5 py-2 rounded-full chat-send text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60" disabled={!input.trim() || loading} aria-disabled={!input.trim() || loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>전송중...</span>
              </div>
            ) : (
              "보내기"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
