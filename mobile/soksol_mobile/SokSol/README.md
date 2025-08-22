# SokSol 모바일 WebView 래퍼 앱

## 프로젝트 개요

- **SokSol 모바일**은 Next.js 기반 웹앱(https://soksol.com)을 React Native WebView로 감싼 Android 앱입니다.
- 네이티브 기능 최소화, 모든 주요 기능은 웹앱에서 처리.
- 목적: 웹앱을 별도 네이티브 개발 없이 Android 앱으로 패키징하여 배포 및 플레이스토어 등록.

## 기술 스택

- **React Native 0.81.0**
- **react-native-webview 13.15.0**
- **TypeScript 5.8.x**
- **Jest** (테스트)
- **ESLint, Prettier** (코드 품질)
- **Android SDK 36, JDK 11**
- **Next.js** (웹앱, 별도 저장소)

## 주요 파일 및 구조

- `App.tsx`: soksol.com을 WebView로 로드하는 메인 엔트리
- `android/app/build/outputs/bundle/release/app-release.aab`: 릴리즈 번들 파일(스토어 업로드용)
- `android/app-release.apks`: bundletool로 생성된 APK 세트(압축 파일)
- `android/universal.apk`: 모든 기기에서 설치 가능한 단일 APK(테스트/배포용)
- `android/app/release-key.jks`: 릴리즈 서명용 키스토어

## 빌드 및 배포

1. **릴리즈 키스토어 생성**: `keytool`로 `android/app/release-key.jks` 생성
2. **릴리즈 번들 빌드**: `cd android && ./gradlew bundleRelease`
3. **AAB → APK 변환**: `bundletool`로 `app-release.apks` 생성 후 `universal.apk` 추출
4. **설치 및 테스트**: universal.apk를 에뮬레이터/실기기에 설치하여 동작 검증

## 동작 방식

- 앱 실행 시 WebView가 `https://soksol.com`에 접속하여 웹앱을 표시
- 네트워크 연결이 필수(오프라인 시 앱은 정상 동작 불가)
- 웹앱의 모든 기능은 모바일 브라우저와 동일하게 제공됨
- 네이티브 기능(푸시, 파일 접근 등)은 별도 구현 필요

## 한계 및 권장 사항

- 웹앱 서버 장애/도메인 만료 시 앱도 정상 동작 불가
- 네트워크 불안정 시 앱 사용성 저하
- WebView 특성상 일부 네이티브 UX 미지원
- 앱 심사 시 개인정보처리방침, 아이콘, 스크린샷 등 추가 자료 필요
- 스토어 등록 전 아이콘/스플래시/정책 등 보완, 네이티브 기능 필요시 추가 개발 권장

## 참고 문서

- [MOBILE_REPORT.md](./MOBILE_REPORT.md): 상세 구조/동작/한계 보고서
- [React Native 공식 문서](https://reactnative.dev/)
- [react-native-webview](https://github.com/react-native-webview/react-native-webview)

---

문의: soksol.com
