/**
 * Formats a date/timestamp the way WhatsApp/Telegram do:
 *  - < 60 minutes  → "Xm"
 *  - < 24 hours    → "Xh"
 *  - < 7 days      → day name ("Mon", "Tue" …)
 *  - otherwise     → "DD/MM"
 *
 * @param {string|Date|null|undefined} date
 * @returns {string}
 */
export function formatTime(date) {
  if (!date) return ''

  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHrs = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHrs < 24) return `${diffHrs}h`
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
}
