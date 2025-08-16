// Sentry client init (PII 최소화)
import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // 사용자 입력(채팅) 문자열 제거 또는 마스킹
      if (event.request) {
        delete (event.request as any).data; // body 제거
      }
      if (event.exception?.values) {
        event.exception.values = event.exception.values.map(v => ({
          ...v,
          value: v.value?.slice(0, 200), // 길이 제한
        }));
      }
      return event;
    },
    beforeBreadcrumb(b) {
      if (b?.data && typeof b.data === 'object' && 'url' in b.data) {
        try { (b.data as any).url = new URL((b.data as any).url).pathname; } catch { }
      }
      return b;
    }
  });
}
