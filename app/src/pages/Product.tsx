import { useState } from "react";
import {
  productBySku,
  products,
  documents,
  productUrl,
} from "../domain/catalogue";
import { useStore } from "../domain/store";
import { money, unitCents, quantityError } from "../domain/commerce";
import { useLocation, setQuery, navigate } from "../domain/navigation";
import { Price, Stock, Quantity, ProductCard } from "../components/ProductCard";
import { Link, Icon, Breadcrumb, Tabs, Empty, Modal } from "../components/ui";
import content from "../data/content.json";
export function ProductPage() {
  useLocation();
  const params = new URLSearchParams(location.search);
  const p = productBySku(params.get("sku") || "SIG-130");
  const [index, setIndex] = useState(0);
  const [q, setQ] = useState(1);
  const [zoom, setZoom] = useState(false);
  const { inc, add } = useStore();
  if (!p)
    return (
      <Empty title="Product not found">
        <p>This SKU is not in the current catalogue preview.</p>
        <Link href="shop.html" className="button">
          Browse products
        </Link>
      </Empty>
    );
  const labels = [
    "Description",
    "Specification",
    "Downloads",
    "Shipping",
    "Returns",
  ];
  const tab = labels.includes(params.get("tab") || "")
    ? params.get("tab")!
    : "Description";
  const docs = documents.filter((d) => p.documents.includes(d.id));
  const related = products
    .filter(
      (x) =>
        x.sku !== p.sku && x.categories.some((c) => p.categories.includes(c)),
    )
    .slice(0, 4);
  const error = quantityError(p, q);
  return (
    <>
      <Breadcrumb
        items={[
          "Shop",
          p.categories[0]?.split(" >>> ")[0] || "Products",
          p.sku,
        ]}
      />
      <nav className="product-adjacent" aria-label="Browse adjacent products">
        <Link
          className="button outline"
          href={productUrl(
            products[
              (products.indexOf(p) + products.length - 1) % products.length
            ].sku,
          )}
        >
          ← Previous product
        </Link>
        <Link
          className="button outline"
          href={productUrl(
            products[(products.indexOf(p) + 1) % products.length].sku,
          )}
        >
          Next product →
        </Link>
      </nav>
      <div className="product-top">
        <div className="gallery">
          <button
            className="main-image"
            onClick={() => setZoom(true)}
            aria-label="View larger product image"
          >
            <img
              src={p.images[index] || p.images[0]}
              alt={p.name}
              width="550"
              height="480"
            />
          </button>
          {p.images.length > 1 && (
            <div className="thumbnails">
              {p.images.map((img, i) => (
                <button
                  key={img}
                  aria-label={`Product image ${i + 1}`}
                  aria-pressed={index === i}
                  onClick={() => setIndex(i)}
                >
                  <img src={img} alt="" width="70" height="70" />
                </button>
              ))}
            </div>
          )}
          {docs.length > 0 && (
            <div className="gallery-docs">
              <h3>
                <Icon name="document" />
                Technical documents
              </h3>
              {docs.slice(0, 3).map((d) => (
                <a key={d.id} href={d.url} target="_blank" rel="noreferrer">
                  {d.title}
                  <Icon name="download" size={16} />
                </a>
              ))}
              <Link href={`datasheets.html?q=${p.sku}`}>
                View all documents <Icon name="arrow" size={16} />
              </Link>
            </div>
          )}
        </div>
        <div className="product-details">
          <Link
            className="eyebrow"
            href={`shop.html?brand=${encodeURIComponent(p.brand)}`}
          >
            {p.brand}
          </Link>
          <h1>{p.name}</h1>
          <div className="identity">
            <span>
              SKU <strong>{p.sku}</strong>
            </span>
            {p.mpn && (
              <span>
                MPN <strong>{p.mpn}</strong>
              </span>
            )}
          </div>
          <p className="lead">{p.summary || p.description.slice(0, 260)}</p>
          {p.specs.length > 0 && (
            <dl className="key-specs">
              {p.specs.slice(0, 6).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <Link
            className="text-link"
            href={`contact.html?topic=Product+advice&sku=${p.sku}`}
          >
            Ask about this product <Icon name="arrow" size={16} />
          </Link>
        </div>
        <aside className="buy-panel">
          <span className="eyebrow">ORDER THIS PRODUCT</span>
          <Price p={p} q={q} />
          <p className="muted">AUD · {inc ? "including" : "excluding"} GST</p>
          {p.purchasable && p.tiers.length > 1 && (
            <div className="tier-list">
              <h3>Quantity pricing</h3>
              {p.tiers.map((t) => (
                <button
                  key={t.min}
                  className={
                    q >= t.min && (t.max === null || q <= t.max) ? "active" : ""
                  }
                  onClick={() => setQ(t.min)}
                >
                  <span>
                    {t.max === null ? `${t.min}+` : `${t.min}–${t.max}`} units
                  </span>
                  <strong>
                    {money(Math.round(Number(t.price) * 100 * (inc ? 1.1 : 1)))}
                  </strong>
                </button>
              ))}
            </div>
          )}
          <Stock p={p} />
          {p.purchasable ? (
            <>
              <label className="quantity-label">Quantity</label>
              <Quantity value={q} onChange={setQ} label={`${p.sku} quantity`} />
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button full"
                disabled={!!error}
                onClick={() => add(p, q)}
              >
                <Icon name="cart" />
                Add to cart
              </button>
              <button
                className="button outline full"
                disabled={!!error}
                onClick={() => {
                  if (add(p, q)) navigate("cart.html");
                }}
              >
                Add and view cart <Icon name="arrow" />
              </button>
              {p.stock !== null && q > p.stock && p.backorder && (
                <p className="notice">
                  Quantity above available stock will be on backorder.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="notice">
                Please confirm current pricing with our team before ordering.
              </p>
              <Link
                className="button full"
                href={`contact.html?topic=Product+advice&sku=${p.sku}`}
              >
                Enquire about pricing <Icon name="arrow" />
              </Link>
            </>
          )}
        </aside>
      </div>
      <section className="product-tabs">
        <Tabs
          panelPrefix="product"
          labels={labels}
          value={tab}
          onChange={(s) => setQuery({ tab: s }, false)}
        />
        <div
          className="tab-panel"
          id="product-panel"
          aria-labelledby={`product-tab-${labels.indexOf(tab)}`}
          role="tabpanel"
          aria-label={tab}
        >
          {tab === "Description" ? (
            <div className="prose">
              <h2>Product overview</h2>
              {p.description
                .split("\n")
                .filter(Boolean)
                .map((s, i) => (
                  <p key={i}>{s}</p>
                ))}
            </div>
          ) : tab === "Specification" ? (
            p.specs.length ? (
              <div className="table-scroll">
                <table>
                  <tbody>
                    {p.specs.map(([k, v], i) => (
                      <tr key={i}>
                        <th>{k}</th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                Refer to the product documentation for detailed specifications.{" "}
                <Link href={`contact.html?topic=Product+advice&sku=${p.sku}`}>
                  Ask our engineers
                </Link>
                .
              </p>
            )
          ) : tab === "Downloads" ? (
            <>
              <h2>Product documentation</h2>
              {docs.length ? (
                docs.map((d) => (
                  <a
                    className="document-link"
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    key={d.id}
                  >
                    <Icon name="document" />
                    <span>
                      <strong>{d.title}</strong>
                      <small>
                        {d.format}
                        {d.bytes
                          ? ` · ${(d.bytes / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </small>
                    </span>
                    <Icon name="download" />
                  </a>
                ))
              ) : (
                <p>
                  No verified local documents are available.{" "}
                  <Link
                    href={`contact.html?topic=Document+request&sku=${p.sku}`}
                  >
                    Request a document
                  </Link>
                  .
                </p>
              )}
            </>
          ) : (
            <div className="prose">
              {content.policies
                .find(
                  (x) => x.id === (tab === "Shipping" ? "shipping" : "returns"),
                )
                ?.blocks.map((b, i) => (
                  <p key={i}>{b.text}</p>
                ))}
            </div>
          )}
        </div>
      </section>
      {related.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KEEP EXPLORING</span>
              <h2>Related products</h2>
            </div>
            <Link
              href={`shop.html?category=${encodeURIComponent(p.categories[0])}`}
            >
              Browse the range <Icon name="arrow" />
            </Link>
          </div>
          <div className="product-grid four">
            {related.map((r) => (
              <ProductCard p={r} key={r.sku} />
            ))}
          </div>
        </section>
      )}
      {zoom && (
        <Modal wide title={p.name} onClose={() => setZoom(false)}>
          <img
            className="zoom-image"
            src={p.images[index] || p.images[0]}
            alt={p.name}
            onLoad={(e) => {
              e.currentTarget.style.maxWidth = `${e.currentTarget.naturalWidth}px`;
            }}
          />
          <p className="muted">
            Original product photograph, displayed up to its available
            resolution.
          </p>
        </Modal>
      )}
    </>
  );
}
