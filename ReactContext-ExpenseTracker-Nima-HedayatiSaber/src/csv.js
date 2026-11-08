export function toCSV(txs) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = txs.map((t) => [t.title, t.amount, t.type, t.category, t.date].map(esc).join(","));
  return ["title,amount,type,category,date", ...rows].join("\n");
}

function parseLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

export function fromCSV(text) {
  return text
    .split(/\r?\n/)
    .slice(1)
    .filter((l) => l.trim())
    .map(parseLine)
    .filter((c) => c.length >= 5 && !isNaN(Number(c[1])))
    .map(([title, amount, type, category, date]) => ({
      id: crypto.randomUUID(),
      title,
      amount: Number(amount),
      type: type === "income" ? "income" : "expense",
      category,
      date,
    }));
}
