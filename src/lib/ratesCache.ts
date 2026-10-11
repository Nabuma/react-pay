import type { ExchangeRates } from '../types'
import { readStorage, writeStorage } from './storage'

const CACHE_KEY = 'toss:v1:rates'
const CACHE_TTL_MS = 60 * 60 * 1000

type CachedRates = { fetchedAt: number; rates: ExchangeRates }

function isCachedRates(value: unknown): value is CachedRates {
  if (typeof value !== 'object' || value === null) return false
  const { fetchedAt, rates } = value as Partial<CachedRates>
  return typeof fetchedAt === 'number' && typeof rates === 'object' && rates !== null
}

export function readCachedRates(currencies: readonly string[], now = Date.now()) {
  const cached = readStorage(sessionStorage, CACHE_KEY, isCachedRates)
  if (!cached || now - cached.fetchedAt > CACHE_TTL_MS) return undefined

  const rates: ExchangeRates = {}
  for (const currency of currencies) {
    const rate = cached.rates[currency]
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) return undefined
    rates[currency] = rate
  }
  return rates
}

export function writeCachedRates(rates: ExchangeRates, now = Date.now()) {
  writeStorage(sessionStorage, CACHE_KEY, { fetchedAt: now, rates })
}
