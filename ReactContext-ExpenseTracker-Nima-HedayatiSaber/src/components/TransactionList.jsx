import { useExpenses } from "../context/ExpenseContext.jsx";

export default function TransactionList({ transactions }) {
  const { dispatch } = useExpenses();
  if (!transactions.length) return <p className="muted">No transactions yet.</p>;
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <ul className="list">
      {sorted.map((t) => (
        <li key={t.id}>
          <div>
            <strong>{t.title}</strong>
            <div className="muted">{t.category} · {t.date}</div>
          </div>
          <span className={t.type === "income" ? "pos" : "neg"}>
            {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
          </span>
          <button className="icon" title="Delete" onClick={() => dispatch({ type: "DELETE_TX", id: t.id })}>✕</button>
        </li>
      ))}
    </ul>
  );
}
