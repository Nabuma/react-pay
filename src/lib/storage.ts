export function readStorage<T>(
  storage: Storage,
  key: string,
  isValid: (value: unknown) => value is T
): T | undefined {
  try {
    const raw = storage.getItem(key)
    if (raw === null) return undefined
    const value: unknown = JSON.parse(raw)
    return isValid(value) ? value : undefined
  } catch {
    return undefined
  }
}

export function writeStorage(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or unavailable (private mode); the app still works without it.
  }
}
