import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { load } from "../storage";
import { toISO } from "../format";
import type {
  FinanceData,
  FinanceState,
  ImportedTransaction,
  Period,
  Reminder,
  Transaction,
  Transfer,
  Wallet,
} from "../types";

export const DEFAULT_CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Rent", "Salary", "Other"];

const emptyData = (): FinanceData => ({
  wallets: [{ id: crypto.randomUUID(), name: "Cash", kind: "Cash", initial: 0 }],
  transactions: [],
  transfers: [],
  categories: DEFAULT_CATEGORIES,
  reminders: [],
});

export const dataKey = (uid: string): string => `et_redux_${uid}`;

export function nextDue(date: string, period: Period): string {
  const d = new Date(date + "T00:00:00");
  if (period === "weekly") d.setDate(d.getDate() + 7);
  else if (period === "monthly") d.setMonth(d.getMonth() + 1);
  else if (period === "yearly") d.setFullYear(d.getFullYear() + 1);
  return toISO(d);
}

const initialState: FinanceState = { userId: null, ...emptyData() };

const slice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    // load the signed-in user's data (each user has their own data in LocalStorage)
    setUser(_state, { payload: uid }: PayloadAction<string | null>): FinanceState {
      if (!uid) return { userId: null, ...emptyData() };
      return { userId: uid, ...load<FinanceData>(dataKey(uid), emptyData()) };
    },
    addTx(state, { payload }: PayloadAction<Transaction>) {
      state.transactions.unshift(payload);
    },
    deleteTx(state, { payload: id }: PayloadAction<string>) {
      state.transactions = state.transactions.filter((t) => t.id !== id);
    },
    importTx(state, { payload: txs }: PayloadAction<ImportedTransaction[]>) {
      const added: Transaction[] = txs.map(({ walletName, ...t }) => {
        if (t.category && !state.categories.includes(t.category)) state.categories.push(t.category);
        const w = state.wallets.find((x) => x.name === walletName);
        return { ...t, walletId: (w ?? state.wallets[0])?.id ?? "" };
      });
      state.transactions.unshift(...added);
    },
    addCategory(state, { payload: name }: PayloadAction<string>) {
      if (name && !state.categories.includes(name)) state.categories.push(name);
    },
    addWallet(state, { payload }: PayloadAction<Wallet>) {
      state.wallets.push(payload);
    },
    deleteWallet(state, { payload: id }: PayloadAction<string>) {
      if (state.wallets.length < 2) return;
      state.wallets = state.wallets.filter((w) => w.id !== id);
      state.transactions = state.transactions.filter((t) => t.walletId !== id);
      state.transfers = state.transfers.filter((t) => t.from !== id && t.to !== id);
      state.reminders = state.reminders.filter((r) => r.walletId !== id);
    },
    transfer(state, { payload }: PayloadAction<Transfer>) {
      state.transfers.unshift(payload);
    },
    addReminder(state, { payload }: PayloadAction<Reminder>) {
      state.reminders.push(payload);
    },
    deleteReminder(state, { payload: id }: PayloadAction<string>) {
      state.reminders = state.reminders.filter((r) => r.id !== id);
    },
    // mark a reminder as paid: records an expense and moves the due date forward
    payReminder(state, { payload: { id, date } }: PayloadAction<{ id: string; date: string }>) {
      const r = state.reminders.find((x) => x.id === id);
      if (!r) return;
      state.transactions.unshift({
        id: crypto.randomUUID(),
        title: r.title,
        amount: r.amount,
        type: "expense",
        category: r.category,
        date,
        walletId: r.walletId,
      });
      if (r.period === "once") state.reminders = state.reminders.filter((x) => x.id !== id);
      else r.dueDate = nextDue(r.dueDate, r.period);
    },
  },
});

export const actions = slice.actions;
export default slice.reducer;

export const walletBalance = (s: FinanceData, id: string): number => {
  const w = s.wallets.find((x) => x.id === id);
  if (!w) return 0;
  let b = w.initial;
  s.transactions.forEach((t) => {
    if (t.walletId === id) b += t.type === "income" ? t.amount : -t.amount;
  });
  s.transfers.forEach((t) => {
    if (t.from === id) b -= t.amount;
    if (t.to === id) b += t.amount;
  });
  return b;
};
