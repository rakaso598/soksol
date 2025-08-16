import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ reply: "안녕하세요. 저는 AI 챗봇입니다." });
}
