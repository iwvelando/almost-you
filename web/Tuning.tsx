import { useEffect, useRef, useState } from "react";

export type Mode = "sound" | "frequency";
export type Weights = {
  sound: number;
  edge: number;
  frequency: number;
  last: number;
};
export type WeightSet = Record<Mode, Weights>;

/* Hand-chosen baseline-1 values. None is fitted to observed name errors. */
export const DEFAULT_WEIGHTS: WeightSet = {
  sound: { sound: 85, edge: 15, frequency: 0, last: 50 },
  frequency: { sound: 75, edge: 15, frequency: 10, last: 50 },
};
const KEY = "almost-you-weights";
const SETTLE_MS = 250;

export function validWeights(w: unknown, mode: Mode): w is Weights {
  if (!w || typeof w !== "object") return false;
  const values = ["sound", "edge", "frequency", "last"].map(
    (k) => (w as Record<string, unknown>)[k],
  );
  if (
    !values.every(
      (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100,
    )
  )
    return false;
  const { sound, edge, frequency } = w as Weights;
  if (mode === "sound" && frequency !== 0) return false;
  return sound + edge + frequency > 0;
}
export const sameWeights = (a: Weights, b: Weights) =>
  a.sound === b.sound &&
  a.edge === b.edge &&
  a.frequency === b.frequency &&
  a.last === b.last;

/* Malformed or out-of-range stored values fall back per model to defaults. */
export function loadWeights(): WeightSet {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null");
    if (stored?.v !== 1) return DEFAULT_WEIGHTS;
    const pick = (mode: Mode) => {
      if (!validWeights(stored[mode], mode)) return DEFAULT_WEIGHTS[mode];
      const { sound, edge, frequency, last } = stored[mode] as Weights;
      return { sound, edge, frequency, last };
    };
    return { sound: pick("sound"), frequency: pick("frequency") };
  } catch {
    return DEFAULT_WEIGHTS;
  }
}
export function saveWeights(all: WeightSet) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, ...all }));
  } catch {
    /* Keep the weights in memory if storage is denied. */
  }
}

const two = (v: number) => v.toFixed(2);
export function formula(w: Weights, mode: Mode) {
  const sum = w.sound + w.edge + w.frequency || 1;
  const terms = [`${two(w.sound / sum)}P`, `${two(w.edge / sum)}E`];
  if (mode === "frequency") terms.push(`${two(w.frequency / sum)}F`);
  return `S = ${terms.join(" + ")}`;
}
export const edgeFormula = (w: Weights) =>
  `E = ${two(1 - w.last / 100)}·[same first] + ${two(w.last / 100)}·[same last]`;

type Props = {
  mode: Mode;
  weights: Weights;
  onSettle: (mode: Mode, weights: Weights) => void;
};
export function Tuning({ mode, weights, onSettle }: Props) {
  const [draft, setDraft] = useState(weights);
  const draftRef = useRef(draft);
  const panel = useRef<HTMLDivElement>(null);
  const settleRef = useRef(onSettle);
  settleRef.current = onSettle;
  useEffect(() => {
    setDraft(weights);
    draftRef.current = weights;
  }, [weights, mode]);
  // React's onChange follows every input event; a native change event marks
  // a pointer release or keyboard step. A short debounce lets steps settle.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const flush = () => {
      if (timer === undefined) return;
      clearTimeout(timer);
      timer = undefined;
      if (validWeights(draftRef.current, mode))
        settleRef.current(mode, draftRef.current);
    };
    const settle = () => {
      clearTimeout(timer);
      timer = setTimeout(flush, SETTLE_MS);
    };
    el.addEventListener("change", settle);
    return () => {
      // A pending edit belongs to this model; save it before switching.
      flush();
      el.removeEventListener("change", settle);
    };
  }, [mode]);
  const update = (key: keyof Weights, value: number) => {
    const next = { ...draftRef.current, [key]: value };
    draftRef.current = next;
    setDraft(next);
  };
  const restore = () => {
    const defaults = DEFAULT_WEIGHTS[mode];
    draftRef.current = defaults;
    setDraft(defaults);
    onSettle(mode, defaults);
  };
  const custom = !sameWeights(weights, DEFAULT_WEIGHTS[mode]);
  const invalid = !validWeights(draft, mode);
  const sum = draft.sound + draft.edge + draft.frequency;
  const share = (v: number) => (sum ? Math.round((100 * v) / sum) : 0);
  const sliders: {
    key: keyof Weights;
    label: string;
    symbol: string;
    note: string;
  }[] = [
    {
      key: "sound",
      label: "Whole-name sound importance",
      symbol: "P",
      note: "Phoneme edit distance. Our choice; not taken from the cited studies.",
    },
    {
      key: "edge",
      label: "First and last sounds importance",
      symbol: "E",
      note: "Shared first or last sound, as coded in the sibling and misnaming studies.",
    },
  ];
  if (mode === "frequency")
    sliders.push({
      key: "frequency",
      label: "Name frequency importance",
      symbol: "F",
      note: "Log-scaled U.S. birth counts. Population frequency, not the people you know.",
    });
  return (
    <details className="tuning">
      <summary>
        <h3>Tune the formula</h3>
        <span
          className={custom ? "tuning-status custom" : "tuning-status"}
          data-testid="tuning-status"
        >
          {custom ? "Custom weights" : "Default weights"}
        </span>
      </summary>
      <div className="tuning-body" ref={panel}>
        <p className="tuning-intro">
          These weights are our guesses, not values measured from real mix-ups.
          In Deffler and colleagues’ misnaming studies, shared beginnings and
          endings predicted substitutions at least as well as whole-name sound
          overlap. Try shifting weight and see what moves. Settings stay in this
          browser. <a href="#tuning">Why these defaults?</a>
        </p>
        <div className="tuning-formulas" aria-live="polite">
          <code data-testid="tuning-formula">{formula(draft, mode)}</code>
          <code data-testid="tuning-edge-formula">{edgeFormula(draft)}</code>
        </div>
        <div className="tuning-sliders">
          {sliders.map((s) => (
            <div className="tuning-row" key={s.key}>
              <label htmlFor={`weight-${s.key}`}>
                <span>
                  {s.label.replace(" importance", "")} <i>{s.symbol}</i>
                </span>
                <output htmlFor={`weight-${s.key}`}>
                  {draft[s.key]} · {share(draft[s.key])}%
                </output>
              </label>
              <input
                id={`weight-${s.key}`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={draft[s.key]}
                aria-label={s.label}
                aria-valuetext={`${draft[s.key]}, ${share(draft[s.key])} percent of the score`}
                onChange={(e) => update(s.key, Number(e.target.value))}
              />
              <small>{s.note}</small>
            </div>
          ))}
          <div className="tuning-row">
            <label htmlFor="weight-last">
              <span>First ↔ last sound balance</span>
              <output htmlFor="weight-last">
                {100 - draft.last}% first · {draft.last}% last
              </output>
            </label>
            <input
              id="weight-last"
              type="range"
              min={0}
              max={100}
              step={5}
              value={draft.last}
              aria-label="Last sound share"
              aria-valuetext={`${100 - draft.last} percent first sound, ${draft.last} percent last sound`}
              onChange={(e) => update("last", Number(e.target.value))}
            />
            <small>
              Griffin and Wangerman’s first- and last-sound effects were nearly
              equal in size.
            </small>
          </div>
        </div>
        {invalid && (
          <p className="tuning-error" role="status" data-testid="tuning-error">
            Give at least one ingredient some weight. Results show the last
            valid weights.
          </p>
        )}
        <button type="button" className="tuning-reset" onClick={restore}>
          Restore defaults
        </button>
      </div>
    </details>
  );
}
