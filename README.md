# Ocean Controls prototype

Website design and implementation by Jillur Rahman.

Preview: https://developerjillur.github.io/ocean-controls-prototype/

The fresh React, TypeScript and Vite application is in `app/`. Published static entries and assets are at the repository root for GitHub Pages. The redesign uses a 1400px outer content frame and preserves catalogue filters, product actions, technical documents, Engineering content and the complete demo order journey.

## Run and build

Use Node.js 22.18+ and npm:

```sh
cd app
npm ci
npm run dev
npm test
npm run build
```

Development opens on port3274. `npm run preview` serves app/dist on3275. The build emits18 .html entry routes with relative assets, including GitHub Pages subdirectory support. Copy the contents of app/dist to the repository root when preparing the next reviewed publication. Keep source and generated output in the same release commit.

## Prototype scope

The catalogue snapshot contains2,279 products across224 category paths and48 manufacturer values. The current interactive preview represents86 products, with source conflicts handled through enquiry. Sidebar and shortcut counters use the full catalogue; results show actual preview matches. Technical Library contains65 local files and one official online reference. Prices and stock are historical supplied data, not a live inventory feed.

Checkout, accounts and enquiry forms demonstrate local behavior. No real authentication, payment, freight quote, order, subscription or message is created. WordPress/WooCommerce and production integrations are a subsequent phase. The preview is noindex.

Previous versions remain in Git history. Historical unlinked homepage alternatives and their supporting source assets remain available. No private client conversations or credentials are included in the new application.
