import { LOCALE } from './locale'

const monthFormatter = new Intl.DateTimeFormat(LOCALE, { month: 'long', timeZone: 'UTC' })

const monthYearFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
})

const dayFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC'
})

// Month keys use the "YYYY-MM" format, dates the "YYYY-MM-DD" format.
export const formatMonth = (monthKey: string) =>
  monthFormatter.format(new Date(`${monthKey}-01T00:00:00Z`))

export const formatMonthYear = (monthKey: string) =>
  monthYearFormatter.format(new Date(`${monthKey}-01T00:00:00Z`))

export const formatDay = (date: string) =>
  dayFormatter.format(new Date(`${date}T00:00:00Z`))

export const toDateKey = (date: Date) => date.toISOString().slice(0, 10)

export function getPreviousMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number)
  const previous = new Date(Date.UTC(year, month - 2, 1))
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`
}
