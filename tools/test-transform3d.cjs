// Run with: node tools/test-transform3d.cjs
// Tests the real interaction script in a minimal DOM; no browser dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootDir = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, '_includes/transform3d-demo.html'), 'utf8');
const source = fs.readFileSync(path.join(rootDir, 'assets/js/transform3d-demo.js'), 'utf8');
const elements = new Map();
for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
  assert.ok(!elements.has(match[1]), `Duplicate ID: ${match[1]}`);
  elements.set(match[1], {
    value: '', textContent: '', innerHTML: '', hidden: false, dataset: {}, events: {}, attributes: {},
    addEventListener(type, handler) { this.events[type] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; },
    setPointerCapture() {}
  });
}
for (const match of html.matchAll(/<input\b[^>]*id="([^"]+)"[^>]*value="([^"]+)"/g)) {
  elements.get(match[1]).value = match[2];
}
for (const match of html.matchAll(/<label\b[^>]*for="([^"]+)"/g)) {
  assert.ok(elements.has(match[1]), `Missing labelled control: ${match[1]}`);
}
const element = id => elements.get('t3d-' + id);
const root = elements.get('transform3d-demo');
root.querySelector = selector => elements.get(selector.slice(1));
const context = vm.createContext({ document: { getElementById: id => elements.get(id) } });
// Expose math only inside this isolated test context, without adding a public API.
vm.runInContext(source.replace(/\}\)\(\);\s*$/, '\nglobalThis.testAPI = { buildT, applyT, setParams, project, V, E };\n})();'), context);
const api = context.testAPI;
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const vector = (actual, expected) => expected.forEach((value, i) => close(actual[i], value));
const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));
const click = id => element(id).onclick();

// Identity and translation, including live slider output.
vector(api.applyT(api.buildT(), [2, -3, 4]), [2, -3, 4]);
assert.equal(element('kind').textContent, '刚体变换');
assert.equal(element('loading').hidden, true);
assert.equal(api.V.length, 8);
assert.equal(api.E.length, 12);
element('tx').value = '1.2';
element('tx').events.input();
vector(api.applyT(api.buildT(), [2, -3, 4]), [3.2, -3, 4]);
assert.equal(element('tx-o').textContent, '1.20');
assert.equal(element('tx').attributes['aria-valuetext'], '1.20');

// Known rotation and ordering: X then Y takes the Y unit vector to X.
api.setParams({ rz: 90 });
vector(api.applyT(api.buildT(), [1, 0, 0]), [0, 1, 0]);
api.setParams({ rx: 90, ry: 90 });
vector(api.applyT(api.buildT(), [0, 1, 0]), [1, 0, 0]);

// Scale, shear and translation: (1,2,3) -> (2,6,12) -> (5,6,12) -> (6,4,15).
api.setParams({ sx: 2, sy: 3, sz: 4, k: .5, tx: 1, ty: -2, tz: 3 });
vector(api.applyT(api.buildT(), [1, 2, 3]), [6, 4, 15]);

// Presets classify correctly and preserve the promised geometric properties.
click('b-rig');
assert.equal(element('kind').textContent, '刚体变换');
for (const [a, b] of api.E) {
  close(distance(api.applyT(api.buildT(), api.V[a]), api.applyT(api.buildT(), api.V[b])), 1.2);
}
click('b-sim');
assert.equal(element('kind').textContent, '相似变换');
close(distance(api.applyT(api.buildT(), api.V[0]), api.applyT(api.buildT(), api.V[1])), 1.68);
assert.match(element('props').innerHTML, /data-kept="true">保持角度/);
click('b-aff');
assert.equal(element('kind').textContent, '仿射变换');
assert.match(element('props').innerHTML, /data-kept="false">不保持角度/);

// Camera controls never change the transform. Pointer cancellation ends a drag.
const matrixBefore = JSON.stringify(api.buildT());
const sceneBefore = element('g').innerHTML;
element('cv').events.keydown({ key: 'ArrowLeft', preventDefault() {} });
assert.equal(JSON.stringify(api.buildT()), matrixBefore);
assert.notEqual(element('g').innerHTML, sceneBefore);
click('b-view');
assert.equal(element('g').innerHTML, sceneBefore);
element('cv').events.pointerdown({ isPrimary: true, button: 0, pointerId: 1, clientX: 0, clientY: 0 });
element('cv').events.pointermove({ clientX: 30, clientY: 20 });
assert.equal(JSON.stringify(api.buildT()), matrixBefore);
element('cv').events.pointercancel();
const cancelledScene = element('g').innerHTML;
element('cv').events.pointermove({ clientX: 80, clientY: 60 });
assert.equal(element('g').innerHTML, cancelledScene);

// Extreme slider settings and camera angles stay inside the SVG viewBox.
for (const sign of [-1, 1]) {
  api.setParams({ rx: 137, ry: -89, rz: 173, tx: sign * 2, ty: sign * 2, tz: sign * 2, sx: 2, sy: 2, sz: 2, k: sign });
  for (let i = 0; i < 40; i++) {
    element('cv').events.keydown({ key: i % 2 ? 'ArrowUp' : 'ArrowRight', preventDefault() {} });
    for (const vertex of api.V) {
      for (const coordinate of api.project(api.applyT(api.buildT(), vertex))) {
        assert.ok(coordinate >= 32 - 1e-9 && coordinate <= 368 + 1e-9);
      }
    }
  }
}
click('b-reset');
vector(api.applyT(api.buildT(), [1, 2, 3]), [1, 2, 3]);
assert.equal(element('kind').textContent, '刚体变换');
assert.ok(!html.includes('iframe') && !html.includes('transform3d_demo.html'));
assert.ok(!html.includes('??'));
console.log('PASS: transforms, classification, controls, camera cancellation, reset, bounds and markup.');
