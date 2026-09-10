import React, { useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "./domain/store";
import { useLocation } from "./domain/navigation";
import { Header, Footer, Overlays } from "./components/Shell";
const HomePage = lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.HomePage })),
);
const CataloguePage = lazy(() =>
  import("./pages/Catalogue").then((m) => ({ default: m.CataloguePage })),
);
const ProductPage = lazy(() =>
  import("./pages/Product").then((m) => ({ default: m.ProductPage })),
);
const LibraryPage = lazy(() =>
  import("./pages/Library").then((m) => ({ default: m.LibraryPage })),
);
const EngineeringPage = lazy(() =>
  import("./pages/Engineering").then((m) => ({ default: m.EngineeringPage })),
);
const BrandsPage = lazy(() =>
  import("./pages/Discovery").then((m) => ({ default: m.BrandsPage })),
);
const SearchPage = lazy(() =>
  import("./pages/Discovery").then((m) => ({ default: m.SearchPage })),
);
const ArticlesPage = lazy(() =>
  import("./pages/Discovery").then((m) => ({ default: m.ArticlesPage })),
);
const CartPage = lazy(() =>
  import("./pages/Cart").then((m) => ({ default: m.CartPage })),
);
const ContactPage = lazy(() =>
  import("./pages/Information").then((m) => ({ default: m.ContactPage })),
);
const DistributorsPage = lazy(() =>
  import("./pages/Information").then((m) => ({ default: m.DistributorsPage })),
);
const PoliciesPage = lazy(() =>
  import("./pages/Information").then((m) => ({ default: m.PoliciesPage })),
);
const AccountPage = lazy(() =>
  import("./pages/Account").then((m) => ({ default: m.AccountPage })),
);
const SignInPage = lazy(() =>
  import("./pages/Account").then((m) => ({ default: m.SignInPage })),
);
const TradePage = lazy(() =>
  import("./pages/Account").then((m) => ({ default: m.TradePage })),
);
const ComponentPreview = lazy(() =>
  import("./pages/ComponentPreview").then((m) => ({
    default: m.ComponentPreview,
  })),
);
import { Empty, Link } from "./components/ui";
import "./styles.css";
const initialRoute = location.pathname.split("/").pop() || "index.html";
let InitialPage: React.ComponentType | undefined;
function App() {
  const locationKey = useLocation();
  const route = location.pathname.split("/").pop() || "index.html";
  useEffect(() => {
    document.title =
      (
        {
          "index.html": "Industrial Automation & Engineering",
          "shop.html": "Shop All Products",
          "about.html": "About & Engineering",
          "datasheets.html": "Technical Library",
          "product.html": "Product Detail",
          "cart.html": "Your Order",
        } as Record<string, string>
      )[route] || route.replace(".html", "").replaceAll("-", " ");
    document.title += " | Ocean Controls";
    if (location.hash) {
      let id = location.hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {}
      let observer: MutationObserver | undefined;
      const jump = () => {
        const target = document.getElementById(id);
        if (!target) return false;
        target.scrollIntoView({ block: "start" });
        if (id === "quick-order") target.querySelector("input")?.focus();
        observer?.disconnect();
        return true;
      };
      const frame = requestAnimationFrame(() => {
        if (!jump()) {
          observer = new MutationObserver(jump);
          observer.observe(document.getElementById("main")!, {
            childList: true,
            subtree: true,
          });
        }
      });
      return () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
      };
    }
  }, [locationKey, route]);
  const page =
    route === initialRoute && InitialPage ? (
      <InitialPage
        key={
          route === "product.html"
            ? new URLSearchParams(location.search).get("sku")
            : route
        }
      />
    ) : route === "index.html" ? (
      <HomePage />
    ) : ["shop.html", "category.html"].includes(route) ? (
      <CataloguePage />
    ) : route === "product.html" ? (
      <ProductPage key={new URLSearchParams(location.search).get("sku")} />
    ) : route === "datasheets.html" ? (
      <LibraryPage />
    ) : route === "about.html" ? (
      <EngineeringPage />
    ) : route === "brands.html" ? (
      <BrandsPage />
    ) : route === "search.html" ? (
      <SearchPage />
    ) : route === "articles.html" ? (
      <ArticlesPage />
    ) : route === "cart.html" ? (
      <CartPage />
    ) : route === "distributors.html" ? (
      <DistributorsPage />
    ) : route === "contact.html" ? (
      <ContactPage />
    ) : route === "policies.html" ? (
      <PoliciesPage />
    ) : route === "account.html" ? (
      <AccountPage />
    ) : route === "sign-in.html" ? (
      <SignInPage />
    ) : route === "trade-account.html" ? (
      <TradePage />
    ) : ["mobile.html", "error-states.html"].includes(route) ? (
      <ComponentPreview />
    ) : (
      <Empty title="Page not found">
        <Link href="index.html">Return home</Link>
      </Empty>
    );
  return (
    <>
      <Header />
      <main className="container" id="main" tabIndex={-1}>
        <Suspense
          fallback={
            <p className="page-loading" role="status">
              Loading page…
            </p>
          }
        >
          {page}
        </Suspense>
      </main>
      <Footer />
      <Overlays />
    </>
  );
}
const routeModules: Record<string, [string, string]> = {
  "index.html": ["Home", "HomePage"],
  "shop.html": ["Catalogue", "CataloguePage"],
  "category.html": ["Catalogue", "CataloguePage"],
  "product.html": ["Product", "ProductPage"],
  "datasheets.html": ["Library", "LibraryPage"],
  "about.html": ["Engineering", "EngineeringPage"],
  "brands.html": ["Discovery", "BrandsPage"],
  "search.html": ["Discovery", "SearchPage"],
  "articles.html": ["Discovery", "ArticlesPage"],
  "cart.html": ["Cart", "CartPage"],
  "account.html": ["Account", "AccountPage"],
  "sign-in.html": ["Account", "SignInPage"],
  "trade-account.html": ["Account", "TradePage"],
  "contact.html": ["Information", "ContactPage"],
  "distributors.html": ["Information", "DistributorsPage"],
  "policies.html": ["Information", "PoliciesPage"],
  "mobile.html": ["ComponentPreview", "ComponentPreview"],
  "error-states.html": ["ComponentPreview", "ComponentPreview"],
};
async function mount() {
  const entry = routeModules[initialRoute];
  if (entry) {
    const modules = import.meta.glob("./pages/*.tsx");
    const resolved = (await modules[`./pages/${entry[0]}.tsx`]()) as Record<
      string,
      React.ComponentType
    >;
    InitialPage = resolved[entry[1]];
  }
  createRoot(document.getElementById("root")!).render(
    <Provider>
      <App />
    </Provider>,
  );
}
mount().catch(() => {
  createRoot(document.getElementById("root")!).render(
    <main className="container">
      <h1>Unable to load this page</h1>
      <p>Please reload the local preview.</p>
      <button className="button" onClick={() => location.reload()}>
        Reload page
      </button>
    </main>,
  );
});
