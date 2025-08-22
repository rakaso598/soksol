# SokSol (속솔) - [✨바로가기](https://soksol.vercel.app)

## [🎬 Youtube Shorts 시연영상 보러가기](https://youtube.com/shorts/EcTReJ0OemI?feature=share)

<img width="690" height="893" alt="image" src="https://github.com/user-attachments/assets/5f5619eb-cc0c-4de9-82db-e5b7d2f905fa" />

![soksol-시연](https://github.com/user-attachments/assets/3daf4cd4-264e-48ab-976f-8311df0f470c)

<details>
<summary><h3>💡 WebView에서 웹 앱 빌드로 구현</h3></summary>

<img width="856" height="702" alt="image" src="https://github.com/user-attachments/assets/c3e5cb90-f10f-4df0-b3cd-04359069b095" />

### React Native: 웹뷰(WebView) vs. 네이티브 빌드 방식

React Native 앱에서 웹 콘텐츠를 표시하는 방법에는 **WebView를 사용하는 방식**과 **순수한 네이티브 번들 방식**이 있습니다. 두 방식은 구조, 장단점, 그리고 배포 전략에서 명확한 차이를 보입니다.

---

### 1. WebView 기반 앱

#### 구조 및 동작 원리
**WebView**는 네이티브 앱 내부에 웹 브라우저 엔진을 삽입하여 웹 앱을 띄우는 컴포넌트입니다.

* **웹 앱 개발:** Next.js, React, Vue 등으로 웹 앱을 개발한 후, 빌드하여 정적 파일(HTML, CSS, JS)을 생성합니다.
* **서버 배포:** 빌드된 정적 파일들을 Vercel, Netlify와 같은 웹 서버에 배포합니다.
* **앱에서 로드:** React Native 앱은 `react-native-webview` 라이브러리를 사용해 WebView를 띄우고, 배포된 웹 앱의 URL을 로드합니다. 사용자는 네이티브 앱처럼 보이지만, 실제로는 그 안에서 웹 앱이 동작하는 것입니다.

#### 장점
* **빠른 배포 및 업데이트:** 웹 서버의 코드를 수정하면 앱 스토어 심사 없이 즉시 사용자에게 반영됩니다.
* **코드 재사용:** 기존 웹 코드를 모바일 앱 개발에 그대로 활용할 수 있어 개발 비용과 시간을 절감할 수 있습니다.
* **쉬운 개발:** 네이티브 개발 지식이 없어도 웹 기술만으로 앱 서비스를 제공할 수 있습니다.

#### 단점
* **네이티브 기능 제약:** 카메라, 푸시 알림, 파일 시스템 접근 등 네이티브 기기 API 사용이 제한적입니다. (네이티브 브릿지 개발을 통해 일부 해결 가능)
* **성능 및 사용자 경험(UX) 한계:** 완벽한 네이티브 앱에 비해 반응성, 애니메이션, 제스처 등에서 이질감을 느낄 수 있으며 성능이 다소 떨어질 수 있습니다.
* **앱 스토어 심사:** 단순 WebView로만 구성된 앱은 Apple App Store에서 심사가 거절될 가능성이 있습니다.

#### 실제 배포 구조
웹 앱을 빌드하여 서버에 배포하면, 네이티브 앱의 WebView가 해당 URL에 접속해 콘텐츠를 표시합니다. 사용자는 앱을 실행하면 네이티브 앱처럼 보이지만, 실제로는 웹이 동작하는 형태입니다.


---

### 2. 네이티브 빌드(번들) 방식

#### 구조 및 동작 원리
네이티브 빌드 방식은 JavaScript 코드를 **번들(Bundle)**로 만들고 이를 네이티브 앱 패키지(APK/IPA)에 직접 포함시키는 방식입니다.

* **JS 번들링:** React Native CLI는 개발한 JavaScript 코드를 `index.android.bundle` 또는 `main.jsbundle`과 같은 단일 파일로 묶습니다.
* **네이티브 앱 패키징:** 이 JS 번들 파일을 안드로이드의 `assets` 폴더 또는 iOS의 `Bundle Resources`에 포함시켜 네이티브 앱을 빌드합니다.
* **앱 실행:** 사용자가 앱을 실행하면 네이티브 런타임이 앱 패키지 내부에 있는 JS 번들을 읽어 코드를 실행하고 UI를 렌더링합니다.

#### 장점
* **최고의 성능:** 네이티브 컴포넌트를 사용하므로 반응성이 뛰어나고, 애니메이션과 제스처 등에서 네이티브 앱과 동일한 사용자 경험을 제공합니다.
* **모든 네이티브 기능 접근:** 카메라, GPS, 블루투스, 푸시 알림 등 기기의 모든 네이티브 API에 직접 접근하여 활용할 수 있습니다.
* **오프라인 사용:** 앱 패키지 내에 모든 코드가 포함되어 있어 인터넷 연결 없이도 동작이 가능합니다.

#### 단점
* **느린 업데이트 주기:** 코드 수정 시 반드시 새로운 앱을 빌드하여 앱 스토어에 재배포하고 심사를 받아야 합니다.
* **플랫폼 종속성:** 네이티브 API에 접근하기 위해 플랫폼별 코드를 작성해야 할 수 있습니다.

---

### 3. 비교 요약

| 특징 | WebView 기반 앱 | 네이티브 빌드(번들) 방식 |
|:---|:---|:---|
| **코드 위치** | 웹 서버 | 앱 패키지(APK/IPA) 내부 |
| **업데이트** | 즉시 가능 (서버 수정) | 앱 스토어 심사 필요 |
| **네이티브 기능** | 제한적 (브릿지 필요) | 완전한 접근 가능 |
| **성능/UX** | 웹과 유사, 약간의 한계 | 네이티브와 동일 |
| **개발 난이도** | 상대적으로 낮음 (웹 개발 기반) | 약간 더 높음 (네이티브 모듈 이해 필요) |

WebView는 **MVP(최소 기능 제품)** 또는 **빠른 프로토타입** 제작에 유리하며, 네이티브 번들 방식은 **최고의 성능과 풍부한 네이티브 기능**을 제공하는 앱에 적합합니다.


</details>

<details>
<summary><h3>🤖 AI 챗봇 시스템 프롬프트 적용</h3></summary>

<img width="717" height="562" alt="image" src="https://github.com/user-attachments/assets/5bdf0628-cfeb-4361-8211-64232a97c53b" />

<img width="647" height="654" alt="image" src="https://github.com/user-attachments/assets/3c5946bc-47f8-4ec8-bdd2-56204d30c5e3" />

### AI 챗봇의 "시스템 프롬프트" 적용

AI 챗봇 개발에서 \*\*시스템 프롬프트(System Prompt)\*\*는 챗봇의 행동을 제어하고 일관성을 유지하는 핵심적인 기능입니다. 이는 챗봇이 사용자와 대화할 때 항상 참고해야 할 기본 지침, 즉 "가이드라인" 역할을 합니다.

-----

### 1\. 시스템 프롬프트란?

  * **정의:** 챗봇에게 부여하는 역할, 말투, 금지사항, 서비스 목적 등 AI의 행동을 정의하는 사전 지침 텍스트입니다.
      * 예시: "너는 친절한 고객 상담원이야.", "법률적 조언은 제공하지 마.", "모든 답변은 존댓말로 해."
  * **적용 방식:** 사용자의 실제 질문(`user`)과 함께 API 호출 시 `system` 역할을 부여받아 AI 모델에 전달됩니다. 이는 모든 대화의 맥락에 지속적으로 영향을 미칩니다.

### 2\. 기능적 효과

시스템 프롬프트를 사용하면 챗봇의 성능과 안정성을 크게 향상시킬 수 있습니다.

  * **일관된 역할/성격 유지:** 챗봇의 페르소나를 명확히 설정하여 사용자가 매번 동일한 경험을 하도록 돕습니다. 예를 들어, '공감하는 상담사'라는 역할을 부여하면 챗봇은 항상 공감적인 태도로 답변합니다.
  * **답변 품질 및 통제:**
      * **금지/제한 사항:** 의료, 법률, 금융 등 민감한 분야의 조언을 제공하지 않도록 명확하게 제한하여 위험을 방지합니다.
      * **서비스 목적:** 챗봇의 답변이 서비스의 목표에 부합하도록 유도합니다.
  * **위기 대응:** 위기 상황을 감지했을 때 특정 기관(예: 112)을 안내하는 등 안전 가이드를 자동으로 제공하도록 설정할 수 있습니다.

### 3\. 실제 적용 예시

챗봇 API(예: OpenAI, Anthropic)를 호출할 때, `role: "system"`으로 시스템 프롬프트를 포함시킵니다.

```json
[
  {
    "role": "system", 
    "content": "너는 SokSol의 AI 상담사야. 항상 공감적으로 답변하고, 의료적 조언이나 진단은 하지 않는다. 위기 상황이 의심되면 112 등 전문기관 안내를 우선한다. 모든 답변은 존댓말로 작성한다."
  },
  {
    "role": "user", 
    "content": "요즘 너무 힘들어요."
  }
]
```

이 구조는 사용자 질문에 앞서 챗봇의 기본 규칙을 먼저 전달함으로써, AI가 '요즘 너무 힘들다'는 메시지에 대해 단순한 위로가 아닌, **공감적이고 안전한 상담사**로서의 역할을 수행하도록 유도합니다.

### 4\. 요약

시스템 프롬프트는 챗봇의 '기본 성격'과 '행동 지침'을 설정하는 강력한 도구입니다. 이를 통해 챗봇의 **일관성**, **안전성**, **답변 품질**을 효과적으로 관리할 수 있습니다. 이는 단순히 답변을 생성하는 것을 넘어, 챗봇이 서비스의 목적에 맞게 행동하도록 통제하는 핵심적인 기능입니다.

</details>

<details>
<summary><h3>‼️ React Native 앱에서 JavaScript 번들 불러오기 실패 문제</h3></summary>

<img width="706" height="751" alt="image" src="https://github.com/user-attachments/assets/74b5d2b4-94de-45bf-bdd2-23dc7a1ec812" />

### React Native (안드로이드) "번들 실패" 오류 트러블슈팅 가이드

"Unable to load script from assets 'index.android.bundle'" 또는 "번들 실패" 오류는 React Native 개발 시 흔히 발생하는 문제입니다. 이 오류의 주요 원인과 해결 방법을 빌드 유형별로 정리했습니다.

-----

### **번들 실패(Unable to load script) 오류 원인**

  * **디버그 빌드:** 앱 실행 시 Metro 번들러(개발 서버)가 실행 중이지 않으면, 앱이 실시간으로 JavaScript 번들(JS Bundle)을 받아올 수 없어 오류가 발생합니다.
  * **릴리즈 빌드:** 릴리즈 빌드는 JS 번들을 APK 파일 내부에 포함해야 합니다. 이 과정에서 **번들 생성이 누락**되거나 `assets/index.android.bundle` 파일이 제대로 포함되지 않으면 앱이 필요한 파일을 찾지 못해 오류가 발생합니다.

-----

### **트러블슈팅 가이드**

#### 1\. 디버그 빌드에서 오류 발생 시

디버그 빌드는 Metro 번들러에 의존하므로, 항상 **Metro 번들러를 실행한 상태**에서 앱을 실행해야 합니다.

  * 터미널에서 `npx react-native start` 명령어를 실행하여 Metro 서버가 제대로 구동 중인지 확인하세요.

#### 2\. 릴리즈 빌드에서 오류 발생 시

릴리즈 빌드는 JS 번들이 APK에 포함되므로 Metro 서버와는 무관합니다.

  * **번들 파일 존재 여부 확인:** `android/app/src/main/assets/index.android.bundle` 경로에 파일이 실제로 존재하는지 확인합니다.
  * **자동 번들링 확인:** 릴리즈 빌드 시 아래 명령어가 자동으로 실행되어야 합니다.
    ```bash
    npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
    ```
  * 만약 자동 번들링이 누락되었다면, 빌드하기 전에 위 명령어를 수동으로 실행하여 번들 파일을 생성한 후 다시 빌드하세요.

#### 3\. 기타 점검 사항

  * **캐시 문제:** RN 캐시, Gradle 캐시, Watchman 캐시로 인해 문제가 발생할 수 있습니다. 다음 명령어를 순서대로 실행하여 캐시를 삭제해 보세요.
      * `npm start -- --reset-cache`
      * `cd android`
      * `./gradlew clean`
  * **파일 경로/권한 문제:** `android/app/src/main/assets/` 폴더 위치가 올바른지, 파일에 대한 읽기 권한이 있는지 확인하세요.
  * **`build.gradle` 설정:** `android/app/build.gradle` 파일에서 `apply from: "../../node_modules/react-native/react.gradle"` 설정이 올바르게 되어 있는지 확인하세요.

-----

### **요약**

| 빌드 유형 | 주요 원인 | 해결책 |
|:---:|:---:|:---:|
| **디버그** | Metro 번들러 미실행 | **Metro 번들러**(`npx react-native start`)가 실행 중인지 확인 |
| **릴리즈** | JS 번들 미포함 | `index.android.bundle` 파일이 APK 내에 **포함**되었는지 확인 |

이 가이드대로 점검하면 대부분의 번들 실패 오류를 해결할 수 있습니다\!

</details>

<details>
<summary><h3>⚠️ Android Studio 가상 기기(AVD) 강제 종료 문제</h3></summary>

<img width="382" height="164" alt="image" src="https://github.com/user-attachments/assets/895b373a-0e00-48fb-acff-bdd8f9b9d168" />

위 이미지는 "Pixel 8 API 35" 에뮬레이터 프로세스가 종료되었다는 오류 메시지입니다. AVD가 실행되자마자 또는 실행 도중에 예기치 않게 종료되는 현상은 여러 가지 원인으로 발생할 수 있습니다.

### 주요 에러 원인

1.  **하드웨어 가속(Hardware Acceleration) 문제:**
    * 대부분의 에뮬레이터는 **HAXM(Intel)**, **Hyper-V(Windows)**, **KVM(Linux)** 등과 같은 하드웨어 가속 기술을 사용해 실제 기기처럼 빠르게 동작합니다.
    * 이 기능이 제대로 활성화되어 있지 않거나, 다른 가상화 프로그램(예: Docker, VMware, VirtualBox 등)과 충돌할 경우 에뮬레이터가 제대로 실행되지 않고 강제 종료될 수 있습니다.

2.  **시스템 요구 사항 부족:**
    * 에뮬레이터는 상대적으로 많은 CPU와 RAM 자원을 사용합니다.
    * 시스템 메모리(RAM)가 부족하거나, CPU 성능이 낮으면 에뮬레이터가 정상적으로 구동되지 못하고 종료될 수 있습니다.

3.  **ADB(Android Debug Bridge) 충돌:**
    * 다른 프로그램에서 사용 중인 ADB 서버와 Android Studio의 ADB 서버가 충돌할 때 에뮬레이터가 종료될 수 있습니다.

4.  **에뮬레이터 이미지 또는 AVD 파일 손상:**
    * 다운로드한 에뮬레이터 시스템 이미지 파일이 손상되었거나, AVD 설정 파일에 문제가 있을 경우 오류가 발생할 수 있습니다.

5.  **방화벽 및 백신 프로그램:**
    * 특정 방화벽이나 백신 프로그램이 에뮬레이터 프로세스(`qemu-system-x86_64.exe` 등)를 악성 소프트웨어로 오인하여 차단하면 에뮬레이터가 종료될 수 있습니다.

### 통상적인 해결 방법

1.  **하드웨어 가속 확인 및 설정:**
    * **Windows:** `Hyper-V`와 `Windows 하이퍼바이저 플랫폼` 기능이 활성화되어 있는지 확인합니다. 다른 가상화 프로그램(예: VirtualBox)을 사용하고 있다면, 해당 프로그램을 종료하거나 **Hyper-V**와 호환성 문제가 없는지 확인해야 합니다.
    * **Intel CPU:** BIOS/UEFI 설정에서 **VT-x(Intel Virtualization Technology)**가 활성화되어 있는지 확인합니다.
    * **AMD CPU:** BIOS/UEFI 설정에서 **AMD-V(AMD Virtualization)**가 활성화되어 있는지 확인합니다.

2.  **AVD 재설정:**
    * **Android Studio > Device Manager**에서 문제가 되는 AVD를 삭제한 후, **"Wipe Data"**를 실행하거나 완전히 삭제 후 새로 생성해 보세요.
    * 다른 API 레벨의 시스템 이미지(예: API 34 또는 33)를 사용하여 새로운 AVD를 만들어 실행해 보는 것도 좋은 방법입니다.

3.  **RAM 설정 변경:**
    * **Device Manager**에서 AVD의 설정을 편집하여 할당된 RAM 크기를 줄여보세요. (예: 2048MB 또는 1024MB로 설정)
    * `android_avd_home` 디렉터리에 있는 `.ini` 파일을 직접 수정하여 RAM 설정을 변경할 수도 있습니다.

4.  **Android Studio 및 SDK 업데이트:**
    * **Android Studio > Settings > Appearance & Behavior > System Settings > Android SDK** 에서 **"SDK Tools"** 탭을 확인하여 **Android Emulator**와 **Intel x86 Emulator Accelerator (HAXM installer)**가 최신 버전인지 확인하고 업데이트하세요.

5.  **방화벽 및 백신 예외 설정:**
    * 방화벽 및 백신 프로그램의 예외 목록에 Android Studio와 에뮬레이터 관련 실행 파일(예: `qemu-system-x86_64.exe`)을 추가해 보세요.

이러한 방법들을 순서대로 시도해 보시면 대부분의 에뮬레이터 강제 종료 문제를 해결할 수 있습니다.

</details>

## 📋 프로젝트 개요

SokSol(속솔)은 사용자가 마음의 고민을 익명으로 털어놓고 AI와 대화하며 스스로를 정리할 수 있도록 돕는 멘탈케어 서비스입니다.

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
