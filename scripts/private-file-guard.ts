import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import { isFileServingAllowed, normalizePath, type ResolvedConfig } from "vite";

// Run before Vite's URL/import transforms, using the same resolved filesystem
// policy. Denied responses must not disclose paths or resolve private modules.
export function createPrivateFileGuard(config: ResolvedConfig) {
  return (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    let status: number | undefined;
    try {
      const pathname = decodeURIComponent(
        new URL(request.url ?? "/", "http://127.0.0.1").pathname
      );
      if (pathname.includes("\0")) status = 400;
      else {
        const file = pathname.startsWith("/@fs/")
          ? resolve(pathname.slice("/@fs/".length))
          : resolve(config.root, `.${pathname}`);
        if (!isFileServingAllowed(config, `/@fs/${normalizePath(file)}`)) status = 403;
      }
    } catch {
      status = 400;
    }
    if (!status) return next();
    response.statusCode = status;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "no-store");
    response.end(status === 403 ? "Forbidden" : "Bad request");
  };
}
