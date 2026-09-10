import { copyFileSync } from "node:fs";
const routes = [
  "shop",
  "category",
  "search",
  "product",
  "datasheets",
  "brands",
  "about",
  "distributors",
  "articles",
  "cart",
  "account",
  "sign-in",
  "trade-account",
  "contact",
  "policies",
  "mobile",
  "error-states",
];
for (const r of routes) copyFileSync("dist/index.html", `dist/${r}.html`);
