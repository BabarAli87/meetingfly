import ElectronStore from 'electron-store'
import { AppSettings, DEFAULT_SETTINGS } from '../shared/types'

const store = new ElectronStore<AppSettings>({
  defaults: DEFAULT_SETTINGS
})

export function getSettings(): AppSettings {
  return {
    sprite: store.get('sprite'),
    customSpritePath: store.get('customSpritePath'),
    speed: store.get('speed'),
    size: store.get('size'),
    flightPath: store.get('flightPath'),
    soundEnabled: store.get('soundEnabled'),
    customSoundPath: store.get('customSoundPath'),
    showMeetingLabel: store.get('showMeetingLabel'),
    leadTimeMinutes: store.get('leadTimeMinutes'),
    launchAtLogin: store.get('launchAtLogin'),
    googleCalendarEnabled: store.get('googleCalendarEnabled'),
    googleClientId: store.get('googleClientId'),
    googleClientSecret: store.get('googleClientSecret'),
    microsoftCalendarEnabled: store.get('microsoftCalendarEnabled'),
    microsoftClientId: store.get('microsoftClientId'),
    googleTintColor: store.get('googleTintColor'),
    microsoftTintColor: store.get('microsoftTintColor')
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  for (const [key, value] of Object.entries(settings)) {
    store.set(key, value)
  }
}
