# Inferno The Blackout — local testing

Standalone HTML/CSS/TypeScript project built with Vite. The current design uses a
dark monochrome palette and editorial typography. The service cards open the page,
with the logo and navigation above them over the original studio photograph. The
Burn / Love / Transform strip separates the offers from the cinematic split-screen
hero below. The hero's copy and photo stack on small screens. The four
offers are Annual Membership for current members, Annual Membership for new
members, TNT Coaching and Fire Pass. The Fire Pass includes 20 classes.
Campaign timing and the five FAQ answers have been supplied by the user; remaining
full terms are still to be confirmed. Offer pricing
comes from the connected Mindbody widgets.
The page itself collects no card data or personal information. Its fonts and
imagery are local; Mindbody loads its checkout resources after a purchase click.

The Black Friday campaign's official name is **The Blackout**. Use this name in
the opening service-section title, page metadata and campaign copy. The opening
title pairs a small, spaced THE with a larger, bright condensed BLACKOUT on one
baseline, wrapping naturally if needed. GOOD THINGS. WORTH THE
WAIT. now appears in the lower split-screen section, preserving the condensed /
italic-serif font pairing with responsive sizing for the longer words.

The header uses the supplied monochrome Inferno seal, preserved as a transparent
lossless WebP in `public/images/inferno-logo-monochrome.webp`. Its original
transparency lets the studio image show through the artwork. Its source is retained
in `design-assets/inferno-logo-monochrome-original.png`, outside the public build.
CSS renders the artwork in white with a subtle dark shadow for contrast over the
photo, preserving the transparent cutouts and background.
The strip between the offers and hero reads BURN / LOVE / TRANSFORM on desktop and mobile.

The footer uses the supplied copyright artwork, retained unchanged as a lossless
WebP with its original PNG in `design-assets/inferno-copyright-original.png`.
CSS displays it in white against the dark footer without a white backplate.
Facebook, Instagram and TikTok icons are inline SVGs from
[Bootstrap Icons](https://icons.getbootstrap.com/), with their MIT license in
`public/images/BOOTSTRAP-ICONS-LICENSE.txt`. They link to the studio's supplied
profiles in new tabs, with descriptive accessible labels and `noopener noreferrer`.
The existing Back to top anchor remains functional. Hover colors use muted burnt
orange (`#c76349`), with a light warm tint on the main button and an 8% tint on the
outlined navigation button. Transitions take 220ms, with visible keyboard focus
and the existing reduced-motion override. Pointer hover styles are limited to
devices that support hover.

The strip, hero and FAQ slide over the pinned opening offers using native CSS sticky
positioning. A ResizeObserver measures the opening section only when its dimensions
or the viewport change, so the full mobile card list can be read before it pins.
There are no scroll animation listeners or added libraries. Reduced-motion
visitors get a normal scrolling page. Without JavaScript/ResizeObserver, the offers
also stay in normal document flow. Keyboard focus on a covered opening control
reveals that control again, including cards further down a long mobile list.
See [CSS positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position)
and [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).

The offer cards retain the studio photograph and dark overlay. Separate current-member
and new-member annual offers lead, with TNT Coaching third and Fire Pass fourth.
Each annual card opens its matching package details and audience-specific Mindbody
pricing; there is no redundant annual status selector.
The labels read Current members and New members, using the card heading’s condensed
font at a smaller size. The descriptions use short,
energetic language drawn from the studio's fire, strength and intensity themes.
Cards in the same two- or four-column row use shared
[CSS subgrid tracks](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid)
to align the descriptions and both button rows. Each row sizes itself to its
longest content, including member labels and wrapped button text. Single-column
phones keep the compact natural-height layout; older browsers retain the flex
layout fallback. There are no fixed card heights or JavaScript measurements.
The two global sale CTAs and all service purchase buttons use the supplied
Mindbody Pricing widgets. Card selection does not verify membership or payment
completion; see the mapping below.

Coaching requires an annual membership. Add coaching opens its supplied Mindbody
pricing widget directly, without a membership-status popup. The requirement stays
visible on the card, in Package details and in the FAQ. Mindbody must verify annual membership eligibility and enforce
purchase limits and remaining capacity. The Fire Pass purchase-limit line is
removed from the card, with the two-pass limit retained in Package details.
Gift Cards are no longer part of the promoted offers.
The four cards display the “Limited quantity” label from the user's visual
reference in an angled tab at the top-right corner. TNT Coaching presents its
Annual Membership requirement below the description in a compact label.
These use the existing muted accent and charcoal
palette; they do not display invented inventory counts. Mindbody controls actual
availability. Shared card rows keep descriptions and buttons aligned when the
requirement label wraps.

Every Package details button opens a native modal with the package information.
Both annual detail windows include the six annual benefits supplied in the user's
reference; coaching includes its five coaching benefits and a muted red annual
membership requirement. These are accessible HTML lists with inline decorative
icons, rather than screenshots. The longer detail windows open at the beginning,
use a sticky title and close control, and retain their audience-specific facts.
Annual and coaching benefits use outlined circular icons joined by a fine vertical
line, with responsive spacing and readable text. The new-member annual card has
a soft translucent red outline around its full edge and a nearly neutral glass tint; the current-member card uses the
same neutral border as the other offers.
Detail popups omit introductory descriptions. Annual membership includes unlimited
IHP and Cyclone classes; coaching lists TNT small-group training for one year and
highlights its annual membership requirement in the brand's red accent.
Fire Pass details list IHP and Cyclone classes with the option to attend TNT
sessions, the allowance of 20 classes per pass, and the March 31, 2027 expiration.
Coaching's quarterly benefit is
“Quarterly body composition scans,” naming the Evolt 360 in its description;
the terminology follows [EVOLT's official explanation](https://evolt.health/article/how-to-understand-and-explain-body-scan-results).
Purchase and package-information popups show their main heading without a small
campaign or audience label above it. The shared checkout controller does not
require subtitle markup to load any widget route.
TNT Coaching's small-group personal training format and campaign terms were supplied by
the user. Its strength-focused description also draws on
[Inferno's public TNT page](https://infernopilates.com/tnt), which describes
controlled lifting and progressive overload; that page describes the public TNT
class rather than verifying the separate coaching offer's terms.
Escape, close controls and backdrop clicks
dismiss them; native dialog behavior handles focus trapping and restoration.
The background is locked while a modal is open, with a stable scrollbar gutter.
Coaching's membership prerequisite is included in its modal. Remaining payment tools and
full offer terms can be supplied later; do not substitute invented checkout links.
See [HTML dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

The FAQ uses native HTML details/summary controls, with no added JavaScript. Each
question supports keyboard toggling, visible focus and an open/closed indicator.
Answers use the campaign terms supplied by the user: the VIP/renewal waitlist opens
November 10; public pricing opens November 27 at 6 a.m. PST; The Blackout ends on
November 30 at 11:59 p.m. PST. These dates are informational;
the user manages actual sale availability. Returning members
whose membership ended at least six months ago use the new-member annual offer.
TNT Coaching requires an annual membership. All Fire Pass classes must be used by
March 31, 2027, with a limit of two passes per person. These are presentation copy;
Mindbody remains responsible for actual eligibility, pricing and expiration rules.

## Mindbody checkout routing

| CTA                                 | Route key      | Supplied Pricing widget ID |
| ----------------------------------- | -------------- | -------------------------- |
| Blackout Plans (both CTAs)          | sale           | `c5685522c8`               |
| Annual Membership — current members | annual-current | `c5685422c8`               |
| Annual Membership — new members     | annual-new     | `c5685622c8`               |
| TNT Coaching                        | coaching       | `c5685722c8`               |
| Fire Pass                           | fire-pass      | `c5685822c8`               |

The widget IDs above match the supplied snippets, including the separately
confirmed new-member ID. Widget titles, descriptions, pricing and eligibility
rules are managed in Mindbody. Review each widget's content in Branded Web Manager
before launch.

All routes retain the embedded widget flow, including the dark theme and in-site
checkout. The standalone Buy Now link experiment was reverted at the user's
request; it changed the theme and did not preserve the expected checkout flow.
Do not replace widget routes with hosted pricing links to bypass the details step.

`src/mindbody-checkout.ts` centralizes route IDs and popup copy. The page initially
loads no Mindbody script or iframe. The first CTA creates one Pricing iframe through
the official async loader at
`https://brandedweb.mindbodyonline.com/embed/widget.js`. Later route selections
navigate that same iframe to the matching public Pricing view URL generated by
the loader, preserving its campaign query parameters and resizing integration.
This avoids preloading multiple hidden widget apps. The old offer is hidden while
a different widget loads. Unknown route keys do not load a previous offer.

Both Blackout Plans CTAs open the complete sale catalog. Each annual
button opens its audience-specific widget. Fire Pass and Add coaching open their
pricing widgets directly. Mindbody must enforce real eligibility, including
coaching's annual membership requirement and purchases started through the all-sale
catalog. The page never treats a selection, click, script/frame load, redirect or
query parameter as proof of payment or membership.

The shared widget area uses the supplied 60px three-dot CSS loader, recolored light
for the dark background, and a polite status announcement while the requested
frame loads. It serves every Mindbody route. Reduced-motion preferences show all
three dots without animation; errors also stop the animation. The
route-specific Open in Mindbody link sits below the frame area and stays hidden
unless the frame is still unavailable after 10 seconds. A late successful load
hides the link again; retry starts a fresh loading window. Early script failures
show an error and retry immediately, while the external link still waits 10 seconds.
Readiness requires both the native frame load and a positive iframe-resizer sizing
message from the exact Mindbody origin and that iframe's window/ID. This is a
display check only. An [iframe load event alone](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#technical_summary)
also fires for failed documents, so it cannot prove the widget is displayed.
Those fallback links use the active route's official public URL and were verified
in the browser. Ordinary clicks open the popup; modified link clicks
retain normal browser navigation. The sticky close button stays visible while the
widget scrolls. Purchase and package-information windows use their top close
controls. All bottom Back to offers buttons have been removed.
The top Close checkout control remains available throughout the purchase window.
The checkout dialog expands to 80rem on larger screens and fills the available
dynamic viewport height, retaining small outer gutters. Its title banner occupies
the first grid row; the iframe fills the entire remaining width and height without
introductory copy or inner padding. CSS overrides the loader's content-height sizing,
and frame setup resets its inline minimum height so short windows also fit. Sizing
messages remain the trusted readiness signal. The vendor's
legacy `scrolling="no"` attribute is removed on initialization, load and readiness
to restore the browser's default internal scrolling; see the
[iframe scrolling reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#scrolling).
Only after a loading failure or timeout do recovery controls take space below the
frame. Package-information dialogs retain their content-sized layout.
Mindbody's cart-review page responds to the available frame width.
Its preceding product-details popup currently caps itself at 580px inside
the cross-origin frame; the page's CSS cannot change that vendor-owned limit.
Its inner close control remains part of Mindbody's original embedded flow.
Escape closes the native dialog when focus is in the parent page;
keys inside the cross-origin Mindbody frame do not bubble to its parent.
Prices, eligibility, contracts and actual checkout remain managed in Mindbody.

`src/security-policy.ts` defines the development and preview security headers.
It allows the official loader URLs, its Mindbody frame and loading image, and
Google tag/analytics origins used by the supplied vendor loader. The widget
requires injected inline CSS, so inline styles are allowed in production as well
as development. Inline and evaluated JavaScript remain blocked, with no wildcard
origins. Payment permission is delegated only to this site and the Mindbody frame;
camera, microphone and geolocation stay denied. The same policy must be installed
in the eventual production host; Vite preview is not a deployment configuration.

The development server is restricted to this project root. Its file deny list also
blocks local diagnostics, original uploads, helper scripts, documentation, Git and
credential files. The ignored `.local/` QA fixtures cannot be opened over HTTP.
The build rejects unexpected file types and paths copied from `public/`, as well
as source maps and hidden files. Keep `public/` limited to approved page assets;
[Vite serves and copies that directory without filtering](https://vite.dev/config/server-options#server-fs-deny).

The [November 18 quality review](docs/QUALITY-REVIEW.md) records the source, build,
security and responsive checks. Reading copy uses 16px type at the default browser
font size, with at least 14px action labels and 44px primary touch targets. Checkout
retry and late-load recovery move focus away from controls that become hidden.

Manual QA covers all CTA mappings, cross-widget navigation, first-click loading,
reopening without duplicate scripts, direct coaching checkout, closing, narrow screens
and the existing production CSP. After restoring the original widget routes, the
current-member package reached Confirm purchase inside the popup. In normal Chrome,
the widget opened Mindbody's customer sign-in window; the user signed in, and the
flow returned to the embedded cart, then its payment-method screen. The landing-page
URL stayed unchanged. No payment details were entered by the assistant and no
purchase was submitted. Repeat checkout QA on the eventual production domain.
Mindbody's maintained
loader currently reports iframe-resizer deprecation warnings; they do not prevent
rendering. Keep the vendor script remote rather than forking it to suppress warnings.

The cards use dark liquid glass surfaces: translucent fills, a static 16px
backdrop blur, rounded edges and soft inset highlights. The effect stays within
the cards. An opaque fallback preserves legibility without backdrop-filter
support; supported reduced-transparency and increased-contrast preferences also
remove the blur and use opaque panels. Card copy is lightened for contrast.
See [backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter).

The lower Find your fire section uses the supplied square photograph of a cycling
instructor leading a class, encoded as 560px and 1024px AVIF assets with WebP
fallbacks. The original
upload is retained in `design-assets/hero-cycling-instructor-original.png` and was
refreshed from the latest supplied attachment. The header logo links to
`https://infernopilates.com/`. The
previous shoulder-training original remains archived in `design-assets/`.
The photo fills the panel with a centered crop at every breakpoint; the existing
edge and lower vignette preserves contrast for the class list and caption.
Static CSS lighting layers add restrained red accents to both photographs,
inspired by the supplied studio references. The multiply blend keeps the existing
dark vignettes and text separation; the image files, responsive sources and
loading priorities are unchanged. Banner stars are white; the FAQ star retains its accent color.
The offer section keeps the supplied studio-class photograph, with 480px and 940px
AVIF sources with WebP fallbacks and its dark gradient overlay. The opening background loads eagerly
with high fetch priority, while the lower photo loads lazily with low priority.
Letterbox bars were trimmed from the studio background. Original uploads remain
outside the public build in `design-assets/`.
The earlier generated hero concept and its prompt are archived there as well.
The locally bundled Barlow Condensed font includes its OFL license in
`public/fonts/BARLOW-LICENSE.txt`. The hero image has fixed dimensions and
responsive sources; motion respects the visitor's reduced-motion preference.

The initial setup starts development and production-preview servers in the
background. To stop those specific processes safely before starting a foreground
session, run:

```powershell
.\scripts\stop-local.ps1
.\scripts\stop-local.ps1 -Task preview
```

The stop helper verifies that each recorded process still belongs to this
project. Runtime paths, process records and server logs live in ignored `.local/`.

## Start the development server

From this directory, with Node 24 selected:

```powershell
npm ci
npm run dev
```

Open <http://127.0.0.1:5175>. Edits reload automatically. The server listens only
on this computer and fails if its port is already occupied. Press Ctrl+C in its
terminal to stop it.

If the system-default Node version is older, use the isolated Node 24 runtime:

```powershell
$npmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source) 'node_modules\npm\bin\npm-cli.js'
npm.cmd exec --yes --package=node@24 -- node $npmCli ci
.\scripts\start-local.ps1
```

Setup remembers the available Node 24 runtime in the ignored `.local/node24.txt`
file. The helper uses that runtime, a selected system Node 24, or npm's tool cache
without changing the global Node installation. A fresh checkout's first invocation
may need npm registry access. If PowerShell's
execution policy prevents running the helper, use its underlying command directly:

```powershell
$npmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source) 'node_modules\npm\bin\npm-cli.js'
npm.cmd exec --yes --package=node@24 -- node $npmCli run dev
```

## Verify and preview the production build

With Node 24 selected:

```powershell
npm run check
npm run security:check
npm run preview
```

Alternatively invoke each task through the helper, for example:

```powershell
.\scripts\start-local.ps1 -Task check
.\scripts\start-local.ps1 -Task preview
```

The production preview is <http://127.0.0.1:4175>. It serves `dist/` using the
restricted production CSP; the development server permits Vite's local live
reload. `npm run build` performs strict TypeScript checks, builds the static page
and checks gzip budgets and unintended output artifacts. Browser review covers
responsive cards, direct coaching checkout, keyboard navigation and
the opening section's scroll geometry on desktop and tall mobile layouts.
`npm run check` also runs dependency-free dialog and intro-navigation tests under
Node 24, covering package routing, unknown targets, duplicate opening, scroll
locking, backdrop dismissal, drag protection, the coaching CTA's direct widget route,
on-demand widget loading/retry, CSP guards and cleanup. Native dialog focus,
keyboard dismissal and responsive layout are verified in the browser.

## Project files

- `index.html`: semantic page content and seven native FAQ disclosures with answers.
- `src/styles.css` and `src/tokens.css`: responsive layout and design tokens.
- `src/main.ts`: opening-section sizing, anchor navigation and feature bindings.
- `src/intro-scroll.ts`: safe scroll positions for pinned opening content.
- `src/package-dialogs.ts`: package modal routing, scroll lock and dismissal.
- `src/mindbody-checkout.ts`: supplied CTA mappings, on-demand loading, frame navigation and retry.
- `src/security-policy.ts`: narrowly scoped development and preview headers.
- `scripts/package-dialogs.test.mjs`: modal controller behavior tests.
- `scripts/intro-scroll.test.mjs`: offer navigation and focus visibility regressions.
- `scripts/mindbody-checkout.test.mjs`: lazy loading, duplicate prevention, failures and cleanup.
- `scripts/security-policy.test.mjs`: production CSP and payment-permission guards.
- `vite.config.ts`: loopback servers, fixed ports and local security headers.
- `scripts/check-build.mjs`: approved output checks and JS/CSS transfer budgets.
- `scripts/build-output-policy.mjs`: allowed public build files and asset types.
- `scripts/build-output-policy.test.mjs`: private-file and export rejection checks.
- `AGENTS.md`: engineering standards for future changes.

No environment variables or credentials are required. Do not copy TNT or
Planksgiving `.env` files into this project. Future client-side configuration is
public; private credentials must never enter browser bundles.

This directory has its own Git repository, separate from the parent TNT app and
Planksgiving. Its remote is
[InfernoTeamLV/Black-Friday-2026-Landing-Page](https://github.com/InfernoTeamLV/Black-Friday-2026-Landing-Page),
with `main` as the primary branch. Its parent TNT repository ignores it. Hosting
and deployment are not configured.

This preview includes `noindex` metadata and a blocking `robots.txt`. These are
indexing hints, not access controls. Before launch, review those settings, final
copy, real checkout configuration, mobile/keyboard behavior, hosting headers and
rollback instructions. Vite preview is a local check, not a production host.
