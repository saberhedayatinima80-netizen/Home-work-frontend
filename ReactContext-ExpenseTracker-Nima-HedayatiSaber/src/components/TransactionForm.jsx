import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext.jsx";

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm() {
  const { categories, dispatch } = useExpenses();
  const [f, setF] = useState({ title: "", amount: "", type: "expense", category: categories[0], date: today() });
  const [newCat, setNewCat] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    dispatch({ type: "ADD_TX", tx: { ...f, id: crypto.randomUUID(), amount: Number(f.amount) } });
    setF({ ...f, title: "", amount: "" });
  };

  const addCat = () => {
    const name = newCat.trim();
    if (!name) return;
    dispatch({ type: "ADD_CATEGORY", name });
    setF({ ...f, category: name });
    setNewCat("");
  };

  return (
    <form className="form" onSubmit={submit}>
      <input placeholder="Title" value={f.title} onChange={set("title")} required />
      <input type="number" min="0.01" step="0.01" placeholder="Amount" value={f.amount} onChange={set("amount")} required />
      <select value={f.type} onChange={set("type")}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select value={f.category} onChange={set("category")}>
        {categories.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input type="date" value={f.date} onChange={set("date")} required />
      <div className="row">
        <input placeholder="Custom category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
        <button type="button" className="btn" onClick={addCat}>+ Add</button>
      </div>
      <button className="btn primary">Add transaction</button>
    </form>
  );
}
