import { FlightPath } from '../../../shared/types'

export interface PathPoint {
  x: number
  y: number
  angle: number
}

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3
}

function cubicBezierDeriv(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t
  return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2)
}

export function createPathFn(
  path: FlightPath,
  sw: number,
  sh: number,
  size: number
): (t: number) => PathPoint {
  const enter = -size
  const exit = sw + size

  switch (path) {
    case 'straight':
      return (t) => ({
        x: enter + t * (exit - enter),
        y: sh * 0.45,
        angle: 0
      })

    case 'diagonal-down': {
      const dx = exit - enter
      const dy = sh * 0.6 - size
      const ang = Math.atan2(dy, dx)
      return (t) => ({
        x: enter + t * dx,
        y: size + t * dy,
        angle: ang
      })
    }

    case 'diagonal-up': {
      const dx = exit - enter
      const dy = -(sh * 0.6 - size)
      const ang = Math.atan2(dy, dx)
      return (t) => ({
        x: enter + t * dx,
        y: sh - size + t * dy,
        angle: ang
      })
    }

    case 'wavy': {
      const amp = sh * 0.18
      const freq = (5 * Math.PI) / sw
      return (t) => {
        const x = enter + t * (exit - enter)
        const phase = freq * (x + size)
        const y = sh * 0.45 + amp * Math.sin(phase)
        const dyDx = amp * freq * Math.cos(phase)
        return { x, y, angle: Math.atan2(dyDx, 1) }
      }
    }

    case 'random': {
      const y0 = sh * 0.45
      const y1 = sh * (0.1 + Math.random() * 0.35)
      const y2 = sh * (0.55 + Math.random() * 0.35)
      const y3 = sh * 0.45
      const x0 = enter, x1 = sw * 0.3, x2 = sw * 0.7, x3 = exit
      return (t) => {
        const x = cubicBezier(t, x0, x1, x2, x3)
        const y = cubicBezier(t, y0, y1, y2, y3)
        const dx = cubicBezierDeriv(t, x0, x1, x2, x3)
        const dy = cubicBezierDeriv(t, y0, y1, y2, y3)
        return { x, y, angle: Math.atan2(dy, dx) }
      }
    }
  }
}

let _audioCtx: AudioContext | null = null

export function playBeep(customSoundSrc?: string): void {
  if (customSoundSrc) {
    const audio = new Audio(customSoundSrc)
    audio.play().catch(() => {})
    return
  }

  _audioCtx ??= new AudioContext()
  const ctx = _audioCtx
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 880
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.6)
}
