# Microsoft Calendar Setup Guide

This guide walks you through setting up Microsoft Outlook/Office 365 calendar integration with MeetingFly.

## Overview

MeetingFly uses the **Microsoft Graph API** with OAuth 2.0 (PKCE flow) to securely access your Outlook calendar events. You'll need to register an application in Azure Active Directory.

---

## Prerequisites

- Microsoft account (Outlook.com, Hotmail.com, or Office 365)
- Access to [Azure Portal](https://portal.azure.com/)
- MeetingFly installed and running

---

## Step 1: Register Application in Azure

1. **Go to Azure Portal**
   - Visit https://portal.azure.com/
   - Sign in with your Microsoft account

2. **Navigate to App Registrations**
   - Search for "App registrations" in the top search bar
   - Click **App registrations** in the results
   - Or use direct link: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

3. **Create New Registration**
   - Click **+ New registration** at the top
   - Fill in the form:
     - **Name**: `MeetingFly`
     - **Supported account types**: Select **Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**
     - **Redirect URI**: 
       - Platform: **Public client/native (mobile & desktop)**
       - URI: `http://localhost`
   - Click **Register**

4. **Save Application ID**
   - On the Overview page, find **Application (client) ID**
   - Copy this ID (looks like: `12345678-1234-1234-1234-123456789abc`)
   - Keep this for Step 4

---

## Step 2: Configure API Permissions

1. **Open API Permissions**
   - In the left sidebar, click **API permissions**

2. **Add Calendar Permission**
   - Click **+ Add a permission**
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Expand **Calendars** section
   - Check the box for:
     - ✅ **Calendars.Read** (Read user calendars)
   - Click **Add permissions** at the bottom

3. **Optional: Grant Admin Consent**
   - If you see a yellow warning banner about admin consent
   - Click **Grant admin consent for [Your Directory]**
   - Click **Yes** to confirm
   - (This step is optional for personal accounts)

---

## Step 3: Configure Authentication Settings

1. **Open Authentication**
   - In the left sidebar, click **Authentication**

2. **Verify Redirect URI**
   - Under **Platform configurations** → **Mobile and desktop applications**
   - Ensure `http://localhost` is listed
   - If not, click **+ Add URI** and add it

3. **Advanced Settings**
   - Scroll to **Advanced settings** section
   - **Allow public client flows**: Set to **Yes**
   - This enables the PKCE flow that MeetingFly uses
   - Click **Save** at the top

4. **Supported Account Types**
   - Ensure "Multitenant and personal accounts" is selected
   - This allows both work/school and personal Microsoft accounts

---

## Step 4: Configure MeetingFly

1. **Open MeetingFly Settings**
   - Click the MeetingFly icon in system tray
   - Click **Settings**

2. **Navigate to Microsoft Calendar Section**
   - Scroll to **Microsoft Calendar** section

3. **Enter Client ID**
   - **Client ID**: Paste the Application (client) ID from Step 1
   - (No Client Secret needed — MeetingFly uses PKCE flow)

4. **Connect to Microsoft**
   - Click **Connect** button
   - Your default browser opens with Microsoft sign-in

5. **Sign In and Authorize**
   - Sign in with your Microsoft account
   - Review permissions requested:
     - "Read your calendars"
   - Click **Accept**
   - Browser shows: "Authorization successful! You can close this window."
   - Return to MeetingFly

6. **Enable Sync**
   - Toggle **"Sync Microsoft Calendar"** to ON
   - Status badge should show: "✓ Connected"

7. **Test the Connection**
   - Click **Preview Flyover** button in Settings
   - If you have an upcoming meeting, wait for the lead time
   - The flyover should appear automatically before the meeting

---

## Troubleshooting

### "AADSTS50011: The reply URL specified does not match"

**Cause**: The redirect URI in Azure doesn't match what MeetingFly uses.

**Solution**:
1. Go to Azure Portal → App registrations → Your app
2. Click **Authentication** in sidebar
3. Verify `http://localhost` is in the list of redirect URIs
4. If not, add it under **Mobile and desktop applications**
5. Click **Save**
6. Try connecting again in MeetingFly

---

### "AADSTS65001: The user or administrator has not consented"

**Cause**: Required permissions not granted.

**Solution**:
1. Go to Azure Portal → App registrations → Your app
2. Click **API permissions**
3. Verify **Calendars.Read** is in the list
4. Click **Grant admin consent** (if available)
5. Try connecting again in MeetingFly

---

### "AADSTS700016: Application not found in the directory"

**Cause**: Application ID is incorrect or app was deleted.

**Solution**:
1. Verify you copied the correct **Application (client) ID** from Azure
2. Re-paste it in MeetingFly settings
3. If problem persists, create a new app registration

---

### "invalid_client" Error

**Cause**: The app is configured for confidential client flow instead of public client.

**Solution**:
1. Go to Azure Portal → App registrations → Your app
2. Click **Authentication**
3. Scroll to **Advanced settings**
4. Set **Allow public client flows** to **Yes**
5. Click **Save**
6. Try connecting again

---

### No Meetings Showing Up

**Possible causes**:
1. **Calendar sync not enabled**: Toggle "Sync Microsoft Calendar" to ON
2. **No upcoming meetings**: Check your Outlook calendar for events
3. **Lead time not met**: Meetings only trigger at configured lead time (5/10/15 min before)
4. **Declined/cancelled meetings**: These are filtered out
5. **All-day events**: These are ignored by default

**Solution**:
1. Verify you have upcoming meetings in Outlook calendar
2. Check lead time setting in MeetingFly → Alert Timing
3. Use "Preview Flyover" button to test animation

---

### Token Expired / Authentication Failed

**Cause**: OAuth tokens expire after some time (usually 1 hour for access tokens).

**Solution**:
- MeetingFly automatically refreshes tokens using the refresh token
- If refresh fails, you may need to reconnect:
  1. Click **Disconnect** in Microsoft Calendar section
  2. Click **Connect** again
  3. Re-authorize in browser

---

## Security & Privacy

### What permissions does MeetingFly request?

- **Read calendars**: `Calendars.Read`
- MeetingFly can see your calendar events but cannot create, modify, or delete them

### Where are tokens stored?

- **Windows**: Encrypted using DPAPI (Data Protection API)
- **macOS**: Encrypted using Keychain
- Tokens never leave your computer (except to Microsoft APIs)

### Why doesn't MeetingFly use a Client Secret?

- MeetingFly uses **PKCE (Proof Key for Code Exchange)** flow
- This is more secure for desktop apps because:
  - No secret needs to be embedded in the app
  - Secret can't be extracted by decompiling
  - PKCE provides equivalent security with dynamic code verifiers

### Can I revoke access?

Yes, at any time:

1. **In MeetingFly**:
   - Settings → Microsoft Calendar → Click **Disconnect**

2. **In Microsoft Account**:
   - Visit https://account.microsoft.com/privacy/app-access
   - Find "MeetingFly" in the list
   - Click **Remove**

---

## Account Types

MeetingFly supports the following Microsoft account types:

### Personal Accounts
- ✅ Outlook.com
- ✅ Hotmail.com
- ✅ Live.com
- ✅ MSN.com

### Work/School Accounts
- ✅ Office 365 (your-company.onmicrosoft.com)
- ✅ Microsoft 365
- ✅ Azure AD accounts

**Note**: Work/school accounts may require admin approval depending on your organization's policies.

---

## Rate Limits

Microsoft Graph API has the following throttling limits:
- **Personal accounts**: ~2,000 requests per hour per user
- **Work/school accounts**: Varies by tenant, typically 10,000+ per hour

MeetingFly polls every **5 minutes**, so you'll use:
- ~12 API calls per hour
- ~288 API calls per day

Well within all limits!

---

## Advanced: Multiple Calendars

To sync multiple Outlook calendars:

1. MeetingFly syncs the **default calendar** by default
2. To include other calendars, you would need to modify `src/main/calendar/microsoft-provider.ts`:
   ```typescript
   // Fetch specific calendar by ID
   const response = await fetch(
     `https://graph.microsoft.com/v1.0/me/calendars/CALENDAR_ID/calendarView?...`,
     { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
   )
   ```
3. Or list all calendars and loop through them:
   ```typescript
   // List all calendars
   const calendars = await fetch(
     'https://graph.microsoft.com/v1.0/me/calendars',
     { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
   )
   ```

(This feature may be added in a future release)

---

## Work/School Admin Approval

If you're using a work or school account and see "Need admin approval":

### Option 1: Request Admin Consent

1. Contact your IT administrator
2. Provide them with:
   - **App name**: MeetingFly
   - **Application ID**: (your client ID)
   - **Permissions needed**: `Calendars.Read` (read-only)
   - **Publisher**: (your name or organization)
3. Admin can grant consent from Azure Portal

### Option 2: Use Personal Account

- Connect a personal Outlook.com account instead
- This bypasses organizational policies

### Option 3: Self-Approval (if allowed)

Some organizations allow users to consent to certain apps:
1. Click "Accept" in the consent prompt
2. If successful, MeetingFly is authorized
3. If blocked, contact your admin

---

## Comparing with Google Calendar

| Feature | Google Calendar | Microsoft Calendar |
|---------|----------------|-------------------|
| **Authentication** | OAuth 2.0 + Client Secret | OAuth 2.0 + PKCE (no secret) |
| **Setup Complexity** | Moderate | Easier |
| **Account Types** | Personal Google accounts | Personal + work/school |
| **Permissions** | Read-only calendar events | Read-only calendars |
| **Token Storage** | Encrypted locally | Encrypted locally |
| **API Limits** | 1M requests/day | 2K requests/hour (personal) |
| **Polling Interval** | 5 minutes | 5 minutes |

---

## Questions?

- **MeetingFly Issues**: https://github.com/your-username/meetingfly/issues
- **Microsoft Graph Docs**: https://docs.microsoft.com/en-us/graph/api/resources/calendar
- **OAuth 2.0 + PKCE Guide**: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

---

**Previous**: [← Google Calendar Setup](GOOGLE_CALENDAR_SETUP.md)
