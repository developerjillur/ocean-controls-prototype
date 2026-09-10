import { useState, useEffect } from "react";
import { useStore } from "../domain/store";
import { productBySku, productUrl } from "../domain/catalogue";
import {
  money,
  lineTotals,
  quantityError,
  addLine,
  nextQuantityTier,
  unitCents,
} from "../domain/commerce";
import { useLocation, setQuery } from "../domain/navigation";
import type { CartLine } from "../domain/types";
import { Link, Icon, Breadcrumb, PageTitle, Empty } from "../components/ui";
import { Quantity, Stock } from "../components/ProductCard";
const stages = [
  "Cart",
  "Account",
  "Delivery",
  "Payment preview",
  "Review",
  "Demo confirmation",
];
export function CartPage() {
  useLocation();
  const s = useStore();
  const params = new URLSearchParams(location.search);
  const requested = params.get("stage") || "Cart";
  const [delivery, setDelivery] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState("");
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [confirmation, setConfirmation] = useState<{
    lines: CartLine[];
    total: number;
  } | null>(null);
  const [quick, setQuick] = useState([{ sku: "", quantity: "1", error: "" }]);
  const [paste, setPaste] = useState("");
  const [localError, setLocalError] = useState("");
  let stage = stages.includes(requested) ? requested : "Cart";
  if (stage !== "Demo confirmation" && !s.cart.length) stage = "Cart";
  if (stage !== "Cart" && stage !== "Demo confirmation" && !s.demo)
    stage = "Account";
  if (["Payment preview", "Review"].includes(stage) && !delivery.address)
    stage = "Delivery";
  if (stage === "Review" && !payment) stage = "Payment preview";
  if (stage === "Demo confirmation" && !confirmation) stage = "Cart";
  const change = (next: string) => {
    setLocalError("");
    setQuery({ stage: next }, false);
  };
  const cartErrors = s.cart
    .map((l: CartLine) => quantityError(productBySku(l.sku)!, l.quantity))
    .filter(Boolean);
  function addQuick() {
    let lines = [...s.cart];
    const updated = quick.map((row) => {
      const p = productBySku(row.sku);
      if (!p) return { ...row, error: "Unknown SKU. Check the part number." };
      const qty = Number(row.quantity);
      if (!Number.isInteger(qty) || qty < 1)
        return { ...row, error: "Enter a positive whole quantity." };
      const result = addLine(lines, p, qty);
      if (result.error) return { ...row, error: result.error };
      lines = result.lines;
      return { ...row, sku: "", quantity: "1", error: "" };
    });
    s.setCart(lines);
    setQuick(
      updated.filter((r) => r.sku || r.error).length
        ? updated.filter((r) => r.sku || r.error)
        : [{ sku: "", quantity: "1", error: "" }],
    );
    s.setNotice(
      "Valid quick-order rows added. Any rows needing attention remain below.",
    );
  }
  const subtotal = (
    <aside className="order-summary">
      <h2>Order summary</h2>
      <div>
        <span>Subtotal ex GST</span>
        <strong>{money(s.totals.ex)}</strong>
      </div>
      <div>
        <span>GST</span>
        <strong>{money(s.totals.tax)}</strong>
      </div>
      <div>
        <span>Delivery</span>
        <span>
          {delivery.method === "Pickup" ? "Pickup selected" : "Quote pending"}
        </span>
      </div>
      <div className="summary-total">
        <span>Product total inc GST</span>
        <strong>{money(s.totals.inc)}</strong>
      </div>
      <p>
        Delivery charges, where applicable, are confirmed separately. This
        preview does not create a real order.
      </p>
      {stage === "Cart" && (
        <button
          className="button full"
          disabled={!s.cart.length || cartErrors.length > 0}
          onClick={() => change("Account")}
        >
          Continue to checkout <Icon name="arrow" />
        </button>
      )}
      <Link href="shop.html">
        Continue shopping <Icon name="arrow" size={16} />
      </Link>
    </aside>
  );
  return (
    <>
      <Breadcrumb items={["Your order"]} />
      <PageTitle
        eyebrow="YOUR OCEAN CONTROLS ORDER"
        title={
          stage === "Cart"
            ? "Your cart"
            : stage === "Demo confirmation"
              ? "Demo order complete"
              : stage
        }
      >
        Review your parts and complete the registered-customer checkout preview.
      </PageTitle>
      <nav className="checkout-steps" aria-label="Checkout progress">
        {stages.map((x, i) => (
          <button
            key={x}
            aria-current={stage === x ? "step" : undefined}
            disabled={
              i > stages.indexOf(stage) || stage === "Demo confirmation"
            }
            onClick={() => change(x)}
          >
            <span>{i + 1}</span>
            {x}
          </button>
        ))}
      </nav>
      {stage === "Cart" ? (
        <>
          <div className="cart-layout">
            <section>
              {!s.cart.length ? (
                <Empty title="Your cart is empty">
                  <p>Browse the catalogue or enter known SKUs below.</p>
                  <Link className="button" href="shop.html">
                    Browse products <Icon name="arrow" />
                  </Link>
                </Empty>
              ) : (
                <div className="cart-lines">
                  {s.cart.map((l: CartLine) => {
                    const p = productBySku(l.sku)!;
                    const nextTier = nextQuantityTier(p, l.quantity);
                    return (
                      <article className="cart-line" key={l.sku}>
                        <Link href={productUrl(l.sku)}>
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            width="110"
                            height="110"
                          />
                        </Link>
                        <div>
                          <h3>
                            <Link href={productUrl(l.sku)}>{p.name}</Link>
                          </h3>
                          <p className="sku">{p.sku}</p>
                          <Stock p={p} />
                          {nextTier && (
                            <button
                              className="text-button tier-nudge"
                              onClick={() => s.update(l.sku, nextTier.min)}
                            >
                              Make it {nextTier.min} for{" "}
                              {money(unitCents(p, nextTier.min))} each ex GST
                            </button>
                          )}
                          <button
                            className="text-button"
                            onClick={() => s.update(l.sku, 0)}
                          >
                            Remove {p.sku}
                          </button>
                        </div>
                        <Quantity
                          value={l.quantity}
                          onChange={(q) => s.update(l.sku, q)}
                          label={`${l.sku} quantity`}
                        />
                        <strong>
                          {money(
                            lineTotals(p, l.quantity)[s.inc ? "inc" : "ex"],
                          )}
                          <small>{s.inc ? "inc" : "ex"} GST</small>
                        </strong>
                      </article>
                    );
                  })}
                </div>
              )}
              {s.cart.length > 0 && (
                <button
                  className="button outline clear-order"
                  onClick={() => {
                    s.setCart([]);
                    s.setNotice("Your cart is now empty.");
                  }}
                >
                  Empty the order
                </button>
              )}
              {cartErrors.map((err: string, i: number) => (
                <p key={i} className="error">
                  {err}
                </p>
              ))}
            </section>
            {subtotal}
          </div>
          <section id="quick-order" className="quick-order section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ALREADY KNOW YOUR PART NUMBERS?</span>
                <h2>Quick Order</h2>
              </div>
              <Icon name="cart" size={30} />
            </div>
            <p>
              Enter a SKU and quantity, or paste one SKU per line followed by a
              comma and quantity.
            </p>
            <div className="quick-layout">
              <div>
                {quick.map((r, i) => (
                  <div className="quick-row" key={i}>
                    <label>
                      SKU
                      <input
                        aria-label={`Quick order SKU ${i + 1}`}
                        value={r.sku}
                        placeholder="e.g. CGL-004"
                        onChange={(e) =>
                          setQuick(
                            quick.map((x, j) =>
                              j === i
                                ? { ...x, sku: e.target.value, error: "" }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Quantity
                      <input
                        aria-label={`Quick order quantity ${i + 1}`}
                        value={r.quantity}
                        type="number"
                        min="1"
                        onChange={(e) =>
                          setQuick(
                            quick.map((x, j) =>
                              j === i
                                ? { ...x, quantity: e.target.value, error: "" }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <button
                      className="icon-button"
                      aria-label={`Remove quick order row ${i + 1}`}
                      disabled={quick.length === 1}
                      onClick={() => setQuick(quick.filter((_, j) => j !== i))}
                    >
                      <Icon name="close" />
                    </button>
                    {r.error && (
                      <p className="error" role="alert">
                        {r.error}
                      </p>
                    )}
                  </div>
                ))}
                <div className="actions">
                  <button
                    className="button outline"
                    onClick={() =>
                      setQuick([
                        ...quick,
                        { sku: "", quantity: "1", error: "" },
                      ])
                    }
                  >
                    <Icon name="plus" />
                    Add row
                  </button>
                  <button className="button" onClick={addQuick}>
                    Add valid rows to cart
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="sku-paste">Paste your list</label>
                <textarea
                  id="sku-paste"
                  rows={5}
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  placeholder={"CGL-004, 25\nGJS-002, 5"}
                />
                <button
                  className="button outline"
                  disabled={!paste.trim()}
                  onClick={() => {
                    const rows = paste
                      .trim()
                      .split("\n")
                      .map((line) => {
                        const [sku, quantity = "1"] = line
                          .trim()
                          .split(/[\s,;\t]+/);
                        return { sku, quantity, error: "" };
                      });
                    setQuick([...quick.filter((r) => r.sku), ...rows]);
                    setPaste("");
                  }}
                >
                  Load rows
                </button>
              </div>
            </div>
          </section>
        </>
      ) : stage === "Demo confirmation" && confirmation ? (
        <div className="confirmation">
          <Icon name="success" size={54} />
          <h2>Your demo order has been reviewed.</h2>
          <p>No real order was placed and no payment was taken.</p>
          <p>
            {confirmation.lines.reduce((n, l) => n + l.quantity, 0)} items ·{" "}
            {money(confirmation.total)} product total inc GST
          </p>
          <Link href="shop.html" className="button">
            Continue browsing <Icon name="arrow" />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="checkout-panel">
            {stage === "Account" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  s.setDemo(true);
                  change("Delivery");
                }}
              >
                <h2>Continue with a registered account</h2>
                <p>
                  This is a demo account transition. Use example details;
                  credentials are not saved.
                </p>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    minLength={8}
                    required
                    autoComplete="off"
                  />
                </label>
                <label className="inline-check">
                  <input type="checkbox" required />I understand this is a demo
                  sign-in / registration.
                </label>
                <button className="button">
                  Continue demo checkout <Icon name="arrow" />
                </button>
              </form>
            ) : stage === "Delivery" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = Object.fromEntries(
                    new FormData(e.currentTarget),
                  ) as Record<string, string>;
                  setDelivery(v);
                  change("Payment preview");
                }}
              >
                <h2>Delivery details</h2>
                <div className="form-grid">
                  {[
                    ["name", "Full name"],
                    ["company", "Company (optional)"],
                    ["address", "Street address"],
                    ["city", "Suburb / city"],
                    ["state", "State / region"],
                    ["postcode", "Postcode"],
                    ["country", "Country"],
                  ].map(([k, l]) => (
                    <label key={k}>
                      {l}
                      <input
                        name={k}
                        defaultValue={delivery[k] || ""}
                        required={k !== "company"}
                      />
                    </label>
                  ))}
                </div>
                <fieldset>
                  <legend>Delivery method</legend>
                  {[
                    "Australia Post parcel — quote pending",
                    "Australia Post express — quote pending",
                    "DHL / FedEx — freight quote pending",
                    "Pickup",
                  ].map((m) => (
                    <label className="choice" key={m}>
                      <input
                        type="radio"
                        name="method"
                        value={m}
                        defaultChecked={
                          delivery.method
                            ? delivery.method === m
                            : m === "Australia Post parcel — quote pending"
                        }
                      />
                      <span>
                        {m}
                        {m === "Pickup" && (
                          <small>
                            Carrum Downs, Victoria. Collection availability is
                            confirmed separately.
                          </small>
                        )}
                      </span>
                    </label>
                  ))}
                </fieldset>
                <button className="button">
                  Continue to payment preview <Icon name="arrow" />
                </button>
              </form>
            ) : stage === "Payment preview" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPayment(
                    String(new FormData(e.currentTarget).get("method")),
                  );
                  change("Review");
                }}
              >
                <h2>Choose a payment method</h2>
                <p>Preview only. No card or bank details are collected.</p>
                <fieldset>
                  <legend>Payment options</legend>
                  {[
                    "Card payment",
                    "Bank transfer",
                    "Trade account — subject to approval",
                  ].map((m) => (
                    <label className="choice" key={m}>
                      <input
                        type="radio"
                        name="method"
                        value={m}
                        required
                        defaultChecked={payment === m}
                      />
                      {m}
                    </label>
                  ))}
                </fieldset>
                <label>
                  Your purchase order number (optional)
                  <input
                    name="purchaseOrder"
                    maxLength={80}
                    value={purchaseOrder}
                    onChange={(e) => setPurchaseOrder(e.target.value)}
                    autoComplete="off"
                  />
                </label>
                <button className="button">
                  Review demo order <Icon name="arrow" />
                </button>
              </form>
            ) : (
              <>
                <h2>Review your demo order</h2>
                {s.cart.map((l: CartLine) => (
                  <div key={l.sku} className="review-line">
                    <span>
                      {l.sku} × {l.quantity}
                    </span>
                    <strong>
                      {money(lineTotals(productBySku(l.sku)!, l.quantity).inc)}
                    </strong>
                  </div>
                ))}
                <h3>Delivery</h3>
                <p>
                  {delivery.name}
                  <br />
                  {delivery.address}
                  <br />
                  {delivery.city}, {delivery.state} {delivery.postcode}
                  <br />
                  {delivery.country}
                </p>
                <p>{delivery.method}</p>
                <h3>Payment preview</h3>
                <p>{payment}</p>
                {purchaseOrder && (
                  <p>
                    Purchase order reference: <strong>{purchaseOrder}</strong>
                  </p>
                )}
                <p className="notice">
                  Completing this demonstration does not submit an order,
                  reserve stock or charge a payment.
                </p>
                <button
                  className="button"
                  onClick={() => {
                    setConfirmation({
                      lines: [...s.cart],
                      total: s.totals.inc,
                    });
                    s.setCart([]);
                    setDelivery({});
                    setPayment("");
                    setPurchaseOrder("");
                    change("Demo confirmation");
                  }}
                >
                  Complete demo order <Icon name="check" />
                </button>
              </>
            )}
            {localError && <p className="error">{localError}</p>}
            {stage !== "Account" && (
              <button
                className="text-button back-step"
                onClick={() => change(stages[stages.indexOf(stage) - 1])}
              >
                ← Back
              </button>
            )}
          </section>
          {subtotal}
        </div>
      )}
    </>
  );
}
