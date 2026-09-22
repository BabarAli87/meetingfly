# Screenshots Guide

This folder contains screenshots and promotional images for MeetingFly.

## Required Screenshots

### 1. **Hero Banner** (`hero.png`)
- Full-width promotional banner (1200×630px)
- Shows the app in action with a sprite flying across screen
- Clean background, visible meeting notification

### 2. **Settings Window** (`settings-overview.png`)
- Full settings window screenshot
- Show all sections: Animation, Sound, Alert Timing, System, Calendars
- 520×900px native resolution

### 3. **Animation Settings** (`settings-animation.png`)
- Close-up of Animation section
- Show sprite selection, flight path dropdown, speed/size sliders
- Include "Preview Flyover" button

### 4. **Calendar Integration** (`settings-calendars.png`)
- Close-up of Google Calendar and Microsoft Calendar sections
- Show connected status with badges
- Display "Sync Enabled" toggles active

### 5. **Customization** (`settings-customization.png`)
- Close-up of color tint pickers
- Show swatches and custom color inputs for both calendar sources
- Include path preview canvas

### 6. **Flyover in Action** (`flyover-airplane.png`, `flyover-rocket.png`, etc.)
- Multiple screenshots showing different sprites mid-flight
- Include meeting title overlay: "Stand-up @ 2:00 PM"
- Capture on clean desktop background (macOS and Windows)

### 7. **System Tray** (`tray-menu.png`)
- Right-click tray icon to open menu
- Show menu items: Settings, Preview Flyover, Check for Updates, Quit
- If update available, show "⬆️ Update Available" item

### 8. **Path Preview** (`path-preview.png`)
- Close-up of the path preview canvas
- Show dashed line indicating sprite flight path
- Include all 5 path types in separate screenshots

---

## Screenshot Capture Instructions

### Windows

1. **Use Snipping Tool or Snip & Sketch**
   ```
   Win + Shift + S
   ```
2. Select region and save as PNG
3. Place in `screenshots/` folder with descriptive name

### macOS

1. **Use built-in screenshot tool**
   ```
   Cmd + Shift + 4 (region)
   Cmd + Shift + 4, then Space (window)
   ```
2. Screenshots save to Desktop by default
3. Move to `screenshots/` folder and rename

---

## Editing & Optimization

### Tools
- **Windows**: Paint.NET, GIMP, Photoshop
- **macOS**: Preview, Pixelmator, Photoshop
- **Cross-platform**: GIMP, Figma, Photoshop

### Optimization
```bash
# Install pngquant for compression
npm install -g pngquant-bin

# Optimize PNG files (lossless)
pngquant --quality=80-95 screenshots/*.png --ext .png --force
```

### Guidelines
- **Format**: PNG for UI screenshots, JPEG for photos
- **Resolution**: Native resolution (no upscaling)
- **File size**: < 500KB per screenshot (optimize with pngquant)
- **Naming**: lowercase-with-hyphens.png
- **Privacy**: Remove personal info (emails, meeting titles, calendar events)

---

## Creating the Hero Banner

Use a graphic design tool (Figma, Canva, Photoshop) to create a banner:

1. **Canvas**: 1200×630px (GitHub Social Preview size)
2. **Background**: Gradient or solid color (MeetingFly brand colors)
3. **Title**: "MeetingFly" in large, bold font
4. **Tagline**: "Never miss a meeting again"
5. **Visual**: Screenshot of sprite mid-flight + settings window
6. **Icons**: Platform badges (Windows, macOS)

Export as `hero.png` at 2x resolution (2400×1260px) for Retina displays.

---

## Updating README

After adding screenshots:

1. **Update README.md** in project root
2. **Replace** the "🚧 Coming Soon" section with:

```markdown
## 🖼️ Screenshots

### Settings Window
![Settings Overview](screenshots/settings-overview.png)

### Animation in Action
![Flyover Animation](screenshots/flyover-airplane.png)

### Calendar Integration
![Calendar Setup](screenshots/settings-calendars.png)

### Customization Options
![Color Tinting](screenshots/settings-customization.png)
```

3. **Add hero banner** to top of README (optional):
```markdown
<div align="center">
  <img src="screenshots/hero.png" alt="MeetingFly Hero" width="100%">
</div>
```

---

## GitHub Repository Setup

### Social Preview Image

1. Go to repository **Settings**
2. Scroll to **Social preview**
3. Upload `screenshots/hero.png` (1200×630px)
4. This image appears when sharing repo links on social media

### Release Assets

When creating a release, attach key screenshots:
- `hero.png`
- `settings-overview.png`
- `flyover-airplane.png`

---

## Examples to Capture

### Good Examples
✅ Clean desktop background
✅ Native window resolution
✅ Clear, readable text
✅ No personal information
✅ Proper lighting/contrast

### Bad Examples
❌ Cluttered desktop
❌ Scaled/blurry images
❌ Personal emails/calendar events visible
❌ Poor contrast (dark mode on dark bg)
❌ Watermarks or annotations

---

## Placeholder Screenshots

Until real screenshots are captured, you can create placeholders:

```html
<div style="width:520px; height:300px; background:#f0f0f0; 
            display:flex; align-items:center; justify-content:center;
            border:2px dashed #ccc; font-size:18px; color:#999;">
  Screenshot Coming Soon
</div>
```

Save as PNG using a screenshot tool or HTML-to-image converter.

---

## Questions?

See the main [README.md](../README.md) or open an issue.
