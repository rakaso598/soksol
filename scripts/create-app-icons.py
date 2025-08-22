#!/usr/bin/env python3
"""
SokSol 앱 아이콘 생성 스크립트
속솔 로고 SVG를 활용하여 모든 안드로이드 아이콘 크기 생성
"""

import os
import subprocess
import json
from pathlib import Path

def run_command(cmd):
    """명령어 실행"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ 명령어 실행 실패: {cmd}")
            print(f"에러: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"❌ 에러: {e}")
        return False

def create_directories():
    """필요한 디렉토리 생성"""
    dirs = [
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-mdpi",
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-hdpi", 
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xhdpi",
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxhdpi",
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxxhdpi",
        "assets/store/icons",
        "assets/store/graphics"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    print("✅ 디렉토리 생성 완료")

def convert_svg_to_png():
    """SVG를 다양한 크기의 PNG로 변환"""
    
    # 안드로이드 아이콘 크기 정의
    android_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }
    
    # Play Store 아이콘 크기
    playstore_size = 512
    
    svg_path = "public/logo.svg"
    
    if not os.path.exists(svg_path):
        print(f"❌ SVG 파일을 찾을 수 없습니다: {svg_path}")
        return False
    
    print("🎨 SVG → PNG 변환 시작...")
    
    # ImageMagick을 사용해서 변환 시도
    print("📦 ImageMagick 사용 시도...")
    
    # 안드로이드 아이콘 생성
    for folder, size in android_sizes.items():
        output_dir = f"mobile/soksol_mobile/SokSol/android/app/src/main/res/{folder}"
        
        # ic_launcher.png
        cmd = f'magick "{svg_path}" -resize {size}x{size} -background none "{output_dir}/ic_launcher.png"'
        if run_command(cmd):
            print(f"✅ {folder}/ic_launcher.png ({size}x{size}) 생성 완료")
        else:
            # ImageMagick이 없으면 inkscape 시도
            cmd = f'inkscape "{svg_path}" -w {size} -h {size} -o "{output_dir}/ic_launcher.png"'
            if run_command(cmd):
                print(f"✅ {folder}/ic_launcher.png ({size}x{size}) 생성 완료 (inkscape)")
            else:
                print(f"❌ {folder}/ic_launcher.png 생성 실패")
        
        # ic_launcher_round.png (같은 이미지 복사)
        if os.path.exists(f"{output_dir}/ic_launcher.png"):
            run_command(f'cp "{output_dir}/ic_launcher.png" "{output_dir}/ic_launcher_round.png"')
            print(f"✅ {folder}/ic_launcher_round.png 복사 완료")
    
    # Play Store 아이콘 생성 (512x512)
    playstore_output = "assets/store/icons/soksol_icon.png"
    cmd = f'magick "{svg_path}" -resize {playstore_size}x{playstore_size} -background none "{playstore_output}"'
    if run_command(cmd):
        print(f"✅ Play Store 아이콘 생성 완료: {playstore_output}")
    else:
        cmd = f'inkscape "{svg_path}" -w {playstore_size} -h {playstore_size} -o "{playstore_output}"'
        if run_command(cmd):
            print(f"✅ Play Store 아이콘 생성 완료 (inkscape): {playstore_output}")
        else:
            print(f"❌ Play Store 아이콘 생성 실패")
    
    return True

def create_adaptive_icons():
    """Adaptive Icon XML 파일 생성"""
    
    adaptive_icon_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher" />
</adaptive-icon>'''
    
    adaptive_dirs = [
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26"
    ]
    
    for dir_path in adaptive_dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        
        # ic_launcher.xml
        with open(f"{dir_path}/ic_launcher.xml", "w", encoding="utf-8") as f:
            f.write(adaptive_icon_xml)
        print(f"✅ {dir_path}/ic_launcher.xml 생성 완료")
        
        # ic_launcher_round.xml
        with open(f"{dir_path}/ic_launcher_round.xml", "w", encoding="utf-8") as f:
            f.write(adaptive_icon_xml.replace("ic_launcher", "ic_launcher_round"))
        print(f"✅ {dir_path}/ic_launcher_round.xml 생성 완료")

def create_colors_xml():
    """colors.xml에 배경색 추가"""
    
    colors_dir = "mobile/soksol_mobile/SokSol/android/app/src/main/res/values"
    Path(colors_dir).mkdir(parents=True, exist_ok=True)
    
    colors_xml = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
    <color name="primary">#10B981</color>
    <color name="primary_dark">#059669</color>
</resources>'''
    
    colors_path = f"{colors_dir}/colors.xml"
    with open(colors_path, "w", encoding="utf-8") as f:
        f.write(colors_xml)
    print(f"✅ {colors_path} 생성 완료")

def create_feature_graphic():
    """피처 그래픽 생성 (1024x500)"""
    
    svg_path = "public/logo.svg"
    output_path = "assets/store/graphics/feature_graphic.png"
    
    # 1024x500 크기로 피처 그래픽 생성
    # 배경은 그라데이션으로, 로고는 중앙에 배치
    cmd = f'magick -size 1024x500 gradient:"#1a1a2e-#349ce0" "{svg_path}" -resize 300x300 -gravity center -composite "{output_path}"'
    
    if run_command(cmd):
        print(f"✅ 피처 그래픽 생성 완료: {output_path}")
    else:
        print("❌ 피처 그래픽 생성 실패 (ImageMagick 필요)")

def main():
    """메인 함수"""
    print("🎨 SokSol 앱 아이콘 생성 시작...")
    print("=" * 50)
    
    # 1. 디렉토리 생성
    create_directories()
    
    # 2. SVG → PNG 변환
    convert_svg_to_png()
    
    # 3. Adaptive Icon XML 생성
    create_adaptive_icons()
    
    # 4. colors.xml 생성
    create_colors_xml()
    
    # 5. 피처 그래픽 생성
    create_feature_graphic()
    
    print("=" * 50)
    print("🎉 SokSol 앱 아이콘 생성 완료!")
    print()
    print("📱 생성된 파일들:")
    print("   - 안드로이드 앱 아이콘: mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-*/")
    print("   - Play Store 아이콘: assets/store/icons/soksol_icon.png")
    print("   - 피처 그래픽: assets/store/graphics/feature_graphic.png")
    print()
    print("🚀 이제 안드로이드 앱을 다시 빌드하세요!")

if __name__ == "__main__":
    main()
