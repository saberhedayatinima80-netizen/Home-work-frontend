export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const today = (): string => toISO(new Date());

export const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
};
