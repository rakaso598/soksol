#!/usr/bin/env python3
"""
SokSol Play Store 제출 준비 마스터 스크립트
모든 과정을 단계별로 안내하고 실행
"""

import os
import sys
import subprocess
import time
from pathlib import Path
from datetime import datetime

class PlayStoreMaster:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.scripts_path = self.base_path / "scripts"
        
    def print_header(self, title):
        """헤더 출력"""
        print("\n" + "=" * 60)
        print(f"🚀 {title}")
        print("=" * 60)
    
    def print_step(self, step_num, total_steps, description):
        """단계 출력"""
        print(f"\n📋 단계 {step_num}/{total_steps}: {description}")
        print("-" * 40)
    
    def run_script(self, script_name, args=None):
        """스크립트 실행"""
        script_path = self.scripts_path / script_name
        if not script_path.exists():
            print(f"❌ 스크립트를 찾을 수 없습니다: {script_path}")
            return False
        
        cmd = [sys.executable, str(script_path)]
        if args:
            cmd.extend(args)
        
        try:
            result = subprocess.run(cmd, cwd=self.base_path)
            return result.returncode == 0
        except Exception as e:
            print(f"❌ 스크립트 실행 실패: {e}")
            return False
    
    def interactive_choice(self, question, options):
        """대화형 선택"""
        print(f"\n❓ {question}")
        for i, option in enumerate(options, 1):
            print(f"   {i}. {option}")
        
        while True:
            try:
                choice = input("선택하세요 (번호 입력): ").strip()
                if choice.isdigit():
                    idx = int(choice) - 1
                    if 0 <= idx < len(options):
                        return idx
                print("올바른 번호를 입력하세요.")
            except KeyboardInterrupt:
                print("\n🛑 작업이 중단되었습니다.")
                sys.exit(1)
    
    def confirm_action(self, message):
        """작업 확인"""
        while True:
            response = input(f"\n❓ {message} (y/n): ").strip().lower()
            if response in ['y', 'yes', 'ㅇ']:
                return True
            elif response in ['n', 'no', 'ㄴ']:
                return False
            print("y 또는 n을 입력하세요.")
    
    def step_environment_check(self):
        """1단계: 환경 확인"""
        self.print_step(1, 7, "개발 환경 확인")
        
        print("필요한 도구들이 설치되어 있는지 확인합니다...")
        success = self.run_script("playstore-prep.py", ["env"])
        
        if not success:
            print("\n❌ 환경 확인 실패!")
            print("필요한 도구들을 설치하고 다시 실행하세요.")
            
            if self.confirm_action("계속 진행하시겠습니까? (일부 기능이 제한될 수 있습니다)"):
                return True
            return False
        
        print("✅ 환경 확인 완료!")
        return True
    
    def step_project_validation(self):
        """2단계: 프로젝트 검증"""
        self.print_step(2, 7, "프로젝트 구조 및 설정 검증")
        
        print("프로젝트 구조와 설정을 검증합니다...")
        success = self.run_script("playstore-prep.py", ["security"])
        
        if not success:
            print("\n❌ 프로젝트 검증 실패!")
            if not self.confirm_action("계속 진행하시겠습니까?"):
                return False
        
        print("✅ 프로젝트 검증 완료!")
        return True
    
    def step_icon_generation(self):
        """3단계: 아이콘 생성"""
        self.print_step(3, 7, "앱 아이콘 생성")
        
        print("SVG 아이콘을 PNG로 변환합니다...")
        
        # 아이콘 변환 시도
        success = self.run_script("convert-svg-to-png.py")
        
        if not success:
            print("\n⚠️ 자동 아이콘 변환 실패!")
            print("수동으로 아이콘을 변환해야 합니다.")
            
            print("\n📋 수동 변환 안내:")
            print("1. assets/store/icons/soksol_icon.svg 파일 확인")
            print("2. 온라인 SVG to PNG 변환기 사용:")
            print("   - https://convertio.co/svg-png/")
            print("   - https://cloudconvert.com/svg-to-png")
            print("3. 다음 크기로 변환:")
            print("   - 48x48 (mdpi)")
            print("   - 72x72 (hdpi)")
            print("   - 96x96 (xhdpi)")
            print("   - 144x144 (xxhdpi)")
            print("   - 192x192 (xxxhdpi)")
            print("4. mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-*/ic_launcher.png 로 저장")
            
            if not self.confirm_action("수동으로 아이콘을 변환했습니까?"):
                print("❌ 아이콘 변환이 필요합니다.")
                return False
        
        print("✅ 아이콘 생성 완료!")
        return True
    
    def step_screenshot_guide(self):
        """4단계: 스크린샷 촬영"""
        self.print_step(4, 7, "스크린샷 촬영")
        
        choice = self.interactive_choice(
            "스크린샷 촬영 방법을 선택하세요:",
            [
                "자동 촬영 도구 사용 (Android 디바이스 연결 필요)",
                "수동 촬영 (가이드 제공)",
                "이미 준비됨 (스킵)"
            ]
        )
        
        if choice == 0:  # 자동 촬영
            print("자동 스크린샷 촬영을 시작합니다...")
            success = self.run_script("screenshot-automation.py")
            
            if not success:
                print("❌ 자동 촬영 실패. 수동 촬영을 진행하세요.")
                choice = 1
        
        if choice == 1:  # 수동 촬영
            print("\n📱 수동 스크린샷 촬영 가이드:")
            print("1. SokSol 앱을 실행합니다")
            print("2. 다음 화면들을 촬영하세요:")
            print("   - 메인 화면")
            print("   - 채팅 시작 화면")
            print("   - AI와 대화 중인 화면")
            print("   - AI 응답 화면")
            print("   - 기타 중요한 기능 화면")
            print("3. 스크린샷을 assets/store/screenshots/ 폴더에 저장")
            print("4. 해상도: 1080x1920 권장")
            
            if not self.confirm_action("스크린샷 촬영을 완료했습니까?"):
                print("❌ 스크린샷이 필요합니다.")
                return False
        
        print("✅ 스크린샷 준비 완료!")
        return True
    
    def step_build_app(self):
        """5단계: 앱 빌드"""
        self.print_step(5, 7, "Android 앱 빌드")
        
        choice = self.interactive_choice(
            "빌드할 형태를 선택하세요:",
            [
                "AAB만 빌드 (Play Store용)",
                "APK만 빌드 (테스트용)",
                "AAB와 APK 모두 빌드",
                "이미 빌드됨 (스킵)"
            ]
        )
        
        if choice == 3:  # 스킵
            print("✅ 빌드 단계를 건너뜁니다.")
            return True
        
        build_types = ["bundle", "apk", "both"]
        build_type = build_types[choice]
        
        print(f"{build_type} 빌드를 시작합니다...")
        
        # 빌드 스크립트 실행
        script_path = self.scripts_path / "build-android-release.sh"
        
        try:
            if os.name == 'nt':  # Windows
                # Git Bash 또는 WSL 사용
                cmd = ["bash", str(script_path), build_type]
            else:
                cmd = ["bash", str(script_path), build_type]
            
            result = subprocess.run(cmd, cwd=self.base_path)
            success = result.returncode == 0
        except Exception as e:
            print(f"❌ 빌드 스크립트 실행 실패: {e}")
            success = False
        
        if not success:
            print("\n❌ 빌드 실패!")
            print("수동으로 빌드를 진행하세요:")
            print("1. Android Studio에서 mobile/soksol_mobile/SokSol 프로젝트 열기")
            print("2. Build > Generate Signed Bundle/APK 선택")
            print("3. AAB 형태로 빌드")
            
            if not self.confirm_action("수동으로 빌드를 완료했습니까?"):
                print("❌ 빌드가 필요합니다.")
                return False
        
        print("✅ 앱 빌드 완료!")
        return True
    
    def step_qa_validation(self):
        """6단계: QA 검증"""
        self.print_step(6, 7, "최종 QA 검증")
        
        print("앱과 자료들을 최종 검증합니다...")
        success = self.run_script("qa-validator.py")
        
        if not success:
            print("\n⚠️ QA 검증에서 문제가 발견되었습니다.")
            print("QA_REPORT.md 파일을 확인하고 문제를 수정하세요.")
            
            if not self.confirm_action("문제를 확인했고 계속 진행하시겠습니까?"):
                return False
        
        print("✅ QA 검증 완료!")
        return True
    
    def step_final_preparation(self):
        """7단계: 최종 준비"""
        self.print_step(7, 7, "Play Store 제출 최종 준비")
        
        print("체크리스트를 생성하고 최종 안내를 제공합니다...")
        self.run_script("playstore-prep.py", ["checklist"])
        
        print("\n🎉 모든 자동화 단계가 완료되었습니다!")
        print("\n📋 수동으로 해야 할 작업:")
        print("1. Google Play Console에서 새 앱 생성")
        print("2. 앱 정보 및 스크린샷 업로드")
        print("3. AAB 파일 업로드")
        print("4. 콘텐츠 등급 설정")
        print("5. 데이터 안전 섹션 작성")
        print("6. 내부 테스트 실행")
        print("7. 프로덕션 출시")
        
        print("\n📚 참고 문서:")
        print("- RELEASE_CHECKLIST.md: 완전한 체크리스트")
        print("- PLAY_CONSOLE_GUIDE.md: Play Console 설정 가이드")
        print("- QA_REPORT.md: 최종 QA 결과")
        print("- STORE_MATERIALS.md: 스토어 자료")
        
        print("\n🚀 Play Store 제출 준비가 완료되었습니다!")
        return True
    
    def run_full_preparation(self):
        """전체 준비 과정 실행"""
        self.print_header("SokSol Play Store 제출 준비")
        
        print("이 도구는 SokSol 앱의 Play Store 제출을 준비합니다.")
        print("7단계로 구성되어 있으며, 각 단계별로 안내를 제공합니다.")
        
        if not self.confirm_action("준비를 시작하시겠습니까?"):
            print("🛑 작업이 취소되었습니다.")
            return False
        
        steps = [
            self.step_environment_check,
            self.step_project_validation,
            self.step_icon_generation,
            self.step_screenshot_guide,
            self.step_build_app,
            self.step_qa_validation,
            self.step_final_preparation,
        ]
        
        start_time = datetime.now()
        
        for i, step_func in enumerate(steps, 1):
            success = step_func()
            
            if not success:
                print(f"\n❌ 단계 {i}에서 문제가 발생했습니다.")
                if not self.confirm_action("계속 진행하시겠습니까?"):
                    print("🛑 작업이 중단되었습니다.")
                    return False
            
            if i < len(steps):
                time.sleep(1)  # 단계 간 잠시 대기
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        self.print_header("완료!")
        print(f"🕐 소요 시간: {duration}")
        print("🎉 SokSol Play Store 제출 준비가 완료되었습니다!")
        print("\n📋 다음 단계:")
        print("1. RELEASE_CHECKLIST.md 파일을 확인하세요")
        print("2. Google Play Console에서 앱을 업로드하세요")
        print("3. 내부 테스트 후 프로덕션 출시하세요")
        
        return True

def main():
    """메인 함수"""
    master = PlayStoreMaster()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'quick':
            # 빠른 검증만
            print("🔍 빠른 상태 검증")
            master.run_script("playstore-prep.py")
        elif command == 'qa':
            # QA만
            print("🔍 QA 검증")
            master.run_script("qa-validator.py")
        elif command == 'build':
            # 빌드만
            print("🔨 앱 빌드")
            master.step_build_app()
        else:
            print("사용법: python master-prep.py [quick|qa|build]")
            print("  quick - 빠른 상태 검증")
            print("  qa    - QA 검증만")
            print("  build - 빌드만")
            print("  (인자 없음) - 전체 준비 과정")
            return 1
    else:
        # 전체 과정
        success = master.run_full_preparation()
        return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
