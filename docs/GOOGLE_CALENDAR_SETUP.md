# Google Calendar Setup Guide

This guide walks you through setting up Google Calendar integration with MeetingFly.

## Overview

MeetingFly uses the **Google Calendar API v3** with OAuth 2.0 authentication to securely access your calendar events. You'll need to create a Google Cloud project and configure OAuth credentials.

---

## Prerequisites

- Google account (the one with the calendar you want to sync)
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- MeetingFly installed and running

---

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click the project dropdown at the top
   - Click **New Project**
   - Enter project name: `MeetingFly` (or any name)
   - Leave organization blank (unless you have one)
   - Click **Create**
   - Wait for project creation (5-10 seconds)

3. **Select Your Project**
   - Click the project dropdown again
   - Select your newly created project

---

## Step 2: Enable Google Calendar API

1. **Open API Library**
   - In the left sidebar, click **APIs & Services** → **Library**
   - Or visit: https://console.cloud.google.com/apis/library

2. **Search for Calendar API**
   - In the search bar, type: `Google Calendar API`
   - Click on **Google Calendar API** in results

3. **Enable the API**
   - Click **Enable** button
   - Wait for activation (5-10 seconds)
   - You should see "API enabled" status

---

## Step 3: Configure OAuth Consent Screen

1. **Open OAuth Consent Screen**
   - Left sidebar → **APIs & Services** → **OAuth consent screen**
   - Or visit: https://console.cloud.google.com/apis/credentials/consent

2. **Choose User Type**
   - Select **External** (unless you have a Google Workspace)
   - Click **Create**

3. **Fill Out App Information**
   - **App name**: `MeetingFly`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload MeetingFly icon
   - **Application home page**: (Optional) Your website or GitHub repo
   - **Application privacy policy**: (Optional) Link to privacy policy
   - **Application terms of service**: (Optional) Link to terms
   - **Authorized domains**: (Leave blank for personal use)
   - **Developer contact information**: Your email address
   - Click **Save and Continue**

4. **Scopes** (Step 2)
   - Click **Add or Remove Scopes**
   - Search for: `calendar.events.readonly`
   - Check the box next to:
     - `https://www.googleapis.com/auth/calendar.events.readonly`
   - Click **Update**
   - Click **Save and Continue**

5. **Test Users** (Step 3)
   - Click **Add Users**
   - Enter your Google email address (and any other accounts you want to test with)
   - Click **Add**
   - Click **Save and Continue**

6. **Summary** (Step 4)
   - Review your settings
   - Click **Back to Dashboard**

---

## Step 4: Create OAuth 2.0 Credentials

1. **Open Credentials Page**
   - Left sidebar → **APIs & Services** → **Credentials**
   - Or visit: https://console.cloud.google.com/apis/credentials

2. **Create Credentials**
   - Click **+ Create Credentials** at the top
   - Select **OAuth client ID**

3. **Configure OAuth Client**
   - **Application type**: Select **Desktop app**
   - **Name**: `MeetingFly Desktop Client` (or any name)
   - Click **Create**

4. **Save Credentials**
   - A dialog appears with your credentials
   - **Copy Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - **Copy Client Secret** (looks like: `GOCSPX-abc123xyz`)
   - Click **OK**
   - (You can always view these later by clicking the credential name)

---

## Step 5: Configure MeetingFly

1. **Open MeetingFly Settings**
   - Click the MeetingFly icon in system tray
   - Click **Settings**

2. **Navigate to Google Calendar Section**
   - Scroll to **Google Calendar** section

3. **Enter Credentials**
   - **Client ID**: Paste the Client ID from Step 4
   - **Client Secret**: Paste the Client Secret from Step 4

4. **Connect to Google**
   - Click **Connect** button
   - Your default browser opens with Google sign-in

5. **Authorize MeetingFly**
   - Sign in with your Google account (if not already signed in)
   - Review permissions:
     - "See events you have created in Google Calendar"
   - Click **Allow**
   - Browser shows: "Authorization successful! You can close this window."
   - Return to MeetingFly

6. **Enable Sync**
   - Toggle **"Sync Google Calendar"** to ON
   - Status badge should show: "✓ Connected"

7. **Test the Connection**
   - Click **Preview Flyover** button in Settings
   - If you have an upcoming meeting, wait for the lead time
   - The flyover should appear automatically before the meeting

---

## Troubleshooting

### "Access blocked: MeetingFly has not completed verification"

**Cause**: Your app is in testing mode and restricted to test users.

**Solution**:
1. Go to OAuth consent screen
2. Add your email to Test Users list
3. Try connecting again

**Alternative** (for personal use):
- This warning is safe to bypass for personal projects
- Click "Advanced" → "Go to MeetingFly (unsafe)"
- Only do this if you trust your own app!

---

### "redirect_uri_mismatch" Error

**Cause**: The OAuth redirect URI doesn't match what's configured in Google Cloud.

**Solution**:
1. Go to Credentials page in Google Cloud Console
2. Click your OAuth client ID
3. Under "Authorized redirect URIs", add:
   - `http://localhost:*` (with wildcard)
   - Or the specific port shown in the error (e.g., `http://localhost:54321`)
4. Click **Save**
5. Wait 5 minutes for changes to propagate
6. Try connecting again in MeetingFly

---

### "invalid_client" Error

**Cause**: Client ID or Client Secret is incorrect.

**Solution**:
1. Go to Credentials page in Google Cloud Console
2. Click your OAuth client ID
3. Verify the Client ID and Client Secret
4. Re-copy and paste them into MeetingFly
5. Click **Connect** again

---

### No Meetings Showing Up

**Possible causes**:
1. **Calendar sync not enabled**: Toggle "Sync Google Calendar" to ON
2. **No upcoming meetings**: Check your Google Calendar for events
3. **Lead time not met**: Meetings only trigger at configured lead time (5/10/15 min before)
4. **Declined/cancelled meetings**: These are filtered out
5. **All-day events**: These are ignored by default

**Solution**:
1. Verify you have upcoming meetings in Google Calendar
2. Check lead time setting in MeetingFly → Alert Timing
3. Use "Preview Flyover" button to test animation

---

### Token Expired / Authentication Failed

**Cause**: OAuth tokens expire after some time (usually 1 hour for access tokens).

**Solution**:
- MeetingFly automatically refreshes tokens using the refresh token
- If refresh fails, you may need to reconnect:
  1. Click **Disconnect** in Google Calendar section
  2. Click **Connect** again
  3. Re-authorize in browser

---

## Security & Privacy

### What permissions does MeetingFly request?

- **Read-only access to calendar events**: `calendar.events.readonly`
- MeetingFly can see your calendar events but cannot create, modify, or delete them

### Where are tokens stored?

- **Windows**: Encrypted using DPAPI (Data Protection API)
- **macOS**: Encrypted using Keychain
- Tokens never leave your computer (except to Google APIs)

### Can I revoke access?

Yes, at any time:

1. **In MeetingFly**:
   - Settings → Google Calendar → Click **Disconnect**

2. **In Google Account**:
   - Visit https://myaccount.google.com/permissions
   - Find "MeetingFly" in the list
   - Click **Remove Access**

---

## Rate Limits

Google Calendar API has the following limits:
- **Queries per day**: 1,000,000 (unlikely to hit with MeetingFly)
- **Queries per 100 seconds**: 2,000
- **Queries per second**: 10

MeetingFly polls every **5 minutes**, so you'll use:
- ~12 API calls per hour
- ~288 API calls per day

Well within the free tier limits!

---

## Advanced: Multiple Calendars

To sync multiple Google calendars:

1. MeetingFly syncs the **primary calendar** by default
2. To include other calendars, you would need to modify the code in `src/main/calendar/google-provider.ts`:
   ```typescript
   // Change calendarId from 'primary' to specific calendar ID
   const response = await fetch(
     `https://www.googleapis.com/calendar/v3/calendars/YOUR_CALENDAR_ID/events?...`
   )
   ```
3. Or sync multiple calendars by fetching each one in a loop

(This feature may be added in a future release)

---

## Questions?

- **MeetingFly Issues**: https://github.com/your-username/meetingfly/issues
- **Google Calendar API Docs**: https://developers.google.com/calendar/api/v3/reference
- **OAuth 2.0 Guide**: https://developers.google.com/identity/protocols/oauth2

---

**Next**: [Microsoft Calendar Setup →](MICROSOFT_CALENDAR_SETUP.md)
