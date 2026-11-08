import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useExpenses } from "../context/ExpenseContext.jsx";
import TransactionForm from "./TransactionForm.jsx";
import TransactionList from "./TransactionList.jsx";
import { PieChart, LineChart } from "./Charts.jsx";
import { toCSV, fromCSV } from "../csv.js";

const fmt = (n) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { transactions, categories, dispatch } = useExpenses();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const term = q.trim().toLowerCase();
        if (term && !t.title.toLowerCase().includes(term) && !String(t.amount).includes(term)) return false;
        if (cat && t.category !== cat) return false;
        if (from && t.date < from) return false;
        if (to && t.date > to) return false;
        return true;
      }),
    [transactions, q, cat, from, to]
  );

  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const exportCSV = () => {
    const url = URL.createObjectURL(new Blob([toCSV(transactions)], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (file) dispatch({ type: "IMPORT", txs: fromCSV(await file.text()) });
    e.target.value = "";
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>💸 Tracker</h2>
        <div className="profile">
          <div className="avatar">{user.name[0]?.toUpperCase()}</div>
          <strong>{user.name}</strong>
          <span className="muted">{user.email}</span>
        </div>
        <button className="btn" onClick={exportCSV}>⬇ Export CSV</button>
        <label className="btn">
          ⬆ Import CSV
          <input type="file" accept=".csv" hidden onChange={importCSV} />
        </label>
        <button className="btn danger" onClick={logout}>Log out</button>
      </aside>

      <main className="main">
        <h1>Welcome back, {user.name} 👋</h1>

        <section className="stats">
          <div className="card stat"><span className="muted">Balance</span><b>{fmt(income - expense)}</b></div>
          <div className="card stat green"><span className="muted">Income</span><b>{fmt(income)}</b></div>
          <div className="card stat red"><span className="muted">Expenses</span><b>{fmt(expense)}</b></div>
        </section>

        <section className="grid">
          <div className="card"><h3>Expenses by category</h3><PieChart transactions={filtered} /></div>
          <div className="card"><h3>Income vs expense over time</h3><LineChart transactions={filtered} /></div>
        </section>

        <section className="grid">
          <div className="card"><h3>Add transaction</h3><TransactionForm /></div>
          <div className="card">
            <h3>Transactions</h3>
            <div className="filters">
              <input placeholder="Search title or amount" value={q} onChange={(e) => setQ(e.target.value)} />
              <select value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <TransactionList transactions={filtered} />
          </div>
        </section>
      </main>
    </div>
  );
}
