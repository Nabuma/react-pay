import { createContext } from 'react'
import type { useBank } from '../hooks/useBank'
import type { useEuroTotals } from '../hooks/useEuroTotals'
import type { Recipient } from '../types'

export type BankContextValue = ReturnType<typeof useBank> &
  ReturnType<typeof useEuroTotals> & { recipients: readonly Recipient[] }

export const BankContext = createContext<BankContextValue | null>(null)
