import { useState, useEffect } from "react";
import { useLocation, setQuery } from "../domain/navigation";
import data from "../data/engineering.json";
import { productBySku, productUrl, products } from "../domain/catalogue";
import { ProductCard } from "../components/ProductCard";
import { Breadcrumb, Link, Icon, Tabs } from "../components/ui";
const ids = [
  "who-we-are",
  "services",
  "projects",
  "clients",
  "own-range",
  "process",
  "visit-us",
];
function Parts({ skus }: { skus: string[] }) {
  return (
    <div className="related-parts">
      {skus.map((sku) => {
        const p = productBySku(sku);
        return p ? (
          <Link key={sku} href={productUrl(sku)}>
            <img src={p.images[0]} alt="" width="64" height="64" />
            <span>
              <strong>{sku}</strong>
              <small>{p.name}</small>
            </span>
            <Icon name="arrow" size={16} />
          </Link>
        ) : (
          <Link key={sku} href={`contact.html?topic=Product+advice&sku=${sku}`}>
            <span>
              <strong>{sku}</strong>
              <small>Ask about availability</small>
            </span>
            <Icon name="arrow" size={16} />
          </Link>
        );
      })}
    </div>
  );
}
export function EngineeringPage() {
  useLocation();
  const params = new URLSearchParams(location.search);
  const discipline =
    data.DISCIPLINES.find((d) => d.tab === params.get("service"))?.tab ||
    data.DISCIPLINES[0].tab;
  const project =
    data.PROJECTS.find((p) => p.tab === params.get("project"))?.tab ||
    data.PROJECTS[0].tab;
  const setDiscipline = (value: string) => setQuery({ service: value }, false);
  const setProject = (value: string) => setQuery({ project: value }, false);
  const [active, setActive] = useState("who-we-are");
  const d = data.DISCIPLINES.find((x) => x.tab === discipline)!;
  const p = data.PROJECTS.find((x) => x.tab === project)!;
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-10% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return (
    <>
      <Breadcrumb items={["About & Engineering"]} />
      <section className="engineering-hero">
        <div>
          <span className="eyebrow">PRODUCTS. PEOPLE. PRACTICAL KNOW-HOW.</span>
          <h1>
            Engineering the right solution.
            <br />
            <em>From idea to installation.</em>
          </h1>
          <p>
            Industrial automation products and custom engineering expertise,
            together under one roof in Carrum Downs.
          </p>
          <div className="actions">
            <Link className="button" href="contact.html?topic=Engineering">
              Discuss your project <Icon name="arrow" />
            </Link>
            <a className="button light-outline" href="#services">
              Explore our services
            </a>
          </div>
        </div>
        <figure>
          <img
            src="assets/editorial/engineering-workbench.webp"
            alt="Illustrative electronics development workbench"
            width="720"
            height="600"
          />
          <figcaption>Engineering services · illustrative workspace</figcaption>
        </figure>
      </section>
      <nav className="section-nav" aria-label="Engineering sections">
        {data.SECTIONS.map((s, i) => (
          <a
            key={s}
            href={"#" + ids[i]}
            aria-current={active === ids[i] ? "location" : undefined}
          >
            {s}
          </a>
        ))}
      </nav>
      <section id="who-we-are" className="section about-intro">
        <div>
          <span className="eyebrow">WHO WE ARE</span>
          <h2>
            A supplier that understands
            <br />
            what you’re building.
          </h2>
        </div>
        <div className="prose">
          <p>
            Ocean Controls supplies industrial automation and control equipment,
            alongside engineering design, software solutions, support and
            training for industrial and technical applications.
          </p>
          <p>
            Our catalogue and engineering services work together. Start with an
            available component, adapt existing hardware, or develop a custom
            solution when the application calls for it.
          </p>
          <Link href="shop.html" className="text-link">
            Explore the product range <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <section id="services" className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR ENGINEERING CAPABILITIES</span>
            <h2>Expertise across the whole system.</h2>
          </div>
          <p>Hardware, firmware, controls and connectivity.</p>
        </div>
        <Tabs
          panelPrefix="service"
          labels={data.DISCIPLINES.map((x) => x.tab)}
          value={discipline}
          onChange={setDiscipline}
        />
        <div
          className="service-panel"
          id="service-panel"
          aria-labelledby={`service-tab-${data.DISCIPLINES.indexOf(d)}`}
          role="tabpanel"
          aria-label={discipline}
        >
          <div>
            <span className="service-symbol">
              <Icon name="settings" size={30} />
            </span>
            <h3>{d.title}</h3>
            <p>{d.blurb}</p>
            <ul className="check-list">
              {d.items.map((x) => (
                <li key={x}>
                  <Icon name="check" size={18} />
                  {x}
                </li>
              ))}
            </ul>
            <div className="tags">
              {d.platforms.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
          <aside>
            <h3>Explore related products</h3>
            <Parts skus={d.parts} />
            <Link
              href="contact.html?topic=Engineering"
              className="button outline full"
            >
              Discuss an engineering brief <Icon name="arrow" />
            </Link>
          </aside>
        </div>
      </section>
      <section id="projects" className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ENGINEERING IN PRACTICE</span>
            <h2>Real problems. Practical solutions.</h2>
          </div>
        </div>
        <Tabs
          panelPrefix="project"
          labels={data.PROJECTS.map((x) => x.tab)}
          value={project}
          onChange={setProject}
        />
        <article
          className="project-panel"
          id="project-panel"
          aria-labelledby={`project-tab-${data.PROJECTS.indexOf(p)}`}
          role="tabpanel"
          aria-label={project}
        >
          <div>
            <span className="eyebrow">
              {p.kind} · {p.client}
            </span>
            <h3>{p.title}</h3>
            {p.images.length > 0 && (
              <div className="project-photos">
                {p.images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt="Crush tester project at Australian Compliance Laboratory"
                    width="700"
                    height="450"
                    loading="lazy"
                  />
                ))}
              </div>
            )}
            {p.credits.length > 0 && (
              <div
                className="project-credits"
                aria-label="Project organisations"
              >
                {p.credits.map((credit) => (
                  <img
                    key={credit.src}
                    src={credit.src}
                    alt={credit.name}
                    width="160"
                    height="72"
                    loading="lazy"
                  />
                ))}
              </div>
            )}
            {p.paras.map((x) => (
              <p key={x}>{x}</p>
            ))}
            {p.hasQuote && (
              <blockquote>
                “{p.quote}”<cite>{p.quoteBy}</cite>
              </blockquote>
            )}
          </div>
          <aside>
            <div className="project-specs">
              {p.specs.map(([v, k]) => (
                <div key={k}>
                  <strong>{v}</strong>
                  <span>{k}</span>
                </div>
              ))}
            </div>
            <h4>{p.partsLabel}</h4>
            <Parts skus={p.parts} />
            <p className="muted">{p.partsNote}</p>
          </aside>
        </article>
      </section>
      <section id="clients" className="section clients-section">
        <span className="eyebrow">WHO WE WORK WITH</span>
        <h2>Across industry, infrastructure and research.</h2>
        <div className="client-grid">
          {data.CUSTOMERS.map((c) => (
            <div key={c}>{c}</div>
          ))}
        </div>
      </section>
      <section id="own-range" className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE OCEAN CONTROLS RANGE</span>
            <h2>Practical tools, built around real needs.</h2>
          </div>
          <Link href="shop.html?brand=Ocean+Controls">
            View our range <Icon name="arrow" />
          </Link>
        </div>
        <div className="product-grid four">
          {products
            .filter((p) => p.brand === "Ocean Controls")
            .slice(0, 4)
            .map((p) => (
              <ProductCard p={p} key={p.sku} />
            ))}
        </div>
        <h3 className="subsection-title">Software & configuration tools</h3>
        <div className="three-grid">
          {data.SOFTWARE.map(([sku, title, desc]) => (
            <Link
              className="software-card"
              key={sku}
              href={
                productBySku(sku)
                  ? productUrl(sku)
                  : `contact.html?topic=Product+advice&sku=${sku}`
              }
            >
              <Icon name="layers" size={25} />
              <small>{sku}</small>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span>
                Explore this software <Icon name="arrow" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section application-section">
        <div>
          <span className="eyebrow">BUILT FOR THE APPLICATION</span>
          <h2>
            From the factory floor
            <br />
            to the field.
          </h2>
        </div>
        <ul className="check-list">
          {data.APPLICATIONS.map((x) => (
            <li key={x}>
              <Icon name="check" />
              {x}
            </li>
          ))}
        </ul>
      </section>
      <section id="process" className="section">
        <span className="eyebrow">HOW WE WORK</span>
        <h2>A clear path from brief to build.</h2>
        <div className="process-grid">
          {data.PROCESS.map(([n, label, title, body]) => (
            <article key={n}>
              <span className="step-number">{n}</span>
              <small>{label}</small>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="visit-us" className="enquiry-banner">
        <div>
          <span className="eyebrow">VISIT OR TALK TO US</span>
          <h2>Let’s talk through your next project.</h2>
          <p>
            44 Frankston Gardens Drive, Carrum Downs VIC 3201.
            <br />
            Call <a href="tel:+61397082390">+61 3 9708 2390</a> or send an
            engineering enquiry.
          </p>
        </div>
        <Link href="contact.html?topic=Engineering" className="button">
          Discuss your project <Icon name="arrow" />
        </Link>
      </section>
    </>
  );
}
