import { shell } from 'electron'
import { startRedirectServer, generateState, generatePkce } from './auth-server'
import { saveTokens, getTokens, clearTokens, hasTokens } from './token-store'
import { Meeting, OAuthTokens } from './calendar-types'

const MS_AUTH_BASE = 'https://login.microsoftonline.com/common/oauth2/v2.0'
const MS_GRAPH_BASE = 'https://graph.microsoft.com/v1.0'
// offline_access gives a refresh token; User.Read is required by some tenants
const MS_SCOPES = 'Calendars.Read offline_access User.Read'

export function isMicrosoftConnected(): boolean {
  return hasTokens('microsoft')
}

/**
 * Open browser for Microsoft OAuth using PKCE (no client secret required).
 * Register the app in Azure Portal as "Mobile and desktop application"
 * with redirect URI http://localhost — no client secret needed.
 */
export async function connectMicrosoft(clientId: string): Promise<void> {
  const { port, waitForCode } = await startRedirectServer()
  const redirectUri = `http://localhost:${port}/callback`
  const state = generateState()
  const { verifier, challenge } = generatePkce()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: MS_SCOPES,
    state,
    prompt: 'select_account',
    code_challenge: challenge,
    code_challenge_method: 'S256'
  })

  await shell.openExternal(`${MS_AUTH_BASE}/authorize?${params}`)

  const { code, state: returnedState } = await waitForCode

  if (returnedState !== state) {
    throw new Error('OAuth state mismatch — possible CSRF attack, please try again')
  }

  const tokens = await exchangeCode(code, clientId, redirectUri, verifier)
  saveTokens('microsoft', tokens)
}

export function disconnectMicrosoft(): void {
  clearTokens('microsoft')
}

async function exchangeCode(
  code: string,
  clientId: string,
  redirectUri: string,
  codeVerifier: string
): Promise<OAuthTokens> {
  const response = await fetch(`${MS_AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: MS_SCOPES,
      code_verifier: codeVerifier
    })
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Microsoft token exchange failed: ${body}`)
  }

  const data = (await response.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  }
}

async function refreshToken(clientId: string): Promise<OAuthTokens> {
  const stored = getTokens('microsoft')
  if (!stored) throw new Error('No stored Microsoft tokens to refresh')

  const response = await fetch(`${MS_AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: stored.refreshToken,
      client_id: clientId,
      scope: MS_SCOPES
    })
  })

  if (!response.ok) {
    clearTokens('microsoft')
    throw new Error('Microsoft token refresh failed — please reconnect')
  }

  const data = (await response.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  const updated: OAuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? stored.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000
  }
  saveTokens('microsoft', updated)
  return updated
}

async function getAccessToken(clientId: string): Promise<string> {
  let tokens = getTokens('microsoft')
  if (!tokens) throw new Error('Not connected to Microsoft Calendar')

  if (Date.now() >= tokens.expiresAt - 60_000) {
    tokens = await refreshToken(clientId)
  }

  return tokens.accessToken
}

export async function fetchMicrosoftMeetings(clientId: string): Promise<Meeting[]> {
  const accessToken = await getAccessToken(clientId)

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    startDateTime: now.toISOString(),
    endDateTime: tomorrow.toISOString(),
    $select: 'id,subject,start,end,isAllDay,isCancelled,responseStatus',
    $top: '50',
    $orderby: 'start/dateTime'
  })

  const response = await fetch(`${MS_GRAPH_BASE}/me/calendarView?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.timezone="UTC"'
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearTokens('microsoft')
      throw new Error('Microsoft Calendar token revoked — please reconnect')
    }
    throw new Error(`Microsoft Graph API error ${response.status}`)
  }

  const data = (await response.json()) as { value: MicrosoftEvent[] }
  return (data.value ?? []).map(toMeeting).filter((m): m is Meeting => m !== null)
}

// ─── Raw API types ────────────────────────────────────────────────────────────

interface MicrosoftEvent {
  id: string
  subject?: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  isAllDay?: boolean
  isCancelled?: boolean
  responseStatus?: { response?: string }
}

function toMeeting(event: MicrosoftEvent): Meeting | null {
  if (event.isCancelled) return null
  if (event.isAllDay) return null

  const response = event.responseStatus?.response ?? 'accepted'
  if (response === 'declined') return null

  const statusMap: Record<string, Meeting['status']> = {
    accepted: 'accepted',
    tentativelyAccepted: 'tentative',
    declined: 'declined',
    notResponded: 'needsAction',
    organizer: 'accepted'
  }

  // Graph returns UTC when Prefer header is set; append Z to parse as UTC
  const startStr = event.start.dateTime.endsWith('Z')
    ? event.start.dateTime
    : event.start.dateTime + 'Z'
  const endStr = event.end.dateTime.endsWith('Z')
    ? event.end.dateTime
    : event.end.dateTime + 'Z'

  return {
    id: `microsoft:${event.id}`,
    title: event.subject ?? 'Untitled Meeting',
    start: new Date(startStr),
    end: new Date(endStr),
    source: 'microsoft',
    isAllDay: false,
    status: statusMap[response] ?? 'unknown'
  }
}
