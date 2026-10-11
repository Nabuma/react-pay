export const normalizeIban = (value: string) => value.replace(/\s+/g, '').toUpperCase()

export const formatIban = (value: string) =>
  normalizeIban(value).replace(/(.{4})(?=.)/g, '$1 ')

// ISO 13616 check: move the first four characters to the end, convert letters
// to numbers (A=10 ... Z=35) and verify the result modulo 97 equals 1.
export function isValidIban(value: string) {
  const iban = normalizeIban(value)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false

  let remainder = 0
  for (const char of iban.slice(4) + iban.slice(0, 4)) {
    const digits = char >= 'A' ? String(char.charCodeAt(0) - 55) : char
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97
  }
  return remainder === 1
}
