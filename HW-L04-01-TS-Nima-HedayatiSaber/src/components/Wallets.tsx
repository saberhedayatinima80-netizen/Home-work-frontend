import { useState, type FormEvent } from "react";
import { actions, walletBalance } from "../store/financeSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fmt, today } from "../format";
import type { WalletKind } from "../types";

const KINDS: readonly WalletKind[] = ["Bank account", "Cash", "Credit card"];
const DEFAULT_KIND: WalletKind = "Bank account";
const isKind = (v: string): v is WalletKind => KINDS.some((k) => k === v);
const GRADIENTS = [
  "from-[#0075ff] to-[#1b1464]",
  "from-[#01b574] to-[#0b3d5c]",
  "from-[#6c3df4] to-[#1b1464]",
  "from-[#e84393] to-[#4834d4]",
];

export default function Wallets() {
  const dispatch = useAppDispatch();
  const finance = useAppSelector((s) => s.finance);
  const { wallets, transfers } = finance;
  const [w, setW] = useState<{ name: string; kind: WalletKind; initial: string }>({
    name: "",
    kind: DEFAULT_KIND,
    initial: "",
  });
  const [t, setT] = useState({ from: wallets[0]?.id ?? "", to: wallets[1]?.id ?? "", amount: "" });
  const [err, setErr] = useState("");

  const addWallet = (e: FormEvent) => {
    e.preventDefault();
    dispatch(
      actions.addWallet({ id: crypto.randomUUID(), name: w.name.trim(), kind: w.kind, initial: Number(w.initial) || 0 })
    );
    setW({ name: "", kind: DEFAULT_KIND, initial: "" });
  };

  const doTransfer = (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(t.amount);
    if (!t.from || !t.to || t.from === t.to) return setErr("Choose two different wallets");
    if (amount > walletBalance(finance, t.from)) return setErr("Not enough balance in the source wallet");
    setErr("");
    dispatch(actions.transfer({ id: crypto.randomUUID(), from: t.from, to: t.to, amount, date: today() }));
    setT({ ...t, amount: "" });
  };

  const name = (id: string) => wallets.find((x) => x.id === id)?.name ?? "(deleted)";

  return (
    <>
      <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
        {wallets.map((x, i) => (
          <div key={x.id} className={`card relative flex min-h-32 flex-col gap-1 bg-gradient-to-br ${GRADIENTS[i % 4]}`}>
            <span className="muted">{x.kind}</span>
            <h3>{x.name}</h3>
            <b className="mt-auto text-2xl">{fmt(walletBalance(finance, x.id))}</b>
            {wallets.length > 1 && (
              <button
                className="icon absolute right-3.5 top-3.5"
                title="Delete wallet"
                onClick={() => confirm(`Delete "${x.name}" and its transactions?`) && dispatch(actions.deleteWallet(x.id))}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="card">
          <h3>Add wallet</h3>
          <form className="flex flex-col gap-2.5" onSubmit={addWallet}>
            <input placeholder="Name (e.g. Main bank)" value={w.name} onChange={(e) => setW({ ...w, name: e.target.value })} required />
            <select value={w.kind} onChange={(e) => isKind(e.target.value) && setW({ ...w, kind: e.target.value })}>
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
          <form className="flex flex-col gap-2.5" onSubmit={doTransfer}>
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
            {err && <div className="text-red-400">{err}</div>}
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
