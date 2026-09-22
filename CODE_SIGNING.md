# Code Signing Setup Guide

This document explains how to configure code signing for MeetingFly on both macOS and Windows platforms.

## Why Code Signing?

### macOS
**Required** for distribution. macOS Gatekeeper will block unsigned applications from running unless users explicitly override security settings.

### Windows
**Optional but strongly recommended**. Without signing, Windows SmartScreen will show warnings when users first download and run the app. After enough users run it, the reputation improves and warnings decrease.

---

## macOS Code Signing & Notarization

### Prerequisites

1. **Apple Developer Account** ($99/year)
   - Enroll at https://developer.apple.com/programs/

2. **Developer ID Application Certificate**
   - Sign in to https://developer.apple.com/account
   - Go to Certificates, Identifiers & Profiles
   - Create a "Developer ID Application" certificate
   - Download and install it in Keychain Access

3. **Export Certificate**
   ```bash
   # Open Keychain Access → My Certificates
   # Right-click your Developer ID Application cert → Export
   # Save as .p12 file with a strong password
   ```

4. **App-Specific Password** (for notarization)
   ```bash
   # Generate at https://appleid.apple.com/account/manage
   # Security → App-Specific Passwords → Generate Password
   # Label it "MeetingFly Notarization"
   ```

5. **Find Your Team ID**
   ```bash
   # Visit https://developer.apple.com/account
   # Look for "Team ID" (10-character string like "AB12CD34EF")
   ```

### Environment Variables

Set these in your CI/CD environment (GitHub Actions secrets):

```bash
# Certificate file (base64-encoded .p12)
CSC_LINK=$(cat ~/path/to/cert.p12 | base64)

# Certificate password
CSC_KEY_PASSWORD="your-cert-password"

# Apple ID for notarization
APPLE_ID="your-email@example.com"

# App-specific password
APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"

# Team ID
APPLE_TEAM_ID="AB12CD34EF"
```

### Local Testing

```bash
# Export variables in your shell
export CSC_LINK="/path/to/cert.p12"
export CSC_KEY_PASSWORD="your-password"
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="AB12CD34EF"

# Build and sign
npm run package:mac
```

### Troubleshooting

- **"No identity found"**: Certificate not in Keychain or CSC_LINK incorrect
- **"Notarization failed"**: Check APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD
- **"Invalid entitlements"**: Review `resources/entitlements.mac.plist`

---

## Windows Code Signing

### Prerequisites

1. **Code Signing Certificate**
   - Purchase from trusted CA (DigiCert, Sectigo, GlobalSign, etc.)
   - Options:
     - **Standard Code Signing** (~$200-400/year, .pfx file)
     - **EV Code Signing** (~$300-600/year, hardware token, instant SmartScreen trust)

2. **Export Certificate as .pfx**
   ```powershell
   # If certificate is in Windows Certificate Store:
   # certmgr.msc → Personal → Certificates
   # Right-click → All Tasks → Export
   # Choose "Yes, export the private key"
   # Format: PKCS #12 (.PFX)
   # Set a strong password
   ```

### Environment Variables

Set in CI/CD (GitHub Actions secrets):

```bash
# Certificate file (base64-encoded .pfx)
WIN_CSC_LINK=$(cat cert.pfx | base64)

# Certificate password
WIN_CSC_KEY_PASSWORD="your-pfx-password"
```

### Local Testing

```powershell
# PowerShell
$env:CSC_LINK = "C:\path\to\cert.pfx"
$env:CSC_KEY_PASSWORD = "your-password"

npm run package:win
```

### Without Code Signing

If you choose not to sign (for testing or budget reasons):

1. Users will see SmartScreen warnings initially
2. App reputation builds over time as more users install
3. Set `verifyUpdateCodeSignature: false` in electron-builder.yml (already configured)

---

## GitHub Actions Setup

### Required Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret:

**For macOS:**
- `MACOS_CERTIFICATE` - Base64-encoded .p12 file
- `MACOS_CERTIFICATE_PASSWORD` - Certificate password
- `APPLE_ID` - Your Apple ID email
- `APPLE_APP_SPECIFIC_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - 10-character team ID

**For Windows (optional):**
- `WINDOWS_CERTIFICATE` - Base64-encoded .pfx file
- `WINDOWS_CERTIFICATE_PASSWORD` - Certificate password

**For publishing:**
- `GH_TOKEN` - GitHub Personal Access Token with `repo` scope (or use default `GITHUB_TOKEN`)

### Base64 Encoding Certificates

**macOS/Linux:**
```bash
base64 -i cert.p12 -o cert.p12.base64
# Copy contents of cert.p12.base64 to GitHub secret
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cert.pfx")) | Out-File cert.pfx.base64
# Copy contents of cert.pfx.base64 to GitHub secret
```

---

## Release Process

1. **Update version** in `package.json`:
   ```json
   {
     "version": "0.2.0"
   }
   ```

2. **Commit and tag**:
   ```bash
   git add package.json
   git commit -m "Release v0.2.0"
   git tag v0.2.0
   git push origin main --tags
   ```

3. **GitHub Actions will**:
   - Build for Windows and macOS
   - Sign binaries (if secrets are configured)
   - Notarize macOS app
   - Create GitHub Release
   - Upload installers as release assets

4. **electron-updater** will automatically detect the new release for in-app updates

---

## Cost Summary

| Item | Cost | Required? |
|------|------|-----------|
| Apple Developer Program | $99/year | Yes (for macOS distribution) |
| Windows Code Signing Cert | $200-400/year | No (but recommended) |
| Windows EV Code Signing | $300-600/year | No (instant trust, no warnings) |

### Budget Options

- **Full signing** ($300-500/year): Best user experience, no warnings
- **macOS only** ($99/year): Required for Mac, Windows shows warnings initially
- **No signing** ($0): Free, but Mac won't run and Windows shows warnings

---

## Testing Signed Builds

### macOS
```bash
# Verify signature
codesign -vvv --deep --strict /Applications/MeetingFly.app

# Check notarization
spctl -a -vv /Applications/MeetingFly.app
# Should output: "accepted"
```

### Windows
```powershell
# Verify signature
Get-AuthenticodeSignature "C:\Program Files\MeetingFly\MeetingFly.exe"
# Status should be "Valid"
```

---

## Further Reading

- [electron-builder Code Signing](https://www.electron.build/code-signing)
- [Apple Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Windows SmartScreen](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-defender-smartscreen/)
