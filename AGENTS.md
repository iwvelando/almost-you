# Almost You

A strictly static name-similarity explorer. The intent is curiosity grounded in research, not a clinical tool or a validated prediction of someone's behavior.

## Boundaries

- All user input and ranking stay in the browser. No database, telemetry, analytics, remote inference, feedback collection, accounts, or name-bearing URLs. Only the optional theme preference and formula weights (`almost-you-weights`) are saved locally, never names; handle denied storage and validate stored weights.
- `engine/` is pure Go. It embeds the checked-in pronunciation/count dataset. `cmd/wasm/` is transport only; `public/worker.js` runs it in a classic worker. Keep the JSON API native-testable.
- React/TypeScript/Vite lives in `web/`. Fonts and assets are bundled locally. Do not add external runtime requests. Preview uses the policy in `deploy/content-security-policy.txt`.
- Treat all scores as heuristic similarities, never measured error probabilities. Coefficients are not fitted. Do not force demonstration pairs into any position. Preserve the distinction between population frequency and personal familiarity.
- Hosting is live at `https://almost-you.isaacvelando.com/`. Infrastructure (S3, CloudFront, ACM, DNS, the deploy role) belongs in `iwvelando/cloud-accounts` (`sites/almost-you.isaacvelando.com`), never here. Never deploy locally.

## Discovery

Read `docs/mvp-plan.md`, `docs/architecture.md`, `docs/model.md`, and `data/provenance.json` before changing model behavior. `docs/research-and-design.md` preserves the original scholarly exploration; its proposed data collection and later learned models are outside the current scope.

## Development

Plan new features and changes affecting more than two modules. Use strict Red–Green–Refactor: write the test, run it and inspect the expected failure, implement, run to green, then refactor. Use native model/API tests before WASM bridge tests; use failing Playwright tests before UI behaviors. Keep tests meaningful, not copies of formulas or markup.

Invariants: stable results for identical requests; changing N never changes scores; exact target excluded; first-pronunciation homophones grouped; no alias count pooling; alphabetical score ties; invalid input handled; stale worker replies ignored. Dataset updates must update provenance and coverage documentation. Version model changes explicitly.

## Verification

`npm ci`, `npm test`, `go test -race ./engine`, `npm run build`, `npm run test:browser`, `npm run format:check`. Use `GOCACHE="$PWD/work/go-cache"` if a sandbox cannot write the system cache. Browser tests own port 4187 and refuse to reuse an existing server. Install Playwright Chromium and WebKit if needed. `node scripts/screenshots.mjs` captures desktop and phone, both pages and themes; inspect images as well as overflow tests. Real iPhone behavior remains an on-device review item.

The readiness marker is `html[data-engine="ready"]`. Native controls remain keyboard accessible. Respect reduced motion. On custom radio/checkbox overlays explicitly set width and height to 100%; do not rely on desktop WebKit to reproduce iOS sizing. Avoid programmatic pointer focus unless its focus-visible behavior is explicitly handled.

`npm run share-card` renders committed PNG previews from a prior build; rebuild after regenerating. Link previews reuse the page's `<title>` and description word for word; `tests/share.spec.ts` guards the tags and image sizes. The canonical URL is `https://almost-you.isaacvelando.com/`. Hash views share the root sitemap entry.

## Git and deployment

Work on a branch and open a PR; never push to `main` or force-push. The `main` ruleset allows squash merges only and requires the `verify` check, which passes only when `check` (format, vet, Go, WASM bridge, build, Chromium desktop and phone) and `webkit` (iPhone-profile WebKit on macOS) both pass. Merging to `main` verifies again, then the `deploy` job publishes that run's `dist/` through the main-only `production` environment, invalidates CloudFront and checks live headers; `smoke` then runs the `@smoke` tests against the live site (`BASE_URL`). A failure on `main` opens an issue.

The CSP lives in three places and must match exactly: `deploy/content-security-policy.txt` (preview and browser tests send it), `content_security_policy` in cloud-accounts' `sites/almost-you.isaacvelando.com/site.tf` (CloudFront sends it), and the deploy job's live-header comparison. Change cloud-accounts first, then this file.

Dependabot opens weekly grouped updates. Patch and minor updates merge automatically once `Verify` passes and then deploy; majors wait for a review and a manual merge.
