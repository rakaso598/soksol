#!/usr/bin/env python3
"""
SVG to PNG 변환 스크립트
아이콘 및 그래픽 자동 변환을 위한 Python 스크립트
"""

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """필요한 도구들이 설치되었는지 확인"""
    dependencies = {
        'inkscape': 'Inkscape (벡터 그래픽 편집기)',
        'convert': 'ImageMagick (이미지 변환 도구)'
    }
    
    available = {}
    for cmd, desc in dependencies.items():
        try:
            result = subprocess.run([cmd, '--version'], 
                                  capture_output=True, text=True)
            available[cmd] = result.returncode == 0
        except FileNotFoundError:
            available[cmd] = False
    
    return available

def install_guide():
    """설치 가이드 출력"""
    print("🔧 필요한 도구 설치 가이드:")
    print("\n1. Inkscape 설치:")
    print("   - Windows: https://inkscape.org/release/")
    print("   - 또는 winget install Inkscape.Inkscape")
    
    print("\n2. ImageMagick 설치:")
    print("   - Windows: https://imagemagick.org/script/download.php#windows")
    print("   - 또는 winget install ImageMagick.ImageMagick")
    
    print("\n3. 설치 후 환경변수 PATH에 추가되었는지 확인")
    print("   - 새 터미널에서 'inkscape --version' 실행 가능해야 함")

def convert_svg_to_png(svg_path, output_path, size):
    """SVG를 PNG로 변환"""
    svg_path = Path(svg_path)
    output_path = Path(output_path)
    
    if not svg_path.exists():
        print(f"❌ SVG 파일을 찾을 수 없습니다: {svg_path}")
        return False
    
    # 출력 디렉토리 생성
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Inkscape를 사용한 변환 (더 좋은 품질)
    try:
        cmd = [
            'inkscape',
            '--export-type=png',
            f'--export-width={size}',
            f'--export-height={size}',
            f'--export-filename={output_path}',
            str(svg_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ 변환 완료: {output_path} ({size}x{size})")
            return True
        else:
            print(f"❌ Inkscape 변환 실패: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ Inkscape가 설치되지 않았습니다.")
        return False

def convert_app_icons():
    """앱 아이콘 변환"""
    base_path = Path(__file__).parent.parent
    svg_path = base_path / "assets" / "store" / "icons" / "soksol_icon.svg"
    
    # Android 아이콘 크기와 경로
    android_icons = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    
    android_base = base_path / "mobile" / "soksol_mobile" / "SokSol" / "android" / "app" / "src" / "main" / "res"
    
    success_count = 0
    total_count = len(android_icons)
    
    print("📱 Android 앱 아이콘 변환 중...")
    
    for folder, size in android_icons.items():
        output_path = android_base / folder / "ic_launcher.png"
        if convert_svg_to_png(svg_path, output_path, size):
            success_count += 1
        
        # Round 아이콘도 생성
        output_path_round = android_base / folder / "ic_launcher_round.png"
        if convert_svg_to_png(svg_path, output_path_round, size):
            pass  # 이미 카운트됨
    
    # 512x512 피처 그래픽도 생성
    feature_graphic_path = base_path / "assets" / "store" / "graphics" / "feature_graphic.png"
    print("\n🎨 피처 그래픽 생성 중...")
    if convert_svg_to_png(svg_path, feature_graphic_path, 512):
        print("✅ 피처 그래픽 생성 완료")
    
    print(f"\n📊 변환 결과: {success_count}/{total_count} 성공")
    
    if success_count == total_count:
        print("🎉 모든 아이콘 변환이 완료되었습니다!")
        return True
    else:
        print("⚠️  일부 아이콘 변환에 실패했습니다.")
        return False

def main():
    """메인 함수"""
    print("🎨 SokSol SVG to PNG 변환 도구")
    print("=" * 40)
    
    # 의존성 확인
    deps = check_dependencies()
    missing_deps = [cmd for cmd, available in deps.items() if not available]
    
    if missing_deps:
        print("❌ 필요한 도구가 설치되지 않았습니다:")
        for dep in missing_deps:
            print(f"   - {dep}")
        print()
        install_guide()
        return 1
    
    print("✅ 모든 필요한 도구가 설치되어 있습니다.")
    print()
    
    # 아이콘 변환 실행
    if convert_app_icons():
        print("\n🚀 다음 단계:")
        print("1. mobile/soksol_mobile/SokSol 프로젝트를 Android Studio에서 열기")
        print("2. 빌드하여 아이콘이 제대로 적용되었는지 확인")
        print("3. Release APK/AAB 생성")
        return 0
    else:
        print("\n❌ 변환 과정에서 오류가 발생했습니다.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
