import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { isFileServingAllowed, normalizePath, resolveConfig } from "vite";
import viteConfig from "../vite.config.ts";
import {
  buildContentSecurityPolicy,
  buildHostingHeaders,
  securityHeaders
} from "../src/security-policy.ts";
import { createPrivateFileGuard } from "./private-file-guard.ts";
const directives = (development) =>
  new Map(
    buildContentSecurityPolicy(development)
      .split("; ")
      .map((directive) => {
        const [name, ...values] = directive.split(" ");
        return [name, values];
      })
  );

function requestFixture(guard, url) {
  const response = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = body;
    }
  };
  let forwarded = false;
  guard({ url }, response, () => {
    forwarded = true;
  });
  return { ...response, forwarded };
}

test("private paths are rejected before import transforms without disclosing local paths", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const config = await resolveConfig(
    { ...viteConfig, root, configFile: false, logLevel: "silent" },
    "serve"
  );
  const guard = createPrivateFileGuard(config);
  for (const path of [
    "/.local/canary.txt",
    "/.netlify/state.json",
    "/%2elocal/canary.txt",
    "/.git/config",
    "/.env.local",
    "/README.md",
    "/scripts/private-file-guard.ts",
    "/docs/QUALITY-REVIEW.md",
    `/@fs/${normalizePath(resolve(root, ".local/canary.txt"))}`,
    `/@fs/${normalizePath(resolve(root, "../AGENTS.md"))}`
  ]) {
    for (const suffix of ["", "?import", "?raw", "?url"]) {
      const response = requestFixture(guard, path + suffix);
      assert.equal(response.statusCode, 403, path + suffix);
      assert.equal(response.forwarded, false);
      assert.equal(response.body, "Forbidden");
      assert.equal(response.headers["X-Content-Type-Options"], "nosniff");
      assert.equal(response.headers["Cache-Control"], "no-store");
    }
  }
  for (const path of [
    "/",
    "/src/main.ts?t=123",
    "/@vite/client",
    "/images/offer-studio-940.avif"
  ]) {
    assert.equal(requestFixture(guard, path).forwarded, true, path);
  }
});

test("malformed request paths receive a generic error instead of reaching transforms", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const config = await resolveConfig(
    { ...viteConfig, root, configFile: false, logLevel: "silent" },
    "serve"
  );
  for (const path of ["/%E0%A4", "/%00", "/src/%00/main.ts"]) {
    const response = requestFixture(createPrivateFileGuard(config), path);
    assert.equal(response.statusCode, 400);
    assert.equal(response.forwarded, false);
    assert.equal(response.body, "Bad request");
  }
});

test("the development server excludes private files and the parent workspace", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const config = await resolveConfig(
    { ...viteConfig, root, configFile: false, logLevel: "silent" },
    "serve"
  );
  const permitted = (path) =>
    isFileServingAllowed(config, `/@fs/${normalizePath(resolve(root, path))}`);
  assert.equal(config.server.host, "127.0.0.1");
  assert.equal(config.server.strictPort, true);
  assert.notEqual(config.server.allowedHosts, true);
  assert.equal(config.server.cors.origin.test("https://untrusted.example"), false);
  for (const path of [
    "index.html",
    "src/main.ts",
    "src/styles.css",
    "public/images/offer-studio-940.webp"
  ])
    assert.equal(permitted(path), true, path);
  for (const path of [
    ".env",
    ".env.local",
    ".git/config",
    ".local/node24.txt",
    ".netlify/state.json",
    ".local/loading-ui-preview.html",
    ".aws/credentials",
    "design-assets/original.png",
    "scripts/start-local.ps1",
    "docs/QUALITY-REVIEW.md",
    "README.md",
    "AGENTS.md",
    "vite.config.ts",
    "package-lock.json",
    "../AGENTS.md"
  ])
    assert.equal(permitted(path), false, path);
});

test("the pricing frame is confined to Mindbody and scripts remain restricted", () => {
  const policy = directives(false);
  assert.deepEqual(policy.get("frame-src"), ["https://go.mindbodyonline.com"]);
  assert.ok(
    policy
      .get("script-src")
      .includes("https://brandedweb.mindbodyonline.com/embed/widget.js")
  );
  assert.ok(!policy.get("script-src").includes("'unsafe-inline'"));
  assert.ok(!policy.get("script-src").includes("'unsafe-eval'"));
  assert.ok(!buildContentSecurityPolicy(false).includes("*"));
  assert.deepEqual(policy.get("object-src"), ["'none'"]);
  assert.deepEqual(policy.get("frame-ancestors"), ["'none'"]);
});

test("only development permits the loopback reload socket", () => {
  assert.ok(directives(true).get("connect-src").includes("ws://127.0.0.1:5175"));
  assert.ok(!buildContentSecurityPolicy(false).includes("ws:"));
  assert.ok(!buildContentSecurityPolicy(false).includes("localhost"));
  assert.ok(directives(false).get("style-src").includes("'unsafe-inline'"));
});

test("payment permission is limited to this page and Mindbody", () => {
  assert.equal(
    securityHeaders["Permissions-Policy"],
    'camera=(), microphone=(), geolocation=(), payment=(self "https://go.mindbodyonline.com")'
  );
  assert.equal(securityHeaders["X-Content-Type-Options"], "nosniff");
  assert.equal(securityHeaders["X-Frame-Options"], "DENY");
});

test("Netlify headers preserve production security and cache only hashed assets immutably", () => {
  const [general, root, html, assets] = buildHostingHeaders().trimEnd().split("\n\n");
  assert.ok(general.startsWith("/*\n"));
  for (const [name, value] of Object.entries(securityHeaders)) {
    if (name === "Cache-Control") continue;
    assert.ok(general.includes(`  ${name}: ${value}\n`));
  }
  assert.ok(
    general.includes(`  Content-Security-Policy: ${buildContentSecurityPolicy(false)}`)
  );
  assert.ok(!general.includes("Cache-Control"));
  assert.ok(!general.includes("ws://"));
  assert.ok(!general.includes("immutable"));
  assert.equal(root, "/\n  Cache-Control: public, max-age=0, must-revalidate");
  assert.equal(
    html,
    "/index.html\n  Cache-Control: public, max-age=0, must-revalidate"
  );
  assert.equal(
    assets,
    "/assets/*\n  Cache-Control: public, max-age=31536000, immutable"
  );
});
