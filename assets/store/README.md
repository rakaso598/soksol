# SokSol Store Assets Generation

## ?렞 Generated Files

### Adaptive Icons
- ??adaptive icon XML files created
- ??background color defined (#E8F4FD)
- ??SVG icon template created

### Next Steps (Manual)

#### 1. Icon Generation (Required)
Since ImageMagick is not available, you need to:

1. **Use the SVG template**: ssets/store/icons/soksol_icon.svg
2. **Convert to PNG** using online tools:
   - https://svgtopng.com/
   - https://convertio.co/svg-png/
3. **Generate required sizes**:
   - 48x48 ??mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
   - 72x72 ??mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
   - 96x96 ??mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
   - 144x144 ??mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
   - 192x192 ??mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
   - 432x432 ??mobile/soksol_mobile/SokSol/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_foreground.png
   - 512x512 ??ssets/store/icons/ic_launcher_512.png
   - 1024x1024 ??ssets/store/icons/ic_launcher_1024.png

4. **Copy as round icons** (same files with _round suffix)

#### 2. Screenshots (Required)
Take screenshots of:
1. Main landing page
2. Chat interface
3. AI conversation example
4. Privacy policy page

Save to: ssets/store/screenshots/

#### 3. Feature Graphic (Required)
Create 1024x500 banner image with:
- App name "SokSol"
- Tagline "留덉쓬??鍮꾩슦怨??ㅼ뒪濡쒕? 李얠븘媛?몄슂"
- App screenshots or branding elements

#### 4. Alternative: Use AI Image Generation
You can use AI tools to generate professional icons:
- **Midjourney**: "minimalist app icon, heart shape, soft pastel colors, mental wellness, clean design"
- **DALL-E**: "mobile app icon for mental health, soft blue and pink colors, heart symbol"
- **Canva**: Use app icon templates and customize

## ?? Quick Commands

After generating icons manually:

`ash
# Test build with new icons
cd mobile/soksol_mobile/SokSol
./gradlew assembleDebug

# Generate release AAB
./gradlew bundleRelease
`

## ?뱷 Store Listing Text

All app descriptions and store materials are ready in STORE_MATERIALS.md.
