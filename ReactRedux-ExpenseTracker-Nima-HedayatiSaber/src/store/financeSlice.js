import { createSlice } from "@reduxjs/toolkit";
import { load } from "../storage.js";

export const DEFAULT_CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Rent", "Salary", "Other"];

const emptyData = () => ({
  wallets: [{ id: crypto.randomUUID(), name: "Cash", kind: "Cash", initial: 0 }],
  transactions: [],
  transfers: [],
  categories: DEFAULT_CATEGORIES,
  reminders: [],
});

export const dataKey = (uid) => `et_redux_${uid}`;

const pad = (n) => String(n).padStart(2, "0");
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function nextDue(date, period) {
  const d = new Date(date + "T00:00:00");
  if (period === "weekly") d.setDate(d.getDate() + 7);
  else if (period === "monthly") d.setMonth(d.getMonth() + 1);
  else if (period === "yearly") d.setFullYear(d.getFullYear() + 1);
  return toISO(d);
}

const slice = createSlice({
  name: "finance",
  initialState: { userId: null, ...emptyData() },
  reducers: {
    // load the signed-in user's data (each user has their own data in LocalStorage)
    setUser(state, { payload: uid }) {
      if (!uid) return { userId: null, ...emptyData() };
      return { userId: uid, ...load(dataKey(uid), emptyData()) };
    },
    addTx(state, { payload }) {
      state.transactions.unshift(payload);
    },
    deleteTx(state, { payload: id }) {
      state.transactions = state.transactions.filter((t) => t.id !== id);
    },
    importTx(state, { payload: txs }) {
      txs.forEach((t) => {
        if (t.category && !state.categories.includes(t.category)) state.categories.push(t.category);
        const w = state.wallets.find((x) => x.name === t.walletName);
        t.walletId = (w || state.wallets[0]).id;
        delete t.walletName;
      });
      state.transactions.unshift(...txs);
    },
    addCategory(state, { payload: name }) {
      if (name && !state.categories.includes(name)) state.categories.push(name);
    },
    addWallet(state, { payload }) {
      state.wallets.push(payload);
    },
    deleteWallet(state, { payload: id }) {
      if (state.wallets.length < 2) return;
      state.wallets = state.wallets.filter((w) => w.id !== id);
      state.transactions = state.transactions.filter((t) => t.walletId !== id);
      state.transfers = state.transfers.filter((t) => t.from !== id && t.to !== id);
      state.reminders = state.reminders.filter((r) => r.walletId !== id);
    },
    transfer(state, { payload }) {
      state.transfers.unshift(payload);
    },
    addReminder(state, { payload }) {
      state.reminders.push(payload);
    },
    deleteReminder(state, { payload: id }) {
      state.reminders = state.reminders.filter((r) => r.id !== id);
    },
    // mark a reminder as paid: records an expense and moves the due date forward
    payReminder(state, { payload: { id, date } }) {
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

export const walletBalance = (s, id) => {
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
