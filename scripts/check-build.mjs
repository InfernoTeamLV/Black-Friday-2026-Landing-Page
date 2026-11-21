import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { isPublishableAsset } from "./build-output-policy.mjs";

const output = new URL("../dist/", import.meta.url);
const files = (await readdir(output, { recursive: true })).map((file) =>
  file.replaceAll("\\", "/")
);
assert(files.includes("index.html"), "The static entry page is missing.");
assert(
  !files.some((file) => /(?:^|[\\/])\.|\.map$/.test(file)),
  "Build output must not include hidden files or source maps."
);

const html = await readFile(new URL("index.html", output), "utf8");
for (const match of html.matchAll(
  /(?:src|href)="(\/(?:assets|images|fonts)\/[^"\s]+)"/g
)) {
  assert(files.includes(match[1].slice(1)), `Missing built asset: ${match[1]}`);
}
for (const match of html.matchAll(/\/images\/[^"\s,]+\.(?:webp|avif)/g)) {
  assert(files.includes(match[0].slice(1)), `Missing responsive image: ${match[0]}`);
}

const sizes = { js: 0, css: 0, images: 0, total: 0 };
for (const file of files) {
  const asset = new URL(file.replaceAll("\\", "/"), output);
  if (!(await stat(asset)).isFile()) continue;
  assert(isPublishableAsset(file), `Unapproved file in public build: ${file}`);
  const bytes = await readFile(asset);
  sizes.total += bytes.length;
  if (file.endsWith(".js")) sizes.js += gzipSync(bytes).length;
  if (file.endsWith(".css")) sizes.css += gzipSync(bytes).length;
  if (/\.(?:webp|avif|png|jpe?g)$/.test(file)) {
    sizes.images += bytes.length;
    assert(bytes.length <= 220 * 1024, `Image exceeds the 220 KiB budget: ${file}`);
  }
}

assert(sizes.js <= 50 * 1024, "JavaScript exceeds the 50 KiB gzip budget.");
assert(sizes.css <= 20 * 1024, "CSS exceeds the 20 KiB gzip budget.");
assert(sizes.total <= 500 * 1024, "Static build exceeds the 500 KiB budget.");
console.log(
  JSON.stringify({
    javascriptGzipKiB: +(sizes.js / 1024).toFixed(2),
    cssGzipKiB: +(sizes.css / 1024).toFixed(2),
    imagesKiB: +(sizes.images / 1024).toFixed(2),
    staticBuildKiB: +(sizes.total / 1024).toFixed(2)
  })
);
