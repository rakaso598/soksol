#!/bin/bash

# SokSol 원클릭 Play Store 배포 스크립트
# 사용법: ./scripts/deploy-to-playstore.sh

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 SokSol Play Store 배포 시작..."

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
CURRENT_DIR=$(pwd)
echo -e "${BLUE}현재 디렉토리: $CURRENT_DIR${NC}"

# 루트 디렉토리로 이동
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ 루트 디렉토리에서 실행해주세요 (package.json이 있는 곳)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 루트 디렉토리 확인 완료${NC}"

# 1단계: 웹앱 최종 빌드
echo -e "\n${YELLOW}📦 1단계: 웹앱 최종 빌드 중...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 웹앱 빌드 성공${NC}"
else
    echo -e "${RED}❌ 웹앱 빌드 실패${NC}"
    exit 1
fi

# 2단계: 안드로이드 AAB 빌드
echo -e "\n${YELLOW}📱 2단계: 안드로이드 AAB 빌드 중...${NC}"

# 안드로이드 프로젝트 존재 확인
ANDROID_PROJECT="mobile/soksol_mobile/SokSol"
if [[ ! -d "$ANDROID_PROJECT" ]]; then
    echo -e "${RED}❌ 안드로이드 프로젝트를 찾을 수 없습니다: $ANDROID_PROJECT${NC}"
    exit 1
fi

# 안드로이드 프로젝트로 이동하여 빌드
cd "$ANDROID_PROJECT"

# 빌드 스크립트 실행
chmod +x ../../../scripts/build-android-release.sh
../../../scripts/build-android-release.sh

# AAB 파일 존재 확인
AAB_FILE="android/app/build/outputs/bundle/release/app-release.aab"
if [[ -f "$AAB_FILE" ]]; then
    echo -e "${GREEN}✅ AAB 빌드 성공: $AAB_FILE${NC}"
    AAB_SIZE=$(ls -lh "$AAB_FILE" | awk '{print $5}')
    echo -e "${BLUE}📊 AAB 파일 크기: $AAB_SIZE${NC}"
else
    echo -e "${RED}❌ AAB 빌드 실패: $AAB_FILE 파일이 생성되지 않았습니다${NC}"
    exit 1
fi

# 루트 디렉토리로 복귀
cd "$CURRENT_DIR"

# 3단계: Play Store 자료 최종 점검
echo -e "\n${YELLOW}🎨 3단계: Play Store 자료 최종 점검 중...${NC}"

# Python 스크립트 실행
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}❌ Python을 찾을 수 없습니다${NC}"
    exit 1
fi

# 스토어 자료 준비 스크립트 실행
if [[ -f "scripts/master-prep.py" ]]; then
    $PYTHON_CMD scripts/master-prep.py
    echo -e "${GREEN}✅ 스토어 자료 준비 완료${NC}"
fi

if [[ -f "scripts/playstore-prep.py" ]]; then
    $PYTHON_CMD scripts/playstore-prep.py
    echo -e "${GREEN}✅ Play Store 준비 완료${NC}"
fi

# 4단계: 파일 존재 확인
echo -e "\n${YELLOW}📋 4단계: 필수 파일 존재 확인 중...${NC}"

# 필수 파일 목록
declare -a REQUIRED_FILES=(
    "assets/store/icons/soksol_icon.png"
    "assets/store/graphics/feature_graphic.png"
    "assets/store/screenshots/phone_screenshot_1.png"
    "assets/store/screenshots/phone_screenshot_2.png"
    "assets/store/screenshots/phone_screenshot_3.png"
    "assets/store/screenshots/phone_screenshot_4.png"
    "$ANDROID_PROJECT/$AAB_FILE"
)

ALL_FILES_EXIST=true

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "${RED}❌ 일부 필수 파일이 없습니다${NC}"
    exit 1
fi

# 5단계: 배포 안내
echo -e "\n${GREEN}🎉 모든 빌드가 완료되었습니다!${NC}"
echo -e "\n${BLUE}📱 다음 단계: Google Play Console 업로드${NC}"
echo -e "1. https://play.google.com/console 접속"
echo -e "2. 새 앱 만들기 또는 기존 앱 선택"
echo -e "3. 다음 파일들을 업로드:"
echo -e "   ${YELLOW}AAB 파일:${NC} $ANDROID_PROJECT/$AAB_FILE"
echo -e "   ${YELLOW}앱 아이콘:${NC} assets/store/icons/soksol_icon.png"
echo -e "   ${YELLOW}피처 그래픽:${NC} assets/store/graphics/feature_graphic.png"
echo -e "   ${YELLOW}스크린샷:${NC} assets/store/screenshots/ 폴더 내 4개 파일"

echo -e "\n${BLUE}📚 상세 가이드:${NC}"
echo -e "   docs/FINAL_DEPLOYMENT_GUIDE.md"
echo -e "   docs/PLAY_CONSOLE_GUIDE.md"

echo -e "\n${GREEN}🚀 SokSol Play Store 배포 준비 100% 완료!${NC}"

# 배포 파일 정보 요약
echo -e "\n${YELLOW}📊 배포 파일 정보:${NC}"
echo -e "AAB 크기: $(ls -lh "$ANDROID_PROJECT/$AAB_FILE" | awk '{print $5}')"
echo -e "아이콘: $(file assets/store/icons/soksol_icon.png | cut -d: -f2-)"
echo -e "피처 그래픽: $(file assets/store/graphics/feature_graphic.png | cut -d: -f2-)"
echo -e "스크린샷 개수: $(ls assets/store/screenshots/*.png 2>/dev/null | wc -l)개"
