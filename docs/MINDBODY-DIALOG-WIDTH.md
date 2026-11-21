# Mindbody package-details width request

The requested change is to the product-details panel shown after selecting a
pricing card, before Continue opens cart review. This is hosted inside Mindbody's
Pricing iframe, not in the landing page's HTML.

Observed in the current-member widget: the inner panel has a computed maximum
width of 580px. The landing page's outer dialog already supports 1,280px and its
iframe fills the available content width. The cart-review page responds to this
width; the product-details panel keeps its separate limit.

## Request to Mindbody Support

Please provide a supported way to make the Pricing widget's product-details
panel expand to the iframe's available width on desktop, while staying within
phone and tablet viewports. The current 580px maximum leaves substantial unused
space inside a wider embed. Keep the close control and Continue action reachable,
with vertical scrolling when required.

Our current-member Pricing widget is `c5685422c8`. The other campaign widgets are
`c5685522c8` (all offers), `c5685622c8` (new-member annual), `c5685722c8`
(TNT Coaching), and `c5685822c8` (Fire Pass). We want consistent responsive sizing
throughout their purchase flows.

Does this Pricing widget support an internal dialog-width or Custom CSS setting?
If it does, please identify the supported setting or CSS hook. If it does not,
please advise whether the product-details layout can be made responsive by
Mindbody, or whether an official direct purchase link can skip this fixed-width
panel while retaining Mindbody's checkout and purchase terms.

## Verification and access

Mindbody's [Pricing widget setup and options](https://support.mindbodyonline.com/s/article/Pricing-widget-setup-and-options-branded-web-widgets?language=en_US)
documents a full-width embed and color settings, but no product-dialog width
setting. On November 19, the actual current-member Pricing widget editor was
inspected through the user's existing signed-in Chrome window. Style exposes
colors; Content exposes headings, product selection, categories and benefits.
Neither offers a width, hide-close or skip-details control. No account settings
were saved or changed.

The landing page cannot directly restyle the document inside this other-domain
iframe because of the browser's [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy).
Do not add ineffective parent-page CSS for Mindbody's internal panel or assume
an undocumented customization setting exists. No support message has been sent.

## November 19 follow-up

The user has resumed this work. Prefer skipping the item-details panel entirely;
otherwise expand it within the frame and remove its redundant top-left close
button through a supported Mindbody setting. The landing page's separate top-right
close button stays available.

The catalog's live panel still has a 580px maximum width. The outer checkout iframe
now fills the popup beneath its title banner; that sizing change does not alter
the vendor-owned inner panel.

Mindbody's [Buy Now - Pricing Option link guide](https://support.mindbodyonline.com/s/article/Buy-Now-Link?language=en_US)
describes adding a selected item directly to the shopping cart. Verify the
appropriate supported link type for these annual contracts and the coaching/pass
offers in the account's link builder before changing CTA routing. Do not construct
cart links from transient session URLs or unverified parameters.

The official account link builder generated Buy Now - Pricing Option links for
the exact products in the sale widget: current annual `1727`, new annual `1728`,
TNT `1732`, Fire Pass `1735`, with business `21712` and Branded Web site `1601`.
These links opened a standalone product-details page without a nested modal or
inner X. They were tried locally, then reverted after the user reported that the
white theme and checkout behavior did not meet the requirement. Service CTAs
again use their original supplied Pricing widgets. No account widget was created.

The rejected standalone page retains a Continue step, Mindbody's hosted styling
and its own responsive content columns. At the tested desktop size the details
column expanded to 792px instead of the catalog panel's roughly 500px content
width. It does not stretch every internal component to the iframe edges. The
original supplied widgets are now used by all purchase CTAs.
Parent CSS cannot remove these remaining vendor layout limits.

The standalone current-member Continue step was followed as far as cart review,
but that check did not establish that the complete checkout would stay inside
the embedded popup. It was insufficient to approve this routing change.
No contract was accepted and no payment was entered or submitted.
No credentials or account settings were changed. No support request was sent.

Experiment verification: all four service routes and the all-offers route loaded in the
local popup, with one reused iframe and one SDK script. Phone 320×812 and tablet
768×1024 checks showed no horizontal overflow. Keyboard Tab reached Continue and
scrolled the long annual details into view while the outer close button stayed
visible. All 45 automated tests, formatting, TypeScript, production build and
artifact/security-policy checks passed. Those checks did not establish end-to-end
embedded checkout. No new dependency or CSP origin was added.

The rollback restores `src/mindbody-checkout.ts` exactly to its version before
the standalone-link experiment, preserving the full-size outer frame, three-dot
loader and delayed fallback. A regression check now verifies that the first click
on every service uses its supplied embedded Pricing URL, not hosted Buy Now pricing.

Rollback verification: the original dark product-details panel was observed.
After Mindbody sign-in, the current-member widget reached the Confirm purchase
screen with payment-method choices inside the same landing-page popup and iframe
(`context=BRANDED`). No payment details were entered and Confirm purchase was not
clicked. Phone 320×812 and tablet 768×1024 checks retained the full available frame
without horizontal overflow. All 45 tests and the production build passed.

The built-in preview initially blocked the vendor sign-in redirect. A temporary
sign-in frame-origin diagnostic was removed; the final security policy is
unchanged. Checkout was then tested in the user's existing Chrome window using a
separate local test tab. Mindbody opened its normal customer sign-in popup rather
than navigating the checkout iframe to a blocked sign-in page. The user completed
sign-in, and the popup returned to the embedded current-member cart. Continue
reached Confirm purchase with payment-method choices inside the original iframe,
while the top-level page remained on the local landing page. Confirm purchase
was disabled and was not activated. No payment details were entered by the
assistant. This verifies the local sign-in return and payment-form path, not a
completed payment; repeat the checks on the final production domain.

An existing offer-terms mismatch was observed: Mindbody currently displays Fire
Pass expiry as four months after purchase, while the user-supplied FAQ says all
classes must be used by March 31, 2027. Reconcile the vendor configuration before
launch. This investigation did not change either term.
