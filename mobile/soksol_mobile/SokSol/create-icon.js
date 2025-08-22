#!/usr/bin/env node
/**
 * Node.js로 SVG 색상 추출 후 간단한 PNG 아이콘 생성
 * 외부 라이브러리 없이 Canvas만 사용
 */

const fs = require('fs');
const path = require('path');

// SVG에서 색상 추출
function extractSVGColor(svgContent) {
  const fillMatch = svgContent.match(/fill="([^"]+)"/);
  if (fillMatch && fillMatch[1].startsWith('#')) {
    const hex = fillMatch[1];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
  return { r: 16, g: 185, b: 129 }; // 기본값
}

// Canvas로 간단한 아이콘 생성 (Node.js canvas 없이 대안)
function createSimpleIconData(size, color) {
  // 간단한 BMP 형식으로 생성 (PNG 대신)
  const width = size;
  const height = size;
  const bytesPerPixel = 3;
  const rowSize = Math.floor((bytesPerPixel * width + 3) / 4) * 4;
  const pixelArraySize = rowSize * height;

  const fileSize = 54 + pixelArraySize;
  const buffer = Buffer.alloc(fileSize);

  // BMP 헤더
  buffer.write('BM', 0);
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(54, 10);
  buffer.writeUInt32LE(40, 14);
  buffer.writeInt32LE(width, 18);
  buffer.writeInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(24, 28);
  buffer.writeUInt32LE(pixelArraySize, 34);

  // 픽셀 데이터 (원형 아이콘)
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const offset = 54 + (height - 1 - y) * rowSize + x * 3;

      if (distance <= radius) {
        // 원형 안쪽 - 속솔 색상
        buffer[offset] = color.b; // B
        buffer[offset + 1] = color.g; // G
        buffer[offset + 2] = color.r; // R
      } else {
        // 원형 바깥쪽 - 투명(흰색)
        buffer[offset] = 255; // B
        buffer[offset + 1] = 255; // G
        buffer[offset + 2] = 255; // R
      }
    }
  }

  return buffer;
}

function main() {
  console.log('🎨 Node.js로 SVG 색상 기반 아이콘 생성...');

  // SVG 파일 읽기
  const svgPath = path.join(
    process.cwd(),
    '..',
    '..',
    '..',
    'public',
    'logo.svg',
  );
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // 색상 추출
  const color = extractSVGColor(svgContent);
  console.log(`✅ SVG 색상: RGB(${color.r}, ${color.g}, ${color.b})`);

  // 안드로이드 아이콘 크기
  const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };

  const resPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

  for (const [density, size] of Object.entries(sizes)) {
    const dirPath = path.join(resPath, density);

    // 디렉토리 생성
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 아이콘 데이터 생성
    const iconData = createSimpleIconData(size, color);

    // BMP 파일로 저장 (PNG 대신)
    const launcherPath = path.join(dirPath, 'ic_launcher.bmp');
    const roundPath = path.join(dirPath, 'ic_launcher_round.bmp');

    fs.writeFileSync(launcherPath, iconData);
    fs.writeFileSync(roundPath, iconData);

    console.log(`✅ ${density} 아이콘 생성 (${size}x${size})`);
  }

  console.log('🎉 Node.js로 아이콘 생성 완료!');
}

main();
