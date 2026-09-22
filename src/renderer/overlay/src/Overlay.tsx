import { useEffect, useRef } from 'react'
import { FlyoverPayload } from '../../../shared/types'
import { resolveSpriteSrc } from './sprites'
import { createPathFn, playBeep } from './animation'

interface OverlayBridge {
  onFlyover: (cb: (payload: FlyoverPayload) => void) => void
  notifyComplete: () => void
}

declare global {
  interface Window {
    overlay: OverlayBridge
  }
  // eslint-disable-next-line no-var
  var overlay: OverlayBridge
}

function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Keeps the keyframes in the page once — animates the banner's free (left) edge more than its towed (right) edge. */
const BANNER_STYLE = `
@keyframes fm-banner-wave {
  0%   { clip-path: polygon(0% 12%, 100% 0%, 100% 100%, 0% 88%); }
  25%  { clip-path: polygon(0% 0%, 100% 8%, 100% 92%, 0% 100%); }
  50%  { clip-path: polygon(0% 15%, 100% 3%, 100% 97%, 0% 85%); }
  75%  { clip-path: polygon(0% 2%, 100% 14%, 100% 86%, 0% 98%); }
  100% { clip-path: polygon(0% 12%, 100% 0%, 100% 100%, 0% 88%); }
}
@keyframes fm-banner-tilt {
  0%, 100% { transform: skewY(-2.5deg); }
  50% { transform: skewY(2.5deg); }
}
.fm-banner {
  animation: fm-banner-wave 1.6s ease-in-out infinite, fm-banner-tilt 1.6s ease-in-out infinite;
  transform-origin: right center;
}
`

export default function Overlay(): JSX.Element {
  const posRef = useRef<HTMLDivElement>(null)
  const rotateRef = useRef<HTMLDivElement>(null)
  const spriteRef = useRef<HTMLImageElement>(null)
  const tintRef = useRef<HTMLDivElement>(null)
  const bannerRigRef = useRef<HTMLDivElement>(null)
  const ropeRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const bannerTextRef = useRef<HTMLSpanElement>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    globalThis.overlay.onFlyover(async (payload) => {
      cancelAnimationFrame(animFrameRef.current)

      const { settings, meetingTitle, calendarSource } = payload
      const sw = window.innerWidth
      const sh = window.innerHeight

      const src = resolveSpriteSrc(settings.sprite, settings.customSpritePath)
      const naturalSize = await loadImage(src)
      const aspect = naturalSize.naturalWidth / Math.max(naturalSize.naturalHeight, 1)
      const h = settings.size
      const w = settings.size * aspect

      const spriteEl = spriteRef.current!
      const tintEl = tintRef.current!
      const bannerRigEl = bannerRigRef.current!
      const ropeEl = ropeRef.current!
      const bannerEl = bannerRef.current!
      const bannerTextEl = bannerTextRef.current!

      spriteEl.src = src
      spriteEl.style.width = `${w}px`
      spriteEl.style.height = `${h}px`

      let tintColor: string | undefined
      if (calendarSource === 'google') tintColor = hexToRgba(settings.googleTintColor, 0.4)
      else if (calendarSource === 'microsoft') tintColor = hexToRgba(settings.microsoftTintColor, 0.4)

      if (tintColor) {
        tintEl.style.display = 'block'
        tintEl.style.width = `${w}px`
        tintEl.style.height = `${h}px`
        tintEl.style.background = tintColor
        tintEl.style.setProperty('-webkit-mask-image', `url(${src})`)
        tintEl.style.setProperty('-webkit-mask-size', '100% 100%')
      } else {
        tintEl.style.display = 'none'
      }

      if (settings.showMeetingLabel && meetingTitle) {
        bannerTextEl.textContent = meetingTitle
        bannerRigEl.style.display = 'flex'
        ropeEl.style.width = `${Math.round(settings.size * 0.22)}px`
        bannerEl.style.fontSize = `${Math.max(10, Math.round(settings.size * 0.15))}px`
        bannerEl.style.padding = `${Math.max(3, Math.round(settings.size * 0.04))}px ${Math.max(
          8,
          Math.round(settings.size * 0.12)
        )}px`
      } else {
        bannerRigEl.style.display = 'none'
      }

      if (settings.soundEnabled) {
        playBeep(settings.customSoundPath || undefined)
      }

      const pathFn = createPathFn(settings.flightPath, sw, sh, settings.size)
      const duration = ((sw + settings.size * 2) / settings.speed) * 1000
      const startTime = performance.now()

      function frame(now: number): void {
        const t = Math.min((now - startTime) / duration, 1)
        const point = pathFn(t)

        posRef.current!.style.transform = `translate(${point.x - w / 2}px, ${point.y - h / 2}px)`
        rotateRef.current!.style.transform = `rotate(${point.angle}rad)`

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(frame)
        } else {
          globalThis.overlay.notifyComplete()
        }
      }

      animFrameRef.current = requestAnimationFrame(frame)
    })
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{BANNER_STYLE}</style>
      <div ref={posRef} style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform' }}>
        <div ref={rotateRef} style={{ position: 'relative', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }}>
          <div
            ref={bannerRigRef}
            style={{
              position: 'absolute',
              top: '50%',
              right: '100%',
              transform: 'translateY(-50%)',
              display: 'none',
              alignItems: 'center'
            }}
          >
            <div
              ref={ropeRef}
              style={{ height: 2, background: 'rgba(255,255,255,0.85)', boxShadow: '0 0 2px rgba(0,0,0,0.5)' }}
            />
            <div
              ref={bannerRef}
              className="fm-banner"
              style={{
                whiteSpace: 'nowrap',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 800,
                color: '#181818',
                background: 'linear-gradient(180deg, #ffffff, #eef0f4)',
                border: '1px solid rgba(0,0,0,0.18)',
                boxShadow: '0 3px 10px rgba(0,0,0,0.35)'
              }}
            >
              <span ref={bannerTextRef} />
            </div>
          </div>

          <img ref={spriteRef} alt="" style={{ display: 'block' }} />
          <div
            ref={tintRef}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'none',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat'
            }}
          />
        </div>
      </div>
    </div>
  )
}
