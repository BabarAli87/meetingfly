import { app, Menu, Tray, nativeImage } from 'electron'
import { join } from 'node:path'
import {
  isUpdateAvailable,
  getLatestVersion,
  promptDownloadUpdate,
  checkForUpdates,
  onUpdateAvailable
} from './auto-updater'

let tray: Tray | null = null

export function createTray(
  onOpenSettings: () => void,
  onPreview: () => void
): Tray {
  // Load icon — falls back to a blank image in dev if icon file missing
  let icon: Electron.NativeImage
  try {
    icon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))
    if (icon.isEmpty()) throw new Error('empty')
  } catch {
    icon = nativeImage.createEmpty()
  }

  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('MeetingFly')

  updateTrayMenu(onOpenSettings, onPreview)
  tray.on('double-click', onOpenSettings)

  // Listen for update availability changes
  onUpdateAvailable(() => {
    updateTrayMenu(onOpenSettings, onPreview)
  })

  return tray
}

/**
 * Update the tray menu dynamically
 */
function updateTrayMenu(onOpenSettings: () => void, onPreview: () => void): void {
  if (!tray) return

  const hasUpdate = isUpdateAvailable()
  const version = getLatestVersion()

  const menu = Menu.buildFromTemplate([
    { label: 'Settings', click: onOpenSettings },
    { label: 'Preview Flyover', click: onPreview },
    { type: 'separator' },
    {
      label: hasUpdate ? `⬆️ Update Available (v${version})` : 'Check for Updates',
      click: async () => {
        if (hasUpdate) {
          promptDownloadUpdate()
        } else {
          await checkForUpdates()
          // Show result after check
          setTimeout(() => {
            if (!isUpdateAvailable()) {
              // No update found, menu will show this after refresh
              updateTrayMenu(onOpenSettings, onPreview)
            }
          }, 2000)
        }
      }
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])

  tray.setContextMenu(menu)
}
