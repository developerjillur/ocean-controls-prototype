import raw from "../data/catalogue.json";
import directory from "../data/directory.json";
import type { Product, DocumentRecord } from "./types";
export const products = raw.products as Product[];
export { documents } from "./documents";
export const catalogue = raw;
export const productBySku = (sku: string) =>
  products.find((p) => p.sku === sku.trim().toUpperCase());
export const categories = raw.categories;
export const brandNames = [
  ...new Set([
    ...directory.brands.map((b) => b.name),
    ...products.map((p) => p.brand),
  ]),
].sort();
export const productUrl = (sku: string) =>
  `product.html?sku=${encodeURIComponent(sku)}`;
export const shopUrl = (key: string, value: string) =>
  `shop.html?${key}=${encodeURIComponent(value)}`;
export const topCategory = (s: string) => s.split(" >>> ")[0];
