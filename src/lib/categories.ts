import {
  ArrowDownLeft,
  ArrowLeftRight,
  Award,
  Briefcase,
  Bus,
  Clapperboard,
  CircleEllipsis,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Percent,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Undo2,
  Utensils,
  Zap,
  type LucideIcon
} from 'lucide-react'
import type { CategoryId, Spending } from '../types'

type CategoryDefinition = {
  label: string
  icon: LucideIcon
  color: string
  keywords: RegExp
}

export const CATEGORIES: Record<CategoryId, CategoryDefinition> = {
  groceries: {
    label: 'Groceries',
    icon: ShoppingCart,
    color: '#16a34a',
    keywords: /\b(groceries|grocery|supermarket|market)\b/i
  },
  dining: {
    label: 'Dining',
    icon: Utensils,
    color: '#f97316',
    keywords: /\b(restaurants?|dining|coffee|cafe|bar|lunch|dinner|takeaway)\b/i
  },
  transport: {
    label: 'Transport',
    icon: Bus,
    color: '#2563eb',
    keywords: /\b(transport|train|bus|taxi|metro|fuel|parking)\b/i
  },
  travel: {
    label: 'Travel',
    icon: Plane,
    color: '#7c3aed',
    keywords: /\b(travel|trip|flights?|hotel|holiday)\b/i
  },
  shopping: {
    label: 'Shopping',
    icon: ShoppingBag,
    color: '#db2777',
    keywords: /\b(shopping|electronics|decor|clothes|store)\b/i
  },
  housing: {
    label: 'Housing',
    icon: Home,
    color: '#0d9488',
    keywords: /\b(rent|mortgage|landlord)\b/i
  },
  utilities: {
    label: 'Utilities',
    icon: Zap,
    color: '#ca8a04',
    keywords: /\b(utilities|electricity|water|internet|phone)\b/i
  },
  entertainment: {
    label: 'Entertainment',
    icon: Clapperboard,
    color: '#dc2626',
    keywords: /\b(netflix|spotify|concert|cinema|movies?|subscription|gaming)\b/i
  },
  health: {
    label: 'Health',
    icon: HeartPulse,
    color: '#0891b2',
    keywords: /\b(pharmacy|doctor|dentist|health)\b/i
  },
  education: {
    label: 'Education',
    icon: GraduationCap,
    color: '#4f46e5',
    keywords: /\b(books?|course|school|tuition)\b/i
  },
  transfer: {
    label: 'Transfers',
    icon: ArrowLeftRight,
    color: '#64748b',
    keywords: /\btransfer\b/i
  },
  other: {
    label: 'Other',
    icon: CircleEllipsis,
    color: '#94a3b8',
    keywords: /$^/
  },
  salary: { label: 'Salary', icon: Briefcase, color: '#16a34a', keywords: /$^/ },
  bonus: { label: 'Bonus', icon: Award, color: '#ca8a04', keywords: /$^/ },
  gift: { label: 'Gift', icon: Gift, color: '#db2777', keywords: /$^/ },
  refund: { label: 'Refund', icon: Undo2, color: '#0284c7', keywords: /$^/ },
  interest: { label: 'Interest', icon: Percent, color: '#0d9488', keywords: /$^/ },
  income: { label: 'Deposit', icon: ArrowDownLeft, color: '#22c55e', keywords: /$^/ }
}

export const INCOME_CATEGORY_IDS: CategoryId[] = ['salary', 'bonus', 'gift', 'refund', 'interest', 'income']
export const EXPENSE_CATEGORY_IDS = (Object.keys(CATEGORIES) as CategoryId[]).filter(
  id => !INCOME_CATEGORY_IDS.includes(id)
)

export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[]

// Categories a person can pick when creating a budget or a payment.
export const SPENDING_CATEGORY_IDS = EXPENSE_CATEGORY_IDS.filter(id => id !== 'transfer' && id !== 'other')

export const isIncome = (spending: Pick<Spending, 'kind'>) => spending.kind === 'income'

export function categorize(description: string): CategoryId {
  // Transfers are checked first so "Transfer to SCI (rent)" is not read as housing.
  if (CATEGORIES.transfer.keywords.test(description)) return 'transfer'
  return EXPENSE_CATEGORY_IDS.find(id => CATEGORIES[id].keywords.test(description)) ?? 'other'
}

export const getCategoryId = (spending: Pick<Spending, 'category' | 'description' | 'kind'>): CategoryId =>
  spending.category ?? (isIncome(spending) ? 'income' : categorize(spending.description))
