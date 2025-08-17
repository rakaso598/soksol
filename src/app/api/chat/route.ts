import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateMessages } from "@/lib/validateMessages";

const SYSTEM_PROMPT = `당신은 사용자의 고민을 판단 없이 경청하고 공감하며 스스로 답을 찾도록 돕는 따뜻한 AI 상담사입니다. 
- 개인정보를 수집하거나 저장하지 않는다는 점을 상기시킵니다.
- 판단/비난/진단 대신 감정 반영, 개방형 질문, 자기이해 촉진을 사용합니다.
- 위험 징후(자해/타해)가 강하게 드러나면 전문 도움(긴급 상담/전문기관)에 연결하라고 부드럽게 권유합니다.
- 답변은 3~6문장 내로 따뜻하고 명료하게 유지합니다.`;

let genAI: GoogleGenerativeAI | null = null;
function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Rate limiting (simple in-memory sliding window with progressive delay)
const RATE_LIMIT = { windowMs: 60_000, max: 10 };
const buckets = new Map<string, number[]>();
function rateLimitConsume(ip: string | undefined) {
  if (!ip) return { allowed: true, count: 0, delay: 0 };
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  const arr = (buckets.get(ip) || []).filter(ts => ts > windowStart);
  const count = arr.length;
  if (count >= RATE_LIMIT.max) return { allowed: false, count, delay: 0 };
  arr.push(now);
  buckets.set(ip, arr);
  // progressive delay after 70% usage
  const usageRatio = (count + 1) / RATE_LIMIT.max;
  const delay = usageRatio > 0.7 ? Math.min(1500, Math.round((usageRatio - 0.7) * 5000)) : 0;
  return { allowed: true, count: count + 1, delay };
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function safeLogError(e: unknown) {
  const msg = asMessage(e).substring(0, 200);
  console.error("[chat-api-error]", msg);
}

function asMessage(e: unknown): string {
  if (!e) return '';
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
}

function classifyError(e: unknown): { status: number; message: string; code: string } {
  const raw = asMessage(e).toLowerCase();
  if (raw.includes("abort") || raw.includes("timeout")) return { status: 504, message: "요청이 시간 초과되었습니다.", code: 'TIMEOUT' };
  if (raw.includes("429") || raw.includes("rate") || raw.includes("too many")) return { status: 429, message: "요청이 일시적으로 많습니다. 잠시 후 다시 시도해주세요.", code: 'RATE_LIMIT' };
  if (raw.includes("quota") || raw.includes("exceed")) return { status: 503, message: "모델 사용 한도가 잠시 초과되었습니다. 잠시 후 재시도해주세요.", code: 'QUOTA_EXCEEDED' };
  if (raw.includes("api key") || raw.includes("permission") || raw.includes("unauthorized") || raw.includes("403") || raw.includes("401")) return { status: 500, message: "API 인증 문제가 발생했습니다. 서비스 점검 후 다시 이용해주세요.", code: 'AUTH' };
  return { status: 500, message: "서버 오류가 발생했습니다. 다시 시도해주세요.", code: 'INTERNAL' };
}

function mapValidation(reason: string): { status: number; code: string; message: string } {
  const base = { status: 400, code: 'VALIDATION', message: '요청이 올바르지 않습니다.' };
  switch (reason) {
    case 'empty':
    case 'empty-item':
    case 'last-empty':
      return { status: 400, code: 'EMPTY', message: '메시지가 비어있습니다.' };
    case 'too-many':
      return { status: 400, code: 'TOO_MANY', message: '메시지가 너무 많습니다.' };
    case 'too-long':
    case 'total-too-large':
      return { status: 400, code: 'TOO_LONG', message: '메시지 길이 제한을 초과했습니다.' };
    case 'url-not-allowed':
      return { status: 400, code: 'URL_BLOCKED', message: 'URL 포함은 허용되지 않습니다.' };
    default:
      return base;
  }
}

const DISALLOWED_UA_PATTERNS = [/python-requests/i, /curl\/\d+/i, /wget/i];

async function callGeminiWithRetry(prompt: string, attempts = 0): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-pro" });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const result = await model.generateContent(prompt, { signal: controller.signal as unknown as AbortSignal });
    clearTimeout(timeout);
    return result.response.text();
  } catch (err: unknown) {
    clearTimeout(timeout);
    const raw = asMessage(err).toLowerCase();
    const transient = raw.includes('timeout') || raw.includes('429') || raw.includes('quota') || raw.includes('exceed') || raw.includes('tempor');
    if (transient && attempts < 2) {
      await sleep(300 * (attempts + 1) + Math.random() * 400);
      return callGeminiWithRetry(prompt, attempts + 1);
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "anon";
    const ua = req.headers.get('user-agent') || '';
    if (DISALLOWED_UA_PATTERNS.some(r => r.test(ua))) {
      return NextResponse.json({ errorCode: 'BLOCKED_UA', message: '허용되지 않는 클라이언트.' }, { status: 400 });
    }
    const rl = rateLimitConsume(ip);
    if (!rl.allowed) {
      return NextResponse.json({ errorCode: 'RATE_LIMIT', message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }
    if (rl.delay) await sleep(rl.delay);

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const { messages } = body as { messages?: { role: string; content: string }[] };

    type ValidationResult = { ok: boolean; reason?: string };
    const validation = validateMessages(messages) as ValidationResult;
    if (!validation.ok) {
      const mapped = mapValidation(validation.reason || '');
      return NextResponse.json({ errorCode: mapped.code, message: mapped.message }, { status: mapped.status });
    }

    const userLatest = messages![messages!.length - 1]!.content || "";
    const prompt = `${SYSTEM_PROMPT}\n사용자 최신 메시지: ${userLatest}`;

    try {
      const text = await callGeminiWithRetry(prompt);
      return NextResponse.json({ reply: text });
    } catch (err: unknown) {
      const mapped = classifyError(err);
      safeLogError(err);
      return NextResponse.json({ errorCode: mapped.code, message: mapped.message }, { status: mapped.status });
    }
  } catch (e: unknown) {
    safeLogError(e);
    const mapped = classifyError(e);
    return NextResponse.json({ errorCode: mapped.code, message: mapped.message }, { status: mapped.status });
  }
}
