import { safeStorage } from 'electron'
import ElectronStore from 'electron-store'
import { OAuthTokens } from './calendar-types'

interface TokenStoreSchema {
  google?: string
  microsoft?: string
}

const store = new ElectronStore<TokenStoreSchema>({ name: 'tokens' })

function encrypt(text: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('[TokenStore] OS encryption unavailable — tokens stored as plaintext')
    return text
  }
  return safeStorage.encryptString(text).toString('base64')
}

function decrypt(value: string): string {
  if (!safeStorage.isEncryptionAvailable()) return value
  try {
    return safeStorage.decryptString(Buffer.from(value, 'base64'))
  } catch {
    // Token was stored before encryption was available
    return value
  }
}

export function saveTokens(source: 'google' | 'microsoft', tokens: OAuthTokens): void {
  store.set(source, encrypt(JSON.stringify(tokens)))
}

export function getTokens(source: 'google' | 'microsoft'): OAuthTokens | null {
  const raw = store.get(source)
  if (!raw) return null
  try {
    return JSON.parse(decrypt(raw)) as OAuthTokens
  } catch {
    return null
  }
}

export function clearTokens(source: 'google' | 'microsoft'): void {
  store.delete(source)
}

export function hasTokens(source: 'google' | 'microsoft'): boolean {
  return store.has(source)
}
