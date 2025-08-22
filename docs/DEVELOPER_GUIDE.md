# 개발자 가이드

## 프로젝트 복제 및 설정

### 1. 저장소 클론

```bash
git clone https://github.com/your-repo/soksol.git
cd soksol
```

### 2. 환경 설정

```bash
# 환경변수 파일 생성
cp .env.local.example .env.local

# .env.local 파일에서 실제 API 키 설정
# GEMINI_API_KEY=your_actual_api_key
```

### 3. 의존성 설치

```bash
# 웹앱 의존성 설치
npm install

# 모바일 앱 의존성 설치 (Android 개발 시)
cd mobile/soksol_mobile/SokSol
npm install
cd ../../../
```

### 4. 개발 서버 실행

```bash
# 웹앱 개발 서버
npm run dev

# 모바일 앱 (별도 터미널)
cd mobile/soksol_mobile/SokSol
npx react-native run-android
```

## 핵심 아키텍처

### 기술 스택

- **Frontend**: Next.js 15.4.6 (App Router) + React 19.1.0
- **Styling**: Tailwind CSS v4
- **AI**: Google Gemini API (@google/genai)
- **Mobile**: React Native 0.81.0 + WebView
- **Deployment**: Vercel (웹), Android APK/AAB (모바일)

### 프로젝트 구조

```
soksol/
├── src/app/                    # Next.js 앱 라우터
│   ├── api/chat/route.ts      # Gemini API 엔드포인트
│   ├── chat/page.tsx          # 채팅 인터페이스
│   ├── privacy/page.tsx       # 개인정보처리방침
│   └── privacy-check/page.tsx # 캐시 비사용 검증
├── mobile/soksol_mobile/SokSol/ # React Native 앱
│   ├── App.tsx                # WebView 래퍼
│   └── android/               # 안드로이드 설정
├── scripts/                   # 빌드/보안 스크립트
├── docs/                      # 추가 문서
└── public/                    # 정적 자산
```

## 핵심 기능 구현

### 1. AI 채팅 시스템

**파일**: `src/app/api/chat/route.ts`

**핵심 설계 원칙**:

- **무저장 정책**: 채팅 데이터를 서버에 저장하지 않음
- **프라이버시 우선**: 모든 응답에 `no-store` 헤더 적용
- **안정성**: 재시도 로직, 타임아웃, 에러 분류

**주요 기능**:

```typescript
// 시스템 프롬프트
const SYSTEM_PROMPT = `판단/비난/진단 대신 공감 & 감정 반영...`;

// 무저장 헤더 적용
function withNoStoreHeaders(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("X-Data-Retention", "none");
  return res;
}

// Rate Limiting (메모리 기반)
function rateLimitConsume(ip: string) {
  // 슬라이딩 윈도우 + 점진적 지연
}
```

### 2. 모바일 WebView 래퍼

**파일**: `mobile/soksol_mobile/SokSol/App.tsx`

**보안 설정**:

```tsx
<WebView
  source={{ uri: "https://soksol.vercel.app" }}
  cacheEnabled={false} // 캐시 비활성화
  incognito // 시크릿 모드
  mixedContentMode="never" // HTTPS 강제
/>
```

### 3. 입력 검증 시스템

**파일**: `src/lib/validateMessages.ts`

**검증 규칙**:

- 메시지 개수 제한 (최대 50개)
- 개별 메시지 길이 제한 (2000자)
- 총 메시지 크기 제한 (20KB)
- URL 포함 차단

## 보안 구현

### 1. 헤더 기반 보안

```typescript
// CSP, HSTS, X-Frame-Options 등 적용
const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'...",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
};
```

### 2. Rate Limiting

```typescript
// 메모리 기반 슬라이딩 윈도우
const RATE_LIMIT = { windowMs: 60_000, max: 10 };
// IP당 1분에 10회 제한
```

### 3. 에러 처리

```typescript
function safeLogError(e: unknown) {
  // PII 제거된 에러 로깅
  const msg = asMessage(e).substring(0, 200);
  console.error("[chat-api-error]", msg);
}
```

## 배포 가이드

### 웹앱 배포 (Vercel)

1. **저장소 연결**: Vercel에서 GitHub 저장소 연결
2. **환경변수 설정**: `GEMINI_API_KEY` 등록
3. **자동 배포**: main/dev 브랜치 푸시 시 자동 배포

### 모바일 앱 배포 (Android)

1. **키스토어 생성**:

   ```bash
   keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-release-key
   ```

2. **빌드 스크립트 실행**:

   ```bash
   bash scripts/build-android-release.sh
   ```

3. **AAB 파일 생성**: `android/app/build/outputs/bundle/release/app-release.aab`

## 테스트 전략

### 단위 테스트

```bash
npm test                    # Jest 테스트 실행
npm run test:ci            # CI 환경 테스트
```

### 보안 테스트

```bash
npm run scan:secrets       # 시크릿 스캔
node scripts/check-secrets.js  # 환경변수 검증
npm audit                  # 취약점 검사
```

### 통합 테스트

```bash
# 웹앱 빌드 테스트
npm run build

# 모바일 빌드 테스트
cd mobile/soksol_mobile/SokSol
./gradlew bundleRelease
```

## 모니터링 및 로깅

### Sentry 설정

```typescript
// PII 제거 필터
beforeSend(event) {
  if (event.request?.data) {
    delete event.request.data; // 채팅 데이터 제거
  }
  return event;
}
```

### 성능 모니터링

- Core Web Vitals 추적
- API 응답 시간 모니터링
- 에러율 추적

## 개발 워크플로

### 1. 기능 개발

```bash
git checkout -b feature/new-feature
# 개발 진행
npm test                   # 테스트
npm run lint              # 코드 검사
git commit -m "feat: add new feature"
```

### 2. 보안 검증

```bash
npm run scan:secrets      # 시크릿 누출 검사
node scripts/check-secrets.js  # 환경변수 검증
```

### 3. 배포 준비

```bash
npm run build             # 프로덕션 빌드
# Vercel에 배포 시 모바일 앱 URL 업데이트
```

## 문제 해결

상세한 트러블슈팅 가이드는 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참조하세요.

### 자주 발생하는 문제

1. **SSL 인증서 오류**: 모바일 앱 URL 확인
2. **환경변수 누락**: `.env.local` 파일 확인
3. **빌드 실패**: 의존성 버전 호환성 확인

## 기여 가이드

### 코드 스타일

- ESLint + Prettier 사용
- TypeScript strict 모드
- 컴포넌트명은 PascalCase

### 커밋 메시지

- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서 업데이트
- `style:` 코드 스타일 변경
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정

### Pull Request

- 기능별로 작은 단위로 분할
- 테스트 커버리지 유지
- 보안 검증 통과 필수
