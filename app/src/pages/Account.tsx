import { useState } from "react";
import { useStore } from "../domain/store";
import { productBySku, productUrl, documents } from "../domain/catalogue";
import { useLocation, setQuery, navigate } from "../domain/navigation";
import {
  Breadcrumb,
  PageTitle,
  Link,
  Icon,
  Tabs,
  Modal,
} from "../components/ui";
import { money, lineTotals } from "../domain/commerce";
export function SignInPage() {
  const [tab, setTab] = useState("Sign in");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const { setDemo } = useStore();
  return (
    <>
      <Breadcrumb items={["Account", tab]} />
      <div className="auth-layout">
        <section>
          <span className="eyebrow">YOUR OCEAN CONTROLS ACCOUNT</span>
          <h1>
            Everything you need.
            <br />
            One place to manage it.
          </h1>
          <p>
            Review orders, access product documentation and manage your account
            details.
          </p>
          <ul className="check-list">
            <li>
              <Icon name="check" />
              Registered-customer checkout
            </li>
            <li>
              <Icon name="check" />
              Order and invoice access
            </li>
            <li>
              <Icon name="check" />
              Product documentation
            </li>
          </ul>
          <Link href="trade-account.html" className="text-link">
            Explore trade accounts <Icon name="arrow" />
          </Link>
        </section>
        <div className="auth-card">
          <Tabs
            labels={["Sign in", "Register", "Reset password"]}
            value={tab}
            onChange={(v) => {
              setTab(v);
              setMessage("");
            }}
          />
          <form
            key={tab}
            onSubmit={(e) => {
              e.preventDefault();
              if (tab === "Reset password") {
                setMessage(
                  "Email validated. Password reset delivery is not connected in this demo.",
                );
                return;
              }
              setDemo(true);
              navigate("account.html");
            }}
          >
            <h2>{tab}</h2>
            <p>This is a demo account preview. Use example details.</p>
            {tab === "Register" && (
              <label>
                Full name
                <input required autoComplete="off" />
              </label>
            )}
            <label>
              Email
              <input type="email" required autoComplete="off" />
            </label>
            {tab !== "Reset password" && (
              <label>
                Password
                <div className="password-field">
                  <input
                    aria-label="Password"
                    type={show ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
                <small>Use at least eight characters.</small>
              </label>
            )}
            <button className="button full">
              {tab === "Reset password"
                ? "Preview reset request"
                : tab === "Register"
                  ? "Create demo account"
                  : "Sign in to demo account"}
              <Icon name="arrow" />
            </button>
            {message && (
              <p className="notice" role="status">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
export function AccountPage() {
  useLocation();
  const { demo, setDemo, add, setNotice } = useStore();
  const tab = new URLSearchParams(location.search).get("tab") || "Dashboard";
  const [detail, setDetail] = useState(false);
  const orderStates = [
    "All",
    "Processing",
    "Part shipped",
    "Delivered",
    "Cancelled",
  ];
  const requestedStatus =
    new URLSearchParams(location.search).get("status") || "All";
  const orderStatus = orderStates.includes(requestedStatus)
    ? requestedStatus
    : "All";
  const p = productBySku("GJS-002")!;
  if (!demo)
    return (
      <>
        <Breadcrumb items={["Account"]} />
        <div className="account-intro">
          <Icon name="user" size={44} />
          <h1>Your Ocean Controls account</h1>
          <p>
            Sign in to preview order history, invoices, downloads and account
            details.
          </p>
          <Link className="button" href="sign-in.html">
            Sign in / Register <Icon name="arrow" />
          </Link>
          <button className="button outline" onClick={() => setDemo(true)}>
            Explore demo account
          </button>
        </div>
      </>
    );
  return (
    <>
      <Breadcrumb items={["Account", tab]} />
      <PageTitle
        eyebrow="DEMO CUSTOMER ACCOUNT"
        title="Welcome to your account"
      >
        Sample account screens for reviewing the customer experience. No live
        records or trade discounts are connected.
      </PageTitle>
      <div className="account-layout">
        <nav aria-label="Account sections">
          {[
            "Dashboard",
            "Orders",
            "Invoices",
            "Downloads",
            "Account details",
          ].map((t) => (
            <button
              key={t}
              className={t === tab ? "active" : ""}
              onClick={() => setQuery({ tab: t })}
            >
              {t}
              <Icon name="right" />
            </button>
          ))}
          <button
            onClick={() => {
              setDemo(false);
              navigate("sign-in.html");
            }}
          >
            Sign out <Icon name="arrow" />
          </button>
        </nav>
        <section className="account-panel">
          {tab === "Dashboard" ? (
            <>
              <h2>Your account at a glance</h2>
              <p>
                Explore a sample order or browse documentation for your next
                project.
              </p>
              <Link className="button outline" href="cart.html#quick-order">
                Open Quick Order <Icon name="arrow" />
              </Link>
              <div className="three-grid">
                {["Orders", "Invoices", "Downloads"].map((t) => (
                  <button
                    className="dashboard-card"
                    key={t}
                    onClick={() => setQuery({ tab: t })}
                  >
                    <Icon
                      name={t === "Orders" ? "cart" : "document"}
                      size={28}
                    />
                    <h3>{t}</h3>
                    <span>
                      View {t.toLowerCase()} <Icon name="arrow" />
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : tab === "Orders" ? (
            <>
              <h2>Orders</h2>
              <div
                className="order-filters"
                role="group"
                aria-label="Order status"
              >
                {orderStates.map((status) => (
                  <button
                    key={status}
                    className="button outline"
                    aria-pressed={orderStatus === status}
                    onClick={() => setQuery({ status })}
                  >
                    {status}
                  </button>
                ))}
              </div>
              {["All", "Processing"].includes(orderStatus) ? (
                <div className="order-card">
                  <div>
                    <span className="badge">DEMO ORDER</span>
                    <h3>Sample order · GJS-002 × 5</h3>
                    <p>Processing · demonstration status</p>
                    <p>{money(lineTotals(p, 5).inc)} inc GST</p>
                  </div>
                  <div className="actions">
                    <button
                      className="button outline"
                      onClick={() => setDetail(true)}
                    >
                      View order
                    </button>
                    <button className="button" onClick={() => add(p, 5)}>
                      Reorder sample items
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No {orderStatus.toLowerCase()} demo orders</h3>
                  <button
                    className="button outline"
                    onClick={() => setQuery({ status: "All" })}
                  >
                    Show all orders
                  </button>
                </div>
              )}
            </>
          ) : tab === "Invoices" ? (
            <>
              <h2>Invoices</h2>
              <p>No verified invoices are attached to this demo account.</p>
              <Link
                className="button outline"
                href="contact.html?topic=Order+enquiry"
              >
                Request invoice assistance
              </Link>
            </>
          ) : tab === "Downloads" ? (
            <>
              <h2>Product downloads</h2>
              <p>
                These are real catalogue documents, available without signing
                in.
              </p>
              {documents
                .filter((d) => d.skus.includes(p.sku))
                .map((d) => (
                  <a
                    className="document-link"
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    key={d.id}
                  >
                    <Icon name="document" />
                    <span>
                      {d.title}
                      <small>{d.format}</small>
                    </span>
                    <Icon name="download" />
                  </a>
                ))}
              <Link href="datasheets.html" className="button outline">
                Browse Technical Library
              </Link>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotice(
                  "Demo account details validated. Changes are not sent to a server.",
                );
              }}
            >
              <h2>Account details</h2>
              <div className="form-grid">
                <label>
                  Name
                  <input required defaultValue="Demo Customer" />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    defaultValue="customer@example.com"
                  />
                </label>
                <label>
                  Company
                  <input />
                </label>
                <label>
                  Telephone
                  <input type="tel" />
                </label>
                <label>
                  Street address
                  <input />
                </label>
                <label>
                  Suburb / city
                  <input />
                </label>
                <label>
                  Postcode
                  <input />
                </label>
                <label>
                  Country
                  <input />
                </label>
              </div>
              <button className="button">Review demo changes</button>
            </form>
          )}
        </section>
      </div>
      {detail && (
        <Modal title="Sample order details" onClose={() => setDetail(false)}>
          <p>Demonstration record. No order was placed.</p>
          <Link href={productUrl(p.sku)} onClick={() => setDetail(false)}>
            {p.name}
          </Link>
          <p>
            {p.sku} × 5 · {money(lineTotals(p, 5).inc)} inc GST
          </p>
          <button className="button" onClick={() => add(p, 5)}>
            Add these items to cart
          </button>
        </Modal>
      )}
    </>
  );
}
export function TradePage() {
  const [done, setDone] = useState(false);
  return (
    <>
      <Breadcrumb items={["Trade accounts"]} />
      <PageTitle
        eyebrow="WORKING TOGETHER"
        title="Trade account enquiries"
        blue
      >
        Tell us about your business and purchasing requirements.
      </PageTitle>
      <div className="contact-layout">
        <section>
          <h2>Support for your business</h2>
          <p>
            Discuss your purchasing requirements with the Ocean Controls team.
            Account terms and any pricing arrangements require individual
            review.
          </p>
          <ul className="check-list">
            <li>
              <Icon name="check" />
              Specialist product advice
            </li>
            <li>
              <Icon name="check" />
              Engineering and technical support
            </li>
            <li>
              <Icon name="check" />
              Registered-customer ordering
            </li>
          </ul>
          <Link href="contact.html" className="text-link">
            Talk to our team <Icon name="arrow" />
          </Link>
        </section>
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <h2>Business details</h2>
          <div className="form-grid">
            {[
              "Business name",
              "Contact name",
              "Business registration / ABN",
              "Phone",
            ].map((l) => (
              <label key={l}>
                {l}
                <input required />
              </label>
            ))}
          </div>
          <label>
            Business email
            <input type="email" required />
          </label>
          <label>
            Business address
            <textarea required rows={3} />
          </label>
          <label>
            What products or support do you need?
            <textarea required rows={4} />
          </label>
          <label className="inline-check">
            <input type="checkbox" required />I understand this is an
            application preview and does not grant an account or credit terms.
          </label>
          <button className="button">
            Review application <Icon name="arrow" />
          </button>
          {done && (
            <div className="notice" role="status">
              <strong>Application details validated.</strong>
              <p>
                No application has been submitted. Contact the team to discuss
                your requirements.
              </p>
              <a href="mailto:orders@oceancontrols.com.au">
                Email Ocean Controls
              </a>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
