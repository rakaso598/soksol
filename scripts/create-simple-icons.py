#!/usr/bin/env python3
"""
SokSol 앱 아이콘 생성 스크립트 (Pure Python 버전)
PIL과 cairosvg를 사용하여 SVG를 PNG로 변환
"""

import os
from pathlib import Path

# 먼저 필요한 라이브러리 설치 시도
def install_requirements():
    """필요한 패키지 설치"""
    import subprocess
    import sys
    
    packages = ['Pillow', 'cairosvg']
    for package in packages:
        try:
            __import__(package.lower())
        except ImportError:
            try:
                print(f"📦 {package} 설치 중...")
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            except:
                print(f"❌ {package} 설치 실패")
                return False
    return True

def create_simple_icons():
    """간단한 단색 아이콘 생성 (PIL만 사용)"""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("❌ PIL(Pillow)이 필요합니다. pip install Pillow로 설치하세요.")
        return False
    
    # 안드로이드 아이콘 크기
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }
    
    # 속솔 로고 색상
    color = "#10B981"  # 초록색
    
    print("🎨 간단한 아이콘 생성 중...")
    
    for folder, size in sizes.items():
        # 원형 아이콘 생성
        image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        # 원형 배경
        margin = size // 8
        draw.ellipse([margin, margin, size-margin, size-margin], 
                    fill=color, outline=None)
        
        # S 텍스트 추가
        try:
            font_size = size // 2
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
            
            # S 텍스트
            text = "속"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            x = (size - text_width) // 2
            y = (size - text_height) // 2
            
            draw.text((x, y), text, fill="white", font=font)
        except:
            # 폰트 실패시 간단한 원만
            pass
        
        # 저장
        output_dir = f"mobile/soksol_mobile/SokSol/android/app/src/main/res/{folder}"
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        image.save(f"{output_dir}/ic_launcher.png", "PNG")
        image.save(f"{output_dir}/ic_launcher_round.png", "PNG")
        
        print(f"✅ {folder} 아이콘 생성 완료 ({size}x{size})")
    
    # Play Store 아이콘 (512x512)
    playstore_size = 512
    image = Image.new('RGBA', (playstore_size, playstore_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # 원형 배경
    margin = playstore_size // 8
    draw.ellipse([margin, margin, playstore_size-margin, playstore_size-margin], 
                fill=color, outline=None)
    
    # 속 텍스트
    font_size = playstore_size // 3
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "속"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (playstore_size - text_width) // 2
    y = (playstore_size - text_height) // 2
    
    draw.text((x, y), text, fill="white", font=font)
    
    Path("assets/store/icons").mkdir(parents=True, exist_ok=True)
    image.save("assets/store/icons/soksol_icon.png", "PNG")
    print(f"✅ Play Store 아이콘 생성 완료 (512x512)")
    
    return True

def create_feature_graphic():
    """피처 그래픽 생성"""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return False
    
    # 1024x500 피처 그래픽
    width, height = 1024, 500
    image = Image.new('RGB', (width, height), '#1a1a2e')
    draw = ImageDraw.Draw(image)
    
    # 그라데이션 배경
    for y in range(height):
        r = int(26 + (52 - 26) * y / height)
        g = int(26 + (156 - 26) * y / height)
        b = int(46 + (224 - 46) * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # SokSol 텍스트
    try:
        font_large = ImageFont.truetype("arial.ttf", 120)
        font_small = ImageFont.truetype("arial.ttf", 40)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # 메인 텍스트
    text = "SokSol"
    bbox = draw.textbbox((0, 0), text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2 - 50
    
    # 그림자
    draw.text((x + 3, y + 3), text, font=font_large, fill='#000000')
    # 메인 텍스트
    draw.text((x, y), text, font=font_large, fill='#ffffff')
    
    # 부제목
    subtitle = "실시간 AI 채팅 - 개인정보 100% 비저장"
    bbox = draw.textbbox((0, 0), subtitle, font=font_small)
    subtitle_width = bbox[2] - bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = y + text_height + 20
    
    draw.text((subtitle_x + 2, subtitle_y + 2), subtitle, font=font_small, fill='#000000')
    draw.text((subtitle_x, subtitle_y), subtitle, font=font_small, fill='#e0e0e0')
    
    Path("assets/store/graphics").mkdir(parents=True, exist_ok=True)
    image.save("assets/store/graphics/feature_graphic.png", "PNG")
    print("✅ 피처 그래픽 생성 완료")
    
    return True

def main():
    """메인 함수"""
    print("🎨 SokSol 앱 아이콘 생성 시작 (Pure Python)...")
    print("=" * 50)
    
    # 간단한 아이콘 생성
    if create_simple_icons():
        print("✅ 앱 아이콘 생성 완료")
    else:
        print("❌ 앱 아이콘 생성 실패")
    
    # 피처 그래픽 생성
    if create_feature_graphic():
        print("✅ 피처 그래픽 생성 완료")
    else:
        print("❌ 피처 그래픽 생성 실패")
    
    print("=" * 50)
    print("🎉 아이콘 생성 완료!")
    print("📱 이제 안드로이드 앱을 다시 빌드하세요!")

if __name__ == "__main__":
    main()
