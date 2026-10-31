import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const cmu = readFileSync("work/source-data/cmudict.dict", "utf8");
const ssa = readFileSync("work/source-data/ssa-alldata.txt", "utf8");
const pronunciations = new Map();
for (const line of cmu.split("\n")) {
  const [word, ...rest] = line.trim().split(/\s+/);
  if (!word || word.startsWith(";;;")) continue;
  const name = word.replace(/\(\d+\)$/, "");
  const phones = rest.join(" ").split(" #")[0].split(" ").filter(Boolean);
  if (!phones.length) continue;
  const variants = pronunciations.get(name) || [];
  if (!variants.some((v) => v.join(" ") === phones.join(" ")))
    variants.push(phones);
  pronunciations.set(name, variants);
}
const counts = new Map();
let endYear = 0;
for (const line of ssa.trim().split("\n")) {
  const [name, , count, year] = line.split(",");
  endYear = Math.max(endYear, Number(year));
  if (Number(year) >= 1950 && Number(year) <= 2020)
    counts.set(name, (counts.get(name) || 0) + Number(count));
}
const names = [...counts]
  .filter(
    ([name, count]) => count >= 500 && pronunciations.has(name.toLowerCase()),
  )
  .map(([name, count]) => ({
    name,
    count,
    pronunciations: pronunciations.get(name.toLowerCase()),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));
if (
  !names.some((n) => n.name === "Julian") ||
  !names.some((n) => n.name === "Jillian") ||
  names.length < 1000
)
  throw Error("Incomplete source data");
writeFileSync("engine/names.json", JSON.stringify(names));
writeFileSync(
  "data/provenance.json",
  JSON.stringify(
    {
      generated: "2026-10-31",
      years: [1950, 2020],
      sourceLatestYear: endYear,
      minimumPooledCount: 500,
      names: names.length,
      method:
        "Pool recorded sex categories; intersect exact lower-case spelling with CMUdict. Preserve dictionary variant order. No alias count pooling.",
      sources: [
        {
          url: "https://raw.githubusercontent.com/hackerb9/ssa-baby-names/main/alldata.txt",
          upstream: "https://www.ssa.gov/oact/babynames/limits.html",
          sha256: createHash("sha256").update(ssa).digest("hex"),
        },
        {
          url: "https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict",
          sha256: createHash("sha256").update(cmu).digest("hex"),
        },
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log(`Bundled ${names.length} names, 1950–2020.`);
