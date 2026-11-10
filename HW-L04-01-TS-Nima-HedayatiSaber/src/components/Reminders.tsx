import { useState, type ChangeEvent, type FormEvent } from "react";
import { actions } from "../store/financeSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fmt, today, toISO } from "../format";
import type { Period, Reminder, Wallet } from "../types";

const PERIODS: Period[] = ["once", "weekly", "monthly", "yearly"];

// reminders that are overdue or due within the next `days` days
export function dueReminders(reminders: Reminder[], days = 3): Reminder[] {
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  const lim = toISO(limit);
  return reminders.filter((r) => r.dueDate <= lim);
}

export function ReminderList({ reminders, wallets }: { reminders: Reminder[]; wallets: Wallet[] }) {
  const dispatch = useAppDispatch();
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
          <button className="btn small" onClick={() => dispatch(actions.payReminder({ id: r.id, date: today() }))}>
            Mark paid
          </button>
          <button className="icon" title="Delete" onClick={() => dispatch(actions.deleteReminder(r.id))}>✕</button>
        </li>
      ))}
    </ul>
  );
}

interface ReminderForm {
  title: string;
  amount: string;
  dueDate: string;
  period: Period;
  category: string;
  walletId: string;
}

export default function Reminders() {
  const dispatch = useAppDispatch();
  const { reminders, wallets, categories } = useAppSelector((s) => s.finance);
  const [f, setF] = useState<ReminderForm>({
    title: "",
    amount: "",
    dueDate: today(),
    period: "monthly",
    category: categories.includes("Bills") ? "Bills" : (categories[0] ?? "Other"),
    walletId: wallets[0]?.id ?? "",
  });
  const set =
    (k: keyof ReminderForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(actions.addReminder({ ...f, id: crypto.randomUUID(), amount: Number(f.amount) }));
    setF({ ...f, title: "", amount: "" });
  };

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="card">
        <h3>New reminder (rent, internet, …)</h3>
        <form className="flex flex-col gap-2.5" onSubmit={submit}>
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
