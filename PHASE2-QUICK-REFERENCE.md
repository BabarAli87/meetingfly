# Phase 2 Quick Reference

## What's New

### Launch-at-Login Toggle
- **Location**: Settings → System section
- **Behavior**: Toggle on/off, click Save to apply
- **Auto-applies to OS**:
  - Windows: Registry entry created/removed
  - macOS: LaunchAgent .plist created/removed

### How It Works

1. User opens Settings window
2. Scrolls to "System" section
3. Toggles "Launch at login" checkbox
4. Clicks "Save"
5. Main process syncs to OS:
   - Windows: Updates HKCU\Software\Microsoft\Windows\CurrentVersion\Run
   - macOS: Creates/removes ~/Library/LaunchAgents/com.meetingfly.app.plist

### On Next Login
- App launches automatically
- Runs in background (hidden window)
- Ready for calendar polling to trigger flyovers
- Tray icon visible in system tray

## Architecture

```
Settings UI (React)
    ↓
IPC: settings:save
    ↓
Main Process:
    saveSettings() → electron-store
    if (launchAtLogin):
        enableAutoLaunch()
            ↓
            Registry/LaunchAgent Updated
    else:
        disableAutoLaunch()
```

## Files Modified

| File | Change |
|------|--------|
| package.json | Added `auto-launch@^5.0.5` |
| src/shared/types.ts | Added `launchAtLogin: boolean` field |
| src/main/auto-launch-manager.ts | **NEW** - Auto-launch logic |
| src/main/index.ts | Init auto-launch, added IPC handler |
| src/renderer/settings/src/App.tsx | Added System section with toggle |

## Testing Phase 2

### Windows
```
1. Enable "Launch at login" → Save
2. Open Registry Editor: regedit
3. Navigate: HKCU\Software\Microsoft\Windows\CurrentVersion\Run
4. Look for "MeetingFly" entry with app path
5. Restart computer → App auto-launches
```

### macOS
```
1. Enable "Launch at login" → Save
2. Open Terminal
3. cat ~/Library/LaunchAgents/com.meetingfly.app.plist
4. Restart computer → App auto-launches
```

## Next: Phase 3 — Calendar Integrations

Phase 3 will implement:
- Google Calendar OAuth 2.0
- Microsoft Outlook/Teams OAuth 2.0
- Event polling (every 5 min)
- Automatic flyover triggering
- Lead time scheduling

This makes MeetingFly fully functional!
