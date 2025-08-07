# Archia Font Setup

To complete the Archia font implementation, you need to download the actual Archia font files from Free Fonts and place them in the `/public/fonts/` directory.

## Required Font Files:

1. **Archia-Regular.woff2** (primary format, best compression)
2. **Archia-Regular.woff** (fallback format)
3. **Archia-Light.woff2** (optional, for lighter weight)
4. **Archia-Light.woff** (optional, for lighter weight)
5. **Archia-Bold.woff2** (optional, for bold weight)
6. **Archia-Bold.woff** (optional, for bold weight)

## Download Instructions:

1. Visit Free Fonts website
2. Search for "Archia Regular"
3. Download the font family
4. Convert TTF/OTF files to WOFF2 and WOFF formats using:
   - Online converters like CloudConvert
   - FontSquirrel Webfont Generator
   - Local tools like fonttools

## File Structure:
```
public/
  fonts/
    Archia-Regular.woff2
    Archia-Regular.woff
    Archia-Light.woff2    (optional)
    Archia-Light.woff     (optional)
    Archia-Bold.woff2     (optional)
    Archia-Bold.woff      (optional)
```

## Usage in Components:

The font is now configured as the default sans-serif font throughout the application. You can also use specific font classes:

- `font-archia` - explicitly use Archia font
- `font-light` - use light weight (300)
- `font-normal` - use regular weight (400)  
- `font-bold` - use bold weight (700)

## Fallback Behavior:

If the Archia font files are not available, the application will gracefully fall back to:
1. System fonts (-apple-system for macOS/iOS)
2. BlinkMacSystemFont for Chrome on macOS
3. Segoe UI for Windows
4. Roboto for Android
5. Generic sans-serif

The application will continue to work normally even without the font files installed.
