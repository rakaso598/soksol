#!/bin/bash
# Generate Play Store icons and graphics for SokSol
# Usage: ./scripts/generate-store-assets.sh

set -e

# Colors for SokSol branding
BRAND_PRIMARY="#E8F4FD"    # Soft blue
BRAND_SECONDARY="#D4EDDA"  # Soft green  
BRAND_ACCENT="#F8D7DA"     # Soft pink

echo "🎨 Generating SokSol Store Assets..."

# Create directories
mkdir -p assets/store/{icons,graphics,screenshots}
mkdir -p mobile/soksol_mobile/SokSol/android/app/src/main/res/{mipmap-hdpi,mipmap-mdpi,mipmap-xhdpi,mipmap-xxhdpi,mipmap-xxxhdpi,mipmap-anydpi-v26}

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install ImageMagick to generate icons."
    echo "💡 Windows: Download from https://imagemagick.org/script/download.php#windows"
    echo "💡 macOS: brew install imagemagick"
    echo "💡 Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Create base icon using ImageMagick (simple geometric design)
create_base_icon() {
    local size=$1
    local output=$2
    
    # Create a heart-like shape with soft colors
    convert -size ${size}x${size} xc:transparent \
        \( -size $((size*6/10))x$((size*6/10)) xc:"$BRAND_PRIMARY" \
           -fill "$BRAND_SECONDARY" \
           -draw "circle $((size*3/10)),$((size*3/10)) $((size*3/10)),$((size*1/10))" \
           -blur 2x2 \) \
        -gravity center -composite \
        \( -size $((size*4/10))x$((size*4/10)) xc:transparent \
           -fill "$BRAND_ACCENT" \
           -draw "circle $((size*2/10)),$((size*2/10)) $((size*2/10)),$((size*1/10))" \
           -blur 1x1 \) \
        -gravity center -composite \
        "$output"
}

# Generate app icons for different densities
echo "📱 Generating app icons..."

# Android icon sizes
create_base_icon 48 "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
create_base_icon 72 "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-hdpi/ic_launcher.png"  
create_base_icon 96 "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
create_base_icon 144 "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
create_base_icon 192 "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"

# Copy as round icons too
cp "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-mdpi/ic_launcher.png" "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"
cp "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-hdpi/ic_launcher.png" "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"
cp "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"
cp "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"
cp "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

# Generate high-resolution store icons
echo "🏪 Generating store icons..."
create_base_icon 512 "assets/store/icons/ic_launcher_512.png"
create_base_icon 1024 "assets/store/icons/ic_launcher_1024.png"

# Generate adaptive icon resources
echo "🎯 Generating adaptive icons..."

# Create adaptive icon background
convert -size 1080x1080 xc:"$BRAND_PRIMARY" \
    -fill "$BRAND_SECONDARY" \
    -draw "circle 540,540 540,340" \
    -blur 3x3 \
    "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_background.png"

# Create adaptive icon foreground  
create_base_icon 432 "temp_foreground.png"
convert -size 1080x1080 xc:transparent \
    temp_foreground.png -gravity center -composite \
    "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_foreground.png"

# Create adaptive icon XML
cat > "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
EOF

cat > "mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
EOF

# Generate feature graphic template
echo "🖼️ Generating feature graphic template..."
convert -size 1024x500 xc:"$BRAND_PRIMARY" \
    -fill "$BRAND_SECONDARY" \
    -pointsize 72 \
    -gravity center \
    -annotate +0-50 "SokSol" \
    -fill black \
    -pointsize 24 \
    -annotate +0+50 "마음을 비우고 스스로를 찾아가세요" \
    "assets/store/graphics/feature_graphic_template.png"

# Clean up temporary files
rm -f temp_foreground.png

echo "✅ Store assets generated successfully!"
echo "📁 Generated files:"
echo "   - App icons: mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-*/"
echo "   - Store icons: assets/store/icons/"
echo "   - Feature graphic: assets/store/graphics/"
echo ""
echo "📝 Next steps:"
echo "   1. Review generated icons and customize if needed"
echo "   2. Create screenshots of your app"
echo "   3. Refine feature graphic with actual design"
echo "   4. Build and test APK with new icons"
