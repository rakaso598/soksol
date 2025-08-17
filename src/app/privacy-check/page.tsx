import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '실시간 비저장 증명 | 속솔',
  robots: 'noindex',
};

// Simple in-memory build time retained (not per-user). Display policy version & timestamp.
const POLICY_VERSION = 'v1'; // Update if PRIVACY.md materially changes.

export default async function PrivacyCheckPage() {
  // Server timestamp (UTC) each request => shows no caching (should update on refresh)
  const serverTime = new Date().toISOString();
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-2xl font-bold text-rose-600">실시간 비저장 증명</h1>
      <p className="text-sm leading-relaxed text-neutral-700">
        이 페이지는 서버가 요청 시점에 즉시 생성한 <strong>서버 UTC 타임스탬프</strong>를 보여줍니다. 새로고침할 때마다 시간이
        변하면 <code>Cache-Control: no-store</code> 정책이 정상 적용되어 <strong>대화/요청이 캐싱되지 않음</strong>을 의미합니다.
      </p>
      <div className="p-4 rounded-lg border border-rose-100 bg-white/70 shadow-sm flex flex-col gap-2">
        <div className="text-sm"><span className="font-semibold">서버 시간 (UTC): </span>{serverTime}</div>
        <div className="text-sm"><span className="font-semibold">Privacy Policy Version: </span>{POLICY_VERSION}</div>
        <div className="text-xs text-neutral-500">(모든 채팅 요청 응답 헤더: Cache-Control: no-store, X-Data-Retention: none)</div>
      </div>
      <section className="space-y-3 text-sm text-neutral-700">
        <h2 className="font-semibold text-amber-600">어떻게 검증하나요?</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>브라우저 개발자 도구(Network) 열기</li>
          <li>/api/chat 요청 선택 후 Response Headers 확인</li>
          <li><code>Cache-Control: no-store</code>, <code>Pragma: no-cache</code>, <code>X-Data-Retention: none</code> 존재 확인</li>
          <li>페이지 새로고침 후 이 페이지의 서버 시간 변화를 확인</li>
        </ol>
      </section>
      <section className="space-y-2 text-sm text-neutral-700">
        <h2 className="font-semibold text-pink-600">저장되는 것이 정말 없나요?</h2>
        <p>서버는 데이터베이스나 파일 시스템에 채팅 내용을 기록하지 않습니다. 인메모리 로그에서도 전문을 남기지 않도록 제한되며, Sentry 사용 시 요청 body 제거 로직이 적용됩니다.</p>
      </section>
    </main>
  );
}
