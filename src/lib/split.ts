// Splits a total into cent-accurate shares. Any leftover cents go to the first shares,
// so the shares always add up to the total exactly.
export function splitEvenly(total: number, parts: number): number[] {
  const cents = Math.round(total * 100)
  const base = Math.floor(cents / parts)
  const remainder = cents - base * parts

  return Array.from({ length: parts }, (_, index) => (base + (index < remainder ? 1 : 0)) / 100)
}
