import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../store/financeSlice.js";
import { fmt, today } from "../format.js";

const PERIODS = ["once", "weekly", "monthly", "yearly"];

export function dueReminders(reminders, days = 3) {
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  const lim = `${limit.getFullYear()}-${String(limit.getMonth() + 1).padStart(2, "0")}-${String(limit.getDate()).padStart(2, "0")}`;
  return reminders.filter((r) => r.dueDate <= lim);
}

export function ReminderList({ reminders, wallets }) {
  const dispatch = useDispatch();
  const t = today();
  if (!reminders.length) return <p className="muted">No reminders.</p>;
  const sorted = [...reminders].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return (
    <ul className="list">
      {sorted.map((r) => (
        <li key={r.id}>
          <div>
            <strong>{r.title}</strong>
            <div className={r.dueDate < t ? "neg" : "muted"}>
              {r.dueDate < t ? "Overdue · " : "Due "}
              {r.dueDate} · {r.period} · {wallets.find((w) => w.id === r.walletId)?.name}
            </div>
          </div>
          <span className="neg">{fmt(r.amount)}</span>
          <button className="btn small" onClick={() => dispatch(actions.payReminder({ id: r.id, date: today() }))}>Mark paid</button>
          <button className="icon" title="Delete" onClick={() => dispatch(actions.deleteReminder(r.id))}>✕</button>
        </li>
      ))}
    </ul>
  );
}

export default function Reminders() {
  const dispatch = useDispatch();
  const { reminders, wallets, categories } = useSelector((s) => s.finance);
  const [f, setF] = useState({ title: "", amount: "", dueDate: today(), period: "monthly", category: "Bills", walletId: wallets[0].id });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    dispatch(actions.addReminder({ ...f, id: crypto.randomUUID(), amount: Number(f.amount) }));
    setF({ ...f, title: "", amount: "" });
  };

  return (
    <section className="grid">
      <div className="card">
        <h3>New reminder (rent, internet, …)</h3>
        <form className="form" onSubmit={submit}>
          <input placeholder="Title" value={f.title} onChange={set("title")} required />
          <input type="number" min="0.01" step="0.01" placeholder="Amount" value={f.amount} onChange={set("amount")} required />
          <input type="date" value={f.dueDate} onChange={set("dueDate")} required />
          <select value={f.period} onChange={set("period")}>
            {PERIODS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select value={f.category} onChange={set("category")}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={f.walletId} onChange={set("walletId")}>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <button className="btn primary">Add reminder</button>
        </form>
      </div>
      <div className="card">
        <h3>Upcoming payments</h3>
        <ReminderList reminders={reminders} wallets={wallets} />
      </div>
    </section>
  );
}
