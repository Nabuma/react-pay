import type { Account, AppNotification, DemoUser, Recipient, Spending } from './types'

const mayaAccounts: Account[] = [
  { id: 1, name: 'BNP Paribas', balance: 1000, currency: 'EUR', logo: 'BNP' },
  { id: 2, name: 'La Banque Postale', balance: 2000, currency: 'EUR', logo: 'LBP' },
  { id: 3, name: 'Crédit Agricole', balance: 3000, currency: 'EUR', logo: 'CA' },
  { id: 4, name: 'Woori Bank', balance: 5000000, currency: 'KRW', logo: 'WB' }
]

const mayaSpendings: Spending[] = [
  { id: 1, date: '2026-09-03', description: 'Groceries', amount: 82.5, currency: 'EUR' },
  { id: 2, date: '2026-09-12', description: 'Restaurant', amount: 64000, currency: 'KRW' },
  { id: 3, date: '2026-09-24', description: 'Transport', amount: 38, currency: 'EUR' },
  { id: 4, date: '2026-08-05', description: 'Groceries', amount: 96, currency: 'EUR' },
  { id: 5, date: '2026-08-17', description: 'Shopping', amount: 52000, currency: 'KRW' },
  { id: 6, date: '2026-08-27', description: 'Utilities', amount: 74, currency: 'EUR' },
  { id: 7, date: '2026-07-04', description: 'Groceries', amount: 88, currency: 'EUR' },
  { id: 8, date: '2026-07-16', description: 'Restaurant', amount: 48, currency: 'EUR' },
  { id: 9, date: '2026-07-29', description: 'Shopping', amount: 71000, currency: 'KRW' }
]

const mayaNotifications: AppNotification[] = [
  { id: 1, message: 'Your balance has been updated.' },
  { id: 2, message: 'New spending added.' }
]

export const demoUsers: DemoUser[] = [
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    email: 'maya@toss.demo',
    password: 'maya123',
    accounts: mayaAccounts,
    spendings: mayaSpendings,
    notifications: mayaNotifications
  },
  {
    id: 'lucas-martin',
    name: 'Lucas Martin',
    email: 'lucas@toss.demo',
    password: 'lucas123',
    accounts: [
      { id: 1, name: 'Boursobank', balance: 8240.5, currency: 'EUR', logo: 'BO' },
      { id: 2, name: 'N26', balance: 1250, currency: 'EUR', logo: 'N26' },
      { id: 3, name: 'Wise', balance: 940000, currency: 'KRW', logo: 'WI' }
    ],
    spendings: [
      { id: 1, date: '2026-09-02', description: 'Rent', amount: 1180, currency: 'EUR' },
      { id: 2, date: '2026-09-08', description: 'Coffee shop', amount: 18.4, currency: 'EUR' },
      { id: 3, date: '2026-09-19', description: 'Electronics', amount: 229, currency: 'EUR' },
      { id: 4, date: '2026-08-04', description: 'Groceries', amount: 142.75, currency: 'EUR' },
      { id: 5, date: '2026-08-16', description: 'Travel', amount: 360000, currency: 'KRW' },
      { id: 6, date: '2026-08-25', description: 'Dining', amount: 76, currency: 'EUR' },
      { id: 7, date: '2026-07-05', description: 'Groceries', amount: 128, currency: 'EUR' },
      { id: 8, date: '2026-07-20', description: 'Concert', amount: 94, currency: 'EUR' }
    ],
    notifications: [
      { id: 1, message: 'Your rent payment is scheduled.' },
      { id: 2, message: 'Your Wise account balance changed.' }
    ]
  },
  {
    id: 'amelia-rossi',
    name: 'Amelia Rossi',
    email: 'amelia@toss.demo',
    password: 'amelia123',
    accounts: [
      { id: 1, name: 'Monzo', balance: 4280.25, currency: 'GBP', logo: 'MZ' },
      { id: 2, name: 'Revolut', balance: 2150, currency: 'EUR', logo: 'RE' },
      { id: 3, name: 'Chase', balance: 3275, currency: 'USD', logo: 'CH' }
    ],
    spendings: [
      { id: 1, date: '2026-09-04', description: 'Groceries', amount: 64.2, currency: 'GBP' },
      { id: 2, date: '2026-09-11', description: 'Train tickets', amount: 88, currency: 'EUR' },
      { id: 3, date: '2026-09-22', description: 'Home decor', amount: 143.5, currency: 'GBP' },
      { id: 4, date: '2026-08-03', description: 'Restaurants', amount: 112, currency: 'GBP' },
      { id: 5, date: '2026-08-14', description: 'Books', amount: 46.5, currency: 'USD' },
      { id: 6, date: '2026-08-26', description: 'Groceries', amount: 71.35, currency: 'GBP' },
      { id: 7, date: '2026-07-06', description: 'Weekend trip', amount: 210, currency: 'EUR' },
      { id: 8, date: '2026-07-18', description: 'Pharmacy', amount: 22.8, currency: 'GBP' }
    ],
    notifications: [
      { id: 1, message: 'Your monthly spending summary is ready.' },
      { id: 2, message: 'A new card payment was recorded.' }
    ]
  }
]

export const recipients: Recipient[] = [
  { id: 1, bank: 'Société Générale', name: 'Marie Dubois', iban: 'FR76 3000 6000 0112 3456 7890 189' },
  { id: 2, bank: 'HSBC', name: 'Netflix', iban: 'FR76 3000 3000 0112 3456 7890 157' },
  { id: 3, bank: 'Revolut', name: 'Thomas Martin', iban: 'LT12 3000 0000 0000 0001 2345' },
  { id: 4, bank: 'Boursorama', name: 'SCI Les Tilleuls (rent)', iban: 'FR76 4061 8803 0000 0412 3456 789' }
]
