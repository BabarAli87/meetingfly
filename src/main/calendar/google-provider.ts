import { shell } from 'electron'
import { startRedirectServer, generateState } from './auth-server'
import { saveTokens, getTokens, clearTokens, hasTokens } from './token-store'
import { Meeting, OAuthTokens } from './calendar-types'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

export function isGoogleConnected(): boolean {
  return hasTokens('google')
}

/**
 * Open the browser for Google OAuth consent and exchange the code for tokens.
 * Credentials are stored encrypted via safeStorage.
 */
export async function connectGoogle(clientId: string, clientSecret: string): Promise<void> {
  const { port, waitForCode } = await startRedirectServer()
  const redirectUri = `http://localhost:${port}/callback`
  const state = generateState()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent', // Force refresh_token to be issued every time
    state
  })

  await shell.openExternal(`${GOOGLE_AUTH_URL}?${params}`)

  const { code, state: returnedState } = await waitForCode

  if (returnedState !== state) {
    throw new Error('OAuth state mismatch — possible CSRF attack, please try again')
  }

  const tokens = await exchangeCode(code, clientId, clientSecret, redirectUri)
  saveTokens('google', tokens)
}

export function disconnectGoogle(): void {
  clearTokens('google')
}

async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuthTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Google token exchange failed: ${body}`)
  }

  const data = (await response.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  if (!data.refresh_token) {
    throw new Error(
      'Google did not return a refresh token. Revoke app access at https://myaccount.google.com/permissions and try again.'
    )
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  }
}

async function refreshToken(clientId: string, clientSecret: string): Promise<OAuthTokens> {
  const stored = getTokens('google')
  if (!stored) throw new Error('No stored Google tokens to refresh')

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: stored.refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    })
  })

  if (!response.ok) {
    clearTokens('google')
    throw new Error('Google token refresh failed — please reconnect')
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
    refresh_token?: string
  }

  const updated: OAuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? stored.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000
  }
  saveTokens('google', updated)
  return updated
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  let tokens = getTokens('google')
  if (!tokens) throw new Error('Not connected to Google Calendar')

  if (Date.now() >= tokens.expiresAt - 60_000) {
    tokens = await refreshToken(clientId, clientSecret)
  }

  return tokens.accessToken
}

export async function fetchGoogleMeetings(
  clientId: string,
  clientSecret: string
): Promise<Meeting[]> {
  const accessToken = await getAccessToken(clientId, clientSecret)

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50'
  })

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    if (response.status === 401) {
      clearTokens('google')
      throw new Error('Google Calendar token revoked — please reconnect')
    }
    throw new Error(`Google Calendar API error ${response.status}`)
  }

  const data = (await response.json()) as { items: GoogleEvent[] }
  return (data.items ?? []).map(toMeeting).filter((m): m is Meeting => m !== null)
}

// ─── Raw API types ────────────────────────────────────────────────────────────

interface GoogleEvent {
  id: string
  summary?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  status?: 'confirmed' | 'tentative' | 'cancelled'
  attendees?: Array<{ self?: boolean; responseStatus?: string }>
}

function toMeeting(event: GoogleEvent): Meeting | null {
  if (event.status === 'cancelled') return null
  if (!event.start.dateTime) return null // all-day

  const selfAttendee = event.attendees?.find((a) => a.self)
  const responseStatus = selfAttendee?.responseStatus ?? 'accepted'
  if (responseStatus === 'declined') return null

  const statusMap: Record<string, Meeting['status']> = {
    accepted: 'accepted',
    tentative: 'tentative',
    declined: 'declined',
    needsAction: 'needsAction'
  }

  return {
    id: `google:${event.id}`,
    title: event.summary ?? 'Untitled Meeting',
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime ?? event.start.dateTime),
    source: 'google',
    isAllDay: false,
    status: statusMap[responseStatus] ?? 'unknown'
  }
}
