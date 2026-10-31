import { existsSync, readFileSync, statSync } from "node:fs";
for (const file of [
  "index.html",
  "engine.wasm",
  "wasm_exec.js",
  "worker.js",
  "logo.svg",
  "og.png",
  "apple-touch-icon.png",
  "robots.txt",
  "sitemap.xml",
  "404.html",
  "GO-LICENSE",
  "THIRD-PARTY-NOTICES.txt",
])
  if (!existsSync(`dist/${file}`) || !statSync(`dist/${file}`).size)
    throw Error(`Missing distribution artifact: ${file}`);
const html = readFileSync("dist/index.html", "utf8");
if (
  !html.includes(
    "<title>Almost You — The names you almost answer to</title>",
  ) ||
  !html.includes("https://almost-you.isaacvelando.com/og.png")
)
  throw Error("Missing metadata");
if (
  !readFileSync("dist/robots.txt", "utf8").includes(
    "Sitemap: https://almost-you.isaacvelando.com/sitemap.xml",
  )
)
  throw Error("Missing sitemap declaration");
console.log("Static distribution complete.");
