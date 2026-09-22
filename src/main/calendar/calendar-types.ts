export type CalendarSource = 'google' | 'microsoft'

export interface Meeting {
  id: string
  title: string
  start: Date
  end: Date
  source: CalendarSource
  isAllDay: boolean
  status: 'accepted' | 'tentative' | 'declined' | 'needsAction' | 'unknown'
}

export interface OAuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number // Date.now() + expires_in * 1000
}
