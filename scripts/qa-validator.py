#!/usr/bin/env python3
"""
Play Store 제출 전 최종 QA 스크립트
모든 요구사항과 품질을 최종 검증
"""

import os
import sys
import json
import re
import subprocess
from pathlib import Path
from datetime import datetime
import xml.etree.ElementTree as ET

class QAValidator:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.mobile_path = self.base_path / "mobile" / "soksol_mobile" / "SokSol"
        self.assets_path = self.base_path / "assets" / "store"
        self.issues = []
        self.warnings = []
        self.passed = []
        
    def add_issue(self, category, description, severity="error"):
        """이슈 추가"""
        self.issues.append({
            'category': category,
            'description': description,
            'severity': severity,
            'timestamp': datetime.now().isoformat()
        })
    
    def add_warning(self, category, description):
        """경고 추가"""
        self.warnings.append({
            'category': category,
            'description': description,
            'timestamp': datetime.now().isoformat()
        })
    
    def add_passed(self, category, description):
        """통과 항목 추가"""
        self.passed.append({
            'category': category,
            'description': description,
            'timestamp': datetime.now().isoformat()
        })
    
    def validate_app_metadata(self):
        """앱 메타데이터 검증"""
        print("📱 앱 메타데이터 검증 중...")
        
        # build.gradle 검증
        build_gradle = self.mobile_path / "android" / "app" / "build.gradle"
        if not build_gradle.exists():
            self.add_issue("metadata", "build.gradle 파일을 찾을 수 없음")
            return
        
        content = build_gradle.read_text(encoding='utf-8')
        
        # 필수 필드 확인
        required_fields = {
            'applicationId': r'applicationId\s*["\']([^"\']+)["\']',
            'versionCode': r'versionCode\s*(\d+)',
            'versionName': r'versionName\s*["\']([^"\']+)["\']',
            'compileSdkVersion': r'compileSdkVersion\s*(\d+)',
            'targetSdkVersion': r'targetSdkVersion\s*(\d+)',
        }
        
        for field, pattern in required_fields.items():
            match = re.search(pattern, content)
            if match:
                value = match.group(1)
                self.add_passed("metadata", f"{field}: {value}")
                
                # 특별 검증
                if field == 'applicationId' and not value.startswith('com.soksol'):
                    self.add_warning("metadata", f"패키지명이 표준과 다름: {value}")
                elif field == 'targetSdkVersion' and int(value) < 31:
                    self.add_warning("metadata", f"타겟 SDK가 낮음: {value} (권장: 31+)")
            else:
                self.add_issue("metadata", f"{field}가 설정되지 않음")
    
    def validate_permissions(self):
        """권한 검증"""
        print("🔒 권한 설정 검증 중...")
        
        manifest_path = self.mobile_path / "android" / "app" / "src" / "main" / "AndroidManifest.xml"
        if not manifest_path.exists():
            self.add_issue("permissions", "AndroidManifest.xml을 찾을 수 없음")
            return
        
        try:
            tree = ET.parse(manifest_path)
            root = tree.getroot()
            
            # 권한 목록 확인
            permissions = root.findall('.//uses-permission')
            permission_names = [perm.get('{http://schemas.android.com/apk/res/android}name') for perm in permissions]
            
            # 허용된 권한 (최소 권한 원칙)
            allowed_permissions = {
                'android.permission.INTERNET',
                'android.permission.ACCESS_NETWORK_STATE',
            }
            
            # 권한 검증
            for perm in permission_names:
                if perm in allowed_permissions:
                    self.add_passed("permissions", f"필요한 권한: {perm}")
                else:
                    self.add_issue("permissions", f"불필요한 권한: {perm}")
            
            # 필수 권한 확인
            if 'android.permission.INTERNET' not in permission_names:
                self.add_issue("permissions", "INTERNET 권한이 없음 (WebView 앱에 필수)")
            
            # 보안 설정 확인
            application = root.find('.//application')
            if application is not None:
                allow_backup = application.get('{http://schemas.android.com/apk/res/android}allowBackup')
                if allow_backup == 'false':
                    self.add_passed("permissions", "allowBackup=false 설정됨")
                else:
                    self.add_issue("permissions", "allowBackup이 false로 설정되지 않음")
        
        except ET.ParseError as e:
            self.add_issue("permissions", f"AndroidManifest.xml 파싱 오류: {e}")
    
    def validate_icons(self):
        """아이콘 검증"""
        print("🎨 아이콘 검증 중...")
        
        # 필요한 아이콘 크기
        required_icons = {
            'mipmap-mdpi': 48,
            'mipmap-hdpi': 72,
            'mipmap-xhdpi': 96,
            'mipmap-xxhdpi': 144,
            'mipmap-xxxhdpi': 192,
        }
        
        res_path = self.mobile_path / "android" / "app" / "src" / "main" / "res"
        
        for folder, expected_size in required_icons.items():
            folder_path = res_path / folder
            icon_path = folder_path / "ic_launcher.png"
            round_icon_path = folder_path / "ic_launcher_round.png"
            
            if icon_path.exists():
                self.add_passed("icons", f"{folder}/ic_launcher.png 존재")
                
                # 이미지 크기 검증 (PIL 사용 가능시)
                try:
                    from PIL import Image
                    with Image.open(icon_path) as img:
                        width, height = img.size
                        if width == expected_size and height == expected_size:
                            self.add_passed("icons", f"{folder} 크기 정확: {width}x{height}")
                        else:
                            self.add_warning("icons", f"{folder} 크기 부정확: {width}x{height} (예상: {expected_size}x{expected_size})")
                except ImportError:
                    # PIL 없으면 크기 검증 스킵
                    pass
                except Exception as e:
                    self.add_warning("icons", f"{folder} 이미지 검증 실패: {e}")
            else:
                self.add_issue("icons", f"{folder}/ic_launcher.png 누락")
            
            if round_icon_path.exists():
                self.add_passed("icons", f"{folder}/ic_launcher_round.png 존재")
            else:
                self.add_warning("icons", f"{folder}/ic_launcher_round.png 누락")
    
    def validate_store_materials(self):
        """스토어 자료 검증"""
        print("📄 스토어 자료 검증 중...")
        
        # 필수 파일들
        required_files = {
            'STORE_MATERIALS.md': '스토어 자료',
            'PRIVACY.md': '개인정보처리방침',
            'PLAY_STORE_COMPLIANCE.md': '정책 준수 문서',
        }
        
        for filename, description in required_files.items():
            file_path = self.base_path / filename
            if file_path.exists():
                self.add_passed("store_materials", f"{description} 존재")
                
                # 파일 크기 확인
                size = file_path.stat().st_size
                if size > 100:  # 100바이트 이상
                    self.add_passed("store_materials", f"{description} 충분한 내용 ({size} bytes)")
                else:
                    self.add_warning("store_materials", f"{description} 내용 부족 ({size} bytes)")
            else:
                self.add_issue("store_materials", f"{description} 누락: {filename}")
        
        # 스크린샷 확인
        screenshots_dir = self.assets_path / "screenshots"
        if screenshots_dir.exists():
            screenshot_files = list(screenshots_dir.glob("*.png"))
            if len(screenshot_files) >= 2:
                self.add_passed("store_materials", f"스크린샷 {len(screenshot_files)}개 준비됨")
            else:
                self.add_warning("store_materials", f"스크린샷 부족: {len(screenshot_files)}개 (최소 2개 필요)")
        else:
            self.add_warning("store_materials", "스크린샷 폴더 없음")
        
        # 피처 그래픽 확인
        feature_graphic = self.assets_path / "graphics" / "feature_graphic.png"
        if feature_graphic.exists():
            self.add_passed("store_materials", "피처 그래픽 존재")
        else:
            self.add_warning("store_materials", "피처 그래픽 누락")
    
    def validate_build_outputs(self):
        """빌드 결과물 검증"""
        print("🔨 빌드 결과물 검증 중...")
        
        # AAB 파일 확인
        aab_path = self.mobile_path / "android" / "app" / "build" / "outputs" / "bundle" / "release" / "app-release.aab"
        if aab_path.exists():
            size = aab_path.stat().st_size
            if size > 1024 * 1024:  # 1MB 이상
                self.add_passed("build", f"AAB 파일 존재 ({size // 1024 // 1024} MB)")
            else:
                self.add_warning("build", f"AAB 파일 크기 의심스러움: {size} bytes")
        else:
            self.add_issue("build", "AAB 파일 없음 - 빌드 필요")
        
        # APK 파일 확인 (선택사항)
        apk_path = self.mobile_path / "android" / "app" / "build" / "outputs" / "apk" / "release" / "app-release.apk"
        if apk_path.exists():
            size = apk_path.stat().st_size
            self.add_passed("build", f"APK 파일 존재 ({size // 1024 // 1024} MB)")
        else:
            self.add_warning("build", "APK 파일 없음 (테스트용으로 권장)")
    
    def validate_security(self):
        """보안 설정 검증"""
        print("🛡️ 보안 설정 검증 중...")
        
        # Gradle 보안 설정
        build_gradle = self.mobile_path / "android" / "app" / "build.gradle"
        if build_gradle.exists():
            content = build_gradle.read_text(encoding='utf-8')
            
            # 서명 설정 확인
            if 'signingConfigs' in content:
                self.add_passed("security", "서명 설정 존재")
            else:
                self.add_issue("security", "서명 설정 없음")
            
            # ProGuard/R8 설정 확인
            if 'minifyEnabled true' in content:
                self.add_passed("security", "코드 난독화 활성화됨")
            else:
                self.add_warning("security", "코드 난독화 비활성화됨")
        
        # 네트워크 보안 설정 확인
        network_config = self.mobile_path / "android" / "app" / "src" / "main" / "res" / "xml" / "network_security_config.xml"
        if network_config.exists():
            self.add_passed("security", "네트워크 보안 설정 존재")
        else:
            self.add_warning("security", "네트워크 보안 설정 파일 없음")
    
    def validate_compliance(self):
        """정책 준수 검증"""
        print("📋 정책 준수 검증 중...")
        
        # 개인정보처리방침 검증
        privacy_file = self.base_path / "PRIVACY.md"
        if privacy_file.exists():
            content = privacy_file.read_text(encoding='utf-8')
            
            required_sections = [
                "개인정보 수집",
                "데이터 처리",
                "데이터 저장",
                "연락처",
            ]
            
            missing_sections = []
            for section in required_sections:
                if section not in content:
                    missing_sections.append(section)
            
            if not missing_sections:
                self.add_passed("compliance", "개인정보처리방침 모든 섹션 포함")
            else:
                self.add_warning("compliance", f"개인정보처리방침 누락 섹션: {', '.join(missing_sections)}")
        
        # 컴플라이언스 문서 검증
        compliance_file = self.base_path / "PLAY_STORE_COMPLIANCE.md"
        if compliance_file.exists():
            self.add_passed("compliance", "Play Store 컴플라이언스 문서 존재")
        else:
            self.add_issue("compliance", "Play Store 컴플라이언스 문서 없음")
    
    def generate_qa_report(self):
        """QA 보고서 생성"""
        print("\n📊 QA 보고서 생성 중...")
        
        total_issues = len(self.issues)
        total_warnings = len(self.warnings)
        total_passed = len(self.passed)
        
        # 심각도별 분류
        critical_issues = [issue for issue in self.issues if issue['severity'] == 'critical']
        error_issues = [issue for issue in self.issues if issue['severity'] == 'error']
        
        # 보고서 생성
        report = f"""# SokSol Play Store 제출 전 QA 보고서

생성 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📊 전체 요약

- ✅ 통과: {total_passed}개
- ⚠️ 경고: {total_warnings}개  
- ❌ 오류: {total_issues}개
- 🚨 심각: {len(critical_issues)}개

## 🏆 통과 항목

"""
        
        # 카테고리별 통과 항목
        categories = {}
        for item in self.passed:
            cat = item['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(item)
        
        for category, items in categories.items():
            report += f"\n### {category.title()}\n"
            for item in items:
                report += f"- ✅ {item['description']}\n"
        
        # 경고 항목
        if self.warnings:
            report += "\n## ⚠️ 경고 항목\n"
            warning_categories = {}
            for item in self.warnings:
                cat = item['category']
                if cat not in warning_categories:
                    warning_categories[cat] = []
                warning_categories[cat].append(item)
            
            for category, items in warning_categories.items():
                report += f"\n### {category.title()}\n"
                for item in items:
                    report += f"- ⚠️ {item['description']}\n"
        
        # 오류 항목
        if self.issues:
            report += "\n## ❌ 해결 필요 항목\n"
            issue_categories = {}
            for item in self.issues:
                cat = item['category']
                if cat not in issue_categories:
                    issue_categories[cat] = []
                issue_categories[cat].append(item)
            
            for category, items in issue_categories.items():
                report += f"\n### {category.title()}\n"
                for item in items:
                    severity_icon = "🚨" if item['severity'] == 'critical' else "❌"
                    report += f"- {severity_icon} {item['description']}\n"
        
        # 권장사항
        report += f"""

## 🚀 제출 권장사항

### Play Store 제출 가능 여부
"""
        
        if len(critical_issues) > 0:
            report += "🚨 **제출 불가**: 심각한 오류가 있습니다. 반드시 수정 후 제출하세요.\n"
        elif len(error_issues) > 0:
            report += "⚠️ **주의 필요**: 오류가 있지만 제출은 가능합니다. 수정을 권장합니다.\n"
        else:
            report += "✅ **제출 가능**: 모든 필수 요구사항을 충족합니다.\n"
        
        report += f"""

### 다음 단계

1. **오류 수정**: 위의 ❌ 항목들을 수정하세요
2. **경고 검토**: ⚠️ 항목들을 검토하고 필요시 개선하세요
3. **최종 테스트**: 실기기에서 앱을 테스트하세요
4. **Play Console**: 앱을 업로드하고 메타데이터를 입력하세요

### 참고 문서

- `RELEASE_CHECKLIST.md`: 제출 체크리스트
- `PLAY_CONSOLE_GUIDE.md`: Play Console 설정 가이드
- `TROUBLESHOOTING.md`: 문제 해결 가이드

---
*이 보고서는 자동으로 생성되었습니다. 추가 검토가 필요할 수 있습니다.*
"""
        
        # 보고서 저장
        report_path = self.base_path / "QA_REPORT.md"
        report_path.write_text(report, encoding='utf-8')
        
        print(f"✅ QA 보고서 생성 완료: {report_path}")
        return report_path
    
    def run_full_qa(self):
        """전체 QA 실행"""
        print("🔍 SokSol Play Store 제출 전 QA 시작")
        print("=" * 50)
        
        # 모든 검증 실행
        validations = [
            self.validate_app_metadata,
            self.validate_permissions,
            self.validate_icons,
            self.validate_store_materials,
            self.validate_build_outputs,
            self.validate_security,
            self.validate_compliance,
        ]
        
        for validation in validations:
            try:
                validation()
            except Exception as e:
                self.add_issue("system", f"검증 중 오류: {validation.__name__} - {e}")
        
        # 보고서 생성
        report_path = self.generate_qa_report()
        
        # 결과 요약 출력
        print("\n" + "=" * 50)
        print("📊 QA 결과 요약")
        print("=" * 50)
        
        critical_count = len([issue for issue in self.issues if issue['severity'] == 'critical'])
        
        print(f"✅ 통과: {len(self.passed)}개")
        print(f"⚠️ 경고: {len(self.warnings)}개")
        print(f"❌ 오류: {len(self.issues)}개")
        print(f"🚨 심각: {critical_count}개")
        
        # 제출 권장사항
        if critical_count > 0:
            print("\n🚨 제출 불가: 심각한 오류를 수정하세요")
            return False
        elif len(self.issues) > 0:
            print("\n⚠️ 주의: 오류가 있지만 제출 가능합니다")
            return True
        else:
            print("\n🎉 제출 준비 완료!")
            return True

def main():
    """메인 함수"""
    qa = QAValidator()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'metadata':
            qa.validate_app_metadata()
        elif command == 'permissions':
            qa.validate_permissions()
        elif command == 'icons':
            qa.validate_icons()
        elif command == 'store':
            qa.validate_store_materials()
        elif command == 'build':
            qa.validate_build_outputs()
        elif command == 'security':
            qa.validate_security()
        elif command == 'compliance':
            qa.validate_compliance()
        else:
            print("사용법: python qa-validator.py [metadata|permissions|icons|store|build|security|compliance]")
            return 1
        
        # 단일 검증 결과 출력
        if qa.issues:
            print("❌ 발견된 문제:")
            for issue in qa.issues:
                print(f"   - {issue['description']}")
        
        if qa.warnings:
            print("⚠️ 경고:")
            for warning in qa.warnings:
                print(f"   - {warning['description']}")
        
        if qa.passed:
            print("✅ 통과:")
            for passed in qa.passed:
                print(f"   - {passed['description']}")
    else:
        # 전체 QA 실행
        success = qa.run_full_qa()
        return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
