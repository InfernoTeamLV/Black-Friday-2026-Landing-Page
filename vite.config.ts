import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

import { buildContentSecurityPolicy, securityHeaders } from "./src/security-policy.ts";
import { createPrivateFileGuard } from "./scripts/private-file-guard.ts";

export default defineConfig({
  plugins: [
    {
      name: "private-file-guard",
      configureServer(server) {
        server.middlewares.use(createPrivateFileGuard(server.config));
      }
    }
  ],
  build: { sourcemap: false },
  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: true,
    fs: {
      strict: true,
      allow: [fileURLToPath(new URL(".", import.meta.url))],
      deny: [
        "**/.env",
        "**/.env.*",
        "**/*.{crt,pem,key}",
        "**/.git/**",
        "**/.local/**",
        "**/.codex/**",
        "**/.agents/**",
        "**/.aws/**",
        "**/design-assets/**",
        "**/scripts/**",
        "**/docs/**",
        "**/AGENTS.md",
        "**/README.md",
        "**/vite.config.*",
        "**/package*.json"
      ]
    },
    headers: {
      ...securityHeaders,
      "Content-Security-Policy": buildContentSecurityPolicy(true)
    }
  },
  preview: {
    host: "127.0.0.1",
    port: 4175,
    strictPort: true,
    headers: {
      ...securityHeaders,
      "Content-Security-Policy": buildContentSecurityPolicy(false)
    }
  }
});
