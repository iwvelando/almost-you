import { readFileSync, writeFileSync } from "node:fs";
const sections = [
  ["Almost You — MIT", "LICENSE"],
  ["Go runtime — BSD", "public/GO-LICENSE"],
  ["CMU Pronouncing Dictionary — BSD", "data/CMUDICT-LICENSE.txt"],
  ...[
    "react",
    "react-dom",
    "scheduler",
    "@fontsource-variable/dm-sans",
    "@fontsource-variable/fraunces",
  ].map((n) => [n, `node_modules/${n}/LICENSE`]),
];
writeFileSync(
  "public/THIRD-PARTY-NOTICES.txt",
  sections
    .map(
      ([name, path]) =>
        `${name}\n${"=".repeat(60)}\n${readFileSync(path, "utf8")}`,
    )
    .join("\n\n") +
    "\n\nSSA name counts: U.S. federal government public data, retrieved through hackerb9/ssa-baby-names. See data/provenance.json in the source for dates, source URLs and checksums.\n",
);
