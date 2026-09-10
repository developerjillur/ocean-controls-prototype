import { useState } from "react";
import type { Product } from "../domain/types";
import { useStore } from "../domain/store";
import { money, unitCents, quantityError } from "../domain/commerce";
import { productUrl } from "../domain/catalogue";
import { Link, Icon } from "./ui";
export function Price({ p, q = 1 }: { p: Product; q?: number }) {
  const { inc } = useStore();
  const ex = unitCents(p, q);
  return (
    <div className="price">
      <strong>{money(inc ? Math.round(ex * 1.1) : ex)}</strong>
      <span>{inc ? "inc" : "ex"} GST</span>
      <small>
        {money(inc ? ex : Math.round(ex * 1.1))} {inc ? "ex" : "inc"} GST
      </small>
    </div>
  );
}
export function Stock({ p }: { p: Product }) {
  const text =
    p.stock === null
      ? "Availability on enquiry"
      : p.stock === 0
        ? p.backorder
          ? "Available on backorder"
          : "Out of stock"
        : p.stock < 5
          ? `Low stock · ${p.stock} available`
          : `In stock · ${p.stock} available`;
  return (
    <span
      className={
        "stock " +
        (p.stock === 0 || p.stock === null ? "muted" : p.stock < 5 ? "low" : "")
      }
    >
      <i />
      {text}
    </span>
  );
}
export function Quantity({
  value,
  onChange,
  label = "Quantity",
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <div className="quantity">
      <button
        aria-label={`Decrease ${label}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Icon name="minus" size={15} />
      </button>
      <input
        aria-label={label}
        type="number"
        min="1"
        max="99999"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button
        aria-label={`Increase ${label}`}
        disabled={value >= 99999}
        onClick={() => onChange(value + 1)}
      >
        <Icon name="plus" size={15} />
      </button>
    </div>
  );
}
export function Purchase({
  p,
  compact = false,
  quantity,
  onQuantity,
}: {
  p: Product;
  compact?: boolean;
  quantity?: number;
  onQuantity?: (q: number) => void;
}) {
  const [localQ, setLocalQ] = useState(1);
  const q = quantity ?? localQ,
    setQ = onQuantity ?? setLocalQ;
  const { add } = useStore();
  const error = quantityError(p, q);
  return (
    <div className={compact ? "purchase compact" : "purchase"}>
      {p.purchasable ? (
        <>
          <Quantity value={q} onChange={setQ} label={`${p.sku} quantity`} />
          <button
            className="button"
            disabled={!!error}
            onClick={() => add(p, q)}
          >
            <Icon name="cart" size={17} />
            {compact ? "Add" : "Add to cart"}
          </button>
          {error && <small className="error">{error}</small>}
        </>
      ) : (
        <Link
          className="button outline"
          href={`contact.html?topic=Product+advice&sku=${p.sku}`}
        >
          Confirm price <Icon name="arrow" size={16} />
        </Link>
      )}
    </div>
  );
}
export function ProductCard({
  p,
  view = "grid",
}: {
  p: Product;
  view?: string;
}) {
  const [q, setQ] = useState(1);
  const { compare, toggleCompare } = useStore();
  return (
    <article className={"product-card " + view} data-sku={p.sku}>
      <div className="product-image">
        <Link href={productUrl(p.sku)}>
          <img
            src={p.images[0]}
            alt={p.name}
            width="300"
            height="240"
            loading="lazy"
          />
        </Link>
        {(p.new || p.sale) && (
          <span className="badge">{p.sale ? "Sale" : "New"}</span>
        )}
        <button
          className={
            "compare-button " + (compare.includes(p.sku) ? "selected" : "")
          }
          aria-label={`Compare ${p.sku}`}
          aria-pressed={compare.includes(p.sku)}
          onClick={() => toggleCompare(p.sku)}
        >
          <Icon name="compare" size={17} />
        </button>
      </div>
      <div className="product-info">
        <Link
          className="brand-label"
          href={`shop.html?brand=${encodeURIComponent(p.brand)}`}
        >
          {p.brand}
        </Link>
        <h3>
          <Link href={productUrl(p.sku)}>{p.name}</Link>
        </h3>
        <p className="sku">
          {p.sku}
          {p.mpn ? " · " + p.mpn : ""}
        </p>
        <Stock p={p} />
        {view === "list" && <p>{p.summary.slice(0, 180)}</p>}
      </div>
      <div className="product-buy">
        <Price p={p} q={q} />
        <Purchase p={p} compact quantity={q} onQuantity={setQ} />
        <div className="product-foot">
          <Link href={`product.html?sku=${p.sku}&tab=Specification`}>
            Specs <Icon name="right" size={13} />
          </Link>
          {p.documents.length > 0 && (
            <Link href={`datasheets.html?q=${p.sku}`}>
              <Icon name="document" size={14} />
              {p.documents.length} docs
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function OrderBox({ p }: { p: Product }) {
  const [q, setQ] = useState(1);
  return (
    <>
      <Price p={p} q={q} />
      <Purchase p={p} compact quantity={q} onQuantity={setQ} />
    </>
  );
}
