import assert from "node:assert/strict";
import test from "node:test";
import { getIntroScrollTop } from "../src/intro-scroll.ts";

test("desktop offer links stop before the scrolling layer covers the cards", () => {
  assert.equal(getIntroScrollTop(321, 776, 720), 56);
  assert.equal(getIntroScrollTop(418, 960, 960), 0);
});

test("long phone layouts reveal the selected card without jumping to the page top", () => {
  assert.equal(getIntroScrollTop(320, 1972, 640), 288);
  assert.equal(getIntroScrollTop(1760, 1972, 640), 1332);
});

test("short intros and controls near the top never request negative scroll positions", () => {
  assert.equal(getIntroScrollTop(120, 600, 960), 0);
  assert.equal(getIntroScrollTop(20, 1972, 640), 0);
});
