import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
await import("../public/wasm_exec.js");
const go = new globalThis.Go();
const { instance } = await WebAssembly.instantiate(
  readFileSync("public/engine.wasm"),
  go.importObject,
);
void go.run(instance);
assert.equal(typeof globalThis.almostYou, "function");
const result = JSON.parse(
  globalThis.almostYou(
    JSON.stringify({
      action: "rank",
      name: "Julian",
      n: 5,
      mode: "sound",
      compare: "Jillian",
    }),
  ),
);
assert.equal(result.target.name, "Julian");
assert.equal(result.results.length, 5);
assert.ok(result.comparison.rank > 0);
const edgeOnly = JSON.parse(
  globalThis.almostYou(
    JSON.stringify({
      action: "rank",
      name: "Julian",
      n: 5,
      mode: "sound",
      compare: "Jillian",
      weights: { sound: 0, edge: 100, frequency: 0, last: 50 },
    }),
  ),
);
assert.equal(edgeOnly.custom, true);
assert.equal(edgeOnly.weights.edge, 1);
assert.equal(edgeOnly.comparison.score, 1);
assert.notEqual(edgeOnly.comparison.score, result.comparison.score);
assert.ok(JSON.parse(globalThis.almostYou("{")).error);
console.log(
  "WASM bridge: valid request, custom weights and malformed input passed.",
);
process.exit(0);
