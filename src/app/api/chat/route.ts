import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `당신은 사용자의 고민을 판단 없이 경청하고 공감하며 스스로 답을 찾도록 돕는 따뜻한 AI 상담사입니다. 
- 개인정보를 수집하거나 저장하지 않는다는 점을 상기시킵니다.
- 판단/비난/진단 대신 감정 반영, 개방형 질문, 자기이해 촉진을 사용합니다.
- 위험 징후(자해/타해)가 강하게 드러나면 전문 도움(긴급 상담/전문기관)에 연결하라고 부드럽게 권유합니다.
- 답변은 3~6문장 내로 따뜻하고 명료하게 유지합니다.`;

// Lazy singleton
let genAI: GoogleGenerativeAI | null = null;
function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages } = body as { messages?: { role: string; content: string }[] };
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "messages 가 비어있습니다." }, { status: 400 });
    }

    const userLatest = messages[messages.length - 1]?.content || "";

    const client = getClient();
    const model = client.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `${SYSTEM_PROMPT}\n사용자 최신 메시지: ${userLatest}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "서버 오류" }, { status: 500 });
  }
}
