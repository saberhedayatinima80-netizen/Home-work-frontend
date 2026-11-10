export const fmt = (n: number): string =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const today = (): string => toISO(new Date());
