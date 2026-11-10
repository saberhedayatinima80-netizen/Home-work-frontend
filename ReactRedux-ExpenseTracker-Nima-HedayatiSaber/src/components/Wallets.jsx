import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions, walletBalance } from "../store/financeSlice.js";
import { fmt, today } from "../format.js";

const KINDS = ["Bank account", "Cash", "Credit card"];

export default function Wallets() {
  const dispatch = useDispatch();
  const finance = useSelector((s) => s.finance);
  const { wallets, transfers } = finance;
  const [w, setW] = useState({ name: "", kind: KINDS[0], initial: "" });
  const [t, setT] = useState({ from: wallets[0].id, to: wallets[1]?.id || "", amount: "" });
  const [err, setErr] = useState("");

  const addWallet = (e) => {
    e.preventDefault();
    dispatch(actions.addWallet({ id: crypto.randomUUID(), name: w.name.trim(), kind: w.kind, initial: Number(w.initial) || 0 }));
    setW({ name: "", kind: KINDS[0], initial: "" });
  };

  const doTransfer = (e) => {
    e.preventDefault();
    const amount = Number(t.amount);
    if (!t.from || !t.to || t.from === t.to) return setErr("Choose two different wallets");
    if (amount > walletBalance(finance, t.from)) return setErr("Not enough balance in the source wallet");
    setErr("");
    dispatch(actions.transfer({ id: crypto.randomUUID(), from: t.from, to: t.to, amount, date: today() }));
    setT({ ...t, amount: "" });
  };

  const name = (id) => wallets.find((x) => x.id === id)?.name || "(deleted)";

  return (
    <>
      <section className="wallets">
        {wallets.map((x, i) => (
          <div key={x.id} className={`card wallet g${i % 4}`}>
            <span className="muted">{x.kind}</span>
            <h3>{x.name}</h3>
            <b>{fmt(walletBalance(finance, x.id))}</b>
            {wallets.length > 1 && (
              <button className="icon" title="Delete wallet" onClick={() => confirm(`Delete "${x.name}" and its transactions?`) && dispatch(actions.deleteWallet(x.id))}>✕</button>
            )}
          </div>
        ))}
      </section>

      <section className="grid">
        <div className="card">
          <h3>Add wallet</h3>
          <form className="form" onSubmit={addWallet}>
            <input placeholder="Name (e.g. Main bank)" value={w.name} onChange={(e) => setW({ ...w, name: e.target.value })} required />
            <select value={w.kind} onChange={(e) => setW({ ...w, kind: e.target.value })}>
              {KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <input type="number" step="0.01" placeholder="Opening balance" value={w.initial} onChange={(e) => setW({ ...w, initial: e.target.value })} />
            <button className="btn primary">Add wallet</button>
          </form>
        </div>

        <div className="card">
          <h3>Transfer between wallets</h3>
          <form className="form" onSubmit={doTransfer}>
            <select value={t.from} onChange={(e) => setT({ ...t, from: e.target.value })}>
              {wallets.map((x) => (
                <option key={x.id} value={x.id}>From: {x.name}</option>
              ))}
            </select>
            <select value={t.to} onChange={(e) => setT({ ...t, to: e.target.value })}>
              <option value="">To…</option>
              {wallets.map((x) => (
                <option key={x.id} value={x.id}>To: {x.name}</option>
              ))}
            </select>
            <input type="number" min="0.01" step="0.01" placeholder="Amount" value={t.amount} onChange={(e) => setT({ ...t, amount: e.target.value })} required />
            {err && <div className="error">{err}</div>}
            <button className="btn primary">Transfer</button>
          </form>
          <ul className="list">
            {transfers.slice(0, 5).map((x) => (
              <li key={x.id}>
                <div>
                  <strong>{name(x.from)} → {name(x.to)}</strong>
                  <div className="muted">{x.date}</div>
                </div>
                <span>{fmt(x.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
