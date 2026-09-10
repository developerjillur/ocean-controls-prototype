import type { Product } from "./types.ts";
export function specificationName(value: string) {
  const clean = value
    .replace(/^[-•\s]+/, "")
    .replace(/:\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const aliases: Record<string, string> = {
    "operating temperature range": "operating temperature",
    "supply voltage range": "supply voltage",
    "input voltage range": "input voltage",
    "dimensions (mm)": "dimensions",
  };
  return aliases[clean] || clean;
}
export function specificationValue(value: string) {
  return value
    .replace(/\bVDC\b/g, "V DC")
    .replace(/\bVAC\b/g, "V AC")
    .replace(/°\s+C/g, "°C")
    .replace(/\bmillimetres\b/g, "mm")
    .replace(/\s+/g, " ")
    .trim();
}
export function comparableSpecifications(p: Product) {
  return p.specs.map(
    ([name, value]) =>
      [specificationName(name), specificationValue(value)] as const,
  );
}
