const COLORS = ["#6c5ce7", "#00b894", "#fdcb6e", "#e17055", "#0984e3", "#e84393", "#00cec9", "#a29bfe"];

export function PieChart({ transactions }) {
  const totals = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
  const entries = Object.entries(totals);
  const sum = entries.reduce((s, [, v]) => s + v, 0);
  if (!sum) return <p className="muted">Add expenses to see the chart.</p>;

  let angle = -Math.PI / 2;
  const slices = entries.map(([name, v], i) => {
    const a = (v / sum) * Math.PI * 2;
    const x1 = 100 + 90 * Math.cos(angle);
    const y1 = 100 + 90 * Math.sin(angle);
    angle += a;
    const x2 = 100 + 90 * Math.cos(angle);
    const y2 = 100 + 90 * Math.sin(angle);
    const d =
      entries.length === 1
        ? "M100 10 A90 90 0 1 1 99.99 10 Z"
        : `M100 100 L${x1} ${y1} A90 90 0 ${a > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
    return { name, v, d, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="pie">
      <svg viewBox="0 0 200 200" width="180" height="180">
        {slices.map((s) => (
          <path key={s.name} d={s.d} fill={s.color} stroke="#0b1437" strokeWidth="2" />
        ))}
      </svg>
      <ul className="legend">
        {slices.map((s) => (
          <li key={s.name}>
            <i style={{ background: s.color }} />
            {s.name} — {((s.v / sum) * 100).toFixed(0)}%
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LineChart({ transactions }) {
  const byDate = {};
  transactions.forEach((t) => {
    byDate[t.date] ??= { income: 0, expense: 0 };
    byDate[t.date][t.type] += t.amount;
  });
  const dates = Object.keys(byDate).sort();
  if (dates.length < 1) return <p className="muted">Add transactions to see the trend.</p>;

  const W = 400;
  const H = 180;
  const P = 24;
  const max = Math.max(1, ...dates.flatMap((d) => [byDate[d].income, byDate[d].expense]));
  const x = (i) => (dates.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (dates.length - 1));
  const y = (v) => H - P - (v / max) * (H - 2 * P);
  const path = (k) => dates.map((d, i) => `${i ? "L" : "M"}${x(i)} ${y(byDate[d][k])}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
        <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#444" />
        <path d={path("income")} fill="none" stroke="#00b894" strokeWidth="2.5" />
        <path d={path("expense")} fill="none" stroke="#e17055" strokeWidth="2.5" />
        {dates.map((d, i) => (
          <g key={d}>
            <circle cx={x(i)} cy={y(byDate[d].income)} r="3.5" fill="#00b894" />
            <circle cx={x(i)} cy={y(byDate[d].expense)} r="3.5" fill="#e17055" />
          </g>
        ))}
        <text x={P} y={H - 6} fill="#888" fontSize="10">{dates[0]}</text>
        <text x={W - P} y={H - 6} fill="#888" fontSize="10" textAnchor="end">{dates[dates.length - 1]}</text>
      </svg>
      <ul className="legend inline">
        <li><i style={{ background: "#00b894" }} />Income</li>
        <li><i style={{ background: "#e17055" }} />Expense</li>
      </ul>
    </div>
  );
}

export function Gauge({ value, label, sub }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div className="gauge">
      <svg viewBox="0 0 140 140" width="170" height="170">
        <defs>
          <linearGradient id="gg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#22d3a0" />
            <stop offset="1" stopColor="#0075ff" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={R} fill="none" stroke={value > 90 ? "#e17055" : "url(#gg)"} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${(C * value) / 100} ${C}`} transform="rotate(-90 70 70)"
        />
        <text x="70" y="72" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="700">{value}%</text>
        <text x="70" y="90" textAnchor="middle" fill="#9aa" fontSize="9">{label}</text>
      </svg>
      <span className="muted">{sub}</span>
    </div>
  );
}
