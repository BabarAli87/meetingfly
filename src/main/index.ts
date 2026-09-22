import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import { createOverlayWindow, triggerFlyover, hideOverlay, resolveCustomSprite } from './overlay-manager'
import { createTray } from './tray-manager'
import { getSettings, saveSettings } from './settings-store'
import { initAutoLaunchManager, enableAutoLaunch, disableAutoLaunch } from './auto-launch-manager'
import { initAutoUpdater } from './auto-updater'
import { startCalendarPoller, stopCalendarPoller, rescheduleAll } from './calendar/calendar-manager'
import { isGoogleConnected, connectGoogle, disconnectGoogle } from './calendar/google-provider'
import { isMicrosoftConnected, connectMicrosoft, disconnectMicrosoft } from './calendar/microsoft-provider'
import { AppSettings } from '../shared/types'

app.setName('MeetingFly')
// Keep app running when all windows are closed (tray-only mode)
app.on('window-all-closed', (e: Event) => e.preventDefault())

let settingsWindow: BrowserWindow | null = null

function createSettingsWindow(): BrowserWindow {
  settingsWindow = new BrowserWindow({
    width: 880,
    height: 720,
    minWidth: 720,
    minHeight: 520,
    title: 'MeetingFly — Settings',
    backgroundColor: '#12121f',
    resizable: true,
    maximizable: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  settingsWindow.on('close', (e) => {
    e.preventDefault()
    settingsWindow?.hide()
  })

  settingsWindow.on('ready-to-show', () => settingsWindow?.show())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    settingsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/settings/index.html`)
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/settings/index.html'))
  }

  return settingsWindow
}

function showSettings(): void {
  if (!settingsWindow || settingsWindow.isDestroyed()) {
    createSettingsWindow()
  } else if (settingsWindow.isVisible()) {
    settingsWindow.focus()
  } else {
    settingsWindow.show()
  }
}

function runPreview(settings?: AppSettings): void {
  void triggerFlyover({ settings: settings ?? getSettings(), meetingTitle: 'Stand-up @ 2:00 PM' })
}

// IPC handlers
ipcMain.handle('settings:get', () => getSettings())

ipcMain.handle('settings:save', async (_event, settings: Partial<AppSettings>) => {
  saveSettings(settings)

  if ('launchAtLogin' in settings) {
    if (settings.launchAtLogin) await enableAutoLaunch()
    else await disableAutoLaunch()
  }

  // Re-schedule calendar triggers when relevant settings change
  const calFields: (keyof AppSettings)[] = [
    'googleCalendarEnabled',
    'microsoftCalendarEnabled',
    'leadTimeMinutes'
  ]
  if (calFields.some((f) => f in settings)) {
    rescheduleAll()
  }
})

ipcMain.handle('calendar:status', () => ({
  google: isGoogleConnected(),
  microsoft: isMicrosoftConnected()
}))

ipcMain.handle(
  'calendar:google:connect',
  async (_event, { clientId, clientSecret }: { clientId: string; clientSecret: string }) => {
    await connectGoogle(clientId, clientSecret)
    saveSettings({ googleClientId: clientId, googleClientSecret: clientSecret })
    rescheduleAll()
  }
)

ipcMain.handle('calendar:google:disconnect', () => {
  disconnectGoogle()
  saveSettings({ googleCalendarEnabled: false })
})

ipcMain.handle(
  'calendar:microsoft:connect',
  async (_event, { clientId }: { clientId: string }) => {
    await connectMicrosoft(clientId)
    saveSettings({ microsoftClientId: clientId })
    rescheduleAll()
  }
)

ipcMain.handle('calendar:microsoft:disconnect', () => {
  disconnectMicrosoft()
  saveSettings({ microsoftCalendarEnabled: false })
})

// Allow renderer to open links in the default browser (https only)
ipcMain.on('shell:openExternal', (_event, url: unknown) => {
  if (typeof url === 'string' && url.startsWith('https://')) {
    shell.openExternal(url)
  }
})

ipcMain.handle('files:toDataUrl', (_event, path: string) => resolveCustomSprite(path))

ipcMain.handle(
  'dialog:pickFile',
  async (_event, opts: { title: string; filters: Electron.FileFilter[] }) => {
    const result = await dialog.showOpenDialog(settingsWindow!, {
      title: opts.title,
      filters: opts.filters,
      properties: ['openFile']
    })
    return result.canceled ? null : (result.filePaths[0] ?? null)
  }
)

ipcMain.on('flyover:preview', (_event, settings?: AppSettings) => runPreview(settings))

ipcMain.on('flyover:complete', () => hideOverlay())

app.on('before-quit', () => stopCalendarPoller())

app.whenReady().then(async () => {
  initAutoLaunchManager()
  initAutoUpdater()

  const settings = getSettings()
  if (settings.launchAtLogin) await enableAutoLaunch()

  if (process.platform === 'darwin') app.dock?.hide()

  createOverlayWindow()
  createTray(showSettings, runPreview)
  startCalendarPoller()

  // Auto-open settings on first launch in dev
  if (is.dev) showSettings()
})
