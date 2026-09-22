# Quick Start Guide

## Installation & Development Setup

### 1. Clone and Install
```bash
git clone https://github.com/your-username/meetingfly.git
cd meetingfly
npm install
```

### 2. Generate App Icons
Before running or packaging, generate the app icons:

**On Windows:**
```bash
cd resources
generate-icons.bat
```

**On macOS/Linux:**
```bash
cd resources
python3 -m pip install cairosvg pillow
python3 generate-icons.py
```

This creates:
- `icon.png` — Used by tray and UI
- `icon.ico` — Windows installer icon
- `icon.icns` — macOS installer (see ICON_SETUP.md for advanced setup)

### 3. Development Mode
```bash
npm run dev
```
This starts:
- **Dev server** on `http://localhost:5173`
- **Electron app** with auto-reload on file changes
- **DevTools** for debugging

The Settings window will auto-open for testing. You can:
- Adjust animation settings (sprite, speed, path, etc.)
- Click "Preview ✈️" to test the flyover animation
- Click "Save" to persist settings

### 4. Build for Production
```bash
# Just build (no packaging)
npm run build

# Package for current platform
npm run package

# Package for specific platform
npm run package:win
npm run package:mac
```

Installers are created in `dist/` folder:
- **Windows**: `MeetingFly-0.1.0-Setup.exe`
- **macOS**: `MeetingFly-0.1.0.dmg`

## Project Layout

```
meetingfly/
├── src/
│   ├── main/              # Electron main process
│   ├── preload/           # Context bridge & IPC setup
│   ├── renderer/          # React UI (overlay & settings)
│   └── shared/            # Shared types & constants
├── resources/             # App icons and assets
├── .github/workflows/     # CI/CD pipelines
├── package.json           # Dependencies & scripts
├── electron.vite.config.ts # Vite + Electron config
├── tsconfig.json          # TypeScript config
└── electron-builder.yml   # Packaging configuration
```

## Key Files to Understand

### Animation Engine (`src/renderer/overlay/src/`)
- **Overlay.tsx** — Main canvas component
- **animation.ts** — Path generation, sprite rendering, sound playback
- **sprites.ts** — Built-in SVG sprites

### Settings & Configuration
- **src/renderer/settings/src/App.tsx** — Settings form UI
- **src/main/settings-store.ts** — Persisting settings to disk
- **src/shared/types.ts** — Type definitions

### Main Process (`src/main/`)
- **index.ts** — App initialization, IPC handlers
- **overlay-manager.ts** — Overlay window creation & control
- **tray-manager.ts** — System tray integration

## Common Tasks

### Add a New Setting
1. Add field to `AppSettings` in `src/shared/types.ts`
2. Update `DEFAULT_SETTINGS` with default value
3. Add form control in `src/renderer/settings/src/App.tsx`
4. Handle in animation logic (e.g., `animation.ts`)

### Add a New Sprite
1. Add SVG to `SPRITES` object in `src/renderer/overlay/src/sprites.ts`
2. Add option to `SPRITE_OPTIONS` in `src/renderer/settings/src/App.tsx`
3. Rebuild and test

### Change Animation Paths
Edit `createPathFn()` in `src/renderer/overlay/src/animation.ts`:
```typescript
case 'my-custom-path': {
  return (t) => ({
    x: /* ... position ... */,
    y: /* ... position ... */,
    angle: /* ... rotation ... */
  })
}
```

### Test in Different Resolutions
- Overlay window always spans full screen
- Paths automatically scale based on `sw` (screen width) and `sh` (screen height)

## Troubleshooting

### Icons Not Found
```bash
# Regenerate icons
cd resources
generate-icons.bat
```

### TypeScript Errors
```bash
# Check types
npx tsc --noEmit
```

### Electron Won't Start
```bash
# Clear build artifacts
rm -r out dist
npm run build
```

### App Settings Corruption
Delete the settings file:
- **Windows**: Delete `%APPDATA%\MeetingFly\settings.json`
- **macOS**: Delete `~/Library/Application Support/MeetingFly/settings.json`

## Environment Variables

For GitHub Actions releases, set:
- `GH_TOKEN` — GitHub Personal Access Token for releases
- `CSC_LINK`, `CSC_KEY_PASSWORD` — macOS signing (optional)

## Next Steps

✅ **Phase 0** is complete! The project scaffold is ready.

**Next: Phase 1 Enhancement** — Focus on:
- Testing the animation in real meetings
- Adding more built-in sprites
- Refining flight paths

**Then: Phase 2** — System tray refinements and launch-at-login setup

---

For detailed documentation, see [README.md](../README.md)
