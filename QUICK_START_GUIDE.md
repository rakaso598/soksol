# 🚀 SokSol Play Store 제출 - 실행 가이드

> **이 문서는 docs/QUICK_START_GUIDE.md로 이동되었습니다.**

## 📍 현재 상황

- ✅ 코드 완성 (웹앱 + 모바일앱)
- ✅ 자동화 스크립트 모두 준비
- ✅ 문서 및 가이드 완성
- 🔄 **실제 빌드 + 업로드 대기 중**

## 🎯 지금 해야 할 일 (순서대로)

### 1단계: 앱 빌드 (AAB 파일 생성) ⭐ **필수**

```bash
# Android AAB 파일 빌드 (Play Store에 올릴 파일)
bash scripts/build-android-release.sh bundle
```

**결과:** `mobile/soksol_mobile/SokSol/android/app/build/outputs/bundle/release/app-release.aab` 파일 생성

### 2단계: 스크린샷 촬영 ⭐ **필수**

**방법 1: 자동 촬영 (추천)**

```bash
# 안드로이드 폰을 USB로 연결하고
python scripts/screenshot-automation.py
```

**방법 2: 수동 촬영**

- 앱을 실행하고 화면 캡처
- 최소 2개, 권장 4-8개
- 해상도 1080x1920 권장

### 3단계: Play Console 업로드 ⭐ **필수**

1. **Google Play Console** 접속 (play.google.com/console)
2. **새 앱 만들기**
3. **AAB 파일 업로드** (1단계에서 생성한 파일)
4. **스크린샷 업로드** (2단계에서 촬영한 이미지)
5. **앱 정보 입력** (STORE_MATERIALS.md 내용 복사)

## 📱 스크린샷에 대한 상세 설명

### 🤔 스크린샷이 꼭 필요한가?

**네, 필수입니다!** Play Store 정책상 최소 2개 이상 필요

### 📷 언제 찍어야 하나?

**지금 당장 또는 Play Console 업로드할 때**

- 미리 찍어서 준비해도 되고
- Play Console에서 앱 등록할 때 찍어도 됨

### 🎬 어떤 화면을 찍어야 하나?

1. **메인 화면** (앱 첫 실행 화면)
2. **채팅 시작 화면**
3. **AI와 대화 중인 화면**
4. **AI 응답이 나온 화면**

## 🛠️ 간단 실행 명령어

```bash
# 1. 모든 준비 과정 자동 실행 (추천)
python scripts/master-prep.py

# 2. 또는 단계별 실행
bash scripts/build-android-release.sh bundle    # AAB 빌드
python scripts/screenshot-automation.py         # 스크린샷 촬영
python scripts/qa-validator.py                  # 최종 검증
```

## 🎯 최종 목표

**Play Store에 올릴 준비물:**

1. ✅ 앱 코드 (완료)
2. 🔄 AAB 파일 (빌드 필요)
3. 🔄 스크린샷 4-8개 (촬영 필요)
4. ✅ 앱 설명 (완료)
5. ✅ 아이콘 (완료)

**결론: 빌드 + 스크린샷 + 업로드만 하면 끝!**
