# MeetingFly ✈️

<div align="center">

**Never miss a meeting again** — A fun, lightweight desktop app that flies a sprite across your screen before every calendar event.

![Version](https://img.shields.io/github/v/release/your-username/meetingfly)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue)
![License](https://img.shields.io/badge/license-MIT-green)

*[Screenshots](#screenshots) • [Download](#installation) • [Features](#features) • [Setup](#setup)*

</div>

---

## 🎯 What is MeetingFly?

MeetingFly is a desktop notification app with personality. Instead of boring pop-ups, it flies a customizable sprite (airplane, rocket, bird, UFO) across your screen at a configurable time before your meetings start. It syncs with **Google Calendar** and **Microsoft Outlook**, runs quietly in your system tray, and keeps you on schedule with style.

Perfect for remote workers, busy professionals, and anyone who wants a more delightful way to stay on top of their calendar.

---

## ✨ Features

### 🎨 Customizable Animations
- **4 built-in sprites**: Airplane ✈️, Rocket 🚀, Bird 🐦, UFO 🛸
- **Upload custom sprites**: Use your own PNG/SVG images
- **5 flight paths**: Straight, diagonal-up, diagonal-down, wavy, random bounce
- **Adjustable speed & size**: Make it subtle or impossible to miss
- **Meeting title overlay**: Shows what's coming up
- **Color tinting**: Custom colors per calendar source (Google blue, Microsoft purple, etc.)

### 📅 Smart Calendar Integration
- **Google Calendar** sync via OAuth 2.0
- **Microsoft Outlook/Office 365** sync via Microsoft Graph API
- **Automatic polling**: Checks for new meetings every 5 minutes
- **Configurable lead time**: Get notified 5, 10, or 15 minutes before meetings
- **Filters out**: Declined invites, cancelled meetings, all-day events

### 🔔 Notifications & Alerts
- **Custom sounds**: Upload your own sound file or use the built-in beep
- **Visual overlay**: Transparent, non-intrusive, click-through window
- **System tray integration**: Always accessible, never in your way

### ⚙️ System Integration
- **Launch at login**: Start automatically when you boot your computer
- **Auto-update**: Get notified in the tray when new versions are available
- **Secure storage**: Calendar tokens encrypted using OS keychain (macOS) or DPAPI (Windows)
- **Cross-platform**: Built with Electron, runs on Windows 10/11 and macOS 10.13+

---

## 📥 Installation

### Windows

1. **Download** the latest `MeetingFly-Setup-X.X.X.exe` from [Releases](https://github.com/your-username/meetingfly/releases/latest)
2. **Run the installer** — Windows SmartScreen may show a warning on first launch (this improves as more users install)
3. **Launch MeetingFly** from Start Menu or Desktop shortcut
4. **Configure** your calendar credentials in Settings

### macOS

1. **Download** the latest `MeetingFly-X.X.X.dmg` from [Releases](https://github.com/your-username/meetingfly/releases/latest)
2. **Open the DMG** and drag MeetingFly to Applications
3. **Launch MeetingFly** — You may need to allow it in System Preferences → Security & Privacy
4. **Configure** your calendar credentials in Settings

### Build from Source

Requires Node.js 18+ and npm:

```bash
# Clone the repository
git clone https://github.com/your-username/meetingfly.git
cd meetingfly

# Install dependencies
npm install

# Generate app icons
python resources/generate-icons.py  # or python3 on macOS/Linux

# Run in development
npm run dev

# Build production app
npm run build
npm run package        # Build for current platform
npm run package:win    # Build for Windows
npm run package:mac    # Build for macOS
```

---

## 🚀 Setup

### 1. Launch at Login (Optional)

In **Settings** → **System**, enable **"Launch at Login"** to start MeetingFly automatically when your computer boots.

### 2. Calendar Integration

#### Google Calendar

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Calendar API**
4. Create **OAuth 2.0 Client ID** (Desktop app type)
5. Copy **Client ID** and **Client Secret**
6. In MeetingFly → **Settings** → **Google Calendar**:
   - Paste Client ID and Client Secret
   - Click **Connect**
   - Authorize in browser
7. Enable **"Sync Google Calendar"** toggle

#### Microsoft Outlook

1. Go to [Azure Portal](https://portal.azure.com/) → App registrations
2. Create a new registration
3. Set redirect URI: `http://localhost` (Public client/native)
4. Add **API Permissions**: `Calendars.Read` (Delegated)
5. Copy **Application (client) ID**
6. In MeetingFly → **Settings** → **Microsoft Calendar**:
   - Paste Client ID
   - Click **Connect**
   - Sign in with Microsoft account
7. Enable **"Sync Microsoft Calendar"** toggle

### 3. Customize Animation

**Settings** → **Animation**:
- Choose a built-in sprite or upload your own
- Select flight path (straight, wavy, etc.)
- Adjust speed (1-10) and size (0.5-3.0x)
- Preview your changes with **Preview Flyover** button

**Settings** → **Customization**:
- Set tint colors for Google and Microsoft calendars
- Choose from preset swatches or use custom color picker

### 4. Sound & Timing

**Settings** → **Sound**:
- Enable sound notifications
- Upload custom MP3/WAV/OGG file

**Settings** → **Alert Timing**:
- Set lead time (5, 10, or 15 minutes before meeting)
- Toggle meeting title overlay

---

## 🖼️ Screenshots

> 🚧 **Coming Soon** — Screenshots will be added in the next update

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Electron 31 |
| **UI** | React 18.3 + TypeScript 5.5 |
| **Build System** | Vite 5.3 + electron-vite |
| **Packaging** | electron-builder 24 |
| **Auto-update** | electron-updater 6.3 |
| **Settings Storage** | electron-store 7.0 (JSON) |
| **Token Storage** | OS Keychain (macOS) / DPAPI (Windows) |
| **Startup Management** | auto-launch 5.0 |
| **APIs** | Google Calendar API v3, Microsoft Graph API |

---

## 🔐 Security & Privacy

- **No data collection**: MeetingFly does not send any data to external servers (except calendar APIs)
- **Secure token storage**: OAuth tokens are encrypted using OS-level security (Keychain on macOS, DPAPI on Windows)
- **Local processing**: All meeting data is processed locally on your machine
- **Open source**: Full source code available for audit
- **No telemetry**: No usage tracking, no analytics

---

## 🧑‍💻 Development

### Project Structure

```
meetingfly/
├── src/
│   ├── main/              # Main process (Electron backend)
│   │   ├── index.ts       # App initialization, IPC handlers
│   │   ├── overlay-manager.ts
│   │   ├── tray-manager.ts
│   │   ├── settings-store.ts
│   │   ├── auto-launch-manager.ts
│   │   ├── auto-updater.ts
│   │   └── calendar/      # Calendar integration
│   │       ├── calendar-manager.ts
│   │       ├── google-provider.ts
│   │       ├── microsoft-provider.ts
│   │       ├── token-store.ts
│   │       └── auth-server.ts
│   ├── preload/           # Preload scripts (bridge to renderer)
│   │   ├── index.ts
│   │   └── overlay.ts
│   ├── renderer/          # Frontend UI (React)
│   │   ├── settings/      # Settings window
│   │   └── overlay/       # Flyover animation window
│   └── shared/            # Shared types
│       └── types.ts
├── resources/             # Icons, entitlements
├── .github/workflows/     # CI/CD (GitHub Actions)
├── electron-builder.yml   # Build configuration
└── package.json
```

### Available Scripts

```bash
npm run dev          # Start development server with hot-reload
npm run build        # Build production code
npm run preview      # Preview production build
npm run package      # Package app for current platform
npm run package:win  # Package for Windows
npm run package:mac  # Package for macOS
```

### Running Tests

```bash
npm test             # Run tests (when implemented)
npm run lint         # Lint code (when configured)
```

---

## 📦 Building & Distribution

### Local Build

```bash
npm run build
npm run package      # Creates distributable in dist/
```

### Release Workflow (GitHub Actions)

1. Update version in `package.json`
2. Commit and tag:
   ```bash
   git add package.json
   git commit -m "Release v0.2.0"
   git tag v0.2.0
   git push origin main --tags
   ```
3. GitHub Actions automatically:
   - Builds for Windows & macOS
   - Signs binaries (if secrets configured)
   - Creates GitHub Release
   - Uploads installers

[📖 Code signing setup guide →](CODE_SIGNING.md)

---

## 🔧 Configuration

### Auto-update URL

By default, the app checks for updates from GitHub Releases. To change this, update `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: your-username
  repo: meetingfly
```

### Custom Calendar API Endpoints

Calendar API endpoints are configured in:
- `src/main/calendar/google-provider.ts`
- `src/main/calendar/microsoft-provider.ts`

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: [Open an issue](https://github.com/your-username/meetingfly/issues/new)
2. **Suggest features**: [Start a discussion](https://github.com/your-username/meetingfly/discussions)
3. **Submit PRs**: Fork → Branch → Commit → Push → Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use React hooks and functional components
- Keep main process lightweight (offload to renderer when possible)
- Test on both Windows and macOS
- Update README if adding user-facing features

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:
- [Electron](https://www.electronjs.org/) — Cross-platform desktop framework
- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Fast build tool
- [electron-builder](https://www.electron.build/) — Packaging & distribution

Icons generated from [icon.svg](resources/icon.svg) using [cairosvg](https://cairosvg.org/) and [Pillow](https://python-pillow.org/).

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/meetingfly/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/meetingfly/discussions)
- **Email**: your-email@example.com

---

<div align="center">

**Made with ❤️ by [Your Name](https://github.com/your-username)**

⭐ Star this repo if you find it useful!

</div>
