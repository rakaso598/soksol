# 스크린샷 촬영 가이드

## 📸 필수 스크린샷 (4-8개)

### 1. 메인 랜딩 페이지

**URL**: `https://soksol.vercel.app/`
**촬영 포인트**:

- SokSol 로고 및 제목
- "익명 AI 멘탈 케어" 부제목
- "채팅 시작하기" 버튼
- 간단한 서비스 설명

**촬영 방법**:

```bash
# 모바일 앱에서 실행
cd mobile/soksol_mobile/SokSol
npx react-native run-android

# 또는 웹에서 모바일 뷰로 촬영
# Chrome 개발자 도구 → 모바일 디바이스 모드
```

### 2. 채팅 시작 화면

**URL**: `https://soksol.vercel.app/chat`
**촬영 포인트**:

- 채팅 인터페이스 UI
- 메시지 입력창
- "AI가 응답 중..." 로딩 상태 (가능하면)
- 깔끔한 디자인 강조

### 3. AI 대화 예시

**촬영할 대화 내용**:

```
사용자: 안녕하세요, 오늘 기분이 좋지 않아요.

AI: 안녕하세요. 오늘 기분이 좋지 않으시다니 마음이 아프네요. 어떤 일이 있으셨는지 편하게 이야기해보시겠어요? 혼자 감당하기 힘든 감정들을 나누는 것만으로도 조금은 마음이 가벼워질 수 있어요.

사용자: 요즘 일이 너무 힘들어서 스트레스를 많이 받고 있어요.

AI: 일에서 오는 스트레스는 정말 힘들죠. 매일 마주해야 하는 것이라 더욱 지치실 것 같아요. 지금 가장 힘드신 부분이 무엇인지 조금 더 들려주실 수 있을까요?
```

### 4. 개인정보 보호 페이지

**URL**: `https://soksol.vercel.app/privacy`
**촬영 포인트**:

- "무저장 정책" 강조
- "개인정보 수집하지 않음" 명시
- 보안 정책 설명

### 5. 캐시 비사용 검증 페이지 (선택)

**URL**: `https://soksol.vercel.app/privacy-check`
**촬영 포인트**:

- 실시간 서버 타임스탬프
- "새로고침마다 변경됨" 설명
- 캐시 비사용 증명

## 🎨 스크린샷 품질 가이드

### 기술 요구사항

- **해상도**: 1080x1920 이상 (세로 모드)
- **형식**: PNG 또는 JPEG
- **크기**: 최대 8MB per file
- **비율**: 16:9 또는 9:16 권장

### 촬영 환경

- **디바이스**: Android 실기기 또는 에뮬레이터
- **테마**: 밝은 모드 (가독성 좋음)
- **시간**: 09:41 또는 깔끔한 시간으로 설정
- **배터리**: 100% 또는 높은 수준
- **알림**: 모든 알림 제거

### 촬영 명령어

```bash
# Android 스크린샷 촬영
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./assets/store/screenshots/

# 또는 Power + Volume Down 물리 버튼 사용
```

## 📱 자동 스크린샷 스크립트

### 스크린샷 자동화 (Android)

```bash
#!/bin/bash
# scripts/take-screenshots.sh

set -e

echo "📸 Taking SokSol screenshots..."

# 스크린샷 저장 디렉토리 생성
mkdir -p assets/store/screenshots

# 앱 실행
adb shell am start -n com.soksol/.MainActivity

sleep 3

# 1. 메인 화면
echo "📱 Screenshot 1: Main screen"
adb shell screencap -p /sdcard/screenshot_1_main.png
adb pull /sdcard/screenshot_1_main.png assets/store/screenshots/

sleep 2

# 채팅 화면으로 이동 (탭 이벤트 필요시)
# adb shell input tap 540 1200  # "채팅 시작" 버튼 위치

# 2. 채팅 화면
echo "📱 Screenshot 2: Chat interface"
adb shell screencap -p /sdcard/screenshot_2_chat.png
adb pull /sdcard/screenshot_2_chat.png assets/store/screenshots/

# 메시지 입력 (선택사항)
# adb shell input text "안녕하세요"
# adb shell input keyevent 66  # Enter

sleep 3

# 3. AI 응답 화면
echo "📱 Screenshot 3: AI conversation"
adb shell screencap -p /sdcard/screenshot_3_conversation.png
adb pull /sdcard/screenshot_3_conversation.png assets/store/screenshots/

# 개인정보 페이지로 이동 (URL 이동 필요)
sleep 2

# 4. 개인정보 페이지
echo "📱 Screenshot 4: Privacy page"
adb shell screencap -p /sdcard/screenshot_4_privacy.png
adb pull /sdcard/screenshot_4_privacy.png assets/store/screenshots/

# 임시 파일 정리
adb shell rm /sdcard/screenshot_*.png

echo "✅ Screenshots saved to assets/store/screenshots/"
echo "📝 Next: Review and edit screenshots if needed"
```

## 🖼️ 스크린샷 후처리

### 추천 도구

1. **Android Studio**: Device File Explorer
2. **Figma**: 프레임 추가, 텍스트 오버레이
3. **Canva**: 템플릿 기반 편집
4. **Photoshop/GIMP**: 전문적 편집

### 편집 가이드

1. **프레임 추가**: 디바이스 모형에 스크린샷 삽입
2. **텍스트 오버레이**: 주요 기능 설명 추가
3. **강조 효과**: 중요한 UI 요소에 화살표나 하이라이트
4. **일관성**: 모든 스크린샷의 스타일 통일

### 스크린샷 설명문

각 스크린샷에 대한 설명 (Play Console에서 입력):

1. **메인 화면**: "간편한 익명 AI 상담 시작"
2. **채팅 화면**: "깔끔한 대화 인터페이스"
3. **AI 대화**: "따뜻하고 공감적인 AI 응답"
4. **개인정보**: "완벽한 개인정보 보호"

## 🎯 촬영 체크리스트

### 사전 준비

- [ ] 앱 정상 빌드 및 설치
- [ ] 네트워크 연결 확인
- [ ] AI API 정상 동작 확인
- [ ] 디바이스 상태 최적화

### 촬영 진행

- [ ] 메인 랜딩 페이지 (1장)
- [ ] 채팅 시작 화면 (1장)
- [ ] AI 대화 예시 (1-2장)
- [ ] 개인정보 보호 페이지 (1장)
- [ ] 추가 기능 화면 (선택, 1-2장)

### 후처리

- [ ] 해상도 및 품질 확인
- [ ] 민감정보 제거 (시간, 배터리 등 일관성)
- [ ] 파일명 정리 (screenshot_1_main.png 등)
- [ ] Play Console 업로드 테스트

이 가이드에 따라 스크린샷을 촬영하면 Google Play Store 심사를 통과할 수 있는 고품질 스크린샷을 얻을 수 있습니다.
