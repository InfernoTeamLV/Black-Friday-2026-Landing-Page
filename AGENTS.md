# The Blackout project guidance

This is the standalone Inferno Hot Pilates Black Friday landing page. Keep its
repository, configuration and deployment separate from TNT and Planksgiving.
The sale's official name is **The Blackout**; use it consistently in campaign copy.

- Consider performance, responsive design, accessibility, scalability and security
  in every change. Use supported stable tools and verify vendor documentation.
- Keep essential content in HTML, styles in CSS and optional behavior in small
  TypeScript modules. Avoid adding a framework, backend, database or service
  worker without a requirement that warrants it.
- The chosen visual direction is cinematic split screen with a dark monochrome
  palette, editorial typography and responsive stacked panels on phones.
  The service section leads with a small, spaced THE and large condensed BLACKOUT; the lower
  split-screen section reads GOOD THINGS. WORTH THE WAIT. in its condensed / italic
  serif treatment. Promote Annual Membership for current members, Annual Membership
  for new members, TNT Coaching and Fire Pass, in that order.
  The new-member annual card is featured with a thin muted red outline around
  its full edge; the current-member card has the standard neutral border.
  All four cards use the user-supplied “Limited quantity” label in angled
  top-right corner tabs; do not invent remaining counts or stock updates.
  TNT Coaching shows a compact Annual Membership requirement label below its
  description. Preserve the existing muted
  accent and charcoal palette, including the softened new-member outline.
  TNT Coaching is small-group personal training, as defined by the user, and requires an annual
  membership. Package details omit introductory descriptions. Both annual offers
  include unlimited IHP and Cyclone classes. Coaching details list TNT small-group
  training for one year, with an annual membership requirement; training and
  availability rows are omitted. Coaching includes quarterly body composition
  scans with Evolt 360. The Fire Pass purchase limit is presented in
  package details rather than on the card. Fire Pass includes access to IHP and
  Cyclone classes and TNT sessions, with 20 classes per pass and a limit of two
  passes per person and a use-by date of March 31, 2027. The FAQ omits sale timing.
  Its returning-member answer directs guests to the new-member Annual Membership
  without specifying a minimum break. The user manages actual sale availability.
  Remaining full terms and checkout
  configuration are still being finalized. Offer pricing comes from the Mindbody widgets.
  Card selection is not verified eligibility. Mindbody must enforce coaching's
  annual membership prerequisite and purchase limits.
  The supplied CTA mappings are: all-sale CTAs `c5685522c8`, current-member annual
  `c5685422c8`, new-member annual `c5685622c8`, TNT Coaching `c5685722c8`, and Fire
  Pass `c5685822c8`.
  All purchase CTAs use the supplied embedded Pricing widgets, preserving their
  dark theme and in-site checkout. The standalone Buy Now links were reverted at
  the user's request because they changed the theme and did not preserve the
  expected checkout flow. Do not substitute those hosted pricing URLs.
  The coaching card opens its Mindbody pricing directly without a membership
  status prompt, as requested by the user. The annual requirement stays visible
  on the card, in package details and in the FAQ. Load the official script on demand and
  reuse one pricing iframe across routes. Never interpret loading as a purchase.
  Do not invent discounts, testimonials, deadlines or scarcity.
- Use official Mindbody checkout tools when supplied. Card data stays in
  Mindbody. Never expose secrets or infer payment success from a client redirect.
  Browser environment variables are public. Review required CSP origins when
  integrating the vendor; keep development exceptions out of production. The
  maintained loader requires inline styles; this deliberate production CSS allowance
  is documented in README.md. Inline/evaluated JavaScript remain blocked. Keep
  runtime origins and production hosting headers in sync with src/security-policy.ts.
- Keep the server bound to loopback for local testing. Do not publish or create
  cloud resources as part of local environment setup.
- The Netlify production target is `infernoblackfriday2026`, connected to `main`.
  `netlify.toml` selects Node 24, `npm run check` and `dist/`. Generate `_headers`
  from the shared security policy; keep development WebSocket exceptions out of
  production. Ignore local `.netlify/` state. Preserve the existing noindex/robots
  settings until the user chooses to enable search indexing.
- Use Node 24, the lockfile and exact dependency versions. Keep current stable
  versions compatible with each other. Do not change the system Node installation.
- Build for small screens with semantic HTML, keyboard access, visible focus,
  readable contrast, responsive layouts and reduced-motion support.
- Run `npm run check` for code changes and `npm run security:check` when changing
  dependencies. Review browser layout at phone, tablet and desktop widths.
  Add meaningful automated tests as behavior is introduced; do not mirror trivial
  presentation code in tests. Documentation-only edits need formatting review.
- Keep runtime files, environment files and dependencies out of Git. Preserve
  unrelated local work and report actual verification and remaining limitations.
- Before any future public launch, replace placeholder copy, review the Mindbody
  purchase flow, configure hosting headers and deliberately review the current
  `noindex` and `robots.txt` preview settings.
