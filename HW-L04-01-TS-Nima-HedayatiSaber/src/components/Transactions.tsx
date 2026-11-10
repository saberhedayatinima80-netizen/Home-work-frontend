import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { actions } from "../store/financeSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useAuth } from "../context/AuthContext";
import { fmt, today } from "../format";
import { toCSV, fromCSV, download, printReport } from "../csv";
import type { Transaction, TxType } from "../types";

interface TxFormState {
  title: string;
  amount: string;
  type: TxType;
  category: string;
  date: string;
  walletId: string;
}

function TransactionForm() {
  const dispatch = useAppDispatch();
  const { categories, wallets } = useAppSelector((s) => s.finance);
  const [f, setF] = useState<TxFormState>({
    title: "",
    amount: "",
    type: "expense",
    category: categories[0] ?? "Other",
    date: today(),
    walletId: wallets[0]?.id ?? "",
  });
  const [newCat, setNewCat] = useState("");
  const set =
    (k: keyof TxFormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(actions.addTx({ ...f, id: crypto.randomUUID(), amount: Number(f.amount) }));
    setF({ ...f, title: "", amount: "" });
  };

  const addCat = () => {
    const name = newCat.trim();
    if (!name) return;
    dispatch(actions.addCategory(name));
    setF({ ...f, category: name });
    setNewCat("");
  };

  return (
    <form className="flex flex-col gap-2.5" onSubmit={submit}>
      <input placeholder="Title" value={f.title} onChange={set("title")} required />
      <input type="number" min="0.01" step="0.01" placeholder="Amount" value={f.amount} onChange={set("amount")} required />
      <select value={f.type} onChange={set("type")}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select value={f.walletId} onChange={set("walletId")}>
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      <select value={f.category} onChange={set("category")}>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input type="date" value={f.date} onChange={set("date")} required />
      <div className="flex items-center gap-2">
        <input placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
        <button type="button" className="btn whitespace-nowrap" onClick={addCat}>+ Add</button>
      </div>
      <button className="btn primary">Add transaction</button>
    </form>
  );
}

interface ListProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionList({ transactions, limit }: ListProps) {
  const dispatch = useAppDispatch();
  const wallets = useAppSelector((s) => s.finance.wallets);
  if (!transactions.length) return <p className="muted">No transactions yet.</p>;
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit ?? Infinity);
  return (
    <ul className="list">
      {sorted.map((t) => (
        <li key={t.id}>
          <div>
            <strong>{t.title}</strong>
            <div className="muted">
              {t.category} · {wallets.find((w) => w.id === t.walletId)?.name} · {t.date}
            </div>
          </div>
          <span className={t.type === "income" ? "pos" : "neg"}>
            {t.type === "income" ? "+" : "-"}
            {fmt(t.amount)}
          </span>
          <button className="icon" title="Delete" onClick={() => dispatch(actions.deleteTx(t.id))}>✕</button>
        </li>
      ))}
    </ul>
  );
}

export default function Transactions() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { transactions, categories, wallets } = useAppSelector((s) => s.finance);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [wallet, setWallet] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const term = q.trim().toLowerCase();
        if (term && !t.title.toLowerCase().includes(term) && !String(t.amount).includes(term)) return false;
        if (cat && t.category !== cat) return false;
        if (wallet && t.walletId !== wallet) return false;
        if (from && t.date < from) return false;
        if (to && t.date > to) return false;
        return true;
      }),
    [transactions, q, cat, wallet, from, to]
  );

  const walletName = (id: string) => wallets.find((w) => w.id === id)?.name ?? "";

  const importCSV = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) dispatch(actions.importTx(fromCSV(await file.text())));
    e.target.value = "";
  };

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="card">
        <h3>Add transaction</h3>
        <TransactionForm />
      </div>
      <div className="card">
        <h3>Transactions ({filtered.length})</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
          <input placeholder="Search title or amount" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={wallet} onChange={(e) => setWallet(e.target.value)}>
            <option value="">All wallets</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To" />
        </div>
        <div className="my-2.5 flex items-center gap-2">
          <button className="btn" onClick={() => download("transactions.csv", toCSV(filtered, walletName), "text/csv")}>⬇ CSV</button>
          <button className="btn" onClick={() => user && printReport(user, filtered, walletName)}>⬇ PDF</button>
          <label className="btn">
            ⬆ Import CSV
            <input type="file" accept=".csv" hidden onChange={importCSV} />
          </label>
        </div>
        <TransactionList transactions={filtered} />
      </div>
    </section>
  );
}
