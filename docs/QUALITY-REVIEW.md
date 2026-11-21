# The Blackout quality review — November 18, 2026

Scope: the standalone `black-friday/` project and its generated `dist/` output.
The TNT and Planksgiving apps were not changed. This is a local review, not a
production deployment or a certification of Mindbody's systems.

## Changes made

- Restricted Vite's filesystem access to this project and blocked `.local/`,
  original design uploads, scripts, documentation, Git and credential files.
  Sampled diagnostics, a QA page, the README and an original photo previously
  returned HTTP 200 from the loopback development server. Protected paths now
  return 403, including a raw-query request and a parent-app path.
- Added a build allowlist so accidental exports, credentials, source files and
  maps cannot be published as unexpected static files. Regression tests exercise
  allowed assets and rejected private-file paths.
- Increased reading text to 16px and action labels to at least 14px at the default
  browser font size. Preserved the established headings, images and glass cards.
  The phone navigation still fits at 320px, and primary touch controls are at least
  44px tall. Forms use 16px input text, and native FAQ disclosures support keyboards.
- Fixed focus recovery when retry starts and when a delayed frame replaces a
  focused retry control. Removed unused purchase-state styles.

## Verification

- `npm run check`: formatting, strict TypeScript, 47 behavioral/security tests,
  production build and output budgets pass.
- `npm run security:check`: the live npm audit reports zero known vulnerabilities.
  No dependencies were added or upgraded.
- A targeted credential-pattern scan of first-party text files and built output
  found no key/token matches, credentialed URLs, exposed environment files or
  private filesystem paths in the build. Matched values are never printed.
  Public WebP images contain no EXIF or XMP metadata chunks.
- Live local HTTP probes confirm private files return 403 while the page and
  application module remain accessible. CSP, `nosniff`, frame denial and
  `no-referrer` headers are present. An untrusted Origin receives no CORS allowance.
- The built production preview has the restricted headers, no development client
  or WebSocket exception, and renders Mindbody pricing without browser errors.
  A request for a private path returns only the public index fallback, not the file.
- Browser checks at 320, 375, 768, 1440 and 1920px found no horizontal page overflow.
  At 320px, the Mindbody frame fits its modal without horizontal overflow. At
  568 × 320px, the checkout close control stays visible in its sticky header.
  FAQ Enter/Space toggling and the coaching prerequisite UI were checked.
- Initial render contains no Mindbody script or iframe. Moving from annual pricing
  to coaching reuses one script and one frame. The page does not collect card data
  or treat a click, script load, frame message or redirect as a completed purchase.
- First-party output is about 325 KiB across all assets, with about 3.5 KiB gzipped
  JavaScript and 4.7 KiB gzipped CSS. Images use responsive WebP sources with
  explicit dimensions; the lower photograph loads lazily. These sizes exclude
  Mindbody's on-demand code. Field Core Web Vitals were not measured.

## Remaining boundaries

The credential scan checks known patterns; it cannot prove that every possible
secret or security flaw is absent. Mindbody's remote loader and checkout app are
vendor-managed. The existing production inline-style allowance is required by
that loader; inline and evaluated JavaScript stay blocked. Parent/frame messages
are checked against the expected origin, frame window and frame ID.

The eventual host must apply the security headers in `src/security-policy.ts` and
serve the built output over HTTPS. Account permissions, actual membership
eligibility, purchase limits, expiration settings and a complete payment flow
must be checked in Mindbody before launch. No account, contract, cart or payment
was submitted during this review. Sale dates remain informational; the user
controls actual sale availability.

Vite's file-access behavior follows its
[official server configuration](https://vite.dev/config/server-options#server-fs-deny).
The npm audit's scope follows the
[official npm documentation](https://docs.npmjs.com/cli/npm-audit/).

No public deployment was made. Previous versions of edited files are retained in
the ignored `.local/quality-review-before/` directory for local comparison and
rollback. The development server remains on port 5175; the temporary production
preview is stopped after verification.
