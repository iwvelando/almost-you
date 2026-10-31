# Almost You

A strictly static name-similarity explorer. The intent is curiosity grounded in research, not a clinical tool or a validated prediction of someone's behavior.

## Boundaries

- All user input and ranking stay in the browser. No database, telemetry, analytics, remote inference, feedback collection, accounts, or name-bearing URLs. Only the optional theme preference and formula weights (`almost-you-weights`) are saved locally, never names; handle denied storage and validate stored weights.
- `engine/` is pure Go. It embeds the checked-in pronunciation/count dataset. `cmd/wasm/` is transport only; `public/worker.js` runs it in a classic worker. Keep the JSON API native-testable.
- React/TypeScript/Vite lives in `web/`. Fonts and assets are bundled locally. Do not add external runtime requests. Preview uses the policy in `deploy/content-security-policy.txt`.
- Treat all scores as heuristic similarities, never measured error probabilities. Coefficients are not fitted. Do not force demonstration pairs into any position. Preserve the distinction between population frequency and personal familiarity.
- The current milestone is local review only. Do not deploy, push, modify infrastructure or configure cloud resources without a subsequent instruction.

## Discovery

Read `docs/mvp-plan.md`, `docs/architecture.md`, `docs/model.md`, and `data/provenance.json` before changing model behavior. `docs/research-and-design.md` preserves the original scholarly exploration; its proposed data collection and later learned models are outside the current scope.

## Development

Plan new features and changes affecting more than two modules. Use strict Red–Green–Refactor: write the test, run it and inspect the expected failure, implement, run to green, then refactor. Use native model/API tests before WASM bridge tests; use failing Playwright tests before UI behaviors. Keep tests meaningful, not copies of formulas or markup.

Invariants: stable results for identical requests; changing N never changes scores; exact target excluded; first-pronunciation homophones grouped; no alias count pooling; alphabetical score ties; invalid input handled; stale worker replies ignored. Dataset updates must update provenance and coverage documentation. Version model changes explicitly.

## Verification

`npm ci`, `npm test`, `go test -race ./engine`, `npm run build`, `npm run test:browser`, `npm run format:check`. Use `GOCACHE="$PWD/work/go-cache"` if a sandbox cannot write the system cache. Browser tests own port 4187 and refuse to reuse an existing server. Install Playwright Chromium and WebKit if needed. `node scripts/screenshots.mjs` captures desktop and phone, both pages and themes; inspect images as well as overflow tests. Real iPhone behavior remains an on-device review item.

The readiness marker is `html[data-engine="ready"]`. Native controls remain keyboard accessible. Respect reduced motion. On custom radio/checkbox overlays explicitly set width and height to 100%; do not rely on desktop WebKit to reproduce iOS sizing. Avoid programmatic pointer focus unless its focus-visible behavior is explicitly handled.

`npm run share-card` renders committed PNG previews from a prior build; rebuild after regenerating. The canonical future URL is `https://almost-you.isaacvelando.com/`. Hash views share the root sitemap entry. No deployment workflow is included in the local MVP.
