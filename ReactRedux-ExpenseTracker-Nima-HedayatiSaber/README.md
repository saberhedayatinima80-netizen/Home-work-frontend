# Expense Tracker (React + Redux Toolkit)

Homework L03-04 - Expense Tracker, Vision UI inspired dark dashboard.

## Features
- Add income / expenses (title, amount, date, category, wallet) + custom categories
- Sign up / sign in (LocalStorage); every user has their own private data
- Search (title / amount) and filter (category, wallet, date range)
- Pie chart (expenses by category), line chart (income vs expense over time), budget gauge
- Multi-wallet (bank account, cash, credit card) with transfers between wallets
- Recurring payment reminders (weekly / monthly / yearly) with due-soon alerts and "Mark paid"
- Export CSV / PDF (print dialog), import CSV
- Responsive layout

## State management
- Redux Toolkit (`src/store`) for all financial data, persisted per user in LocalStorage
- Context API only for authentication (`src/context/AuthContext.jsx`)

## Run
```bash
npm install
npm run dev
```
