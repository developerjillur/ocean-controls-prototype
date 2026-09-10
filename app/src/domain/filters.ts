import type { Product, Filters } from "./types.ts";
import { availability } from "./commerce.ts";
export const priceRanges = [
  ["Under $25", 0, 25],
  ["$25 – $100", 25, 100],
  ["$100 – $300", 100, 300],
  ["$300 and over", 300, Infinity],
] as const;
export const dataOptions = [
  ["docs", "Has datasheet"],
  ["spec", "Has specification table"],
  ["tiers", "Has quantity breaks"],
  ["own", "Ocean Controls range"],
];
export function readFilters(s: URLSearchParams): Filters {
  const multi = (k: string) => s.getAll(k).filter(Boolean);
  return {
    q: s.get("q") || "",
    category: s.get("category") || "",
    brands: multi("brand"),
    availability: multi("availability"),
    prices: multi("price"),
    data: multi("data"),
    min: s.get("min") || "",
    max: s.get("max") || "",
    collection: s.get("collection") || "",
    industry: s.get("industry") || "",
    sort: s.get("sort") || "relevance",
    view: s.get("view") || "grid",
    page: Math.max(1, Number(s.get("page")) || 1),
    perPage: [24, 48, 96].includes(Number(s.get("perPage")))
      ? Number(s.get("perPage"))
      : 24,
  };
}
export function priceError(f: Filters) {
  if (
    [f.min, f.max].some(
      (v) => v !== "" && (!Number.isFinite(Number(v)) || Number(v) < 0),
    )
  )
    return "Prices must be positive numbers.";
  if (f.min !== "" && f.max !== "" && Number(f.min) > Number(f.max))
    return "Minimum price must not exceed maximum price.";
  return "";
}
export function filterProducts(list: Product[], f: Filters, ignore = "") {
  if (priceError(f)) return [];
  return list.filter((p) => {
    const text = `${p.sku} ${p.mpn} ${p.name} ${p.brand}`.toLowerCase();
    if (f.q && !text.includes(f.q.trim().toLowerCase())) return false;
    if (
      f.category &&
      ignore !== "category" &&
      !p.categories.some(
        (c) => c === f.category || c.startsWith(f.category + " >>> "),
      )
    )
      return false;
    if (f.brands.length && ignore !== "brand" && !f.brands.includes(p.brand))
      return false;
    if (
      f.availability.length &&
      ignore !== "availability" &&
      !f.availability.includes(availability(p))
    )
      return false;
    const price = Number(p.price);
    if (ignore !== "price") {
      if (
        f.prices.length &&
        !f.prices.some((i) => {
          const r = priceRanges[Number(i)];
          return r && price >= r[1] && price < r[2];
        })
      )
        return false;
      if (
        (f.min !== "" && price < Number(f.min)) ||
        (f.max !== "" && price > Number(f.max))
      )
        return false;
    }
    if (
      ignore !== "data" &&
      f.data.some((k) =>
        k === "docs"
          ? !p.hasDatasheet
          : k === "spec"
            ? !p.specs.length
            : k === "tiers"
              ? p.tiers.length < 2
              : k === "own"
                ? p.brand !== "Ocean Controls"
                : false,
      )
    )
      return false;
    if (
      (f.collection === "new" && !p.new) ||
      (f.collection === "sale" && !p.sale)
    )
      return false;
    if (f.industry) return false;
    return true;
  });
}
export function sortProducts(list: Product[], f: Filters) {
  if (f.sort === "relevance" && !f.q.trim()) return [...list];
  return [...list].sort((a, b) =>
    f.sort === "price-asc"
      ? Number(a.price) - Number(b.price)
      : f.sort === "price-desc"
        ? Number(b.price) - Number(a.price)
        : f.sort === "name"
          ? a.name.localeCompare(b.name)
          : f.sort === "stock"
            ? (b.stock ?? -1) - (a.stock ?? -1)
            : (b.sku.toLowerCase() === f.q.trim().toLowerCase()
                ? 2
                : b.mpn.toLowerCase() === f.q.trim().toLowerCase()
                  ? 1
                  : 0) -
              (a.sku.toLowerCase() === f.q.trim().toLowerCase()
                ? 2
                : a.mpn.toLowerCase() === f.q.trim().toLowerCase()
                  ? 1
                  : 0),
  );
}
