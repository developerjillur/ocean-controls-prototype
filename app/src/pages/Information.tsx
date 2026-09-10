import { useState, useEffect } from "react";
import content from "../data/content.json";
import { useLocation, setQuery } from "../domain/navigation";
import { Link, Icon, Breadcrumb, PageTitle, Empty } from "../components/ui";
export function DistributorsPage() {
  useLocation();
  const s = new URLSearchParams(location.search),
    q = s.get("q") || "",
    region = s.get("region") || "";
  const list = content.distributors.filter(
    (d) =>
      (!region || d.region === region) &&
      [d.name, ...d.paras].join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <Breadcrumb items={["Distributors"]} />
      <PageTitle
        eyebrow="OUR INTERNATIONAL NETWORK"
        title="Distributors & resellers"
        blue
      >
        Find an Ocean Controls distributor in your region.
      </PageTitle>
      <div className="browse-controls">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search distributors"
            placeholder="Search name or location"
            value={q}
            onChange={(e) => setQuery({ q: e.target.value })}
          />
        </label>
        <label>
          Region
          <select
            aria-label="Distributor region"
            value={region}
            onChange={(e) => setQuery({ region: e.target.value })}
          >
            <option value="">All regions</option>
            {[...new Set(content.distributors.map((d) => d.region))].map(
              (r) => (
                <option key={r}>{r}</option>
              ),
            )}
          </select>
        </label>
        <button
          className="button outline"
          onClick={() => setQuery({ region: null, q: null })}
        >
          Reset
        </button>
      </div>
      <p className="muted">{list.length} distributors</p>
      <div className="distributor-grid">
        {list.map((d) => (
          <article className="distributor-card" key={d.name}>
            <div className="distributor-logo">
              <img src={d.image} alt={d.name} width="180" height="80" />
            </div>
            <span className="eyebrow">{d.region}</span>
            <h2>{d.name}</h2>
            {d.paras.map((p, i) => (
              <p className="distributor-copy" key={i}>{p}</p>
            ))}
            <div className="distributor-contacts">
              {d.emails.map(email => <a key={email} href={`mailto:${email}`}><Icon name="mail" size={16} />{email}</a>)}
              {d.phones.map(phone => <a key={phone.value} href={`tel:${phone.value}`}><Icon name="phone" size={16} />{phone.label}</a>)}
            </div>
            <a
              className="text-link"
              href={d.url}
              target="_blank"
              rel="noreferrer"
            >
              Visit distributor <Icon name="external" size={17} />
            </a>
          </article>
        ))}
      </div>
      {!list.length && (
        <Empty title="No matching distributors">
          <button
            className="button"
            onClick={() => setQuery({ q: null, region: null })}
          >
            Show all distributors
          </button>
        </Empty>
      )}
      <div className="enquiry-banner">
        <div>
          <h2>Need help finding a local supplier?</h2>
          <p>Contact our team for product and availability enquiries.</p>
        </div>
        <Link className="button" href="contact.html?topic=Distributor+enquiry">
          Contact us <Icon name="arrow" />
        </Link>
      </div>
    </>
  );
}
export function ContactPage() {
  useLocation();
  const s = new URLSearchParams(location.search);
  const [topic, setTopic] = useState(s.get("topic") || "Product advice");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setTopic(s.get("topic") || "Product advice");
    setDone(false);
  }, [location.search]);
  return (
    <>
      <Breadcrumb items={["Contact"]} />
      <PageTitle
        eyebrow="LET’S TALK ABOUT YOUR APPLICATION"
        title="How can we help?"
        blue
      >
        Product advice, technical documentation or a custom engineering project.
        Start a conversation with our team.
      </PageTitle>
      <div className="contact-layout">
        <aside>
          <h2>Talk to Ocean Controls</h2>
          <a className="contact-channel" href="tel:+61397082390">
            <Icon name="phone" />
            <span>
              <small>Call our team</small>
              <strong>+61 3 9708 2390</strong>
            </span>
          </a>
          <a
            className="contact-channel"
            href="mailto:orders@oceancontrols.com.au"
          >
            <Icon name="mail" />
            <span>
              <small>Orders & enquiries</small>
              <strong>orders@oceancontrols.com.au</strong>
            </span>
          </a>
          <div className="contact-channel">
            <Icon name="pin" />
            <span>
              <small>Visit our warehouse</small>
              <strong>
                44 Frankston Gardens Drive
                <br />
                Carrum Downs VIC 3201
              </strong>
              <p>
                Monday–Friday, 9am–5pm
                <br />
                Excludes public holidays.
              </p>
            </span>
          </div>
          <h3>Helpful resources</h3>
          {[
            ["Technical documents", "datasheets.html"],
            ["Shipping & delivery", "policies.html#shipping"],
            ["Returns & warranty", "policies.html#returns"],
            ["Distributor network", "distributors.html"],
          ].map(([l, u]) => (
            <Link className="result-link" key={u} href={u}>
              {l}
              <Icon name="arrow" />
            </Link>
          ))}
        </aside>
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <h2>Send an enquiry</h2>
          <p>
            Preview your enquiry below. Form delivery is not connected in this
            local preview.
          </p>
          <label>
            Enquiry type
            <select
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setDone(false);
              }}
            >
              {[
                ...new Set([
                  "Product advice",
                  "Engineering",
                  "Document request",
                  "Order enquiry",
                  "Distributor enquiry",
                  "General enquiry",
                  s.get("topic") || "",
                ]),
              ]
                .filter(Boolean)
                .map((v) => (
                  <option key={v}>{v}</option>
                ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              Full name
              <input required name="name" autoComplete="name" />
            </label>
            <label>
              Email address
              <input required type="email" name="email" autoComplete="email" />
            </label>
            <label>
              Company
              <input name="company" autoComplete="organization" />
            </label>
            <label>
              Phone (optional)
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
          </div>
          <label>
            {topic === "Document request"
              ? "Product SKU / document required"
              : "Product SKU / model (if known)"}
            <input name="sku" defaultValue={s.get("sku") || ""} />
          </label>
          {s.get("brand") && (
            <label>
              Brand
              <input readOnly value={s.get("brand")!} />
            </label>
          )}
          {s.get("industry") && (
            <label>
              Industry
              <input readOnly value={s.get("industry")!} />
            </label>
          )}
          {topic === "Engineering" && (
            <label>
              Project stage
              <select>
                <option>Exploring an idea</option>
                <option>Specification ready</option>
                <option>Existing system / upgrade</option>
              </select>
            </label>
          )}
          <label>
            {topic === "Engineering"
              ? "Tell us about your project"
              : "How can we help?"}
            <textarea name="message" required minLength={10} rows={6} />
          </label>
          <button className="button">
            Review enquiry <Icon name="arrow" />
          </button>
          {done && (
            <div className="notice" role="status">
              <strong>Your enquiry is ready to review.</strong>
              <p>
                No message has been sent. To contact the team, use the email or
                telephone links on this page.
              </p>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
export function PoliciesPage() {
  useLocation();
  const id = location.hash.slice(1) || "shipping";
  const links = [
    ["shipping", "Shipping & delivery"],
    ["returns", "Returns & warranty"],
    ["privacy", "Privacy"],
    ["terms", "Terms of sale"],
    ["sitemap", "Sitemap"],
  ];
  return (
    <>
      <Breadcrumb items={["Policies & information"]} />
      <PageTitle eyebrow="CUSTOMER INFORMATION" title="Policies & support" />
      <div className="policy-layout">
        <nav aria-label="Policy sections">
          {links.map(([key, label]) => (
            <Link
              key={key}
              className={id === key ? "active" : ""}
              href={`policies.html#${key}`}
            >
              {label}
              <Icon name="right" />
            </Link>
          ))}
        </nav>
        <article className="prose policy-copy" id={id}>
          <h2>{links.find((x) => x[0] === id)?.[1] || "Information"}</h2>
          {content.policies
            .find((p) => p.id === id)
            ?.blocks.map((b, i) => (
              <p key={i}>{b.text}</p>
            ))}
          {id === "terms" && (
            <>
              <p>
                The existing terms of trade are available in the supplied source
                document. Confirm applicable terms with Ocean Controls before a
                real purchase.
              </p>
              <a
                className="button outline"
                href="assets/documents/terms-of-trade.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Read terms of trade <Icon name="document" />
              </a>
            </>
          )}
          {id === "privacy" && (
            <>
              <p>
                The approved current{" "}
                {id === "privacy" ? "privacy policy" : "terms of sale"} has not
                been supplied for this preview.
              </p>
              <p>
                Contact Ocean Controls for the applicable policy before placing
                a real order.
              </p>
              <Link
                href="contact.html?topic=General+enquiry"
                className="button outline"
              >
                Request policy information
              </Link>
            </>
          )}
          {id === "sitemap" && (
            <div className="menu-links">
              {[
                "index",
                "shop",
                "category",
                "brands",
                "search",
                "product",
                "datasheets",
                "about",
                "distributors",
                "articles",
                "cart",
                "sign-in",
                "account",
                "trade-account",
                "contact",
              ].map((r) => (
                <Link href={r + ".html"} key={r}>
                  {r === "index" ? "Home" : r.replaceAll("-", " ")}
                  <Icon name="arrow" />
                </Link>
              ))}
            </div>
          )}
        </article>
      </div>
    </>
  );
}
