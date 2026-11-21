// The maintained Mindbody loader injects CSS and a cross-origin pricing iframe.
// Keep inline/evaluated JavaScript blocked and permit only its specific origins.
export function buildContentSecurityPolicy(development: boolean): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src https://go.mindbodyonline.com",
    "form-action 'self'",
    "script-src 'self' https://brandedweb.mindbodyonline.com/embed/widget.js https://go.mindbodyonline.com/embed/widget.js https://www.googletagmanager.com/gtag/js https://www.googletagmanager.com/gtm.js",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://go.mindbodyonline.com",
    "font-src 'self'",
    `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com${development ? " ws://127.0.0.1:5175" : ""}`
  ].join("; ");
}

export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy":
    'camera=(), microphone=(), geolocation=(), payment=(self "https://go.mindbodyonline.com")',
  "Cache-Control": "no-store"
};
