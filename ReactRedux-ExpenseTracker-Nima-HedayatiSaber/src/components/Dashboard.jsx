import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext.jsx";
import { walletBalance } from "../store/financeSlice.js";
import { fmt } from "../format.js";
import { PieChart, LineChart, Gauge } from "./Charts.jsx";
import Transactions, { TransactionList } from "./Transactions.jsx";
import Wallets from "./Wallets.jsx";
import Reminders, { ReminderList, dueReminders } from "./Reminders.jsx";

const NAV = [
  { id: "overview", label: "Dashboard", icon: "🏠" },
  { id: "transactions", label: "Transactions", icon: "🧾" },
  { id: "wallets", label: "Wallets", icon: "👛" },
  { id: "reminders", label: "Reminders", icon: "⏰" },
];

function Overview({ go }) {
  const { user } = useAuth();
  const finance = useSelector((s) => s.finance);
  const { transactions, wallets, reminders } = finance;

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const total = wallets.reduce((s, w) => s + walletBalance(finance, w.id), 0);
  const spent = income ? Math.min(100, Math.round((expense / income) * 100)) : expense ? 100 : 0;
  const due = useMemo(() => dueReminders(reminders), [reminders]);

  return (
    <>
      <section className="top-grid">
        <div className="card welcome">
          <div>
            <h2>Welcome back!</h2>
            <p>Nice to see you, {user.name}!</p>
          </div>
          <button className="link light" onClick={() => go("transactions")}>Add a transaction →</button>
        </div>

        <div className="card">
          <h3>Budget overview</h3>
          <p className="muted">Hello, {user.name}! Here is how much of your income you have spent.</p>
          <Gauge value={spent} label="Income spent" sub={`${fmt(expense)} of ${fmt(income)}`} />
          <div className="tiles">
            <div className="tile"><span className="muted">Income</span><b className="pos">{fmt(income)}</b></div>
            <div className="tile"><span className="muted">Expenses</span><b className="neg">{fmt(expense)}</b></div>
            <div className="tile"><span className="muted">Net worth</span><b>{fmt(total)}</b></div>
            <div className="tile"><span className="muted">Wallets</span><b>{wallets.length}</b></div>
          </div>
        </div>

        <div className="card">
          <h3>Profile information</h3>
          <p className="muted">Your account is stored locally in this browser. Each user only sees their own wallets and transactions.</p>
          <hr />
          <dl className="info">
            <dt>Full name:</dt><dd>{user.name}</dd>
            <dt>Email:</dt><dd>{user.email}</dd>
            <dt>Wallets:</dt><dd>{wallets.map((w) => w.name).join(", ")}</dd>
            <dt>Transactions:</dt><dd>{transactions.length}</dd>
          </dl>
        </div>
      </section>

      <section className="grid">
        <div className="card"><h3>Expenses by category</h3><PieChart transactions={transactions} /></div>
        <div className="card"><h3>Income vs expense over time</h3><LineChart transactions={transactions} /></div>
      </section>

      <section className="grid">
        <div className="card">
          <h3>Payment reminders {due.length > 0 && <span className="badge">{due.length} due soon</span>}</h3>
          <ReminderList reminders={due.length ? due : reminders.slice(0, 3)} wallets={wallets} />
        </div>
        <div className="card">
          <h3>Recent transactions</h3>
          <TransactionList transactions={transactions} limit={5} />
        </div>
      </section>
    </>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const reminders = useSelector((s) => s.finance.reminders);
  const [page, setPage] = useState("overview");
  const dueCount = dueReminders(reminders).length;
  const current = NAV.find((n) => n.id === page);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand"><span className="logo">$</span> EXPENSE TRACKER</div>
        <hr />
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={`nav ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="ico">{n.icon}</span>
              {n.label}
              {n.id === "reminders" && dueCount > 0 && <span className="badge">{dueCount}</span>}
            </button>
          ))}
          <div className="section">ACCOUNT</div>
          <button className="nav" onClick={logout}>
            <span className="ico">🚪</span>Sign out
          </button>
        </nav>
        <div className="help">
          <span className="logo">?</span>
          <strong>Need help?</strong>
          <span>Add expenses, wallets and reminders from the menu.</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="muted">Pages / {current.label}</div>
            <h1>{current.label}</h1>
          </div>
          <div className="user"><span className="avatar">{user.name[0]?.toUpperCase()}</span>{user.name}</div>
        </header>

        {page === "overview" && <Overview go={setPage} />}
        {page === "transactions" && <Transactions />}
        {page === "wallets" && <Wallets />}
        {page === "reminders" && <Reminders />}
      </main>
    </div>
  );
}
