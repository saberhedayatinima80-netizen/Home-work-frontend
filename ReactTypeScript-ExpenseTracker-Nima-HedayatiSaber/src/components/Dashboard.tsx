import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { walletBalance } from "../store/financeSlice";
import { useAppSelector } from "../store/hooks";
import { fmt } from "../format";
import { PieChart, LineChart, Gauge } from "./Charts";
import Transactions, { TransactionList } from "./Transactions";
import Wallets from "./Wallets";
import Reminders, { ReminderList, dueReminders } from "./Reminders";

type Page = "overview" | "transactions" | "wallets" | "reminders";

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: "overview", label: "Dashboard", icon: "🏠" },
  { id: "transactions", label: "Transactions", icon: "🧾" },
  { id: "wallets", label: "Wallets", icon: "👛" },
  { id: "reminders", label: "Reminders", icon: "⏰" },
];

function Overview({ go }: { go: (p: Page) => void }) {
  const { user } = useAuth();
  const finance = useAppSelector((s) => s.finance);
  const { transactions, wallets, reminders } = finance;

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const total = wallets.reduce((s, w) => s + walletBalance(finance, w.id), 0);
  const spent = income ? Math.min(100, Math.round((expense / income) * 100)) : expense ? 100 : 0;
  const due = useMemo(() => dueReminders(reminders), [reminders]);

  if (!user) return null;

  return (
    <>
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1.2fr_1fr]">
        <div className="card welcome flex min-h-72 flex-col justify-between">
          <div>
            <h2>Welcome back!</h2>
            <p className="m-0 opacity-85">Nice to see you, {user.name}!</p>
          </div>
          <button className="link light" onClick={() => go("transactions")}>Add a transaction →</button>
        </div>

        <div className="card">
          <h3>Budget overview</h3>
          <p className="muted">Hello, {user.name}! Here is how much of your income you have spent.</p>
          <Gauge value={spent} label="Income spent" sub={`${fmt(expense)} of ${fmt(income)}`} />
          <div className="grid grid-cols-2 gap-3">
            <div className="tile"><span className="muted">Income</span><b className="pos">{fmt(income)}</b></div>
            <div className="tile"><span className="muted">Expenses</span><b className="neg">{fmt(expense)}</b></div>
            <div className="tile"><span className="muted">Net worth</span><b>{fmt(total)}</b></div>
            <div className="tile"><span className="muted">Wallets</span><b>{wallets.length}</b></div>
          </div>
        </div>

        <div className="card md:col-span-2 xl:col-span-1">
          <h3>Profile information</h3>
          <p className="muted">
            Your account is stored locally in this browser. Each user only sees their own wallets and transactions.
          </p>
          <hr />
          <dl className="info">
            <dt>Full name:</dt><dd>{user.name}</dd>
            <dt>Email:</dt><dd>{user.email}</dd>
            <dt>Wallets:</dt><dd>{wallets.map((w) => w.name).join(", ")}</dd>
            <dt>Transactions:</dt><dd>{transactions.length}</dd>
          </dl>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="card"><h3>Expenses by category</h3><PieChart transactions={transactions} /></div>
        <div className="card"><h3>Income vs expense over time</h3><LineChart transactions={transactions} /></div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
  const reminders = useAppSelector((s) => s.finance.reminders);
  const [page, setPage] = useState<Page>("overview");
  const dueCount = dueReminders(reminders).length;
  const currentLabel = NAV.find((n) => n.id === page)?.label ?? "";

  if (!user) return null;

  return (
    <div className="grid min-h-screen grid-cols-1 gap-5 p-3 md:grid-cols-[260px_1fr] md:p-5">
      <aside className="sidebar">
        <div className="brand"><span className="logo">$</span> EXPENSE TRACKER</div>
        <hr />
        <nav className="flex flex-row flex-wrap gap-1.5 md:flex-col">
          {NAV.map((n) => (
            <button key={n.id} className={`nav ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="ico">{n.icon}</span>
              {n.label}
              {n.id === "reminders" && dueCount > 0 && <span className="badge">{dueCount}</span>}
            </button>
          ))}
          <div className="mx-3 mb-1 mt-4 hidden text-xs font-bold md:block">ACCOUNT</div>
          <button className="nav" onClick={logout}>
            <span className="ico">🚪</span>Sign out
          </button>
        </nav>
        <div className="help hidden md:flex">
          <span className="logo">?</span>
          <strong>Need help?</strong>
          <span>Add expenses, wallets and reminders from the menu.</span>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <div className="muted">Pages / {currentLabel}</div>
            <h1>{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-2.5 font-semibold">
            <span className="avatar">{user.name[0]?.toUpperCase()}</span>
            {user.name}
          </div>
        </header>

        {page === "overview" && <Overview go={setPage} />}
        {page === "transactions" && <Transactions />}
        {page === "wallets" && <Wallets />}
        {page === "reminders" && <Reminders />}
      </main>
    </div>
  );
}
