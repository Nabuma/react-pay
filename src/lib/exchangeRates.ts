import type { ExchangeRates } from '../types'
import { TOTAL_CURRENCY } from './currency'
import { readCachedRates, writeCachedRates } from './ratesCache'

const API_URL = 'https://api.frankfurter.dev/v1/latest'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function fetchExchangeRates(
  currencies: readonly string[],
  signal: AbortSignal
): Promise<ExchangeRates> {
  const cached = readCachedRates(currencies)
  if (cached) return cached

  const query = new URLSearchParams({ base: TOTAL_CURRENCY, symbols: currencies.join(',') })
  const response = await fetch(`${API_URL}?${query}`, { signal })

  if (!response.ok) {
    throw new Error(`Exchange-rate request failed (${response.status}).`)
  }

  const data: unknown = await response.json()
  if (!isRecord(data) || !isRecord(data.rates)) {
    throw new Error('Exchange-rate response was invalid.')
  }

  const rates: ExchangeRates = {}
  for (const currency of currencies) {
    const rate = data.rates[currency]
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new Error(`No valid exchange rate was returned for ${currency}.`)
    }
    rates[currency] = rate
  }
  writeCachedRates(rates)
  return rates
}
