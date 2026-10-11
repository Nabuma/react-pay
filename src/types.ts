export type Account = {
  id: number
  name: string
  balance: number
  currency: string
  logo: string
}

export type Spending = {
  id: number
  date: string
  description: string
  amount: number
  currency: string
}

export type Recipient = {
  id: number
  bank: string
  name: string
  iban: string
}

export type AppNotification = {
  id: number
  message: string
}

export type DemoUser = {
  id: string
  name: string
  email: string
  password: string
  accounts: Account[]
  spendings: Spending[]
  notifications: AppNotification[]
}

export type ExchangeRates = Record<string, number>

export type ConvertedSpending = Spending & {
  totalInEuros: number
}

export type MonthlySpending = {
  month: string
  total: number
  transactions: ConvertedSpending[]
}
