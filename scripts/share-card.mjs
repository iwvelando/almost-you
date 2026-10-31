import { preview } from "vite";
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const server = await preview({
  preview: {
    host: "127.0.0.1",
    port: 4191,
    strictPort: true,
    headers: { "Content-Security-Policy": "" },
  },
});
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto("http://127.0.0.1:4191/");
  await page.evaluate(() => document.fonts.ready);
  const html = readFileSync("index.html", "utf8");
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const description = html.match(/name="description"\s+content="(.*?)"/)[1];
  await page.evaluate(
    ({ title, description }) => {
      document.documentElement.dataset.theme = "dark";
      document.body.innerHTML = `<div class="share"><div class="share-copy"><div class="share-brand">almost you.</div><h1>The names you<br/><em>almost</em> answer to.</h1><p>${description}</p><small>almost-you.isaacvelando.com</small></div><div class="share-badge"><div>hello<small>my name is</small></div><strong>still me.</strong><span>Close. But not quite.</span></div></div>`;
      document.title = title;
      const style = document.createElement("style");
      style.textContent = `body{margin:0;background:#171f31;color:#e5ecf6}.share{width:1200px;height:630px;padding:62px 70px;display:flex;align-items:center;gap:60px;background:radial-gradient(ellipse at 85% 80%,#293a63,transparent 60%)}.share-copy{width:610px}.share-brand{font-size:25px;font-weight:600;letter-spacing:-1px;margin-bottom:55px}.share h1{font-size:66px;line-height:1.08;letter-spacing:-3px}.share h1 em{color:#a5b7ff}.share p{font-size:18px;line-height:1.6;color:#abb9cf;max-width:550px;margin:24px 0}.share small{font-size:13px;color:#abb9cf}.share-badge{width:330px;flex-shrink:0;border:7px solid #3b54c4;background:#3b54c4;border-radius:20px;text-align:center;transform:rotate(7deg);box-shadow:12px 18px #0003}.share-badge>div{font-size:56px;font-weight:700;line-height:1;color:white;padding:18px}.share-badge small{display:block;font-size:17px;font-weight:400;margin-top:7px;color:white}.share-badge strong{display:block;padding:40px 8px;font-family:'Fraunces Variable',serif;font-weight:450;background:#fffefd;color:#23324d;font-size:48px;letter-spacing:-2px}.share-badge>span{display:block;padding:18px;font-size:13px;color:white}`;
      document.head.append(style);
    },
    { title, description },
  );
  await page.screenshot({ path: "public/og.png" });
  await page.setViewportSize({ width: 180, height: 180 });
  await page.goto("http://127.0.0.1:4191/logo.svg");
  await page.screenshot({ path: "public/apple-touch-icon.png" });
  console.log("Rendered 1200×630 share card and 180×180 touch icon.");
} finally {
  await browser?.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
