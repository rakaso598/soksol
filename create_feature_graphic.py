# 피처 그래픽 생성 스크립트

import os
from PIL import Image, ImageDraw, ImageFont

def create_feature_graphic():
    # 피처 그래픽 크기 (1024x500)
    width, height = 1024, 500
    
    # 새 이미지 생성 (그라데이션 배경)
    image = Image.new('RGB', (width, height), color='#1a1a2e')
    draw = ImageDraw.Draw(image)
    
    # 그라데이션 배경 생성
    for y in range(height):
        r = int(26 + (52 - 26) * y / height)  # 1a -> 34
        g = int(26 + (156 - 26) * y / height)  # 1a -> 9c
        b = int(46 + (224 - 46) * y / height)  # 2e -> e0
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # SokSol 텍스트 추가
    try:
        # 시스템 폰트 사용 시도
        font_large = ImageFont.truetype("arial.ttf", 120)
        font_small = ImageFont.truetype("arial.ttf", 40)
    except:
        # 기본 폰트 사용
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # 메인 텍스트
    text = "SokSol"
    text_bbox = draw.textbbox((0, 0), text, font=font_large)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (width - text_width) // 2
    text_y = (height - text_height) // 2 - 50
    
    # 텍스트 그림자
    draw.text((text_x + 3, text_y + 3), text, font=font_large, fill='#000000')
    # 메인 텍스트
    draw.text((text_x, text_y), text, font=font_large, fill='#ffffff')
    
    # 부제목
    subtitle = "실시간 AI 채팅 - 개인정보 100% 비저장"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=font_small)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = text_y + text_height + 20
    
    # 부제목 그림자
    draw.text((subtitle_x + 2, subtitle_y + 2), subtitle, font=font_small, fill='#000000')
    # 부제목
    draw.text((subtitle_x, subtitle_y), subtitle, font=font_small, fill='#e0e0e0')
    
    # 저장
    os.makedirs('assets/store/graphics', exist_ok=True)
    image.save('assets/store/graphics/feature_graphic.png', 'PNG', quality=95)
    print("✅ 피처 그래픽 생성 완료: assets/store/graphics/feature_graphic.png")

if __name__ == "__main__":
    create_feature_graphic()
