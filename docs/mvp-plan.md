# Almost You: local MVP plan

The current scope supersedes the research document's proposed data collection and hosted services. This is a strictly static, private-by-construction explorer: bundled public data, a Go engine in a browser worker, React/TypeScript/Vite, and no database, telemetry, submissions, accounts, or remote inference. No deployment or infrastructure changes belong to this milestone.

## Experience

Two hash-addressed places: Explore and The science. Enter a name, choose a recorded pronunciation and ranking model, and inspect the top 5–20 alternatives. A pair comparison lets visitors explore any recurring substitution without forcing an alternative into the ranking. Scores are experimental similarities, never probabilities. Unknown names receive an honest coverage explanation. No gender filter or inferred identity.

Visual tokens: pale blue paper (#edf3f6), deep ink (#23324d), cobalt badges (#304bc5), soft yellow (#f4e8a1), white (#fffefd). Dark theme uses navy paper and softer blue. Fraunces for expressive headlines and name badges; DM Sans for controls and prose, both bundled locally. Signature visual: an oversized, slightly tilted name sticker; results are a numbered editorial list, not a dashboard. One short sticker entrance animation, disabled under reduced motion. Phone layout has 16px gutters and a labeled bottom dock.

## Model and data

Use normalized phoneme Levenshtein distance as a reproducible baseline, plus a small initial/final phoneme term. The alternative adds a small log-frequency term. These are engineering hypotheses, not fitted psychological parameters. Preserve pronunciation variants. Pool SSA counts across recorded sex categories; never infer gender. Intersect SSA names with CMUdict pronunciations. Document source hashes, date range, exclusions, and licenses. Group exact homophones so spelling variants do not dominate the list.

## Delivery sequence

1. Native engine tests, observed red, then pure ranking implementation.
2. JSON API tests, observed red, then API; bridge tests before WASM transport.
3. Browser specifications against an empty shell, observed red, then interface.
4. Production build with CSP, Chromium and WebKit verification, desktop light/dark and phone screenshot review.
5. Architecture, math/citations, usage, license/provenance docs; local preview left running for review.

Repository and DNS settings, cloud infrastructure, pushes, PRs and deployment are deferred. Future feature work follows Red–Green–Refactor. The existing research review remains the scholarly background, with a prominent scope correction.
