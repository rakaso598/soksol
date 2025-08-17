# PRIVACY POLICY

서비스 철학: 비저장 (No Retention)

수집/저장되는 개인정보: 없음.
- 계정 / 로그인 기능 없음.
- 채팅 메시지 서버측 DB/파일 저장 없음.
- 로깅 시 메시지 전문 저장/전송 안 함 (Sentry filter).

네트워크 / 헤더 기반 검증
- /api/chat 모든 응답: `Cache-Control: no-store, no-cache, must-revalidate`, `Pragma: no-cache`, `X-Data-Retention: none` (개발자 도구로 확인 가능)
- /privacy-check 페이지: 실시간 서버 UTC 타임스탬프 노출 (새로고침마다 변화 → 캐시 미사용 증명)

쿠키 / 로컬 저장소
- 서비스 기능에 필수적인 영구 저장 사용 안 함.
- sessionStorage: 위기 안내 1회성 플래그만 저장 (브라우저 세션 종료 시 삭제).

제3자 전송
- Gemini API 호출 시 사용자 메시지(최신)만 모델 입력으로 전송, 저장하지 않음.
- 분석/추적 도구 (GA 등) 미사용.

데이터 보존
- 서버/DB 미보유로 삭제 요청 개념 해당 없음.

사용자 권리
- 별도 저장 데이터가 없으므로 접근/정정/삭제 요청 불필요.

변경 통지
- 정책 변경 시 README 및 본 문서 갱신.

문의: privacy@soksol.invalid (placeholder)
