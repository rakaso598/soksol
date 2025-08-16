"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentMessages = [...messages, userMsg];
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "bot", content: data.reply.trim() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "bot",
            content: "죄송해요. 응답을 불러오지 못했어요.",
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "bot", content: "서버 오류가 발생했습니다." },
      ]);
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
        <span className="text-xs text-neutral-500">대화는 저장되지 않습니다</span>
      </header>
      <div className="flex-1 overflow-y-auto space-y-4 rounded-xl p-4 bg-white/70 backdrop-blur border border-rose-100 shadow-inner">
        {messages.length === 0 && !loading && (
          <p className="text-center text-sm text-neutral-500 mt-10">
            마음속에 있는 생각을 편하게 적어보세요.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${m.role === "user"
                  ? "bg-gradient-to-r from-rose-400 to-amber-400 text-white"
                  : "bg-neutral-100 text-neutral-800"
                }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-neutral-100 text-neutral-500 text-sm animate-pulse">
              ... 로딩 중
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="mt-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="편하게 털어놓아도 좋아요..."
            rows={3}
            className="w-full resize-none rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none p-4 pr-24 text-sm bg-white/80 backdrop-blur"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className="absolute bottom-3 right-3 px-5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-40 transition"
            disabled={!input.trim() || loading}
          >
            {loading ? "전송중" : "보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}
