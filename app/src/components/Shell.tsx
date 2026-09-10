import { useState, useEffect, useRef } from "react";
import { comparableSpecifications } from "../domain/specifications";
import { useStore } from "../domain/store";
import {
  products,
  categories,
  brandNames,
  productBySku,
  productUrl,
  documents,
} from "../domain/catalogue";
import { money, lineTotals } from "../domain/commerce";
import { navigate, useLocation } from "../domain/navigation";
import type { CartLine, Product } from "../domain/types";
import content from "../data/content.json";
import { Link, Icon, Modal } from "./ui";
import { Quantity, Price, Purchase, OrderBox } from "./ProductCard";
const nav = [
  ["Shop all", "shop.html"],
  ["New arrivals", "shop.html?collection=new"],
  ["Clearance & sale", "shop.html?collection=sale"],
  ["Brands", "brands.html"],
  ["Technical Library", "datasheets.html"],
  ["Distributors", "distributors.html"],
  ["Articles", "articles.html"],
  ["About & Engineering", "about.html"],
  ["Contact", "contact.html"],
];
export function Header() {
  const state = useStore();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState("");
  const route = useLocation();
  const input = useRef<HTMLInputElement>(null);
  const searchWrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!searchWrap.current?.contains(e.target as Node)) setSearch(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => {
    setSearch(false);
    setMenu("");
  }, [route]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearch(false);
        setMenu("");
      }
      if (
        (e.key === "/" &&
          !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) ||
        ((e.metaKey || e.ctrlKey) && e.key === "k")
      ) {
        e.preventDefault();
        input.current?.focus();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const term = q.toLowerCase().trim();
  const matches = products
    .filter((p) => `${p.sku} ${p.mpn} ${p.name}`.toLowerCase().includes(term))
    .sort(
      (a, b) =>
        Number(b.sku.toLowerCase() === term) -
        Number(a.sku.toLowerCase() === term),
    )
    .slice(0, 5);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="utility">
        <div className="container utility-inner">
          <a href="tel:+61397082390">
            <Icon name="phone" size={14} />
            +61 3 9708 2390
          </a>
          <span className="warehouse">
            Melbourne warehouse · Carrum Downs VIC
          </span>
          <Link href="cart.html#quick-order" className="quick-link">
            Quick Order <Icon name="arrow" size={14} />
          </Link>
          <div className="tax-switch">
            <button aria-pressed={state.inc} onClick={() => state.setInc(true)}>
              Inc GST
            </button>
            <button
              aria-pressed={!state.inc}
              onClick={() => state.setInc(false)}
            >
              Ex GST
            </button>
          </div>
          <label>
            <Icon name="pin" size={15} />
            <select
              aria-label="Display location"
              value={state.location}
              onChange={(e) => state.setLocation(e.target.value)}
            >
              <option>Melbourne</option>
              <option>Warehouse information</option>
            </select>
          </label>
          <label>
            <Icon name="globe" size={15} />
            <select
              aria-label="Currency"
              value={state.currency}
              onChange={(e) => state.setCurrency(e.target.value)}
            >
              {["AUD", "USD", "EUR", "NZD"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <header>
        <div className="container">
          <div className="header-main">
            <Link
              href="index.html"
              aria-label="Ocean Controls home"
              className="logo"
            >
              <img
                src="assets/logo.svg"
                width="190"
                height="65"
                alt="Ocean Controls"
              />
            </Link>
            <div
              className="search-wrap"
              ref={searchWrap}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget))
                  setSearch(false);
              }}
            >
              <form
                className="global-search"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate(`search.html?q=${encodeURIComponent(q)}`);
                }}
              >
                <input
                  ref={input}
                  role="combobox"
                  aria-haspopup="dialog"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" && search && term) {
                      e.preventDefault();
                      searchWrap.current
                        ?.querySelector<HTMLAnchorElement>(".suggestions a")
                        ?.focus();
                    }
                  }}
                  aria-label="Search the whole site"
                  placeholder="Search products, SKU or part number…"
                  value={q}
                  onFocus={() => setSearch(true)}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setSearch(true);
                  }}
                  aria-expanded={search && !!term}
                  aria-controls={
                    search && term ? "search-suggestions" : undefined
                  }
                />
                <button aria-label="Search">
                  <Icon name="search" />
                </button>
              </form>
              {search && term && (
                <div
                  className="suggestions"
                  id="search-suggestions"
                  role="dialog"
                  aria-label="Search suggestions"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      input.current?.focus();
                      setSearch(false);
                    }
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const links = [
                        ...e.currentTarget.querySelectorAll<HTMLAnchorElement>(
                          "a",
                        ),
                      ];
                      const i = links.indexOf(
                        document.activeElement as HTMLAnchorElement,
                      );
                      const next = i + (e.key === "ArrowDown" ? 1 : -1);
                      if (next < 0) input.current?.focus();
                      else links[Math.min(next, links.length - 1)]?.focus();
                    }
                  }}
                >
                  <div className="row-between">
                    <strong>Products</strong>
                    <button
                      className="icon-button"
                      aria-label="Close suggestions"
                      onClick={() => {
                        input.current?.focus();
                        setSearch(false);
                      }}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                  {matches.map((p) => (
                    <Link key={p.sku} href={productUrl(p.sku)}>
                      <img src={p.images[0]} alt="" width="40" height="40" />
                      <span>
                        <strong>{p.sku}</strong> {p.name}
                      </span>
                    </Link>
                  ))}
                  {!matches.length && <p>No matching products.</p>}
                  {[
                    [
                      "Categories",
                      categories
                        .filter((c) => c.toLowerCase().includes(term))
                        .slice(0, 3)
                        .map((c) => [
                          c,
                          `shop.html?category=${encodeURIComponent(c)}`,
                        ]),
                    ],
                    [
                      "Brands",
                      brandNames
                        .filter((c) => c.toLowerCase().includes(term))
                        .slice(0, 3)
                        .map((c) => [
                          c,
                          `shop.html?brand=${encodeURIComponent(c)}`,
                        ]),
                    ],
                    [
                      "Articles",
                      content.articles
                        .filter((a) => a.title.toLowerCase().includes(term))
                        .map((a) => [a.title, `articles.html?id=${a.id}`]),
                    ],
                  ].map(
                    ([title, items]) =>
                      (items as string[][]).length > 0 && (
                        <div key={title as string}>
                          <small>{title as string}</small>
                          {(items as string[][]).map(([label, url]) => (
                            <Link key={label} href={url}>
                              {label}
                              <Icon name="arrow" size={14} />
                            </Link>
                          ))}
                        </div>
                      ),
                  )}
                  <Link
                    className="search-all"
                    href={`search.html?q=${encodeURIComponent(q)}`}
                  >
                    View all results <Icon name="arrow" />
                  </Link>
                </div>
              )}
            </div>
            <Link className="header-action" href="account.html">
              <Icon name="user" />
              <span>Account</span>
            </Link>
            <button
              className="header-action"
              onClick={() => state.setDrawer("cart")}
            >
              <Icon name="cart" />
              <span>Cart</span>
              <b>
                {state.cart.reduce(
                  (n: number, l: CartLine) => n + l.quantity,
                  0,
                )}
              </b>
            </button>
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMenu("navigation")}
            >
              <Icon name="menu" />
            </button>
          </div>
          <nav className="desktop-nav" aria-label="Main navigation">
            <button
              className="category-button"
              onClick={() => setMenu("categories")}
            >
              <Icon name="menu" />
              All categories
            </button>
            {nav.map(([label, url]) => (
              <Link key={label} href={url}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {state.currency !== "AUD" && (
        <div className="currency-notice container">
          {state.currency} conversion is unavailable. All displayed amounts
          remain in AUD.
        </div>
      )}
      {state.location === "Warehouse information" && (
        <div className="currency-notice container">
          44 Frankston Gardens Drive, Carrum Downs VIC 3201. Delivery options
          are confirmed separately.
        </div>
      )}
      {menu && (
        <Modal
          title={menu === "categories" ? "Browse categories" : "Navigation"}
          onClose={() => setMenu("")}
        >
          <div className="menu-links">
            {(menu === "categories"
              ? categories.map((c) => [
                  c,
                  `shop.html?category=${encodeURIComponent(c)}`,
                ])
              : nav
            ).map(([label, url]) => (
              <Link href={url} key={label}>
                {label}
                <Icon name="right" />
              </Link>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
export function Footer() {
  const { setNotice } = useStore();
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link className="footer-logo" href="index.html">
              <img
                src="assets/logo.svg"
                alt="Ocean Controls"
                width="190"
                height="65"
              />
            </Link>
            <p>
              Industrial automation products.
              <br />
              Practical engineering expertise.
            </p>
            <address>
              44 Frankston Gardens Drive
              <br />
              Carrum Downs VIC 3201, Australia
            </address>
            <a href="tel:+61397082390">+61 3 9708 2390</a>
            <a href="mailto:orders@oceancontrols.com.au">
              orders@oceancontrols.com.au
            </a>
          </div>
          <div>
            <h3>Browse the range</h3>
            {nav.slice(0, 5).map(([l, u]) => (
              <Link key={u} href={u}>
                {l}
              </Link>
            ))}
            <Link href="cart.html#quick-order">Quick Order</Link>
          </div>
          <div>
            <h3>Engineering services</h3>
            {[
              "Hardware & electronics",
              "PLC & machine control",
              "Embedded & software",
              "HMI, SCADA & connectivity",
            ].map((service) => (
              <Link
                key={service}
                href={`about.html?service=${encodeURIComponent(service)}#services`}
              >
                {service}
              </Link>
            ))}
            <Link href="about.html#projects">Projects & case studies</Link>
          </div>
          <div>
            <h3>How we can help</h3>
            {nav.slice(5).map(([l, u]) => (
              <Link key={u} href={u}>
                {l}
              </Link>
            ))}
            <Link href="trade-account.html">Trade accounts</Link>
            <Link href="policies.html#shipping">Shipping & delivery</Link>
            <Link href="policies.html#returns">Returns & warranty</Link>
          </div>
          <div>
            <h3>Stay in the loop</h3>
            <p>Product releases and technical updates.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotice(
                  "Email validated. Newsletter delivery is not connected in this preview.",
                );
              }}
            >
              <label htmlFor="newsletter">Email address</label>
              <div className="newsletter">
                <input
                  id="newsletter"
                  type="email"
                  required
                  placeholder="you@company.com"
                />
                <button aria-label="Join product updates">
                  <Icon name="arrow" />
                </button>
              </div>
            </form>
            <small>Preview form · no subscription is created.</small>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Ocean Controls Pty Ltd. All prices AUD.</span>
          <div>
            <Link href="policies.html#privacy">Privacy</Link>
            <Link href="policies.html#terms">Terms of sale</Link>
            <Link href="policies.html#sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
export function Overlays() {
  const s = useStore();
  const chosen: Product[] = s.compare
    .map(productBySku)
    .filter((p): p is Product => p !== undefined);
  const attrs = [
    ...new Set(
      chosen.flatMap((p) => comparableSpecifications(p).map((x) => x[0])),
    ),
  ];
  return (
    <>
      {s.notice && (
        <div className="toast" role="status">
          <Icon name="info" />
          {s.notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => s.setNotice("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {chosen.length > 0 && (
        <div className="compare-tray">
          <span>
            <Icon name="compare" />
            Compare ({chosen.length}/4)
          </span>
          <div>
            {chosen.map((p) => (
              <button
                key={p.sku}
                onClick={() => s.toggleCompare(p.sku)}
                aria-label={`Remove ${p.sku} from comparison`}
              >
                {p.sku} <Icon name="close" size={14} />
              </button>
            ))}
          </div>
          <button className="button" onClick={() => s.setDrawer("compare")}>
            Compare products
          </button>
          <button onClick={() => s.setCompare([])}>Clear</button>
        </div>
      )}
      {s.drawer === "cart" && (
        <Modal title="Your cart" onClose={() => s.setDrawer("")}>
          <div className="mini-cart">
            {!s.cart.length ? (
              <p>Your cart is empty. Find the right parts in our catalogue.</p>
            ) : (
              s.cart.map((l: CartLine) => {
                const p = productBySku(l.sku)!;
                return (
                  <div className="mini-line" key={l.sku}>
                    <img src={p.images[0]} alt="" width="70" height="70" />
                    <div>
                      <Link
                        href={productUrl(p.sku)}
                        onClick={() => s.setDrawer("")}
                      >
                        {p.name}
                      </Link>
                      <small>{p.sku}</small>
                      <Quantity
                        value={l.quantity}
                        onChange={(q) => s.update(p.sku, q)}
                      />
                    </div>
                    <div>
                      <strong>
                        {money(lineTotals(p, l.quantity)[s.inc ? "inc" : "ex"])}
                      </strong>
                      <button
                        aria-label={`Remove ${p.sku} from cart`}
                        onClick={() => s.update(p.sku, 0)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <div className="row-between">
              <strong>Subtotal {s.inc ? "inc" : "ex"} GST</strong>
              <strong>{money(s.totals[s.inc ? "inc" : "ex"])}</strong>
            </div>
            <Link
              href="cart.html"
              className="button"
              onClick={() => s.setDrawer("")}
            >
              View cart & checkout <Icon name="arrow" />
            </Link>
            <Link href="shop.html" onClick={() => s.setDrawer("")}>
              Continue shopping
            </Link>
          </div>
        </Modal>
      )}
      {s.drawer === "compare" && (
        <Modal wide title="Compare products" onClose={() => s.setDrawer("")}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  {chosen.map((p) => (
                    <th key={p.sku}>
                      <img src={p.images[0]} width="120" height="110" alt="" />
                      <Link
                        href={productUrl(p.sku)}
                        onClick={() => s.setDrawer("")}
                      >
                        {p.name}
                      </Link>
                      <small>{p.sku}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Brand</th>
                  {chosen.map((p) => (
                    <td key={p.sku}>{p.brand}</td>
                  ))}
                </tr>
                {attrs.map((a) => (
                  <tr key={a}>
                    <th>{a}</th>
                    {chosen.map((p) => (
                      <td key={p.sku}>
                        {comparableSpecifications(p).find(
                          (x) => x[0] === a,
                        )?.[1] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th>Price</th>
                  {chosen.map((p) => (
                    <td key={p.sku}>
                      <OrderBox p={p} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </>
  );
}
