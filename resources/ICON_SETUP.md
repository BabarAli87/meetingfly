# MeetingFly App Icons Setup

This folder contains the app icons for MeetingFly on Windows and macOS.

## Current Files
- `icon.svg` — Base SVG icon (256x256)

## Icon Generation Instructions

### Option 1: Using Online Tools (Easy)
1. Open `icon.svg` in a browser or image editor
2. Export as:
   - **PNG (256x256)** → save as `icon.png`
   - **ICO (256x256)** → save as `icon.ico` (use [convertio.co](https://convertio.co) or similar)
   - **ICNS (256x256)** → save as `icon.icns` (macOS-specific format)

### Option 2: Using ImageMagick (CLI)
```bash
# Requires ImageMagick installed (https://imagemagick.org/script/download.php)

# Generate PNG
convert -background none icon.svg -define icon:auto-resize=256 icon.png

# Generate ICO (Windows)
convert icon.svg -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# Generate ICNS (macOS) - requires additional tools
# macOS users can use: https://github.com/jacklyndm/svg2icns
```

### Option 3: Using Electron Icon Generator
```bash
npm install -g electron-icon-generator

electron-icon-generator --input=icon.svg --output=. --icns --ico
```

## Required Files
- ✅ `icon.png` — Used by tray and general UI
- ❌ `icon.ico` — Windows installer icon (needs to be generated)
- ❌ `icon.icns` — macOS installer icon (needs to be generated)

## Next Steps
1. Generate the PNG, ICO, and ICNS files from the SVG
2. Place them in this folder
3. Rebuild the app: `npm run package`
