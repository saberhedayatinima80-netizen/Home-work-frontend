import type { ImportedTransaction, Transaction, User } from "./types";

type WalletNameFn = (id: string) => string;

export function toCSV(txs: Transaction[], walletName: WalletNameFn = () => ""): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = txs.map((t) =>
    [t.title, t.amount, t.type, t.category, t.date, walletName(t.walletId)].map(esc).join(",")
  );
  return ["title,amount,type,category,date,wallet", ...rows].join("\n");
}

function parseLine(line: string): string[] {
  const out: string[] = [];
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

export function fromCSV(text: string): ImportedTransaction[] {
  return text
    .split(/\r?\n/)
    .slice(1)
    .filter((l) => l.trim())
    .map(parseLine)
    .filter((c) => c.length >= 5 && !isNaN(Number(c[1])))
    .map(([title = "", amount = "0", type = "", category = "", date = "", walletName = ""]): ImportedTransaction => ({
      id: crypto.randomUUID(),
      title,
      amount: Number(amount),
      type: type === "income" ? "income" : "expense",
      category,
      date,
      walletName,
    }));
}

export function download(name: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ESC[c] ?? c);

// PDF export: opens a printable report; choose "Save as PDF" in the print dialog
export function printReport(user: User, txs: Transaction[], walletName: WalletNameFn): void {
  const rows = txs
    .map(
      (t) =>
        `<tr><td>${esc(t.date)}</td><td>${esc(t.title)}</td><td>${esc(t.category)}</td><td>${esc(
          walletName(t.walletId)
        )}</td><td style="text-align:right;color:${t.type === "income" ? "#0a8" : "#c33"}">${
          t.type === "income" ? "+" : "-"
        }${t.amount.toFixed(2)}</td></tr>`
    )
    .join("");
  const w = window.open("", "_blank");
  if (!w) {
    alert("Please allow pop-ups to export PDF.");
    return;
  }
  w.document.write(
    `<title>Transactions report</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left}</style><h2>Transactions - ${esc(
      user.name
    )}</h2><table><tr><th>Date</th><th>Title</th><th>Category</th><th>Wallet</th><th style="text-align:right">Amount</th></tr>${rows}</table>`
  );
  w.document.close();
  w.print();
}
