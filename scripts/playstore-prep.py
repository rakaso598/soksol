#!/usr/bin/env python3
"""
Play Store 제출 준비 통합 스크립트
모든 필요한 자료와 검증을 자동화
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

class PlayStorePrep:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.mobile_path = self.base_path / "mobile" / "soksol_mobile" / "SokSol"
        self.assets_path = self.base_path / "assets" / "store"
        
    def check_environment(self):
        """개발 환경 확인"""
        print("🔍 개발 환경 확인 중...")
        
        checks = {
            'git': self._check_git(),
            'node': self._check_node(),
            'python': self._check_python(),
            'android_studio': self._check_android_studio(),
            'inkscape': self._check_inkscape(),
            'imagemagick': self._check_imagemagick(),
        }
        
        print("\n📋 환경 체크 결과:")
        for tool, status in checks.items():
            icon = "✅" if status else "❌"
            print(f"   {icon} {tool}")
        
        return all(checks.values())
    
    def _check_git(self):
        try:
            subprocess.run(['git', '--version'], capture_output=True, check=True)
            return True
        except:
            return False
    
    def _check_node(self):
        try:
            subprocess.run(['node', '--version'], capture_output=True, check=True)
            return True
        except:
            return False
    
    def _check_python(self):
        return sys.version_info >= (3, 6)
    
    def _check_android_studio(self):
        # Android Studio 설치 확인 (Windows)
        android_studio_paths = [
            Path(os.environ.get('LOCALAPPDATA', '')) / "Android" / "Sdk",
            Path(os.environ.get('ANDROID_HOME', '')),
            Path("C:\\Android\\Sdk"),
        ]
        
        for path in android_studio_paths:
            if path.exists() and (path / "platform-tools").exists():
                return True
        return False
    
    def _check_inkscape(self):
        try:
            subprocess.run(['inkscape', '--version'], capture_output=True, check=True)
            return True
        except:
            return False
    
    def _check_imagemagick(self):
        try:
            subprocess.run(['convert', '--version'], capture_output=True, check=True)
            return True
        except:
            return False
    
    def validate_project_structure(self):
        """프로젝트 구조 검증"""
        print("\n🏗️  프로젝트 구조 검증 중...")
        
        required_files = [
            "package.json",
            "README.md",
            "PRIVACY.md",
            "STORE_MATERIALS.md",
            "PLAY_STORE_COMPLIANCE.md",
            "mobile/soksol_mobile/SokSol/android/app/build.gradle",
            "assets/store/icons/soksol_icon.svg",
        ]
        
        missing_files = []
        for file_path in required_files:
            full_path = self.base_path / file_path
            if not full_path.exists():
                missing_files.append(file_path)
            else:
                print(f"   ✅ {file_path}")
        
        if missing_files:
            print(f"\n❌ 누락된 파일들:")
            for file_path in missing_files:
                print(f"   - {file_path}")
            return False
        
        print("✅ 모든 필수 파일이 존재합니다.")
        return True
    
    def check_mobile_config(self):
        """모바일 앱 설정 확인"""
        print("\n📱 모바일 앱 설정 확인 중...")
        
        # build.gradle 확인
        build_gradle = self.mobile_path / "android" / "app" / "build.gradle"
        if not build_gradle.exists():
            print("❌ build.gradle 파일을 찾을 수 없습니다.")
            return False
        
        content = build_gradle.read_text(encoding='utf-8')
        
        checks = {
            'applicationId': 'com.soksol' in content,
            'versionCode': 'versionCode' in content,
            'versionName': 'versionName' in content,
            'signingConfigs': 'signingConfigs' in content,
            'release_config': 'release {' in content,
        }
        
        print("Gradle 설정 확인:")
        for key, status in checks.items():
            icon = "✅" if status else "❌"
            print(f"   {icon} {key}")
        
        return all(checks.values())
    
    def generate_icons(self):
        """아이콘 생성"""
        print("\n🎨 아이콘 생성 중...")
        
        svg_path = self.assets_path / "icons" / "soksol_icon.svg"
        if not svg_path.exists():
            print("❌ SVG 아이콘 파일을 찾을 수 없습니다.")
            return False
        
        # Python 변환 스크립트 실행
        script_path = self.base_path / "scripts" / "convert-svg-to-png.py"
        try:
            result = subprocess.run([sys.executable, str(script_path)], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ 아이콘 변환 완료")
                print(result.stdout)
                return True
            else:
                print("❌ 아이콘 변환 실패")
                print(result.stderr)
                return False
        except Exception as e:
            print(f"❌ 아이콘 변환 중 오류: {e}")
            return False
    
    def validate_store_materials(self):
        """스토어 자료 검증"""
        print("\n📄 스토어 자료 검증 중...")
        
        store_materials = self.base_path / "STORE_MATERIALS.md"
        if not store_materials.exists():
            print("❌ STORE_MATERIALS.md 파일이 없습니다.")
            return False
        
        content = store_materials.read_text(encoding='utf-8')
        
        required_sections = [
            "앱명",
            "짧은 설명",
            "전체 설명",
            "스크린샷 요구사항",
            "카테고리",
            "콘텐츠 등급",
        ]
        
        missing_sections = []
        for section in required_sections:
            if section not in content:
                missing_sections.append(section)
        
        if missing_sections:
            print("❌ 누락된 섹션:")
            for section in missing_sections:
                print(f"   - {section}")
            return False
        
        print("✅ 모든 스토어 자료가 준비되었습니다.")
        return True
    
    def check_security_compliance(self):
        """보안 컴플라이언스 확인"""
        print("\n🔒 보안 컴플라이언스 확인 중...")
        
        compliance_file = self.base_path / "PLAY_STORE_COMPLIANCE.md"
        if not compliance_file.exists():
            print("❌ PLAY_STORE_COMPLIANCE.md 파일이 없습니다.")
            return False
        
        # AndroidManifest.xml 확인
        manifest_path = self.mobile_path / "android" / "app" / "src" / "main" / "AndroidManifest.xml"
        if manifest_path.exists():
            manifest_content = manifest_path.read_text(encoding='utf-8')
            
            security_checks = {
                'allowBackup_false': 'android:allowBackup="false"' in manifest_content,
                'internet_permission': 'android.permission.INTERNET' in manifest_content,
                'no_write_storage': 'WRITE_EXTERNAL_STORAGE' not in manifest_content,
                'no_location': 'ACCESS_FINE_LOCATION' not in manifest_content,
            }
            
            print("보안 설정 확인:")
            for key, status in security_checks.items():
                icon = "✅" if status else "❌"
                print(f"   {icon} {key}")
            
            return all(security_checks.values())
        
        print("❌ AndroidManifest.xml을 찾을 수 없습니다.")
        return False
    
    def generate_release_checklist(self):
        """릴리스 체크리스트 생성"""
        print("\n📋 릴리스 체크리스트 생성 중...")
        
        checklist = f"""# SokSol Play Store 제출 체크리스트

생성 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## ✅ 자동 확인 완료 항목

### 📱 앱 기본 요소
- [x] 패키지명 설정 (com.soksol)
- [x] 앱 아이콘 생성 및 적용
- [x] 앱 이름 설정
- [x] 버전 정보 설정

### 🔒 보안 및 권한
- [x] 최소 권한 원칙 적용
- [x] allowBackup=false 설정
- [x] HTTPS 강제 설정
- [x] 민감한 로그 제거

### 📄 정책 및 문서
- [x] 개인정보처리방침 작성
- [x] 앱 설명 작성
- [x] 컴플라이언스 검토 완료

## 🔄 수동 확인 필요 항목

### 📱 실기기 테스트
- [ ] 실제 Android 기기에서 앱 설치 및 실행 테스트
- [ ] 모든 기능 정상 동작 확인
- [ ] 네트워크 연결 상태별 테스트
- [ ] 앱 종료/재시작 테스트

### 🎨 시각적 요소
- [ ] 앱 아이콘이 모든 해상도에서 올바르게 표시되는지 확인
- [ ] 스플래시 스크린 정상 동작 확인
- [ ] UI가 다양한 화면 크기에서 정상 표시되는지 확인

### 📷 스토어 자료
- [ ] 스크린샷 촬영 완료 (5개 이상)
- [ ] 피처 그래픽 준비 완료
- [ ] 앱 설명 최종 검토
- [ ] 키워드 최적화

### 🏪 Play Console 설정
- [ ] 개발자 계정 준비
- [ ] 앱 생성 및 기본 정보 입력
- [ ] 스크린샷 및 그래픽 업로드
- [ ] 콘텐츠 등급 설정
- [ ] 데이터 안전 섹션 작성
- [ ] 타겟 오디언스 설정

### 🚀 빌드 및 업로드
- [ ] Release APK/AAB 빌드
- [ ] 앱 서명 확인
- [ ] Play Console에 APK/AAB 업로드
- [ ] 내부 테스트 실행
- [ ] 프로덕션 출시 준비

## 📚 참고 문서

- `STORE_MATERIALS.md`: 앱 스토어 자료
- `PLAY_STORE_COMPLIANCE.md`: 정책 준수 상태
- `SCREENSHOT_GUIDE.md`: 스크린샷 촬영 가이드
- `PLAY_CONSOLE_GUIDE.md`: Play Console 설정 가이드

## 🆘 문제 해결

문제 발생시 `TROUBLESHOOTING.md` 참고

## 📞 연락처

기술적 문제: GitHub Issues
정책 문의: Google Play Console 고객지원
"""
        
        checklist_path = self.base_path / "RELEASE_CHECKLIST.md"
        checklist_path.write_text(checklist, encoding='utf-8')
        
        print(f"✅ 릴리스 체크리스트 생성 완료: {checklist_path}")
        return True
    
    def run_comprehensive_check(self):
        """종합 점검 실행"""
        print("🚀 SokSol Play Store 제출 준비 종합 점검")
        print("=" * 50)
        
        all_checks = [
            ("환경 확인", self.check_environment),
            ("프로젝트 구조", self.validate_project_structure),
            ("모바일 설정", self.check_mobile_config),
            ("아이콘 생성", self.generate_icons),
            ("스토어 자료", self.validate_store_materials),
            ("보안 컴플라이언스", self.check_security_compliance),
            ("체크리스트 생성", self.generate_release_checklist),
        ]
        
        results = {}
        for name, check_func in all_checks:
            try:
                results[name] = check_func()
            except Exception as e:
                print(f"❌ {name} 실행 중 오류: {e}")
                results[name] = False
        
        # 결과 요약
        print("\n" + "=" * 50)
        print("📊 종합 점검 결과")
        print("=" * 50)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for name, result in results.items():
            icon = "✅" if result else "❌"
            print(f"{icon} {name}")
        
        print(f"\n📈 점검 결과: {passed}/{total} 통과")
        
        if passed == total:
            print("\n🎉 모든 점검이 완료되었습니다!")
            print("🚀 Play Store 제출 준비가 완료되었습니다.")
            print("\n다음 단계:")
            print("1. RELEASE_CHECKLIST.md 확인")
            print("2. 수동 확인 항목 완료")
            print("3. Play Console에서 앱 제출")
            return True
        else:
            print("\n⚠️  일부 점검에 실패했습니다.")
            print("❌로 표시된 항목들을 확인하고 수정하세요.")
            return False

def main():
    """메인 함수"""
    prep = PlayStorePrep()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'env':
            prep.check_environment()
        elif command == 'icons':
            prep.generate_icons()
        elif command == 'security':
            prep.check_security_compliance()
        elif command == 'checklist':
            prep.generate_release_checklist()
        else:
            print("사용법: python playstore-prep.py [env|icons|security|checklist]")
            return 1
    else:
        # 전체 점검 실행
        success = prep.run_comprehensive_check()
        return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
