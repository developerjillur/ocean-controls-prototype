import { useState } from "react";
import { products } from "../domain/catalogue";
import { ProductCard, Quantity, Stock } from "../components/ProductCard";
import { PageTitle, Icon, Modal, Tabs, Empty } from "../components/ui";
export function ComponentPreview() {
  const [q, setQ] = useState(25);
  const [tab, setTab] = useState("Default");
  const [modal, setModal] = useState(false);
  return (
    <>
      <PageTitle
        eyebrow="LOCAL VERIFICATION"
        title="Component & state preview"
      />
      <section className="section">
        <h2>Controls</h2>
        <div className="actions">
          <button className="button">
            Primary <Icon name="arrow" />
          </button>
          <button className="button outline">Secondary</button>
          <button className="button" disabled>
            Unavailable
          </button>
          <button className="button outline" onClick={() => setModal(true)}>
            Open dialog
          </button>
          <Quantity value={q} onChange={setQ} />
        </div>
        <Tabs
          labels={["Default", "Selected", "Long content example"]}
          value={tab}
          onChange={setTab}
        />
        <div role="tabpanel">
          <p>{tab}</p>
          <label>
            Example field
            <input placeholder="Focus and type here" />
          </label>
          <p className="error">Example: enter a whole quantity.</p>
          <p className="notice">Example notice: delivery quote pending.</p>
        </div>
      </section>
      <section className="section">
        <h2>Long product names, price and stock</h2>
        <div className="product-grid four">
          {[...products]
            .sort((a, b) => b.name.length - a.name.length)
            .slice(0, 4)
            .map((p) => (
              <ProductCard p={p} key={p.sku} />
            ))}
        </div>
      </section>
      <Empty title="Example empty state">
        <p>Clear guidance and a useful next action.</p>
        <button className="button">Reset filters</button>
      </Empty>
      {modal && (
        <Modal
          title="Keyboard and focus verification"
          onClose={() => setModal(false)}
        >
          <label>
            First field
            <input />
          </label>
          <button className="button" onClick={() => setModal(false)}>
            Close dialog
          </button>
        </Modal>
      )}
    </>
  );
}
