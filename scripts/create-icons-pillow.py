#!/usr/bin/env python3
"""
SokSol 앱 아이콘 생성 스크립트 (Pillow 사용)
속솔 로고 PNG를 활용하여 모든 안드로이드 아이콘 크기 생성
"""

import os
from PIL import Image, ImageDraw
from pathlib import Path

def create_directories():
    """필요한 디렉토리 생성"""
    dirs = [
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-mdpi",
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-hdpi", 
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xhdpi",
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxhdpi",
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxxhdpi",
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26",
        "mobile/soksol_mobile/SokSol/android/app/src/main/res/values",
        "assets/store/icons",
        "assets/store/graphics"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    print("✅ 디렉토리 생성 완료")

def create_simple_icon():
    """간단한 속솔 로고 스타일 아이콘 생성"""
    # 512x512 기본 아이콘 생성
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 그라데이션 원형 배경
    center = size // 2
    radius = center - 20
    
    # 원형 배경 (속솔 브랜드 컬러)
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 fill=(26, 26, 46, 255))  # #1a1a2e
    
    # 내부 원 (밝은 파란색)
    inner_radius = radius - 40
    draw.ellipse([center-inner_radius, center-inner_radius, center+inner_radius, center+inner_radius], 
                 fill=(52, 156, 224, 255))  # #349ce0
    
    # 속솔 텍스트 대신 간단한 기하학적 패턴
    # S 모양의 곡선
    line_width = 20
    # 위쪽 S 커브
    draw.arc([center-80, center-80, center+20, center-30], 0, 180, fill=(255, 255, 255), width=line_width)
    # 아래쪽 S 커브
    draw.arc([center-20, center+30, center+80, center+80], 180, 360, fill=(255, 255, 255), width=line_width)
    
    return img

def resize_and_save_icon(base_icon, size, path):
    """아이콘 크기 조정 및 저장"""
    try:
        resized = base_icon.resize((size, size), Image.LANCZOS)
        resized.save(path, 'PNG')
        print(f"✅ {path} 생성 완료 ({size}x{size})")
        return True
    except Exception as e:
        print(f"❌ {path} 생성 실패: {e}")
        return False

def create_round_icon(base_icon, size, path):
    """둥근 아이콘 생성"""
    try:
        # 원형 마스크 생성
        mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse([0, 0, size, size], fill=255)
        
        # 아이콘 크기 조정
        resized = base_icon.resize((size, size), Image.LANCZOS)
        
        # 마스크 적용
        result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        result.paste(resized, (0, 0))
        result.putalpha(mask)
        
        result.save(path, 'PNG')
        print(f"✅ {path} 생성 완료 (둥근 {size}x{size})")
        return True
    except Exception as e:
        print(f"❌ {path} 생성 실패: {e}")
        return False

def create_android_icons():
    """안드로이드 앱 아이콘 생성"""
    print("🎨 안드로이드 아이콘 생성 시작...")
    
    # 기본 아이콘 생성
    base_icon = create_simple_icon()
    
    # 안드로이드 아이콘 크기 정의
    android_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }
    
    success_count = 0
    
    for density, size in android_sizes.items():
        # ic_launcher.png
        launcher_path = f"mobile/soksol_mobile/SokSol/android/app/src/main/res/{density}/ic_launcher.png"
        if resize_and_save_icon(base_icon, size, launcher_path):
            success_count += 1
        
        # ic_launcher_round.png
        round_path = f"mobile/soksol_mobile/SokSol/android/app/src/main/res/{density}/ic_launcher_round.png"
        if create_round_icon(base_icon, size, round_path):
            success_count += 1
    
    # Play Store 아이콘 (512x512)
    store_path = "assets/store/icons/soksol_icon.png"
    if resize_and_save_icon(base_icon, 512, store_path):
        success_count += 1
    
    print(f"✅ {success_count}개 아이콘 생성 완료")
    return success_count > 0

def create_adaptive_icon_xml():
    """Adaptive Icon XML 파일 생성"""
    
    # ic_launcher.xml
    launcher_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher"/>
</adaptive-icon>'''
    
    # ic_launcher_round.xml
    round_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round"/>
</adaptive-icon>'''
    
    # colors.xml
    colors_xml = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#1a1a2e</color>
</resources>'''
    
    try:
        # XML 파일들 저장
        Path("mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml").write_text(launcher_xml, encoding='utf-8')
        Path("mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml").write_text(round_xml, encoding='utf-8')
        Path("mobile/soksol_mobile/SokSol/android/app/src/main/res/values/colors.xml").write_text(colors_xml, encoding='utf-8')
        
        print("✅ Adaptive Icon XML 파일 생성 완료")
        return True
    except Exception as e:
        print(f"❌ XML 파일 생성 실패: {e}")
        return False

def create_feature_graphic():
    """Play Store 피처 그래픽 생성"""
    print("🎨 피처 그래픽 생성 시작...")
    
    try:
        # 1024x500 피처 그래픽
        width, height = 1024, 500
        img = Image.new('RGB', (width, height), (26, 26, 46))  # #1a1a2e
        draw = ImageDraw.Draw(img)
        
        # 그라데이션 효과 (간단한 버전)
        for i in range(height):
            # 상단에서 하단으로 갈수록 밝아지는 효과
            ratio = i / height
            r = int(26 + (52 - 26) * ratio)
            g = int(26 + (156 - 26) * ratio)
            b = int(46 + (224 - 46) * ratio)
            draw.line([(0, i), (width, i)], fill=(r, g, b))
        
        # 중앙에 로고 영역
        logo_size = 300
        logo_x = (width - logo_size) // 2
        logo_y = (height - logo_size) // 2
        
        # 원형 로고 배경
        center_x = logo_x + logo_size // 2
        center_y = logo_y + logo_size // 2
        radius = logo_size // 3
        
        draw.ellipse([center_x-radius, center_y-radius, center_x+radius, center_y+radius], 
                     fill=(255, 255, 255, 200))
        
        # S 모양 패턴
        line_width = 15
        draw.arc([center_x-40, center_y-40, center_x+10, center_y-15], 0, 180, fill=(26, 26, 46), width=line_width)
        draw.arc([center_x-10, center_y+15, center_x+40, center_y+40], 180, 360, fill=(26, 26, 46), width=line_width)
        
        img.save("assets/store/graphics/feature_graphic.png", 'PNG')
        print("✅ 피처 그래픽 생성 완료 (1024x500)")
        return True
        
    except Exception as e:
        print(f"❌ 피처 그래픽 생성 실패: {e}")
        return False

def main():
    """메인 함수"""
    print("🎨 SokSol 앱 아이콘 생성 시작...")
    print("=" * 50)
    
    # 디렉토리 생성
    create_directories()
    
    # 안드로이드 아이콘 생성
    if create_android_icons():
        print("✅ 안드로이드 아이콘 생성 성공")
    else:
        print("❌ 안드로이드 아이콘 생성 실패")
    
    # Adaptive Icon XML 생성
    if create_adaptive_icon_xml():
        print("✅ Adaptive Icon 설정 완료")
    
    # 피처 그래픽 생성
    if create_feature_graphic():
        print("✅ 피처 그래픽 생성 성공")
    
    print("=" * 50)
    print("🎉 SokSol 앱 아이콘 생성 완료!")
    print("📱 생성된 파일들:")
    print("   - 안드로이드 앱 아이콘: mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-*/")
    print("   - Play Store 아이콘: assets/store/icons/soksol_icon.png")
    print("   - 피처 그래픽: assets/store/graphics/feature_graphic.png")
    print("🚀 이제 안드로이드 앱을 다시 빌드하세요!")

if __name__ == "__main__":
    main()
