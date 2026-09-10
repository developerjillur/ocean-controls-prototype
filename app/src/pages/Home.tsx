import { useState } from "react";
import {
  products,
  catalogue,
  categories,
  productUrl,
  productBySku,
} from "../domain/catalogue";
import { Link, Icon } from "../components/ui";
import { Price, Stock, Purchase } from "../components/ProductCard";
import content from "../data/content.json";
import directory from "../data/directory.json";
export function HomePage() {
  const featured = products.filter((p) => p.new);
  const [i, setI] = useState(0);
  const p = featured[i % featured.length];
  const featuredCats = [
    "Sensors",
    "Controllers",
    "Power Supplies",
    "Data Acquisition",
    "Modbus-Bacnet-MBus Products",
    "Motor Drivers & Controllers",
    "Relays & Relay Cards",
    "Weather",
  ];
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            AUSTRALIAN INDUSTRIAL AUTOMATION SPECIALISTS
          </span>
          <h1>
            Industrial Automation &amp; Engineering <em>Solutions</em>
          </h1>
          <p>
            From sensors and controllers to industrial power, communications and
            custom hardware. Find the products and expertise to build, control
            and monitor your next system.
          </p>
          <div className="actions">
            <Link href="shop.html" className="button bright">
              Browse catalogue <Icon name="arrow" />
            </Link>
            <Link
              href="contact.html?topic=Engineering"
              className="button light-outline"
            >
              Talk to an engineer
            </Link>
          </div>
          <div className="hero-links">
            <Link href="cart.html#quick-order">
              Quick Order pad <Icon name="arrow" size={15} />
            </Link>
            <Link href="datasheets.html">
              Technical documentation <Icon name="arrow" size={15} />
            </Link>
          </div>
        </div>
        <div className="hero-feature">
          <div className="row-between">
            <Link href="shop.html?collection=new" className="pill">
              NEW ARRIVALS
            </Link>
            <span className="feature-index">
              {String(i + 1).padStart(2, "0")} /{" "}
              {String(featured.length).padStart(2, "0")}
            </span>
          </div>
          <Link className="feature-image" href={productUrl(p.sku)}>
            <img src={p.images[0]} alt={p.name} width="420" height="270" />
          </Link>
          <div className="feature-details">
            <div>
              <span className="brand-label">
                {p.brand} · {p.sku}
              </span>
              <h2>
                <Link href={productUrl(p.sku)}>{p.name}</Link>
              </h2>
              <Stock p={p} />
            </div>
            <Price p={p} />
          </div>
          <div className="row-between">
            <Link className="text-link" href={productUrl(p.sku)}>
              Explore this product <Icon name="arrow" />
            </Link>
            <div className="carousel-controls">
              <button
                aria-label="Previous featured product"
                onClick={() =>
                  setI((i - 1 + featured.length) % featured.length)
                }
              >
                ←
              </button>
              <button
                aria-label="Next featured product"
                onClick={() => setI((i + 1) % featured.length)}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR NEXT COMPONENT</span>
            <h2>Browse by category</h2>
          </div>
          <Link href="shop.html">
            View all categories <Icon name="arrow" />
          </Link>
        </div>
        <div className="category-grid">
          {directory.categoryCards.map((c) => (
            <Link
              className="category-card"
              key={c.name}
              href={`shop.html?category=${encodeURIComponent(c.category)}`}
            >
              <div>
                <img
                  src={c.image}
                  alt=""
                  width="200"
                  height="130"
                  loading="lazy"
                />
              </div>
              <span>{c.name}</span>
              <Icon name="arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>
      <section className="home-engineering">
        <figure>
          <img
            src="assets/editorial/engineering-workbench.webp"
            alt="Illustrative electronics development workbench"
            width="700"
            height="460"
            loading="lazy"
          />
        </figure>
        <div>
          <span className="eyebrow">MORE THAN A COMPONENT SUPPLIER</span>
          <h2>
            From an idea
            <br />
            to a working solution.
          </h2>
          <p>
            Bring us the application. Our engineering team can help with custom
            electronics, PLC and machine control, embedded software, HMI and
            SCADA integration.
          </p>
          <ul className="check-list">
            <li>
              <Icon name="check" />
              Custom hardware & electronics
            </li>
            <li>
              <Icon name="check" />
              Industrial software & connectivity
            </li>
            <li>
              <Icon name="check" />
              Practical support from specification to commissioning
            </li>
          </ul>
          <div className="actions">
            <Link href="about.html" className="button">
              Explore engineering <Icon name="arrow" />
            </Link>
            <Link href="contact.html?topic=Engineering" className="text-link">
              Discuss your project <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SPECIALIST BRANDS</span>
            <h2>The right tools for the job.</h2>
          </div>
          <Link href="brands.html">
            All brands <Icon name="arrow" />
          </Link>
        </div>
        <div className="brand-strip">
          {Object.entries(catalogue.brandLogos)
            .filter(([name]) =>
              [
                "Novus",
                "Fema",
                "Akytec",
                "Foxtam Controls",
                "Leadshine",
                "Hanyoung Nux",
                "Teracom",
                "LabJack",
                "Mean Well / ESI",
                "Ocean Controls",
                "Milesight",
                "Rika Sensor",
              ].includes(name),
            )
            .map(([b, img]) => (
              <Link href={`shop.html?brand=${encodeURIComponent(b)}`} key={b}>
                <img src={img} alt={b} width="140" height="65" loading="lazy" />
              </Link>
            ))}
        </div>
      </section>
      <section className="section industries">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BUILT AROUND YOUR APPLICATION</span>
            <h2>Solutions across industries</h2>
          </div>
          <p>Control, measure and connect.</p>
        </div>
        <div className="industry-grid">
          {catalogue.industries.map((industry, i) => (
            <Link key={industry} href={`shop.html?industry=${industry}`}>
              <img
                src={`assets/editorial/industry-${industry.toLowerCase()}.webp`}
                alt=""
                width="960"
                height="640"
                loading="lazy"
              />
              <h3>{industry}</h3>
              <span>
                Explore applications <Icon name="arrow" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">KNOWLEDGE & PRODUCT NEWS</span>
            <h2>From the technical desk</h2>
          </div>
          <Link href="articles.html">
            All articles <Icon name="arrow" />
          </Link>
        </div>
        <div className="three-grid">
          {content.articles.slice(0, 3).map((a, i) => (
            <Link
              className="article-card"
              key={a.id}
              href={`articles.html?id=${a.id}`}
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
                    <Icon
                      name={i === 0 ? "globe" : i === 1 ? "layers" : "document"}
                      size={48}
                    />
                    <span>
                      OCEAN CONTROLS
                      <br />
                      TECHNICAL NOTES
                    </span>
                  </>
                )}
              </div>
              <div>
                <small>{a.date}</small>
                <h3>{a.title}</h3>
                <span>
                  Read article <Icon name="arrow" size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
