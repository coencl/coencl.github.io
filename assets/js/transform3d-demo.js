(() => {
'use strict';
// ================= 基础工具 =================
const ids = ['rx','ry','rz','tx','ty','tz','sx','sy','sz','k'];
const root = document.getElementById('transform3d-demo');
if (!root || root.dataset.ready) return;
root.dataset.ready = 'true';
const el = id => root.querySelector('#t3d-' + id);
const v  = id => parseFloat(el(id).value);

// 矩阵乘法：A(m×n) · B(n×p)
function matMul(A, B) {
  return A.map((row, i) => B[0].map((_, j) =>
    row.reduce((sum, _, t) => sum + A[i][t] * B[t][j], 0)));
}

// ================= 核心：构造 4×4 齐次变换矩阵 =================
function buildT() {
  const d = Math.PI / 180;
  const a = v('rx') * d, b = v('ry') * d, c = v('rz') * d;

  // 绕 X / Y / Z 轴的基本旋转矩阵（3×3）
  const Rx = [[1, 0, 0],
              [0, Math.cos(a), -Math.sin(a)],
              [0, Math.sin(a),  Math.cos(a)]];
  const Ry = [[ Math.cos(b), 0, Math.sin(b)],
              [0, 1, 0],
              [-Math.sin(b), 0, Math.cos(b)]];
  const Rz = [[Math.cos(c), -Math.sin(c), 0],
              [Math.sin(c),  Math.cos(c), 0],
              [0, 0, 1]];

  // 缩放 + 剪切矩阵（这部分不为单位阵时，变换就不再是刚体）
  const K = [[v('sx'), v('k') * v('sy'), 0],
             [0,       v('sy'),          0],
             [0,       0,          v('sz')]];

  // A = Rz · Ry · Rx · K
  // 作用在点上时从右往左生效：先缩放/剪切，再依次绕 X、Y、Z 旋转
  const A = matMul(matMul(matMul(Rz, Ry), Rx), K);
  const t = [v('tx'), v('ty'), v('tz')];

  // 拼成齐次矩阵：[ A  t ]
  //              [ 0  1 ]
  return [
    [A[0][0], A[0][1], A[0][2], t[0]],
    [A[1][0], A[1][1], A[1][2], t[1]],
    [A[2][0], A[2][1], A[2][2], t[2]],
    [0, 0, 0, 1]
  ];
}

// 用齐次矩阵变换一个点：(x,y,z) → 补成 (x,y,z,1) → T·p
// 最后一行是 0 0 0 1，所以 w 恒为 1，不需要做除法
function applyT(T, p) {
  return [0, 1, 2].map(i => T[i][0]*p[0] + T[i][1]*p[1] + T[i][2]*p[2] + T[i][3]);
}

// ================= 绘图：把三维点投到屏幕 =================
// 这里只是为了"看"，用简单的正交投影；视角由 az(方位角)、elv(俯仰角) 控制
let az = -0.6, elv = 0.45;
let scale = 62;
const CENTER = 200;
function project(p) {
  const ca = Math.cos(az), sa = Math.sin(az);
  const x1 = p[0]*ca - p[1]*sa;
  const y1 = p[0]*sa + p[1]*ca;
  const sy = p[2]*Math.cos(elv) + y1*Math.sin(elv);
  return [CENTER + x1*scale, CENTER - sy*scale];
}
function line(a, b, color, w, dashed) {
  const A = project(a), B = project(b);
  return `<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}"
          stroke="${color}" stroke-width="${w}" ${dashed ? 'stroke-dasharray="4 4"' : ''} stroke-linecap="round"/>`;
}
function label(p, s, color) {
  const A = project(p);
  return `<text x="${A[0]+4}" y="${A[1]-4}" font-size="13" fill="${color}">${s}</text>`;
}

// 立方体的 8 个顶点与 12 条棱
const h = 0.6, V = [];
for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) V.push([x, y, z]);
const E = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
  let diff = 0;
  for (let t = 0; t < 3; t++) if (V[i][t] !== V[j][t]) diff++;
  if (diff === 1) E.push([i, j]);
}

const COL_X = '#E24B4A', COL_Y = '#639922', COL_Z = '#378ADD', COL_OBJ = 'var(--t3d-object)';

function pill(ok, txt) {
  return `<span class="t3d-pill" data-kept="${ok}">${ok?'保持':'不保持'}${txt}</span>`;
}

// ================= 刷新界面 =================
function update() {
  ids.forEach(id => {
    const x = v(id);
    const formatted = id[0] === 'r' ? x + '°' : x.toFixed(2);
    el(id + '-o').textContent = formatted;
    el(id).setAttribute('aria-valuetext', formatted);
  });

  const T = buildT();
  const O = [0, 0, 0], L = 2.3;
  // Fit all geometry without clipping at extreme slider values or camera angles.
  scale = 1;
  const points = [...V, ...V.map(p => applyT(T, p)), O, [L,0,0], [0,L,0], [0,0,L],
    ...[O, [1,0,0], [0,1,0], [0,0,1]].map(p => applyT(T, p))];
  const extent = Math.max(1, ...points.flatMap(p => project(p).map(q => Math.abs(q - CENTER))));
  scale = Math.min(62, 168 / extent);
  let s = '';

  // 世界坐标系（灰色虚线）
  s += line(O, [L,0,0], 'var(--t3d-muted)', 1, true) + line(O, [0,L,0], 'var(--t3d-muted)', 1, true) + line(O, [0,0,L], 'var(--t3d-muted)', 1, true);
  s += label([L,0,0], 'X', 'var(--t3d-sub)') + label([0,L,0], 'Y', 'var(--t3d-sub)') + label([0,0,L], 'Z', 'var(--t3d-sub)');

  // 原始立方体（灰色虚线）
  E.forEach(e => s += line(V[e[0]], V[e[1]], 'var(--t3d-muted)', 1, true));

  // 变换后的立方体（紫色）
  const W = V.map(p => applyT(T, p));
  E.forEach(e => s += line(W[e[0]], W[e[1]], COL_OBJ, 1.8, false));

  // 物体自身坐标轴：注意它们正是矩阵 T 左上 3×3 的三列
  const o2 = applyT(T, O);
  s += line(o2, applyT(T, [1,0,0]), COL_X, 3) + line(o2, applyT(T, [0,1,0]), COL_Y, 3) + line(o2, applyT(T, [0,0,1]), COL_Z, 3);
  s += label(applyT(T, [1,0,0]), 'x', COL_X) + label(applyT(T, [0,1,0]), 'y', COL_Y) + label(applyT(T, [0,0,1]), 'z', COL_Z);
  el('g').innerHTML = s;

  // 显示矩阵
  el('mat').innerHTML = T.map(r => '<tr>' + r.map(z =>
    `<td>${(Math.abs(z) < 0.005 ? 0 : z).toFixed(2)}</td>`).join('') + '</tr>').join('');

  // 判断变换类型
  const eps = 1e-9;
  const noShear  = Math.abs(v('k')) < eps;
  const unitScl  = [v('sx'), v('sy'), v('sz')].every(q => Math.abs(q - 1) < eps);
  const sameScl  = Math.abs(v('sx') - v('sy')) < eps && Math.abs(v('sy') - v('sz')) < eps;
  let kind, keepLen, keepAng;
  if (noShear && unitScl)      { kind = '刚体变换'; keepLen = keepAng = true; }
  else if (noShear && sameScl) { kind = '相似变换'; keepLen = false; keepAng = true; }
  else                         { kind = '仿射变换'; keepLen = keepAng = false; }
  el('kind').textContent = kind;
  el('props').innerHTML = pill(keepLen, '长度') + pill(keepAng, '角度') + pill(true, '平行') + pill(true, '直线');
}

// ================= 交互 =================
function setParams(o) {
  ids.forEach(id => { el(id).value = o[id] !== undefined ? o[id] : (id[0] === 's' ? 1 : 0); });
  update();
}
ids.forEach(id => el(id).addEventListener('input', update));
el('b-reset').onclick = () => { az = -0.6; elv = 0.45; setParams({}); };
el('b-view').onclick = () => { az = -0.6; elv = 0.45; update(); };
el('b-sim').onclick = () => setParams({ rz: 20, sx: 1.4, sy: 1.4, sz: 1.4 });
el('b-rig').onclick   = () => setParams({ rx: 20, ry: -15, rz: 35, tx: 0.8, ty: -0.5, tz: 0.6 });
el('b-aff').onclick   = () => setParams({ rz: 20, sx: 1.5, sy: 0.8, sz: 1.2, k: 0.6 });

// 拖动旋转视角
const cv = el('cv');
let drag = null;
cv.addEventListener('pointerdown', e => {
  if (!e.isPrimary || e.button !== 0) return;
  drag = [e.clientX, e.clientY];
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', e => {
  if (!drag) return;
  az  -= (e.clientX - drag[0]) * 0.01;
  elv  = Math.max(-1.4, Math.min(1.4, elv + (e.clientY - drag[1]) * 0.01));
  drag = [e.clientX, e.clientY];
  update();
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(event => {
  cv.addEventListener(event, () => { drag = null; });
});
cv.addEventListener('keydown', e => {
  const steps = { ArrowLeft: [0.08, 0], ArrowRight: [-0.08, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] };
  if (!steps[e.key]) return;
  e.preventDefault();
  az += steps[e.key][0];
  elv = Math.max(-1.4, Math.min(1.4, elv + steps[e.key][1]));
  update();
});

update();
el('loading').hidden = true;
})();
