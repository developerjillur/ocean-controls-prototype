import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  unitCents,
  lineTotals,
  quantityError,
  addLine,
  availability,
  nextQuantityTier,
} from "./commerce.ts";
import {
  filterProducts,
  readFilters,
  sortProducts,
  priceError,
} from "./filters.ts";
import type { Product } from "./types.ts";
const products: Product[] = JSON.parse(
  readFileSync(new URL("../data/catalogue.json", import.meta.url), "utf8"),
).products;
const get = (sku: string) => products.find((p) => p.sku === sku)!;
test("GJS-002 source-specific threshold boundaries", () => {
  const p = get("GJS-002");
  for (const [q, c] of [
    [1, 2847],
    [4, 2847],
    [5, 2563],
    [9, 2563],
    [10, 2420],
    [11, 2420],
  ])
    assert.equal(unitCents(p, q), c);
});
test("CGL-004 19 / 20 / 25 and line tax rounding", () => {
  const p = get("CGL-004");
  assert.equal(unitCents(p, 19), 251);
  assert.equal(unitCents(p, 20), 226);
  assert.deepEqual(lineTotals(p, 25), { ex: 5650, tax: 565, inc: 6215 });
});
test("sale precedence conflicts cannot enter cart", () => {
  for (const p of products.filter((p) => !p.purchasable)) {
    assert.ok(quantityError(p, 1));
    assert.equal(addLine([], p, 1).lines.length, 0);
  }
});
test("quantity and availability fail safely", () => {
  const p = get("CGL-004");
  for (const q of [0, -1, NaN, 1.1, 100000]) assert.ok(quantityError(p, q));
  assert.ok(quantityError({ ...p, stock: 0, backorder: false }, 1));
  assert.equal(quantityError({ ...p, stock: 0, backorder: true }, 1), "");
  assert.equal(availability({ ...p, stock: null }), "unknown");
});
test("repeat additions merge and verify combined stock", () => {
  const p = { ...get("CGL-004"), stock: 30, backorder: false };
  const a = addLine([], p, 25);
  assert.equal(a.lines[0].quantity, 25);
  const b = addLine(a.lines, p, 6);
  assert.ok(b.error);
  assert.equal(b.lines[0].quantity, 25);
  assert.equal(addLine(a.lines, p, 5).lines[0].quantity, 30);
});
test("filter facets OR within brands, AND with price and availability", () => {
  const f = readFilters(
    new URLSearchParams("brand=SMS&brand=Novus&price=0&availability=in"),
  );
  const result = filterProducts(products, f);
  assert.ok(result.length);
  assert.ok(
    result.every(
      (p) =>
        ["SMS", "Novus"].includes(p.brand) &&
        Number(p.price) < 25 &&
        availability(p) === "in",
    ),
  );
});
test("category descendant matching, exact SKU and whitespace", () => {
  const f = readFilters(
    new URLSearchParams("category=Electrical+Terminals-Wiring"),
  );
  assert.ok(
    filterProducts(products, f).every((p) =>
      p.categories.some((c) => c.startsWith(f.category)),
    ),
  );
  const q = readFilters(new URLSearchParams("q=+cgl-004+"));
  assert.deepEqual(
    filterProducts(products, q).map((p) => p.sku),
    ["CGL-004"],
  );
});
test("price invalid range does not silently return all items", () => {
  const f = readFilters(new URLSearchParams("min=100&max=25"));
  assert.ok(priceError(f));
  assert.equal(filterProducts(products, f).length, 0);
});
test("new arrival flags match original explicit SKU definition", () =>
  assert.deepEqual(
    products
      .filter((p) => p.new)
      .map((p) => p.sku)
      .sort(),
    ["ADW-003", "KTA-387", "KTA-397", "SIG-131", "ULC-075"],
  ));
test("facet counts ignore only their own facet", () => {
  const f = readFilters(new URLSearchParams("brand=SMS&availability=low"));
  const other = filterProducts(products, f, "brand");
  assert.ok(other.some((p) => p.brand !== "SMS"));
  assert.ok(other.every((p) => availability(p) === "low"));
});
test("unsupported industry maps never silently show all products", () =>
  assert.equal(
    filterProducts(
      products,
      readFilters(new URLSearchParams("industry=Mining")),
    ).length,
    0,
  ));
test("every product and document identity is unique", () =>
  assert.equal(new Set(products.map((p) => p.sku)).size, 86));

test("Variant SKUs remain in original represented coverage", () => {
  for (const sku of ["KTA-367A", "ULC-008C"]) {
    const p = get(sku);
    assert.ok(p);
    assert.ok(p.images.length);
    assert.ok(p.purchasable);
    assert.equal(quantityError(p, 1), "");
  }
});
test("Negative additions cannot reduce an existing cart line", () => {
  const p = get("CGL-004");
  const existing = [{ sku: p.sku, quantity: 25 }];
  assert.ok(addLine(existing, p, -1).error);
  assert.equal(addLine(existing, p, 0).lines[0].quantity, 25);
});
test("Datasheet facet excludes products with only software or manual documents", () => {
  const f = readFilters(new URLSearchParams("data=docs"));
  assert.ok(filterProducts(products, f).every((p) => p.hasDatasheet));
  assert.equal(
    filterProducts(
      [{ ...get("CGL-004"), hasDatasheet: false, documents: ["a-manual"] }],
      f,
    ).length,
    0,
  );
});

test("Next tier uses a verified lower price and respects stock", () => {
  const p = get("GJS-002");
  assert.equal(nextQuantityTier(p, 4)?.min, 5);
  assert.equal(nextQuantityTier(p, 5)?.min, 10);
  assert.equal(nextQuantityTier(p, 10), undefined);
  assert.equal(
    nextQuantityTier({ ...p, stock: 4, backorder: false }, 4),
    undefined,
  );
  assert.equal(nextQuantityTier(get("SIG-130"), 1), undefined);
});
