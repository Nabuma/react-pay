import { describe, expect, it } from 'vitest'
import { readStorage, writeStorage } from './storage'

function createStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: key => data.get(key) ?? null,
    key: index => [...data.keys()][index] ?? null,
    removeItem: key => void data.delete(key),
    setItem: (key, value) => void data.set(key, value)
  }
}

const isNumberArray = (value: unknown): value is number[] => Array.isArray(value)

describe('storage helpers', () => {
  it('round-trips valid values', () => {
    const storage = createStorage()
    writeStorage(storage, 'key', [1, 2])
    expect(readStorage(storage, 'key', isNumberArray)).toEqual([1, 2])
  })

  it('ignores missing, invalid or corrupted values', () => {
    const storage = createStorage()
    expect(readStorage(storage, 'missing', isNumberArray)).toBeUndefined()

    storage.setItem('object', '{"a":1}')
    expect(readStorage(storage, 'object', isNumberArray)).toBeUndefined()

    storage.setItem('broken', '{not json')
    expect(readStorage(storage, 'broken', isNumberArray)).toBeUndefined()
  })
})
