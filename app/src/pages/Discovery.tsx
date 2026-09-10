import { useState } from "react";
import {
  products,
  catalogue,
  brandNames,
  documents,
  categories,
  productUrl,
} from "../domain/catalogue";
import { useLocation, setQuery } from "../domain/navigation";
import {
  Breadcrumb,
  PageTitle,
  Icon,
  Link,
  Tabs,
  Empty,
} from "../components/ui";
import { CataloguePage } from "./Catalogue";
import content from "../data/content.json";
import directory from "../data/directory.json";
import { ProductCard } from "../components/ProductCard";
export function BrandsPage() {
  useLocation();
  const s = new URLSearchParams(location.search),
    q = s.get("q") || "",
    focus = s.get("focus") || "",
    sort = s.get("sort") || "range",
    selected = s.get("brand");
  const brand = directory.brands.find((b) => b.name === selected);
  const areas = (directory.focusGroups.find((g) => g[0] === focus)?.[1] ||
    []) as string[];
  const matchingProducts = (name: string) =>
    products.filter((p) => p.brand === name);
  const matchingDocs = (name: string) =>
    documents.filter((d) => d.brands.includes(name));
  if (selected && !brand)
    return (
      <Empty title="Brand not found">
        <Link href="brands.html">Browse all brands</Link>
      </Empty>
    );
  if (brand)
    return (
      <>
        <Breadcrumb items={["Brands", brand.name]} />
        <section className="brand-detail-heading">
          <div>
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} width="230" height="130" />
            ) : (
              <h2>{brand.name}</h2>
            )}
          </div>
          <div>
            <span className="eyebrow">{brand.origin}</span>
            <h1>{brand.name}</h1>
            <p>{brand.description}</p>
            <div className="actions">
              <Link
                className="button"
                href={`shop.html?brand=${encodeURIComponent(brand.name)}`}
              >
                Browse products <Icon name="arrow" />
              </Link>
              <Link
                className="button outline"
                href={`datasheets.html?brand=${encodeURIComponent(brand.name)}`}
              >
                Technical documents
              </Link>
            </div>
          </div>
        </section>
        <div className="chips">
          {brand.categories.map((c) => (
            <Link
              className="button outline"
              key={c}
              href={`shop.html?brand=${encodeURIComponent(brand.name)}&category=${encodeURIComponent(c === "Electrical Terminals & Wiring" ? "Electrical Terminals-Wiring" : c === "Modbus, BACnet & M-Bus" ? "Modbus-Bacnet-MBus Products" : c)}`}
            >
              {c}
            </Link>
          ))}
        </div>
        <section className="section">
          <div className="section-heading">
            <h2>Products in this preview</h2>
            <Link href="brands.html">
              All brands <Icon name="arrow" />
            </Link>
          </div>
          {matchingProducts(brand.name).length ? (
            <div className="product-grid">
              {matchingProducts(brand.name).map((p) => (
                <ProductCard key={p.sku} p={p} />
              ))}
            </div>
          ) : (
            <Empty title="Ask about this range">
              <p>
                This brand is part of the source directory. Its products are not
                yet represented in this local preview.
              </p>
              <Link
                className="button"
                href={`contact.html?topic=Product+advice&brand=${encodeURIComponent(brand.name)}`}
              >
                Enquire about {brand.name}
              </Link>
            </Empty>
          )}
        </section>
      </>
    );
  const list = directory.brands
    .filter(
      (b) =>
        b.name.toLowerCase().includes(q.trim().toLowerCase()) &&
        (!focus ||
          !areas.length ||
          b.categories.some((c) => areas.includes(c))),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "docs"
          ? matchingDocs(b.name).length - matchingDocs(a.name).length
          : matchingProducts(b.name).length - matchingProducts(a.name).length,
    );
  return (
    <>
      <Breadcrumb items={["Brands"]} />
      <PageTitle
        eyebrow="SPECIALIST TECHNOLOGY PARTNERS"
        title="Brands we carry"
        blue
      >
        Explore industrial automation, instrumentation and control products by
        manufacturer.
      </PageTitle>
      <div className="browse-controls">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search brands"
            placeholder="Find a brand"
            value={q}
            onChange={(e) => setQuery({ q: e.target.value })}
          />
        </label>
        <label>
          Focus
          <select
            aria-label="Brand focus"
            value={focus}
            onChange={(e) => setQuery({ focus: e.target.value })}
          >
            {directory.focusGroups.map((g) => (
              <option
                key={String(g[0])}
                value={g[0] === "All" ? "" : String(g[0])}
              >
                {String(g[0])}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select
            aria-label="Sort brands"
            value={sort}
            onChange={(e) => setQuery({ sort: e.target.value })}
          >
            <option value="range">Preview range size</option>
            <option value="name">A–Z</option>
            <option value="docs">Documentation</option>
          </select>
        </label>
      </div>
      <p className="muted">
        {list.length} brands · product and document counts refer to this preview
      </p>
      <div className="brands-grid">
        {list.map((b) => (
          <Link
            className="brand-card"
            key={b.name}
            href={`brands.html?brand=${encodeURIComponent(b.name)}`}
          >
            <div>
              {b.logo ? (
                <img
                  src={b.logo}
                  alt={b.name}
                  width="180"
                  height="90"
                  loading="lazy"
                />
              ) : (
                <h2>{b.name}</h2>
              )}
            </div>
            <h3>{b.name}</h3>
            <p>{b.description}</p>
            <small>
              {matchingProducts(b.name).length} products ·{" "}
              {matchingDocs(b.name).length} documents
            </small>
            <span>
              Explore the range <Icon name="arrow" />
            </span>
          </Link>
        ))}
      </div>
      {!list.length && (
        <Empty title="No matching brands">
          <button
            className="button outline"
            onClick={() => setQuery({ q: null, focus: null })}
          >
            Reset filters
          </button>
        </Empty>
      )}
      <div className="enquiry-banner">
        <div>
          <h2>Work with Ocean Controls</h2>
          <p>
            Discuss carrying our range or introducing your equipment to
            Australia.
          </p>
        </div>
        <div className="actions">
          <Link className="button" href="contact.html?topic=Distribution">
            Become a distributor
          </Link>
          <Link
            className="button outline"
            href="contact.html?topic=Distribution"
          >
            Propose a brand
          </Link>
        </div>
      </div>
    </>
  );
}
export function SearchPage() {
  useLocation();
  const s = new URLSearchParams(location.search);
  const q = s.get("q") || "",
    type = s.get("type") || "All results";
  const term = q.trim().toLowerCase();
  const cats = categories.filter((c) => c.toLowerCase().includes(term));
  const brands = brandNames.filter((c) => c.toLowerCase().includes(term));
  const docs = documents.filter((d) =>
    [d.title, ...d.skus, ...d.brands].join(" ").toLowerCase().includes(term),
  );
  const articles = content.articles.filter((a) =>
    a.title.toLowerCase().includes(term),
  );
  return (
    <>
      <Breadcrumb items={["Search"]} />
      <PageTitle
        eyebrow="SEARCH OCEAN CONTROLS"
        title={q ? `Results for “${q}”` : "What are you looking for?"}
      >
        Search products, part numbers, brands and technical resources.
      </PageTitle>
      <Tabs
        labels={[
          "All results",
          "Products",
          "Categories",
          "Brands",
          "Datasheets",
          "Articles",
        ]}
        value={type}
        onChange={(v) => setQuery({ type: v })}
      />
      {["All results", "Products"].includes(type) && <CataloguePage embedded />}
      {[
        [
          "Categories",
          cats.map((c) => [c, `shop.html?category=${encodeURIComponent(c)}`]),
        ],
        [
          "Brands",
          brands.map((c) => [c, `shop.html?brand=${encodeURIComponent(c)}`]),
        ],
        ["Datasheets", docs.map((d) => [d.title, d.url])],
        [
          "Articles",
          articles.map((a) => [a.title, `articles.html?id=${a.id}`]),
        ],
      ].map(
        ([label, items]) =>
          (type === "All results" || type === label) && (
            <section className="section search-group" key={label as string}>
              <h2>
                {label as string}{" "}
                <small>({(items as string[][]).length})</small>
              </h2>
              {(items as string[][]).length ? (
                <div className="search-link-grid">
                  {(items as string[][]).map(([name, url]) =>
                    url.startsWith("assets/") ? (
                      <a
                        key={url}
                        className="result-link"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {name}
                        <Icon name="document" />
                      </a>
                    ) : (
                      <Link className="result-link" key={url} href={url}>
                        {name}
                        <Icon name="arrow" />
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <p>No matching {(label as string).toLowerCase()}.</p>
              )}
            </section>
          ),
      )}
    </>
  );
}
export function ArticlesPage() {
  useLocation();
  const s = new URLSearchParams(location.search);
  const id = s.get("id");
  const article = content.articles.find((a) => a.id === id);
  const q = s.get("q") || "",
    kind = s.get("kind") || "",
    topic = s.get("topic") || "";
  const classify = (a: (typeof content.articles)[number]) => a.kind;
  const topicOf = (a: (typeof content.articles)[number]) => a.topics;
  if (id && !article)
    return (
      <Empty title="Article not found">
        <Link href="articles.html">Browse articles</Link>
      </Empty>
    );
  if (article)
    return (
      <>
        <Breadcrumb items={["Articles", article.title]} />
        <article className="article-detail prose">
          <span className="eyebrow">
            {classify(article)} · {article.date}
          </span>
          <h1>{article.title}</h1>
          {article.images.length > 0 && (
            <div className="article-photos">
              {article.images.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt={article.title}
                  width="800"
                  height="500"
                />
              ))}
            </div>
          )}
          {article.blocks.map((b, i) =>
            b.kind === "h" ? (
              <h2 key={i}>{b.text}</h2>
            ) : (
              <p key={i}>{b.text}</p>
            ),
          )}
          {article.related.length > 0 && (
            <>
              <h2>Related products</h2>
              {article.related.map((sku) => (
                <Link className="result-link" key={sku} href={productUrl(sku)}>
                  {sku} · {products.find((p) => p.sku === sku)?.name}
                  <Icon name="arrow" />
                </Link>
              ))}
            </>
          )}
          <div className="actions">
            <a
              className="text-link"
              href={article.source}
              target="_blank"
              rel="noreferrer"
            >
              Original article <Icon name="external" size={16} />
            </a>
            <Link href="articles.html">All articles</Link>
          </div>
          <Link className="button" href="contact.html?topic=Product+advice">
            Ask about this product <Icon name="arrow" />
          </Link>
        </article>
      </>
    );
  const list = content.articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q.toLowerCase()) &&
      (!kind || classify(a) === kind) &&
      (!topic || topicOf(a).includes(topic)),
  );
  return (
    <>
      <Breadcrumb items={["Articles"]} />
      <PageTitle
        eyebrow="NEWS, IDEAS & TECHNICAL RESOURCES"
        title="From the technical desk"
        blue
      >
        Product announcements and technical notes from the Ocean Controls
        archive.
      </PageTitle>
      <div className="browse-controls">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search articles"
            placeholder="Search articles"
            value={q}
            onChange={(e) => setQuery({ q: e.target.value })}
          />
        </label>
        <label>
          Type
          <select
            aria-label="Article type"
            value={kind}
            onChange={(e) => setQuery({ kind: e.target.value })}
          >
            <option value="">All types</option>
            {[
              "Case study",
              "Buying guide",
              "Product release",
              "Range change",
              "Behind the scenes",
              "Product news",
              "Announcement",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Topic
          <select
            aria-label="Article topic"
            value={topic}
            onChange={(e) => setQuery({ topic: e.target.value })}
          >
            <option value="">All topics</option>
            {[
              "LabJack",
              "BACnet",
              "Weather",
              "Motion control",
              "Sensors",
              "1-Wire",
              "Software",
              "Shipping",
              "New product",
              "Connectivity",
              "Products",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="three-grid">
        {list.map((a) => (
          <Link
            className="article-card"
            href={`articles.html?id=${a.id}`}
            key={a.id}
          >
            <div className="article-visual">
              {a.images[0] ? (
                <img
                  src={a.images[0]}
                  alt=""
                  width="420"
                  height="220"
                  loading="lazy"
                />
              ) : (
                <>
                  <Icon name="document" size={45} />
                  <span>TECHNICAL NOTES</span>
                </>
              )}
            </div>
            <div>
              <small>
                {a.date} · {classify(a)}
              </small>
              <h2>{a.title}</h2>
              <p>{a.blocks[0]?.text.slice(0, 145)}…</p>
              <span>
                Read article <Icon name="arrow" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!list.length && (
        <Empty title="No matching articles">
          <button
            className="button outline"
            onClick={() => setQuery({ q: null, kind: null, topic: null })}
          >
            Reset filters
          </button>
        </Empty>
      )}
    </>
  );
}
