import type { DemoUser, Recipient } from './types'

const sharedRecipients: Recipient[] = [
  { id: 1, bank: 'Société Générale', name: 'Marie Dubois', iban: 'FR76 3000 6000 0112 3456 7890 189', favourite: true },
  { id: 2, bank: 'HSBC', name: 'Netflix', iban: 'FR98 3000 3000 0112 3456 7890 157' },
  { id: 3, bank: 'Revolut', name: 'Thomas Martin', iban: 'LT24 3000 0000 0000 0012' },
  { id: 4, bank: 'Boursorama', name: 'SCI Les Tilleuls (rent)', iban: 'FR20 4061 8803 0000 0412 3456 789' }
]

export const demoUsers: DemoUser[] = [
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    email: 'maya@toss.demo',
    password: 'maya123',
    accounts: [
      { id: 1, name: 'BNP Paribas', balance: 1000, currency: 'EUR', logo: 'BNP' },
      { id: 2, name: 'La Banque Postale', balance: 2000, currency: 'EUR', logo: 'LBP' },
      { id: 3, name: 'Crédit Agricole', balance: 3000, currency: 'EUR', logo: 'CA' },
      { id: 4, name: 'Woori Bank', balance: 5000000, currency: 'KRW', logo: 'WB' }
    ],
    spendings: [
      { id: 1, date: '2026-10-02', description: 'Groceries', amount: 74.3, currency: 'EUR', accountId: 1 },
      { id: 2, date: '2026-10-06', description: 'Restaurant', amount: 58000, currency: 'KRW', accountId: 4 },
      { id: 3, date: '2026-09-03', description: 'Groceries', amount: 82.5, currency: 'EUR', accountId: 1 },
      { id: 4, date: '2026-09-12', description: 'Restaurant', amount: 64000, currency: 'KRW', accountId: 4 },
      { id: 5, date: '2026-09-24', description: 'Transport', amount: 38, currency: 'EUR', accountId: 2 },
      { id: 6, date: '2026-08-05', description: 'Groceries', amount: 96, currency: 'EUR', accountId: 1 },
      { id: 7, date: '2026-08-17', description: 'Shopping', amount: 52000, currency: 'KRW', accountId: 4 },
      { id: 8, date: '2026-08-27', description: 'Utilities', amount: 74, currency: 'EUR', accountId: 2 },
      { id: 9, date: '2026-07-04', description: 'Groceries', amount: 88, currency: 'EUR', accountId: 1 },
      { id: 10, date: '2026-07-16', description: 'Restaurant', amount: 48, currency: 'EUR', accountId: 3 },
      { id: 11, date: '2026-07-29', description: 'Shopping', amount: 71000, currency: 'KRW', accountId: 4 },
      { id: 12, date: '2026-10-01', description: 'Salary — Lumen Studio', amount: 3150, currency: 'EUR', accountId: 1, category: 'salary', kind: 'income' },
      { id: 13, date: '2026-10-08', description: 'Birthday gift from Mom', amount: 150000, currency: 'KRW', accountId: 4, category: 'gift', kind: 'income' },
      { id: 14, date: '2026-09-30', description: 'Salary — Lumen Studio', amount: 3150, currency: 'EUR', accountId: 1, category: 'salary', kind: 'income' },
      { id: 15, date: '2026-09-15', description: 'Online order refund', amount: 42.9, currency: 'EUR', accountId: 2, category: 'refund', kind: 'income' },
      { id: 16, date: '2026-08-31', description: 'Salary — Lumen Studio', amount: 3150, currency: 'EUR', accountId: 1, category: 'salary', kind: 'income' },
      { id: 17, date: '2026-08-12', description: 'Performance bonus', amount: 600, currency: 'EUR', accountId: 1, category: 'bonus', kind: 'income' },
      { id: 18, date: '2026-07-31', description: 'Salary — Lumen Studio', amount: 3150, currency: 'EUR', accountId: 1, category: 'salary', kind: 'income' },
      { id: 19, date: '2026-07-01', description: 'Savings interest', amount: 18.4, currency: 'EUR', accountId: 3, category: 'interest', kind: 'income' }
    ],
    notifications: [
      { id: 1, message: 'Your balance has been updated.' },
      { id: 2, message: 'New spending added.' }
    ],
    recipients: sharedRecipients,
    budgets: [
      { category: 'groceries', limit: 300 },
      { category: 'dining', limit: 90 },
      { category: 'transport', limit: 60 }
    ],
    goals: [
      { id: 1, name: 'Seoul trip', target: 2500, saved: 900 },
      { id: 2, name: 'Emergency fund', target: 5000, saved: 3200 }
    ],
    scheduled: [
      { id: 1, payee: 'Netflix', accountId: 1, amount: 13.49, category: 'entertainment', frequency: 'monthly', nextDate: '2026-10-14', active: true },
      { id: 2, payee: 'Gym membership', accountId: 2, amount: 39, category: 'health', frequency: 'monthly', nextDate: '2026-10-28', active: true },
      { id: 3, payee: 'Cloud storage', accountId: 3, amount: 29.99, category: 'utilities', frequency: 'yearly', nextDate: '2027-02-03', active: true }
    ],
    requests: [
      { id: 1, direction: 'incoming', person: 'Thomas Martin', amount: 32.5, currency: 'EUR', note: 'Concert tickets', date: '2026-10-08', status: 'pending' },
      { id: 2, direction: 'outgoing', person: 'Marie Dubois', amount: 45, currency: 'EUR', note: 'Dinner last Friday', date: '2026-10-05', status: 'pending', accountId: 1 }
    ],
    cards: [
      { id: 1, accountId: 1, network: 'Visa', last4: '4821', holder: 'Maya Chen', expiry: '08/29', frozen: false, online: true, contactless: true, limit: 1500 },
      { id: 2, accountId: 4, network: 'Mastercard', last4: '9036', holder: 'Maya Chen', expiry: '03/28', frozen: false, online: true, contactless: false, limit: 800 }
    ]
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
      { id: 1, date: '2026-10-01', description: 'Rent', amount: 1180, currency: 'EUR', accountId: 1 },
      { id: 2, date: '2026-10-07', description: 'Coffee shop', amount: 14.2, currency: 'EUR', accountId: 2 },
      { id: 3, date: '2026-09-02', description: 'Rent', amount: 1180, currency: 'EUR', accountId: 1 },
      { id: 4, date: '2026-09-08', description: 'Coffee shop', amount: 18.4, currency: 'EUR', accountId: 2 },
      { id: 5, date: '2026-09-19', description: 'Electronics', amount: 229, currency: 'EUR', accountId: 1 },
      { id: 6, date: '2026-08-04', description: 'Groceries', amount: 142.75, currency: 'EUR', accountId: 1 },
      { id: 7, date: '2026-08-16', description: 'Travel', amount: 360000, currency: 'KRW', accountId: 3 },
      { id: 8, date: '2026-08-25', description: 'Dining', amount: 76, currency: 'EUR', accountId: 2 },
      { id: 9, date: '2026-07-05', description: 'Groceries', amount: 128, currency: 'EUR', accountId: 1 },
      { id: 10, date: '2026-07-20', description: 'Concert', amount: 94, currency: 'EUR', accountId: 2 },
      { id: 11, date: '2026-10-03', description: 'Freelance invoice — Atelier Nord', amount: 1450, currency: 'EUR', accountId: 1, category: 'income', kind: 'income' },
      { id: 12, date: '2026-10-05', description: 'Concert ticket refund', amount: 47, currency: 'EUR', accountId: 2, category: 'refund', kind: 'income' },
      { id: 13, date: '2026-09-03', description: 'Freelance invoice — Atelier Nord', amount: 1450, currency: 'EUR', accountId: 1, category: 'income', kind: 'income' },
      { id: 14, date: '2026-08-20', description: 'Gift from Grandma', amount: 100, currency: 'EUR', accountId: 2, category: 'gift', kind: 'income' },
      { id: 15, date: '2026-07-03', description: 'Freelance invoice — Atelier Nord', amount: 1450, currency: 'EUR', accountId: 1, category: 'income', kind: 'income' },
      { id: 16, date: '2026-07-31', description: 'Savings interest', amount: 21.3, currency: 'EUR', accountId: 1, category: 'interest', kind: 'income' }
    ],
    notifications: [
      { id: 1, message: 'Your rent payment is scheduled.' },
      { id: 2, message: 'Your Wise account balance changed.' }
    ],
    recipients: sharedRecipients.map(recipient => ({ ...recipient, favourite: recipient.id === 4 })),
    budgets: [
      { category: 'housing', limit: 1200 },
      { category: 'dining', limit: 60 },
      { category: 'shopping', limit: 250 }
    ],
    goals: [{ id: 1, name: 'New laptop', target: 1800, saved: 650 }],
    scheduled: [
      { id: 1, payee: 'SCI Les Tilleuls (rent)', accountId: 1, amount: 1180, category: 'housing', frequency: 'monthly', nextDate: '2026-11-01', active: true },
      { id: 2, payee: 'Spotify', accountId: 2, amount: 10.99, category: 'entertainment', frequency: 'monthly', nextDate: '2026-10-12', active: true },
      { id: 3, payee: 'Weekly meal box', accountId: 2, amount: 24, category: 'groceries', frequency: 'weekly', nextDate: '2026-10-09', active: false }
    ],
    requests: [
      { id: 1, direction: 'incoming', person: 'Marie Dubois', amount: 60, currency: 'EUR', note: 'Birthday gift split', date: '2026-10-09', status: 'pending' }
    ],
    cards: [
      { id: 1, accountId: 1, network: 'Mastercard', last4: '1175', holder: 'Lucas Martin', expiry: '11/28', frozen: false, online: true, contactless: true, limit: 2500 },
      { id: 2, accountId: 2, network: 'Visa', last4: '6409', holder: 'Lucas Martin', expiry: '05/27', frozen: true, online: false, contactless: true, limit: 600 }
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
      { id: 1, date: '2026-10-03', description: 'Groceries', amount: 58.9, currency: 'GBP', accountId: 1 },
      { id: 2, date: '2026-10-09', description: 'Pharmacy', amount: 17.5, currency: 'GBP', accountId: 1 },
      { id: 3, date: '2026-09-04', description: 'Groceries', amount: 64.2, currency: 'GBP', accountId: 1 },
      { id: 4, date: '2026-09-11', description: 'Train tickets', amount: 88, currency: 'EUR', accountId: 2 },
      { id: 5, date: '2026-09-22', description: 'Home decor', amount: 143.5, currency: 'GBP', accountId: 1 },
      { id: 6, date: '2026-08-03', description: 'Restaurants', amount: 112, currency: 'GBP', accountId: 1 },
      { id: 7, date: '2026-08-14', description: 'Books', amount: 46.5, currency: 'USD', accountId: 3 },
      { id: 8, date: '2026-08-26', description: 'Groceries', amount: 71.35, currency: 'GBP', accountId: 1 },
      { id: 9, date: '2026-07-06', description: 'Weekend trip', amount: 210, currency: 'EUR', accountId: 2 },
      { id: 10, date: '2026-07-18', description: 'Pharmacy', amount: 22.8, currency: 'GBP', accountId: 1 },
      { id: 11, date: '2026-10-01', description: 'Salary — Northwind Ltd', amount: 2840, currency: 'GBP', accountId: 1, category: 'salary', kind: 'income' },
      { id: 12, date: '2026-10-07', description: 'Pharmacy refund', amount: 9.5, currency: 'GBP', accountId: 1, category: 'refund', kind: 'income' },
      { id: 13, date: '2026-09-01', description: 'Salary — Northwind Ltd', amount: 2840, currency: 'GBP', accountId: 1, category: 'salary', kind: 'income' },
      { id: 14, date: '2026-09-18', description: 'Birthday gift from Luca', amount: 80, currency: 'EUR', accountId: 2, category: 'gift', kind: 'income' },
      { id: 15, date: '2026-08-01', description: 'Salary — Northwind Ltd', amount: 2840, currency: 'GBP', accountId: 1, category: 'salary', kind: 'income' },
      { id: 16, date: '2026-08-15', description: 'Dividend payout', amount: 64, currency: 'USD', accountId: 3, category: 'interest', kind: 'income' },
      { id: 17, date: '2026-07-01', description: 'Salary — Northwind Ltd', amount: 2840, currency: 'GBP', accountId: 1, category: 'salary', kind: 'income' },
      { id: 18, date: '2026-07-24', description: 'Year-end bonus advance', amount: 400, currency: 'GBP', accountId: 1, category: 'bonus', kind: 'income' }
    ],
    notifications: [
      { id: 1, message: 'Your monthly spending summary is ready.' },
      { id: 2, message: 'A new card payment was recorded.' }
    ],
    recipients: sharedRecipients.map(recipient => ({ ...recipient, favourite: recipient.id === 3 })),
    budgets: [
      { category: 'groceries', limit: 200 },
      { category: 'travel', limit: 300 },
      { category: 'health', limit: 50 }
    ],
    goals: [
      { id: 1, name: 'Rome weekend', target: 900, saved: 420 },
      { id: 2, name: 'Sofa', target: 1400, saved: 1100 }
    ],
    scheduled: [
      { id: 1, payee: 'Phone plan', accountId: 1, amount: 18, category: 'utilities', frequency: 'monthly', nextDate: '2026-10-20', active: true },
      { id: 2, payee: 'Language course', accountId: 2, amount: 45, category: 'education', frequency: 'monthly', nextDate: '2026-10-10', active: true }
    ],
    requests: [
      { id: 1, direction: 'outgoing', person: 'Thomas Martin', amount: 85, currency: 'EUR', note: 'Hotel share', date: '2026-10-02', status: 'pending', accountId: 2 },
      { id: 2, direction: 'incoming', person: 'Marie Dubois', amount: 22, currency: 'GBP', note: 'Lunch', date: '2026-10-06', status: 'pending' }
    ],
    cards: [
      { id: 1, accountId: 1, network: 'Mastercard', last4: '2288', holder: 'Amelia Rossi', expiry: '01/29', frozen: false, online: true, contactless: true, limit: 1200 },
      { id: 2, accountId: 3, network: 'Visa', last4: '7710', holder: 'Amelia Rossi', expiry: '09/27', frozen: false, online: true, contactless: true, limit: 1000 }
    ]
  }
]
