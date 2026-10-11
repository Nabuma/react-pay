import type { ExchangeRates } from '../types'
import { LOCALE } from './locale'

export const TOTAL_CURRENCY = 'EUR'

const formatters = new Map<string, Intl.NumberFormat>()

export function formatMoney(amount: number, currency: string = TOTAL_CURRENCY) {
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency })
    formatters.set(currency, formatter)
  }
  return formatter.format(amount)
}

// Rates are expressed as units of foreign currency per 1 EUR.
export function toEuros(amount: number, currency: string, rates: ExchangeRates) {
  return currency === TOTAL_CURRENCY ? amount : amount / rates[currency]
}
