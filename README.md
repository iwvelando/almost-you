# Almost You

**The names you almost answer to.** A playful, research-informed name-similarity explorer, live at **https://almost-you.isaacvelando.com/**. Enter a name, inspect its nearest sound neighbors, or compare it with the one people keep calling you.

Strictly static React/TypeScript/Vite, with a pure Go model running in a WebAssembly worker. All names and results stay in the browser. No database, analytics, tracking, uploads, collection forms, accounts, or remote inference. Fonts and public name data are bundled locally. Only the color-theme preference and the optional formula weights are stored locally; neither contains a name.

## Try it

Requires Node 22.12+ and Go 1.25+.

```sh
npm ci
npm run build
npm run preview -- --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/**. Stop the server with Ctrl+C. For development, use `npm run dev`. For a phone on your trusted local network, use `npm run preview:lan -- --port 5173 --strictPort` and open the HTTPS network URL printed by Vite; accept its local self-signed certificate if prompted.

The site opens with Julian as a neutral demonstration, with Jillian in the pair inspector. Enter another name on the sticker, choose 5/10/20 results, switch between sound-only and sound + frequency, or select a recorded pronunciation. Click a ranked name to inspect its alignment, or enter a specific comparison. **The science** explains the formulas, evidence and limits, with six scholarly references and public dataset links. Both pages follow the live system theme by default. The adjacent light/dark icon opts into a fixed theme; the monitor icon returns to system mode. Name suggestions stay inline and support touch or Arrow keys, Enter and Escape.

## What the model means

The bundle contains 6,027 spellings from the intersection of CMUdict and U.S. SSA names with at least 500 pooled records in 1950–2020. The two models combine normalized phoneme edit similarity, shared initial/final sounds, and optionally a small log-frequency term. Exact homophones are grouped. Coefficients are engineering choices, not fitted psychological parameters.

These are experimental similarity rankings, **not measured probabilities of someone saying the wrong name**. They cannot account for a speaker's acquaintances, personal experience or accent. Unknown names receive an honest coverage explanation. See [the implemented model](docs/model.md) and [original research review](docs/research-and-design.md).

## Verify and maintain

```sh
npm test                     # native engine/API plus WASM bridge
go test -race ./engine
npm run build
npx playwright install chromium webkit  # if browsers are not installed
npm run test:browser          # Chromium desktop/phone and WebKit phone
npm run format:check
node scripts/screenshots.mjs # desktop/phone, both pages and themes
```

Use `GOCACHE="$PWD/work/go-cache"` before Go/npm commands in restricted environments that cannot write the system Go cache. Browser tests own port 4187 and refuse to reuse an existing preview. `make check` runs the core checks. `npm run share-card` regenerates the committed preview PNGs from a prior build; rebuild afterward.

- [MVP plan and design direction](docs/mvp-plan.md)
- [Architecture, local use and data rebuilds](docs/architecture.md)
- [Model specification and scientific grounding](docs/model.md)
- [Full research and original project design](docs/research-and-design.md)
- [Data provenance and hashes](data/provenance.json)
- [Verification record](docs/verification.md)

## Hosting

The site is a static build served from a private S3 bucket through CloudFront at `https://almost-you.isaacvelando.com/`. The infrastructure is Terraform in `iwvelando/cloud-accounts` (`sites/almost-you.isaacvelando.com`). Merging to `main` runs `Verify` (`.github/workflows/ci.yml`): the full test suite, then a deploy through the main-only `production` environment using a narrowly scoped OIDC role, then live `@smoke` tests. CloudFront sends the CSP in `deploy/content-security-policy.txt`; the deploy fails if the live header drifts from it. Names never leave the browser and never appear in a URL, so the host only ever serves static files.

Link previews (iMessage, Slack and similar) use `public/og.png` (1200 × 630) and `public/apple-touch-icon.png` (180 × 180), referenced by absolute URLs in `index.html`, with the page's own title and description. Both images are committed; `npm run build && npm run share-card` re-renders them when the look changes. Apps cache previews, so a link shared earlier may keep an older card for a while.

Code: MIT. CMUdict: BSD-style license in `data/CMUDICT-LICENSE.txt`. SSA counts are U.S. government public data. Font, React and Go notices are included in the built site.
