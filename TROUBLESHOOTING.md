# TROUBLESHOOTING

SokSol 프로젝트 개발 중 발생한 실제 문제들과 해결 방법 기록

## 1. 모바일 앱 WebView SSL 연결 문제

### 발생한 문제

안드로이드 앱에서 "Error loading Page" 오류 발생

- **에러 내용**: `domain: undefined, Error code: 2, description: SSL error : hostname mismatch`

### 원인 분석

모바일 앱(`App.tsx`)의 `WEB_URL` 설정이 실제 배포 도메인과 불일치

- **설정된 URL**: `https://soksol.com`
- **실제 배포 URL**: `https://soksol.vercel.app`

### 해결 과정

1. **문제 식별**: SSL 인증서 호스트네임 불일치 확인
2. **URL 확인**: 실제 배포된 웹사이트 주소 확인
3. **코드 수정**: `mobile/soksol_mobile/SokSol/App.tsx`에서 WEB_URL 변경

   ```tsx
   // 변경 전
   const WEB_URL = "https://soksol.com";

   // 변경 후
   const WEB_URL = "https://soksol.vercel.app";
   ```

### 교훈 및 예방책

- 배포 URL이 변경될 때마다 모바일 앱 설정도 함께 업데이트 필요
- 환경변수로 분리하여 관리하는 것을 고려
- 배포 전 실제 도메인 연결 테스트 필수

---

## 2. Git 서브모듈 설정 오류

### 발생한 문제

모바일 폴더를 git에 추가할 때 서브모듈 오류 발생

- **에러 내용**: `fatal: Pathspec 'mobile/soksol_mobile/SokSol' is in submodule 'mobile/soksol_mobile'`

### 원인 분석

`mobile/soksol_mobile` 폴더가 잘못된 서브모듈로 인식되어 일반 파일 추가 불가

### 해결 과정

1. **서브모듈 상태 확인**: `git submodule status`로 문제 확인
2. **서브모듈 캐시 제거**: `git rm --cached mobile/soksol_mobile`
3. **일반 폴더로 추가**: `git add mobile/soksol_mobile/SokSol`

### 교훈 및 예방책

- Git 서브모듈 설정 시 신중한 구조 설계 필요
- 서브모듈과 일반 폴더 혼용 시 충돌 가능성 고려

---

## 3. 보안 키스토어 파일 관리

### 발생한 문제

안드로이드 릴리스 키스토어 파일이 git에 노출될 위험

### 원인 분석

`mobile/soksol_mobile/SokSol/android/app/`에 다음 민감 파일들 존재:

- `my-release-key.keystore`
- `release-key.jks`

### 해결 과정

1. **보안 파일 식별**: 키스토어 파일 확인
2. **.gitignore 강화**: 포괄적인 키스토어 제외 규칙 추가
   ```
   # 보안: 키스토어 및 인증서 파일들 (매우 중요!)
   **/*.keystore
   **/*.jks
   /mobile/soksol_mobile/SokSol/android/app/*.keystore
   /mobile/soksol_mobile/SokSol/android/app/*.jks
   !mobile/soksol_mobile/SokSol/android/app/debug.keystore
   ```
3. **파일 상태 확인**: git status로 제외 확인

### 교훈 및 예방책

- 개발 초기부터 보안 파일 관리 정책 수립 필요
- debug.keystore는 포함, release 키스토어는 반드시 제외
- CI/CD에서 키스토어는 환경변수나 시크릿으로 관리

---

## 4. 의존성 패키지 버전 호환성

### 발생한 문제 (잠재적)

React Native와 Next.js 간 React 버전 불일치 가능성

### 현재 상태

- **Next.js**: React 19.1.0 사용
- **React Native**: React 19.1.0 사용
- **호환성**: 정상

### 예방 조치

1. **package.json 동기화**: 주요 의존성 버전 통일
2. **정기 업데이트**: 보안 패치 및 호환성 확인
3. **테스트 자동화**: CI에서 빌드 테스트 포함

---

## 5. WebView 보안 설정

### 설계 결정

WebView에서 보안 강화를 위한 설정 적용

### 적용된 설정

```tsx
<WebView
  source={{ uri: WEB_URL }}
  originWhitelist={["*"]}
  javaScriptEnabled
  domStorageEnabled
  cacheEnabled={false} // 캐시 비활성화
  incognito // 시크릿 모드
  mixedContentMode="never" // 혼합 콘텐츠 차단
  startInLoadingState
/>
```

### 보안 고려사항

- `originWhitelist={["*"]}`는 현재 모든 도메인 허용
- 필요시 특정 도메인으로 제한 가능: `["https://soksol.vercel.app"]`

---

## 6. 환경변수 및 시크릿 관리

### 현재 구조

- **웹앱**: `GEMINI_API_KEY` 환경변수 필요
- **배포**: Vercel 환경변수로 관리
- **모바일**: 하드코딩된 URL 사용

### 보안 검증 도구

- `scripts/check-secrets.js`: 필수 시크릿 누락 검사
- `npm run scan:secrets`: gitleaks 시크릿 스캔
- CI/CD 파이프라인에서 자동 검증

### 모범 사례

1. **.env 파일 템플릿 제공** (현재 누락)
2. **CI에서 시크릿 검증**
3. **프로덕션 시크릿 분리 관리**

---

## 일반적인 개발 환경 문제

### Node.js 버전 호환성

- **권장 버전**: Node.js ≥18
- **확인 방법**: `node --version`

### 패키지 설치 문제

```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### React Native 개발 환경

```bash
# Android 개발 환경 확인
npx react-native doctor

# Metro 캐시 정리
npx react-native start --reset-cache
```

---

## 배포 관련 문제

### Vercel 배포 실패

1. **환경변수 확인**: `GEMINI_API_KEY` 설정
2. **빌드 명령어**: `npm run build` 성공 여부
3. **의존성 오류**: package.json 확인

### 모바일 빌드 실패

1. **Android Studio 설정**: SDK, NDK 버전
2. **Gradle 빌드**: `./gradlew clean` 후 재빌드
3. **키스토어 경로**: 절대 경로 확인

---

## 디버깅 도구 및 명령어

### 웹앱 디버깅

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm test             # 테스트 실행
npm run lint         # 코드 검사
```

### 모바일 디버깅

```bash
npx react-native run-android    # 안드로이드 실행
npx react-native log-android    # 안드로이드 로그
adb logcat *:E                  # 안드로이드 에러 로그만
```

### 보안 검사

```bash
npm run scan:secrets            # 시크릿 스캔
node scripts/check-secrets.js   # 시크릿 검증
npm audit                       # 보안 취약점 검사
```

---

이 문서는 실제 개발 과정에서 발생한 문제들을 기록하고, 향후 유사한 문제 발생 시 빠른 해결을 위한 참고 자료입니다.
