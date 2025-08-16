import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "속솔 | SokSol",
  description: "익명 AI 멘탈 케어 – 속마음을 솔직하게 털어놓고 비워내는 치유 여정",
  keywords: ["속솔", "멘탈케어", "AI 상담", "익명", "마음챗"],
  openGraph: {
    title: "속솔 | 익명 AI 멘탈 케어",
    description: "흔적 없이 비우고, 판단 없는 경청으로 마음을 돌보고, 스스로를 찾는 여정",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-b from-rose-50 via-white to-amber-50 text-neutral-800`}
      >
        {/* Global Header could be inserted here if needed */}
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="text-center text-xs text-neutral-500 py-6 border-t mt-12 bg-white/40 backdrop-blur">
          <p className="mb-1">
            이 서비스는 사용자의 대화 내용을 저장하지 않습니다. (개인정보 처리방침: 수집 대상 없음)
          </p>
          <p>© {new Date().getFullYear()} SokSol. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
