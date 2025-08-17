import fs from "fs/promises";
import path from "path";
import Link from "next/link";

export default async function PrivacyPage() {
  const filePath = path.resolve(process.cwd(), "PRIVACY.md");
  let content = "(PRIVACY.md 파일을 읽을 수 없습니다.)";
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch (e) {
    console.error("Failed to read PRIVACY.md:", e);
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">개인정보 처리방침 (Privacy)</h1>
        <p className="text-sm text-[var(--foreground-soft)] mt-2">이 페이지는 저장소의 PRIVACY.md 내용을 실시간으로 보여줍니다.</p>
        <div className="mt-4">
          <Link href="/" className="text-sm underline">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </header>

      <article className="rounded-xl bg-white/80 p-6 border shadow-sm overflow-hidden">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{content}</pre>
      </article>
    </main>
  );
}
