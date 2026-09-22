import { app } from 'electron'
import AutoLaunch from 'auto-launch'

let autoLauncher: AutoLaunch | null = null

/**
 * Initialize auto-launch manager
 * Call this once at app startup
 */
export function initAutoLaunchManager(): void {
  const appPath = app.getPath('exe')
  
  autoLauncher = new AutoLaunch({
    name: 'MeetingFly',
    path: appPath,
    isHidden: true // Don't show window on login
  })
}

/**
 * Enable app to launch at login
 */
export async function enableAutoLaunch(): Promise<void> {
  if (!autoLauncher) initAutoLaunchManager()
  
  try {
    const isEnabled = await autoLauncher!.isEnabled()
    if (!isEnabled) {
      await autoLauncher!.enable()
      console.log('[AutoLaunch] Enabled')
    }
  } catch (err) {
    console.error('[AutoLaunch] Failed to enable:', err)
  }
}

/**
 * Disable app from launching at login
 */
export async function disableAutoLaunch(): Promise<void> {
  if (!autoLauncher) initAutoLaunchManager()
  
  try {
    const isEnabled = await autoLauncher!.isEnabled()
    if (isEnabled) {
      await autoLauncher!.disable()
      console.log('[AutoLaunch] Disabled')
    }
  } catch (err) {
    console.error('[AutoLaunch] Failed to disable:', err)
  }
}

/**
 * Check if auto-launch is currently enabled
 */
export async function isAutoLaunchEnabled(): Promise<boolean> {
  if (!autoLauncher) initAutoLaunchManager()
  
  try {
    return await autoLauncher!.isEnabled()
  } catch (err) {
    console.error('[AutoLaunch] Failed to check status:', err)
    return false
  }
}
