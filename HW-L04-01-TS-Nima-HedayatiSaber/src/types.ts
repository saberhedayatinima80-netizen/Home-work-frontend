export type TxType = "income" | "expense";
export type Period = "once" | "weekly" | "monthly" | "yearly";
export type WalletKind = "Bank account" | "Cash" | "Credit card";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TxType;
  category: string;
  date: string; // YYYY-MM-DD
  walletId: string;
}

// a transaction parsed from CSV before it is attached to a wallet
export type ImportedTransaction = Omit<Transaction, "walletId"> & { walletName: string };

export interface Wallet {
  id: string;
  name: string;
  kind: WalletKind;
  initial: number;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
}

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  period: Period;
  category: string;
  walletId: string;
}

export interface FinanceData {
  wallets: Wallet[];
  transactions: Transaction[];
  transfers: Transfer[];
  categories: string[];
  reminders: Reminder[];
}

export interface FinanceState extends FinanceData {
  userId: string | null;
}
