import { useCallback, useEffect, useMemo, useState } from 'react'
import { TOTAL_CURRENCY } from '../lib/currency'
import { fetchExchangeRates } from '../lib/exchangeRates'
import type { ExchangeRates } from '../types'

export function useExchangeRates(currencies: readonly string[]) {
  const key = [...new Set(currencies)].filter(currency => currency !== TOTAL_CURRENCY).sort().join(',')
  const foreignCurrencies = useMemo(() => (key ? key.split(',') : []), [key])
  const [rates, setRates] = useState<ExchangeRates>({})
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (foreignCurrencies.length === 0) return

    const controller = new AbortController()

    fetchExchangeRates(foreignCurrencies, controller.signal)
      .then(loadedRates => {
        setRates(loadedRates)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === 'AbortError') return
        setError(reason instanceof Error ? reason.message : 'Unable to load exchange rates.')
      })

    return () => controller.abort()
  }, [foreignCurrencies, attempt])

  const retry = useCallback(() => {
    setError(null)
    setAttempt(current => current + 1)
  }, [])

  const isReady = foreignCurrencies.every(currency => rates[currency] !== undefined)

  return { rates, error, isReady, retry }
}
