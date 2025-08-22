import fs from "fs/promises";
import path from "path";
import Link from "next/link";

// 간단한 마크다운 파서
function parseMarkdown(content: string) {
  return content
    // 헤딩 처리
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-blue-800">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4 text-blue-900 border-b-2 border-blue-200 pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6 text-blue-950">$1</h1>')

    // 강조 처리
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')

    // 리스트 처리
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/^✅ (.*$)/gim, '<li class="ml-4 mb-2 text-green-700">✅ $1</li>')

    // 구분선
    .replace(/^---$/gim, '<hr class="my-6 border-gray-300">')

    // 줄바꿈 처리
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>');
}

export default async function PrivacyPage() {
  const filePath = path.resolve(process.cwd(), "docs", "PRIVACY.md");
  let content = "(docs/PRIVACY.md 파일을 읽을 수 없습니다.)";
  try {
    const rawContent = await fs.readFile(filePath, "utf8");
    content = parseMarkdown(rawContent);
  } catch (e) {
    console.error("Failed to read docs/PRIVACY.md:", e);
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h1 className="text-3xl font-bold text-blue-950 mb-2">개인정보 처리방침</h1>
          <p className="text-blue-700 mb-4">SokSol 서비스의 개인정보 보호 정책을 안내합니다.</p>
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </header>

      <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="prose prose-blue max-w-none p-8 leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${content}</p>` }}
        />
      </article>

      <footer className="mt-8 p-6 bg-gray-50 rounded-xl border">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">🛡️ 이 정책은 사용자의 프라이버시 보호를 위해 지속적으로 개선됩니다.</p>
          <p>문의사항이 있으시면 GitHub Issues를 통해 연락해 주세요.</p>
        </div>
      </footer>
    </main>
  );
}
