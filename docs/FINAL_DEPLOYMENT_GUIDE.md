# SokSol 최종 배포 단계별 가이드

## 🚀 1단계: 안드로이드 AAB 빌드

### 사전 준비

```bash
# 현재 디렉토리 확인
pwd
# 결과: /c/Users/nexxu/soksol

# 안드로이드 프로젝트로 이동
cd mobile/soksol_mobile/SokSol
```

### AAB 빌드 실행

```bash
# 빌드 스크립트 실행 권한 부여
chmod +x ../../../scripts/build-android-release.sh

# AAB 빌드 실행
../../../scripts/build-android-release.sh
```

### 빌드 완료 확인

```bash
# AAB 파일 생성 확인
ls -la android/app/build/outputs/bundle/release/

# 예상 결과: app-release.aab 파일 존재
```

---

## 🎯 2단계: Play Store 자료 최종 점검

### 자동화 스크립트 실행

```bash
# 루트 디렉토리로 복귀
cd /c/Users/nexxu/soksol

# 모든 스토어 자료 최종 점검
python scripts/master-prep.py

# Play Store 업로드 준비 완료
python scripts/playstore-prep.py
```

### 준비된 파일 확인

```bash
# 스토어 자료 확인
ls -la assets/store/icons/
ls -la assets/store/graphics/
ls -la assets/store/screenshots/

# 빌드된 AAB 파일 확인
ls -la mobile/soksol_mobile/SokSol/android/app/build/outputs/bundle/release/
```

---

## 📱 3단계: Google Play Console 업로드

### A. Play Console 접속

1. **URL**: https://play.google.com/console
2. **로그인**: Google 개발자 계정
3. **새 앱 만들기** 클릭

### B. 기본 정보 입력

- **앱 이름**: SokSol (속솔)
- **기본 언어**: 한국어
- **앱 유형**: 앱
- **무료/유료**: 무료

### C. AAB 파일 업로드

1. **릴리스** → **프로덕션** → **새 릴리스 만들기**
2. **App Bundle 업로드**
   - 파일: `mobile/soksol_mobile/SokSol/android/app/build/outputs/bundle/release/app-release.aab`
3. **릴리스 노트 작성**:
   ```
   🎉 SokSol 첫 번째 릴리스
   - 실시간 AI 채팅 기능
   - 개인정보 100% 비저장 보장
   - 실시간 비저장 증명 시스템
   - PWA 웹앱 지원
   ```

### D. 스토어 자료 업로드

1. **앱 콘텐츠** → **그래픽 에셋**

   - **앱 아이콘**: `assets/store/icons/soksol_icon.png` (512×512)
   - **피처 그래픽**: `assets/store/graphics/feature_graphic.png` (1024×500)

2. **스크린샷** (휴대전화용)
   - `assets/store/screenshots/phone_screenshot_1.png`
   - `assets/store/screenshots/phone_screenshot_2.png`
   - `assets/store/screenshots/phone_screenshot_3.png`
   - `assets/store/screenshots/phone_screenshot_4.png`

### E. 앱 정보 입력

1. **기본 스토어 등록정보**

   - **간단한 설명**: "실시간 AI 채팅 - 개인정보 100% 비저장"
   - **자세한 설명**: `docs/STORE_MATERIALS.md` 파일 내용 복사
   - **앱 카테고리**: 커뮤니케이션
   - **연락처 정보**: 개발자 이메일

2. **개인정보 처리방침**
   - **URL**: https://yourdomain.com/privacy
   - (웹앱 배포 후 실제 URL로 교체)

---

## 🔒 4단계: 개인정보 보호 설정

### A. 데이터 보안

1. **앱 콘텐츠** → **데이터 보안**
2. **데이터 수집 및 공유**
   - ✅ "이 앱은 사용자 데이터를 수집하거나 공유하지 않습니다"
3. **보안 사례**
   - ✅ "데이터 전송 시 암호화"
   - ✅ "사용자가 데이터 삭제 요청 가능"

### B. 광고 ID

- ✅ "이 앱에는 광고 ID가 포함되어 있지 않습니다"

---

## 🎮 5단계: 콘텐츠 등급

### A. 콘텐츠 등급 설정

1. **앱 콘텐츠** → **콘텐츠 등급**
2. **설문지 작성**:
   - 폭력성: 없음
   - 성적 콘텐츠: 없음
   - 약물/알코올: 없음
   - 도박: 없음
   - 증오 발언: 없음

### B. 예상 등급

- **ESRB**: Everyone (모든 연령)
- **PEGI**: 3+
- **USK**: 0+

---

## ✅ 6단계: 최종 검토 및 제출

### A. 릴리스 검토

1. **릴리스 대시보드** 확인
2. **모든 요구사항 충족** 확인
3. **경고나 오류 없음** 확인

### B. 제출

1. **검토를 위해 릴리스 시작** 클릭
2. **제출 확인**

### C. 검토 대기

- **검토 시간**: 보통 1-3일
- **상태 확인**: Play Console에서 실시간 확인 가능

---

## 📋 체크리스트

### 빌드 전 확인사항

- [ ] 웹앱 빌드 성공 (`npm run build`)
- [ ] 모든 컴파일 에러 해결
- [ ] QA 테스트 통과

### 업로드 준비 확인사항

- [ ] AAB 파일 생성 완료
- [ ] 앱 아이콘 준비 (512×512)
- [ ] 피처 그래픽 준비 (1024×500)
- [ ] 스크린샷 4개 준비
- [ ] 앱 설명 문서 준비

### Play Console 확인사항

- [ ] AAB 업로드 완료
- [ ] 그래픽 에셋 업로드 완료
- [ ] 앱 정보 입력 완료
- [ ] 개인정보 보호 설정 완료
- [ ] 콘텐츠 등급 설정 완료
- [ ] 최종 검토 완료

---

## 🚨 중요 사항

1. **개인정보 처리방침 URL**: 웹앱 배포 후 실제 URL로 업데이트 필요
2. **첫 번째 릴리스**: 검토 시간이 더 오래 걸릴 수 있음
3. **거부 시 대응**: `docs/TROUBLESHOOTING.md` 참조

---

## 📞 지원

- **기술 문서**: `docs/` 폴더 내 모든 문서
- **문제 해결**: `docs/TROUBLESHOOTING.md`
- **Play Store 정책**: `docs/PLAY_STORE_COMPLIANCE.md`
