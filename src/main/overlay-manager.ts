import { BrowserWindow, screen } from 'electron'
import { join, extname } from 'node:path'
import { readFile } from 'node:fs/promises'
import { is } from '@electron-toolkit/utils'
import { FlyoverPayload } from '../shared/types'

const SPRITE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
}

const SOUND_MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4'
}

async function resolveAsDataUrl(path: string, mimeTypes: Record<string, string>, fallbackMime: string): Promise<string | null> {
  try {
    const buf = await readFile(path)
    const mime = mimeTypes[extname(path).toLowerCase()] ?? fallbackMime
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch (err) {
    console.error('[Overlay] Failed to load local file as data URL:', path, err)
    return null
  }
}

export function resolveCustomSprite(path: string): Promise<string | null> {
  return resolveAsDataUrl(path, SPRITE_MIME_TYPES, 'image/png')
}

export function resolveCustomSound(path: string): Promise<string | null> {
  return resolveAsDataUrl(path, SOUND_MIME_TYPES, 'audio/mpeg')
}

let overlayWindow: BrowserWindow | null = null

export function createOverlayWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    resizable: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/overlay.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  overlayWindow.setIgnoreMouseEvents(true)
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/overlay/index.html`)
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/overlay/index.html'))
  }

  return overlayWindow
}

export async function triggerFlyover(payload: FlyoverPayload): Promise<void> {
  if (!overlayWindow) return

  let settings = payload.settings

  if (settings.sprite === 'custom' && settings.customSpritePath) {
    const dataUrl = await resolveCustomSprite(settings.customSpritePath)
    if (dataUrl) settings = { ...settings, customSpritePath: dataUrl }
  }

  if (settings.soundEnabled && settings.customSoundPath) {
    const dataUrl = await resolveCustomSound(settings.customSoundPath)
    if (dataUrl) settings = { ...settings, customSoundPath: dataUrl }
  }

  const resolvedPayload = { ...payload, settings }

  overlayWindow.show()
  overlayWindow.webContents.send('flyover:play', resolvedPayload)
}

export function hideOverlay(): void {
  overlayWindow?.hide()
}

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow
}
