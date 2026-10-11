import { describe, expect, it } from 'vitest'
import { toEuros } from './currency'
import { getPreviousMonth } from './dates'
import { getTrend, groupMonthlySpendings } from './spendings'

describe('toEuros', () => {
  const rates = { KRW: 1500, USD: 1.25 }

  it('returns EUR amounts unchanged', () => {
    expect(toEuros(42, 'EUR', rates)).toBe(42)
  })

  it('divides by the rate of foreign currencies', () => {
    expect(toEuros(3000, 'KRW', rates)).toBe(2)
    expect(toEuros(5, 'USD', rates)).toBe(4)
  })
})

describe('groupMonthlySpendings', () => {
  const rates = { KRW: 1000 }
  const spendings = [
    { id: 1, date: '2026-08-05', description: 'A', amount: 10, currency: 'EUR' },
    { id: 2, date: '2026-09-01', description: 'B', amount: 5000, currency: 'KRW' },
    { id: 3, date: '2026-09-20', description: 'C', amount: 20, currency: 'EUR' }
  ]

  it('groups by month, newest first, with totals in euros', () => {
    const months = groupMonthlySpendings(spendings, rates)

    expect(months.map(month => month.month)).toEqual(['2026-09', '2026-08'])
    expect(months[0].total).toBe(25)
    expect(months[0].transactions.map(transaction => transaction.id)).toEqual([2, 3])
    expect(months[0].transactions[0].totalInEuros).toBe(5)
    expect(months[1].total).toBe(10)
  })

  it('returns an empty list without spendings', () => {
    expect(groupMonthlySpendings([], rates)).toEqual([])
  })
})

describe('getTrend', () => {
  it('compares against the previous total', () => {
    expect(getTrend(10, 5)).toBe('up')
    expect(getTrend(5, 10)).toBe('down')
    expect(getTrend(5, 5)).toBeNull()
  })
})

describe('getPreviousMonth', () => {
  it('handles regular months and year boundaries', () => {
    expect(getPreviousMonth('2026-09')).toBe('2026-08')
    expect(getPreviousMonth('2026-01')).toBe('2025-12')
  })
})
