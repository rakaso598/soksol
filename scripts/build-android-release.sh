#!/usr/bin/env bash
set -euo pipefail
# Build Android release AAB for SokSol mobile wrapper
# Usage: scripts/build-android-release.sh [clean|bundle|apk]

# 컬러 출력 함수
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 변수 확인
check_environment() {
    info "Android 빌드 환경 확인 중..."
    
    # ANDROID_HOME 확인
    if [ -z "${ANDROID_HOME:-}" ]; then
        warning "ANDROID_HOME 환경변수가 설정되지 않았습니다."
        warning "Android Studio SDK path를 설정하세요."
    else
        info "ANDROID_HOME: $ANDROID_HOME"
    fi
    
    # Java 버전 확인
    if command -v java >/dev/null 2>&1; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        info "Java: $JAVA_VERSION"
    else
        error "Java가 설치되지 않았습니다."
        exit 1
    fi
}

# 프로젝트 정리
clean_project() {
    info "프로젝트 정리 중..."
    pushd mobile/soksol_mobile/SokSol/android >/dev/null
    ./gradlew clean
    popd >/dev/null
    info "정리 완료"
}

# AAB 빌드
build_bundle() {
    info "Android App Bundle (AAB) 빌드 시작..."
    pushd mobile/soksol_mobile/SokSol/android >/dev/null
    
    # 빌드 실행
    if ./gradlew bundleRelease; then
        popd >/dev/null
        
        # 출력 파일 확인
        OUT=mobile/soksol_mobile/SokSol/android/app/build/outputs/bundle/release/app-release.aab
        if [ -f "$OUT" ]; then
            info "AAB 빌드 성공: $OUT"
            
            # 파일 크기 표시
            SIZE=$(ls -lh "$OUT" | awk '{print $5}')
            info "파일 크기: $SIZE"
            
            # 서명 확인
            if command -v aapt >/dev/null 2>&1; then
                info "AAB 정보:"
                aapt dump badging "$OUT" 2>/dev/null | grep -E "(package|version)" || true
            fi
            
            return 0
        else
            error "AAB 파일을 찾을 수 없습니다: $OUT"
            return 1
        fi
    else
        popd >/dev/null
        error "AAB 빌드 실패"
        return 1
    fi
}

# APK 빌드
build_apk() {
    info "Android APK 빌드 시작..."
    pushd mobile/soksol_mobile/SokSol/android >/dev/null
    
    # 빌드 실행
    if ./gradlew assembleRelease; then
        popd >/dev/null
        
        # 출력 파일 확인
        OUT=mobile/soksol_mobile/SokSol/android/app/build/outputs/apk/release/app-release.apk
        if [ -f "$OUT" ]; then
            info "APK 빌드 성공: $OUT"
            
            # 파일 크기 표시
            SIZE=$(ls -lh "$OUT" | awk '{print $5}')
            info "파일 크기: $SIZE"
            
            # APK 정보 표시
            if command -v aapt >/dev/null 2>&1; then
                info "APK 정보:"
                aapt dump badging "$OUT" 2>/dev/null | grep -E "(package|version|application-label)" || true
            fi
            
            return 0
        else
            error "APK 파일을 찾을 수 없습니다: $OUT"
            return 1
        fi
    else
        popd >/dev/null
        error "APK 빌드 실패"
        return 1
    fi
}

# 빌드 검증
verify_build() {
    info "빌드 결과 검증 중..."
    
    # AAB 파일 검증
    AAB_FILE=mobile/soksol_mobile/SokSol/android/app/build/outputs/bundle/release/app-release.aab
    APK_FILE=mobile/soksol_mobile/SokSol/android/app/build/outputs/apk/release/app-release.apk
    
    if [ -f "$AAB_FILE" ]; then
        info "✅ AAB 파일 존재: $AAB_FILE"
        
        # 파일이 비어있지 않은지 확인
        if [ -s "$AAB_FILE" ]; then
            info "✅ AAB 파일 크기 정상"
        else
            error "❌ AAB 파일이 비어있습니다"
            return 1
        fi
    fi
    
    if [ -f "$APK_FILE" ]; then
        info "✅ APK 파일 존재: $APK_FILE"
        
        # 파일이 비어있지 않은지 확인
        if [ -s "$APK_FILE" ]; then
            info "✅ APK 파일 크기 정상"
        else
            error "❌ APK 파일이 비어있습니다"
            return 1
        fi
    fi
    
    info "빌드 검증 완료"
}

# 메인 함수
main() {
    echo "🚀 SokSol Android 빌드 스크립트"
    echo "================================"
    
    # 환경 확인
    check_environment
    
    # 인자에 따른 동작
    case "${1:-bundle}" in
        "clean")
            clean_project
            ;;
        "bundle")
            clean_project
            build_bundle
            verify_build
            ;;
        "apk")
            clean_project
            build_apk
            verify_build
            ;;
        "both")
            clean_project
            build_bundle
            build_apk
            verify_build
            ;;
        *)
            echo "사용법: $0 [clean|bundle|apk|both]"
            echo "  clean  - 프로젝트 정리만"
            echo "  bundle - AAB 빌드 (기본값)"
            echo "  apk    - APK 빌드"
            echo "  both   - AAB와 APK 모두 빌드"
            exit 1
            ;;
    esac
    
    info "빌드 완료!"
    echo "================================"
    echo "📱 Play Store 제출: AAB 파일 사용"
    echo "🔧 테스트용: APK 파일 사용"
    echo "📋 다음 단계: RELEASE_CHECKLIST.md 참고"
}

# 스크립트 실행
main "$@"
