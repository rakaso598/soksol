# SokSol WebView 기반 Android 앱 패키징 및 배포 전체 가이드

---

## 1. 프로젝트 개요

- **목적**: Next.js 기반 웹앱(https://soksol.vercel.app)을 React Native WebView로 감싼 Android 앱으로 패키징, 실제 기기/스토어 배포까지 전 과정 자동화
- **특징**: 네이티브 기능 최소화, 모든 주요 기능은 웹앱에서 처리, 빠른 배포/유지보수

---

## 2. 전체 기술 스택

- **React Native 0.81.x** (yarn 기반)
- **react-native-webview 13.15.x**
- **TypeScript 5.8.x**
- **Jest, ESLint, Prettier** (테스트/코드 품질)
- **Android SDK 36, JDK 17**
- **ImageMagick** (아이콘 변환)
- **bundletool** (AAB→APK 변환)
- **Chocolatey** (Windows 패키지 매니저)
- **Next.js** (웹앱, 별도 저장소)

---

## 3. 환경 준비

### 3.1 시스템 패키지 설치 (Windows)

```bash
choco install nodejs-lts openjdk11 openjdk17 yarn android-sdk imagemagick -y
```

- 환경변수: ANDROID_HOME, JAVA_HOME, PATH에 SDK/JDK/bin 추가

### 3.2 React Native 프로젝트 생성

```bash
cd mobile/soksol_mobile
npx react-native init SokSol --template react-native-template-typescript
yarn add react-native-webview
```

---

## 4. WebView 래퍼 구현

- `App.tsx`에서 WebView로 soksol.vercel.app 연결

```tsx
const WEB_URL = 'https://soksol.vercel.app';
<WebView source={{ uri: WEB_URL }} ... />
```

- 보안 옵션: `incognito`, `cacheEnabled={false}`, `mixedContentMode="never"` 등 적용

---

## 5. 앱 아이콘 적용

1. **SVG 로고 준비**: `soksol/public/logo.svg` 복사
2. **ImageMagick 변환**

```bash
magick logo.svg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
magick logo.svg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
magick logo.svg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
magick logo.svg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
magick logo.svg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

---

## 6. 릴리즈 키스토어 생성 및 서명 설정

```bash
keytool -genkey -v -keystore android/app/release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release-key
```

- `android/gradle.properties`에 키 정보 추가
- `android/app/build.gradle` signingConfigs.release에 적용

---

## 7. 빌드 및 번들 생성

```bash
cd android
./gradlew bundleRelease
```

- 결과: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 8. AAB → APK 변환 (테스트용)

1. **bundletool 다운로드**: https://github.com/google/bundletool/releases
2. **APK 세트 생성**

```bash
java -jar bundletool.jar build-apks --bundle=app/build/outputs/bundle/release/app-release.aab --output=app-release.apks --mode=universal --overwrite --ks=app/release-key.jks --ks-key-alias=release-key --ks-pass=pass:your_keystore_password --key-pass=pass:your_keystore_password
```

3. **universal.apk 추출**

```bash
unzip -o app-release.apks universal.apk
```

---

## 9. 에뮬레이터/실기기 설치 및 테스트

```bash
adb install universal.apk
```

- 또는 에뮬레이터에 드래그&드롭

---

## 10. 플레이스토어 배포

- `app-release.aab` 파일을 Google Play Console에 업로드
- 스크린샷, 아이콘, 개인정보처리방침 등 추가 자료 준비

---

## 11. 기타 참고/문제 해결

- **빌드 오류**: JDK 버전, 환경변수, 의존성 확인
- **WebView 연결 오류**: HTTPS, 도메인, 서버 상태 확인
- **보안**: 웹앱에서 CSP/HSTS 등 헤더 적용, 모바일은 WebView 보안 옵션 적용
- **CORS**: WebView는 CORS 영향 없음

---

## 12. 전체 과정 요약

1. 환경 준비 및 의존성 설치
2. React Native WebView 래퍼 구현
3. 아이콘 변환 및 적용
4. 릴리즈 키스토어 생성/설정
5. 릴리즈 빌드(AAB)
6. bundletool로 APK 변환/테스트
7. 스토어 배포

---

문의: soksol.com
