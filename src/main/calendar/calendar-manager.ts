import { getSettings } from '../settings-store'
import { triggerFlyover } from '../overlay-manager'
import { fetchGoogleMeetings, isGoogleConnected } from './google-provider'
import { fetchMicrosoftMeetings, isMicrosoftConnected } from './microsoft-provider'
import { Meeting } from './calendar-types'

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const MIN_TRIGGER_MS = 30_000 // Don't schedule triggers less than 30 s away

let pollTimer: ReturnType<typeof setInterval> | null = null

// meetingId → handle of the scheduled setTimeout
const scheduledTriggers = new Map<string, ReturnType<typeof setTimeout>>()

// ─── Public API ──────────────────────────────────────────────────────────────

export function startCalendarPoller(): void {
  if (pollTimer) return
  void poll()
  pollTimer = setInterval(() => void poll(), POLL_INTERVAL_MS)
  console.log('[Calendar] Poller started (interval:', POLL_INTERVAL_MS / 1000, 's)')
}

export function stopCalendarPoller(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  for (const timer of scheduledTriggers.values()) clearTimeout(timer)
  scheduledTriggers.clear()
  console.log('[Calendar] Poller stopped')
}

/** Cancel all pending triggers and immediately re-poll. */
export function rescheduleAll(): void {
  for (const timer of scheduledTriggers.values()) clearTimeout(timer)
  scheduledTriggers.clear()
  void poll()
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
  const settings = getSettings()
  const meetings: Meeting[] = []

  if (settings.googleCalendarEnabled && isGoogleConnected()) {
    try {
      const events = await fetchGoogleMeetings(settings.googleClientId, settings.googleClientSecret)
      meetings.push(...events)
      console.log(`[Calendar] Google: fetched ${events.length} event(s)`)
    } catch (err) {
      console.error('[Calendar] Google fetch error:', (err as Error).message)
    }
  }

  if (settings.microsoftCalendarEnabled && isMicrosoftConnected()) {
    try {
      const events = await fetchMicrosoftMeetings(settings.microsoftClientId)
      meetings.push(...events)
      console.log(`[Calendar] Microsoft: fetched ${events.length} event(s)`)
    } catch (err) {
      console.error('[Calendar] Microsoft fetch error:', (err as Error).message)
    }
  }

  reconcile(meetings, settings.leadTimeMinutes)
}

function reconcile(freshMeetings: Meeting[], leadTimeMinutes: number): void {
  const freshIds = new Set(freshMeetings.map((m) => m.id))

  // Cancel timers for meetings that are no longer coming (cancelled / rescheduled)
  for (const [id, timer] of scheduledTriggers) {
    if (!freshIds.has(id)) {
      clearTimeout(timer)
      scheduledTriggers.delete(id)
      console.log(`[Calendar] Removed trigger for disappeared meeting: ${id}`)
    }
  }

  // Schedule flyover triggers for new meetings
  for (const meeting of freshMeetings) {
    if (scheduledTriggers.has(meeting.id)) continue // already scheduled

    const triggerAt = meeting.start.getTime() - leadTimeMinutes * 60_000
    const msUntilTrigger = triggerAt - Date.now()

    if (msUntilTrigger < MIN_TRIGGER_MS) continue // already past or imminent

    const timer = setTimeout(() => {
      scheduledTriggers.delete(meeting.id)
      fireFlyover(meeting)
    }, msUntilTrigger)

    scheduledTriggers.set(meeting.id, timer)
    console.log(
      `[Calendar] Scheduled "${meeting.title}" (${meeting.source}) at ${new Date(triggerAt).toLocaleTimeString()}`
    )
  }
}

function fireFlyover(meeting: Meeting): void {
  const settings = getSettings()
  void triggerFlyover({ settings, meetingTitle: meeting.title, calendarSource: meeting.source })
  console.log(`[Calendar] Flyover fired for: "${meeting.title}" (${meeting.source})`)
}
