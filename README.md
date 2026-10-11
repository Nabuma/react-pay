# Toss

Toss is a personal-finance demo built with React, TypeScript and Vite. You sign in as one of several fake users and see that user's bank accounts, a total balance converted to euros, and a spending history. You can also send money from an account to a recipient.

It is a front-end-only demo. There is no backend, and the data and credentials live in the client, so it is **not** suitable for protecting real accounts.

## Features

- **Login page.** The first screen is a sign-in form. A list of demo profiles fills in the credentials for you. The signed-in user is remembered across reloads, and you can sign out from the header.
- **Multiple demo users.** Each user has their own accounts, spendings and notifications.
- **Balance hero.** Shows the total across all accounts, converted to EUR, with loading and error/retry states.
- **Accounts card.** Lists each account with its balance in its own currency (EUR, KRW, GBP, USD) and a **Send** button.
- **Spendings card.** Shows the latest month's total, with an up/down badge compared with the previous month.
- **Spending activity modal.** Shows a total and transaction count, then transactions grouped by month, each with a category icon (home for rent, cart for groceries, plane for travel, and so on). Foreign-currency amounts also show their euro value.
- **Transfers.** A three-step flow (choose recipient and amount, review, confirm). Input is validated, and a successful transfer lowers the account balance and adds a spending and a notification.
- **Notifications.** A bell popover with an unread indicator. It stays inside the viewport on small screens.
- **Persistence.** State is saved in `localStorage`, scoped per user.
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
  components/        UI components and their CSS
  context/           Bank context and provider (state for the signed-in user)
  hooks/             State, persistence, exchange-rate and totals hooks
  lib/               Currency, date, spending, transfer, storage helpers and tests
  styles/            Reset and global styles
```

## Tech stack

React 19, TypeScript, Vite, [lucide-react](https://lucide.dev) icons, Vitest and ESLint.
