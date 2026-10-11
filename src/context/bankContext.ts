import { createContext } from 'react'
import type { useBank } from '../hooks/useBank'
import type { useEuroTotals } from '../hooks/useEuroTotals'

export type BankContextValue = ReturnType<typeof useBank> & ReturnType<typeof useEuroTotals>

export const BankContext = createContext<BankContextValue | null>(null)
