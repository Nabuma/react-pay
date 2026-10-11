import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../lib/storage'

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T
) {
  const [value, setValue] = useState<T>(
    () => readStorage(localStorage, key, isValid) ?? initialValue
  )

  useEffect(() => {
    writeStorage(localStorage, key, value)
  }, [key, value])

  return [value, setValue] as const
}
