#!/bin/bash

# Archia Font Download and Setup Script
# This script helps download and convert Archia fonts for web use

echo "🎨 Setting up Archia fonts for DairyMate..."

# Create fonts directory if it doesn't exist
mkdir -p public/fonts

echo "📁 Fonts directory ready at public/fonts/"

echo "📝 Font Setup Instructions:"
echo "=================================="
echo ""
echo "1. Download Archia fonts from Free Fonts:"
echo "   - Visit: https://www.freefonts.io/archia-font/ (or similar)"
echo "   - Download Archia Regular, Light, and Bold"
echo ""
echo "2. Convert fonts to web formats:"
echo "   Option A - Online Converter:"
echo "   - Visit: https://convertio.co/ttf-woff2/"
echo "   - Upload your TTF/OTF files"
echo "   - Convert to WOFF2 and WOFF formats"
echo ""
echo "   Option B - FontSquirrel Generator:"
echo "   - Visit: https://www.fontsquirrel.com/tools/webfont-generator"
echo "   - Upload fonts and select 'Optimal' settings"
echo "   - Download the generated kit"
echo ""
echo "3. Place the converted files in public/fonts/:"
echo "   ✓ Archia-Regular.woff2"
echo "   ✓ Archia-Regular.woff"
echo "   ✓ Archia-Light.woff2 (optional)"
echo "   ✓ Archia-Light.woff (optional)"
echo "   ✓ Archia-Bold.woff2 (optional)"
echo "   ✓ Archia-Bold.woff (optional)"
echo ""
echo "4. Restart your development server:"
echo "   npm run dev"
echo ""
echo "🎉 Once the fonts are in place, Archia will be used throughout the app!"
echo ""
echo "💡 Tip: You can test the typography with the TypographyShowcase component"
echo "   located at src/components/common/TypographyShowcase.tsx"
