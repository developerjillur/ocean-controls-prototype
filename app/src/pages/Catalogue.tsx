import { useState } from "react";
import {
  products,
  catalogue,
  brandNames,
  productUrl,
} from "../domain/catalogue";
import {
  catalogueSummary,
  catalogueCategoryOrder,
  categoryProductCount,
  formatCount,
  categoryLabel,
} from "../domain/catalogue-counts";
import {
  readFilters,
  filterProducts,
  sortProducts,
  priceRanges,
  dataOptions,
  priceError,
} from "../domain/filters";
import { setQuery, useLocation, navigate } from "../domain/navigation";
import { availability } from "../domain/commerce";
import type { Product } from "../domain/types";
import {
  ProductCard,
  Stock,
  Price,
  Purchase,
  OrderBox,
} from "../components/ProductCard";
import {
  Link,
  Icon,
  Modal,
  Empty,
  PageTitle,
  Breadcrumb,
  Pagination,
} from "../components/ui";
import { useStore } from "../domain/store";
export function CataloguePage({ embedded = false }: { embedded?: boolean }) {
  useLocation();
  const f = readFilters(new URLSearchParams(location.search));
  const [drawer, setDrawer] = useState(false);
  const [allBrands, setAllBrands] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(
    f.category ? [f.category.split(" >>> ")[0]] : [],
  );
  const { compare, toggleCompare } = useStore();
  const set = (key: string, value: string | string[]) =>
    setQuery({ [key]: value });
  const toggle = (key: string, list: string[], v: string) =>
    set(key, list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const filtered = sortProducts(filterProducts(products, f), f);
  const page = Math.min(
    f.page,
    Math.max(1, Math.ceil(filtered.length / f.perPage)),
  );
  const shown = filtered.slice((page - 1) * f.perPage, page * f.perPage);
  const count = (group: string, fn: (p: Product) => boolean) =>
    filterProducts(products, f, group).filter(fn).length;
  const title = f.industry
    ? `${f.industry} applications`
    : f.collection === "new"
      ? "New arrivals"
      : f.collection === "sale"
        ? "Clearance & sale"
        : f.category
          ? f.category.split(" >>> ").at(-1)!
          : f.brands.length === 1
            ? f.brands[0]
            : "Shop all products";
  const reset = () =>
    navigate(
      location.pathname +
        (embedded && f.q ? "?q=" + encodeURIComponent(f.q) : ""),
    );
  const chips: [string, string, () => void][] = [];
  if (f.category)
    chips.push(["Category", f.category, () => set("category", "")]);
  for (const [key, vals] of [
    ["brand", f.brands],
    ["availability", f.availability],
    ["price", f.prices],
    ["data", f.data],
  ] as [string, string[]][])
    for (const val of vals)
      chips.push([
        key,
        key === "price"
          ? priceRanges[Number(val)]?.[0] || val
          : key === "data"
            ? dataOptions.find((d) => d[0] === val)?.[1] || val
            : key === "availability"
              ? {
                  in: "In stock",
                  low: "Low stock",
                  out: "Backorder / out",
                  unknown: "Unknown stock",
                }[val] || val
              : val,
        () => toggle(key, vals, val),
      ]);
  for (const [k, v] of [
    ["min", f.min],
    ["max", f.max],
    ["collection", f.collection],
    ["industry", f.industry],
    ...(!embedded ? [["q", f.q]] : []),
  ])
    if (v) chips.push([k, `${k}: ${v}`, () => set(k, "")]);
  const check = (
    group: string,
    label: string,
    value: string,
    list: string[],
    n: number,
  ) => (
    <label className="filter-check" key={value}>
      <input
        type="checkbox"
        checked={list.includes(value)}
        onChange={() => toggle(group, list, value)}
      />
      <span>{label}</span>
      <small>{n}</small>
    </label>
  );
  const filters = (
    <>
      <div className="filter-heading">
        <h2>
          <Icon name="filter" />
          Refine your search
        </h2>
        <button className="text-button" onClick={reset}>
          Reset
        </button>
      </div>
      <section className="filter-section">
        <h3>Category</h3>
        <p className="category-count-note">Full catalogue totals</p>
        <button
          className={"category-row " + (!f.category ? "active" : "")}
          onClick={() => set("category", "")}
        >
          <span>All products</span>
          <small>{formatCount(catalogueSummary.products)}</small>
        </button>
        <div className="category-tree">
          {catalogueCategoryOrder.map((c) => {
            const children = catalogue.categoryPaths.filter((x) =>
              x.startsWith(c + " >>> "),
            );
            return (
              <div key={c}>
                <div className="category-parent">
                  <button
                    className={
                      "category-row " + (f.category === c ? "active" : "")
                    }
                    onClick={() => {
                      set("category", c);
                      setExpanded([...new Set([...expanded, c])]);
                    }}
                  >
                    <span>{categoryLabel(c)}</span>
                    <small>{formatCount(categoryProductCount(c))}</small>
                  </button>
                  {children.length > 0 && (
                    <button
                      className="tree-toggle"
                      aria-label={`Expand ${c}`}
                      aria-expanded={expanded.includes(c)}
                      onClick={() =>
                        setExpanded(
                          expanded.includes(c)
                            ? expanded.filter((x) => x !== c)
                            : [...expanded, c],
                        )
                      }
                    >
                      <Icon
                        name={expanded.includes(c) ? "down" : "right"}
                        size={15}
                      />
                    </button>
                  )}
                </div>
                {expanded.includes(c) &&
                  children.map((sub) => (
                    <button
                      key={sub}
                      className={
                        "category-row child " +
                        (f.category === sub ? "active" : "")
                      }
                      onClick={() => set("category", sub)}
                    >
                      <span>{sub.split(" >>> ").slice(1).join(" / ")}</span>
                      <small>{formatCount(categoryProductCount(sub))}</small>
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      </section>
      <section className="filter-section">
        <h3>Availability</h3>
        {[
          ["in", "In stock"],
          ["low", "Low stock"],
          ["out", "Backorder / out"],
          ["unknown", "Availability on enquiry"],
        ].map(([v, l]) =>
          check(
            "availability",
            l,
            v,
            f.availability,
            count("availability", (p) => availability(p) === v),
          ),
        )}
      </section>
      <section className="filter-section">
        <h3>Brand</h3>
        {brandNames.slice(0, allBrands ? undefined : 8).map((b) =>
          check(
            "brand",
            b,
            b,
            f.brands,
            count("brand", (p) => p.brand === b),
          ),
        )}
        <button
          className="text-button"
          onClick={() => setAllBrands(!allBrands)}
        >
          {allBrands
            ? "Show fewer brands"
            : `Show all ${brandNames.length} brands`}{" "}
          <Icon name="down" size={14} />
        </button>
      </section>
      <section className="filter-section">
        <h3>
          Price <span>ex GST</span>
        </h3>
        {priceRanges.map((r, i) =>
          check(
            "price",
            r[0],
            String(i),
            f.prices,
            count(
              "price",
              (p) => Number(p.price) >= r[1] && Number(p.price) < r[2],
            ),
          ),
        )}
        <div className="range-inputs">
          <label>
            Min
            <input
              type="number"
              min="0"
              aria-label="Minimum price"
              value={f.min}
              onChange={(e) => set("min", e.target.value)}
              placeholder="$0"
            />
          </label>
          <span>–</span>
          <label>
            Max
            <input
              type="number"
              min="0"
              aria-label="Maximum price"
              value={f.max}
              onChange={(e) => set("max", e.target.value)}
              placeholder="Any"
            />
          </label>
        </div>
        {priceError(f) && (
          <p className="error" role="alert">
            {priceError(f)}
          </p>
        )}
      </section>
      <section className="filter-section">
        <h3>Product data</h3>
        {dataOptions.map(([v, l]) =>
          check(
            "data",
            l,
            v,
            f.data,
            count("data", (p) =>
              v === "docs"
                ? !!p.documents.length
                : v === "spec"
                  ? !!p.specs.length
                  : v === "tiers"
                    ? p.tiers.length > 1
                    : p.brand === "Ocean Controls",
            ),
          ),
        )}
      </section>
    </>
  );
  return (
    <>
      {!embedded && (
        <>
          <Breadcrumb items={["Shop", ...(f.collection ? [title] : [])]} />
          <div className="catalogue-intro">
            <PageTitle eyebrow="THE OCEAN CONTROLS RANGE" title={title}>
              Find the right component. Compare specifications. Order with
              confidence.
            </PageTitle>
            <dl className="catalogue-counts" aria-label="Full catalogue totals">
              <div>
                <dt>Products</dt>
                <dd>{formatCount(catalogueSummary.products)}</dd>
              </div>
              <div>
                <dt>Categories</dt>
                <dd>{formatCount(catalogueSummary.categories)}</dd>
              </div>
              <div>
                <dt>Brands</dt>
                <dd>{formatCount(catalogueSummary.brands)}</dd>
              </div>
            </dl>
          </div>
          <div className="category-shortcuts">
            {catalogueCategoryOrder.slice(0, 10).map((c) => (
              <Link
                key={c}
                href={`shop.html?category=${encodeURIComponent(c)}`}
              >
                {categoryLabel(c)}{" "}
                <small>{formatCount(categoryProductCount(c))}</small>
                <Icon name="arrow" size={15} />
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="catalogue-layout">
        <aside className="filters desktop-filters">{filters}</aside>
        <div className="results">
          <div className="results-search">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                set("q", String(d.get("q") || ""));
              }}
            >
              <Icon name="search" />
              <input
                name="q"
                aria-label="Search catalogue"
                placeholder="Search SKU, product or part number"
                defaultValue={f.q}
                key={f.q}
              />
              <button className="button">Search</button>
            </form>
          </div>
          <div className="results-toolbar">
            <span className="results-count" aria-live="polite">
              Showing{" "}
              <strong>
                {shown.length ? (page - 1) * f.perPage + 1 : 0}–
                {Math.min(page * f.perPage, filtered.length)}
              </strong>{" "}
              of <strong>{formatCount(filtered.length)}</strong> preview
              products
              <small>
                {f.category
                  ? `${categoryLabel(f.category)}: ${formatCount(categoryProductCount(f.category))} in the full catalogue`
                  : `${formatCount(catalogueSummary.products)} products in the full catalogue`}
              </small>
            </span>
            <button
              className="filter-mobile button outline"
              onClick={() => setDrawer(true)}
            >
              <Icon name="filter" />
              Filters {chips.length > 0 && `(${chips.length})`}
            </button>
            <label className="sort-label">
              Sort
              <select
                aria-label="Sort products"
                value={f.sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name A–Z</option>
                <option value="stock">In stock</option>
              </select>
            </label>
            <div className="view-switch">
              {(["grid", "list", "table"] as const).map((v) => (
                <button
                  key={v}
                  aria-label={`${v[0].toUpperCase() + v.slice(1)} view`}
                  aria-pressed={f.view === v}
                  onClick={() => set("view", v)}
                >
                  <Icon name={v} />
                </button>
              ))}
            </div>
          </div>
          {chips.length > 0 && (
            <div className="chips">
              {chips.map(([k, l, remove], i) => (
                <button key={k + i} onClick={remove}>
                  {l}
                  <Icon name="close" size={14} />
                </button>
              ))}
              <button className="clear-chip" onClick={reset}>
                Clear all
              </button>
            </div>
          )}
          {!shown.length ? (
            <Empty
              title={
                f.industry
                  ? "Let’s find the right solution for your industry"
                  : "No matching products"
              }
            >
              <p>
                {f.industry
                  ? `Tell our engineers about your ${f.industry.toLowerCase()} application. Industry-specific product mapping is being prepared.`
                  : "Try removing a filter or searching for a different SKU."}
              </p>
              <button className="button outline" onClick={reset}>
                Reset filters
              </button>
              {f.industry && (
                <Link
                  className="button"
                  href={`contact.html?topic=Engineering&industry=${encodeURIComponent(f.industry)}`}
                >
                  Discuss your application
                </Link>
              )}
            </Empty>
          ) : f.view === "table" ? (
            <div className="table-scroll">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Compare</th>
                    <th>Product / SKU</th>
                    <th>Availability</th>
                    <th>Price & order</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((p) => (
                    <tr key={p.sku}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Compare ${p.sku}`}
                          checked={compare.includes(p.sku)}
                          onChange={() => toggleCompare(p.sku)}
                        />
                      </td>
                      <td>
                        <Link href={productUrl(p.sku)}>
                          <strong>{p.name}</strong>
                        </Link>
                        <small>
                          {p.sku} · {p.brand}
                        </small>
                        <Link
                          href={`product.html?sku=${p.sku}&tab=Specification`}
                        >
                          Specs
                        </Link>
                        {p.documents.length > 0 && (
                          <Link href={`datasheets.html?q=${p.sku}`}>
                            {" "}
                            · {p.documents.length} documents
                          </Link>
                        )}
                      </td>
                      <td>
                        <Stock p={p} />
                      </td>
                      <td>
                        <OrderBox p={p} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className={f.view === "list" ? "product-list" : "product-grid"}
            >
              {shown.map((p) => (
                <ProductCard key={p.sku} p={p} view={f.view} />
              ))}
            </div>
          )}
          <div className="pagination-bar">
            <span>
              Showing {filtered.length ? (page - 1) * f.perPage + 1 : 0}–
              {Math.min(page * f.perPage, filtered.length)} of {filtered.length}
            </span>
            <Pagination
              page={page}
              total={filtered.length}
              size={f.perPage}
              onPage={(n) => setQuery({ page: String(n) }, false)}
            />
            <label>
              Per page
              <select
                aria-label="Products per page"
                value={f.perPage}
                onChange={(e) => set("perPage", e.target.value)}
              >
                {[24, 48, 96].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="scope-note">
            Browsable catalogue preview · {products.length} source-reconciled
            products. Prices and availability use the supplied catalogue
            snapshot.
          </p>
        </div>
      </div>
      {drawer && (
        <Modal title="Filter products" onClose={() => setDrawer(false)}>
          <div className="filters">{filters}</div>
          <button className="button full" onClick={() => setDrawer(false)}>
            Show {filtered.length} results
          </button>
        </Modal>
      )}
    </>
  );
}
