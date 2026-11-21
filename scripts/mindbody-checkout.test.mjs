import assert from "node:assert/strict";
import test from "node:test";
import {
  loadMindbodyScript,
  bindMindbodyCheckout,
  MINDBODY_SCRIPT_URL,
  MINDBODY_FALLBACK_DELAY,
  isMindbodySizingMessage,
  getCheckoutRoute,
  getMindbodyPricingUrl
} from "../src/mindbody-checkout.ts";

class FakeScript extends EventTarget {
  dataset = {};
  removed = false;
  getAttribute(name) {
    return name === "src" ? this.src : null;
  }
  remove() {
    this.removed = true;
  }
}
function documentFixture() {
  const scripts = [];
  const doc = {
    head: { append: (script) => scripts.push(script) },
    getElementById: (id) =>
      scripts.find((script) => script.id === id && !script.removed) ?? null,
    createElement: (tag) => {
      assert.equal(tag, "script");
      return new FakeScript();
    }
  };
  return { doc, scripts };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

test("concurrent and repeated loads reuse the official async script", async () => {
  const { doc, scripts } = documentFixture();
  const first = loadMindbodyScript(doc);
  const second = loadMindbodyScript(doc);
  assert.equal(first, second);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, MINDBODY_SCRIPT_URL);
  assert.equal(scripts[0].async, true);
  scripts[0].dispatchEvent(new Event("load"));
  await first;
  await loadMindbodyScript(doc);
  assert.equal(scripts.length, 1);
});

test("a failed script is removed and can be retried", async () => {
  const { doc, scripts } = documentFixture();
  const first = loadMindbodyScript(doc);
  const rejected = assert.rejects(first, /could not be loaded/);
  scripts[0].dispatchEvent(new Event("error"));
  await rejected;
  assert.equal(scripts[0].removed, true);
  const retry = loadMindbodyScript(doc);
  assert.equal(scripts.length, 2);
  scripts[1].dispatchEvent(new Event("load"));
  await retry;
});

test("an unexpected script source cannot be reused as Mindbody", async () => {
  const { doc, scripts } = documentFixture();
  const script = new FakeScript();
  script.id = "mindbody-pricing-script";
  script.src = "https://example.com/untrusted.js";
  scripts.push(script);
  await assert.rejects(loadMindbodyScript(doc), /Unexpected/);
  assert.equal(scripts.length, 1);
});

test("a loaded script survives controller rebinding without duplication", async () => {
  const { doc, scripts } = documentFixture();
  const script = new FakeScript();
  script.id = "mindbody-pricing-script";
  script.src = MINDBODY_SCRIPT_URL;
  script.dataset.loadState = "loaded";
  scripts.push(script);
  await loadMindbodyScript(doc);
  assert.equal(scripts.length, 1);
});

class FakeNode extends EventTarget {
  focusCalls = 0;
  dataset = {};
  textContent = "";
  hidden = false;
  attributes = new Map();
  setAttribute(key, value) {
    this.attributes.set(key, value);
  }
  removeAttribute(key) {
    this.attributes.delete(key);
  }
  focus() {
    this.focusCalls++;
  }
}
class FakeFrame extends FakeNode {
  id = "fixture-pricing-frame";
  contentWindow = {};
  inlineStyles = new Map();
  style = {
    setProperty: (name, value, priority) =>
      this.inlineStyles.set(name, { value, priority })
  };
  constructor(src) {
    super();
    this.src = src;
  }
  getAttribute(name) {
    return name === "src" ? this.src : (this.attributes.get(name) ?? null);
  }
}

class FakeClock {
  now = 0;
  nextId = 0;
  tasks = new Map();
  schedule = (callback, delay) => {
    const id = ++this.nextId;
    this.tasks.set(id, { at: this.now + delay, callback });
    return id;
  };
  cancel = (id) => this.tasks.delete(id);
  advance(ms) {
    const until = this.now + ms;
    while (true) {
      const next = [...this.tasks].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > until) break;
      this.now = next[1].at;
      this.tasks.delete(next[0]);
      next[1].callback();
    }
    this.now = until;
  }
}

function sizingEvent(frame, overrides = {}) {
  const event = new Event("message");
  const values = {
    origin: "https://go.mindbodyonline.com",
    source: frame.contentWindow,
    data: `[iFrameSizer]${frame.id}:500:256:init`,
    ...overrides
  };
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(event, key, { value });
  return event;
}

function routeFixture() {
  const nodes = new Map(
    [
      "mindbody-widget-host",
      "mindbody-loading",
      "mindbody-load-status",
      "mindbody-retry",
      "mindbody-checkout-close",
      "mindbody-checkout-title",
      "mindbody-fallback",
      "mindbody-fallback-wrap"
    ].map((id) => [id, new FakeNode()])
  );
  const clock = new FakeClock();
  const window = new EventTarget();
  const doc = {
    getElementById: (id) => nodes.get(id) ?? null,
    defaultView: window,
    activeElement: null
  };
  const host = nodes.get("mindbody-widget-host");
  host.frame = null;
  host.querySelector = () => host.frame;
  let calls = 0;
  let impl = () => {
    host.frame = new FakeFrame(getMindbodyPricingUrl(host.dataset.widgetId));
    return Promise.resolve();
  };
  const controller = bindMindbodyCheckout(
    doc,
    () => {
      calls++;
      return impl();
    },
    clock
  );
  return {
    controller,
    host,
    nodes,
    clock,
    doc,
    window,
    ready: () => {
      host.frame.dispatchEvent(new Event("load"));
      window.dispatchEvent(sizingEvent(host.frame));
    },
    get calls() {
      return calls;
    },
    setLoader: (next) => {
      impl = next;
    }
  };
}

test("the supplied sale, annual, coaching and pass IDs are mapped exactly", () => {
  for (const [key, id] of [
    ["sale", "c5685522c8"],
    ["annual-current", "c5685422c8"],
    ["annual-new", "c5685622c8"],
    ["coaching", "c5685722c8"],
    ["fire-pass", "c5685822c8"]
  ])
    assert.equal(getCheckoutRoute(key).widgetId, id);
  for (const key of ["", "unknown", "__proto__", "constructor"])
    assert.equal(getCheckoutRoute(key), undefined);
});

test("each service starts in its supplied embedded widget rather than hosted Buy Now pricing", async () => {
  for (const [key, id] of [
    ["annual-current", "c5685422c8"],
    ["annual-new", "c5685622c8"],
    ["coaching", "c5685722c8"],
    ["fire-pass", "c5685822c8"]
  ]) {
    const state = routeFixture();
    state.controller.open(key);
    await flush();
    const expected = `https://go.mindbodyonline.com/book/widgets/pricing/view/${id}/pricing`;
    assert.equal(state.host.frame.src, expected);
    assert.equal(state.nodes.get("mindbody-fallback").href, expected);
    state.ready();
    assert.equal(state.host.dataset.loading, "false");
    state.controller.dispose();
  }
});

test("all routes reuse one frame, keep the matching fallback, and do not preload", async () => {
  const state = routeFixture();
  assert.equal(state.calls, 0);
  assert.equal(state.controller.open("sale"), true);
  await flush();
  const original = state.host.frame;
  state.ready();
  for (const key of ["annual-current", "annual-new", "coaching", "fire-pass", "sale"]) {
    state.controller.open(key);
    state.ready();
    await flush();
    const route = getCheckoutRoute(key);
    assert.equal(state.host.frame, original);
    assert.equal(state.host.frame.src, getMindbodyPricingUrl(route.widgetId));
    assert.equal(state.nodes.get("mindbody-fallback").href, state.host.frame.src);
    assert.equal(state.nodes.get("mindbody-checkout-title").textContent, route.title);
    assert.equal(state.nodes.get("mindbody-load-status").hidden, true);
  }
  assert.equal(state.calls, 1);
  state.controller.dispose();
});

test("vendor initialization cannot disable scrolling in the fixed viewport", async () => {
  const state = routeFixture();
  state.setLoader(() => {
    state.host.frame = new FakeFrame(getMindbodyPricingUrl("c5685522c8"));
    state.host.frame.setAttribute("scrolling", "no");
    return Promise.resolve();
  });
  state.controller.open("sale");
  await flush();
  const frame = state.host.frame;
  assert.equal(frame.getAttribute("scrolling"), null);
  assert.deepEqual(frame.inlineStyles.get("min-height"), {
    value: "0px",
    priority: "important"
  });
  frame.setAttribute("scrolling", "no");
  frame.dispatchEvent(new Event("load"));
  assert.equal(frame.getAttribute("scrolling"), null);
  frame.setAttribute("scrolling", "no");
  state.window.dispatchEvent(sizingEvent(frame));
  assert.equal(frame.getAttribute("scrolling"), null);
  assert.equal(state.nodes.get("mindbody-loading").hidden, true);
  frame.setAttribute("scrolling", "no");
  state.controller.open("sale");
  assert.equal(frame.getAttribute("scrolling"), null);
  assert.equal(state.calls, 1);
  state.controller.dispose();
});

test("the latest route wins while the first vendor script is still loading", async () => {
  const state = routeFixture();
  const pending = deferred();
  state.setLoader(() => pending.promise);
  state.controller.open("annual-current");
  state.controller.open("fire-pass");
  state.host.frame = new FakeFrame(getMindbodyPricingUrl("c5685422c8"));
  pending.resolve();
  await flush();
  state.ready();
  assert.equal(state.host.frame.src, getMindbodyPricingUrl("c5685822c8"));
  assert.equal(state.nodes.get("mindbody-checkout-title").textContent, "Fire Pass");
  assert.equal(state.calls, 1);
  state.controller.dispose();
});

test("changing offers preserves the vendor's existing campaign parameters", async () => {
  const state = routeFixture();
  state.controller.open("sale");
  await flush();
  state.host.frame.src += "?utm_source=studio";
  state.controller.open("annual-current");
  state.host.frame.dispatchEvent(new Event("load"));
  assert.equal(
    state.host.frame.src,
    getMindbodyPricingUrl("c5685422c8") + "?utm_source=studio"
  );
  state.controller.dispose();
});

test("failed loading can be retried without leaving the selected route", async () => {
  const state = routeFixture();
  state.setLoader(() => Promise.reject(new Error("network")));
  state.controller.open("coaching");
  await flush();
  assert.equal(state.nodes.get("mindbody-retry").hidden, false);
  state.setLoader(() => {
    state.host.frame = new FakeFrame(
      getMindbodyPricingUrl(state.host.dataset.widgetId)
    );
    return Promise.resolve();
  });
  state.nodes.get("mindbody-retry").dispatchEvent(new Event("click"));
  await flush();
  state.ready();
  assert.equal(state.nodes.get("mindbody-load-status").hidden, true);
  assert.equal(state.calls, 2);
  assert.equal(state.host.frame.src, getMindbodyPricingUrl("c5685722c8"));
  state.controller.dispose();
});

test("unknown routes and missing markup do not load or reuse a previous offer", async () => {
  const state = routeFixture();
  assert.equal(state.controller.open("__proto__"), false);
  assert.equal(state.calls, 0);
  state.controller.open("sale");
  await flush();
  assert.equal(state.controller.open("unknown"), false);
  assert.equal(state.host.frame.src, getMindbodyPricingUrl("c5685522c8"));
  const missing = bindMindbodyCheckout({ getElementById: () => null }, () => {
    throw new Error("Must not load");
  });
  assert.equal(missing.open("sale"), false);
  missing.dispose();
  state.controller.dispose();
});

test("cleanup removes retries and ignores a late loading result", async () => {
  const state = routeFixture();
  const pending = deferred();
  state.setLoader(() => pending.promise);
  state.controller.open("sale");
  state.controller.dispose();
  pending.resolve();
  await flush();
  assert.equal(state.nodes.get("mindbody-load-status").hidden, false);
  assert.equal(state.controller.open("coaching"), false);
  state.nodes.get("mindbody-retry").dispatchEvent(new Event("click"));
  assert.equal(state.calls, 1);
});

test("the fallback stays hidden until ten seconds without a ready frame", async () => {
  const state = routeFixture();
  state.controller.open("sale");
  assert.equal(state.nodes.get("mindbody-loading").hidden, false);
  assert.equal(state.host.dataset.loading, "true");
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  await flush();
  // A failed cross-origin document can still fire this native event.
  state.host.frame.dispatchEvent(new Event("load"));
  state.clock.advance(MINDBODY_FALLBACK_DELAY - 1);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  state.clock.advance(1);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, false);
  assert.equal(state.nodes.get("mindbody-retry").hidden, false);
  assert.equal(state.nodes.get("mindbody-loading").hidden, false);
  state.controller.dispose();
});

test("a normally loaded widget cancels the fallback and removes the animation", async () => {
  const state = routeFixture();
  state.controller.open("annual-current");
  await flush();
  state.ready();
  assert.equal(state.host.dataset.loading, "false");
  assert.equal(state.host.attributes.get("aria-busy"), "false");
  assert.equal(state.host.attributes.get("aria-hidden"), "false");
  assert.equal(state.nodes.get("mindbody-loading").hidden, true);
  assert.equal(state.nodes.get("mindbody-load-status").hidden, true);
  assert.equal(state.clock.tasks.size, 0);
  state.clock.advance(MINDBODY_FALLBACK_DELAY * 2);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  state.controller.dispose();
});

test("a late frame hides the fallback and moves focus out of its hidden link", async () => {
  const state = routeFixture();
  state.controller.open("sale");
  await flush();
  state.clock.advance(MINDBODY_FALLBACK_DELAY);
  state.doc.activeElement = state.nodes.get("mindbody-fallback");
  state.ready();
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  assert.equal(state.nodes.get("mindbody-retry").hidden, true);
  assert.equal(state.nodes.get("mindbody-loading").hidden, true);
  assert.equal(state.host.frame.focusCalls, 1);
  state.controller.dispose();
});

test("only positive sizing from this iframe and the exact Mindbody origin is trusted", () => {
  const frame = new FakeFrame("");
  assert.equal(isMindbodySizingMessage(sizingEvent(frame), frame), true);
  assert.equal(
    isMindbodySizingMessage(
      sizingEvent(frame, { data: `[iFrameSizer]${frame.id}:500:0:resize` }),
      frame
    ),
    true
  );
  for (const overrides of [
    { origin: "https://example.com" },
    { origin: "https://go.mindbodyonline.com.evil.example" },
    { source: {} },
    { data: "[iFrameSizer]another-frame:500:256:init" },
    { data: `[iFrameSizer]${frame.id}:0:256:init` },
    { data: `[iFrameSizer]${frame.id}:NaN:256:init` },
    { data: `[iFrameSizer]${frame.id}:500:Infinity:init` },
    { data: { height: 500 } }
  ])
    assert.equal(isMindbodySizingMessage(sizingEvent(frame, overrides), frame), false);
});

test("untrusted sizing and messages before the new frame load cannot hide the loader", async () => {
  const state = routeFixture();
  state.controller.open("sale");
  await flush();
  state.window.dispatchEvent(sizingEvent(state.host.frame));
  assert.equal(state.nodes.get("mindbody-loading").hidden, false);
  state.host.frame.dispatchEvent(new Event("load"));
  state.window.dispatchEvent(
    sizingEvent(state.host.frame, { origin: "https://example.com" })
  );
  state.clock.advance(MINDBODY_FALLBACK_DELAY);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, false);
  state.controller.dispose();
});

test("an early SDK error permits retry but still waits ten seconds for the external link", async () => {
  const state = routeFixture();
  state.setLoader(() => Promise.reject(new Error("offline")));
  state.controller.open("coaching");
  await flush();
  assert.equal(state.nodes.get("mindbody-loading").dataset.state, "error");
  assert.equal(state.nodes.get("mindbody-retry").hidden, false);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  state.clock.advance(MINDBODY_FALLBACK_DELAY);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, false);
  assert.match(state.nodes.get("mindbody-load-status").textContent, /couldn’t load/);
  state.controller.dispose();
});

test("retry hides the fallback, resets its deadline and can recover the same iframe", async () => {
  const state = routeFixture();
  state.controller.open("fire-pass");
  await flush();
  const original = state.host.frame;
  state.clock.advance(MINDBODY_FALLBACK_DELAY);
  state.nodes.get("mindbody-retry").dispatchEvent(new Event("click"));
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  state.clock.advance(MINDBODY_FALLBACK_DELAY - 1);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  state.ready();
  assert.equal(state.host.frame, original);
  assert.equal(state.host.frame.src, getMindbodyPricingUrl("c5685822c8"));
  state.clock.advance(1);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  assert.equal(state.calls, 1);
  state.controller.dispose();
});

test("switching routes cancels the old deadline and starts a fresh ten-second window", async () => {
  const state = routeFixture();
  state.controller.open("annual-current");
  await flush();
  state.clock.advance(9000);
  state.controller.open("annual-new");
  state.clock.advance(1000);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  state.clock.advance(9000);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, false);
  assert.equal(
    state.nodes.get("mindbody-fallback").href,
    getMindbodyPricingUrl("c5685622c8")
  );
  state.ready();
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  state.controller.dispose();
});

test("reopening a ready offer does not reload or flash the loading indicator", async () => {
  const state = routeFixture();
  state.controller.open("sale");
  await flush();
  state.ready();
  state.controller.open("sale");
  assert.equal(state.nodes.get("mindbody-loading").hidden, true);
  assert.equal(state.clock.tasks.size, 0);
  assert.equal(state.calls, 1);
  state.controller.dispose();
});

test("disposing removes deadlines and ignores subsequent frame events", async () => {
  const state = routeFixture();
  state.controller.open("sale");
  await flush();
  state.controller.dispose();
  state.clock.advance(MINDBODY_FALLBACK_DELAY);
  state.ready();
  assert.equal(state.clock.tasks.size, 0);
  assert.equal(state.nodes.get("mindbody-fallback-wrap").hidden, true);
  assert.equal(state.nodes.get("mindbody-loading").hidden, false);
});

test("retry keeps keyboard focus on a visible close control while reloading", async () => {
  const state = routeFixture();
  state.controller.open("sale");
  await flush();
  state.clock.advance(MINDBODY_FALLBACK_DELAY);
  const retry = state.nodes.get("mindbody-retry");
  state.doc.activeElement = retry;
  retry.dispatchEvent(new Event("click"));
  assert.equal(retry.hidden, true);
  assert.equal(state.nodes.get("mindbody-checkout-close").focusCalls, 1);
  state.controller.dispose();
});

test("a late ready frame does not leave focus on its newly hidden retry button", async () => {
  const state = routeFixture();
  state.controller.open("sale");
  await flush();
  state.clock.advance(MINDBODY_FALLBACK_DELAY);
  state.doc.activeElement = state.nodes.get("mindbody-retry");
  state.ready();
  assert.equal(state.nodes.get("mindbody-retry").hidden, true);
  assert.equal(state.host.frame.focusCalls, 1);
  state.controller.dispose();
});
