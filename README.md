# SokSol (속솔)

익명 AI 멘탈 케어 웹/모바일 프로젝트

## 0. 프로젝트 개요
- 목표: 사용자의 마음 고민을 익명으로 털어놓고 비워내며 스스로 정리하도록 돕는 AI 동반자
- 철학: 비움(저장 안 함) · 판단 없는 경청 · 마음의 성장
- 비저장 정책: 서버 / 클라이언트에 대화 로그 영구 저장 없음 (임시 메모리 렌더링만)

## 1. 모노레포 구조
```
./
  src/app/              # Next.js (웹)
  mobile/soksol_mobile/  # 실제 React Native 프로젝트 (WebView 패키징)
  public/                # 웹 정적 자산
  .env.local.example     # 환경 변수 예시
  README.md              # (현재 문서)
```

## 2. 기술 스택 & 버전
웹(Next.js)
- Next.js: 15.4.6 (App Router)
- React: 19.1.0
- TypeScript: ^5
- Tailwind CSS v4 (inline @import 방식)
- Gemini Client: @google/generative-ai
- 실행: Turbopack dev 서버

모바일(React Native)
- React Native: 0.81.0
- React: 19.1.0
- WebView: react-native-webview ^13.15.0
- CLI: @react-native-community/cli 20.0.0
- TypeScript: ^5.8.x (템플릿)

## 3. 환경 변수
`.env.local`
```
GEMINI_API_KEY=YOUR_KEY
```
Vercel 배포 시 동일 키 추가.

## 4. 구현 단계 진행 상황
| 단계 | 내용 | 상태 |
|------|------|------|
| 1차 | 랜딩 / 챗 UI 기본 / 더미 API | 완료 |
| 2차 | Gemini 연동, 로딩, 시스템 프롬프트 | 완료 |
| 3차 | RN 프로젝트 생성, WebView 포장, 세로 고정 | 진행 중 (기본 구조 완료) |
| 3차-남음 | 아이콘/스플래시, 서명, 릴리스 빌드, 스토어 자료 준비 | TODO |

## 5. 시스템 프롬프트 (요약)
```
- 판단/비난/진단 대신 공감 & 감정 반영 & 개방형 질문
- 개인정보 저장/수집하지 않음 상기
- 위험 징후 시 전문 도움 권유
- 3~6문장 따뜻하고 명료
```

## 6. 주요 파일 설명
- `src/app/api/chat/route.ts`: Gemini `gemini-pro` 모델 호출. 마지막 user 메시지와 시스템 프롬프트 결합.
- `src/app/chat/page.tsx`: 클라이언트 컴포넌트. 메시지 상태, 로딩 토글, fetch POST.
- `soksol_mobile/App.tsx`: 배포된 웹 URL(WebView) 로드 + ActivityIndicator.

## 7. 품질 / 보안 주안점
- 대화 저장 금지: 서버에서 DB/파일 I/O 없음.
- 에러 시 민감 텍스트 로그 최소화 (현재 console.error 사용 – 운영 배포 시 Sentry 등 적용 시 PII 필터 필요)
- 모델 호출 실패 시 일반적 오류 메시지 반환.

## 8. 향후 작업(우선순위 순)
1. (모바일) 아이콘 / adaptive icon 제작 및 리소스 교체 (scripts/icon-generate.sh 참고 예정) ✅ 스크립트 추가됨 (`scripts/generate-icons.sh`)
2. Splash Screen (선택) – 브랜드 컬러 그라데이션 or 흰 배경 로고 (기본 흰 배경 + 아이콘 적용 대기)
3. Gradle signing 설정 + .gitignore 키 제외 (문서화 완료)
4. Release 빌드 테스트 (real device)
5. 웹 성능/메타: Open Graph 이미지 (og.png 완료), PWA (manifest + next-pwa 설정 완료)
6. 안전 가이드 문구 추가 (footer 반영 완료 + 챗 첫 진입 1회성 위기 안내 배너 추가)
7. Gemini 응답 토큰/비용 모니터링 방안 문서화 (TODO)
8. 간단 사용자 피드백 컴포넌트 (비저장 단발성, 선택적)
9. Rate Limit(간단 in-memory) 적용하여 API 남용 방지 ✅

## 9. 배포
- 웹: Vercel (현재 수동 설정 필요) → Production URL 확정 후 RN `WEB_URL` 치환
- 모바일: AAB 생성 → Play Console 업로드 → 콘텐츠 등급 설문, 개인정보 처리(수집 없음), 카테고리(Health & Fitness - Mental Wellness?)

## 10. 개발 실행 요약
웹:
```bash
npm install
npm run dev
```
모바일(Android):
```bash
cd soksol_mobile
npm install
npx react-native run-android
```

## 11. 참고 체크리스트 (Play Store)
- 패키지명: com.soksol.app
- 앱명: 속솔
- 최소 설명 키워드: 익명, 비저장, AI 경청, 마음 정리
- 민감성 고지: 의료진 대체 아님, 위기 시 긴급 도움 안내

## 12. 라이선스 & 저작권
© {YEAR} SokSol. All rights reserved.

## 13. 테스트 (최소 검증)
웹(Next.js)
- Jest 환경 구성 (`jest.config.js`, `jest.setup.js`).
- `.env.test` 파일을 통해 `GEMINI_API_KEY` 로딩 여부를 검사하는 단일 테스트 (`__tests__/env.test.ts`).
- 목적: 배포 전 환경 변수 누락으로 인한 런타임 오류 조기 감지.

작성/실행 예시:
```bash
# .env.test 생성 (CI 용)
echo "GEMINI_API_KEY=dummy" > .env.test
npm run test
```

모바일(React Native)
- 기본 템플릿 렌더링 테스트(`mobile/soksol_mobile/__tests__/App.test.tsx`) 유지.
- WebView 래퍼(`soksol_mobile/App.tsx`)는 현재 간단하여 별도 스냅샷 불필요 (필요 시 추후 추가).

확장 아이디어(추가 미구현):
- 챗 API route 모킹 후 응답 포맷 검증.
- 시스템 프롬프트 규칙 위반 여부 간단 정적 검사.

추가 주석:
- `soksol_mobile/` 폴더는 TypeScript `exclude` 처리됨. 실제 모바일 변경은 `mobile/soksol_mobile/` 만 사용.

## 14. 신규 메타 & 안전 안내
- `public/og.png` 추가 및 `layout.tsx` 메타(`openGraph.images`, `twitter`) 설정.
- Footer 에 위기 대응 안내 번호(112 / 1393 등) 및 비의료 서비스 고지 추가.

## 15. 모바일 아이콘 / 스플래시 자동화(초안)
`scripts/generate-icons.sh` (추가 예정) 예시 계획:
```
#!/usr/bin/env bash
# 요구: ImageMagick, inkscape (SVG → PNG), base source: assets/logo.svg
set -e
SRC=assets/logo.png
ANDROID_RES=mobile/soksol_mobile/android/app/src/main/res
# Adaptive icon foreground/background (foreground 432x432 dp in 1080x1080)
convert $SRC -resize 432x432 tmp_fore.png
convert $SRC -resize 1080x1080 tmp_full.png
# Example outputs
sizes=(48 72 96 144 192)
for s in "${sizes[@]}"; do
  mkdir -p "$ANDROID_RES/mipmap-${s}dpi" || true
  convert $SRC -resize ${s}x${s} "$ANDROID_RES/mipmap-${s}dpi/ic_launcher.png"
  cp "$ANDROID_RES/mipmap-${s}dpi/ic_launcher.png" "$ANDROID_RES/mipmap-${s}dpi/ic_launcher_round.png"
done
rm -f tmp_fore.png tmp_full.png
```
Splash(안드로이드 12+): `values/styles.xml` 또는 `drawable/splash_background.xml` 추가 후 theme 속성 `android:windowSplashScreenBackground` 설정.

실제 스크립트/리소스는 추후 `assets/branding/` 생성 후 반영.

### 실제 스크립트 사용
```bash
chmod +x scripts/generate-icons.sh
./scripts/generate-icons.sh assets/branding/logo.png
```
생성:
- PWA: `public/icons/icon-192.png`, `icon-512.png`
- Android: 각 `mipmap-*dpi/` ic_launcher* 갱신 (필요 시 git diff 확인)

## 16. PWA 구성
- `next-pwa` + `next.config.ts` 래핑 (개발 모드 자동 비활성)
- `public/manifest.json` 작성
- `layout.tsx`에 `<link rel="manifest">`, meta theme-color 추가
- runtimeCaching 전략 (`next.config.ts`):
  - google-fonts: CacheFirst 1년
  - next-image: StaleWhileRevalidate 30일
  - next-static: CacheFirst 30일
  - api/chat: NetworkOnly (캐싱 금지)
  - misc fallback: StaleWhileRevalidate 7일

## 17. API Rate Limiting
간단한 in-memory (IP 기준 1분 10회). 서버리스/다중 인스턴스 배포 시 외부 스토리지/Edge KV 필요 (정책상 미사용).

## 18. 챗 위기 안내 1회성 배너
- `sessionStorage` key: `soksol_crisis_shown`
- 첫 방문에만 렌더링, 닫기 버튼 제공.

## 19. Splash / Branding 업데이트
- Android Splash: `drawable/splash_background.xml` (그라데이션) + `styles.xml` 에 적용
- 로고 소스: `assets/branding/logo.svg` (SVG → PNG 변환 가능)
- 아이콘 스크립트: `scripts/generate-icons.sh` (ImageMagick 필요). 환경 미설치 시 에러 출력.

## 20. Gemini 호출 안정성
- AbortController 기반 15초 타임아웃 → 504 처리
- 오류 로깅 시 PII 최소화 (`safeLogError`) – 메시지 내용 전문 미저장/미출력

## 21. 오류 모니터링 (준비)
- `@sentry/nextjs` 설치 및 `sentry.client.config.ts`, `sentry.server.config.ts` 생성
- PII/채팅 내용 제거: beforeSend/ beforeBreadcrumb 에서 body 삭제 및 URL path만 유지
- 환경 변수: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` (예: .env.local) – 현재 비어있으면 비활성

## 22. 추가 보안 / 안정화 정리
현재 적용됨:
- CSP(Content-Security-Policy) 헤더 (self 제한, 외부 최소 허용)
- HSTS (Strict-Transport-Security 2년 + preload)
- X-Frame-Options DENY (클릭재킹 방지)
- Referrer-Policy strict-origin-when-cross-origin
- X-Content-Type-Options nosniff
- Permissions-Policy 최소화(camera/mic/geolocation 비활성)
- PWA service worker: API(NetworkOnly) / 정적 자산 캐시 분리
- In-memory rate limit + 소프트 지연(jitter)
- Gemini 호출 타임아웃 및 오류 범주화
- Sentry 설정 (DSN 없으면 비활성, body 제거)
- 사용자 입력 저장/캐시 금지 정책 반영

추가 고려 가능(선택):
- nonce 기반 CSP script-src 강화 (빌드 시 헤더 삽입 로직 확장 필요)
- Helmet 대체: Next headers()로 이미 대부분 커버 → 유지보수 단일화 위해 추가 패키지 미사용
- API abuse 추가 보호: user-agent 패턴/빈도 필터 (저장 없는 메모리 룰)
- Gemini 호출 재시도(backoff) 로직 (idempotent 안전 범위 내)
- 모바일 WebView SSL pinning (추후 필요 시 네이티브 코드 추가)

위 사항은 현재 서비스 철학(비저장, 최소 데이터)에 부합하도록 외부 저장 불필요 구성.

---
(문서 자동 생성: Phase 3 진행 중 상태 요약)
