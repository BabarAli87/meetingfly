# Contributing to MeetingFly

Thank you for your interest in contributing to MeetingFly! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Give and accept constructive feedback gracefully
- Focus on what is best for the community and project

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting, or personal attacks
- Publishing others' private information
- Other conduct inappropriate in a professional setting

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please:
1. **Check existing issues** to avoid duplicates
2. **Verify the bug** on the latest version
3. **Collect information**: OS, MeetingFly version, steps to reproduce

**Create a bug report** with:
- Clear, descriptive title
- Detailed steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- System information

**Example**:
```
Title: Flyover not appearing 5 minutes before Google Calendar meetings

Environment:
- OS: Windows 11
- MeetingFly version: 0.1.0
- Calendar: Google Calendar (connected and synced)

Steps to reproduce:
1. Connect Google Calendar
2. Create meeting starting in 10 minutes
3. Wait until 5 minutes before meeting
4. No flyover appears

Expected: Sprite flies across screen at 5-minute mark
Actual: Nothing happens

Additional info: 
- Preview Flyover button works correctly
- Lead time is set to 5 minutes in settings
```

### Suggesting Features

Before suggesting features:
1. Check if it already exists or is planned
2. Consider if it fits the project's goals
3. Think about how it would work across platforms (Windows & macOS)

**Create a feature request** with:
- Clear use case and problem it solves
- Proposed solution or implementation ideas
- Alternative solutions considered
- Mockups or examples (if applicable)

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following coding standards
4. **Test thoroughly** on Windows and macOS (if possible)
5. **Commit with clear messages** following commit guidelines
6. **Push to your fork** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** with detailed description

---

## Development Setup

### Prerequisites

- **Node.js** 18 or higher
- **npm** 7 or higher
- **Git**
- **Python** 3.7+ (for icon generation)

### Clone and Install

```bash
# Fork the repo on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/meetingfly.git
cd meetingfly

# Install dependencies
npm install

# Generate icons (optional, for packaging)
python resources/generate-icons.py
```

### Development Workflow

```bash
# Start development server with hot reload
npm run dev

# Build production code (compile TypeScript)
npm run build

# Package app for current platform
npm run package

# Platform-specific packaging
npm run package:win    # Windows
npm run package:mac    # macOS
```

### Dev Tools

- **Electron DevTools**: Automatically open in dev mode
- **React DevTools**: Install browser extension
- **VS Code**: Recommended editor with TypeScript support

---

## Project Structure

```
meetingfly/
├── src/
│   ├── main/                  # Electron main process (Node.js)
│   │   ├── index.ts           # App entry, IPC handlers
│   │   ├── overlay-manager.ts # Flyover window
│   │   ├── tray-manager.ts    # System tray
│   │   ├── settings-store.ts  # Settings persistence
│   │   ├── auto-launch-manager.ts
│   │   ├── auto-updater.ts    # Update checking
│   │   └── calendar/          # Calendar integrations
│   │       ├── calendar-manager.ts  # Polling & scheduling
│   │       ├── google-provider.ts   # Google Calendar API
│   │       ├── microsoft-provider.ts # Microsoft Graph API
│   │       ├── token-store.ts       # Encrypted token storage
│   │       └── auth-server.ts       # OAuth redirect server
│   ├── preload/               # Bridge between main and renderer
│   │   ├── index.ts           # Settings window preload
│   │   └── overlay.ts         # Overlay window preload
│   ├── renderer/              # UI (React + TypeScript)
│   │   ├── settings/          # Settings window
│   │   │   └── src/
│   │   │       ├── App.tsx    # Main settings form
│   │   │       └── main.tsx   # Entry point
│   │   └── overlay/           # Flyover animation
│   │       └── src/
│   │           ├── Overlay.tsx    # Canvas animation component
│   │           ├── animation.ts   # Animation logic
│   │           ├── sprites.ts     # Built-in SVG sprites
│   │           └── main.tsx       # Entry point
│   └── shared/                # Shared types (main + renderer)
│       └── types.ts
├── resources/                 # Icons, entitlements, scripts
├── .github/workflows/         # CI/CD pipelines
├── electron-builder.yml       # Build/packaging config
└── package.json
```

### Key Technologies

- **Electron 31**: Main framework
- **React 18**: UI rendering
- **TypeScript 5**: Type safety
- **Vite 5**: Build tool
- **electron-builder**: Packaging
- **electron-updater**: Auto-update
- **electron-store**: Settings storage
- **auto-launch**: Startup management

---

## Coding Standards

### TypeScript

- Use **strict mode** (enabled in `tsconfig.json`)
- Avoid `any` type; use proper types or `unknown`
- Export types/interfaces from `src/shared/types.ts`
- Use `const` over `let` when possible
- Prefer `async/await` over callbacks

**Example**:
```typescript
// Good ✅
async function fetchMeetings(tokens: OAuthTokens): Promise<Meeting[]> {
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` }
  })
  const data: unknown = await response.json()
  // Validate and return typed data
  return data as Meeting[]
}

// Bad ❌
function fetchMeetings(tokens: any, callback: any) {
  fetch(API_URL).then((res: any) => {
    callback(res.json())
  })
}
```

### React

- Use **functional components** with hooks (no class components)
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use descriptive prop names and types

**Example**:
```tsx
// Good ✅
interface PathPreviewProps {
  readonly flightPath: FlightPath
  readonly sprite: SpriteName
  readonly size: number
}

export function PathPreview({ flightPath, sprite, size }: PathPreviewProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    drawPath(canvasRef.current, flightPath, sprite, size)
  }, [flightPath, sprite, size])
  
  return <canvas ref={canvasRef} width={280} height={62} />
}

// Bad ❌
export function PathPreview(props: any) {
  return <canvas id="preview" />
}
```

### Main Process

- Keep IPC handlers simple and focused
- Validate all data from renderer before processing
- Use async/await for asynchronous operations
- Handle errors gracefully with try/catch

**Example**:
```typescript
// Good ✅
ipcMain.handle('calendar:google:connect', async (_event, args: unknown) => {
  if (!isValidCredentials(args)) {
    throw new Error('Invalid credentials provided')
  }
  
  const { clientId, clientSecret } = args as GoogleCredentials
  
  try {
    await connectGoogle(clientId, clientSecret)
    saveSettings({ googleClientId: clientId, googleClientSecret: clientSecret })
  } catch (err) {
    console.error('Failed to connect Google Calendar:', err)
    throw err
  }
})

// Bad ❌
ipcMain.handle('calendar:google:connect', (_event, args) => {
  connectGoogle(args.clientId, args.clientSecret)
})
```

### Code Style

- **Indentation**: 2 spaces
- **Semicolons**: Yes
- **Quotes**: Single for JS/TS, double for JSX attributes
- **Line length**: Aim for 100 chars, max 120
- **Naming**:
  - `camelCase` for variables/functions
  - `PascalCase` for components/classes/types
  - `UPPER_SNAKE_CASE` for constants

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring (no feature/fix)
- **perf**: Performance improvements
- **test**: Adding or fixing tests
- **chore**: Build process, dependencies, tooling

### Examples

```bash
# Feature
git commit -m "feat(calendar): add Zoom calendar integration"

# Bug fix
git commit -m "fix(tray): update menu when update is available"

# Documentation
git commit -m "docs(readme): add troubleshooting section"

# Refactor
git commit -m "refactor(overlay): extract animation logic to separate file"

# Multiple files
git commit -m "chore(deps): update electron to 31.1.0

- Updates electron from 31.0.0 to 31.1.0
- Updates electron-builder to 24.14.0
- No breaking changes"
```

---

## Pull Request Process

### Before Submitting

1. ✅ Code follows style guidelines
2. ✅ All tests pass (when implemented)
3. ✅ TypeScript compiles without errors (`npm run build`)
4. ✅ App runs correctly in dev mode (`npm run dev`)
5. ✅ Changes work on both Windows and macOS (if possible)
6. ✅ Documentation updated (if user-facing changes)
7. ✅ Commit messages follow guidelines

### PR Title

Use the same format as commit messages:
```
feat(calendar): add Zoom calendar integration
```

### PR Description Template

```markdown
## Description
Brief summary of the changes

## Motivation and Context
Why is this change needed? What problem does it solve?

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Testing
How has this been tested?
- [ ] Tested on Windows 10/11
- [ ] Tested on macOS 10.13+
- [ ] Manual testing performed
- [ ] Automated tests added/updated

## Screenshots (if applicable)
Add screenshots to illustrate changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] TypeScript compiles without errors
- [ ] App runs in dev mode
- [ ] Documentation updated
- [ ] No console errors or warnings
```

### Review Process

1. Maintainer reviews code
2. Automated checks run (build, lint, type-check)
3. Feedback provided if changes needed
4. Once approved, PR is merged

---

## Testing

### Manual Testing

Currently, MeetingFly relies on manual testing:

1. **Build and run** the app
2. **Test all features**:
   - Animation settings (sprite, path, speed, size)
   - Sound settings (enable, custom file)
   - Calendar connections (Google, Microsoft)
   - Meeting sync and flyover trigger
   - Launch at login
   - Auto-update check
3. **Test edge cases**:
   - Invalid calendar credentials
   - Network offline
   - Multiple meetings at once
   - Very short lead times

### Automated Testing (Future)

We plan to add:
- Unit tests (Jest + React Testing Library)
- E2E tests (Playwright or Spectron)
- CI pipeline test stage

---

## Documentation

### When to Update Documentation

- Adding new features → Update README and relevant docs
- Changing behavior → Update affected documentation
- Fixing bugs → Add to CHANGELOG
- New APIs → Document in code comments (JSDoc)

### Documentation Files

- **README.md**: Main project documentation
- **CHANGELOG.md**: Version history and release notes
- **CODE_SIGNING.md**: Code signing setup guide
- **docs/GOOGLE_CALENDAR_SETUP.md**: Google Calendar integration
- **docs/MICROSOFT_CALENDAR_SETUP.md**: Microsoft Calendar integration
- **CONTRIBUTING.md**: This file

### Code Comments

Use **JSDoc** for functions and complex logic:

```typescript
/**
 * Creates a path function for sprite animation
 * @param path - The flight path type (straight, wavy, etc.)
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @returns Function that returns {x, y} position for given progress (0-1)
 */
export function createPathFn(
  path: FlightPath,
  width: number,
  height: number
): (progress: number) => { x: number; y: number } {
  // Implementation
}
```

---

## Questions?

- **General questions**: [GitHub Discussions](https://github.com/your-username/meetingfly/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/your-username/meetingfly/issues)
- **Security issues**: Email your-email@example.com

---

**Thank you for contributing to MeetingFly! 🚀**
