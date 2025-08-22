# PowerShell script to generate basic store assets for SokSol
# Generate-StoreAssets.ps1

Write-Host "🎨 Generating SokSol Store Assets..." -ForegroundColor Green

# Create directories
$dirs = @(
    "assets/store/icons",
    "assets/store/graphics", 
    "assets/store/screenshots",
    "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Created directory: $dir" -ForegroundColor Blue
    }
}

# Generate adaptive icon XML files
$adaptiveIconXml = @"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
"@

$adaptiveIconXml | Out-File -FilePath "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml" -Encoding UTF8
$adaptiveIconXml | Out-File -FilePath "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml" -Encoding UTF8

Write-Host "✅ Generated adaptive icon XML files" -ForegroundColor Green

# Create colors.xml for background color
$colorsDir = "mobile/soksol_mobile/SokSol/android/app/src/main/res/values"
if (!(Test-Path $colorsDir)) {
    New-Item -ItemType Directory -Path $colorsDir -Force | Out-Null
}

$colorsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#E8F4FD</color>
    <color name="splash_background">#E8F4FD</color>
</resources>
"@

$colorsXml | Out-File -FilePath "$colorsDir/colors.xml" -Encoding UTF8
Write-Host "✅ Generated colors.xml" -ForegroundColor Green

# Create simple SVG icon template
$svgIcon = @"
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#E8F4FD;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4EDDA;stop-opacity:1" />
    </radialGradient>
  </defs>
  <circle cx="96" cy="96" r="80" fill="url(#bg)" stroke="#B0C4DE" stroke-width="4"/>
  <path d="M96 60 C84 60, 72 72, 72 84 C72 96, 84 108, 96 120 C108 108, 120 96, 120 84 C120 72, 108 60, 96 60 Z" fill="#F8D7DA" opacity="0.8"/>
  <circle cx="96" cy="84" r="8" fill="#87CEEB" opacity="0.6"/>
</svg>
"@

$svgIcon | Out-File -FilePath "assets/store/icons/soksol_icon.svg" -Encoding UTF8
Write-Host "✅ Generated SVG icon template" -ForegroundColor Green

# Create README for manual steps
$readmeContent = @"
# SokSol Store Assets Generation

## 🎯 Generated Files

### Adaptive Icons
- ✅ adaptive icon XML files created
- ✅ background color defined (#E8F4FD)
- ✅ SVG icon template created

### Next Steps (Manual)

#### 1. Icon Generation (Required)
Since ImageMagick is not available, you need to:

1. **Use the SVG template**: `assets/store/icons/soksol_icon.svg`
2. **Convert to PNG** using online tools:
   - https://svgtopng.com/
   - https://convertio.co/svg-png/
3. **Generate required sizes**:
   - 48x48 → `mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
   - 72x72 → `mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
   - 96x96 → `mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
   - 144x144 → `mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
   - 192x192 → `mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
   - 432x432 → `mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_foreground.png`
   - 512x512 → `assets/store/icons/ic_launcher_512.png`
   - 1024x1024 → `assets/store/icons/ic_launcher_1024.png`

4. **Copy as round icons** (same files with `_round` suffix)

#### 2. Screenshots (Required)
Take screenshots of:
1. Main landing page
2. Chat interface
3. AI conversation example
4. Privacy policy page

Save to: `assets/store/screenshots/`

#### 3. Feature Graphic (Required)
Create 1024x500 banner image with:
- App name "SokSol"
- Tagline "마음을 비우고 스스로를 찾아가세요"
- App screenshots or branding elements

#### 4. Alternative: Use AI Image Generation
You can use AI tools to generate professional icons:
- **Midjourney**: "minimalist app icon, heart shape, soft pastel colors, mental wellness, clean design"
- **DALL-E**: "mobile app icon for mental health, soft blue and pink colors, heart symbol"
- **Canva**: Use app icon templates and customize

## 🚀 Quick Commands

After generating icons manually:

```bash
# Test build with new icons
cd mobile/soksol_mobile/SokSol
./gradlew assembleDebug

# Generate release AAB
./gradlew bundleRelease
```

## 📝 Store Listing Text

All app descriptions and store materials are ready in `STORE_MATERIALS.md`.
"@

$readmeContent | Out-File -FilePath "assets/store/README.md" -Encoding UTF8
Write-Host "✅ Generated setup instructions" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Summary:" -ForegroundColor Yellow
Write-Host "✅ Adaptive icon structure created" -ForegroundColor Green
Write-Host "✅ SVG icon template ready" -ForegroundColor Green  
Write-Host "✅ App store descriptions ready" -ForegroundColor Green
Write-Host "✅ Colors and XML files ready" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ Manual steps required:" -ForegroundColor Red
Write-Host "  1. Convert SVG to PNG icons (multiple sizes)" -ForegroundColor Yellow
Write-Host "  2. Take app screenshots" -ForegroundColor Yellow
Write-Host "  3. Create feature graphic (1024x500)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 See assets/store/README.md for detailed instructions" -ForegroundColor Cyan
