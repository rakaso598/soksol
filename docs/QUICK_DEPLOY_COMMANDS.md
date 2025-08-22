# SokSol 빠른 배포 명령어 가이드

## 🚀 원클릭 배포 명령어

### 전체 배포 프로세스 (권장)

```bash
# 루트 디렉토리에서 실행
chmod +x scripts/deploy-to-playstore.sh
./scripts/deploy-to-playstore.sh
```

---

## 📋 단계별 명령어

### 1단계: 웹앱 빌드

```bash
# 현재 위치: /c/Users/nexxu/soksol
npm run build
```

### 2단계: 안드로이드 AAB 빌드

```bash
# 안드로이드 프로젝트로 이동
cd mobile/soksol_mobile/SokSol

# 빌드 스크립트 실행
chmod +x ../../../scripts/build-android-release.sh
../../../scripts/build-android-release.sh

# 루트로 복귀
cd /c/Users/nexxu/soksol
```

### 3단계: Play Store 자료 준비

```bash
# 스토어 자료 최종 점검
python scripts/master-prep.py

# Play Store 업로드 준비
python scripts/playstore-prep.py
```

### 4단계: 파일 확인

```bash
# AAB 파일 확인
ls -la mobile/soksol_mobile/SokSol/android/app/build/outputs/bundle/release/app-release.aab

# 스토어 자료 확인
ls -la assets/store/icons/soksol_icon.png
ls -la assets/store/graphics/feature_graphic.png
ls -la assets/store/screenshots/
```

---

## 🎯 Play Console 업로드

### 즉시 업로드할 파일들

1. **AAB 파일**:

   ```
   mobile/soksol_mobile/SokSol/android/app/build/outputs/bundle/release/app-release.aab
   ```

2. **앱 아이콘** (512×512):

   ```
   assets/store/icons/soksol_icon.png
   ```

3. **피처 그래픽** (1024×500):

   ```
   assets/store/graphics/feature_graphic.png
   ```

4. **스크린샷** (4개):
   ```
   assets/store/screenshots/phone_screenshot_1.png
   assets/store/screenshots/phone_screenshot_2.png
   assets/store/screenshots/phone_screenshot_3.png
   assets/store/screenshots/phone_screenshot_4.png
   ```

### Play Console 접속

```
URL: https://play.google.com/console
```

---

## 📚 참고 문서

### 상세 가이드

- `docs/FINAL_DEPLOYMENT_GUIDE.md` - 전체 배포 프로세스
- `docs/PLAY_CONSOLE_UPLOAD_CHECKLIST.md` - 업로드 체크리스트
- `docs/PLAY_CONSOLE_GUIDE.md` - Play Console 사용법

### 앱 정보 텍스트

- `docs/STORE_MATERIALS.md` - 앱 설명 및 키워드

### 문제 해결

- `docs/TROUBLESHOOTING.md` - 문제 해결 가이드
- `docs/PLAY_STORE_COMPLIANCE.md` - 정책 준수 사항

---

## ⚡ 응급 명령어

### 빠른 상태 확인

```bash
# 웹앱 빌드 상태
npm run build

# AAB 파일 존재 확인
[ -f mobile/soksol_mobile/SokSol/android/app/build/outputs/bundle/release/app-release.aab ] && echo "✅ AAB 존재" || echo "❌ AAB 없음"

# 스토어 자료 존재 확인
[ -f assets/store/icons/soksol_icon.png ] && echo "✅ 아이콘 존재" || echo "❌ 아이콘 없음"
[ -f assets/store/graphics/feature_graphic.png ] && echo "✅ 피처그래픽 존재" || echo "❌ 피처그래픽 없음"
```

### 빌드만 다시 실행

```bash
# 웹앱만 다시 빌드
npm run build

# 안드로이드만 다시 빌드
cd mobile/soksol_mobile/SokSol && ../../../scripts/build-android-release.sh && cd /c/Users/nexxu/soksol
```

---

## 🎉 배포 완료 후

### 성공 확인

1. Play Console에서 "업로드 완료" 확인
2. 검토 진행 상태 확인
3. 승인 후 Play Store 검색 테스트

### 다음 단계

- 사용자 피드백 모니터링
- 앱 업데이트 준비
- 마케팅 자료 준비

---

**🚀 이제 명령어를 실행하고 Play Store에 바로 업로드하면 됩니다!**
