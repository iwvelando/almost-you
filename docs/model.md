# Implemented model: baseline-1

This document specifies the shipped heuristic. The wider research proposal in `research-and-design.md` is background, not a statement of implemented features. The live **The science** page contains the user-facing formulas and scholarly citations.

## Data and normalization

6,027 spellings meet both conditions: at least 500 pooled SSA records in 1950–2020 and an exact lowercase CMUdict match. Recorded sex categories are pooled and discarded. Names are matched case-insensitively after trimming whitespace. CMUdict pronunciation order is retained; ARPAbet stress digits are stripped for comparison. IPA in the UI is a broad display conversion, not a dialect transcription service. Stress-free display can make recorded variants look similar; stress is not scored.

Candidate names use their first pronunciation. The target may use any recorded variant. Remove the target spelling and candidates whose primary normalized pronunciation equals the selected target pronunciation. Group the remaining candidates by their primary normalized pronunciation. Represent each group with its most frequent spelling, breaking count ties alphabetically; retain other spellings as aliases without summing their counts.

## Equations

For target sequence a and candidate b, D is unit-cost Levenshtein distance:

`D[i,j] = min(D[i−1,j]+1, D[i,j−1]+1, D[i−1,j−1]+[aᵢ ≠ bⱼ])`

Boundary conditions: `D[i,0]=i`, `D[0,j]=j`. Thus:

- `P = 1 − D[a,b]/max(length(a),length(b))` (empty/empty distance is zero).
- `E = 0.5·[same first phone] + 0.5·[same last phone]`.
- `F = ln(1+candidate count)/ln(1+largest count in the bundled catalog)`.
- Sound-only default: `S = 0.85P + 0.15E`.
- Sound + frequency default: `S = 0.75P + 0.15E + 0.10F`.

### Adjustable weights

The general form is `S = (wP·P + wE·E + wF·F) / (wP + wE + wF)` with `E = (1−λ)·[same first phone] + λ·[same last phone]`. Weights are 0–100 importances; λ = last/100. Defaults are wP=85, wE=15, wF=0, λ=0.5 (sound) and wP=75, wE=15, wF=10, λ=0.5 (frequency). These reproduce the published defaults exactly, so the model version remains `baseline-1`. Visitors can change them in the collapsed **Tune the formula** panel; settled values are stored locally per model and Restore defaults stores the defaults. No weight is fitted.

Rank groups by descending S, then alphabetically. Truncate only after ranking, so N never changes scores. The displayed number is rounded to two decimals; ranking uses full precision. Tied scores have an arbitrary alphabetical order, not evidence of differing likelihood. Frequency mode is directional because the frequency belongs to the candidate.

Pair alignment backtraces the same distance matrix, preferring diagonal, deletion, then insertion on equal-cost paths. Other equally optimal alignments can exist. Comparison accepts names outside the visible top N, reports their full sound-group rank, and computes ingredients using that spelling's own count. A lower-frequency alias may therefore have a different comparison score from its group's representative. Same-sound comparisons and the target itself have no candidate rank.

The default demonstration compares Julian (`JH UW1 L IY0 AH0 N`) with Jillian (`JH IH1 L IY0 AH0 N`). One of six phonemes differs: D=1, P=5/6, E=1, and sound-only S≈0.858. The example illustrates the calculation, not an established real-world confusion. The dataset also records an alternate pronunciation of Julian, so the pronunciation selector can change the comparison.

## Evidence versus design

Deffler et al. (2016), [DOI](https://doi.org/10.3758/s13421-016-0613-z), five retrospective studies of familiar-person misnaming, found relationship category dominated (φ ≈ .77–.93) and phonetic similarity contributed less (φ ≈ .49–.68). They measured phonetic similarity two ways: (a) a 0–2 rating, 2 for identical beginning and ending sounds or a multi-letter shared beginning, 1 for a shared beginning or ending sound; (b) the proportion of the used name's phonemes present in the correct name, divided by the correct name's phoneme count (order-insensitive, CMUdict-based). Against Monte Carlo pairs, the rating's effect equalled or exceeded overlap's in Studies 2–5 (η² = .04/.10/.05/.05 versus .01/.04/.02/.05). Name frequency was not examined. E adapts the rating scheme; P is neither of their measures.

Griffin & Wangerman (2013), [DOI](https://doi.org/10.1371/journal.pone.0084444), Table 1 (cumulative-odds ordinal regression, N = 334): same initial phoneme b = 0.309 (OR 1.36, p = .055); same final phoneme b = 0.302 (OR 1.35, p = .042), with a same-final × same-gender interaction b = 0.319 (p = .032); same gender b = 0.626 (p < .001). Syllable count and stress were not predictive. The near-equal edge coefficients motivate λ = 0.5. No frequency measure was collected. Neither paper supplies P, the relative weights or the frequency transform, or validates rankings for strangers.

Dell et al. (1997), [DOI](https://doi.org/10.1037/0033-295X.104.4.801), provides an interactive activation account of lexical access and errors. Danker et al. (2008), [DOI](https://doi.org/10.1093/cercor/bhn027), illustrates a mathematical ACT-R retrieval account. Neither architecture is implemented here. Balatsou, Fischer-Baum & Oppenheim (2022), [DOI](https://doi.org/10.1016/j.cognition.2021.104947), cautions through picture-naming evidence that individuals' histories matter beyond population norms. Brédart's 2017 [review](https://doi.org/10.1016/j.neubiorev.2017.10.008) notes that a name's frequency of use depends on both population frequency and known bearers, and that how to combine them is unknown; its frequency discussion concerns ease of recall, not intrusion of common names. None of the cited works tests whether popular first names intrude more often, which is why F is small and optional.

## Hand-chosen values

| Value | Adjustable? | Reason |
|---|---|---|
| wP, wE, wF | Yes | Relative weights of research-named ingredients; no cited values. Deffler's comparison favours edges over whole-name overlap, opposite to the default emphasis, which is retained rather than replaced by another guess. |
| λ (first/last balance) | Yes | Griffin's edge coefficients are nearly equal. |
| Unit edit costs | No | Standard Levenshtein; keeps P in [0,1]. A reduced-vowel difference (Justin AH0 vs IH0) costs a full substitution. |
| Normalize by longer length | No | Comparability across lengths. |
| Exact first/last phone, stress stripped | No | Matches both studies' edge coding; Griffin found stress not predictive. |
| ln(1+count)/ln(1+max) | No | Compresses a 500 to ~3.9 million range into [0,1]; uncited. |
| 1950–2020, ≥500 records | No | Mirror ends 2020; start year and cutoff are untested coverage choices fixed at build time. |
| First candidate pronunciation, alphabetical ties, two-decimal display | No | Repeatable conventions; tie order is meaningless. |

The implementation deliberately begins with a simple, testable baseline. Unit-cost phoneme edits ignore articulatory distance, semantic/social relationships, accents, familiarity, recent exposures, hearing errors, syllable structure and stress. Coefficients are hand-chosen and user-adjustable. No claims of calibrated probability, validated cognitive realism or causal explanation are warranted. Evaluating any more ambitious model requires an appropriate independent dataset; this app has no collection capability.
