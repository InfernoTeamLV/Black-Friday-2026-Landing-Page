import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { bindPackageDialogs } from "../src/package-dialogs.ts";
import { getCheckoutRoute } from "../src/mindbody-checkout.ts";

class FakeDialog extends EventTarget {
  constructor(id) {
    super();
    this.id = id;
    this.open = false;
    this.showCount = 0;
  }
  showModal() {
    assert.equal(this.open, false, "An open dialog must not be reopened.");
    this.open = true;
    this.showCount++;
  }
  close() {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  }
  getBoundingClientRect() {
    return { left: 100, top: 100, right: 500, bottom: 600 };
  }
}

class FakeButton extends EventTarget {
  constructor(id) {
    super();
    this.dataset = { packageDialog: id };
  }
  click() {
    this.dispatchEvent(new Event("click"));
  }
}

function fixture(
  ids = [
    "annual-current-package-details",
    "annual-new-package-details",
    "coaching-package-details",
    "fire-pass-package-details",
    "mindbody-checkout"
  ]
) {
  const classes = new Set();
  const root = {
    classList: {
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
      remove(name) {
        classes.delete(name);
      }
    }
  };
  const dialogs = ids.map((id) => new FakeDialog(id));
  const buttons = ids.map((id) => new FakeButton(id));
  const cleanup = bindPackageDialogs(buttons, dialogs, root);
  return {
    dialogs,
    buttons,
    root,
    cleanup,
    locked: () => classes.has("package-dialog-open")
  };
}

function pointer(dialog, type, x, y) {
  const event = new Event(type);
  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y }
  });
  dialog.dispatchEvent(event);
}

test("each service opens its matching package and closing releases scroll", () => {
  const state = fixture();
  for (const [index, button] of state.buttons.entries()) {
    button.click();
    assert.equal(state.dialogs[index].open, true);
    assert.equal(state.dialogs.filter((dialog) => dialog.open).length, 1);
    assert.equal(state.locked(), true);
    state.dialogs[index].close();
    assert.equal(state.locked(), false);
  }
  state.cleanup();
});

test("unrecognized package targets cannot open a dialog or lock the page", () => {
  const state = fixture();
  state.buttons[0].dataset.packageDialog = "unrecognized";
  state.buttons[0].click();
  assert.equal(
    state.dialogs.some((dialog) => dialog.open),
    false
  );
  assert.equal(state.locked(), false);
  state.cleanup();
});

test("repeated activation does not reopen an already open dialog", () => {
  const state = fixture();
  state.buttons[0].click();
  state.buttons[0].click();
  assert.equal(state.dialogs[0].showCount, 1);
  state.cleanup();
});

test("reopening long details resets scroll while repeated activation preserves it", () => {
  const state = fixture();
  const dialog = state.dialogs[0];
  state.buttons[0].click();
  dialog.scrollTop = 640;
  dialog.scrollLeft = 8;
  state.buttons[0].click();
  assert.equal(dialog.scrollTop, 640);
  assert.equal(dialog.scrollLeft, 8);
  dialog.close();
  state.buttons[0].click();
  assert.equal(dialog.scrollTop, 0);
  assert.equal(dialog.scrollLeft, 0);
  state.cleanup();
});

test("scroll stays locked until the final package dialog closes", () => {
  const state = fixture();
  state.buttons[0].click();
  state.buttons[1].click();
  state.dialogs[0].close();
  assert.equal(state.locked(), true);
  state.dialogs[1].close();
  assert.equal(state.locked(), false);
  state.cleanup();
});

test("backdrop clicks dismiss, while clicks within the dialog bounds do not", () => {
  const state = fixture();
  state.buttons[0].click();
  pointer(state.dialogs[0], "pointerdown", 110, 110);
  pointer(state.dialogs[0], "click", 110, 110);
  assert.equal(state.dialogs[0].open, true);
  pointer(state.dialogs[0], "pointerdown", 20, 20);
  pointer(state.dialogs[0], "click", 20, 20);
  assert.equal(state.dialogs[0].open, false);
  assert.equal(state.locked(), false);
  state.cleanup();
});

test("dragging from inside the dialog onto the backdrop does not dismiss it", () => {
  const state = fixture();
  state.buttons[0].click();
  pointer(state.dialogs[0], "pointerdown", 150, 150);
  pointer(state.dialogs[0], "click", 20, 20);
  assert.equal(state.dialogs[0].open, true);
  state.cleanup();
});

test("cleanup closes dialogs, unlocks scrolling and removes trigger listeners", () => {
  const state = fixture();
  state.buttons[0].click();
  state.cleanup();
  assert.equal(
    state.dialogs.some((dialog) => dialog.open),
    false
  );
  assert.equal(state.locked(), false);
  state.buttons[0].click();
  assert.equal(state.dialogs[0].open, false);
});

test("modified links keep browser navigation; ordinary links open the popup", () => {
  const state = fixture(["mindbody-checkout"]);
  const link = state.buttons[0];
  link.tagName = "A";
  const modified = new Event("click", { cancelable: true });
  Object.defineProperty(modified, "ctrlKey", { value: true });
  link.dispatchEvent(modified);
  assert.equal(modified.defaultPrevented, false);
  assert.equal(state.dialogs[0].open, false);
  const ordinary = new Event("click", { cancelable: true });
  link.dispatchEvent(ordinary);
  assert.equal(ordinary.defaultPrevented, true);
  assert.equal(state.dialogs[0].open, true);
  state.cleanup();
});
test("opening checkout from another dialog closes the previous dialog", () => {
  const state = fixture(["coaching-package-details", "mindbody-checkout"]);
  state.buttons[0].click();
  state.buttons[1].closest = () => state.dialogs[0];
  state.buttons[1].click();
  assert.equal(state.dialogs[0].open, false);
  assert.equal(state.dialogs[1].open, true);
  assert.equal(state.locked(), true);
  state.cleanup();
});
test("the coaching CTA opens its assigned Mindbody checkout on the first click", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const controls = [
    ...html.matchAll(/<button\b[^>]*\bdata-checkout-route="coaching"[^>]*>/g)
  ];
  assert.equal(controls.length, 1);
  const markup = controls[0][0];
  const button = new FakeButton(markup.match(/data-package-dialog="([^"]+)"/)[1]);
  button.dataset.checkoutRoute = markup.match(/data-checkout-route="([^"]+)"/)[1];
  const dialog = new FakeDialog("mindbody-checkout");
  const opened = [];
  const cleanup = bindPackageDialogs(
    [button],
    [dialog],
    { classList: { toggle() {}, remove() {} } },
    (surface, trigger) =>
      opened.push([
        surface.id,
        getCheckoutRoute(trigger.dataset.checkoutRoute)?.widgetId
      ])
  );
  button.click();
  assert.equal(dialog.open, true);
  assert.equal(dialog.showCount, 1);
  assert.deepEqual(opened, [["mindbody-checkout", "c5685722c8"]]);
  cleanup();
});

test("the route callback receives the actual triggering element", () => {
  const dialog = new FakeDialog("mindbody-checkout");
  const button = new FakeButton(dialog.id);
  const observed = [];
  const cleanup = bindPackageDialogs(
    [button],
    [dialog],
    { classList: { toggle() {}, remove() {} } },
    (surface, trigger) => observed.push([surface.id, trigger])
  );
  button.click();
  assert.deepEqual(observed, [[dialog.id, button]]);
  cleanup();
});
