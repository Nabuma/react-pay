# Toss

Toss is a personal-finance demo built with React, TypeScript and Vite. You sign in as one of several fake users and see that user's bank accounts, a total balance converted to euros, and a spending history. You can also send money from an account to a recipient.

It is a front-end-only demo. There is no backend, and the data and credentials live in the client, so it is **not** suitable for protecting real accounts.

## Features

- **Login page.** The first screen is a sign-in form. A list of demo profiles fills in the credentials for you. The signed-in user is remembered across reloads, and you can sign out from the header.
- **Multiple demo users.** Each user has their own accounts, spendings and notifications.
- **Balance hero.** Shows the total across all accounts, converted to EUR, with loading and error/retry states.
- **Accounts card.** Lists each account with its balance in its own currency (EUR, KRW, GBP, USD) and a **Send** button.
- **Spendings card.** Shows the latest month's total, with an up/down badge compared with the previous month, and a "View all" link to the Activity tab.
- **Transfers.** A three-step flow (choose recipient and amount, review, confirm). Input is validated, and a successful transfer lowers the account balance and adds a spending and a notification.
- **Notifications.** A bell popover with an unread indicator. It stays inside the viewport on small screens.
- **Tabbed dashboard.** Overview, Activity, Insights, Budgets, Payments and Cards, with keyboard navigation and lazy-loaded tabs.
- **Activity.** Full transaction history grouped by month. Money received (salary, bonus, gift, refund, interest, deposits) is shown in green with a "Received" badge and a `+` amount, apart from spendings. Monthly headers show money in and out, with a Money in / Money out filter, search, account, category and date filters, plus CSV export and print-to-PDF.
- **Insights.** Category donut chart, monthly spending bars and month-over-month stats.
- **Budgets and goals.** Monthly category budgets with progress and warnings, and savings goals you can top up or withdraw from. Goals are tracked separately from account balances.
- **Payments.** Saved recipients with IBAN validation and favourites, scheduled payments (run with a "Run now" button, no automatic scheduler), and money requests including even bill splits.
- **Cards.** Per-account cards with freeze, online/contactless toggles and an adjustable monthly limit.
- **Persistence.** State is saved in `localStorage`, scoped per user (`toss:v3:*` keys; clear them to reset the demo data).
- **Responsive and accessible.** Layouts adapt from mobile to desktop, modals trap focus and close on Escape, and reduced-motion preferences are respected. Light and dark colour schemes are supported.

## Demo accounts

| User | Email | Password |
|------|-------|----------|
| Maya Chen | `maya@toss.demo` | `maya123` |
| Lucas Martin | `lucas@toss.demo` | `lucas123` |
| Amelia Rossi | `amelia@toss.demo` | `amelia123` |

## Getting started

```bash
npm install
npm run dev
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests with Vitest |

## Exchange rates

Totals and spending conversions use live rates from the [Frankfurter API](https://frankfurter.dev). Rates are cached locally and validated before use. If the request fails, the balance and spending views show an error with a retry action.

## Project structure

```text
src/
  App.tsx            Login gate and dashboard
  data.ts            Demo users, accounts, spendings, notifications, recipients
  types.ts           Shared types
  components/        UI components and their CSS; each tab is a folder with an index.ts
                     (ActivityTab, InsightsTab, BudgetsTab, PaymentsTab, CardsTab)
  context/           Bank context and provider (state for the signed-in user)
  hooks/             State, persistence, exchange-rate and totals hooks
  lib/               Currency, date, spending, transfer, storage helpers and tests
  styles/            Reset and global styles
```

## Tech stack

React 19, TypeScript, Vite, [lucide-react](https://lucide.dev) icons, Vitest and ESLint.
