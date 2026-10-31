# Name similarity research and project design

Research review • 31 October 2026

> **Current MVP scope:** Almost You is now a strictly static React/TypeScript site with a Go/WASM worker. No database, analytics, data collection or remote inference is included or planned for this deliverable. The study recruitment, feedback collection and fitted-model roadmap below remain historical research possibilities, not authorized implementation scope. See [the MVP plan](mvp-plan.md), [implemented model](model.md) and [architecture](architecture.md) for the delivered behavior.

## 1 Decision

**Proceed with a research-informed exploratory website. Treat accurate prediction of name substitutions as a research objective that requires new validation.**

The premise has scientific grounding. Studies of everyday misnaming and experiments with newly learned face–name associations find systematic effects of sound similarity and relationships between the people involved. Computational models also exist for lexical retrieval, face naming, and memory access. These provide more substance than a generic string-similarity algorithm. [Deffler et al., 2016](https://pubmed.ncbi.nlm.nih.gov/27106910/) · [Dupont, online 2019](https://orbi.uliege.be/handle/2268/233115) · [Dell et al., 1997](https://doi.org/10.1037/0033-295X.104.4.801)

However, the reviewed literature does not provide a ready-to-use, validated function that takes an arbitrary first name and returns the names strangers are most likely to substitute. A person's name alone leaves out the speaker's vocabulary, acquaintances, recent experiences, pronunciation, and situation. That missing information limits the precision of any universal ranking.

The product should begin as a **name-confusion explorer**: enter a name, receive the top N candidates under an explicit model, and discover why each was suggested. The long-term product can estimate likely substitutions in a defined population if held-out behavioral data demonstrate that it can.

**A recurring substitution is an observation, not model validation.** A familiar anecdote must not become a required top result or a reason to tune the model toward one name pair.

## 2 Research scope and evidence

This is a targeted narrative review, not a systematic review or meta-analysis. Searches covered proper-name retrieval, familiar-person misnaming, repeated errors, face–name learning, phonological similarity, computational lexical access, and Simon Fischer-Baum's research. Sources were checked through 31 October 2026. The bibliography identifies the core papers, their relevance, and material access limitations. Publication years below distinguish online publication from issue dates where necessary.

### Direct evidence about name substitutions

| Study | What was studied | Finding relevant to this project | Boundary |
| --- | --- | --- | --- |
| [Deffler et al. 2016](https://pubmed.ncbi.nlm.nih.gov/27106910/) | Five studies with more than 1,700 participants | Familiar people were often substituted within relationship categories; phonetic similarity contributed, with a smaller effect than category membership | Retrospective reports about familiar people do not establish stranger-specific rankings |
| [Griffin and Wangerman 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3877301/) | Reports from 334 adults about parental substitution of sibling names | Shared initial or final sounds were associated with more substitutions; matching syllable count and stress did not predict frequency | Initial-phoneme coefficient was marginal at conventional significance, p = .055; final-phoneme coefficient p = .042; observational design |
| [Brédart and Dardenne 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4586349/) | 181 people screened; 76 reported repeated confusion; 72 reported overt errors | Phonological similarity predicted reported error frequency; intruding people were generally known longer | Selected recurrent-error cases; small, retrospective sample, not population error rates |
| [Dupont online 2019](https://orbi.uliege.be/handle/2268/233115) | Three face–name learning experiments, each with 64 middle-aged participants and 16 face–name associations | Phonological and semantic similarity increased confusion, including repeated confusion | Controlled learning of a small set of identities differs from unstructured encounters with strangers |
| [Brédart and Valentine 1992](https://pubmed.ncbi.nlm.nih.gov/1490322/) | Laboratory face naming and error repair | Rare-to-common surname substitutions and repair asymmetries were observed | Surnames and monitoring effects; not direct proof that popular first names always win retrieval |

The practical conclusion is that the website has a defensible set of candidate predictors. Their existence does not identify the correct coefficients, interactions, candidate vocabulary, or ranking accuracy for a consumer product.

“Semantic similarity” here largely concerns **people and their relationships**: two children, two colleagues, people encountered in the same setting. It does not mean that names with related dictionary meanings, religious origins, or etymologies are necessarily retrieval neighbors. Using name-meaning embeddings as the main mechanism would change the construct being measured.

### Name retrieval is not a single kind of failure

Distinguish at least four outcomes in the product's research data:

1. **Substitution:** the person knows or has learned the intended name but produces another.
2. **Retrieval failure:** the intended name cannot be produced, sometimes with a tip-of-the-tongue experience.
3. **Encoding or perception error:** the person initially hears, reads, or learns the name incorrectly.
4. **Identity error:** the person mistakes the individual for someone else.

Burke and colleagues' transmission-deficit account addresses tip-of-the-tongue states and phonological access. It is relevant background, but inability to retrieve a name is not equivalent to producing a particular wrong name. [Burke et al., 1991](https://www.sciencedirect.com/science/article/pii/0749596X9190026G)

Nor does phonological overlap invariably cause interference. In a homophone-priming experiment, prior production of a word such as “pit” could facilitate production of the corresponding person's name; effects depended on procedure and participant group. The direction of an effect depends on the task and timing. [Burke et al., 2004](https://pubmed.ncbi.nlm.nih.gov/15016287/)

### What neuroscience adds

An fMRI study comparing recognition of proper and common names found substantial involvement of the semantic system, with differences across name types and familiarity conditions. Its task measured recognition, not spoken retrieval. It does not supply a neural distance between arbitrary first names or validate a particular nearest-neighbor algorithm. [Desai, Tadimeti, and Riccardi, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10171918/)

The website should describe itself as informed by cognitive research. A claim to simulate an individual brain would require a substantially different level of evidence.

## 3 Interpreting recurring name substitutions

A recurring wrong name can have several explanations. Broad similarities such as syllable count or stress do not necessarily imply close phonological neighbors. In the sibling-name study, matching stress and syllable count did not predict substitutions. [Griffin and Wangerman, 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3877301/)

- **Family context matters.** A stranger's error does not remove a relationship-based contribution to a relative's error. Different speakers can reach the same wrong name through different routes.
- **Population popularity and personal availability differ.** Birth registrations cannot tell us how often a particular speaker uses a name. [Brédart, 2017](https://orbi.uliege.be/bitstream/2268/215164/1/NBBR2017.pdf)
- **Common-name intrusions have some evidence, but popularity is not the whole mechanism.** A surname study implicated error monitoring and found no corresponding surname-frequency effect on naming latency. [Brédart and Valentine, 1992](https://pubmed.ncbi.nlm.nih.gov/1490322/)
- **Self-correction is compatible with monitoring.** It does not uniquely identify the original cause or rule out an initial identity mistake.
- **Selective recall is a measurement issue, not a diagnosis.** A recurring pattern should be studied with comparison names and exposure counts rather than dismissed or treated as proof.

Testing a particular pair requires a denominator: how often speakers encounter and correctly name the target, which other errors occur, and how the same speakers handle other names. Accent alone cannot establish a speaker's name inventory.

**Product consequence:** offer a general pair inspector, without treating any demonstration pair as a validated confusion or tuning the ranking to obtain it.

## 4 Mathematical models that can inform the project

### Interactive spreading activation

Dell's work gives a formal account of how conceptual, lexical, and phonological representations can influence one another during production. The 1997 implementation uses a recurrence of the following form, with notation simplified here:

$$
a_j(t)=(1-q)a_j(t-1)+\sum_i w_{ij}[a_i(t-1)]_+ + \epsilon_j(t)
$$

Here, $a_j$ is activation, $q$ is decay, $w_{ij}$ is a connection weight, $[a]_+=\max(a,0)$ implements the rule that negative source activation does not spread, and $\epsilon$ represents noise. Word selection and phonological selection are separate steps. The original implementation uses excitatory connections; it should not be described as having lateral inhibition. This is a compact restatement of its activation rule, not a complete replication. [Dell, 1986](https://doi.org/10.1037/0033-295X.93.3.283) · [Dell et al., 1997, p. 805, equation 1](https://cseweb.ucsd.edu/~gary/PAPER-SUGGESTIONS/dell-et-al-psych-rev-1997b.pdf)

**Use here:** motivate separate representations for a person, a name, and its sounds. A later simulator could estimate distributions by repeated noisy trials. It would still need a justified network and fitted parameters; running a simulation does not make its outputs empirically calibrated.

### Models specifically for face naming

Burton and Bruce implemented an interactive activation and competition model to account for the difficulty of retrieving names relative to other person information. Brédart and colleagues subsequently tested an architectural prediction, found an opposing result, and proposed a revised model with separate pools for descriptive information and lexical name outputs. [Burton and Bruce, 1992](https://doi.org/10.1111/j.2044-8295.1992.tb02424.x) · [Brédart et al., 1995](https://pubmed.ncbi.nlm.nih.gov/7610275/)

**Use here:** these are concrete computational precedents, and the revision demonstrates why architecture must be tested. A flat list of name strings is only an approximation to person naming. A contextual model should distinguish two different people who share the same name and one person who uses multiple names.

### Cue-based memory retrieval

ACT-R models memory availability using a base component and activation from current cues. A useful summary is:

$$
A_i=B_i+\sum_{j\in C}W_jS_{ji}
$$

$B_i$ represents experience-dependent availability; $C$ is the set of cues; $W_j$ weights attention to a cue; and $S_{ji}$ represents its association with the memory. Frequency and recency affect availability. This framework has been evaluated against cued-recall response times and neural activity, rather than a consumer first-name confusion task. [Danker, Gunn, and Anderson, 2008](https://pmc.ncbi.nlm.nih.gov/articles/PMC2733322/)

**Use here:** justify testing exposure and situation variables when available. Do not substitute birth counts for an individual's entire retrieval history or label an arbitrary weighted score “ACT-R.”

### Learning and competing explanations

Oppenheim, Dell, and Schwartz modeled repetition benefits and cumulative semantic interference through incremental, error-driven learning. Their analysis showed that interference can arise without competition at the moment of lexical selection when the learning process supplies the relevant competition. [Oppenheim et al., 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2924492/)

**Use here:** recent and repeated experiences deserve investigation. A product animation showing names “racing” is a metaphor, not proof of one uniquely established mechanism. Preserve alternative models for comparison instead of merging incompatible theories and presenting the result as a consensus brain model.

### Statistical models already used on misnaming

The sibling study fitted cumulative-odds ordinal regression to reported substitution frequency. In generic notation:

$$
\operatorname{logit}P(Y\ge k\mid x)=\alpha_k+\beta^\top x
$$

This estimates how predictors relate to frequency categories. Its published coefficients do **not** directly provide probabilities over all possible wrong names. A top-N product needs a candidate-choice model with different outcomes and a suitable dataset. [Griffin and Wangerman, 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3877301/)

## 5 Simon Fischer-Baum's relevance

Fischer-Baum is a useful lead for modeling language and memory, although the most directly relevant personal-name substitution papers found here are by Deffler, Griffin, Brédart, and Dupont. Rice lists written and spoken language processing, short-term memory, and cognitive neuropsychology among his research areas. [Rice faculty profile](https://profiles.rice.edu/faculty/simon-fischer-baum)

Two particularly relevant works are:

- **Balatsou, Fischer-Baum, and Oppenheim, 2022.** Repeated picture naming showed that individuals' previous responses contributed predictive information beyond population name agreement. This concerns labels for pictured objects, not people's first names, but its methodological lesson is directly useful: a population distribution should not be equated with a single person's internal choice probabilities. [Paper](https://doi.org/10.1016/j.cognition.2021.104947) · [Author manuscript](https://oppenheim-lab.bangor.ac.uk/pubs/balatsouFischerBaumOppenheim_inPress2021_Cognition_preprint.pdf)
- **Irons, Oppenheim, and Fischer-Baum, 2017.** A conference abstract investigated a scaled version of the Dark Side lexical-access model and simulated impairment. It connects Fischer-Baum directly to computational retrieval modeling, but is a conference abstract and does not validate arbitrary first-name rankings. [Conference record](https://research.bangor.ac.uk/en/publications/breaking-the-dark-side-a-computational-neuropsychological-approac/)

A productive future consultation would ask which task best separates new-name encoding errors from retrieval substitutions, how to represent a speaker's person-specific knowledge, and what evidence would justify combining sound and contextual features. No researcher has been contacted or represented as endorsing this proposal.

## 6 Product concept

**Working title: Almost You.** Repository and technical project name: `name-similarity`. The working title has not been checked for trademark or domain availability.

The experience should feel like an affectionate museum exhibit about a familiar social mishap. A visitor arrives curious or mildly exasperated, sees an interesting result quickly, and leaves understanding something about memory. Humor should target the mix-up rather than the person's name.

The main interaction remains exactly the proposed one: **name in, top N names out**. The distinction between prototype suggestions and validated predictions appears in a short sentence beside the results, with the technical explanation one click away.

### First visit

The opening screen uses a large, editable name badge:

> Hello, my name is **[ Julian ]**
>
> What might someone call you by mistake?
>
> **Find my almost-names**

Below it: “Explore suggestions inspired by research on names and memory.” Language and pronunciation controls are available without making a lengthy questionnaire mandatory. Start with **US English pronunciation** and make that scope visible. Do not silently infer it from location.

After submission, the badge briefly slides into a small stack of alternative badges. The result list settles immediately; there is no fake brain scan or invented processing delay. The default is five results, with a number control from one to twenty. Every row offers the pronunciation, a plain-language explanation, and a comparison action.

### Results and explanation

At launch, label the list **“Your name's nearby alternatives”** with the adjacent sentence **“Experimental suggestions, not measured odds.”** Each explanation must be generated from computed features, not improvised by a language model.

Possible explanation fragments include:

- “Shares the final two sounds.”
- “A close sound match, with a different first vowel.”
- “Ranks higher when the selected name-frequency estimate is included.”
- “You placed both people in the same group.”

Use the latter two only in modes where those features actually affect the score. Show a weaker explanation or no explanation when the data do not support a strong one. A low-ranked name should not be described as highly confusable simply because the visitor requested twenty results.

### The pair inspector

An **“I always get called…”** action lets the visitor enter a specific alternative, including one absent from the top N. The inspector shows:

| View | What the visitor learns |
| --- | --- |
| Sound alignment | Which sounds match, differ, or are added |
| Rhythm | Syllable count and stress, identified as descriptive features in the initial version |
| Model position | The alternative's actual rank among the current candidates, or “outside this dataset” |
| Context | Whether adding information about people could change the comparison |
| Evidence | A short explanation with links to the relevant research |

A pair can share a few sounds or a broad rhythm while differing substantially elsewhere. The inspector must be willing to say: **“This model doesn't explain your particular mix-up very well.”** That can be an interesting result.

### Optional context

The next interaction is **“Whose memory are we exploring?”** The speaker is the person doing the naming, not necessarily the visitor. Offer a general population view and an optional private roster from a known speaker's perspective. For example, a parent may group two different names under “my children.” A stranger's unknown acquaintances should remain unknown.

In the first release, the roster can filter the candidate list and visualize shared groups. A later validated contextual ranker may use these features to reorder names. An explicitly labeled simulation may illustrate hypothetical contextual effects before validation; it must remain separate from empirical predictions.

### Small moments of delight

- A printable or downloadable **“Hello, my name is still me”** badge, with an optional chosen alternative underneath.
- A comparison switch labeled **“Sound only” / “Include name frequency”**. When names move, the UI explains the actual reason.
- A small **“Why this one?”** foldout that expands a sound alignment rather than a wall of neuroscience terminology.
- Optional copy such as **“The right person. A neighboring name.”** Avoid suggesting that every error has this explanation.
- A share preview that clearly labels the output as experimental and includes only the name and results the visitor selects.

Do not display fabricated example ranks or percentages in the production UI. Design mockups can use placeholders; a chosen pair is not an algorithmic top result.

### Tone and accessibility

A recent survey found differing reactions to being misnamed by relatives and romantic partners, including irritation and amusement. That is a reason to make the humor gentle and optional rather than assume everyone enjoys the experience. [Brédart, Devue, and Vanootighem, 2026](https://pubmed.ncbi.nlm.nih.gov/42696057/)

Support keyboard operation, screen-reader explanations of sound alignments, reduced motion, usable contrast, and a quiet visual mode. Do not autoplay pronunciation audio. Prefer human-readable pronunciation choices; IPA can be expanded for interested users. Do not infer identity, ethnicity, personality, or gender from a name. Recognize legitimate names rather than treating unfamiliar spelling as invalid.

## 7 Ranking specification

### Define the outcome first

Let $t$ be the intended spoken name, $c$ an alternative, $s$ a speaker, $x$ the situation, and $E$ an overt name-substitution event. The eventual scientific target is:

$$
P(c\mid t,s,x,E)
$$

The name-only website can at best approximate a population-averaged distribution with many missing variables. That distribution changes with the sampled population. It is distinct from $P(E\mid t,s,x)$, the chance of making any substitution at all.

For example, being the highest-ranked alternative does not mean that a person is likely to make an error. Correct naming may overwhelmingly dominate. A dataset containing only reported mistakes cannot establish the overall error rate.

### Version 0 as a reproducible heuristic

Use an explicit score to produce a useful prototype while collecting the evidence needed for a predictor. **The following weights are proposed engineering defaults, not values estimated in a cited study.**

1. Resolve the entered name to a pronunciation selected or confirmed by the user.
2. Load a versioned candidate lexicon for the chosen language scope.
3. Exclude the intended name and group exact spoken homophones as spelling variants by default. A spoken-name tool should not fill its results with acoustically identical spellings.
4. Calculate features over phoneme tokens, treating a diphthong as a phoneme rather than as two arbitrary Unicode characters.
5. Score every eligible candidate before selecting the top N. Retain the complete ranking for the pair inspector.

Define:

$$
P(t,c)=1-\frac{D_w(\phi_t,\phi_c)}{\max(|\phi_t|,|\phi_c|)}
$$

$D_w$ is weighted phoneme edit distance. Insertions and deletions cost 1; substitutions have feature-based costs between 0 and 1. Clamp the final similarity to [0,1] to protect against implementation or mapping errors. The costs should initially use a documented phonological feature representation, then be compared with simpler equal-cost edits. PanPhon is a possible source of articulatory features; its published evaluations concern NLP tasks, not human misnaming probabilities. [Mortensen et al., 2016](https://aclanthology.org/C16-1328/)

Let:

$$
E_{edge}(t,c)=\frac{\mathbf{1}[first_t=first_c]+\mathbf{1}[last_t=last_c]}{2}
$$

Let $B(c)$ be the summed national birth count for the candidate over the years declared in the dataset manifest, pooling the source's sex categories. Define $F(c)=\log(1+B(c))/\log(1+\max_j B(j))$ over the fixed source vocabulary. This gives a versioned proxy in [0,1]. The optional prototype frequency profile can start with 1950–2025, an engineering choice to be tested for sensitivity, not an estimate of any particular speaker's acquaintances. Record the years and normalization population; do not describe this as measured conversational familiarity.

The initial modes are:

$$
Score_{sound}=0.85P+0.15E_{edge}
$$

$$
Score_{frequency}=0.75P+0.15E_{edge}+0.10F
$$

Default to sound-only until the frequency blend has been compared empirically with it. The edge bonus deliberately overlaps with information in edit distance; ablation must test whether it adds value. Prosody is displayed but has no additional default bonus. No probability conversion is displayed. Deterministic ties use the stable canonical name ID.

For uncertain pronunciation, compute separate rankings for plausible variants and show sensitivity. Do not maximize similarity over every conceivable pronunciation: that systematically rewards ambiguous entries. If probabilities over variants are unavailable, do not invent them. Missing frequency is missing data, not a measured zero; fall back to sound-only scoring for a consistently defined comparison set.

### A fitted model after data collection

A regularized conditional-choice model is an interpretable next step:

$$
z_{tcsx}=\beta_P P+\beta_EE_{edge}+\beta_FF
+\beta_SS_{tc,s}+\beta_HH_{c,s}+\beta_RR_{c,s}
+\beta_{PS}P S_{tc,s}
$$

Here, $S$ describes shared relationship or encounter context, $H$ personal familiarity or exposure, and $R$ recency. These are proposed covariates, not established numerical mechanisms. Include pronunciation uncertainty and missingness explicitly. Add prosody only as a preregistered feature under evaluation. Use hierarchical participant variation where the sample supports it, with population defaults for unseen speakers.

For a declared candidate set $C$:

$$
\widehat P(c\mid t,s,x,E,c\in C)=
\frac{\exp(z_{tcsx}/T)}{\sum_{j\in C,\ j\ne t}\exp(z_{tjsx}/T)}
$$

The weights are learned on training data; temperature $T>0$ is fitted on a separate calibration set if needed. This is a proposed predictive approximation, not a formula taken from Dell or ACT-R. Normalization occurs over the full eligible candidate set, **never just the displayed top N**. The resulting probabilities are conditional on the error being in that set. They omit errors outside the lexicon unless an explicit outside-set outcome is learned.

The model may produce asymmetric results: a popular or personally familiar alternative can rank highly for a rare target without the reverse being equally plausible. Phonetic distance alone is usually symmetric; the prediction task need not be.

Do not include an ordinary participant intercept that adds the same value to every alternative and expect it to personalize the choice probabilities: such a term cancels in the softmax. Personalization requires alternative-dependent information or varying slopes.

### Later mechanistic research

If the simpler model predicts well, construct a small interactive network with person nodes, name nodes, and phonological units. Fit it to both substitutions and response times. Compare it with the conditional-choice model on the same held-out tasks. Prefer the simpler model for deployment unless the simulator improves prediction or answers a distinct scientific question. More elaborate neural imagery should not substitute for this comparison.

## 8 Data and architecture

### Data sources and boundaries

| Resource | Proposed use | Required handling |
| --- | --- | --- |
| [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) | Initial US English pronunciation inventory | Audit proper-name coverage and variants; retain source version and [license notices](https://github.com/cmusphinx/cmudict/blob/master/LICENSE); names are not guaranteed complete or correct |
| [SSA national name files](https://www.ssa.gov/oact/babynames/limits.html) | Candidate discovery and optional historical birth-count proxy | Use more than the top 1,000; suppressed low counts imply incomplete coverage; retain year range and source; registrations are not speaker exposure |
| [PanPhon](https://aclanthology.org/C16-1328/) | Phonological feature comparisons | Verify mapping from the chosen phoneme inventory; audit segmentation and stress separately; review the version's license before redistribution |
| Curated pronunciation and alias overrides | Fill verified gaps | Record provenance, locale, reviewer, and confidence; allow a user to override locally without silently editing the public lexicon |
| Consented behavioral records | Fit and evaluate substitution predictions | Preserve task, speaker grouping, intended name, produced name, outcome type, exposure conditions, and collection provenance |

Do not silently add William and Wilhelmina birth counts to Will: the proportion who use that spoken name is unknown. Treat a legal name, a nickname, an alternate spelling, and a distinct person's name as different relations. Do not use SSA sex categories as inferred user gender or as a default hard candidate filter.

MVP scope is names with reviewed US English pronunciations, including names of diverse origins where coverage is adequate. A narrow supported pronunciation scope must be visible. Global, multilingual, UK, and Australian predictions require appropriate pronunciation and population data, plus independent behavioral evaluation. Merely changing a country label over the same dataset would be misleading.

### Implementation shape

Use a static TypeScript web application with a local ranking library and a Web Worker for calculations. React with Vite is a reasonable implementation choice, not a scientific requirement. Perform dictionary ingestion, phoneme conversion, and feature preprocessing offline. Ship versioned compressed assets. A runtime language model is unnecessary for either ranking or explanation.

```text
Versioned source files
        ↓
Offline validation and pronunciation review
        ↓
Names + pronunciation variants + features + provenance
        ↓
Browser worker → ranking → feature explanations → result cards

Separate optional research consent
        ↓
Controlled collection endpoint → curated dataset → offline fitting
        ↓
Evaluation report → reviewed model release
```

Suggested repository structure when implementation begins:

```text
docs/                     Research, model cards, experiment protocols
data/sources/             Manifests and source acquisition instructions
data/overrides/           Reviewed pronunciations and aliases
scripts/                  Reproducible ingestion and evaluation
src/model/                Pure scoring, ranking, and explanation functions
src/ui/                   Form, result cards, pair inspector, sharing
src/worker/               Background computation
tests/                    Unit, integration, and browser tests
```

The initial release needs no accounts or database. If voluntary research collection is added, use a small isolated backend; do not let unreviewed submissions update rankings automatically.

### Internal interface

```typescript
rankNames({
  target,
  pronunciationId,
  locale,
  n,
  mode,                  // sound | frequency | validated-context
  roster                 // optional, from the naming speaker's perspective
}) => {
  modelVersion,
  lexiconVersion,
  scope,
  coverage,
  results: [{ nameId, displayName, rank, score, reasons, pronunciationId }]
}
```

Scores are internal ranking quantities, not percentages. A later probability field must declare the population, task, candidate set, conditioning event, model version, and calibration status. Validation errors distinguish an empty name, unsupported pronunciation, missing source data, and insufficient candidates.

Performance targets are proposed acceptance criteria: after asset loading, return results within 200 ms at the 95th percentile on an agreed midrange mobile device, and keep the initial experience responsive while data load. Measure bundle size and performance before committing to a large lexicon. Correctness and coverage take priority over arbitrary timing targets.

### Privacy by design

Entered names and private rosters stay in the browser unless the visitor separately chooses to submit a research record. Do not include raw names in analytics, error telemetry, or automatic URL queries. Avoid third-party pronunciation requests that would transmit names without a visible action. Share cards and URLs require a preview; private roster context is excluded by default.

Research consent should distinguish publication of aggregates from storage of raw records. First names combined with relationships or locations can identify people; hashing names does not make a small name vocabulary anonymous. Prefer coarse context categories, minimal free text, an explicit retention policy, and a deletion mechanism. A formal human-participant study needs the relevant institutional review before recruitment.

## 9 Validation and research plan

### Questions the project must answer

- Does a phoneme-based model predict observed substitutions better than orthographic similarity and name frequency alone?
- Does the optional frequency prior improve prediction, or mostly push common names into every list?
- Does speaker-specific context improve predictions beyond sound?
- Do effects differ between familiar people and newly learned names?
- Are rankings stable across pronunciation variants, populations, and reasonable parameter choices?
- Can apparent recurring substitutions be replicated in independently collected data?

### Data collection sequence

**First, audit existing data availability.** The papers establish effects but do not guarantee that reusable participant-level name pairs and exposure information are publicly available. Check supplements, repositories, permissions, and consent conditions. Aggregate coefficients are insufficient to reconstruct a full training corpus. Obtaining unavailable data or contacting authors is future work.

**Second, collect an unprompted report before showing suggestions.** Ask visitors who volunteer for research what wrong name was actually produced, by whom in broad relationship terms, how well the speaker knew the target, whether the name had just been introduced, and whether correction occurred. A “none of these” response after seeing the list is useful product feedback but not independent evidence of prediction quality. Record post-result endorsements separately.

**Third, run controlled face–name learning and retrieval.** Counterbalance assignment of names to identities and independently vary sound similarity and person-category similarity. Verify initial learning, include delays and correct-response opportunities, and record omissions, substitutions, and identity mistakes separately. Start with a feasibility pilot to estimate usable error yield and measurement reliability; use those estimates in a power simulation for the confirmatory study. Do not present a convenient participant count as a justified sample size. Dupont's design provides a relevant precedent. [Dupont, online 2019](https://orbi.uliege.be/handle/2268/233115)

**Fourth, test external validity prospectively.** A short diary study can record events soon after they occur, including opportunities for correct naming where feasible. Analyze familiar-person errors and recently introduced-person errors separately. Preserve whether records came from the speaker or the recipient. Do not pool laboratory errors, recalled lifetime anecdotes, and suggestion-clicks as interchangeable observations.

For spoken outcomes, manual annotation of a consented subset is necessary to assess whether transcription or speech recognition itself introduces name confusions. Written responses alone measure a somewhat different task.

### Baselines and metrics

Compare the proposed ranker with random ranking over the same vocabulary, frequency-only ranking, character edit distance, equal-cost phoneme edit distance, and the strongest frequency-plus-phoneme baseline. All systems must use the same candidate set, exclusions, and phoneme-equivalence policy.

The primary proposed metric is **top-5 recall of the observed substituted name, conditional on a substitution event**. Also report top-1 and top-10 recall, mean reciprocal rank, lexicon coverage, and performance by common versus rare targets and supported pronunciation groups. Count outside-lexicon observations as end-to-end misses; also report conditional in-lexicon performance separately.

Use both participant-held-out and target-name-held-out evaluation. Keep linked households, repeated events, spelling variants, and near-identical target forms together where they would otherwise leak information across folds. Repeated reports of the same name substitution from one household must not appear as independent training and test evidence. Use clustered uncertainty estimates by participant or household and inspect generalization across targets. A population model can use public lexicon information for test names, but not held-out behavioral responses.

If actual probabilities are produced, evaluate log loss, multiclass Brier score, and calibration on a separate dataset with known sampling conditions. A fit to retrospective reports only characterizes that reporting process until independently validated. Predicting the overall chance of a mistake requires correct trials or other reliable exposure denominators.

### Advancement criteria

Before collecting the confirmatory sample, preregister these proposed product gates or revise them with a research collaborator:

1. **Predictive improvement:** at least five percentage points absolute improvement in top-5 recall over the strongest simple baseline, with a participant-clustered 95% confidence interval for the improvement excluding zero. This is a proposed practical threshold, not a published scientific constant.
2. **Replication:** improvement persists in a new sample and in the claimed usage context. A laboratory-only result supports a laboratory-specific claim.
3. **Coverage:** the report includes misses and uncertainty for names absent from the lexicon and for less-represented pronunciations; unsupported scope remains visible.
4. **Feature necessity:** remove frequency, prosody, and context terms in separate ablations. Keep a feature because it improves out-of-sample performance, not because its story sounds persuasive.
5. **User understanding:** usability testing verifies that visitors distinguish suggestions from measured odds and can explain why one result appeared.

If the predictive gate fails, retain a clearly labeled sound-and-context exploration product. Do not relabel it a brain predictor. If even the exploratory experience is unconvincing or pronunciation coverage is poor, improve the data and narrow scope before release.

### Development verification

Future new features should follow the repository's required Red–Green–Refactor workflow: write a meaningful failing test, confirm it fails for the intended reason, implement, then refactor. Key behaviors to test include pronunciation selection, Unicode normalization, tokenized diphthongs, candidate exclusions, homophone grouping, deterministic ties, N larger than the eligible vocabulary, and missing-data fallbacks.

Keep hand-audited phoneme alignments and candidate fixtures. Assert that the pair inspector uses the same model as the result list and that every explanation is supported by the actual feature values. Test that changing N never changes a candidate's underlying score or full-set probability. A demonstration-name fixture should test feature handling, not require a favored alternative to rank first.

For browser controls implemented with invisible radio or checkbox inputs, set width and height explicitly to 100% when they must cover a label. Reproduce the small intrinsic-input-size condition in a test. Track pointer versus keyboard focus when moving focus after a tap, and include an actual iPhone check; desktop WebKit does not settle these Safari behaviors.

## 10 Delivery stages

| Stage | Deliverable | Exit criterion |
| --- | --- | --- |
| Research and design | This document, cited hypotheses, model boundaries | Agreement on the product's claim and initial language scope |
| Data feasibility | Source manifests, pronunciation audit, alias policy, coverage report | Representative names have inspectable pronunciations; gaps and licenses are understood |
| Exploratory prototype | Name input, top N, pair inspector, explanations, private sharing | Deterministic results, useful explanations, accessible mobile interaction |
| Behavioral pilot | Approved collection protocol, pilot data, baseline evaluation | Error yield and annotation reliability support a confirmatory study |
| Predictive evaluation | Frozen model, held-out report, calibration if applicable | Preregistered improvement and replication gates met |
| Public release | Scoped model card, sources, privacy behavior, versioned assets | UI claims match the demonstrated evidence |

The technical prototype is the smaller uncertainty. Obtaining representative behavioral evidence is the larger one. Scope, budget, and schedule for that research should follow the feasibility pilot rather than assume an existing ready-made dataset.

The recommended first implementation is therefore a fast, local, explainable name explorer with a strong pair inspector. Its scientific ambition is to discover whether a useful substitution predictor can be built and where it works. Its immediate appeal is helping people examine the oddly specific names they keep getting called.

## 11 References and reading notes

The links in the body support nearby claims. This bibliography supplies complete identification and distinguishes direct evidence from adjacent work. “Abstract reviewed” means the design relies only on the accessible abstract or author record, not uninspected methods or numerical results.

1. **Deffler, S. A., Fox, C., Ogle, C. M., and Rubin, D. C. (2016).** All my children: The roles of semantic category and phonetic similarity in the misnaming of familiar individuals. *Memory & Cognition, 44*, 989–999. [DOI](https://doi.org/10.3758/s13421-016-0613-z). Direct everyday-misnaming evidence. Abstract reviewed; institutional manuscript access was blocked during this review.

2. **Griffin, Z. M., and Wangerman, T. (2013).** Parents accidentally substitute similar sounding sibling names more often than dissimilar names. *PLOS ONE, 8*(12), e84444. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC3877301/) · [DOI](https://doi.org/10.1371/journal.pone.0084444). Direct evidence; methods and regression table inspected, including the null result for syllables and stress.

3. **Brédart, S., and Dardenne, B. (2015).** Similarities between the target and the intruder in naturally occurring repeated person naming errors. *Frontiers in Psychology, 6*, 1474. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC4586349/) · [DOI](https://doi.org/10.3389/fpsyg.2015.01474). Recurrent misnaming, contextual similarity, and asymmetry. Methods and results inspected.

4. **Dupont, M. (2019 online; 2020 issue).** Experimentally induced single and repeated personal name confusions: The impact of phonological and semantic similarity. *Psychological Reports, 123*(3), 781–805. [Author record and abstract](https://orbi.uliege.be/handle/2268/233115) · [DOI](https://doi.org/10.1177/0033294118825098). Controlled face–name learning; abstract reviewed. Full manuscript requires separate access.

5. **Brédart, S., and Valentine, T. (1992).** From Monroe to Moreau: An analysis of face naming errors. *Cognition, 45*(3), 187–223. [Abstract](https://pubmed.ncbi.nlm.nih.gov/1490322/) · [DOI](https://doi.org/10.1016/0010-0277(92)90017-C). Frequency asymmetries and monitoring; abstract reviewed.

6. **Burke, D. M., MacKay, D. G., Worthley, J. S., and Wade, E. (1991).** On the tip of the tongue: What causes word finding failures in young and older adults? *Journal of Memory and Language, 30*(5), 542–579. [Publisher abstract](https://www.sciencedirect.com/science/article/pii/0749596X9190026G) · [DOI](https://doi.org/10.1016/0749-596X(91)90026-G). Transmission-deficit account; adjacent evidence about retrieval failures.

7. **Burke, D. M., Locantore, J. K., Austin, A. A., and Chae, B. (2004).** Cherry pit primes Brad Pitt: Homophone priming effects on young and older adults' production of proper names. *Psychological Science, 15*(3), 164–170. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC2255560/) · [DOI](https://doi.org/10.1111/j.0956-7976.2004.01503004.x). Evidence that sound overlap can facilitate retrieval under particular conditions.

8. **Dell, G. S. (1986).** A spreading-activation theory of retrieval in sentence production. *Psychological Review, 93*(3), 283–321. [DOI](https://doi.org/10.1037/0033-295X.93.3.283). Foundational formal model; model details used here were checked against the accessible 1997 implementation.

9. **Dell, G. S., Schwartz, M. F., Martin, N., Saffran, E. M., and Gagnon, D. A. (1997).** Lexical access in aphasic and nonaphasic speakers. *Psychological Review, 104*(4), 801–838. [Manuscript](https://cseweb.ucsd.edu/~gary/PAPER-SUGGESTIONS/dell-et-al-psych-rev-1997b.pdf) · [DOI](https://doi.org/10.1037/0033-295X.104.4.801). Interactive two-step model. Activation rule and architecture inspected, especially p. 805.

10. **Burton, A. M., and Bruce, V. (1992).** I recognize your face but I can't remember your name: A simple explanation? *British Journal of Psychology, 83*, 45–60. [DOI and abstract](https://doi.org/10.1111/j.2044-8295.1992.tb02424.x). Implemented person-naming model; abstract reviewed.

11. **Brédart, S., Valentine, T., Calder, A., and Gassi, L. (1995).** An interactive activation model of face naming. *Quarterly Journal of Experimental Psychology A, 48*(2), 466–486. [Abstract](https://pubmed.ncbi.nlm.nih.gov/7610275/) · [DOI](https://doi.org/10.1080/14640749508401400). Experimental challenge and revised architecture; abstract reviewed.

12. **Oppenheim, G. M., Dell, G. S., and Schwartz, M. F. (2010).** The dark side of incremental learning: A model of cumulative semantic interference during lexical access in speech production. *Cognition, 114*(2), 227–252. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC2924492/) · [DOI](https://doi.org/10.1016/j.cognition.2009.09.007). Learning-based account of interference and repetition benefits; relevant model sections inspected.

13. **Danker, J. F., Gunn, P., and Anderson, J. R. (2008).** A rational account of memory predicts left prefrontal activation during controlled retrieval. *Cerebral Cortex, 18*(11), 2674–2685. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC2733322/) · [DOI](https://doi.org/10.1093/cercor/bhn027). ACT-R cue-based retrieval; relevant indexed full-text model description reviewed.

14. **Balatsou, E., Fischer-Baum, S., and Oppenheim, G. M. (2022).** The psychological reality of picture name agreement. *Cognition, 218*, 104947. [DOI](https://doi.org/10.1016/j.cognition.2021.104947) · [Accepted manuscript](https://oppenheim-lab.bangor.ac.uk/pubs/balatsouFischerBaumOppenheim_inPress2021_Cognition_preprint.pdf). Individual history versus population norms in object naming; abstract and relevant introduction reviewed. Published online in 2021.

15. **Irons, S. T., Oppenheim, G. M., and Fischer-Baum, S. (2017).** Breaking the Dark Side: A computational neuropsychological approach. *Academy of Aphasia 55th Annual Meeting*, conference abstract. [Institutional record](https://research.bangor.ac.uk/en/publications/breaking-the-dark-side-a-computational-neuropsychological-approac/) · [DOI](https://doi.org/10.3389/conf.fnhum.2017.223.00037). Relevant modeling connection, with conference-level evidentiary status.

16. **Brédart, S. (2017).** The cognitive psychology and neuroscience of naming people. *Neuroscience & Biobehavioral Reviews, 83*, 145–154. [Full text](https://orbi.uliege.be/bitstream/2268/215164/1/NBBR2017.pdf) · [DOI](https://doi.org/10.1016/j.neubiorev.2017.10.008). Broad review; especially useful for distinctions between population frequency and personal exposure.

17. **Desai, R. H., Tadimeti, U., and Riccardi, N. (2023).** Proper and common names in the semantic system. *Brain Structure and Function, 228*, 239–254. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC10171918/) · [DOI](https://doi.org/10.1007/s00429-022-02593-9). fMRI recognition study; relevant methods and conclusions reviewed in indexed full text. Published online in 2022.

18. **Brédart, S., Devue, C., and Vanootighem, V. (2026).** My name is, who? On being misnamed by a relative or a romantic partner. *Psychological Research, 90*, article 161. [Abstract](https://pubmed.ncbi.nlm.nih.gov/42696057/) · [DOI](https://doi.org/10.1007/s00426-026-02376-5). Emotional responses relevant to product tone; abstract reviewed.

19. **Mortensen, D. R., Littell, P., Bharadwaj, A., Goyal, K., Dyer, C., and Levin, L. (2016).** PanPhon: A resource for mapping IPA segments to articulatory feature vectors. *Proceedings of COLING 2016*, 3475–3484. [Paper and record](https://aclanthology.org/C16-1328/). Engineering resource; its NLP evaluations are not a validation of misnaming predictions.

Supporting reference resources: [CMUdict repository](https://github.com/cmusphinx/cmudict), [CMUdict license](https://github.com/cmusphinx/cmudict/blob/master/LICENSE), [SSA researcher downloads and suppression rules](https://www.ssa.gov/oact/babynames/limits.html), and [Rice's Fischer-Baum profile](https://profiles.rice.edu/faculty/simon-fischer-baum). Accessed 31 October 2026.
