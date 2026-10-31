# Verification

Verified 31 October 2026, on macOS arm64 with Node 26.12.0 and Go 1.27.2. The sections up to “Remaining review boundaries” cover the local production build; the launch round covers hosting and deployment.

## Checks completed

- Native Go engine/API tests pass: normalized edit distance, stress handling, target/homophone exclusion, alias grouping, optional frequency, alignment, catalog, input validation, deterministic output, N-invariant scores and arbitrary pair comparison.
- Go race check passes for `./engine`; `go vet ./engine` passes.
- Node/WASM bridge passes valid-request and malformed-input checks.
- TypeScript checking and the production build pass. Distribution artifact checks pass.
- Prettier check passes.
- **36 Playwright checks pass**, covering twelve scenarios on desktop Chromium, phone Chromium and iPhone-profile WebKit: exploration/comparison/model changes; science/theme/navigation; denied storage and static metadata assets; keyboard skip link/section anchors; alternate target pronunciations; inline suggestion tap/keyboard behavior in portrait and landscape; live system-theme following and persisted overrides; mobile word spacing and inset select chevrons; public-copy checks; blur during a landscape suggestion tap; canceled suggestion gestures; prominent primary action and plain-language privacy copy.
- The exploration scenario observes no network requests while submitting names, changing N/model, comparing names and handling an unsupported name. No page errors occur in that scenario. The production preview uses the restrictive CSP from `deploy/`.
- Screenshots captured for Explore and The science, light and dark, on desktop and iPhone-profile WebKit. The mobile closing section was adjusted after visual inspection. Social card (1200×630) and touch icon (180×180) were rendered and inspected.

## Red–Green record

Native engine and API tests first failed because their implementations did not exist, then passed after implementation. The WASM test first failed because the transport artifacts did not exist, then passed. Browser specs failed on the empty shell, then caught an actual worker syntax error during integration. It was corrected and the initial nine cases passed. Two additional regressions were reproduced before their fixes: the skip link switched views, and an alternate pronunciation of the entered name was incorrectly labeled “Same sounds.” The subsequent mobile-feedback round added failing regressions for native suggestions, theme controls, missing word spacing and the public demo. WebKit caught suppressed click delivery after preventing focus loss; stationary pointer-release selection corrected it. Existing interaction tests caught suggestion overlap with the submit button; placing suggestions above the field restored access. A new native test caught the target comparison inheriting another spelling’s rank under an alternate pronunciation. A further on-device report prompted a failing blur-between-press-and-release reproduction: the menu unmounted before selection. The menu now survives an active gesture, the option captures its pointer, and the badge stays upright until selection completes. This reproduces a plausible event-order failure, not the physical device itself. All 36 final browser cases pass.

The initial browser server attempt was blocked by the local sandbox's listener restriction and was rerun with authorized local-server execution. Go commands whose cache path was blocked were rerun using the repository's ignored `work/go-cache`; these environmental failures were not treated as passing checks.

## Formula-weights round (31 October 2026)

Prompted by a citation audit, including a full read of Deffler et al. (2016). Science copy now separates cited ingredients from hand-chosen numbers, and visitors can adjust the four weights in a collapsed **Tune the formula** panel, persisted locally.

- Red: new native tests failed to compile without `Weights`/`defaultWeights`. Green after implementation; a test that misused the response helper was corrected, not the engine. `go test -race` and `go vet` pass (10 native tests).
- Regression: default-weight responses for 7 names × 2 models × 2 variants, minus the two new fields, are byte-identical to the pre-change engine.
- The WASM custom-weights assertion failed against the previous `engine.wasm` (`custom` undefined) and passed after rebuilding.
- Browser: 7 new tuning scenarios and the extended denied-storage scenario failed on the existing UI, then passed. One real defect was caught: switching model within the 250 ms settle window dropped the pending edit. Pending edits now flush to their own model. **57 Playwright checks pass** (19 scenarios × desktop Chromium, phone Chromium, iPhone-profile WebKit), including no network requests while tuning, persistence across reload, Restore defaults stored explicitly, fallback for four kinds of corrupt storage, and no horizontal overflow.
- Screenshots now include the open panel (`*-tuning.png`). Inspection found the disclosure chevron captured mid-transition; the script now waits for animations, and reduced motion disables transitions. Science tables were inspected on desktop and phone.
- Physical iPhone slider handling remains an on-device review item.

## Measured artifact size

The engine is 5,030,461 bytes uncompressed (about 4.80 MiB), including the embedded 473,830-byte derived dataset. A local gzip measurement is 1,344,580 bytes (about 1.28 MiB). This is a size estimate, not a claim about future hosting compression. There are 6,027 bundled name spellings. The built site requires no external font, dataset or inference service.

## Remaining review boundaries

The owner reported physical-iPhone issues in the initial MVP. The revised autocomplete has passed touch/focus checks in desktop WebKit, but keyboard retention and portrait/landscape behavior still need a fresh physical-iPhone check. No behavioral validation of the heuristic has been performed. Hosting and deployment are covered by the launch round below. The original research review and current static-scope documents remain available in `docs/`.

## Launch round (31 October 2026)

Hosting, CI and deployment were added for `https://almost-you.isaacvelando.com/`. Infrastructure is `sites/almost-you.isaacvelando.com` in `iwvelando/cloud-accounts` (PR #21; CI plan 18 to add with every other root unchanged; applied 18 added, 0 changed, 0 destroyed; distribution `E289QHH5MQRCO7`).

- New `@smoke` tests, which also run against the live site after each deploy:
  - `engine.wasm` is served as `application/wasm`, compressed when served live. Run against the uncompressed local preview, that assertion was seen to fail.
  - The page reaches `data-engine="ready"` with no CSP violation reported.
  - The page header equals `deploy/content-security-policy.txt`.
  - Robots and sitemap list only the canonical page.
  - Link-preview tags reuse the page's title and description, and both card images have the right PNG sizes.
- The share-card size and alt tags were absent until added, and the share test was seen to fail before that.
- CSP:
  - `blob:` was removed from `img-src` as unused.
  - `data:` stays: removing it was seen to make the CSP listener fail on the select chevron.
  - WebKit reported a `style-src-attr` violation for native selects. `style-src-attr 'unsafe-inline'` resolves it (WebKit spec ×3 repeat passed), as for the Tom's Crossing exhibition.
- Local results: `npm test`, `go test -race ./engine`, `go vet`, format check, build, and **69 Playwright checks** (23 scenarios on desktop Chromium, phone Chromium and iPhone-profile WebKit) pass. Desktop and phone screenshots were re-inspected.
