# 아키텍처 설계 문서

## 시스템 개요

SokSol은 사용자의 마음 고민을 익명으로 상담할 수 있는 AI 기반 멘탈케어 서비스입니다. 핵심 설계 원칙은 **무저장(No Retention)**과 **프라이버시 우선**입니다.

## 아키텍처 다이어그램

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   모바일 앱      │    │    웹 브라우저    │    │   관리자 도구    │
│  (WebView)      │    │   (Next.js)     │    │   (Scripts)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Next.js 서버         │
                    │  ┌─────────────────────┐  │
                    │  │   API Routes        │  │
                    │  │  /api/chat          │  │
                    │  │  /privacy-check     │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │   미들웨어           │  │
                    │  │  Rate Limiting      │  │
                    │  │  Security Headers   │  │
                    │  └─────────────────────┘  │
                    └─────────────┬─────────────┘
                                  │
                         ┌────────┴────────┐
                         │   Google        │
                         │   Gemini API    │
                         └─────────────────┘
```

## 핵심 컴포넌트

### 1. 프론트엔드 (Next.js App Router)

#### 구조

```
src/app/
├── layout.tsx              # 루트 레이아웃, 메타데이터, 보안 헤더
├── page.tsx               # 랜딩 페이지
├── globals.css            # Tailwind CSS 글로벌 스타일
├── chat/
│   └── page.tsx          # 채팅 인터페이스 (클라이언트 컴포넌트)
├── privacy/
│   └── page.tsx          # 개인정보처리방침
├── privacy-check/
│   └── page.tsx          # 캐시 비사용 검증 페이지
└── api/
    └── chat/
        └── route.ts      # Gemini API 프록시
```

#### 주요 설계 결정

- **App Router 사용**: Next.js 13+ 최신 아키텍처
- **클라이언트/서버 컴포넌트 분리**: 상태 관리는 클라이언트, 데이터는 서버
- **TypeScript 엄격 모드**: 타입 안정성 보장

### 2. 백엔드 API (Next.js API Routes)

#### 핵심 엔드포인트

```typescript
// /api/chat - 채팅 API
POST /api/chat
Body: { messages: [{ role: string, content: string }] }
Response: { reply: string } | { errorCode: string, message: string }

// /privacy-check - 캐시 검증
GET /privacy-check
Response: 실시간 서버 타임스탬프 (캐시 미사용 증명)
```

#### 보안 계층

```typescript
// 1. Rate Limiting (메모리 기반)
const rateLimitConsume = (ip: string) => {
  // 슬라이딩 윈도우 + 점진적 지연
  // 1분에 10회 제한, 70% 이상 시 지연 적용
};

// 2. 입력 검증
const validateMessages = (messages) => {
  // 메시지 개수, 길이, 총 크기, URL 포함 검사
};

// 3. 에러 분류 및 안전 로깅
const classifyError = (error) => {
  // 에러 유형별 적절한 HTTP 상태코드 및 사용자 메시지 반환
};
```

### 3. AI 통합 (Google Gemini)

#### 호출 구조

```typescript
// 시스템 프롬프트 + 사용자 최신 메시지
const prompt = `${SYSTEM_PROMPT}\n사용자 최신 메시지: ${userLatest}`;

// 재시도 로직 (최대 2회)
const callGeminiWithRetry = async (prompt, attempts = 0) => {
  try {
    // 20초 타임아웃 설정
    const controller = new AbortController();
    const response = await client.generateContent(prompt);
    return extractTextFromResponse(response);
  } catch (error) {
    // 일시적 오류 시 재시도
    if (isTransientError(error) && attempts < 2) {
      await sleep(300 * (attempts + 1) + jitter);
      return callGeminiWithRetry(prompt, attempts + 1);
    }
    throw error;
  }
};
```

### 4. 모바일 앱 (React Native WebView)

#### 구조

```
mobile/soksol_mobile/SokSol/
├── App.tsx                # WebView 래퍼
├── android/              # 안드로이드 설정
│   ├── app/
│   │   ├── build.gradle  # 빌드 설정
│   │   └── src/main/     # 매니페스트, 리소스
│   └── gradle.properties # Gradle 설정
├── ios/                  # iOS 설정 (미사용)
└── package.json          # RN 의존성
```

#### WebView 보안 설정

```tsx
<WebView
  source={{ uri: "https://soksol.vercel.app" }}
  originWhitelist={["*"]} // 현재 모든 도메인 허용
  cacheEnabled={false} // 캐시 비활성화
  incognito // 시크릿 모드
  mixedContentMode="never" // HTTPS 강제
  javaScriptEnabled // JS 활성화 (필수)
  domStorageEnabled // 로컬 스토리지 허용
  startInLoadingState // 로딩 인디케이터
  allowsBackForwardNavigationGestures // 네비게이션 제스처
/>
```

## 데이터 흐름

### 채팅 요청 처리

```
1. 사용자 메시지 입력
   ↓
2. 클라이언트 상태 업데이트 (loading: true)
   ↓
3. POST /api/chat 요청
   ↓
4. Rate Limiting 검사
   ↓
5. 입력 검증 (메시지 수, 길이, URL 등)
   ↓
6. Gemini API 호출 (재시도 로직 포함)
   ↓
7. 응답 텍스트 추출 및 검증
   ↓
8. no-store 헤더와 함께 응답 반환
   ↓
9. 클라이언트에서 메시지 렌더링
   ↓
10. 상태 초기화 (loading: false, 메시지 배열 클리어)
```

### 무저장 정책 구현

```
1. 서버 측 저장소 없음
   - 데이터베이스 미사용
   - 파일 시스템 미사용
   - 로그에 메시지 내용 미포함

2. 클라이언트 캐시 방지
   - Cache-Control: no-store, no-cache, must-revalidate
   - Pragma: no-cache
   - Expires: 0
   - X-Data-Retention: none

3. 브라우저 저장소 최소 사용
   - sessionStorage: 위기 안내 1회성 플래그만
   - localStorage: 미사용
   - 쿠키: 미사용
```

## 보안 아키텍처

### 1. 네트워크 보안

```typescript
// HTTP 보안 헤더 (layout.tsx)
const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' fonts.gstatic.com",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
```

### 2. API 보안

```typescript
// User-Agent 필터링
const DISALLOWED_UA_PATTERNS = [/python-requests/i, /curl\/\d+/i, /wget/i];

// IP 기반 Rate Limiting
const RATE_LIMIT = {
  windowMs: 60_000, // 1분
  max: 10, // 최대 10회
};
```

### 3. 에러 처리 보안

```typescript
// PII 제거된 에러 로깅
function safeLogError(e: unknown) {
  const msg = asMessage(e).substring(0, 200); // 길이 제한
  console.error("[chat-api-error]", msg); // 메시지 내용 제외
}

// 분류된 에러 응답
function classifyError(e: unknown) {
  // 내부 에러 정보 노출 방지
  // 사용자에게는 일반적인 메시지만 반환
}
```

## 확장성 고려사항

### 현재 제약사항

1. **메모리 기반 Rate Limiting**: 단일 인스턴스에서만 작동
2. **Vercel Serverless**: 상태 공유 불가
3. **WebView 의존성**: 네이티브 기능 제한

### 확장 방안

1. **분산 Rate Limiting**: Redis 또는 Edge KV 활용
2. **마이크로서비스**: API와 웹앱 분리
3. **네이티브 기능**: React Native 모듈 추가

## 성능 최적화

### 1. 프론트엔드

- **Tailwind CSS v4**: JIT 컴파일러
- **Next.js Turbopack**: 빠른 개발 서버
- **Code Splitting**: 자동 페이지 분할

### 2. API

- **Connection Pool**: Gemini API 클라이언트 재사용
- **Timeout 설정**: 20초 제한으로 응답성 보장
- **Retry Logic**: 지수 백오프 적용

### 3. 모바일

- **WebView 최적화**: 캐시 비활성화로 메모리 절약
- **리소스 압축**: APK 크기 최소화

## 모니터링 및 관찰성

### 1. Sentry 통합

```typescript
// beforeSend 훅으로 PII 제거
beforeSend(event) {
  // 요청 body 제거 (채팅 내용 포함)
  if (event.request?.data) {
    delete event.request.data;
  }

  // 예외 메시지 길이 제한
  if (event.exception?.values) {
    event.exception.values.forEach(exception => {
      if (exception.value && exception.value.length > 200) {
        exception.value = exception.value.substring(0, 200) + '...';
      }
    });
  }

  return event;
}
```

### 2. 성능 메트릭

- **Core Web Vitals**: LCP, FID, CLS 추적
- **API 응답 시간**: Gemini 호출 지연 모니터링
- **에러율**: 5xx 응답 비율 추적

### 3. 사용자 분석

- **기능 사용률**: 채팅 세션 길이, 메시지 수
- **에러 패턴**: 자주 발생하는 에러 유형 분석
- **성능 병목**: 느린 API 호출 식별

## 배포 아키텍처

### 웹앱 (Vercel)

```
GitHub Repository
       ↓
   Vercel Build
       ↓
   Edge Network
   (전세계 CDN)
       ↓
   사용자 브라우저
```

### 모바일 앱 (Google Play)

```
로컬 개발 환경
       ↓
   Gradle 빌드
       ↓
   AAB 파일 생성
       ↓
   Google Play Console
       ↓
   사용자 디바이스
```

## 재해 복구 및 백업

### 데이터 복구

- **무저장 정책**으로 인해 복구할 데이터 없음
- **설정 백업**: 환경변수, 키스토어 파일

### 서비스 복구

1. **Vercel 장애 시**: 다른 호스팅 플랫폼으로 이전
2. **Gemini API 장애 시**: 다른 AI 모델로 교체
3. **모바일 앱 문제 시**: 웹 버전으로 우회 안내

이 아키텍처는 프라이버시와 보안을 최우선으로 하면서도 확장성과 유지보수성을 고려한 설계입니다.
