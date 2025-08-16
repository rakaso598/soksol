#!/usr/bin/env bash
# Generate PWA & Android adaptive icons from a base square SVG/PNG.
# Requirements: ImageMagick (convert). If missing, abort with message.
# Usage: ./scripts/generate-icons.sh assets/branding/logo.png|svg
set -euo pipefail
if ! command -v convert >/dev/null 2>&1; then
  echo "[ERROR] ImageMagick 'convert' not found. Install ImageMagick first." >&2
  exit 1
fi
SRC=${1:-assets/branding/logo.png}
if [ ! -f "$SRC" ]; then
  echo "Source $SRC not found" >&2; exit 1; fi
OUT_WEB=public/icons
mkdir -p $OUT_WEB
convert "$SRC" -resize 192x192 $OUT_WEB/icon-192.png
convert "$SRC" -resize 512x512 $OUT_WEB/icon-512.png
# Android adaptive (foreground 432x432 inside 1080x1080)
ANDROID_RES=mobile/soksol_mobile/android/app/src/main/res
FOREGROUND=$ANDROID_RES/mipmap-anydpi-v26
mkdir -p $FOREGROUND
mkdir -p tmp_ic
convert "$SRC" -resize 432x432 tmp_ic/foreground.png
convert -size 1080x1080 canvas:none tmp_ic/base.png
convert tmp_ic/base.png tmp_ic/foreground.png -gravity center -composite tmp_ic/ic_adaptive_fore.png
for spec in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
  dpi=${spec%%:*}; size=${spec##*:};
  dir=$ANDROID_RES/mipmap-$dpi; mkdir -p $dir;
  convert "$SRC" -resize ${size}x${size} $dir/ic_launcher.png
  cp $dir/ic_launcher.png $dir/ic_launcher_round.png || true
done
ADAPT_XML=$FOREGROUND/ic_launcher.xml
if [ ! -f "$ADAPT_XML" ]; then cat > $ADAPT_XML <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/splash_background" />
  <foreground android:drawable="@mipmap/ic_launcher" />
</adaptive-icon>
XML
fi
rm -rf tmp_ic
echo "Icons generated."
