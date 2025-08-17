import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { validateMessages } from "@/lib/validateMessages";

const SYSTEM_PROMPT = `당신은 사용자의 고민을 판단 없이 경청하고 공감하며 스스로 답을 찾도록 돕는 따뜻한 AI 상담사입니다. 
- 개인정보를 수집하거나 저장하지 않는다는 점을 상기시킵니다.
- 판단/비난/진단 대신 감정 반영, 개방형 질문, 자기이해 촉진을 사용합니다.
- 위험 징후(자해/타해)가 강하게 드러나면 전문 도움(긴급 상담/전문기관)에 연결하라고 부드럽게 권유합니다.
- 답변은 3~6문장 내로 따뜻하고 명료하게 유지합니다.`;

let aiClient: GoogleGenAI | null = null;
function getClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
    // Initialize new GenAI client
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
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
  if (raw.includes("404") || raw.includes("not found") || raw.includes("model")) return { status: 502, message: "모델을 찾을 수 없습니다. 환경변수 GEN_MODEL이 올바른지 확인하세요.", code: 'MODEL_NOT_FOUND' };
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

function extractTextFromResponse(resp: unknown): string {
  // Handle several possible SDK response shapes
  try {
    const anyResp = resp as Record<string, unknown>;
    // Common: { text: '...' }
    const maybeText = anyResp['text'];
    if (typeof maybeText === 'string' && maybeText.trim()) return maybeText.trim();

    // Common genai: { candidates: [{ content: { text: '...' } }] }
    const candidates = anyResp['candidates'];
    if (Array.isArray(candidates) && candidates.length) {
      const c0 = candidates[0] as Record<string, unknown> | undefined;
      const content = c0?.['content'] as Record<string, unknown> | undefined;
      const cText = content?.['text'];
      if (typeof cText === 'string' && cText.trim()) return cText.trim();
      const cText2 = c0?.['text'];
      if (typeof cText2 === 'string' && cText2.trim()) return cText2.trim();
      const msg = c0?.['message'] as Record<string, unknown> | undefined;
      const msgText = msg?.['content'] as Record<string, unknown> | undefined;
      const mt = msgText?.['text'];
      if (typeof mt === 'string' && mt.trim()) return mt.trim();
    }

    // Newer shape: { output: [{ content: [{ text: '...' }] }] }
    const output = anyResp['output'];
    if (Array.isArray(output) && output.length) {
      const out0 = output[0] as Record<string, unknown> | undefined;
      const outContent = out0?.['content'];
      if (Array.isArray(outContent) && outContent.length) {
        const t = outContent[0] as Record<string, unknown> | undefined;
        const ttext = t?.['text'];
        if (typeof ttext === 'string') return ttext;
      }
    }

    // Fallback to stringifying limited size
    const s = JSON.stringify(anyResp);
    return s.length > 1000 ? s.substring(0, 1000) + '...' : s;
  } catch {
    return '';
  }
}

async function callGeminiWithRetry(prompt: string, attempts = 0): Promise<string> {
  const client = getClient();
  // Allow model to be set via env; normalize to SDK expectation (prefix with 'models/' if missing)
  const rawModel = process.env.GEN_MODEL || "gemini-2.5-flash";
  const modelName = rawModel.startsWith('models/') ? rawModel : `models/${rawModel}`;

  const controller = new AbortController();
  // increase timeout slightly for network/model latency
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    // The SDK may accept different param shapes; pass a minimal well-formed request.
    const payload: Record<string, unknown> = { model: modelName };
    // newer SDKs accept contents or input; include 'content' for backwards compat
    payload['contents'] = [{ type: 'text', text: prompt }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await client.models.generateContent(payload as unknown as any).catch(async () => {
      // Some SDK versions expect { input: '...' } or { prompt: '...' }
      const altPayload: Record<string, unknown> = { model: modelName, input: prompt };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return client.models.generateContent(altPayload as unknown as any);
    });

    clearTimeout(timeout);
    const text = extractTextFromResponse(response);
    if (!text || text.length === 0) throw new Error('Empty response from model');
    return text;
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
