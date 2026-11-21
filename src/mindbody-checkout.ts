export const MINDBODY_SCRIPT_URL =
  "https://brandedweb.mindbodyonline.com/embed/widget.js";
const SCRIPT_ID = "mindbody-pricing-script";
const loads = new WeakMap<Document, Promise<void>>();

// Keep Mindbody's maintained script remote. Load it once per document, only after
// an explicit checkout click. Neither script load nor widget display means payment.
export function loadMindbodyScript(doc: Document): Promise<void> {
  const cached = loads.get(doc);
  if (cached) return cached;
  const existing = doc.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing && existing.getAttribute("src") !== MINDBODY_SCRIPT_URL)
    return Promise.reject(new Error("Unexpected Mindbody script source."));
  if (existing?.dataset.loadState === "loaded") return Promise.resolve();

  const script = existing ?? doc.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = MINDBODY_SCRIPT_URL;
  script.dataset.loadState = "loading";
  const promise = new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };
    const loaded = () => {
      cleanup();
      script.dataset.loadState = "loaded";
      resolve();
    };
    const failed = () => {
      cleanup();
      script.remove();
      loads.delete(doc);
      reject(new Error("Mindbody could not be loaded."));
    };
    script.addEventListener("load", loaded);
    script.addEventListener("error", failed);
  });
  loads.set(doc, promise);
  if (!existing) doc.head.append(script);
  return promise;
}

export const CHECKOUT_ROUTES = {
  sale: {
    widgetId: "c5685522c8",
    title: "Choose your offer"
  },
  "annual-current": {
    widgetId: "c5685422c8",
    title: "Annual Membership"
  },
  "annual-new": {
    widgetId: "c5685622c8",
    title: "Annual Membership"
  },
  coaching: {
    widgetId: "c5685722c8",
    title: "TNT Coaching"
  },
  "fire-pass": {
    widgetId: "c5685822c8",
    title: "Fire Pass"
  }
} as const;

type CheckoutRoute = (typeof CHECKOUT_ROUTES)[keyof typeof CHECKOUT_ROUTES];
export function getCheckoutRoute(key: string): CheckoutRoute | undefined {
  return Object.hasOwn(CHECKOUT_ROUTES, key)
    ? CHECKOUT_ROUTES[key as keyof typeof CHECKOUT_ROUTES]
    : undefined;
}
export function getMindbodyPricingUrl(widgetId: string): string {
  return `https://go.mindbodyonline.com/book/widgets/pricing/view/${encodeURIComponent(widgetId)}/pricing`;
}

export const MINDBODY_FALLBACK_DELAY = 10000;
const MINDBODY_FRAME_ORIGIN = "https://go.mindbodyonline.com";

type CheckoutTimers = {
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  cancel: (handle: ReturnType<typeof setTimeout>) => void;
};

// The native iframe load event also fires for failed/blocked documents. Require
// the layout handshake already used by Mindbody's iframe-resizer integration.
// Read dimensions only, from this exact frame and the trusted Mindbody origin.
export function isMindbodySizingMessage(
  event: Pick<MessageEvent, "origin" | "source" | "data">,
  frame: Pick<HTMLIFrameElement, "id" | "contentWindow">
): boolean {
  if (
    event.origin !== MINDBODY_FRAME_ORIGIN ||
    !frame.contentWindow ||
    event.source !== frame.contentWindow ||
    typeof event.data !== "string"
  )
    return false;
  const prefix = `[iFrameSizer]${frame.id}:`;
  if (!event.data.startsWith(prefix)) return false;
  const dimensions = /^([0-9]+(?:\.[0-9]+)?):([0-9]+(?:\.[0-9]+)?):/.exec(
    event.data.slice(prefix.length)
  );
  return Boolean(
    dimensions &&
    Number(dimensions[1]) > 0 &&
    Number.isFinite(Number(dimensions[1])) &&
    Number.isFinite(Number(dimensions[2]))
  );
}

// One maintained vendor script and iframe serve all supplied routes. Readiness
// means an embedded document can display, never a verified purchase or eligibility.
export function bindMindbodyCheckout(
  root: Document,
  loadWidget: () => Promise<void> = () => loadMindbodyScript(root),
  timers: CheckoutTimers = {
    schedule: (callback, delay) => setTimeout(callback, delay),
    cancel: (handle) => clearTimeout(handle)
  }
): { open: (routeKey: string) => boolean; dispose: () => void } {
  const host = root.getElementById("mindbody-widget-host");
  const loading = root.getElementById("mindbody-loading");
  const status = root.getElementById("mindbody-load-status");
  const retry = root.getElementById("mindbody-retry");
  const close = root.getElementById("mindbody-checkout-close");
  const title = root.getElementById("mindbody-checkout-title");
  const fallbackWrap = root.getElementById("mindbody-fallback-wrap");
  const fallback = root.getElementById("mindbody-fallback") as HTMLAnchorElement | null;
  const messageTarget = root.defaultView;
  if (
    !host ||
    !loading ||
    !status ||
    !retry ||
    !title ||
    !fallbackWrap ||
    !fallback ||
    !messageTarget
  )
    return { open: () => false, dispose: () => {} };

  let active: CheckoutRoute | undefined;
  let loader: Promise<void> | undefined;
  let version = 0;
  let disposed = false;
  let readyFrame: HTMLIFrameElement | null = null;
  let readyWidgetId: string | undefined;
  let cancelAttempt = () => {};

  const fitFrame = (frame: HTMLIFrameElement) => {
    frame.removeAttribute("scrolling");
    frame.style.setProperty("min-height", "0px", "important");
  };

  const render = async (force = false) => {
    if (!active || disposed) return;
    const route = active;
    const request = ++version;
    cancelAttempt();
    const before = host.querySelector("iframe");
    const url = new URL(getMindbodyPricingUrl(route.widgetId));
    if (before) {
      const previousUrl = new URL(before.getAttribute("src") ?? url.toString());
      if (previousUrl.origin === url.origin) url.search = previousUrl.search;
    }
    const alreadyReady =
      !force &&
      before === readyFrame &&
      readyWidgetId === route.widgetId &&
      before?.getAttribute("src") === url.toString();
    fallbackWrap.hidden = true;
    retry.hidden = true;
    host.dataset.widgetType = "Pricing";
    host.dataset.widgetId = route.widgetId;
    if (alreadyReady) {
      if (before) fitFrame(before);
      loading.hidden = true;
      status.hidden = true;
      host.dataset.loading = "false";
      host.setAttribute("aria-busy", "false");
      host.setAttribute("aria-hidden", "false");
      return;
    }

    let frame: HTMLIFrameElement | null = null;
    let frameLoaded = false;
    let settled = false;
    let failed = false;
    loading.hidden = false;
    loading.dataset.state = "loading";
    status.hidden = false;
    status.textContent = "Loading your options…";
    host.dataset.loading = "true";
    host.setAttribute("aria-busy", "true");
    host.setAttribute("aria-hidden", "true");
    const current = () => !disposed && request === version;
    const deadline = timers.schedule(() => {
      if (!current() || settled) return;
      fallbackWrap.hidden = false;
      retry.hidden = false;
      status.textContent = failed
        ? "Your options couldn’t load. Try again or open Mindbody below."
        : "Still loading. You can try again or open Mindbody below.";
    }, MINDBODY_FALLBACK_DELAY);

    const onFrameLoad = () => {
      frameLoaded = true;
      if (frame) fitFrame(frame);
    };
    const watchFrame = (candidate: HTMLIFrameElement) => {
      if (frame === candidate) return;
      frame?.removeEventListener("load", onFrameLoad);
      frame = candidate;
      // Restore the browser's default internal scrolling for the fixed viewport.
      // The vendor loader initially adds the legacy scrolling="no" attribute.
      fitFrame(frame);
      frameLoaded = false;
      frame.addEventListener("load", onFrameLoad);
    };
    const observer =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => {
            const candidate = host.querySelector("iframe");
            if (candidate) watchFrame(candidate);
          });
    const stop = () => {
      timers.cancel(deadline);
      observer?.disconnect();
      frame?.removeEventListener("load", onFrameLoad);
      messageTarget.removeEventListener("message", onMessage);
    };
    const onMessage = (event: MessageEvent) => {
      if (
        !current() ||
        settled ||
        !frame ||
        !frameLoaded ||
        !isMindbodySizingMessage(event, frame)
      )
        return;
      settled = true;
      readyFrame = frame;
      readyWidgetId = route.widgetId;
      fitFrame(frame);
      stop();
      loading.hidden = true;
      status.hidden = true;
      retry.hidden = true;
      fallbackWrap.hidden = true;
      host.dataset.loading = "false";
      host.setAttribute("aria-busy", "false");
      host.setAttribute("aria-hidden", "false");
      if (root.activeElement === fallback || root.activeElement === retry)
        frame.focus();
    };
    cancelAttempt = stop;
    messageTarget.addEventListener("message", onMessage);
    observer?.observe(host, { childList: true, subtree: true });
    if (before) watchFrame(before);
    try {
      if (!before) {
        loader ??= loadWidget().catch((error: unknown) => {
          loader = undefined;
          throw error;
        });
        await loader;
        if (!current()) return;
      }
      const candidate = host.querySelector("iframe");
      if (!candidate) throw new Error("Mindbody pricing frame is unavailable.");
      watchFrame(candidate);
      if (before || candidate.getAttribute("src") !== url.toString()) {
        frameLoaded = false;
        candidate.src = url.toString();
      }
    } catch {
      if (!current()) return;
      failed = true;
      loading.dataset.state = "error";
      status.textContent = "Your options couldn’t load. Please try again.";
      retry.hidden = false;
      // Keep the original deadline: the external link never appears before 10s.
    }
  };
  const onRetry = () => {
    const retryHadFocus = root.activeElement === retry;
    void render(true);
    if (retryHadFocus) close?.focus();
  };
  retry.addEventListener("click", onRetry);
  return {
    open: (key) => {
      const route = getCheckoutRoute(key);
      if (!route || disposed) return false;
      active = route;
      title.textContent = route.title;
      fallback.href = getMindbodyPricingUrl(route.widgetId);
      void render();
      return true;
    },
    dispose: () => {
      disposed = true;
      cancelAttempt();
      retry.removeEventListener("click", onRetry);
    }
  };
}
