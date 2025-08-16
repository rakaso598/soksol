// Sentry server init (PII 최소화)
import * as Sentry from '@sentry/nextjs';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // 서버측 요청 body / 사용자 메시지 제거
      if (event.request) {
        delete (event.request as any).data;
      }
      return event;
    },
    ignoreErrors: [
      'AbortError',
    ],
  });
}
