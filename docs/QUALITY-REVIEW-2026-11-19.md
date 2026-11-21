# The Blackout security, assets and accessibility review

November 19, 2026. Scope: the standalone Blackout project, its local development
server and its generated production build. TNT, Planksgiving, Mindbody's systems
and the public Inferno site were not security-tested or changed.

## Results and changes

- The live npm advisory audit reported **zero known vulnerabilities**. No
  dependencies were added or upgraded. Node 24 and the lockfile were retained.
- Sixteen first-party source/build text files were checked for known credential,
  private-key, credentialed-URL and private-path patterns, with no matches. Runtime
  code has no unsafe HTML/evaluation sinks or persistent browser storage. This
  pattern scan cannot prove the absence of every possible secret or vulnerability.
- A development-only hardening issue was fixed: a private `?import` request could
  return a URL-export module, and Vite's usual 403 responses included filesystem
  paths. The controlled canary's **contents were not exposed**. An early middleware
  guard now applies Vite's resolved filesystem policy before transforms and returns
  generic 403/400 text responses without local paths. Twelve live private-path
  probes pass, including raw/import/URL variants, original uploads and parent paths.
- Untrusted Origin requests receive no CORS allowance; an explicit untrusted Host
  receives 403. Production preview headers match the restricted CSP, frame policy,
  `nosniff`, referrer and payment-permission policies. Inline/evaluated JavaScript
  remain blocked. The Mindbody sign-in/payment permissions were not changed.
- All 18 production files were fetched and compared with their built bytes. AVIF
  MIME types are correct, no development client is included, and sampled private
  production paths reveal only the public HTML fallback, never the source files.
- The logo now links to **https://infernopilates.com/**. Burn/Love/Transform is
  exposed as text to assistive technology; only the decorative stars are hidden.

## Asset and loading optimization

The photographs now use responsive AVIF sources with the existing WebP fallbacks,
using the browser's [picture element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture).
Only the supported selected format is requested for each photograph. Original
images and the crop were preserved; uploads remain outside the public build.

| Photo variant     | WebP bytes | AVIF bytes | Reduction |
| ----------------- | ---------: | ---------: | --------: |
| Instructor 560px  |     30,734 |     18,122 |       41% |
| Instructor 1024px |     72,346 |     46,773 |       35% |
| Studio 480px      |     36,418 |     22,803 |       37% |
| Studio 940px      |     81,224 |     54,946 |       32% |

All ten public image files have explicit dimensions and no EXIF/XMP metadata.
The existing compact WebP logo/copyright and local WOFF2 font remain. The opening
background retains high fetch priority; the lower photo and copyright load lazily.
The initial browser document has **zero third-party scripts and zero iframes**.
Mindbody loads on a checkout action and reuses one script and frame.

Production JavaScript is **2.92 KiB gzip** and CSS is **4.67 KiB gzip**. The entire
build is 459.59 KiB, including both image formats; browsers do not download every
variant. Runtime checkout code is unchanged. These byte budgets are measured;
field Core Web Vitals, throttled-network timings and Lighthouse scores were not
measured. The available browser inspection did not expose navigation timing APIs.

## Accessibility and responsive checks

- Production layouts were checked at widths 320, 375, 768, 1024, 1440 and 1920px,
  plus 568×320 landscape. Offer, hero, FAQ and footer sections have no horizontal
  overflow. Descriptions and both buttons align exactly within every two- or
  four-card row. No sampled visible control was below 24×24 CSS pixels; primary
  actions retain their 44px-or-larger targets.
- Language, image alternatives, unique IDs, control names and ARIA references were
  inspected: no duplicate IDs, broken references or unnamed controls were found.
- Keyboard testing confirmed the visible skip link, focus order, modal autofocus,
  no background-control focus while the modal was open, Escape dismissal and focus
  restoration. FAQ uses native details/summary semantics. Reduced-motion and
  reduced-transparency styles were reviewed in source.
- Solid-color text pairs were checked: body 17.27:1, muted copy 8.37:1, card copy
  against its solid fallback 8.95:1, muted FAQ heading 4.88:1 and FAQ accent text
  4.81:1. This does not certify every photograph pixel or third-party checkout view.
- The 320px reflow check covers the CSS-width target described by
  [WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). A separate
  native Chrome zoom check was interrupted when Computer Use could not confidently
  verify the active browser URL. No further browser actions were taken after that
  safety stop. This is not a formal screen-reader or WCAG conformance certification.

## Validation, handoff and rollback

Formatting, strict TypeScript, **47 behavioral/security tests**, production build
and artifact budgets pass. Two regression tests cover transformed private paths
and malformed request URLs. Audit data and controlled canaries are retained under
the ignored, HTTP-blocked `.local/` directory; matched secret values are never logged.
Earlier edited application files are in `.local/audit-2026-11-19-before/`.

No public deployment or payment was made. The development server remains on 5175;
the temporary 4175 production preview is stopped after the audit. Before launch,
apply the production headers on the actual HTTPS host, enable compression, use
immutable caching for hashed JS/CSS and revalidation/versioning for HTML and
non-hashed assets, and recheck real checkout on that domain. Local preview uses
`no-store` deliberately for testing. Preview `noindex`/robots settings remain.
Mindbody still owns payment security, eligibility, limits and offer expiration.
