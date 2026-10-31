import { useEffect, useRef, useState, type FormEvent } from "react";
import { Science } from "./Science";
import { Theme } from "./Theme";
import { NameInput } from "./NameInput";
import { Icon } from "./Icon";
import {
  Tuning,
  loadWeights,
  saveWeights,
  type Mode,
  type Weights,
  type WeightSet,
} from "./Tuning";

type Name = { name: string; count: number; pronunciations: string[][] };
type Result = {
  name: string;
  aliases: string[];
  score: number;
  sound: number;
  edge: number;
  frequency: number;
  phones: string[];
  alignment: { from: string; to: string }[];
  rank: number;
};
type Response = {
  target: Name;
  results: Result[];
  total: number;
  comparison?: Result;
  comparisonError?: string;
  custom?: boolean;
  error?: string;
};
const phones: Record<string, string> = {
  AA: "ɑ",
  AE: "æ",
  AH: "ʌ",
  AO: "ɔ",
  AW: "aʊ",
  AY: "aɪ",
  B: "b",
  CH: "tʃ",
  D: "d",
  DH: "ð",
  EH: "ɛ",
  ER: "ɝ",
  EY: "eɪ",
  F: "f",
  G: "ɡ",
  HH: "h",
  IH: "ɪ",
  IY: "i",
  JH: "dʒ",
  K: "k",
  L: "l",
  M: "m",
  N: "n",
  NG: "ŋ",
  OW: "oʊ",
  OY: "ɔɪ",
  P: "p",
  R: "ɹ",
  S: "s",
  SH: "ʃ",
  T: "t",
  TH: "θ",
  UH: "ʊ",
  UW: "u",
  V: "v",
  W: "w",
  Y: "j",
  Z: "z",
  ZH: "ʒ",
};
const base = (s: string) => s.replace(/[012]/g, "");
const ipa = (s: string) =>
  s === "AH0" ? "ə" : s === "ER0" ? "ɚ" : phones[base(s)] || s;
const pronunciation = (p: string[]) => "/" + p.map(ipa).join("") + "/";
function Mark() {
  return (
    <svg viewBox="0 0 44 38" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="29"
        height="28"
        rx="6"
        transform="rotate(-12 18 17)"
        fill="currentColor"
        opacity=".25"
      />
      <rect x="12" y="9" width="29" height="26" rx="6" fill="currentColor" />
      <path
        d="M19 20h15M19 26h8"
        stroke="var(--paper)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function App() {
  const [route, setRoute] = useState(location.hash || "#explore");
  const science = [
    "#science",
    "#evidence",
    "#math",
    "#limits",
    "#tuning",
    "#privacy",
    "#reading",
  ].includes(route);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (route === "#science" || route === "#explore") {
        window.scrollTo({ top: 0 });
      } else if (route.startsWith("#")) {
        document.getElementById(route.slice(1))?.scrollIntoView();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [route]);
  const [ready, setReady] = useState(false),
    [bootError, setBootError] = useState(""),
    [catalog, setCatalog] = useState<string[]>([]);
  const [input, setInput] = useState("Julian"),
    [name, setName] = useState("Julian"),
    [n, setN] = useState(5),
    [mode, setMode] = useState<Mode>("sound"),
    [variant, setVariant] = useState(0);
  const [weightSet, setWeightSet] = useState<WeightSet>(loadWeights);
  const weights = weightSet[mode];
  function settleWeights(m: Mode, next: Weights) {
    setWeightSet((prev) => {
      const all = { ...prev, [m]: next };
      saveWeights(all);
      return all;
    });
  }
  const [pairInput, setPairInput] = useState("Jillian"),
    [pair, setPair] = useState("Jillian"),
    [data, setData] = useState<Response | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [restart, setRestart] = useState(0);
  const worker = useRef<Worker | null>(null),
    sequence = useRef(0);
  useEffect(() => {
    const update = () => {
      setRoute(location.hash || "#explore");
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    setReady(false);
    setBootError("");
    document.documentElement.dataset.engine = "loading";
    const w = new Worker(`${import.meta.env.BASE_URL}worker.js`);
    worker.current = w;
    const fail = () => {
      setBootError(
        "The name engine could not start. Please reload it to try again.",
      );
      document.documentElement.dataset.engine = "error";
      setReady(false);
      setBusy(false);
    };
    const timeout = setTimeout(fail, 30000);
    w.onmessage = ({ data: message }) => {
      if (message.type === "ready") {
        clearTimeout(timeout);
        setCatalog(message.catalog.names);
        setReady(true);
        document.documentElement.dataset.engine = "ready";
      } else if (message.type === "error") {
        clearTimeout(timeout);
        fail();
      } else if (message.id === sequence.current) {
        setBusy(false);
        if (message.result.error) {
          setError(message.result.error);
        } else {
          setData(message.result);
          setError("");
        }
      }
    };
    w.onerror = () => {
      clearTimeout(timeout);
      fail();
    };
    return () => {
      clearTimeout(timeout);
      w.terminate();
      worker.current = null;
    };
  }, [restart]);
  useEffect(() => {
    if (!ready) return;
    setBusy(true);
    worker.current?.postMessage({
      id: ++sequence.current,
      request: {
        action: "rank",
        name,
        n,
        mode,
        variant,
        compare: pair,
        weights,
      },
    });
  }, [ready, name, n, mode, variant, pair, weights]);
  function submit(e: FormEvent) {
    e.preventDefault();
    setVariant(0);
    setName(input.trim());
    if (input.trim() === name) {
      setBusy(true);
      worker.current?.postMessage({
        id: ++sequence.current,
        request: {
          action: "rank",
          name,
          n,
          mode,
          variant: 0,
          compare: pair,
          weights,
        },
      });
    }
  }
  function compare(e: FormEvent) {
    e.preventDefault();
    setPair(pairInput.trim());
  }
  const comp = data?.comparison;
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#explore" aria-label="Almost You home">
          <Mark />
          <span>
            almost you<span className="brand-dot">.</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a className={!science ? "active" : ""} href="#explore">
            Explore
          </a>
          <a className={science ? "active" : ""} href="#science">
            The science
          </a>
        </nav>
        <Theme />
      </header>
      <div id="main">
        {science ? (
          <Science />
        ) : (
          <main className="page explorer">
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">
                  <span className="tiny-star">
                    <Icon kind="spark" />
                  </span>{" "}
                  An experiment in mistaken identity
                </span>
                <h1>
                  The names you
                  <br />
                  <em>almost</em> answer to.
                </h1>
                <p>
                  For every “Sorry, I meant…”
                  <br />
                  Meet the names a little too close to yours.
                </p>
                <a className="text-link" href="#science">
                  There’s a little science behind the slip{" "}
                  <span aria-hidden="true">
                    <Icon kind="arrow" />
                  </span>
                </a>
              </div>
              <div className="badge-stage">
                <span className="scribble">
                  You know who you are.
                  <br />
                  Does everyone else?
                </span>
                <form className="name-badge" onSubmit={submit}>
                  <div className="badge-top">
                    <span>hello</span>
                    <small>my name is</small>
                  </div>
                  <div className="badge-middle">
                    <NameInput
                      value={input}
                      onChange={setInput}
                      catalog={catalog}
                    />
                    <span className="input-hint">
                      your first name goes here
                    </span>
                  </div>
                  <button
                    className="badge-submit"
                    disabled={!ready || busy || !input.trim()}
                  >
                    {ready
                      ? "Find my almost-names"
                      : "Opening the name collection…"}
                    <span aria-hidden="true">
                      <Icon kind="arrow" />
                    </span>
                  </button>
                </form>
                <span className="private-note">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <rect x="3" y="7" width="10" height="7" rx="2" />
                    <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                  </svg>
                  Just between you and your browser.
                </span>
              </div>
            </section>
            {bootError && (
              <div className="error" role="alert">
                {bootError}{" "}
                <button onClick={() => setRestart((v) => v + 1)}>
                  Reload engine
                </button>
              </div>
            )}
            {error && (
              <div className="error" role="alert">
                <strong>A name beyond our collection.</strong>
                <p>{error}</p>
                <a href="#limits">Why some names are missing</a>
              </div>
            )}
            {data && !error && (
              <>
                <section className="results-section" aria-busy={busy}>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">Close, but not quite</span>
                      <h2 aria-live="polite">
                        {data.target.name}’s almost-names
                      </h2>
                    </div>
                    <span className="collection-note">
                      6,027 spellings. A few near misses.
                    </span>
                  </div>
                  <div className="controls">
                    <label>
                      Ranking model
                      <select
                        aria-label="Ranking model"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as Mode)}
                      >
                        <option value="sound">Sound only</option>
                        <option value="frequency">Sound + frequency</option>
                      </select>
                    </label>
                    <label>
                      Show
                      <select
                        aria-label="Number of results"
                        value={n}
                        onChange={(e) => setN(Number(e.target.value))}
                      >
                        <option value="5">5 names</option>
                        <option value="10">10 names</option>
                        <option value="20">20 names</option>
                      </select>
                    </label>
                    {data.target.pronunciations.length > 1 && (
                      <label>
                        Your pronunciation
                        <select
                          aria-label="Your pronunciation"
                          value={variant}
                          onChange={(e) => setVariant(Number(e.target.value))}
                        >
                          {data.target.pronunciations.map((p, i) => (
                            <option key={i} value={i}>
                              {pronunciation(p)} · {i + 1}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <p data-testid="model-note">
                      {mode === "sound"
                        ? "A sound resemblance, without a popularity boost."
                        : "Sound resemblance, with a small U.S. name-frequency boost."}
                    </p>
                  </div>
                  <Tuning
                    mode={mode}
                    weights={weights}
                    onSettle={settleWeights}
                  />
                  <div className="results-body">
                    <ol className="results-list">
                      {data.results.map((r) => (
                        <li key={r.name} data-testid="result">
                          <button
                            onClick={() => {
                              setPair(r.name);
                              setPairInput(r.name);
                            }}
                            aria-label={`Inspect ${r.name}`}
                            className={comp?.name === r.name ? "selected" : ""}
                          >
                            <span className="rank">
                              {String(r.rank).padStart(2, "0")}
                            </span>
                            <span className="result-name">
                              <strong>{r.name}</strong>
                              {r.aliases.length > 0 && (
                                <small>
                                  also {r.aliases.slice(0, 3).join(", ")}
                                  {r.aliases.length > 3
                                    ? ` +${r.aliases.length - 3}`
                                    : ""}
                                </small>
                              )}
                            </span>
                            <span className="result-phones">
                              {pronunciation(r.phones)}
                            </span>
                            <span className="similarity">
                              <span>{r.score.toFixed(2)}</span>
                              <small>similarity</small>
                            </span>
                            <span className="inspect-icon" aria-hidden="true">
                              <Icon kind="arrow" />
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                    <aside className="results-aside">
                      <span className="asterisk">
                        <Icon kind="spark" />
                      </span>
                      <h3>Almost is doing a lot of work here.</h3>
                      <p>
                        These are experimental suggestions, not measured odds of
                        a mix-up.
                      </p>
                      <p>
                        People you know, your accent, and the situation matter.
                        A name alone can’t tell the whole story.
                      </p>
                      <a className="text-link" href="#math">
                        Peek at the math{" "}
                        <span aria-hidden="true">
                          <Icon kind="arrow" />
                        </span>
                      </a>
                    </aside>
                  </div>
                  <p className="results-caption">
                    Same-sounding spellings are grouped. Your own sound-alikes
                    are left out. Select a name to take a closer look.
                  </p>
                </section>
                <section className="pair-section">
                  <div className="pair-intro">
                    <span className="eyebrow">That one name. Every time.</span>
                    <h2>“Actually, it’s {data.target.name}.”</h2>
                    <p>
                      Already have a recurring mistaken identity?
                      <br />
                      Put the two names side by side.
                    </p>
                    <form onSubmit={compare}>
                      <label htmlFor="compare-name">
                        I keep getting called
                      </label>
                      <div className="pair-input">
                        <input
                          id="compare-name"
                          aria-label="Compare with"
                          value={pairInput}
                          onChange={(e) => setPairInput(e.target.value)}
                          maxLength={80}
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <button disabled={!ready || busy || !pairInput.trim()}>
                          Compare names
                        </button>
                      </div>
                    </form>
                  </div>
                  <div
                    className="comparison"
                    data-testid="comparison"
                    aria-live="polite"
                  >
                    {data.comparisonError ? (
                      <p role="status">{data.comparisonError}</p>
                    ) : (
                      comp && (
                        <>
                          <div className="pair-title">
                            <span>{data.target.name}</span>
                            <i>&</i>
                            <span>{comp.name}</span>
                          </div>
                          <div
                            className="sound-alignment"
                            aria-label="Aligned pronunciation sounds"
                          >
                            {comp.alignment.map((cell, i) => (
                              <div
                                key={i}
                                className={
                                  base(cell.from) === base(cell.to)
                                    ? "sound-cell same"
                                    : "sound-cell"
                                }
                              >
                                <span>{ipa(cell.from) || "·"}</span>
                                <span>{ipa(cell.to) || "·"}</span>
                              </div>
                            ))}
                          </div>
                          <div className="alignment-key">
                            <span>
                              <i /> Shared sound
                            </span>
                            <span>· No sound in this position</span>
                          </div>
                          <div className="pair-verdict">
                            <strong>
                              {comp.rank === 0
                                ? comp.sound === 1
                                  ? "Same sounds"
                                  : "Your own name"
                                : `#${comp.rank.toLocaleString()} of ${data.total.toLocaleString()} sound groups`}
                            </strong>
                            <span>
                              {comp.rank === 0
                                ? "Excluded from the ranked alternatives."
                                : `Under ${data.custom ? "your custom weights for the" : "the"} ${mode === "sound" ? "sound-only" : "sound + frequency"} model.`}
                            </span>
                          </div>
                          <details>
                            <summary>See the score ingredients</summary>
                            <dl>
                              <div>
                                <dt>Sound similarity · P</dt>
                                <dd>{comp.sound.toFixed(3)}</dd>
                              </div>
                              <div>
                                <dt>Matching edges · E</dt>
                                <dd>{comp.edge.toFixed(3)}</dd>
                              </div>
                              <div>
                                <dt>Log frequency · F</dt>
                                <dd>{comp.frequency.toFixed(3)}</dd>
                              </div>
                              <div>
                                <dt>Combined score · S</dt>
                                <dd>{comp.score.toFixed(3)}</dd>
                              </div>
                            </dl>
                            <p>
                              Phonemes shown in broad IPA; stress is ignored.
                              These numbers describe this heuristic, not a
                              person’s chance of making a mistake.
                            </p>
                          </details>
                        </>
                      )
                    )}
                  </div>
                </section>
                <section className="closing">
                  <span className="mini-badge">still you.</span>
                  <p>
                    A name is more than its nearest neighbors.
                    <br />
                    <strong>But it’s fun to meet them.</strong>
                  </p>
                  <a className="text-link" href="#science">
                    Read the science{" "}
                    <span aria-hidden="true">
                      <Icon kind="arrow" />
                    </span>
                  </a>
                </section>
              </>
            )}
            {!data && !bootError && (
              <p className="loading" role="status">
                Gathering the almosts…
              </p>
            )}
          </main>
        )}
      </div>
      <footer>
        <a className="footer-brand" href="#explore">
          almost you.
        </a>
        <span>A small experiment in being slightly misremembered.</span>
        <a href="#privacy">Private by design</a>
      </footer>
      <nav className="mobile-dock" aria-label="Mobile navigation">
        <a className={!science ? "active" : ""} href="#explore">
          <span aria-hidden="true">
            <Icon kind="circle" />
          </span>
          Explore
        </a>
        <a className={science ? "active" : ""} href="#science">
          <span aria-hidden="true">
            <Icon kind="spark" />
          </span>
          The science
        </a>
      </nav>
    </>
  );
}
