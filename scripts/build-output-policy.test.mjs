import assert from "node:assert/strict";
import test from "node:test";
import { isPublishableAsset } from "./build-output-policy.mjs";

test("the public output permits only compiled page assets, images, fonts and licenses", () => {
  for (const path of [
    "index.html",
    "robots.txt",
    "favicon.svg",
    "_headers",
    "assets/index-AB12.js",
    "assets/index-AB12.css",
    "images/hero-1024.webp",
    "fonts/barlow-700.woff2",
    "fonts/BARLOW-LICENSE.txt",
    "images/BOOTSTRAP-ICONS-LICENSE.txt"
  ])
    assert.equal(isPublishableAsset(path), true, path);
});

test("private exports, credentials, maps and source files cannot enter the public build", () => {
  for (const path of [
    ".env",
    ".env.local",
    ".local/runtime.json",
    ".netlify/state.json",
    "customer-export.csv",
    "images/customer-export.json",
    "fonts/private-key.pem",
    "assets/index.js.map",
    "assets/.env.js",
    "design-assets/original.png",
    "src/main.ts",
    "scripts/check-build.mjs",
    "package-lock.json",
    "README.md",
    "images/../secret.png",
    "images\\secret.png"
  ])
    assert.equal(isPublishableAsset(path), false, path);
});
