const adjustable: [string, string, string][] = [
  [
    "Whole-name sound (P)",
    "85, or 75 with frequency",
    "Our choice. Edit distance itself is not taken from the cited studies.",
  ],
  [
    "First and last sounds (E)",
    "15",
    "Our choice. The ingredient follows how both misnaming studies coded sound similarity; its size relative to P does not.",
  ],
  [
    "Name frequency (F)",
    "0, or 10 with frequency",
    "Our choice, kept small because no cited study tested whether common first names intrude.",
  ],
  [
    "First vs. last sound balance",
    "50 / 50",
    "The sibling study’s first- and last-sound effects were nearly equal (log-odds 0.31 and 0.30).",
  ],
];
const fixed: [string, string, string][] = [
  [
    "Edit costs",
    "1 for each insertion, deletion or substitution",
    "The standard Levenshtein definition keeps P between 0 and 1. It treats every sound swap alike, so the barely audible vowel difference between Justin’s two recorded pronunciations costs as much as swapping k for m.",
  ],
  [
    "Length scaling",
    "Divide by the longer name",
    "Makes long and short names comparable: one changed sound matters more in a three-sound name.",
  ],
  [
    "Edges",
    "Exact first and last phoneme, stress ignored",
    "Matches how the misnaming studies coded edges. Stress patterns did not predict sibling mix-ups.",
  ],
  [
    "Frequency scale",
    "ln(1 + count) / ln(1 + largest count)",
    "Counts range from 500 to almost 4 million. The logarithm keeps the most common names from swamping the rest, and dividing by the largest keeps F between 0 and 1. Not taken from the cited studies.",
  ],
  [
    "Birth years",
    "1950–2020",
    "The public mirror ends in 2020. The start year is our choice, meant to cover names carried by living adults; its effect has not been tested. Fixed when the collection is built.",
  ],
  [
    "Minimum count",
    "500 pooled records",
    "Trims rare spellings and keeps the download small, but also excludes legitimate names. Fixed when the collection is built.",
  ],
  [
    "Candidate sounds",
    "First recorded pronunciation",
    "Gives each spelling one sound group. Other pronunciations of a candidate are not scored.",
  ],
  [
    "Ties and rounding",
    "Alphabetical; two decimals shown",
    "A repeatable but meaningless order. Ranking uses full precision.",
  ],
];
export function Science() {
  return (
    <main className="science page">
      <div className="science-intro">
        <span className="eyebrow">Behind the name tag</span>
        <h1>
          A little science.
          <br />A little uncertainty.
        </h1>
        <p className="lede">
          Names can be slippery. Predicting which one slips out is a much harder
          problem than finding similar sounds.
        </p>
      </div>
      <div className="science-layout">
        <aside className="contents">
          <span>On this page</span>
          <a href="#evidence">What we know</a>
          <a href="#math">What we calculate</a>
          <a href="#tuning">Numbers we chose</a>
          <a href="#limits">Where it falls short</a>
          <a href="#privacy">Your privacy</a>
          <a href="#reading">Further reading</a>
          <div className="margin-note">
            A hypothesis you can play with.
            <br />
            Not a mind reader.
          </div>
        </aside>
        <article>
          <section id="evidence">
            <h2>The idea has roots. The prediction is still a hypothesis.</h2>
            <p>
              Research on accidentally calling someone the wrong name finds both
              social and phonological influences. In five studies, Deffler and
              colleagues found that familiar people were commonly misnamed
              within the same relationship category: family for family, friend
              for friend. Sound similarity also mattered, but less. They
              measured it two ways: a rating of shared beginning and ending
              sounds, and the share of phonemes the two names had in common.
              Shared beginnings and endings separated real mix-ups from random
              name pairs at least as well as overall phoneme overlap did.{" "}
              <a href="https://doi.org/10.3758/s13421-016-0613-z">[1]</a>
            </p>
            <p>
              That makes a sibling’s name a plausible competitor. It does not
              establish that an unfamiliar person will make the same
              substitution. In a survey about parents mixing up siblings’ names,
              a shared last sound was associated with more frequent mix-ups,
              especially between siblings of the same gender. A shared first
              sound had a similar-sized association that fell just short of
              statistical significance (p = .055). Being the same gender
              mattered more than either sound. Shared syllable count and stress
              did not predict confusion in that study.{" "}
              <a href="https://doi.org/10.1371/journal.pone.0084444">[2]</a>
            </p>
            <p>
              Speech-production models describe activation spreading between
              representations of meanings, words and sounds. They provide a
              mathematical account of some speech errors, but a generic
              word-production model is not a validated name-confusion oracle.{" "}
              <a href="https://doi.org/10.1037/0033-295X.104.4.801">[3]</a>
            </p>
            <div className="callout">
              <h3>Why does the same wrong name keep coming up?</h3>
              <p>
                A repeated mix-up can be worth exploring without revealing its
                cause. Sound overlap alone cannot tell us which names a speaker
                knows, what they recently heard, or why they chose a particular
                alternative.
              </p>
            </div>
            <p>
              Simon Fischer-Baum’s work is relevant to the broader mechanism:
              with Balatsou and Oppenheim, he studied how naming reflects
              individual experience and population-level patterns. That work
              uses picture naming, not a database of first-name substitutions.
              Its useful lesson here is that population frequency is only a
              rough stand-in for a person’s experience.{" "}
              <a href="https://doi.org/10.1016/j.cognition.2021.104947">[4]</a>
            </p>
          </section>
          <section id="math">
            <span className="eyebrow">Baseline model · version 1</span>
            <h2>Small formulas. No mystery score.</h2>
            <p>
              The explorer implements two transparent heuristics. Neither has
              been fitted to observed name-confusion rates. Scores order
              candidates; they are <strong>not probabilities</strong>.
            </p>
            <h3>1. Compare the sounds</h3>
            <p>
              Turn each recorded pronunciation into a sequence of phonemes.
              Ignore stress digits, then count the fewest insertions, deletions
              and substitutions required to change one sequence into the other.
              Every edit costs 1.
            </p>
            <div className="formula">P = 1 − D(a, b) / max(|a|, |b|)</div>
            <p>
              Here D is Levenshtein edit distance and |a| is the number of
              phonemes. P is 1 for identical sequences and 0 for maximally
              different ones. This measure is our choice: none of the studies
              cited here used edit distance. The sibling study coded only
              whether first or last sounds matched, and Deffler and colleagues
              counted shared phonemes regardless of order. Every phoneme
              substitution costs the same: this baseline does not model
              fine-grained articulatory similarity.
            </p>
            <h3>2. Notice the edges</h3>
            <div className="formula">
              E = ½ · [same first sound] + ½ · [same last sound]
            </div>
            <p>
              Each bracket is 1 when true, otherwise 0. This mirrors how both
              misnaming studies coded sound similarity. Deffler’s raters scored
              a pair higher when the names shared a beginning or an ending
              sound. The sibling study’s first- and last-sound effects were
              nearly equal in size, so the two halves count equally by default.
              Neither study says how much E should count relative to P. E partly
              counts those sounds twice, deliberately.
            </p>
            <h3>3. Optionally add name frequency</h3>
            <div className="formula">
              F = ln(1 + count) / ln(1 + largest count)
            </div>
            <p>
              Counts sum U.S. SSA birth-name records from 1950–2020, pooling the
              recorded sex categories. They describe births, not living
              population, global popularity, or the names someone personally
              knows.
            </p>
            <div className="model-formulas">
              <div>
                <span>Sound only · default</span>
                <strong>S = 0.85P + 0.15E</strong>
              </div>
              <div>
                <span>Sound + frequency · default</span>
                <strong>S = 0.75P + 0.15E + 0.10F</strong>
              </div>
            </div>
            <p>
              These coefficients are design choices, not fitted values. The
              defaults lean on whole-name sound, while Deffler’s comparison, if
              anything, points toward beginnings and endings. We kept the
              original defaults rather than trade one guess for another. You can
              test the alternative in <a href="#explore">Tune the formula</a>.
            </p>
            <p>
              None of the studies cited here tested whether popular first names
              are more likely to slip out, so the frequency term is
              intentionally small. Brédart’s review notes that how often we
              encounter a name depends on both its frequency in the population
              and the people we know who carry it, and that how to combine the
              two is still unknown.{" "}
              <a href="https://doi.org/10.1016/j.neubiorev.2017.10.008">[5]</a>
            </p>
            <h3>What happens to spelling variants?</h3>
            <p>
              Candidates use their first CMUdict pronunciation. Exact homophones
              are grouped; the most frequent spelling represents the group, and
              other spellings appear below it. We do not add their counts
              together. The entered name and candidates with the same sounds as
              the selected target pronunciation are excluded. Many names tie,
              especially short ones. Tied names appear alphabetically, and that
              order means nothing. Changing the number of results never changes
              a score.
            </p>
            <p>
              You can select a different recorded pronunciation for your own
              name. A comparison uses the comparison name’s first pronunciation.
              Its displayed rank is its sound group’s position, so another
              spelling may represent that group in the list. A same-sound
              comparison has no rank.
            </p>
            <h3>The larger mathematical picture</h3>
            <p>
              Dell’s interactive activation model updates node activation using
              decay, spreading activation and noise. ACT-R retrieval models
              combine a memory’s base activation with contextual cues. These
              approaches motivate a future model of experience and context;{" "}
              <strong>we do not run either model here</strong>. Without a
              person’s learned associations, their parameters would be
              speculative.{" "}
              <a href="https://doi.org/10.1037/0033-295X.104.4.801">[3]</a>{" "}
              <a href="https://doi.org/10.1093/cercor/bhn027">[6]</a>
            </p>
          </section>
          <section id="tuning">
            <span className="eyebrow">Hand-picked values</span>
            <h2>The numbers we chose.</h2>
            <p>
              No study supplies values for this formula. The numbers that set
              how much each ingredient counts can be changed under{" "}
              <a href="#explore">Tune the formula</a> on the Explore page. Your
              settings are saved in this browser, and Restore defaults puts the
              original values back.
            </p>
            <div
              className="param-table"
              role="table"
              aria-label="Adjustable weights"
            >
              <div role="row" className="param-head">
                <span role="columnheader">Adjustable weight</span>
                <span role="columnheader">Default</span>
                <span role="columnheader">Where it comes from</span>
              </div>
              {adjustable.map(([name, value, why]) => (
                <div role="row" key={name}>
                  <strong role="rowheader">{name}</strong>
                  <span role="cell">{value}</span>
                  <span role="cell">{why}</span>
                </div>
              ))}
            </div>
            <p>
              Other numbers stay fixed, because changing them would change what
              the formula measures or require rebuilding the name collection.
            </p>
            <div
              className="param-table"
              role="table"
              aria-label="Fixed choices"
            >
              <div role="row" className="param-head">
                <span role="columnheader">Fixed choice</span>
                <span role="columnheader">Value</span>
                <span role="columnheader">Why</span>
              </div>
              {fixed.map(([name, value, why]) => (
                <div role="row" key={name}>
                  <strong role="rowheader">{name}</strong>
                  <span role="cell">{value}</span>
                  <span role="cell">{why}</span>
                </div>
              ))}
            </div>
          </section>
          <section id="limits">
            <h2>A collection, not the whole world.</h2>
            <p>
              The bundle includes <strong>6,027 spellings</strong>: names with
              at least 500 pooled SSA records in the selected years and an exact
              spelling match in CMUdict. Pronunciations are predominantly North
              American English. SSA suppresses small counts, and the
              intersection excludes many legitimate names. A missing name is a
              limitation of this collection.
            </p>
            <p>
              CMUdict can contain errors, regional variants and pronunciations
              appropriate to a common word rather than a particular person’s
              name. Check the displayed sounds. No sex, ethnicity, personality
              or relationship is inferred from your input. Similarity alone
              cannot tell us who you resemble or what someone will call you.
            </p>
            <p>
              A scientifically stronger predictor would need independent,
              representative confusion data and held-out evaluation against
              simple baselines. This static app does not collect that data.
              Treat its results as an invitation to explore sound patterns.
            </p>
          </section>
          <section id="privacy">
            <h2>No names leave this page.</h2>
            <p>
              Almost You is a static website that collects no user-input data.
              The names you type and the results you explore stay in your
              browser. There are no accounts, tracking, or submissions.
            </p>
            <p>
              Your theme and formula weights are saved on your device. Neither
              contains a name. Reloading the page resets your name exploration.
              Following a citation opens another website.
            </p>
          </section>
          <section id="reading">
            <h2>Follow the footnotes.</h2>
            <ol className="references">
              <li>
                <a href="https://doi.org/10.3758/s13421-016-0613-z">
                  Deffler et al. (2016). All my children: The roles of semantic
                  category and phonetic similarity in the misnaming of familiar
                  individuals.
                </a>
                <span>Memory & Cognition, 44, 989–999.</span>
              </li>
              <li>
                <a href="https://doi.org/10.1371/journal.pone.0084444">
                  Griffin & Wangerman (2013). Parents accidentally substitute
                  similar sounding sibling names more often than dissimilar
                  names.
                </a>
                <span>PLOS ONE, 8(12), e84444.</span>
              </li>
              <li>
                <a href="https://doi.org/10.1037/0033-295X.104.4.801">
                  Dell et al. (1997). Lexical access in aphasic and nonaphasic
                  speakers.
                </a>
                <span>Psychological Review, 104(4), 801–838.</span>
              </li>
              <li>
                <a href="https://doi.org/10.1016/j.cognition.2021.104947">
                  Balatsou, Fischer-Baum & Oppenheim (2022). The psychological
                  reality of picture name agreement.
                </a>
                <span>Cognition, 218, 104947.</span>
              </li>
              <li>
                <a href="https://doi.org/10.1016/j.neubiorev.2017.10.008">
                  Brédart (2017). The cognitive psychology and neuroscience of
                  naming people.
                </a>
                <span>Neuroscience & Biobehavioral Reviews, 83, 145–154.</span>
              </li>
              <li>
                <a href="https://doi.org/10.1093/cercor/bhn027">
                  Danker, Gunn & Anderson (2008). A rational account of memory
                  predicts left prefrontal activation during controlled
                  retrieval.
                </a>
                <span>Cerebral Cortex, 18(11), 2674–2685.</span>
              </li>
            </ol>
            <h3>Public data, bundled locally</h3>
            <p>
              <a href="https://www.ssa.gov/oact/babynames/limits.html">
                SSA national name data
              </a>
              , retrieved through the{" "}
              <a href="https://github.com/hackerb9/ssa-baby-names">
                hackerb9 mirror
              </a>{" "}
              (1950–2020 subset).{" "}
              <a href="https://github.com/cmusphinx/cmudict">
                CMU Pronouncing Dictionary
              </a>
              , retrieved October 31, 2026. The repository records file hashes
              and transformation rules.{" "}
              <a href="/THIRD-PARTY-NOTICES.txt">Licenses and notices</a>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
