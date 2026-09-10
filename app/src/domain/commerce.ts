import type { Product, CartLine } from "./types.ts";
export const money = (cents: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
    cents / 100,
  );
export function scaled(value: string | number, precision = 6) {
  const [whole, frac = ""] = String(value).split(".");
  return (
    Number(whole) * 10 ** precision +
    Number(frac.padEnd(precision, "0").slice(0, precision))
  );
}
export function unitMicros(p: Product, q = 1) {
  let value = p.price || "0";
  if (p.purchasable)
    for (const t of p.tiers)
      if (q >= t.min && (t.max === null || q <= t.max)) value = t.price;
  return scaled(value);
}
export const unitCents = (p: Product, q = 1) =>
  Math.round(unitMicros(p, q) / 10000);
export function lineTotals(p: Product, q: number) {
  const ex = Math.round((unitMicros(p, q) * q) / 10000),
    tax = Math.round(ex / 10);
  return { ex, tax, inc: ex + tax };
}
export function availability(p: Product) {
  return p.stock === null
    ? "unknown"
    : p.stock === 0
      ? "out"
      : p.stock < 5
        ? "low"
        : "in";
}
export function quantityError(p: Product, q: number) {
  if (!Number.isSafeInteger(q) || q < 1 || q > 99999)
    return "Enter a whole quantity from 1 to 99,999.";
  if (!p.purchasable) return "Please enquire to confirm this product’s price.";
  if (p.stock !== null && !p.backorder && q > p.stock)
    return `Only ${p.stock} available. Backorders are not available.`;
  return "";
}
export function addLine(lines: CartLine[], p: Product, q: number) {
  const inputError = quantityError(p, q);
  if (inputError) return { lines, error: inputError };
  const existing = lines.find((l) => l.sku === p.sku);
  const quantity = (existing?.quantity || 0) + q;
  const error = quantityError(p, quantity);
  if (error) return { lines, error };
  return {
    lines: [...lines.filter((l) => l.sku !== p.sku), { sku: p.sku, quantity }],
    error: "",
  };
}

export function nextQuantityTier(p: Product, quantity: number) {
  return p.tiers.find(
    (t) =>
      t.min > quantity &&
      scaled(t.price) < unitMicros(p, quantity) &&
      !quantityError(p, t.min),
  );
}
