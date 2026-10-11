export type CategoryId =
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'travel'
  | 'shopping'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'transfer'
  | 'other'
  | 'salary'
  | 'bonus'
  | 'gift'
  | 'refund'
  | 'interest'
  | 'income'

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
  accountId?: number
  category?: CategoryId
  // Money added to the account; amounts are always positive. Anything else is an expense.
  kind?: 'income'
}

export type Recipient = {
  id: number
  bank: string
  name: string
  iban: string
  favourite?: boolean
}

export type AppNotification = {
  id: number
  message: string
}

// Monthly budget limits are expressed in euros.
export type Budget = {
  category: CategoryId
  limit: number
}

export type SavingsGoal = {
  id: number
  name: string
  target: number
  saved: number
}

export type Frequency = 'weekly' | 'monthly' | 'yearly'

export type ScheduledPayment = {
  id: number
  payee: string
  accountId: number
  amount: number
  category: CategoryId
  frequency: Frequency
  nextDate: string
  active: boolean
}

export type RequestStatus = 'pending' | 'paid' | 'declined' | 'cancelled'

export type MoneyRequest = {
  id: number
  direction: 'incoming' | 'outgoing'
  person: string
  amount: number
  currency: string
  note: string
  date: string
  status: RequestStatus
  // Account that receives the money once an outgoing request is settled.
  accountId?: number
}

export type PaymentCard = {
  id: number
  accountId: number
  network: 'Visa' | 'Mastercard'
  last4: string
  holder: string
  expiry: string
  frozen: boolean
  online: boolean
  contactless: boolean
  // Monthly limit in euros.
  limit: number
}

export type DemoUser = {
  id: string
  name: string
  email: string
  password: string
  accounts: Account[]
  spendings: Spending[]
  notifications: AppNotification[]
  recipients: Recipient[]
  budgets: Budget[]
  goals: SavingsGoal[]
  scheduled: ScheduledPayment[]
  requests: MoneyRequest[]
  cards: PaymentCard[]
}

export type ExchangeRates = Record<string, number>

export type ConvertedSpending = Spending & {
  totalInEuros: number
}

export type MonthlySpending = {
  month: string
  // Expenses only, so totals and insights are never inflated by money received.
  total: number
  transactions: ConvertedSpending[]
  income: number
  received: ConvertedSpending[]
}
