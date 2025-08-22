# API 문서

## 개요

SokSol API는 Google Gemini를 활용한 AI 채팅 서비스를 제공합니다. 무저장 정책에 따라 사용자 데이터를 저장하지 않으며, 강력한 보안 정책을 적용합니다.

## 기본 정보

- **Base URL**: `https://soksol.vercel.app/api`
- **Content-Type**: `application/json`
- **Rate Limit**: IP당 1분에 10회
- **Timeout**: 20초

## 인증

현재 API는 인증이 필요하지 않습니다. 모든 요청은 익명으로 처리됩니다.

## 엔드포인트

### POST /api/chat

AI와의 채팅 메시지를 처리합니다.

#### 요청

```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "안녕하세요, 오늘 기분이 좋지 않아요."
    }
  ]
}
```

#### 요청 파라미터

| 필드               | 타입   | 필수 | 설명                                  |
| ------------------ | ------ | ---- | ------------------------------------- |
| messages           | Array  | ✅   | 메시지 배열                           |
| messages[].role    | String | ✅   | 메시지 역할 ("user" 또는 "assistant") |
| messages[].content | String | ✅   | 메시지 내용                           |

#### 요청 제한

- **메시지 개수**: 최대 50개
- **메시지 길이**: 개별 메시지 최대 2000자
- **총 크기**: 전체 요청 최대 20KB
- **URL 포함**: 허용되지 않음

#### 성공 응답

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
X-Data-Retention: none

{
  "reply": "안녕하세요. 오늘 기분이 좋지 않으시다니 마음이 아프네요. 어떤 일이 있으셨는지 편하게 이야기해보시겠어요? 혼자 감당하기 힘든 감정들을 나누는 것만으로도 조금은 마음이 가벼워질 수 있어요."
}
```

#### 에러 응답

##### 400 Bad Request - 잘못된 요청

```json
{
  "errorCode": "VALIDATION",
  "message": "요청이 올바르지 않습니다."
}
```

**에러 코드 목록**:

- `EMPTY`: 메시지가 비어있음
- `TOO_MANY`: 메시지가 너무 많음 (50개 초과)
- `TOO_LONG`: 메시지가 너무 김 (2000자 또는 20KB 초과)
- `URL_BLOCKED`: URL 포함 불허
- `BLOCKED_UA`: 허용되지 않는 클라이언트

##### 429 Too Many Requests - Rate Limit 초과

```json
{
  "errorCode": "RATE_LIMIT",
  "message": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
}
```

##### 500 Internal Server Error - 서버 오류

```json
{
  "errorCode": "INTERNAL",
  "message": "서버 오류가 발생했습니다. 다시 시도해주세요."
}
```

**서버 에러 코드 목록**:

- `TIMEOUT`: 요청 시간 초과
- `QUOTA_EXCEEDED`: API 사용량 초과
- `AUTH`: API 인증 문제
- `MODEL_NOT_FOUND`: AI 모델 문제
- `INTERNAL`: 기타 서버 오류

### GET /privacy-check

캐시 비사용을 검증하기 위한 실시간 서버 타임스탬프를 제공합니다.

#### 요청

```http
GET /privacy-check
```

#### 응답

```http
HTTP/1.1 200 OK
Content-Type: text/html
Cache-Control: no-store, no-cache, must-revalidate

<!DOCTYPE html>
<html>
<head>
    <title>캐시 비사용 검증</title>
</head>
<body>
    <h1>실시간 서버 시간</h1>
    <p>2025-08-22T15:30:45.123Z</p>
    <p>새로고침할 때마다 시간이 변경되면 캐시가 비활성화된 것입니다.</p>
</body>
</html>
```

## 보안 정책

### 헤더

모든 API 응답에는 다음 보안 헤더가 포함됩니다:

```http
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
X-Data-Retention: none
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### Rate Limiting

- **제한**: IP당 1분에 10회
- **윈도우**: 슬라이딩 윈도우 방식
- **지연**: 70% 사용량 초과 시 점진적 지연 적용
- **알고리즘**: 메모리 기반 (서버리스 환경)

### 입력 검증

모든 사용자 입력은 다음 검증을 거칩니다:

1. **메시지 개수 검증**: 최대 50개
2. **길이 검증**: 개별 메시지 2000자, 전체 20KB
3. **URL 필터링**: 정규식 기반 URL 차단
4. **User-Agent 필터링**: 자동화 도구 차단

## 에러 처리

### 재시도 정책

- **재시도 횟수**: 최대 2회
- **대상 에러**: 타임아웃, 429, quota 초과 등 일시적 오류
- **백오프**: 지수 백오프 + 지터 (300ms \* attempts + random)

### 로깅 정책

- **사용자 메시지**: 로그에 저장하지 않음
- **에러 메시지**: 200자로 제한
- **개인정보**: 완전 제거

## 사용 예시

### JavaScript (Fetch)

```javascript
async function sendMessage(userMessage) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Chat API Error:", error.message);
    throw error;
  }
}

// 사용
sendMessage("안녕하세요")
  .then((reply) => console.log("AI 응답:", reply))
  .catch((error) => console.error("에러:", error.message));
```

### cURL

```bash
# 정상 요청
curl -X POST https://soksol.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "안녕하세요"
      }
    ]
  }'

# 응답
{
  "reply": "안녕하세요! 오늘은 어떤 이야기를 나누고 싶으신가요?"
}
```

### Python

```python
import requests
import json

def send_message(message):
    url = "https://soksol.vercel.app/api/chat"
    payload = {
        "messages": [
            {"role": "user", "content": message}
        ]
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        return response.json()["reply"]
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        return None

# 사용
reply = send_message("안녕하세요")
if reply:
    print(f"AI 응답: {reply}")
```

## 모니터링

### 성능 메트릭

- **응답 시간**: P50, P95, P99 추적
- **성공률**: 2xx 응답 비율
- **에러율**: 4xx, 5xx 응답 비율
- **Gemini API 지연**: 외부 API 호출 시간

### 사용량 통계

- **요청 수**: 시간당/일간 요청 통계
- **Rate Limit**: 제한 도달 빈도
- **지역별 사용량**: CDN 기반 지역 분석

## 제한사항

### 현재 제한사항

1. **상태 저장 없음**: 대화 컨텍스트 유지 불가
2. **단일 턴**: 이전 대화 기록 참조 불가
3. **파일 업로드**: 텍스트만 지원
4. **실시간**: WebSocket 미지원

### 향후 개선 계획

1. **세션 기반 컨텍스트**: 임시 메모리 기반 대화 유지
2. **스트리밍**: 실시간 응답 스트리밍
3. **다국어**: 영어 등 다양한 언어 지원
4. **모달리티**: 이미지, 음성 입력 지원

이 API는 프라이버시와 보안을 최우선으로 설계되었으며, 사용자 데이터를 저장하지 않는 것이 핵심 특징입니다.
