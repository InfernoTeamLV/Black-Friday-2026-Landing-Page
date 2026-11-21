import "./styles.css";
import { bindPackageDialogs } from "./package-dialogs";
import { getIntroScrollTop } from "./intro-scroll";
import { bindMindbodyCheckout } from "./mindbody-checkout";

const intro = document.querySelector<HTMLElement>(".offer");
const pageContent = document.querySelector<HTMLElement>(".page-content");

if (intro && pageContent && "ResizeObserver" in window) {
  // A tall opening section can be read in full before it pins. CSS handles scrolling;
  // only layout/viewport changes need measurements, never individual scroll frames.
  const updateIntroOffset = () => {
    const offset = Math.min(
      0,
      window.innerHeight - intro.getBoundingClientRect().height
    );
    intro.style.setProperty("--intro-sticky-top", `${offset}px`);
  };

  updateIntroOffset();
  intro.classList.add("is-pinned");
  const observer = new ResizeObserver(updateIntroOffset);
  observer.observe(intro);
  window.addEventListener("resize", updateIntroOffset, { passive: true });

  const revealIntroTarget = (target: HTMLElement) => {
    const introBounds = intro.getBoundingClientRect();
    const targetTop = target.getBoundingClientRect().top - introBounds.top;
    window.scrollTo({
      top: getIntroScrollTop(targetTop, introBounds.height, window.innerHeight),
      behavior: "instant"
    });
  };

  // Resolve direct #deals links within the pinned intro so the cards stay uncovered.
  const dealGrid = document.querySelector<HTMLElement>("#deals");
  const revealLinkedOffers = () => {
    if (window.location.hash === "#deals" && dealGrid) revealIntroTarget(dealGrid);
  };
  window.addEventListener("hashchange", revealLinkedOffers);
  if (document.readyState === "complete") revealLinkedOffers();
  else window.addEventListener("load", revealLinkedOffers, { once: true });

  // Reveal a covered control without sending visitors to the top of a long card list.
  const revealFocusedIntro = (event: FocusEvent) => {
    if (!(event.target instanceof HTMLElement)) return;
    const targetBounds = event.target.getBoundingClientRect();
    const coverTop = pageContent.getBoundingClientRect().top;
    if (coverTop < window.innerHeight && targetBounds.bottom > coverTop) {
      revealIntroTarget(event.target);
    }
  };
  intro.addEventListener("focusin", revealFocusedIntro);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      observer.disconnect();
      window.removeEventListener("resize", updateIntroOffset);
      intro.removeEventListener("focusin", revealFocusedIntro);
      window.removeEventListener("hashchange", revealLinkedOffers);
      window.removeEventListener("load", revealLinkedOffers);
    });
  }
}

// Purchase controls open pricing directly. Mindbody must enforce coaching's annual
// membership requirement; a click or a loaded frame is not proof of eligibility.

const mindbodyCheckout = bindMindbodyCheckout(document);
const disposePackageDialogs = bindPackageDialogs(
  document.querySelectorAll<HTMLElement>("[data-package-dialog]"),
  document.querySelectorAll<HTMLDialogElement>("dialog.package-dialog"),
  document.documentElement,
  (dialog, trigger) => {
    if (
      dialog.id === "mindbody-checkout" &&
      !mindbodyCheckout.open(trigger.dataset.checkoutRoute ?? "")
    )
      dialog.close();
  }
);
if (import.meta.hot) {
  import.meta.hot.dispose(disposePackageDialogs);
  import.meta.hot.dispose(mindbodyCheckout.dispose);
}
