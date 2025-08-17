import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

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
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "속솔 – 익명 AI 멘탈 케어",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "속솔 | 익명 AI 멘탈 케어",
    description: "흔적 없이 비우고, 판단 없는 경청으로 마음을 돌보는 치유 여정",
    images: ["/og.png"],
  },
  manifest: "/manifest.json",
  themeColor: "#10B981",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10B981" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col app-bg force-light text-[15px] text-[var(--foreground)]`}
      >
        {/* Global Header: always-visible brand logo (solid color for SSR/CSR stability) */}
        <header className="w-full border-b border-[var(--color-border-soft)] bg-transparent">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-0">
              {/* Increased logo size for visibility and better balance with text */}
              <Image src="/logo.svg" alt="속솔 로고" width={40} height={40} className="w-10 h-10" />
              <span className="text-[#10B981] font-semibold text-xl leading-none">속솔</span>
            </Link>
            <div className="text-xs text-[var(--foreground-soft)]">대화는 저장되지 않습니다</div>
          </div>
        </header>

        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="site-footer text-center text-xs text-[var(--foreground-soft)] py-6 border-t border-[var(--color-border-soft)] mt-12 bg-[rgba(16,185,129,0.08)] backdrop-blur-sm space-y-2">
          <p className="mb-1">
            이 서비스는 사용자의 대화 내용을 저장하지 않습니다. (개인정보 처리방침: 수집 대상 없음)
          </p>
          <p className="text-[11px] leading-relaxed opacity-80">
            위기(자해·타해 우려, 즉각적 위험) 상황이라면 112, 1393(자살 예방 상담), 1588-9191(정신건강 상담) 등 긴급/전문 기관에 즉시 도움을 요청하세요. 본 서비스는 의료 진단이나 치료가 아닙니다.
          </p>
          <p className="opacity-70">© {new Date().getFullYear()} SokSol. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
