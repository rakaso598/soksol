import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { validateMessages } from "@/lib/validateMessages";

// NOTE (Privacy): This API stores no chat data server-side (no DB / no file writes).
// All responses include explicit no-store / no-cache headers to give users a verifiable
// signal (browser devtools -> Network) that messages are not cached. See PRIVACY.md & README.md.
// If adding new functionality here, DO NOT introduce persistence.

const SYSTEM_PROMPT = `당신은SokSol속솔의AI상담사입니다,
사용자의마음의고민을판단없이경청하고공감하며,
스스로답을찾아가는과정을따뜻하게지원합니다,
핵심원칙완전한익명성,
사용자의개인정보를절대수집하거나저장하지않으며,
모든대화는실시간처리후즉시삭제됩니다,
판단없는경청,
비판이나진단대신공감과반영으로대화하며,
사용자가스스로를이해할수있도록돕습니다,
안전한대화공간,
사용자가부담없이마음을털어놓을수있는안전하고따뜻한환경을제공합니다,
대화방식감정을반영하고공감하며,
개방형질문으로자기성찰을촉진합니다,
사용자의감정과경험을존중하며,
스스로해답을찾도록격려합니다,
3에서5문장내로간결하면서도따뜻하고명료한답변을제공합니다,
첫메시지에는과도한설명보다는사용자의마음에공감하며,
자연스럽게대화를이어갑니다,
안전가이드라인자해나타해위험이감지되면전문상담기관생명의전화15889191,
청소년상담전화1388등을부드럽게안내합니다,
의료적진단이나전문적치료조언은하지않으며,
필요시전문가상담을권합니다,
SokSol은전문상담이나의료치료와는별개의일상적대화서비스임을자연스럽게알려드립니다,
SokSol에대해사용자가SokSol이나속솔에대해궁금해하면,
개인정보100비저장을보장하는익명AI멘탈케어서비스로서,
마음의부담을덜고스스로를돌아볼수있는안전한공간을제공한다고,
객관적이면서도친근하게설명합니다,
대화톤친근하면서도전문적인태도를유지합니다,
사용자의상황에따라적절한공감과격려를제공합니다,
무겁지않으면서도진심이담긴따뜻한대화를이어갑니다,
지금부터사용자와따뜻하고안전한대화를시작하세요.`;

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

// Helper: attach strict no-store headers to every outgoing response
function withNoStoreHeaders(res: NextResponse) {
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  // Non-standard informational header to reinforce policy (visible to users):
  res.headers.set('X-Data-Retention', 'none');
  return res;
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
      return withNoStoreHeaders(NextResponse.json({ errorCode: 'BLOCKED_UA', message: '허용되지 않는 클라이언트.' }, { status: 400 }));
    }
    const rl = rateLimitConsume(ip);
    if (!rl.allowed) {
      return withNoStoreHeaders(NextResponse.json({ errorCode: 'RATE_LIMIT', message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 }));
    }
    if (rl.delay) await sleep(rl.delay);

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const { messages } = body as { messages?: { role: string; content: string }[] };

    type ValidationResult = { ok: boolean; reason?: string };
    const validation = validateMessages(messages) as ValidationResult;
    if (!validation.ok) {
      const mapped = mapValidation(validation.reason || '');
      return withNoStoreHeaders(NextResponse.json({ errorCode: mapped.code, message: mapped.message }, { status: mapped.status }));
    }

    const userLatest = messages![messages!.length - 1]!.content || "";
    const prompt = `${SYSTEM_PROMPT}\n사용자 최신 메시지: ${userLatest}`;

    try {
      const text = await callGeminiWithRetry(prompt);
      return withNoStoreHeaders(NextResponse.json({ reply: text }));
    } catch (err: unknown) {
      const mapped = classifyError(err);
      safeLogError(err);
      return withNoStoreHeaders(NextResponse.json({ errorCode: mapped.code, message: mapped.message }, { status: mapped.status }));
    }
  } catch (e: unknown) {
    safeLogError(e);
    const mapped = classifyError(e);
    return withNoStoreHeaders(NextResponse.json({ errorCode: mapped.code, message: mapped.message }, { status: mapped.status }));
  }
}
