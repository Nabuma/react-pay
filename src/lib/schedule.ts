import type { Frequency } from '../types'
import { toDateKey } from './dates'

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly'
}

const MS_PER_DAY = 86_400_000

export function advanceDate(date: string, frequency: Frequency) {
  const [year, month, day] = date.split('-').map(Number)

  if (frequency === 'weekly') return toDateKey(new Date(Date.UTC(year, month - 1, day + 7)))

  const target = new Date(Date.UTC(year, month - 1 + (frequency === 'monthly' ? 1 : 12), 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return toDateKey(target)
}

// The first occurrence after "today", so overdue payments do not stay overdue after being paid.
export function nextRunAfter(date: string, frequency: Frequency, today: string) {
  let next = advanceDate(date, frequency)
  while (next <= today) next = advanceDate(next, frequency)
  return next
}

export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY)

export function describeDue(nextDate: string, today: string) {
  const days = daysBetween(today, nextDate)
  if (days < 0) return { label: `Overdue by ${-days} ${-days === 1 ? 'day' : 'days'}`, tone: 'late' as const }
  if (days === 0) return { label: 'Due today', tone: 'late' as const }
  if (days === 1) return { label: 'Due tomorrow', tone: 'soon' as const }
  return { label: `Due in ${days} days`, tone: days <= 7 ? ('soon' as const) : ('later' as const) }
}
