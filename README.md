# SokSol (속솔)

익명 AI 멘탈 케어 웹/모바일 프로젝트

## 📋 프로젝트 개요

**SokSol(속솔)**은 사용자가 마음의 고민을 익명으로 털어놓고 AI와 대화하며 스스로를 정리할 수 있도록 돕는 멘탈케어 서비스입니다.

### 핵심 철학

- **비움(無저장)**: 서버나 클라이언트에 대화 로그를 영구 저장하지 않음
- **판단 없는 경청**: AI가 사용자를 판단하지 않고 공감하며 경청
- **마음의 성장**: 스스로 답을 찾아가는 과정을 지원

### 주요 특징

- 🔒 **완전 익명**: 회원가입, 로그인 불필요
- 🚫 **무저장 정책**: 대화 내용 서버 저장 안함
- 📱 **크로스 플랫폼**: 웹 + 안드로이드 앱 지원
- 🛡️ **보안 강화**: 다층 보안 설정 및 검증 시스템
- ⚡ **실시간 AI**: Google Gemini 기반 즉시 응답

## 🏗️ 기술 스택

### 웹앱 (Next.js)

- **Framework**: Next.js 15.4.6 (App Router)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4
- **AI**: Google Gemini API (@google/genai 0.8.0)
- **Deployment**: Vercel

### 모바일 앱 (React Native)

- **Framework**: React Native 0.81.0
- **WebView**: react-native-webview 13.15.0
- **Platform**: Android (iOS 지원 준비됨)
- **Build**: Gradle + AAB/APK

### 보안 & 모니터링

- **Error Tracking**: Sentry (PII 필터링)
- **Security**: CSP, HSTS, Rate Limiting
- **CI/CD**: GitHub Actions (보안 스캔, 테스트)

## 🚀 빠른 시작

### 필수 요구사항

- Node.js ≥ 18
- npm 또는 yarn
- Android Studio (모바일 개발 시)
- Python 3.6+ (자동화 스크립트용)

### 설치 및 실행

1. **저장소 클론**

```bash
git clone https://github.com/your-repo/soksol.git
cd soksol
```

2. **환경 설정**

```bash
# 환경변수 파일 생성
cp .env.local.example .env.local

# .env.local에서 Gemini API 키 설정
# GEMINI_API_KEY=your_actual_api_key
```

3. **의존성 설치 및 실행**

```bash
# 웹앱
npm install
npm run dev

# 모바일 앱 (별도 터미널)
cd mobile/soksol_mobile/SokSol
npm install
npx react-native run-android
```

4. **접속**

- 웹: http://localhost:3000
- 모바일: 에뮬레이터 또는 실기기에서 앱 실행

## 📱 Play Store 제출 준비

### 자동화된 준비 과정

```bash
# 전체 Play Store 제출 준비 (권장)
python scripts/master-prep.py

# 개별 단계별 실행
python scripts/playstore-prep.py        # 환경 및 프로젝트 검증
python scripts/convert-svg-to-png.py    # 아이콘 변환
python scripts/screenshot-automation.py # 스크린샷 촬영
python scripts/qa-validator.py          # 최종 QA 검증
```

### 빌드 및 배포

```bash
# Android AAB 빌드 (Play Store용)
bash scripts/build-android-release.sh bundle

# APK 빌드 (테스트용)
bash scripts/build-android-release.sh apk

# 둘 다 빌드
bash scripts/build-android-release.sh both
```

### 필수 문서

프로젝트에는 Play Store 제출을 위한 모든 문서가 자동 생성됩니다:

- `STORE_MATERIALS.md` - 앱 설명, 키워드, 카테고리
- `PLAY_STORE_COMPLIANCE.md` - 정책 준수 상태
- `PLAY_CONSOLE_GUIDE.md` - Console 설정 가이드
- `SCREENSHOT_GUIDE.md` - 스크린샷 촬영 가이드
- `RELEASE_CHECKLIST.md` - 최종 체크리스트
- `QA_REPORT.md` - 품질 검증 결과

## 📁 프로젝트 구조

```
soksol/
├── src/app/                     # Next.js 앱 라우터
│   ├── api/chat/route.ts       # AI 채팅 API 엔드포인트
│   ├── chat/page.tsx           # 채팅 인터페이스
│   ├── privacy/page.tsx        # 개인정보처리방침
│   ├── privacy-check/page.tsx  # 캐시 비사용 검증
│   └── layout.tsx              # 루트 레이아웃, 보안 헤더
├── mobile/soksol_mobile/SokSol/ # React Native WebView 래퍼
│   ├── App.tsx                 # 메인 앱 컴포넌트
│   └── android/                # 안드로이드 빌드 설정
├── scripts/                    # 빌드 및 보안 스크립트
│   ├── build-android-release.sh # 안드로이드 릴리스 빌드
│   ├── check-secrets.js        # 시크릿 검증
│   └── generate-icons.sh       # 아이콘 생성
├── docs/                       # 문서
│   └── SECURITY-CHECKLIST.md   # 보안 체크리스트
├── public/                     # 정적 자산
└── .github/workflows/          # CI/CD 파이프라인
```

## 🔧 개발 스크립트

```bash
# 개발
npm run dev              # 개발 서버 (Turbopack)
npm run build           # 프로덕션 빌드
npm run start           # 프로덕션 서버

# 테스트 & 품질
npm test                # Jest 테스트
npm run lint            # ESLint 검사
npm run scan:secrets    # 시크릿 스캔 (gitleaks)

# 보안 검증
node scripts/check-secrets.js  # 환경변수 검증
npm audit                      # 취약점 검사

# 모바일 빌드
npm run build:android:release  # 안드로이드 릴리스 빌드
```

## 🛡️ 보안 구현

### API 보안

- **Rate Limiting**: IP당 1분에 10회 제한
- **입력 검증**: 메시지 길이, 개수, URL 차단
- **에러 분류**: 내부 정보 노출 방지
- **User-Agent 필터링**: 자동화 도구 차단

### 데이터 보안

- **무저장 정책**: 채팅 데이터 서버 저장 안함
- **no-store 헤더**: 모든 API 응답에 캐시 방지
- **PII 보호**: 로그에서 개인정보 제거

### 통신 보안

- **HTTPS 강제**: HSTS 헤더 적용
- **CSP**: Content Security Policy 설정
- **프레임 보호**: X-Frame-Options DENY

## 📱 모바일 앱 정보

### 현재 상태

- ✅ React Native WebView 래퍼 완성
- ✅ 보안 설정 적용 (incognito, cache 비활성화)
- ✅ 안드로이드 빌드 스크립트 준비
- ✅ 릴리스 키스토어 설정 (git 제외)

### WebView 설정

```tsx
<WebView
  source={{ uri: "https://soksol.vercel.app" }}
  cacheEnabled={false} // 캐시 비활성화
  incognito // 시크릿 모드
  mixedContentMode="never" // HTTPS 강제
  javaScriptEnabled // JavaScript 허용
  domStorageEnabled // 필요한 저장소만 허용
/>
```

## 🔍 실제 발생 문제 및 해결

### SSL 호스트네임 불일치 (해결됨)

**문제**: 모바일 앱에서 "SSL error: hostname mismatch" 발생
**원인**: 앱에서 `https://soksol.com` 설정, 실제 배포는 `https://soksol.vercel.app`
**해결**: App.tsx의 URL을 실제 배포 주소로 수정

### Git 서브모듈 오류 (해결됨)

**문제**: 모바일 폴더가 서브모듈로 인식되어 파일 추가 실패
**해결**: `git rm --cached` 후 일반 폴더로 재추가

### 보안 키스토어 관리 (해결됨)

**문제**: 릴리스 키스토어가 git에 노출될 위험
**해결**: .gitignore에 포괄적인 키스토어 제외 규칙 추가

자세한 내용은 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 참조

## 📊 현재 구현 상태

| 기능            | 웹앱 | 모바일 | 상태    |
| --------------- | ---- | ------ | ------- |
| AI 채팅         | ✅   | ✅     | 완료    |
| 무저장 정책     | ✅   | ✅     | 완료    |
| 보안 헤더       | ✅   | ✅     | 완료    |
| Rate Limiting   | ✅   | ✅     | 완료    |
| 에러 처리       | ✅   | ✅     | 완료    |
| PWA 지원        | ✅   | N/A    | 완료    |
| 안드로이드 빌드 | N/A  | ✅     | 완료    |
| 스토어 배포     | N/A  | 🔄     | 준비 중 |

## 🎯 배포 정보

### 웹앱

- **Production**: https://soksol.vercel.app
- **Platform**: Vercel
- **Environment**: `GEMINI_API_KEY` 필요

### 모바일 앱

- **Package**: com.soksol
- **Target**: Android 8.0+ (API 26+)
- **Build**: AAB (Play Store) + APK (사이드로딩)

## 📚 문서 위치 안내

- 모든 주요 문서는 `docs/` 폴더에 있습니다.
- 예시: [docs/QUICK_START_GUIDE.md](docs/QUICK_START_GUIDE.md)

- [개발자 가이드](./docs/DEVELOPER_GUIDE.md) - 상세한 개발 및 기여 가이드
- [아키텍처 문서](./docs/ARCHITECTURE.md) - 시스템 설계 및 구조
- [트러블슈팅](./docs/TROUBLESHOOTING.md) - 실제 문제 해결 사례
- [보안 정책](./docs/SECURITY.md) - 보안 구현 및 정책
- [개인정보 처리방침](./docs/PRIVACY.md) - 프라이버시 정책

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/new-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add new feature'`)
4. 브랜치 푸시 (`git push origin feature/new-feature`)
5. Pull Request 생성

### 커밋 컨벤션

- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서 업데이트
- `style:` 코드 스타일 변경
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드/도구 변경

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## 📞 연락처

- **이슈 리포트**: GitHub Issues
- **보안 문제**: security@soksol.invalid (placeholder)
- **개인정보 문의**: privacy@soksol.invalid (placeholder)

---

_"마음을 비우고, 스스로를 찾아가는 여정을 함께합니다."_

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
- Android: 각 `mipmap-*dpi/` ic_launcher\* 갱신 (필요 시 git diff 확인)

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
- PII/채팅 내용 제거: beforeSend/breadcrumb 훅을 두어 요청 body(채팅 내용) 제거 및 예외 메시지 길이 제한을 적용. DSN 미설정 시 비활성화되도록 설계.

## 22. 추가 보안 / 안정화 정리

현재 적용됨:

- CSP(Content-Security-Policy) 헤더 (self 제한, 외부 최소 허용)
- HSTS (Strict-Transport-Security 2년 + preload)
- X-Frame-Options DENY (클릭재킹 방지)
- Referrer-Policy strict-origin-when-cross-origin
- X-Content-Type-Options nosniff
- Permissions-Policy 최소화(camera/mic/geolocation 비활성)
- PWA service worker: API(NetworkOnly) / 정적 자산 캐시 분리 (chat 응답 no-store)
- In-memory rate limit + 소프트 지연(jitter)
- Gemini 호출 타임아웃 및 오류 범주화
- Sentry 설정 (DSN 없으면 비활성, body 제거)
- 사용자 입력 저장/캐시 금지 정책 반영 (/privacy-check로 검증 가능)

추가 고려 가능(선택):

- nonce 기반 CSP script-src 강화 (빌드 시 헤더 삽입 로직 확장 필요)
- Helmet 대체: Next headers()로 이미 대부분 커버 → 유지보수 단일화 위해 추가 패키지 미사용
- API abuse 추가 보호: user-agent 패턴/빈도 필터 (저장 없는 메모리 룰)
- Gemini 호출 재시도(backoff) 로직 (idempotent 안전 범위 내)
- 모바일 WebView SSL pinning (추후 필요 시 네이티브 코드 추가)

위 사항은 현재 서비스 철학(비저장, 최소 데이터)에 부합하도록 외부 저장 불필요 구성.

---

(문서 자동 생성: Phase 3 진행 중 상태 요약)

## Security

- CI runs security checks (gitleaks secret scan, npm audit) and tests via `.github/workflows/ci-security.yml`.
- See `docs/SECURITY-CHECKLIST.md` for recommended actions and runbook.

## Docker

Build and run locally:

- Build image: docker build -t soksol:latest .
- Run: docker run -p 3000:3000 --env-file .env.local --name soksol-app soksol:latest

Or with docker-compose:

- docker-compose up --build

Notes:

- For production in a real deploy, set NODE_ENV=production and provide required secrets via environment variables or secret manager.
- The Dockerfile runs the Next.js production server (npm start).

## 상세 업데이트 (보안 · CI · 배포 관련 변경 사항)

아래는 최근 적용된 보안 및 CI 개선의 상세 요약입니다. 배포 전 반드시 이 항목들을 점검하세요.

- .gitignore

  - `.env*` 전체 무시는 위험하여 로컬 비밀 파일들만 무시하도록 조정(`.env.local`, `.env`, `.env.*.local` 등). 예시 템플릿(`.env.local.example`, `.env.example`)은 추적(커밋)되도록 유지하여 실수로 템플릿을 지우거나 덮어쓰는 것을 방지함.

- Secrets 검사

  - `scripts/check-secrets.js` 추가: 로컬/CI에서 필수 시크릿 누락(또는 플레이스홀더) 여부를 검사. CI에 넣어 배포 전 필수 값 검사 권장.
  - CI 워크플로 `ci-secrets-check.yml` 보강: 포크 PR에서 시크릿 접근 불가 문제를 우회하는 guard 추가. Android keystore 시크릿은 "베이스64가 제공되면 나머지 값들도 모두 존재해야 함(all-or-none)" 규칙을 적용.

- CI 보안 파이프라인

  - `.github/workflows/ci-security.yml`: gitleaks 비밀 스캔, npm audit(허용 수준: moderate), Jest 테스트 실행을 포함. gitleaks/액션 로그 및 허위양성 여부는 주기적 검토 권장.
  - `.github/workflows/docker-build.yml`: Buildx로 이미지 빌드 후 Trivy 스캔, GHCR 푸시는 `GHCR_TOKEN` 유무에 따라 분기.

- Docker 이미지(주의사항)

  - Dockerfile은 멀티스테이지로 구성되어 있으나 `npm ci`를 사용하므로 `package-lock.json` 부재 시 빌드 실패 가능. 두 옵션: lockfile을 커밋하거나 Dockerfile을 `npm install --production`로 대체 권장.
  - HEALTHCHECK에 `curl` 사용: 베이스 이미지에 curl 미설치 시 헬스체크 실패 가능 → 이미지 빌드 시 `curl` 설치 추가 또는 Node 기반 헬스체크로 대체 권장.

- 로그·모니터링·PII 보호

  - Sentry 설정 파일(`sentry.server.config.ts`, `sentry.client.config.ts`)에 beforeSend/breadcrumb 훅을 두어 요청 body(채팅 내용) 제거 및 예외 메시지 길이 제한을 적용. DSN 미설정 시 비활성화되도록 설계.

- 사전 배포 필수 체크리스트 (MVP)

  1. GitHub Secrets 등록: `GEMINI_API_KEY` (필수). Android 릴리스 시 `ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`. 권장: `GHCR_TOKEN`, `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`.
  2. 브랜치 보호 규칙 설정: Require status checks에 `CI - Security & Tests`, `CI - Secrets Presence Check`, `Docker Build & Scan`(선택) 포함.
  3. 로컬 테스트: `npm test`, `node scripts/check-secrets.js`, `npm run scan:secrets`(gitleaks).
  4. Docker 이미지 테스트: `docker build -t soksol:local .` → 빌드 실패 시 Dockerfile 수정(위의 권장사항 참고).
  5. Sentry DSN 등록 후 테스트 이벤트 전송 및 beforeSend 동작 검증.

- 빠른 검증 명령들
  - 시크릿 체크: `node scripts/check-secrets.js`
  - 시크릿 스캔: `npm run scan:secrets`
  - 테스트: `npm test`
  - 로컬 도커 빌드: `docker build -t soksol:local .`
