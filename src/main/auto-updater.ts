import { autoUpdater } from 'electron-updater'
import { app, dialog, shell } from 'electron'
import log from 'electron-log'

// Configure logging
log.transports.file.level = 'info'
autoUpdater.logger = log

// Track update state
let updateAvailable = false
let updateDownloaded = false
let latestVersion = ''

type UpdateCallback = (available: boolean, version: string) => void

let updateCheckCallbacks: UpdateCallback[] = []

/**
 * Initialize auto-updater with configuration
 */
export function initAutoUpdater(): void {
  // Don't check for updates in development
  if (!app.isPackaged) {
    log.info('Auto-update disabled in development mode')
    return
  }

  // Configure auto-updater
  autoUpdater.autoDownload = false // Manual download prompt
  autoUpdater.autoInstallOnAppQuit = true

  // Event: Update available
  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info.version)
    updateAvailable = true
    latestVersion = info.version
    notifyUpdateAvailable()
  })

  // Event: Update not available
  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available. Current version:', info.version)
    updateAvailable = false
    latestVersion = app.getVersion()
  })

  // Event: Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info.version)
    updateDownloaded = true
    promptInstallUpdate()
  })

  // Event: Download progress
  autoUpdater.on('download-progress', (progress) => {
    log.info(
      `Download progress: ${Math.round(progress.percent)}% (${progress.transferred}/${progress.total})`
    )
  })

  // Event: Error
  autoUpdater.on('error', (err) => {
    log.error('Auto-updater error:', err)
    updateAvailable = false
  })

  // Check for updates on startup (after 10 seconds)
  setTimeout(() => {
    checkForUpdates()
  }, 10000)

  // Check for updates every 6 hours
  setInterval(
    () => {
      checkForUpdates()
    },
    6 * 60 * 60 * 1000
  )
}

/**
 * Manually check for updates
 */
export async function checkForUpdates(): Promise<void> {
  if (!app.isPackaged) {
    log.info('Skipping update check in development')
    return
  }

  try {
    log.info('Checking for updates...')
    await autoUpdater.checkForUpdates()
  } catch (err) {
    log.error('Failed to check for updates:', err)
  }
}

/**
 * Check if an update is available
 */
export function isUpdateAvailable(): boolean {
  return updateAvailable
}

/**
 * Get the latest version string
 */
export function getLatestVersion(): string {
  return latestVersion || app.getVersion()
}

/**
 * Download the available update
 */
export async function downloadUpdate(): Promise<void> {
  if (!updateAvailable) {
    log.warn('No update available to download')
    return
  }

  try {
    log.info('Downloading update...')
    await autoUpdater.downloadUpdate()
  } catch (err) {
    log.error('Failed to download update:', err)
    dialog.showErrorBox('Update Failed', 'Failed to download the update. Please try again later.')
  }
}

/**
 * Quit and install the downloaded update
 */
export function quitAndInstall(): void {
  if (!updateDownloaded) {
    log.warn('No update downloaded to install')
    return
  }

  log.info('Quitting and installing update...')
  autoUpdater.quitAndInstall(false, true)
}

/**
 * Register a callback to be notified when an update is available
 */
export function onUpdateAvailable(callback: UpdateCallback): void {
  updateCheckCallbacks.push(callback)
}

/**
 * Notify all registered callbacks about update availability
 */
function notifyUpdateAvailable(): void {
  for (const callback of updateCheckCallbacks) {
    callback(updateAvailable, latestVersion)
  }
}

/**
 * Show dialog when update is available (called by tray or menu)
 */
export function promptDownloadUpdate(): void {
  if (!updateAvailable) {
    dialog.showMessageBox({
      type: 'info',
      title: 'No Updates Available',
      message: 'You are already running the latest version of MeetingFly.',
      buttons: ['OK']
    })
    return
  }

  const result = dialog.showMessageBoxSync({
    type: 'info',
    title: 'Update Available',
    message: `A new version of MeetingFly (v${latestVersion}) is available.`,
    detail: 'Would you like to download and install it now?',
    buttons: ['Download & Install', 'View Release Notes', 'Later'],
    defaultId: 0,
    cancelId: 2
  })

  if (result === 0) {
    // Download & Install
    downloadUpdate()
  } else if (result === 1) {
    // View Release Notes
    const repoUrl = 'https://github.com/your-username/meetingfly'
    shell.openExternal(`${repoUrl}/releases/tag/v${latestVersion}`)
  }
}

/**
 * Show dialog when update has been downloaded
 */
function promptInstallUpdate(): void {
  const result = dialog.showMessageBoxSync({
    type: 'info',
    title: 'Update Ready',
    message: `MeetingFly v${latestVersion} has been downloaded.`,
    detail: 'The update will be installed when you quit the app. Would you like to restart now?',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0,
    cancelId: 1
  })

  if (result === 0) {
    quitAndInstall()
  }
}
