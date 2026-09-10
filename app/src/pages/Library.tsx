import { useEffect, useMemo, useState } from "react";
import { documents, productBySku } from "../domain/catalogue";
import { setQuery, useLocation } from "../domain/navigation";
import { useStore } from "../domain/store";
import {
  Breadcrumb,
  PageTitle,
  Icon,
  Link,
  Modal,
  Pagination,
  Empty,
} from "../components/ui";
import type { DocumentRecord } from "../domain/types";
export function LibraryPage() {
  useLocation();
  const s = new URLSearchParams(location.search);
  const q = s.get("q") || "";
  const formats = s.getAll("format"),
    types = s.getAll("type"),
    brands = s.getAll("brand"),
    cats = s.getAll("category");
  const group = s.get("group") || "None",
    sort = s.get("sort") || "relevance";
  const [selection, setSelection] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);
  const { setNotice } = useStore();
  const signature = JSON.stringify([q, formats, types, brands, cats]);
  useEffect(() => setSelection([]), [signature]);
  function matches(d: DocumentRecord, ignore = "") {
    const text = [
      d.title,
      ...d.skus,
      ...d.brands,
      ...d.skus.map((sku) => productBySku(sku)?.name || ""),
    ]
      .join(" ")
      .toLowerCase();
    return (
      text.includes(q.trim().toLowerCase()) &&
      (ignore === "format" || !formats.length || formats.includes(d.format)) &&
      (ignore === "type" ||
        !types.length ||
        types.includes(d.classification)) &&
      (ignore === "category" ||
        !cats.length ||
        d.categories.some((c) => cats.includes(c.split(" >>> ")[0]))) &&
      (ignore === "brand" ||
        !brands.length ||
        d.brands.some((b) => brands.includes(b)))
    );
  }
  const relevance = (d: DocumentRecord) => {
    const term = q.trim().toLowerCase();
    return !term
      ? 0
      : d.skus.some((s) => s.toLowerCase() === term)
        ? 4
        : d.skus.some((s) => s.toLowerCase().startsWith(term))
          ? 3
          : d.title.toLowerCase().startsWith(term)
            ? 2
            : 1;
  };
  const list = documents
    .filter((d) => matches(d))
    .sort((a, b) =>
      sort === "size"
        ? a.bytes - b.bytes
        : sort === "format"
          ? a.format.localeCompare(b.format)
          : sort === "brand"
            ? a.brands.join().localeCompare(b.brands.join())
            : sort === "product"
              ? (productBySku(a.skus[0])?.name || "").localeCompare(
                  productBySku(b.skus[0])?.name || "",
                )
              : (sort === "relevance" ? relevance(b) - relevance(a) : 0) ||
                a.title.localeCompare(b.title),
    );
  const page = Math.min(
    Math.max(1, Number(s.get("page")) || 1),
    Math.max(1, Math.ceil(list.length / 20)),
  );
  const shown = list.slice((page - 1) * 20, page * 20);
  const grouped: Record<string, DocumentRecord[]> = {};
  for (const d of shown) {
    const key =
      group === "Product"
        ? d.skus.join(", ")
        : group === "Type"
          ? d.classification
          : "";
    (grouped[key] ??= []).push(d);
  }
  const toggle = (key: string, values: string[], value: string) =>
    setQuery({
      [key]: values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    });
  const selected = (id: string) =>
    setSelection(
      selection.includes(id)
        ? selection.filter((i) => i !== id)
        : [...selection, id],
    );
  const filter = (
    <>
      <div className="filter-heading">
        <h2>
          <Icon name="filter" />
          Filter documents
        </h2>
        <button
          className="text-button"
          onClick={() =>
            setQuery({
              format: null,
              type: null,
              brand: null,
              category: null,
              q: null,
            })
          }
        >
          Reset
        </button>
      </div>
      {[
        [
          "format",
          "File format",
          formats,
          [...new Set(documents.map((d) => d.format))],
        ],
        [
          "type",
          "Document type",
          types,
          [...new Set(documents.map((d) => d.classification))],
        ],
        [
          "category",
          "Category",
          cats,
          [
            ...new Set(
              documents.flatMap((d) =>
                d.categories.map((c) => c.split(" >>> ")[0]),
              ),
            ),
          ].sort(),
        ],
        [
          "brand",
          "Brand",
          brands,
          [...new Set(documents.flatMap((d) => d.brands))].sort(),
        ],
      ].map(([key, label, values, options]) => (
        <section className="filter-section" key={key as string}>
          <h3>{label as string}</h3>
          {(options as string[]).map((v) => (
            <label className="filter-check" key={v}>
              <input
                type="checkbox"
                checked={(values as string[]).includes(v)}
                onChange={() => toggle(key as string, values as string[], v)}
              />
              <span>{v}</span>
              <small>
                {
                  documents.filter(
                    (d) =>
                      matches(d, key as string) &&
                      (key === "format"
                        ? d.format === v
                        : key === "type"
                          ? d.classification === v
                          : key === "category"
                            ? d.categories.some(
                                (c) => c.split(" >>> ")[0] === v,
                              )
                            : d.brands.includes(v)),
                  ).length
                }
              </small>
            </label>
          ))}
        </section>
      ))}
    </>
  );
  return (
    <>
      <Breadcrumb items={["Technical Library"]} />
      <PageTitle
        eyebrow="DOCUMENTATION & RESOURCES"
        title="Technical Library"
        blue
      >
        Find the details you need to specify, install and commission your next
        project.
      </PageTitle>
      <div className="library-layout">
        <aside className="filters desktop-filters">{filter}</aside>
        <div className="results">
          <form
            className="library-search"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery({
                q: String(new FormData(e.currentTarget).get("q") || ""),
              });
            }}
          >
            <Icon name="search" />
            <input
              aria-label="Search documents"
              name="q"
              defaultValue={q}
              key={q}
              placeholder="Search SKU, product, document or brand"
            />
            <button className="button">Search</button>
          </form>
          <div className="results-toolbar">
            <strong>{list.length} documents</strong>
            <button
              className="filter-mobile button outline"
              onClick={() => setDrawer(true)}
            >
              <Icon name="filter" />
              Filters{" "}
              {formats.length + types.length + brands.length + cats.length ||
                ""}
            </button>
            <label>
              Group
              <select
                aria-label="Group documents"
                value={group}
                onChange={(e) => setQuery({ group: e.target.value }, false)}
              >
                {["None", "Product", "Type"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Sort
              <select
                aria-label="Sort documents"
                value={sort}
                onChange={(e) => setQuery({ sort: e.target.value }, false)}
              >
                <option value="relevance">
                  {q ? "Relevance" : "Title A–Z"}
                </option>
                <option value="product">Product A–Z</option>
                <option value="format">File format</option>
                <option value="size">File size</option>
                <option value="brand">Brand A–Z</option>
              </select>
            </label>
          </div>
          {(q ||
            formats.length + types.length + brands.length + cats.length >
              0) && (
            <div className="chips">
              {q && (
                <button onClick={() => setQuery({ q: null })}>
                  {q}
                  <Icon name="close" size={14} />
                </button>
              )}
              {[
                ["format", formats],
                ["type", types],
                ["brand", brands],
                ["category", cats],
              ].flatMap(([key, vs]) =>
                (vs as string[]).map((v) => (
                  <button
                    key={key + v}
                    onClick={() => toggle(key as string, vs as string[], v)}
                  >
                    {v}
                    <Icon name="close" size={14} />
                  </button>
                )),
              )}
            </div>
          )}
          <div className="document-selection">
            <label>
              <input
                type="checkbox"
                aria-label="Select documents on this page"
                checked={
                  shown.length > 0 &&
                  shown.every((d) => selection.includes(d.id))
                }
                onChange={(e) =>
                  setSelection(
                    e.target.checked
                      ? [...new Set([...selection, ...shown.map((d) => d.id)])]
                      : selection.filter(
                          (id) => !shown.some((d) => d.id === id),
                        ),
                  )
                }
              />
              Select this page
            </label>
            <button
              disabled={!selection.length}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    documents
                      .filter((d) => selection.includes(d.id))
                      .map((d) => new URL(d.url, location.href).href)
                      .join("\n"),
                  );
                  setNotice(`${selection.length} document links copied`);
                } catch {
                  setNotice(
                    "Clipboard access is unavailable. Open each document link to copy it.",
                  );
                }
              }}
            >
              <Icon name="document" size={16} />
              Copy selected links{" "}
              {selection.length > 0 && `(${selection.length})`}
            </button>
          </div>
          {!shown.length ? (
            <Empty title="No matching documents">
              <p>Try a different product name or remove a filter.</p>
              <Link
                href={`contact.html?topic=Document+request&sku=${encodeURIComponent(q)}`}
              >
                Request a document <Icon name="arrow" />
              </Link>
            </Empty>
          ) : (
            Object.entries(grouped).map(([label, docs]) => (
              <section className="document-group" key={label}>
                {label && <h2>{label}</h2>}
                {docs.map((d) => (
                  <article className="document-row" key={d.id}>
                    <label className="checkbox-target">
                      <input
                        type="checkbox"
                        aria-label={`Select ${d.title}`}
                        checked={selection.includes(d.id)}
                        onChange={() => selected(d.id)}
                      />
                    </label>
                    <div className="file-format">
                      <Icon name="document" size={25} />
                      <span>{d.format}</span>
                    </div>
                    <div className="document-info">
                      <h3>
                        <a href={d.url} target="_blank" rel="noreferrer">
                          {d.title}
                        </a>
                      </h3>
                      <p>
                        {d.skus.map((sku) => (
                          <Link key={sku} href={`product.html?sku=${sku}`}>
                            {sku}{" "}
                          </Link>
                        ))}{" "}
                        · {d.brands.join(", ")}
                      </p>
                      <small>
                        {d.classification}
                        {d.bytes
                          ? ` · ${(d.bytes / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </small>
                    </div>
                    <a
                      className="button outline"
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      download={d.format !== "HTML"}
                    >
                      <Icon name="download" size={17} />
                      {d.format === "HTML" ? "Open" : "Download"}
                    </a>
                  </article>
                ))}
              </section>
            ))
          )}
          <Pagination
            page={page}
            total={list.length}
            size={20}
            onPage={(n) => setQuery({ page: String(n) }, false)}
          />
          <p className="scope-note">
            Verified local documents for the represented catalogue. Access is
            open; no account required.
          </p>
        </div>
      </div>
      <div className="enquiry-banner">
        <div>
          <h2>Looking for a specific document?</h2>
          <p>Send us the SKU or model number and we’ll help you find it.</p>
        </div>
        <Link href="contact.html?topic=Document+request" className="button">
          Request a document <Icon name="arrow" />
        </Link>
      </div>
      {drawer && (
        <Modal title="Document filters" onClose={() => setDrawer(false)}>
          <div className="filters">{filter}</div>
          <button className="button full" onClick={() => setDrawer(false)}>
            Show {list.length} documents
          </button>
        </Modal>
      )}
    </>
  );
}
