# Expense Tracker (React + Redux Toolkit + TypeScript + Tailwind CSS)

Homework L03-04 - the Expense Tracker converted to **TypeScript**, styled with **Tailwind CSS**.

## TypeScript conversion
- All `.jsx` -> `.tsx`, all `.js` -> `.ts` (including `vite.config.ts`)
- `tsconfig.json` with `strict: true`; `npm run build` runs `tsc` before Vite
- Shared domain types in `src/types.ts` (`Transaction`, `Wallet`, `Transfer`, `Reminder`, `User`, ...)
- Typed Redux hooks (`useAppDispatch`, `useAppSelector`) in `src/store/hooks.ts`

## Styling
- Tailwind CSS v4 (`@tailwindcss/vite`). Layout uses utility classes in the components;
  reusable pieces (`.card`, `.btn`, `.nav`, ...) are defined with `@apply` in `src/styles.css`.
- Responsive (sidebar collapses to a top menu on small screens)

## Features
- Transactions with `title`, `amount`, `type`, `date`, `category` (+ wallet); custom categories
- Sign up / sign in (LocalStorage); each user has their own private data
- Search (title / amount) and filter (category, wallet, date range)
- Pie chart (expenses by category) and line chart (income vs expense over time)
- Multi-wallet (bank account, cash, credit card) with transfers
- Recurring reminders (weekly / monthly / yearly) with due-soon alerts and "Mark paid"
- Export CSV / PDF (print dialog), import CSV

## State management
- Redux Toolkit (`src/store`) for all financial data, persisted per user in LocalStorage
- Context API only for authentication (`src/context/AuthContext.tsx`)

## Run
```bash
npm install
npm run dev
```
