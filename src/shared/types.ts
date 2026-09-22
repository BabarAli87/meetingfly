export type SpriteName = 'airplane' | 'rocket' | 'bird' | 'ufo' | 'custom'
export type FlightPath = 'straight' | 'diagonal-down' | 'diagonal-up' | 'wavy' | 'random'

export interface AppSettings {
  sprite: SpriteName
  customSpritePath: string
  speed: number        // px/sec, 100–800
  size: number         // sprite height px, 50–250
  flightPath: FlightPath
  soundEnabled: boolean
  customSoundPath: string
  showMeetingLabel: boolean
  leadTimeMinutes: number
  launchAtLogin: boolean
  // Calendar
  googleCalendarEnabled: boolean
  googleClientId: string
  googleClientSecret: string
  microsoftCalendarEnabled: boolean
  microsoftClientId: string
  // Phase 4 — customization
  googleTintColor: string    // hex, e.g. '#4285F4'
  microsoftTintColor: string // hex, e.g. '#7B5EA7'
}

export const DEFAULT_SETTINGS: AppSettings = {
  sprite: 'airplane',
  customSpritePath: '',
  speed: 350,
  size: 100,
  flightPath: 'straight',
  soundEnabled: false,
  customSoundPath: '',
  showMeetingLabel: true,
  leadTimeMinutes: 10,
  launchAtLogin: false,
  googleCalendarEnabled: false,
  googleClientId: '',
  googleClientSecret: '',
  microsoftCalendarEnabled: false,
  microsoftClientId: '',
  googleTintColor: '#4285F4',
  microsoftTintColor: '#7B5EA7'
}

export interface FlyoverPayload {
  settings: AppSettings
  meetingTitle?: string
  calendarSource?: 'google' | 'microsoft'
}
