# Changelog

All notable changes to MeetingFly will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release with all Phase 1-5 features
- Animated flyover notifications with 4 built-in sprites (airplane, rocket, bird, UFO)
- 5 flight path options (straight, diagonal-up, diagonal-down, wavy, random)
- Customizable speed, size, and sound settings
- Custom sprite upload support (PNG/SVG)
- Custom sound file support (MP3/WAV/OGG)
- Google Calendar integration via OAuth 2.0
- Microsoft Outlook/Office 365 integration via Microsoft Graph API
- Automatic calendar polling every 5 minutes
- Configurable meeting lead time (5, 10, 15 minutes)
- Meeting title overlay on flyover
- Color tinting per calendar source with preset swatches and custom picker
- System tray integration with dynamic menu
- Launch at login functionality
- Auto-update checking with tray notifications
- Secure token storage using OS keychain/DPAPI
- Cross-platform support (Windows 10/11, macOS 10.13+)

### Changed
- N/A (initial release)

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- OAuth tokens encrypted using OS-level security APIs
- No telemetry or data collection
- All processing done locally

---

## [0.1.0] - YYYY-MM-DD

### Added
- Initial beta release
- Basic animation engine
- Settings UI
- Calendar synchronization
- Auto-update support

---

## Release Notes Guidelines

When preparing a new release:

1. **Update version in package.json**
   ```bash
   npm version [patch|minor|major]
   ```

2. **Update this CHANGELOG**
   - Move items from [Unreleased] to new version section
   - Add release date
   - Categorize changes: Added, Changed, Deprecated, Removed, Fixed, Security

3. **Create git tag**
   ```bash
   git add CHANGELOG.md package.json
   git commit -m "Release vX.Y.Z"
   git tag vX.Y.Z
   git push origin main --tags
   ```

4. **GitHub Actions** will automatically:
   - Build for Windows & macOS
   - Sign binaries (if configured)
   - Create GitHub Release with changelog
   - Upload installers

---

## Version Numbering

- **Major (X.0.0)**: Breaking changes, major features
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, minor improvements

Example:
- `0.1.0` → Initial release
- `0.2.0` → Add Zoom calendar integration (new feature)
- `0.2.1` → Fix OAuth token refresh bug (bug fix)
- `1.0.0` → Public stable release (major milestone)
