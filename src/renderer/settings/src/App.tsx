import { useState, useEffect, useRef } from 'react'
import { AppSettings, DEFAULT_SETTINGS, FlightPath, SpriteName } from '../../../shared/types'
import './App.css'

interface MeetingflyBridge {
  getSettings: () => Promise<AppSettings>
  saveSettings: (s: Partial<AppSettings>) => Promise<void>
  previewFlyover: (settings: AppSettings) => void
  readImageAsDataUrl: (path: string) => Promise<string | null>
  openUrl: (url: string) => void
  pickFile: (opts: {
    title: string
    filters: Array<{ name: string; extensions: string[] }>
  }) => Promise<string | null>
  calendar: {
    getStatus: () => Promise<{ google: boolean; microsoft: boolean }>
    connectGoogle: (clientId: string, clientSecret: string) => Promise<void>
    disconnectGoogle: () => Promise<void>
    connectMicrosoft: (clientId: string) => Promise<void>
    disconnectMicrosoft: () => Promise<void>
  }
}

declare global {
  interface Window {
    meetingfly: MeetingflyBridge
  }
  // eslint-disable-next-line no-var
  var meetingfly: MeetingflyBridge
}

const SPRITE_OPTIONS: { value: SpriteName; label: string; emoji: string }[] = [
  { value: 'airplane', label: 'Airplane', emoji: '✈️' },
  { value: 'rocket', label: 'Rocket', emoji: '🚀' },
  { value: 'bird', label: 'Bird', emoji: '🐦' },
  { value: 'ufo', label: 'UFO', emoji: '🛸' },
  { value: 'custom', label: 'Custom', emoji: '🖼️' }
]

const PATH_OPTIONS: { value: FlightPath; label: string }[] = [
  { value: 'straight', label: 'Straight across' },
  { value: 'diagonal-down', label: 'Diagonal ↘' },
  { value: 'diagonal-up', label: 'Diagonal ↗' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'random', label: 'Random bezier' }
]

const TABS = [
  { key: 'animation', label: 'Animation', icon: '🎨' },
  { key: 'sound', label: 'Sound & Timing', icon: '🔔' },
  { key: 'calendars', label: 'Calendars', icon: '📅' },
  { key: 'system', label: 'System', icon: '⚙️' }
] as const

type TabKey = (typeof TABS)[number]['key']

function sliderBackground(value: number, min: number, max: number): string {
  const pct = ((value - min) / (max - min)) * 100
  return `linear-gradient(90deg, #6d8dfc ${pct}%, rgba(255,255,255,0.12) ${pct}%)`
}

function previewPathPoint(path: FlightPath, W: number, H: number, t: number): { x: number; y: number } {
  const pad = 18
  const enter = pad
  const exit = W - pad
  switch (path) {
    case 'straight':
      return { x: enter + t * (exit - enter), y: H / 2 }
    case 'diagonal-down':
      return { x: enter + t * (exit - enter), y: H * 0.1 + t * H * 0.78 }
    case 'diagonal-up':
      return { x: enter + t * (exit - enter), y: H * 0.88 - t * H * 0.78 }
    case 'wavy': {
      const x = enter + t * (exit - enter)
      const y = H / 2 + H * 0.38 * Math.sin(t * 5 * Math.PI)
      return { x, y }
    }
    case 'random': {
      const mt = 1 - t
      const y =
        mt * mt * mt * (H / 2) +
        3 * mt * mt * t * (H * 0.1) +
        3 * mt * t * t * (H * 0.9) +
        t * t * t * (H / 2)
      return { x: enter + t * (exit - enter), y }
    }
  }
}

function PathPreview({ path }: Readonly<{ path: FlightPath }>): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.fillRect(0, 0, W, H)

    ctx.beginPath()
    ctx.strokeStyle = 'rgba(109,141,252,0.7)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 4])
    for (let i = 0; i <= 80; i++) {
      const p = previewPathPoint(path, W, H, i / 80)
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()

    const mid = previewPathPoint(path, W, H, 0.5)
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(mid.x, mid.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#6d8dfc'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }, [path])

  return <canvas ref={ref} width={520} height={56} className="path-canvas" />
}

function Switch({
  checked,
  onChange
}: Readonly<{ checked: boolean; onChange: (v: boolean) => void }>): JSX.Element {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      <span className="thumb" />
    </label>
  )
}

function swatchClass(hex: string, activeHex: string): string {
  return `swatch${hex.toLowerCase() === activeHex.toLowerCase() ? ' active' : ''}`
}

/** Duration (seconds) for the decorative stage animation — faster settings.speed = shorter loop. */
function stageDuration(speed: number): number {
  return Math.max(1, 6 - speed / 150)
}

function StagePreview({
  settings,
  spriteThumb
}: Readonly<{ settings: AppSettings; spriteThumb: string | null }>): JSX.Element {
  const emoji = SPRITE_OPTIONS.find((o) => o.value === settings.sprite)?.emoji ?? '✈️'
  const fontSize = Math.min(72, Math.max(22, settings.size * 0.42))
  const imgSize = Math.min(96, Math.max(28, settings.size * 0.5))
  const key = `${settings.sprite}-${settings.flightPath}-${settings.speed}-${settings.size}-${spriteThumb ?? ''}`
  const ropeWidth = Math.round(imgSize * 0.4)
  const bannerFontSize = Math.max(10, Math.round(imgSize * 0.24))

  return (
    <div className="stage">
      <span className="stage-tag">Live preview</span>
      <div
        key={key}
        className="stage-sprite"
        style={{
          left: 0,
          animationName: `fly-${settings.flightPath}`,
          animationDuration: `${stageDuration(settings.speed)}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite'
        }}
      >
        {settings.showMeetingLabel && (
          <div className="stage-banner-rig">
            <div className="stage-rope" style={{ width: ropeWidth }} />
            <div
              className="stage-banner"
              style={{
                fontSize: bannerFontSize,
                padding: `${Math.max(3, Math.round(imgSize * 0.06))}px ${Math.max(8, Math.round(imgSize * 0.18))}px`
              }}
            >
              Stand-up @ 2:00 PM
            </div>
          </div>
        )}
        {settings.sprite === 'custom' && spriteThumb ? (
          <img src={spriteThumb} width={imgSize} height={imgSize} alt="" />
        ) : (
          <span className="emoji" style={{ fontSize }}>
            {emoji}
          </span>
        )}
      </div>
    </div>
  )
}

export default function App(): JSX.Element {
  const [tab, setTab] = useState<TabKey>('animation')
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [spriteThumb, setSpriteThumb] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [calStatus, setCalStatus] = useState({ google: false, microsoft: false })
  const [calLoading, setCalLoading] = useState<'google' | 'microsoft' | null>(null)
  const [calError, setCalError] = useState<{ source: 'google' | 'microsoft'; message: string } | null>(null)

  useEffect(() => {
    globalThis.meetingfly.getSettings().then((loaded) => {
      setSettings(loaded)
      if (loaded.sprite === 'custom' && loaded.customSpritePath) {
        globalThis.meetingfly.readImageAsDataUrl(loaded.customSpritePath).then(setSpriteThumb)
      }
    })
    globalThis.meetingfly.calendar.getStatus().then(setCalStatus)
  }, [])

  function patch(update: Partial<AppSettings>): void {
    setSettings((prev) => ({ ...prev, ...update }))
  }

  async function handleSave(): Promise<void> {
    await globalThis.meetingfly.saveSettings(settings)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  function handlePreview(): void {
    globalThis.meetingfly.previewFlyover(settings)
    void globalThis.meetingfly.saveSettings(settings)
  }

  async function handlePickSprite(): Promise<void> {
    const path = await globalThis.meetingfly.pickFile({
      title: 'Choose sprite image',
      filters: [{ name: 'Images', extensions: ['png', 'gif', 'apng', 'webp'] }]
    })
    if (path) {
      patch({ customSpritePath: path })
      setSpriteThumb(await globalThis.meetingfly.readImageAsDataUrl(path))
    }
  }

  async function handlePickSound(): Promise<void> {
    const path = await globalThis.meetingfly.pickFile({
      title: 'Choose sound file',
      filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }]
    })
    if (path) patch({ customSoundPath: path })
  }

  async function handleGoogleConnect(): Promise<void> {
    setCalError(null)
    setCalLoading('google')
    try {
      await globalThis.meetingfly.calendar.connectGoogle(settings.googleClientId, settings.googleClientSecret)
      setCalStatus((prev) => ({ ...prev, google: true }))
      patch({ googleCalendarEnabled: true })
    } catch (err) {
      setCalError({ source: 'google', message: (err as Error).message })
    } finally {
      setCalLoading(null)
    }
  }

  async function handleGoogleDisconnect(): Promise<void> {
    await globalThis.meetingfly.calendar.disconnectGoogle()
    setCalStatus((prev) => ({ ...prev, google: false }))
    patch({ googleCalendarEnabled: false })
  }

  async function handleMicrosoftConnect(): Promise<void> {
    setCalError(null)
    setCalLoading('microsoft')
    try {
      await globalThis.meetingfly.calendar.connectMicrosoft(settings.microsoftClientId)
      setCalStatus((prev) => ({ ...prev, microsoft: true }))
      patch({ microsoftCalendarEnabled: true })
    } catch (err) {
      setCalError({ source: 'microsoft', message: (err as Error).message })
    } finally {
      setCalLoading(null)
    }
  }

  async function handleMicrosoftDisconnect(): Promise<void> {
    await globalThis.meetingfly.calendar.disconnectMicrosoft()
    setCalStatus((prev) => ({ ...prev, microsoft: false }))
    patch({ microsoftCalendarEnabled: false })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">✈️</div>
          <div className="brand-text">
            <h1>MeetingFly</h1>
            <span>Settings</span>
          </div>
        </div>

        <nav className="nav">
          {TABS.map((t) => (
            <div
              key={t.key}
              className={`nav-item${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </div>
          ))}
        </nav>

        <div className="nav-spacer" />
        <div className="sidebar-footer">MeetingFly v0.1.0</div>
      </aside>

      <div className="main">
        <div className="main-header">
          <h2>{TABS.find((t) => t.key === tab)?.label}</h2>
          <p>Your friendly pre-meeting notification system</p>
        </div>

        <div className="main-scroll">
          <div className="content-col">
          {tab === 'animation' && (
            <>
              <StagePreview settings={settings} spriteThumb={spriteThumb} />

              <div className="card">
                <div className="card-head">
                  <span className="card-title">Sprite</span>
                </div>
                <div className="tile-grid">
                  {SPRITE_OPTIONS.map((o) => (
                    <div
                      key={o.value}
                      className={`tile${settings.sprite === o.value ? ' active' : ''}`}
                      onClick={() => patch({ sprite: o.value })}
                    >
                      <span className="tile-emoji">{o.emoji}</span>
                      <span className="tile-label">{o.label}</span>
                    </div>
                  ))}
                </div>
                {settings.sprite === 'custom' && (
                  <div className="file-row" style={{ marginTop: 12 }}>
                    <input
                      className="text-input"
                      placeholder="Path to PNG / GIF / APNG"
                      value={settings.customSpritePath}
                      readOnly
                    />
                    <button className="btn-file" onClick={handlePickSprite}>
                      Browse…
                    </button>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-head">
                  <span className="card-title">Flight path</span>
                </div>
                <div className="pill-row">
                  {PATH_OPTIONS.map((o) => (
                    <div
                      key={o.value}
                      className={`pill${settings.flightPath === o.value ? ' active' : ''}`}
                      onClick={() => patch({ flightPath: o.value })}
                    >
                      {o.label}
                    </div>
                  ))}
                </div>
                <PathPreview path={settings.flightPath} />
              </div>

              <div className="card">
                <div className="card-head">
                  <span className="card-title">Motion</span>
                </div>
                <div className="field">
                  <label className="field-label">Speed — {settings.speed} px/sec</label>
                  <div className="slider-row">
                    <span className="slider-edge">Slow</span>
                    <input
                      type="range"
                      min={80}
                      max={800}
                      step={20}
                      value={settings.speed}
                      style={{ background: sliderBackground(settings.speed, 80, 800) }}
                      onChange={(e) => patch({ speed: Number(e.target.value) })}
                    />
                    <span className="slider-edge right">Fast</span>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Size — {settings.size} px tall</label>
                  <div className="slider-row">
                    <span className="slider-edge">S</span>
                    <input
                      type="range"
                      min={40}
                      max={240}
                      step={10}
                      value={settings.size}
                      style={{ background: sliderBackground(settings.size, 40, 240) }}
                      onChange={(e) => patch({ size: Number(e.target.value) })}
                    />
                    <span className="slider-edge right">XL</span>
                  </div>
                </div>
                <div className="toggle-row">
                  <span className="toggle-text">Show meeting title on banner</span>
                  <Switch
                    checked={settings.showMeetingLabel}
                    onChange={(v) => patch({ showMeetingLabel: v })}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <span className="card-title">Color tint by calendar source</span>
                </div>
                <div className="tint-row">
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Google</span>
                  <div className="swatches">
                    {['#4285F4', '#34A853', '#EA4335', '#FBBC05', '#00ACC1'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={swatchClass(c, settings.googleTintColor)}
                        style={{ background: c }}
                        onClick={() => patch({ googleTintColor: c })}
                      />
                    ))}
                    <input
                      type="color"
                      className="color-picker"
                      value={settings.googleTintColor}
                      onChange={(e) => patch({ googleTintColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="tint-row" style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Microsoft</span>
                  <div className="swatches">
                    {['#7B5EA7', '#0078D4', '#00B294', '#E74C3C', '#FF8C00'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={swatchClass(c, settings.microsoftTintColor)}
                        style={{ background: c }}
                        onClick={() => patch({ microsoftTintColor: c })}
                      />
                    ))}
                    <input
                      type="color"
                      className="color-picker"
                      value={settings.microsoftTintColor}
                      onChange={(e) => patch({ microsoftTintColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'sound' && (
            <>
              <div className="card">
                <div className="card-head">
                  <span className="card-title">Sound</span>
                </div>
                <div className="toggle-row">
                  <span className="toggle-text">Play sound on flyover</span>
                  <Switch checked={settings.soundEnabled} onChange={(v) => patch({ soundEnabled: v })} />
                </div>
                {settings.soundEnabled && (
                  <div className="file-row" style={{ marginTop: 12 }}>
                    <input
                      className="text-input"
                      placeholder="Custom sound (MP3/WAV) — leave blank for beep"
                      value={settings.customSoundPath}
                      readOnly
                    />
                    <button className="btn-file" onClick={handlePickSound}>
                      Browse…
                    </button>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-head">
                  <span className="card-title">Alert timing</span>
                </div>
                <div className="field">
                  <label className="field-label">
                    Fly over screen — {settings.leadTimeMinutes} min before meeting
                  </label>
                  <div className="slider-row">
                    <span className="slider-edge">2m</span>
                    <input
                      type="range"
                      min={2}
                      max={30}
                      step={1}
                      value={settings.leadTimeMinutes}
                      style={{ background: sliderBackground(settings.leadTimeMinutes, 2, 30) }}
                      onChange={(e) => patch({ leadTimeMinutes: Number(e.target.value) })}
                    />
                    <span className="slider-edge right">30m</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'system' && (
            <div className="card">
              <div className="card-head">
                <span className="card-title">System</span>
              </div>
              <div className="toggle-row">
                <div>
                  <div className="toggle-text">Launch at login</div>
                  <div className="toggle-desc">Start MeetingFly automatically when you log in</div>
                </div>
                <Switch checked={settings.launchAtLogin} onChange={(v) => patch({ launchAtLogin: v })} />
              </div>
            </div>
          )}

          {tab === 'calendars' && (
            <div className="card">
              <div className="card-head">
                <span className="card-title">Calendars</span>
              </div>

              <div>
                <div className="provider-row">
                  <span className="provider-name">📆 Google Calendar</span>
                  <span className={`badge ${calStatus.google ? 'badge-on' : 'badge-off'}`}>
                    {calStatus.google ? '● Connected' : '○ Not connected'}
                  </span>
                </div>

                {!calStatus.google && (
                  <>
                    <input
                      className="text-input"
                      style={{ marginBottom: 8 }}
                      placeholder="Client ID (from Google Cloud Console)"
                      value={settings.googleClientId}
                      onChange={(e) => patch({ googleClientId: e.target.value })}
                    />
                    <input
                      className="text-input"
                      type="password"
                      placeholder="Client Secret"
                      value={settings.googleClientSecret}
                      onChange={(e) => patch({ googleClientSecret: e.target.value })}
                    />
                    <p className="field-hint">
                      Create an OAuth 2.0 “Desktop app” client at{' '}
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() =>
                          globalThis.meetingfly.openUrl('https://console.cloud.google.com/apis/credentials')
                        }
                      >
                        Google Cloud Console
                      </button>
                      {', '}
                      enable the Google Calendar API, then paste the credentials above.
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <button
                        className="btn btn-connect"
                        onClick={handleGoogleConnect}
                        disabled={
                          !settings.googleClientId || !settings.googleClientSecret || calLoading === 'google'
                        }
                      >
                        {calLoading === 'google' ? 'Opening browser…' : 'Connect Google'}
                      </button>
                    </div>
                  </>
                )}

                {calStatus.google && (
                  <>
                    <div className="toggle-row" style={{ margin: '8px 0 12px' }}>
                      <span className="toggle-text">Enable flyover alerts</span>
                      <Switch
                        checked={settings.googleCalendarEnabled}
                        onChange={(v) => patch({ googleCalendarEnabled: v })}
                      />
                    </div>
                    <button className="btn btn-disconnect" onClick={handleGoogleDisconnect}>
                      Disconnect
                    </button>
                  </>
                )}

                {calError?.source === 'google' && <p className="error-text">{calError.message}</p>}
              </div>

              <div className="divider" />

              <div>
                <div className="provider-row">
                  <span className="provider-name">🗓️ Microsoft Outlook / Teams</span>
                  <span className={`badge ${calStatus.microsoft ? 'badge-on' : 'badge-off'}`}>
                    {calStatus.microsoft ? '● Connected' : '○ Not connected'}
                  </span>
                </div>

                {!calStatus.microsoft && (
                  <>
                    <input
                      className="text-input"
                      placeholder="Application (Client) ID — from Azure Portal"
                      value={settings.microsoftClientId}
                      onChange={(e) => patch({ microsoftClientId: e.target.value })}
                    />
                    <p className="field-hint">
                      Register an app in{' '}
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() =>
                          globalThis.meetingfly.openUrl(
                            'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps'
                          )
                        }
                      >
                        Azure Portal
                      </button>
                      {'. '}
                      Add a “Mobile and desktop application” platform. Grant{' '}
                      <code className="code-chip">Calendars.Read</code> under Microsoft Graph. No client
                      secret needed.
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <button
                        className="btn btn-connect"
                        onClick={handleMicrosoftConnect}
                        disabled={!settings.microsoftClientId || calLoading === 'microsoft'}
                      >
                        {calLoading === 'microsoft' ? 'Opening browser…' : 'Connect Microsoft'}
                      </button>
                    </div>
                  </>
                )}

                {calStatus.microsoft && (
                  <>
                    <div className="toggle-row" style={{ margin: '8px 0 12px' }}>
                      <span className="toggle-text">Enable flyover alerts</span>
                      <Switch
                        checked={settings.microsoftCalendarEnabled}
                        onChange={(v) => patch({ microsoftCalendarEnabled: v })}
                      />
                    </div>
                    <button className="btn btn-disconnect" onClick={handleMicrosoftDisconnect}>
                      Disconnect
                    </button>
                  </>
                )}

                {calError?.source === 'microsoft' && <p className="error-text">{calError.message}</p>}
              </div>
            </div>
          )}
          </div>
        </div>

        <div className="footer">
          <button className="btn btn-ghost" onClick={handlePreview}>
            Preview ✈️
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save{savedFlash && <span className="saved-pill">✓ Saved</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
