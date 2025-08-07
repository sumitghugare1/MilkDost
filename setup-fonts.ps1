# Archia Font Download and Setup Script for Windows
# PowerShell script to help setup Archia fonts for web use

Write-Host "🎨 Setting up Archia fonts for DairyMate..." -ForegroundColor Green

# Create fonts directory if it doesn't exist
$fontsPath = "public\fonts"
if (!(Test-Path $fontsPath)) {
    New-Item -ItemType Directory -Path $fontsPath -Force | Out-Null
}

Write-Host "📁 Fonts directory ready at $fontsPath\" -ForegroundColor Blue

Write-Host ""
Write-Host "📝 Font Setup Instructions:" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Download Archia fonts from Free Fonts:" -ForegroundColor White
Write-Host "   - Visit: https://www.freefonts.io/archia-font/ (or similar)" -ForegroundColor Gray
Write-Host "   - Download Archia Regular, Light, and Bold" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Convert fonts to web formats:" -ForegroundColor White
Write-Host "   Option A - Online Converter:" -ForegroundColor Cyan
Write-Host "   - Visit: https://convertio.co/ttf-woff2/" -ForegroundColor Gray
Write-Host "   - Upload your TTF/OTF files" -ForegroundColor Gray
Write-Host "   - Convert to WOFF2 and WOFF formats" -ForegroundColor Gray
Write-Host ""
Write-Host "   Option B - FontSquirrel Generator:" -ForegroundColor Cyan
Write-Host "   - Visit: https://www.fontsquirrel.com/tools/webfont-generator" -ForegroundColor Gray
Write-Host "   - Upload fonts and select 'Optimal' settings" -ForegroundColor Gray
Write-Host "   - Download the generated kit" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Place the converted files in public\fonts\:" -ForegroundColor White
Write-Host "   ✓ Archia-Regular.woff2" -ForegroundColor Green
Write-Host "   ✓ Archia-Regular.woff" -ForegroundColor Green
Write-Host "   ✓ Archia-Light.woff2 (optional)" -ForegroundColor Yellow
Write-Host "   ✓ Archia-Light.woff (optional)" -ForegroundColor Yellow
Write-Host "   ✓ Archia-Bold.woff2 (optional)" -ForegroundColor Yellow
Write-Host "   ✓ Archia-Bold.woff (optional)" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Restart your development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Once the fonts are in place, Archia will be used throughout the app!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tip: You can test the typography with the TypographyShowcase component" -ForegroundColor Magenta
Write-Host "   located at src\components\common\TypographyShowcase.tsx" -ForegroundColor Gray

# Optional: Open the Free Fonts website
$openWebsite = Read-Host "`nWould you like to open the Free Fonts website now? (y/n)"
if ($openWebsite -eq "y" -or $openWebsite -eq "Y") {
    Start-Process "https://www.freefonts.io/search?q=archia"
    Write-Host "🌐 Opening Free Fonts website..." -ForegroundColor Green
}
