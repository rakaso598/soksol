import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateMessages } from "@/lib/validateMessages";

export const SYSTEM_PROMPT = `당신은 사용자의 고민을 판단 없이 경청하고 공감하며 스스로 답을 찾도록 돕는 따뜻한 AI 상담사입니다. 
- 개인정보를 수집하거나 저장하지 않는다는 점을 상기시킵니다.
- 판단/비난/진단 대신 감정 반영, 개방형 질문, 자기이해 촉진을 사용합니다.
- 위험 징후(자해/타해)가 강하게 드러나면 전문 도움(긴급 상담/전문기관)에 연결하라고 부드럽게 권유합니다.
- 답변은 3~6문장 내로 따뜻하고 명료하게 유지합니다.`;

let genAI: GoogleGenerativeAI | null = null;
export function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const RATE_LIMIT = { windowMs: 60_000, max: 10 }; // 10 req / minute per ip
const SOFT_JITTER_THRESHOLD = RATE_LIMIT.max - 2; // start slowing when 8+ in window
const buckets = new Map<string, number[]>();
function rateLimitConsume(ip: string | undefined) {
  if (!ip) return { allowed: true, count: 0 };
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  const arr = (buckets.get(ip) || []).filter((ts) => ts > windowStart);
  if (arr.length >= RATE_LIMIT.max) return { allowed: false, count: arr.length };
  arr.push(now);
  buckets.set(ip, arr);
  return { allowed: true, count: arr.length };
}
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function safeLogError(e: any) {
  const msg = e?.message || String(e);
  console.error("[chat-api-error]", msg.substring(0, 300));
}

function classifyError(e: any): { status: number; message: string } {
  const raw = (e?.message || "").toLowerCase();
  if (raw.includes("abort") || raw.includes("timeout")) return { status: 504, message: "요청이 시간 초과되었습니다." };
  if (raw.includes("429") || raw.includes("rate") || raw.includes("too many")) return { status: 429, message: "요청이 일시적으로 많습니다. 잠시 후 다시 시도해주세요." };
  if (raw.includes("quota") || raw.includes("exceed")) return { status: 503, message: "모델 사용 한도가 잠시 초과되었습니다. 잠시 후 재시도해주세요." };
  if (raw.includes("api key") || raw.includes("permission") || raw.includes("unauthorized") || raw.includes("403") || raw.includes("401")) return { status: 500, message: "API 인증 문제가 발생했습니다. 서비스 점검 후 다시 이용해주세요." };
  return { status: 500, message: "서버 오류가 발생했습니다. 다시 시도해주세요." };
}

export async function POST(req: any) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "anon";
    const rl = rateLimitConsume(ip);
    if (!rl.allowed) {
      return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
    }
    // Soft jitter delay when approaching limit
    if (rl.count >= SOFT_JITTER_THRESHOLD) {
      const delay = 150 + Math.random() * 650; // 150-800ms
      await sleep(delay);
    }
    const body = await req.json().catch(() => ({}));
    const { messages } = body as { messages?: { role: string; content: string }[] };
    const validation = validateMessages(messages);
    if (!validation.ok) {
      return NextResponse.json({ error: "messages 가 비어있습니다." }, { status: 400 });
    }

    const userLatest = messages![messages!.length - 1]!.content || "";

    const client = getClient();
    const model = client.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `${SYSTEM_PROMPT}\n사용자 최신 메시지: ${userLatest}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
    try {
      const result = await model.generateContent(prompt, { signal: controller.signal as any });
      clearTimeout(timeout);
      const text = result.response.text();
      return NextResponse.json({ reply: text });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return NextResponse.json({ error: "요청이 시간 초과되었습니다." }, { status: 504 });
      }
      const mapped = classifyError(err);
      safeLogError(err);
      return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    }
  } catch (e: any) {
    safeLogError(e);
    return NextResponse.json({ error: classifyError(e).message }, { status: classifyError(e).status });
  }
}
