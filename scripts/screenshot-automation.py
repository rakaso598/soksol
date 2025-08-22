#!/usr/bin/env python3
"""
자동 스크린샷 촬영 및 편집 스크립트
Play Store용 스크린샷을 자동으로 생성하고 편집
"""

import os
import sys
import time
import subprocess
from pathlib import Path
from datetime import datetime

def check_adb():
    """ADB가 설치되고 사용 가능한지 확인"""
    try:
        result = subprocess.run(['adb', 'version'], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def get_connected_devices():
    """연결된 Android 디바이스 목록 가져오기"""
    try:
        result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
        lines = result.stdout.strip().split('\n')[1:]  # 첫 번째 줄은 헤더
        devices = []
        for line in lines:
            if line.strip() and 'device' in line:
                device_id = line.split()[0]
                devices.append(device_id)
        return devices
    except Exception as e:
        print(f"❌ 디바이스 목록을 가져오는데 실패했습니다: {e}")
        return []

def take_screenshot(device_id, output_path, description=""):
    """스크린샷 촬영"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshot_{timestamp}_{description}.png" if description else f"screenshot_{timestamp}.png"
    full_output_path = Path(output_path) / filename
    
    # 출력 디렉토리 생성
    full_output_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # 디바이스에서 스크린샷 촬영
        temp_path = f"/sdcard/screenshot_{timestamp}.png"
        
        # 스크린샷 촬영
        result1 = subprocess.run(['adb', '-s', device_id, 'shell', 'screencap', '-p', temp_path], 
                               capture_output=True, text=True)
        
        if result1.returncode != 0:
            print(f"❌ 스크린샷 촬영 실패: {result1.stderr}")
            return None
        
        # PC로 파일 복사
        result2 = subprocess.run(['adb', '-s', device_id, 'pull', temp_path, str(full_output_path)], 
                               capture_output=True, text=True)
        
        if result2.returncode != 0:
            print(f"❌ 파일 복사 실패: {result2.stderr}")
            return None
        
        # 디바이스에서 임시 파일 삭제
        subprocess.run(['adb', '-s', device_id, 'shell', 'rm', temp_path], 
                      capture_output=True, text=True)
        
        print(f"✅ 스크린샷 저장: {full_output_path}")
        return str(full_output_path)
        
    except Exception as e:
        print(f"❌ 스크린샷 촬영 중 오류: {e}")
        return None

def resize_for_play_store(image_path, output_dir):
    """Play Store 요구사항에 맞게 이미지 리사이즈"""
    try:
        # ImageMagick 사용
        input_path = Path(image_path)
        output_path = Path(output_dir) / f"playstore_{input_path.name}"
        
        # Play Store 권장 크기: 1080x1920 (16:9 비율)
        cmd = [
            'convert',
            str(input_path),
            '-resize', '1080x1920',
            '-gravity', 'center',
            '-background', 'white',
            '-extent', '1080x1920',
            str(output_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Play Store용 리사이즈 완료: {output_path}")
            return str(output_path)
        else:
            print(f"❌ 리사이즈 실패: {result.stderr}")
            return None
            
    except FileNotFoundError:
        print("❌ ImageMagick이 설치되지 않았습니다.")
        print("설치: winget install ImageMagick.ImageMagick")
        return None

def interactive_screenshot_session():
    """대화형 스크린샷 촬영 세션"""
    print("📱 SokSol 앱 스크린샷 자동 촬영")
    print("=" * 40)
    
    # ADB 확인
    if not check_adb():
        print("❌ ADB가 설치되지 않았거나 PATH에 없습니다.")
        print("Android Studio SDK Platform-Tools를 설치하고 PATH에 추가하세요.")
        return False
    
    # 연결된 디바이스 확인
    devices = get_connected_devices()
    if not devices:
        print("❌ 연결된 Android 디바이스가 없습니다.")
        print("1. USB 디버깅을 활성화하세요")
        print("2. USB 케이블로 PC와 연결하세요")
        print("3. 'adb devices' 명령으로 디바이스가 인식되는지 확인하세요")
        return False
    
    print(f"✅ 발견된 디바이스: {len(devices)}개")
    for i, device in enumerate(devices):
        print(f"   {i+1}. {device}")
    
    # 디바이스 선택
    if len(devices) == 1:
        selected_device = devices[0]
        print(f"디바이스 자동 선택: {selected_device}")
    else:
        while True:
            try:
                choice = int(input("사용할 디바이스 번호를 선택하세요: ")) - 1
                if 0 <= choice < len(devices):
                    selected_device = devices[choice]
                    break
                else:
                    print("올바른 번호를 입력하세요.")
            except ValueError:
                print("숫자를 입력하세요.")
    
    # 출력 경로 설정
    base_path = Path(__file__).parent.parent
    output_dir = base_path / "assets" / "store" / "screenshots"
    playstore_dir = output_dir / "playstore"
    
    print(f"\n📁 스크린샷 저장 경로: {output_dir}")
    print(f"📁 Play Store용 저장 경로: {playstore_dir}")
    
    # 스크린샷 촬영 시나리오
    scenarios = [
        ("main", "메인 화면 (첫 진입)", "앱을 열고 메인 화면이 표시된 상태"),
        ("chat_start", "채팅 시작", "채팅을 시작하기 전 또는 시작 직후"),
        ("chat_active", "활성 채팅", "AI와 대화 중인 화면"),
        ("chat_response", "AI 응답", "AI가 응답한 내용이 보이는 화면"),
        ("menu", "메뉴/설정", "메뉴나 설정 화면 (있다면)"),
    ]
    
    print("\n🎬 스크린샷 촬영 시나리오:")
    for i, (key, title, desc) in enumerate(scenarios):
        print(f"   {i+1}. {title}: {desc}")
    
    print("\n📋 촬영 안내:")
    print("- 각 시나리오마다 안내에 따라 앱을 조작하세요")
    print("- 준비가 되면 Enter를 눌러 스크린샷을 촬영합니다")
    print("- 스킵하려면 's'를 입력하세요")
    print("- 종료하려면 'q'를 입력하세요")
    
    input("\n📱 SokSol 앱을 열고 준비가 되면 Enter를 누르세요...")
    
    captured_screenshots = []
    
    for i, (key, title, desc) in enumerate(scenarios):
        print(f"\n🎯 시나리오 {i+1}/{len(scenarios)}: {title}")
        print(f"📝 {desc}")
        
        while True:
            user_input = input("준비되면 Enter (스킵: s, 종료: q): ").strip().lower()
            
            if user_input == 'q':
                print("🛑 촬영을 종료합니다.")
                break
            elif user_input == 's':
                print("⏭️  스킵합니다.")
                break
            elif user_input == '':
                # 스크린샷 촬영
                screenshot_path = take_screenshot(selected_device, output_dir, key)
                if screenshot_path:
                    # Play Store용 리사이즈
                    playstore_path = resize_for_play_store(screenshot_path, playstore_dir)
                    if playstore_path:
                        captured_screenshots.append((title, screenshot_path, playstore_path))
                    
                    print(f"✅ {title} 촬영 완료")
                    time.sleep(1)  # 잠시 대기
                break
            else:
                print("Enter, 's', 또는 'q'를 입력하세요.")
        
        if user_input == 'q':
            break
    
    # 결과 요약
    print(f"\n📊 촬영 완료: {len(captured_screenshots)}개")
    for title, original, playstore in captured_screenshots:
        print(f"   ✅ {title}")
        print(f"      원본: {original}")
        print(f"      Play Store용: {playstore}")
    
    if captured_screenshots:
        print("\n🚀 다음 단계:")
        print("1. 촬영된 스크린샷을 확인하세요")
        print("2. 필요시 이미지 편집 도구로 추가 편집")
        print("3. Play Console에서 스크린샷 업로드")
        print("4. SCREENSHOT_GUIDE.md 참고하여 최종 검토")
        
        return True
    else:
        print("❌ 촬영된 스크린샷이 없습니다.")
        return False

def main():
    """메인 함수"""
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        # 자동 모드 (CI/CD용)
        print("🤖 자동 모드는 아직 구현되지 않았습니다.")
        print("수동 모드를 사용하세요: python scripts/screenshot-automation.py")
        return 1
    else:
        # 대화형 모드
        return 0 if interactive_screenshot_session() else 1

if __name__ == "__main__":
    sys.exit(main())
