
/* QA Quest 3D avatar: Roblox-style blocky character + gear (uses three.js r128) */
(function () {
var ok = false; try { var c0 = document.createElement('canvas'); ok = !!(window.THREE && (c0.getContext('webgl') || c0.getContext('experimental-webgl'))); } catch (e) {}
if (!ok) { window.QA3D = { ok: false }; return; }
/* ===== QA Quest 3D avatar (Roblox-style blocky character) — core ===== */
const T = THREE;
const SKIN = '#FFD9C2';
const HY = 2.37, HR = 0.34, HH = 0.64, HB = 0.13;   // head: centre height, radius, height, bevel
const HEAD_TOP = HY + HH / 2;
const tau = Math.PI * 2;

// ---------- small helpers ----------
const MC = new Map();
function mat(c, o) {
  const key = String(c) + (o ? JSON.stringify(o) : '');
  let m = MC.get(key);
  if (!m) { m = new T.MeshStandardMaterial(Object.assign({ color: new T.Color(c), roughness: 0.62, metalness: 0 }, o || {})); MC.set(key, m); }
  return m;
}
const metal = (c, rough) => mat(c, { roughness: rough == null ? 0.32 : rough, metalness: 0.25 });
const glow = (c, i) => mat(c, { emissive: new T.Color(c), emissiveIntensity: i == null ? 0.8 : i, roughness: 0.4 });
const glass = (c, op) => mat(c, { transparent: true, opacity: op == null ? 0.45 : op, roughness: 0.08, metalness: 0.1, depthWrite: false });
const TC = new Map();
function cvs(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
function tex(key, w, h, draw) {
  let t = TC.get(key);
  if (!t) { t = new T.CanvasTexture(cvs(w, h, draw)); t.anisotropy = 4; TC.set(key, t); }
  return t;
}
const tmat = (key, w, h, draw, o) => { const k = 'T:' + key + (o ? JSON.stringify(o) : ''); let m = MC.get(k); if (!m) { m = new T.MeshStandardMaterial(Object.assign({ map: tex(key, w, h, draw), roughness: 0.62 }, o || {})); MC.set(k, m); } return m; };
const GC = new Map();
const G = (key, make) => { let g = GC.get(key); if (!g) { g = make(); GC.set(key, g); } return g; };

function shade(hex, amt) {
  const c = new T.Color(hex), hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)));
  return '#' + c.getHexString();
}
// rounded block with true rounded normals
function rbox(w, h, d, r, seg) {
  return G(['rb', w, h, d, r, seg].join(), () => {
    seg = seg || 8;
    const g = new T.BoxGeometry(w, h, d, seg, seg, seg);
    const p = g.attributes.position, n = g.attributes.normal, v = new T.Vector3(), inner = new T.Vector3();
    const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
    for (let i = 0; i < p.count; i++) {
      v.set(p.getX(i), p.getY(i), p.getZ(i));
      inner.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
      v.sub(inner); if (v.lengthSq() < 1e-12) v.set(0, 0, 1); v.normalize();
      n.setXYZ(i, v.x, v.y, v.z);
      v.multiplyScalar(r).add(inner);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    return g;
  });
}
const sph = (r, ws, hs) => G(['s', r, ws, hs].join(), () => new T.SphereGeometry(r, ws || 24, hs || 16));
const cyl = (rt, rb, h, s, open) => G(['c', rt, rb, h, s, open].join(), () => new T.CylinderGeometry(rt, rb, h, s || 24, 1, !!open));
const tor = (r, t, rs, ts, arc) => G(['t', r, t, rs, ts, arc].join(), () => new T.TorusGeometry(r, t, rs || 10, ts || 28, arc || tau));
const cone = (r, h, s) => G(['k', r, h, s].join(), () => new T.ConeGeometry(r, h, s || 20));
function lathe(key, pts, segs) { return G('l' + key, () => new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), segs || 40)); }
function tube(key, pts, r0, r1, segs, rad) {
  return G('tb' + key, () => {
    const curve = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2])));
    const tub = segs || 16, rd = rad || 10;
    const geo = new T.TubeGeometry(curve, tub, 1, rd, false);
    const pos = geo.attributes.position;
    for (let i = 0; i <= tub; i++) {
      const t = i / tub, c = curve.getPointAt(t), r = r0 + (r1 - r0) * Math.pow(t, 1.3);
      for (let j = 0; j <= rd; j++) {
        const k = i * (rd + 1) + j;
        const v = new T.Vector3(pos.getX(k), pos.getY(k), pos.getZ(k)).sub(c).multiplyScalar(r).add(c);
        pos.setXYZ(k, v.x, v.y, v.z);
      }
    }
    geo.computeVertexNormals();
    return geo;
  });
}
function extrude(key, shapeFn, depth, bevel) {
  return G('ex' + key, () => {
    const s = new T.Shape(); shapeFn(s);
    const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: bevel !== 0, bevelThickness: bevel || 0.015, bevelSize: bevel || 0.015, bevelSegments: 3, curveSegments: 18 });
    g.translate(0, 0, -depth / 2); g.computeVertexNormals();
    return g;
  });
}
function P(geo, m, x, y, z, parent, rx, ry, rz, sx, sy, sz) {
  const o = new T.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0);
  if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0);
  if (sx != null) o.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz);
  if (parent) parent.add(o);
  return o;
}
function grp(parent, x, y, z, rx, ry, rz) { const g = new T.Group(); g.position.set(x || 0, y || 0, z || 0); g.rotation.set(rx || 0, ry || 0, rz || 0); if (parent) parent.add(g); return g; }
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

// ---------- head ----------
const HEAD_PROF = (() => {
  const p = [[0, -HH / 2]];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i / 8 * Math.PI / 2; p.push([HR - HB + Math.cos(a) * HB, -HH / 2 + HB + Math.sin(a) * HB]); }
  for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; p.push([HR - HB + Math.cos(a) * HB, HH / 2 - HB + Math.sin(a) * HB]); }
  p.push([0, HH / 2]); return p;
})();
// point on the head surface (head-local), azimuth a (0 = front/+z), height y, pushed out by d
function hp(a, y, d) {
  let R = HR; const top = HH / 2 - HB, bot = -HH / 2 + HB;
  if (y > top) R = HR - HB + Math.sqrt(Math.max(0, HB * HB - (y - top) * (y - top)));
  if (y < bot) R = HR - HB + Math.sqrt(Math.max(0, HB * HB - (y - bot) * (y - bot)));
  return [Math.sin(a) * (R + d), y, Math.cos(a) * (R + d)];
}
const FH = HH - 2 * HB, FW = Math.PI * (HR + 0.002);
function faceTex(kind) {
  return tex('face:' + kind, 1024, Math.round(1024 * FH / FW), (g, w, h) => {
    if (kind.startsWith('sensei')) { senseiFace(g, w, h, kind.slice(7)); return; }
    const ppu = w / FW, X = u => w / 2 + u * ppu, Y = v => (FH / 2 - v) * ppu, S = v => v * ppu;
    g.lineCap = 'round';
    [-1, 1].forEach(s => {
      const ex = X(s * 0.105), ey = Y(0.035);
      if (kind === 'sharingan') {
        g.fillStyle = '#C1121F'; g.beginPath(); g.ellipse(ex, ey, S(0.04), S(0.058), 0, 0, tau); g.fill();
        g.strokeStyle = '#3b0508'; g.lineWidth = S(0.006); g.stroke();
        g.beginPath(); g.ellipse(ex, ey, S(0.022), S(0.032), 0, 0, tau); g.strokeStyle = 'rgba(40,0,0,.6)'; g.lineWidth = S(0.004); g.stroke();
        g.fillStyle = '#14060a'; g.beginPath(); g.ellipse(ex, ey, S(0.011), S(0.015), 0, 0, tau); g.fill();
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + i * tau / 3, tx = ex + Math.cos(a) * S(0.022), ty = ey + Math.sin(a) * S(0.032);
          g.beginPath(); g.arc(tx, ty, S(0.008), 0, tau); g.fill();
          g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a + 1.4) * S(0.02), ty + Math.sin(a + 1.4) * S(0.02), tx + Math.cos(a + 2) * S(0.02), ty + Math.sin(a + 2) * S(0.024));
          g.lineWidth = S(0.005); g.strokeStyle = '#14060a'; g.stroke();
        }
      } else if (kind === 'byakugan') {
        g.fillStyle = '#EDE9FE'; g.beginPath(); g.ellipse(ex, ey, S(0.04), S(0.058), 0, 0, tau); g.fill();
        g.strokeStyle = '#A78BFA'; g.lineWidth = S(0.006); g.stroke();
        g.fillStyle = 'rgba(167,139,250,.35)'; g.beginPath(); g.ellipse(ex, ey + S(0.006), S(0.024), S(0.034), 0, 0, tau); g.fill();
        g.strokeStyle = 'rgba(124,58,237,.55)'; g.lineWidth = S(0.004);
        for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(X(s * 0.155), Y(0.04 - i * 0.02)); g.quadraticCurveTo(X(s * 0.18), Y(0.05 - i * 0.025), X(s * 0.2), Y(0.06 - i * 0.035)); g.stroke(); }
      } else {
        g.fillStyle = '#1d1533'; g.beginPath(); g.ellipse(ex, ey, S(0.036), S(0.056), 0, 0, tau); g.fill();
      }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(s * 0.105 - 0.012), Y(0.058), S(0.013), 0, tau); g.fill();
      g.beginPath(); g.arc(X(s * 0.105 + 0.012), Y(0.012), S(0.006), 0, tau); g.fill();
      g.fillStyle = 'rgba(255,150,180,.55)'; g.beginPath(); g.ellipse(X(s * 0.17), Y(-0.045), S(0.04), S(0.022), 0, 0, tau); g.fill();
    });
    g.strokeStyle = '#1d1533'; g.lineWidth = S(0.014);
    g.beginPath(); g.moveTo(X(-0.06), Y(-0.07)); g.quadraticCurveTo(X(0), Y(-0.125), X(0.06), Y(-0.07)); g.stroke();
  });
}
function buildHead(rig, spec) {
  const headG = grp(rig, 0, HY, 0);
  const head = P(lathe('head', HEAD_PROF, 56), mat(SKIN), 0, 0, 0, headG); head.userData.region = 'head';
  const fk = spec.faceKind || (spec.face && (spec.face.kind === 'sharingan' || spec.face.kind === 'byakugan') ? spec.face.kind : 'plain');
  if (!MC.has('fm:' + fk)) MC.set('fm:' + fk, new T.MeshStandardMaterial({ map: faceTex(fk), transparent: true, roughness: 0.62, depthWrite: false }));
  const f = P(G('facecyl', () => new T.CylinderGeometry(HR + 0.002, HR + 0.002, FH, 64, 1, true, -Math.PI / 2, Math.PI)),
    MC.get('fm:' + fk), 0, 0, 0, headG);
  f.renderOrder = 1; f.userData.region = 'head';
  return headG;
}

// ---------- hair: chunky shaggy accessory ----------
let HAIR_PARTS = null;
function hairParts() {
  if (HAIR_PARTS) return HAIR_PARTS;
  seed = 11;
  const parts = [];
  const capProf = HEAD_PROF.map(v => [v[0] * 1.1, v[1]]);
  parts.push({ geo: lathe('hcap', capProf.filter(v => v[1] > HH / 2 - 0.09 || v[0] === 0), 48), y: 0.06, top: 0, dark: 0 });
  parts.push({ geo: G('hback', () => new T.LatheGeometry(capProf.map(p => new T.Vector2(p[0], p[1])), 48, Math.PI * 0.62, Math.PI * 0.76)), y: -0.01, top: 0, dark: 0 });
  let n = 0;
  function clump(a, endY, thick, out, top) {
    const aa = a + (rnd() - 0.5) * 0.25;
    const pts = [hp(a, HH / 2 + 0.03, 0.0), hp(a, (HH / 2 + endY) / 2 + 0.06, 0.05), hp(aa, endY + 0.05, 0.05), hp(aa + (rnd() - 0.5) * 0.3, endY - 0.02, 0.05 + out)];
    parts.push({ geo: tube('hair' + (n++), pts, thick, 0.01), y: 0, top, dark: rnd() < 0.5 ? 1 : 0 });
  }
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * tau + (rnd() - 0.5) * 0.1, front = Math.cos(a);
    const endY = front > 0.6 ? 0.12 + rnd() * 0.07 : front > -0.1 ? -0.12 - rnd() * 0.2 : -0.24 - rnd() * 0.12;
    clump(a, endY, 0.085 + rnd() * 0.03, front > 0.6 ? 0.02 : 0.07 + rnd() * 0.06, 0);
  }
  for (let i = 0; i < 14; i++) { const a = i / 14 * tau + 0.2; clump(a, Math.cos(a) > 0.6 ? 0.2 : 0.02 + rnd() * 0.1, 0.075, 0.05, 1); }
  [[-0.12, 0.05], [0.08, -0.1], [0.16, 0.12]].forEach(([x, z], i) => parts.push({ geo: tube('tuft' + i, [[x, HH / 2 + 0.06, z], [x * 1.4, HH / 2 + 0.17, z * 1.3], [x * 1.9 + 0.05, HH / 2 + 0.2, z * 1.6]], 0.06, 0.008, 10), y: 0, top: 2, dark: 0 }));
  return (HAIR_PARTS = parts);
}
function buildHair(headG, color, hatLevel) {
  const g = grp(headG); g.userData.region = 'head';
  const A = mat(color), B = mat(shade(color, -0.12));
  hairParts().forEach(p => {
    if (hatLevel >= 2 && p.top) return;      // full hat: hide top layer and tufts
    if (hatLevel === 1 && p.top === 2) return; // small hat: hide tufts only
    const m = P(p.geo, p.dark ? B : A, 0, p.y, 0, g); m.userData.region = 'head';
  });
  return g;
}
/* ===== body, clothing textures, legs, feet ===== */
const TORSO_Y = 1.5, ARM_X = 0.745, SHOULDER_Y = 1.98, LEG_X = 0.25;

// ---- shirt painting ----
function vshade(g, w, h, amt) { // soft cloth shading: lighter centre, darker edges/bottom
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, `rgba(0,0,0,${amt})`); gr.addColorStop(0.18, 'rgba(0,0,0,0)'); gr.addColorStop(0.82, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${amt})`);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const gv = g.createLinearGradient(0, 0, 0, h); gv.addColorStop(0, 'rgba(255,255,255,.06)'); gv.addColorStop(1, `rgba(0,0,0,${amt * 0.8})`);
  g.fillStyle = gv; g.fillRect(0, 0, w, h);
}
function tieDye(g, w, h, cx, cy) {
  const cols = ['#FF4FA3', '#FF8A3D', '#FFE14D', '#3DDC84', '#3FA9FF', '#B15CFF'];
  const R = Math.hypot(w, h);
  for (let r = R, i = 0; r > 0; r -= R / 16, i++) {
    g.beginPath(); g.fillStyle = cols[i % 6];
    for (let a = 0; a <= tau + 0.01; a += 0.05) { const rr = r * (1 + 0.08 * Math.sin(a * 5 + r * 0.05)); const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; a ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.fill();
  }
}
function badge(g, x, y, size, emoji) {
  g.font = `${size}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(emoji, x, y);
}
function ribbing(g, x, y, w, h, col, dark) {
  g.fillStyle = col; g.fillRect(x, y, w, h); g.strokeStyle = dark; g.lineWidth = 2;
  for (let i = x + 4; i < x + w; i += 7) { g.beginPath(); g.moveTo(i, y + 2); g.lineTo(i, y + h - 2); g.stroke(); }
}
const BODY = {
  _sensei: { col: '#2E5E4E', trim: '#F2E8D5', sleeve: 'wide', belt: '#8B5A2B', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .18);
    if (f === 'front') { g.fillStyle = this.trim; g.beginPath(); g.moveTo(w * .26, 0); g.lineTo(w * .4, 0); g.lineTo(w * .56, h * .62); g.lineTo(w * .46, h * .62); g.closePath(); g.fill(); g.beginPath(); g.moveTo(w * .74, 0); g.lineTo(w * .6, 0); g.lineTo(w * .5, h * .4); g.lineTo(w * .56, h * .5); g.closePath(); g.fill(); }
    if (f === 'back') { g.fillStyle = this.trim; g.fillRect(w * .3, 0, w * .4, 16); }
    if (f === 'sleeve') { g.fillStyle = this.trim; g.fillRect(0, h - 28, w, 14); }
  } },
  _default: { col: '#B9A6F5', sleeve: 'none', paint(g, w, h, f) { // underwear: sports top
    g.fillStyle = SKIN; g.fillRect(0, 0, w, h); vshade(g, w, h, .06);
    if (f === 'sleeve') return;
    const top = h * .1, bot = h * .42, U = '#B9A6F5';
    g.fillStyle = U;
    if (f === 'side') g.fillRect(0, top, w, bot - top);
    else {
      g.beginPath(); g.moveTo(0, top + 18); g.quadraticCurveTo(w / 2, top - (f === 'front' ? -14 : 10), w, top + 18); g.lineTo(w, bot); g.lineTo(0, bot); g.closePath(); g.fill();
      g.fillRect(w * .22, 0, 22, top + 20); g.fillRect(w * .78 - 22, 0, 22, top + 20);
    }
    g.fillStyle = '#F5F3FF'; g.fillRect(0, bot - 14, w, 14);
    if (f === 'front') { g.strokeStyle = 'rgba(91,63,168,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, top + 30); g.lineTo(w / 2, bot - 18); g.stroke(); }
  } },
  _tunic: { col: '#24305E', sleeve: 'long', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .18);
    if (f === 'front') { g.strokeStyle = '#39FF14'; g.lineWidth = 12; g.lineJoin = 'round'; g.beginPath(); g.moveTo(w * .32, 0); g.lineTo(w / 2, h * .24); g.lineTo(w * .68, 0); g.stroke(); }
    if (f !== 'sleeve') { g.fillStyle = '#39FF14'; g.fillRect(0, h - 18, w, 12); }
    else { g.fillStyle = '#39FF14'; g.fillRect(0, h * .78, w, 10); }
  } },
  b0: { sleeve: 'short', paint(g, w, h, f) {
    tieDye(g, w, h, f === 'front' ? w * .46 : f === 'back' ? w * .55 : w * .5, f === 'sleeve' ? h * .2 : h * .55);
    vshade(g, w, h, .12);
    if (f === 'front' || f === 'back') { g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 12; g.beginPath(); g.arc(w / 2, -10, f === 'front' ? 64 : 54, .12 * Math.PI, .88 * Math.PI); g.stroke(); }
    if (f === 'sleeve') { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, h * .4 - 8, w, 8); }
  } },
  b1: { col: '#E9EEF6', sleeve: 'short', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .14);
    if (f === 'front' || f === 'back') { g.strokeStyle = '#9AA9C7'; g.lineWidth = 12; g.beginPath(); g.arc(w / 2, -10, 60, .12 * Math.PI, .88 * Math.PI); g.stroke(); }
    if (f === 'front') { g.strokeStyle = '#B9C4D9'; g.lineWidth = 4; g.strokeRect(w * .6, h * .3, 46, 50); }
    if (f === 'sleeve') { g.fillStyle = '#C9D3E5'; g.fillRect(0, h * .4 - 10, w, 10); }
  } },
  b2: { col: '#3BAA4A', trim: '#1F6B2A', sleeve: 'long', hood: true, badge: '👺', paint(g, w, h, f) { paintHoodie.call(this, g, w, h, f); } },
  b3: { col: '#C8323A', trim: '#7E1C22', sleeve: 'long', hood: true, badge: '🙅‍♀️', paint(g, w, h, f) { paintHoodie.call(this, g, w, h, f); } },
  b4: { col: '#F48FB1', trim: '#C2185B', sleeve: 'wide', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .14);
    g.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < 9; i++) { const x = (i * 71 + 23) % w, y = (i * 113 + 41) % h; flower(g, x, y, 9); }
    if (f === 'front') { g.lineWidth = 22; g.strokeStyle = this.trim; g.beginPath(); g.moveTo(w * .3, 0); g.lineTo(w * .62, h * .62); g.stroke(); g.strokeStyle = shade(this.trim, .15); g.beginPath(); g.moveTo(w * .7, 0); g.lineTo(w * .46, h * .42); g.stroke(); }
    if (f !== 'sleeve') { g.fillStyle = this.trim; g.fillRect(0, h * .56, w, h * .2); g.fillStyle = '#FDE68A'; g.fillRect(0, h * .64, w, 8); }
    else { g.fillStyle = this.trim; g.fillRect(0, h - 26, w, 14); }
  } },
  b5: { col: '#F4F4F4', sleeve: 'long3', belt: '#151515', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .16);
    if (f === 'front') { g.lineWidth = 16; g.strokeStyle = '#D9DDE3'; g.beginPath(); g.moveTo(w * .28, 0); g.lineTo(w * .62, h * .7); g.stroke(); g.strokeStyle = '#E8EBEF'; g.beginPath(); g.moveTo(w * .72, 0); g.lineTo(w * .45, h * .5); g.stroke(); }
    if (f === 'sleeve') { g.fillStyle = '#DADDE2'; g.fillRect(0, h * .66 - 10, w, 10); }
  } },
  b6: { col: '#2B3550', vest: '#5E7D3A', sleeve: 'long', paint(g, w, h) { g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .2); } },
  bq2: { col: '#2B3550', vest: '#C9A227', sleeve: 'long', paint(g, w, h) { g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .2); } },
  b7: { col: '#2E7D32', trim: '#C62828', sleeve: 'long', badge: '🐛', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .14);
    const band = (y) => { g.fillStyle = this.trim; g.fillRect(0, y, w, 14); g.fillRect(0, y + 44, w, 14); g.strokeStyle = '#F8FAFC'; g.lineWidth = 5; g.beginPath(); for (let x = -10; x < w + 20; x += 20) { g.lineTo(x, y + 22); g.lineTo(x + 10, y + 36); } g.stroke(); g.fillStyle = '#F8FAFC'; for (let x = 6; x < w; x += 20) { g.beginPath(); g.arc(x, y + 7, 2.5, 0, tau); g.fill(); } };
    if (f === 'sleeve') { band(h * .35); ribbing(g, 0, h * .78, w, 22, shade(this.col, -.08), shade(this.col, -.2)); }
    else { band(h * .38); ribbing(g, 0, h - 26, w, 26, shade(this.col, -.08), shade(this.col, -.2)); }
    if (f === 'front' || f === 'back') { g.strokeStyle = shade(this.col, -.15); g.lineWidth = 12; g.beginPath(); g.arc(w / 2, -10, 60, .12 * Math.PI, .88 * Math.PI); g.stroke(); }
    if (f === 'front') badge(g, w * .5, h * .18 + 14, 40, this.badge);
  } },
  b8: { col: '#FFFFFF', trim: '#3FD0FF', sleeve: 'long', coat: true, badge: '🧪', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .14);
    if (f === 'front') {
      g.fillStyle = '#7DD3FC'; g.beginPath(); g.moveTo(w * .4, 0); g.lineTo(w / 2, h * .42); g.lineTo(w * .6, 0); g.fill();
      g.fillStyle = '#E5E7EB'; [[w * .3, -1], [w * .7, 1]].forEach(([x, s]) => { g.beginPath(); g.moveTo(x, 0); g.lineTo(w / 2 + s * 4, h * .44); g.lineTo(w / 2 + s * 26, h * .1); g.fill(); });
      g.strokeStyle = '#D1D5DB'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, h * .44); g.lineTo(w / 2, h); g.stroke();
      g.fillStyle = '#94A3B8'; [.56, .7, .84].forEach(y => { g.beginPath(); g.arc(w / 2 + 12, h * y, 5, 0, tau); g.fill(); });
      g.strokeStyle = '#CBD5E1'; g.lineWidth = 3; g.strokeRect(w * .64, h * .3, 50, 40);
      g.lineCap = 'round'; [['#2563EB', 0], ['#DC2626', 14], ['#16A34A', 28]].forEach(([c, dx]) => { g.strokeStyle = c; g.lineWidth = 7; g.beginPath(); g.moveTo(w * .64 + 10 + dx, h * .3 + 4); g.lineTo(w * .64 + 10 + dx, h * .3 - 20); g.stroke(); });
      badge(g, w * .3, h * .38, 34, this.badge);
    }
    if (f === 'sleeve') { g.fillStyle = '#E5E7EB'; g.fillRect(0, h * .74, w, 12); }
  } },
  b9: { col: '#B8C2CC', trim: '#6B7785', sleeve: 'long', armor: true, paint(g, w, h, f) {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#DCE3EA'); gr.addColorStop(.5, '#AEB8C3'); gr.addColorStop(1, '#8D98A5'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#6B7785'; g.lineWidth = 4; for (let y = h * .2; y < h; y += h * .19) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = '#5B6573'; for (let y = h * .2 + 14; y < h; y += h * .19) { g.beginPath(); g.arc(12, y, 4, 0, tau); g.arc(w - 12, y, 4, 0, tau); g.fill(); }
  } },
  bq1: { col: '#FFFFFF', trim: '#D32F2F', sleeve: 'none', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .12);
    if (f === 'front' || f === 'back') {
      g.strokeStyle = this.trim; g.lineWidth = 12; g.lineJoin = 'round'; g.beginPath(); g.moveTo(w * .36, 0); g.lineTo(w / 2, h * (f === 'front' ? .2 : .08)); g.lineTo(w * .64, 0); g.stroke();
      g.fillStyle = this.trim; g.font = `900 ${f === 'front' ? 118 : 140}px Arial Black, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 8; g.strokeStyle = '#1F2937'; g.strokeText('11', w / 2, h * .6); g.fillText('11', w / 2, h * .6);
      g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h);
    } else { g.fillStyle = this.trim; g.fillRect(w / 2 - 8, 0, 16, h); }
    g.fillStyle = this.trim; g.fillRect(0, h - 14, w, 8);
  } },
  bl1: { col: '#1E3A8A', trim: '#DC2626', sleeve: 'long', badge: '🎾', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .2);
    if (f === 'front') {
      g.fillStyle = '#F8FAFC'; g.fillRect(0, 0, w, 22); g.fillStyle = this.trim; g.fillRect(0, 22, w, 8);
      g.strokeStyle = '#CBD5E1'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, 22); g.lineTo(w / 2, h); g.stroke();
      g.fillStyle = '#E5E7EB'; g.fillRect(w / 2 - 6, 34, 12, 18);
      g.fillStyle = this.trim; g.fillRect(0, h * .42, w, 14); g.fillStyle = '#F8FAFC'; g.fillRect(0, h * .42 + 14, w, 6);
      badge(g, w * .74, h * .26, 34, this.badge);
    } else if (f === 'back') { g.fillStyle = '#F8FAFC'; g.fillRect(0, 0, w, 22); g.fillStyle = this.trim; g.fillRect(0, h * .42, w, 14); g.fillStyle = '#F8FAFC'; g.fillRect(0, h * .42 + 14, w, 6); }
    else if (f === 'sleeve') { g.fillStyle = this.trim; g.fillRect(w * .42, 0, 12, h * .82); g.fillStyle = '#F8FAFC'; g.fillRect(w * .42 + 12, 0, 5, h * .82); }
    else { g.fillStyle = this.trim; g.fillRect(0, h * .42, w, 14); }
    ribbing(g, 0, f === 'sleeve' ? h * .76 : h - 20, w, 20, shade(this.col, -.06), shade(this.col, -.18));
  } },
  bm1: { col: '#FFFFFF', trim: '#FF5CA8', sleeve: 'long', coat: true, feathers: true, badge: '🦢', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .12);
    if (f === 'front') {
      g.strokeStyle = this.trim; g.lineWidth = 8; g.beginPath(); g.moveTo(w / 2 - 6, h * .1); g.lineTo(w / 2 - 6, h); g.stroke(); g.beginPath(); g.moveTo(w / 2 + 6, h * .1); g.lineTo(w / 2 + 6, h); g.stroke();
      g.fillStyle = this.trim; [.4, .58, .76].forEach(y => { g.beginPath(); g.arc(w / 2 + 22, h * y, 6, 0, tau); g.fill(); });
      badge(g, w * .28, h * .44, 40, this.badge);
    }
    if (f === 'back') badge(g, w / 2, h * .5, 90, this.badge);
    if (f === 'sleeve') { g.fillStyle = this.trim; g.fillRect(0, h * .74, w, 12); }
  } }
};
function flower(g, x, y, r) { for (let i = 0; i < 5; i++) { const a = i * tau / 5; g.beginPath(); g.arc(x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7, r * .55, 0, tau); g.fill(); } g.save(); g.fillStyle = '#FDE68A'; g.beginPath(); g.arc(x, y, r * .35, 0, tau); g.fill(); g.restore(); }
function paintHoodie(g, w, h, f) {
  g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .2);
  const dark = shade(this.col, -.12);
  if (f === 'front') {
    g.fillStyle = shade(this.col, -.2); g.beginPath(); g.ellipse(w / 2, -6, 70, 34, 0, 0, Math.PI); g.fill();
    g.fillStyle = dark; g.beginPath(); g.moveTo(w * .2, h * .62); g.lineTo(w * .8, h * .62); g.lineTo(w * .88, h * .9); g.lineTo(w * .12, h * .9); g.closePath(); g.fill();
    g.strokeStyle = shade(this.col, -.25); g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#F8FAFC'; g.lineWidth = 7; g.lineCap = 'round'; [-18, 18].forEach(dx => { g.beginPath(); g.moveTo(w / 2 + dx, 26); g.quadraticCurveTo(w / 2 + dx * 1.3, h * .2, w / 2 + dx * 1.1, h * .36); g.stroke(); g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(w / 2 + dx * 1.1, h * .36 + 4, 6, 0, tau); g.fill(); });
    badge(g, w * .5, h * .5, 46, this.badge);
  }
  if (f === 'sleeve') ribbing(g, 0, h * .76, w, 22, dark, shade(this.col, -.25));
  else ribbing(g, 0, h - 22, w, 22, dark, shade(this.col, -.25));
}
function vestPaint(col) {
  return (g, w, h, f) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h); vshade(g, w, h, .2);
    const d = shade(col, -.14), dd = shade(col, -.26);
    if (f === 'front') {
      g.strokeStyle = dd; g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
      [[w * .1, w * .38], [w * .62, w * .9]].forEach(([a, b]) => { g.fillStyle = d; g.fillRect(a, h * .36, b - a, h * .2); g.strokeStyle = dd; g.lineWidth = 3; g.strokeRect(a, h * .36, b - a, h * .2); g.beginPath(); g.moveTo(a, h * .42); g.lineTo(b, h * .42); g.stroke(); });
      g.fillStyle = dd; g.fillRect(0, h * .74, w, 6);
    }
    if (f === 'back') { g.strokeStyle = dd; g.lineWidth = 4; g.strokeRect(w * .2, h * .2, w * .6, h * .5); }
    g.fillStyle = dd; g.fillRect(0, h - 14, w, 14);
  };
}

// ---- pants painting ----
function waist(g, w, col) { g.fillStyle = shade(col, -.1); g.fillRect(0, 0, w, 18); }
const LEGS = {
  _hakama: { col: '#334155', hakama: '#334155', paint(g, w, h) { g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .2); } },
  _default: { col: '#B9A6F5', paint(g, w, h, f) { // underwear: briefs
    g.fillStyle = SKIN; g.fillRect(0, 0, w, h); vshade(g, w, h, .06);
    g.fillStyle = '#B9A6F5'; const b = f === 'inner' ? h * .12 : f === 'outer' ? h * .14 : h * .2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, b * (f === 'front' || f === 'back' ? .7 : 1)); g.quadraticCurveTo(w / 2, b * 1.15, 0, b); g.closePath(); g.fill();
    g.fillStyle = '#F5F3FF'; g.fillRect(0, 0, w, 12);
  } },
  _plain: { col: '#1B2547', paint(g, w, h, f) { g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .18); waist(g, w, this.col); } },
  l0: { col: '#111827', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .25); waist(g, w, '#2a3346');
    if (f === 'outer') { g.fillStyle = '#F8FAFC'; g.fillRect(w * .36, 18, 11, h - 46); g.fillRect(w * .56, 18, 11, h - 46); }
    ribbing(g, 0, h - 30, w, 24, '#1f2937', '#0b0f19');
  } },
  l1: { col: '#6B7280', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .2); ribbing(g, 0, 0, w, 20, shade(this.col, -.08), shade(this.col, -.2));
    if (f === 'front') { g.strokeStyle = '#E5E7EB'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * .1, 14); g.quadraticCurveTo(w * .3, 60, w * .2, 70); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .4, 40); g.quadraticCurveTo(w * .6, h * .5, w * .45, h * .8); g.stroke();
    ribbing(g, 0, h - 30, w, 24, shade(this.col, -.08), shade(this.col, -.2));
  } },
  l2: { col: '#A3894E', short: .45, paint(g, w, h, f) {
    g.fillStyle = SKIN; g.fillRect(0, 0, w, h);
    g.fillStyle = this.col; g.fillRect(0, 0, w, h * this.short); vshade(g, w, h * this.short, .18); waist(g, w, this.col);
    g.fillStyle = shade(this.col, -.12); g.fillRect(0, h * this.short - 10, w, 10);
    if (f === 'front') { g.strokeStyle = shade(this.col, -.25); g.lineWidth = 3; g.beginPath(); g.moveTo(w * .7, 18); g.quadraticCurveTo(w * .9, 50, w, 60); g.stroke(); }
  } },
  l3: { paint(g, w, h, f) {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#4C1D95'); gr.addColorStop(.55, '#1E40AF'); gr.addColorStop(1, '#DB2777'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r2 = g.createRadialGradient(w * .3, h * .4, 4, w * .3, h * .4, 70); r2.addColorStop(0, 'rgba(236,72,153,.5)'); r2.addColorStop(1, 'rgba(236,72,153,0)'); g.fillStyle = r2; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { const x = (i * 53 + (f === 'outer' ? 17 : 5)) % w, y = (i * 97 + 31) % h, r = (i % 4 === 0) ? 3 : 1.4; g.beginPath(); g.arc(x, y, r, 0, tau); g.fill(); }
    g.fillStyle = '#312E81'; g.fillRect(0, 0, w, 16);
  } },
  l4: { skirt: true, paint(g, w, h) { g.fillStyle = SKIN; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, 0, 10, h); g.fillStyle = '#FFFFFF'; g.fillRect(0, h * .78, w, h * .22); g.fillStyle = '#E5E7EB'; g.fillRect(0, h * .78, w, 8); } },
  l5: { col: '#111827', paint(g, w, h, f) {
    g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .2); waist(g, w, '#273042');
    g.strokeStyle = '#E5E7EB'; g.lineWidth = 9; for (let i = 0; i < 4; i++) { const y = h * .58 + i * 22; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (f === 'outer' || f === 'front' ? 14 : -14)); g.stroke(); }
  } },
  l6: { paint(g, w, h) { const c = ['#EF4444', '#F59E0B', '#FDE047', '#22C55E', '#3B82F6', '#8B5CF6']; c.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * h / 6, w, h / 6 + 1); }); vshade(g, w, h, .12); g.fillStyle = '#312E81'; g.fillRect(0, 0, w, 14); } },
  ll1: { col: '#1B2547', belt: true, paint(g, w, h) { g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .18); waist(g, w, this.col); } },
  hq2: { col: '#1B2547', weights: '#F97316', paint(g, w, h) { g.fillStyle = this.col; g.fillRect(0, 0, w, h); vshade(g, w, h, .18); waist(g, w, this.col); } }
};

// ---- torso + arms + legs ----
function shirtMats(it) {
  const B = it && BODY[it.id] ? BODY[it.id] : it ? Object.assign({}, BODY._tunic, { col: it.col || '#24305E' }) : BODY._default;
  const id = it ? it.id : '_default';
  const paint = f => (g, w, h) => B.paint.call(B, g, w, h, f);
  const front = tmat('sh:' + id + ':front', 256, 256, paint('front')), back = tmat('sh:' + id + ':back', 256, 256, paint('back')), side = tmat('sh:' + id + ':side', 128, 256, paint('side'));
  const sl = B.sleeve;
  const sleeve = tmat('sh:' + id + ':sleeve', 128, 256, (g, w, h) => {
    const cut = sl === 'short' ? .42 : sl === 'none' ? 0 : sl === 'long3' ? .66 : .86;
    if (cut) { g.save(); g.beginPath(); g.rect(0, 0, w, h * cut); g.clip(); B.paint.call(B, g, w, h, 'sleeve'); g.restore(); }
    g.fillStyle = SKIN; g.fillRect(0, h * cut, w, h - h * cut);
    g.fillStyle = 'rgba(0,0,0,.06)'; if (cut) g.fillRect(0, h * cut, w, 6);
  });
  const topCol = sl === 'none' ? mat(SKIN) : tmat('sh:' + id + ':top', 64, 64, (g, w, h) => { g.save(); g.scale(4, 4); B.paint.call(B, g, w, h, 'side'); g.restore(); });
  return { B, torso: [side, side, topCol, mat(shade(B.col || '#24305E', -.2)), front, back], arm: [sleeve, sleeve, topCol, mat(SKIN), sleeve, sleeve] };
}
function pantsMats(it) {
  const L = it && LEGS[it.id] ? LEGS[it.id] : it ? Object.assign({}, LEGS._plain, { col: it.col || '#1B2547' }) : LEGS._default;
  const id = it ? it.id : '_default';
  const m = f => tmat('pa:' + id + ':' + f, 128, 256, (g, w, h) => L.paint.call(L, g, w, h, f));
  const front = m('front'), back = m('back'), outer = m('outer'), inner = m('inner');
  const top = mat(L.col || '#1B2547');
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z
  return { L, right: [inner, outer, top, top, front, back], left: [outer, inner, top, top, front, back] };
}
function buildBody(rig, spec, opts) {
  const sm = shirtMats(spec.body), pm = pantsMats(spec.legs);
  const B = sm.B, L = pm.L;
  const torso = P(rbox(1.0, 1.0, 0.5, 0.05), sm.torso, 0, TORSO_Y, 0, rig); torso.userData.region = 'torso';
  const neck = P(cyl(0.15, 0.15, 0.12, 20), mat(SKIN), 0, HY - HH / 2 - 0.02, 0, rig); neck.userData.region = 'head';
  const arms = [-1, 1].map(s => {
    const a = grp(rig, s * ARM_X, SHOULDER_Y, 0); a.userData.side = s;
    const m = P(rbox(0.48, 1.0, 0.48, 0.05), sm.arm, 0, -0.48, 0, a); m.userData.region = 'arm';
    return a;
  });
  const legs = [-1, 1].map(s => {
    const lg = grp(rig, s * LEG_X, 1.0, 0); lg.userData.side = s;
    const l = P(rbox(0.48, 1.0, 0.48, 0.05), s < 0 ? pm.right : pm.left, 0, -0.5, 0, lg); l.userData.region = 'leg';
    return lg;
  });
  const bodyG = grp(rig); bodyG.userData.slot = 'body';
  if (spec.body) bodyExtras(bodyG, B, arms);
  const legG = grp(rig); legG.userData.slot = 'legs';
  if (spec.legs || L.hakama) legExtras(legG, L, legs);
  return { torso, arms, legs, bodyG, legG };
}
function bodyExtras(g, B, arms) {
  const col = B.col || '#24305E';
  if (B.hood) { // hood resting on the shoulders/back
    const h = P(tor(0.3, 0.12, 12, 28), mat(shade(col, -.04)), 0, 2.02, -0.2, g, Math.PI / 2 - 0.35, 0, 0, 1.15, 1, 0.8);
    P(rbox(0.56, 0.36, 0.16, 0.08), mat(shade(col, -.08)), 0, 1.86, -0.31, g, -0.15);
  }
  if (B.vest) {
    const vm = tmat('vest:' + B.vest + ':f', 256, 256, vestPaint(B.vest)), vb = tmat('vest:' + B.vest + ':b', 256, 256, (gg, w, h) => vestPaint(B.vest)(gg, w, h, 'back')), vs = tmat('vest:' + B.vest + ':s', 128, 256, (gg, w, h) => vestPaint(B.vest)(gg, w, h, 'side'));
    const top = mat(B.vest);
    P(rbox(1.06, 0.96, 0.58, 0.07), [vs, vs, top, top, vm, vb], 0, 1.5, 0, g);
    P(tor(0.3, 0.085, 12, 30), mat(shade(B.vest, -.05)), 0, 2.0, 0, g, Math.PI / 2, 0, 0, 1.25, 1, 0.85);
    [-0.27, 0.27].forEach(x => { P(rbox(0.3, 0.2, 0.08, 0.025), mat(shade(B.vest, -.1)), x, 1.6, 0.31, g); P(rbox(0.31, 0.06, 0.09, 0.02), mat(shade(B.vest, -.2)), x, 1.69, 0.31, g); });
  }
  if (B.belt) { // gi belt with knot and tails
    P(rbox(1.04, 0.11, 0.54, 0.04), mat(B.belt), 0, 1.16, 0, g);
    P(rbox(0.14, 0.12, 0.08, 0.04), mat(B.belt), 0.12, 1.16, 0.28, g);
    P(rbox(0.07, 0.3, 0.035, 0.015), mat(B.belt), 0.07, 1.0, 0.3, g, 0, 0, 0.18); P(rbox(0.07, 0.28, 0.035, 0.015), mat(B.belt), 0.19, 1.0, 0.3, g, 0, 0, -0.22);
  }
  if (B.sleeve === 'wide') arms.forEach(a => { // kimono sleeves: wide hanging pouch
    const sg = grp(a); sg.userData.slot = 'body';
    P(rbox(0.56, 0.78, 0.6, 0.06), mat(B.col), 0, -0.42, 0.0, sg);
    P(rbox(0.57, 0.1, 0.61, 0.04), mat(B.trim), 0, -0.78, 0, sg);
  });
  if (B.coat) { // long coat tails over the hips/legs
    [-1, 1].forEach(s => { P(rbox(0.5, 0.52, 0.56, 0.04), mat(shade(col, -.02)), s * 0.255, 0.78, 0, g); P(rbox(0.51, 0.06, 0.57, 0.02), mat(B.trim || '#E5E7EB'), s * 0.255, 0.53, 0, g); });
    [-1, 1].forEach(s => P(rbox(0.16, 0.42, 0.04, 0.02), mat(shade(col, -.06)), s * 0.2, 1.78, 0.27, g, 0, 0, s * 0.35));
  }
  if (B.feathers) { // feather boa collar
    for (let i = 0; i < 14; i++) { const a = i / 14 * tau; P(sph(0.13, 14, 10), mat(i % 2 ? '#FFFFFF' : '#FFE4F1'), Math.sin(a) * 0.44, 2.02 + (i % 2) * 0.03, Math.cos(a) * 0.3, g, 0, a, 0.5, 1.4, 0.6, 1); }
  }
  if (B.armor) {
    const m1 = metal('#C7D0DA'), m2 = metal('#8994A3');
    P(rbox(0.84, 0.62, 0.12, 0.06), m1, 0, 1.66, 0.25, g);
    P(rbox(0.06, 0.6, 0.14, 0.03), m2, 0, 1.66, 0.27, g);
    arms.forEach(a => { const pg = grp(a); pg.userData.slot = 'body'; P(sph(0.33, 24, 12), m1, a.userData.side * 0.03, -0.04, 0, pg, 0, 0, 0, 1, 0.55, 1); P(tor(0.3, 0.035, 8, 28), m2, a.userData.side * 0.03, -0.11, 0, pg, Math.PI / 2); });
    P(rbox(1.04, 0.12, 0.54, 0.04), mat('#6B4423'), 0, 1.06, 0, g);
    P(rbox(0.16, 0.16, 0.06, 0.03), metal('#E3B53C'), 0, 1.06, 0.28, g);
  }
}
function legExtras(g, L, legs) {
  if (L.skirt) { // pleated tennis skirt
    const geo = G('skirt', () => {
      const c = new T.CylinderGeometry(0.56, 0.74, 0.42, 48, 2, true), p = c.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(x, z), k = 1 + 0.04 * Math.sign(Math.sin(a * 12)); p.setX(i, x * k * 1.0); p.setZ(i, z * k * 0.62); }
      c.computeVertexNormals(); return c;
    });
    P(geo, mat('#FFFFFF', { side: T.DoubleSide }), 0, 0.86, 0, g);
    P(G('skirtHem', () => { const t = new T.TorusGeometry(0.74, 0.02, 6, 48); return t; }), mat('#1E3A8A'), 0, 0.66, 0, g, Math.PI / 2, 0, 0, 1, 0.62, 1);
    P(rbox(1.02, 0.1, 0.52, 0.04), mat('#F3F4F6'), 0, 1.02, 0, g);
  }
  if (L.short) [-1, 1].forEach(s => { P(rbox(0.08, 0.2, 0.22, 0.03), mat(shade(L.col, -.1)), s * 0.5, 0.74, 0, g); P(rbox(0.09, 0.05, 0.23, 0.02), mat(shade(L.col, -.22)), s * 0.5, 0.83, 0, g); });
  if (L.belt) {
    const m = metal('#9CA3AF'), d = metal('#4B5563');
    P(rbox(1.06, 0.15, 0.56, 0.05), m, 0, 0.97, 0, g);
    P(extrude('chastplate', s => { s.moveTo(-0.22, 0); s.lineTo(0.22, 0); s.lineTo(0.05, -0.3); s.lineTo(-0.05, -0.3); s.closePath(); }, 0.04, 0.01), m, 0, 0.92, 0.28, g);
    [-0.4, -0.2, 0, 0.2, 0.4].forEach(x => P(sph(0.022, 8, 6), d, x, 0.97, 0.285, g));
    P(rbox(0.13, 0.11, 0.06, 0.02), metal('#E3B53C'), 0, 0.82, 0.33, g);
    P(tor(0.04, 0.012, 6, 16, Math.PI), metal('#E3B53C'), 0, 0.875, 0.33, g);
  }
  if (L.weights) legs.forEach(lg => {
    const w = grp(lg, 0, -0.7, 0); w.userData.slot = 'legs';
    P(rbox(0.56, 0.17, 0.56, 0.07), mat(L.weights), 0, 0, 0, w);
    [-0.13, 0, 0.13].forEach(x => P(rbox(0.02, 0.18, 0.57, 0.01), mat(shade(L.weights, -.18)), x, 0, 0, w));
  });
  if (L.hakama) {
    const geo = G('hakama', () => {
      const c = new T.CylinderGeometry(0.58, 0.78, 0.92, 48, 2, true), p = c.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(x, z), k = 1 + 0.035 * Math.sign(Math.sin(a * 10)); p.setX(i, x * k); p.setZ(i, z * k * 0.6); }
      c.computeVertexNormals(); return c;
    });
    P(geo, mat(L.hakama, { side: T.DoubleSide }), 0, 0.6, 0, g);
  }
}

// ---- feet ----
function shoeBase(g, col, sole, h) {
  P(rbox(0.52, h || 0.17, 0.6, 0.06), mat(col), 0, (h || 0.17) / 2 + 0.03, 0.05, g);
  P(rbox(0.54, 0.055, 0.62, 0.02), mat(sole), 0, 0.027, 0.05, g);
}
function skinFoot(g) { P(rbox(0.5, 0.2, 0.5, 0.05), mat(SKIN), 0, 0.12, 0, g); P(rbox(0.5, 0.13, 0.62, 0.06), mat(SKIN), 0, 0.09, 0.07, g); }
function shaft(g, col, top, w) { P(rbox(w || 0.54, top - 0.1, w || 0.54, 0.06), mat(col), 0, (top + 0.1) / 2, 0, g); }
const FEET = {
  _zori(g) {
    P(rbox(0.5, 0.2, 0.5, 0.05), mat('#F8FAFC'), 0, 0.12, 0, g); P(rbox(0.5, 0.13, 0.62, 0.06), mat('#F8FAFC'), 0, 0.09, 0.07, g);
    P(rbox(0.56, 0.06, 0.68, 0.02), mat('#D6B36A'), 0, 0.03, 0.07, g);
    [-1, 1].forEach(k => P(tube('zori' + k, [[0, 0.15, 0.3], [k * 0.14, 0.15, 0.16], [k * 0.25, 0.07, 0.02]], 0.03, 0.03, 8, 6), mat('#B91C1C'), 0, 0, 0, g));
  },
  _default(g) { skinFoot(g); [-0.16, -0.06, 0.04, 0.13].forEach((x, i) => P(sph(i ? 0.04 : 0.05, 10, 8), mat(SKIN), x, 0.07, 0.37 - Math.abs(x) * 0.12, g)); },
  s0(g, s) {
    shoeBase(g, '#F8FAFC', '#E7D7B8');
    P(rbox(0.5, 0.09, 0.2, 0.04), mat('#FFFFFF'), 0, 0.09, 0.27, g);
    [0.02, 0.09].forEach(z => P(rbox(0.3, 0.025, 0.035, 0.01), mat('#94A3B8'), 0, 0.205, z, g));
    [0, 0.08].forEach(dz => P(rbox(0.02, 0.1, 0.035, 0.008), mat('#111827'), s * 0.262, 0.12, dz - 0.06, g, 0.5));
    P(rbox(0.02, 0.05, 0.05, 0.01), mat('#1D4ED8'), s * 0.262, 0.1, -0.2, g);
  },
  s1(g) {
    skinFoot(g); P(rbox(0.54, 0.05, 0.66, 0.02), mat('#FBBF24'), 0, 0.025, 0.06, g);
    [-1, 1].forEach(k => P(tube('flip' + k, [[0, 0.16, 0.26], [k * 0.14, 0.17, 0.12], [k * 0.25, 0.08, -0.02]], 0.025, 0.025, 8, 6), mat('#2563EB'), 0, 0, 0, g));
    [-0.15, -0.05, 0.05, 0.14].forEach((x, i) => P(sph(0.04, 8, 6), mat(SKIN), x, 0.09, 0.34 - Math.abs(x) * 0.25, g));
  },
  s2(g) {
    P(rbox(0.52, 0.42, 0.52, 0.06), mat('#FAFAFA'), 0, 0.27, 0, g);
    [0.4, 0.45].forEach(y => P(rbox(0.53, 0.015, 0.53, 0.007), mat('#D1D5DB'), 0, y, 0, g));
    P(rbox(0.5, 0.13, 0.58, 0.06), mat('#FAFAFA'), 0, 0.1, 0.06, g);
    P(rbox(0.56, 0.05, 0.66, 0.02), mat('#8B5A2B'), 0, 0.025, 0.06, g);
    [0.22, 0.0].forEach(z => P(rbox(0.54, 0.04, 0.07, 0.015), mat('#8B5A2B'), 0, 0.15, z, g));
    P(rbox(0.03, 0.05, 0.05, 0.01), metal('#D4AF37'), 0.27, 0.15, 0.0, g);
  },
  s3(g, s) {
    shoeBase(g, '#39FF14', '#F8FAFC', 0.19);
    P(rbox(0.5, 0.1, 0.16, 0.045), mat('#F8FAFC'), 0, 0.09, 0.29, g);
    [-1, 1].forEach(k => P(rbox(0.02, 0.05, 0.4, 0.01), mat('#111827'), k * 0.262, 0.1, 0.02, g));
    [0.0, 0.08, 0.16].forEach(z => P(rbox(0.28, 0.025, 0.035, 0.01), mat('#FFFFFF'), 0, 0.205, z, g));
    P(extrude('bolt', sh => { sh.moveTo(0.02, 0.06); sh.lineTo(-0.05, -0.005); sh.lineTo(0.0, -0.005); sh.lineTo(-0.03, -0.07); sh.lineTo(0.05, 0.01); sh.lineTo(0.0, 0.01); sh.closePath(); }, 0.01, 0.003), mat('#FFFFFF'), s * 0.262, 0.12, 0.0, g, 0, Math.PI / 2 * s, 0, 1.4);
    P(rbox(0.2, 0.08, 0.04, 0.015), mat('#111827'), 0, 0.17, -0.25, g);
  },
  s4(g) {
    skinFoot(g);
    P(rbox(0.52, 0.09, 0.6, 0.04), mat('#F9A8D4'), 0, 0.075, 0.05, g);
    P(rbox(0.54, 0.035, 0.62, 0.015), mat('#DB2777'), 0, 0.018, 0.05, g);
    const b = grp(g, 0, 0.14, 0.3); [-1, 1].forEach(k => P(sph(0.06, 12, 8), mat('#DB2777'), k * 0.06, 0, 0, b, 0, 0, 0, 1.3, 0.8, 0.5)); P(sph(0.03, 8, 6), mat('#BE185D'), 0, 0, 0.01, b);
  },
  s5(g) {
    skinFoot(g); P(rbox(0.54, 0.05, 0.64, 0.02), mat('#1E293B'), 0, 0.025, 0.05, g);
    const wrap = tmat('ninjawrap', 128, 128, (c, w, h) => { c.fillStyle = '#334155'; c.fillRect(0, 0, w, h); c.strokeStyle = '#94A3B8'; c.lineWidth = 7; for (let i = -1; i < 5; i++) { c.beginPath(); c.moveTo(0, i * 30); c.lineTo(w, i * 30 + 26); c.stroke(); } });
    P(rbox(0.52, 0.34, 0.52, 0.06), wrap, 0, 0.36, 0, g);
    P(rbox(0.54, 0.05, 0.12, 0.02), mat('#334155'), 0, 0.15, 0.18, g);
  },
  s6(g) {
    shaft(g, '#7C4A2D', 0.52); shoeBase(g, '#7C4A2D', '#3B2414', 0.2);
    P(rbox(0.58, 0.1, 0.58, 0.05), mat('#A0693F'), 0, 0.5, 0, g);
    P(rbox(0.56, 0.04, 0.12, 0.015), mat('#5B3520'), 0, 0.18, 0.27, g);
  },
  s7(g) {
    shaft(g, '#EF4444', 0.38); shoeBase(g, '#EF4444', '#1F2937', 0.19);
    P(rbox(0.58, 0.08, 0.58, 0.04), mat('#FDE047'), 0, 0.38, 0, g);
    P(cyl(0.08, 0.1, 0.16, 16), metal('#6B7280'), 0, 0.25, -0.3, g, Math.PI / 2);
    flame(g, 0, -0.02, -0.08, 0.26);
  },
  sl1(g, s) {
    shaft(g, '#DC2626', 0.36); shoeBase(g, '#DC2626', '#F8FAFC', 0.19);
    P(cyl(0.07, 0.07, 0.02, 20), mat('#FFFFFF'), s * 0.272, 0.26, 0, g, 0, 0, Math.PI / 2);
    P(cyl(0.035, 0.035, 0.022, 16), mat('#111827'), s * 0.272, 0.26, 0, g, 0, 0, Math.PI / 2);
    [0.06, 0.13, 0.2].forEach(y => P(rbox(0.26, 0.025, 0.03, 0.01), mat('#111827'), 0, 0.12 + y, 0.28, g));
    flame(g, 0, -0.02, 0, 0.2);
  }
};
function flame(g, x, y, z, s) {
  const f = grp(g, x, y, z); f.userData.flame = true;
  P(cone(0.13 * s / 0.26, 0.32 * s / 0.26, 16), glow('#F97316', 1), 0, -0.16 * s / 0.26, 0, f, Math.PI);
  P(cone(0.075 * s / 0.26, 0.22 * s / 0.26, 14), glow('#FDE047', 1.2), 0, -0.1 * s / 0.26, 0, f, Math.PI);
}
function buildFeet(rig, it, legs) {
  const g = grp(rig); g.userData.slot = it ? 'feet' : null;
  const fn = it && FEET[it.id] ? FEET[it.id] : FEET._default;
  [-1, 1].forEach((s, i) => {
    const f = legs ? grp(legs[i], 0, -1.0, 0) : grp(g, s * LEG_X, 0, 0);
    f.userData.isFoot = true; if (it) f.userData.slot = 'feet';
    fn(f, s, it); if (!it) f.traverse(o => { o.userData.region = 'foot'; });
  });
  return g;
}
/* ===== accessories, faces, gear (weapons) and relics ===== */
const UP = new T.Vector3(0, 1, 0);
function onSurface(m, nx, ny, nz) { m.quaternion.setFromUnitVectors(UP, new T.Vector3(nx, ny, nz).normalize()); return m; }
const GOLD = () => metal('#E8B923', 0.3), SILVER = () => metal('#D7DEE6', 0.28);
const HT = HH / 2; // head top (head-local)

// head accessories: g = group at head centre. hat: 0 none, 1 small (hide tufts), 2 full (hide top layer)
const HEAD = {
  h1: { hat: 2, build(g) {
    const top = P(G('mushdome', () => new T.SphereGeometry(0.6, 40, 20, 0, tau, 0, Math.PI / 2)), mat('#E53935'), 0, HT - 0.02, 0, g, 0, 0, 0, 1, 0.66, 1);
    P(cyl(0.6, 0.5, 0.06, 40), mat('#FFF1DC'), 0, HT - 0.04, 0, g);
    [[0.25, 0.9], [0.55, 2.2], [0.5, 4.0], [0.62, 5.4], [0.15, 3.1], [0.7, 0.3], [0.68, 3.2], [0.45, 1.5], [0.75, 4.7], [0.4, -0.2], [0.78, 1.2], [0.3, 5.0]].forEach(([t, a]) => {
      const th = t * Math.PI / 2, nx = Math.sin(th) * Math.sin(a), ny = Math.cos(th) / 0.66, nz = Math.sin(th) * Math.cos(a);
      const s = P(sph(0.11, 16, 10), mat('#FFFFFF'), 0.6 * Math.sin(th) * Math.sin(a), HT - 0.02 + 0.6 * 0.66 * Math.cos(th), 0.6 * Math.sin(th) * Math.cos(a), g, 0, 0, 0, 1, 0.3, 1);
      onSurface(s, nx, ny, nz);
    });
  } },
  h2: { hat: 2, build(g) {
    const c = '#2563EB', d = '#1D4ED8';
    P(G('capdome', () => new T.SphereGeometry(0.42, 40, 20, 0, tau, 0, Math.PI / 2)), mat(c), 0, HT - 0.06, 0, g, 0, 0, 0, 1, 0.72, 1);
    P(cyl(0.425, 0.425, 0.08, 40, true), mat(d, { side: T.DoubleSide }), 0, HT - 0.06, 0, g);
    P(rbox(0.5, 0.035, 0.34, 0.015), mat(d), 0, HT - 0.05, -0.52, g, -0.12);
    P(sph(0.045, 12, 8), mat(d), 0, HT + 0.245, 0, g);
    for (let i = 0; i < 6; i++) { const a = i / 6 * tau; P(rbox(0.012, 0.3, 0.012, 0.005), mat(d), Math.sin(a) * 0.2, HT + 0.14, Math.cos(a) * 0.2, g, Math.cos(a) * 0.8, 0, -Math.sin(a) * 0.8); }
    P(rbox(0.16, 0.06, 0.03, 0.02), mat('#F8FAFC'), 0, HT - 0.02, 0.42, g); // strap gap at the front (it's backwards)
  } },
  h3: { hat: 0, build(g) {
    const b = grp(g, 0.25, HT + 0.08, 0.08, 0, 0.35, -0.35); b.scale.setScalar(1.35), m = mat('#FF6FB5'), d = mat('#E0479A');
    [-1, 1].forEach(s => { P(sph(0.13, 20, 14), m, s * 0.13, 0, 0, b, 0, 0, s * 0.35, 1.25, 0.85, 0.55); P(sph(0.05, 10, 8), mat('#FFFFFF'), s * 0.15, 0.03, 0.065, b); });
    P(sph(0.065, 14, 10), d, 0, 0, 0.02, b);
    [-1, 1].forEach(s => P(rbox(0.06, 0.16, 0.025, 0.012), d, s * 0.06, -0.1, 0.0, b, 0, 0, s * 0.35));
  } },
  h4: { hat: 2, build(g) {
    const k = mat('#111827');
    P(cyl(0.4, 0.41, 0.2, 40), k, 0, HT + 0.02, 0, g);
    P(rbox(0.98, 0.045, 0.98, 0.012), mat('#1F2937'), 0, HT + 0.14, 0, g, 0, Math.PI / 4);
    P(cyl(0.04, 0.04, 0.03, 12), k, 0, HT + 0.17, 0, g);
    P(tube('tassel', [[0, HT + 0.17, 0], [0.25, HT + 0.175, 0.25], [0.44, HT + 0.12, 0.44], [0.46, HT - 0.12, 0.46]], 0.014, 0.014, 16, 6), mat('#FACC15'), 0, 0, 0, g);
    P(cyl(0.03, 0.05, 0.12, 10), mat('#FACC15'), 0.46, HT - 0.17, 0.46, g);
  } },
  h5: { hat: 2, build(g) {
    const k = mat('#111827', { roughness: 0.45 });
    P(cyl(0.56, 0.56, 0.035, 48), k, 0, HT + 0.06, 0, g);
    P(tor(0.56, 0.025, 8, 48), k, 0, HT + 0.07, 0, g, Math.PI / 2);
    P(cyl(0.36, 0.34, 0.58, 40), k, 0, HT + 0.36, 0, g);
    P(cyl(0.345, 0.345, 0.1, 40), mat('#DC2626'), 0, HT + 0.13, 0, g);
  } },
  h6: { hat: 2, build(g) {
    const c = '#4D5D3A', d = '#3A4728';
    P(G('helm', () => new T.SphereGeometry(0.47, 40, 20, 0, tau, 0, Math.PI * 0.55)), mat(c), 0, HT - 0.14, 0, g, 0, 0, 0, 1, 0.82, 1);
    P(tor(0.465, 0.04, 10, 48), mat(d), 0, HT - 0.2, 0, g, Math.PI / 2);
    [[0.3, 0.6, 0.08], [0.5, 2.2, 0.06], [0.25, 3.6, 0.07], [0.55, 4.6, 0.06], [0.45, 5.6, 0.05]].forEach(([t, a, r]) => {
      const th = t * Math.PI / 2, s = P(sph(r, 12, 8), mat(d), 0.47 * Math.sin(th) * Math.sin(a), HT - 0.14 + 0.47 * 0.82 * Math.cos(th), 0.47 * Math.sin(th) * Math.cos(a), g, 0, 0, 0, 1.3, 0.25, 1);
      onSurface(s, Math.sin(th) * Math.sin(a), Math.cos(th) / 0.82, Math.sin(th) * Math.cos(a));
    });
    P(G('strap', () => new T.TorusGeometry(0.37, 0.018, 6, 40, Math.PI)), mat('#6B5B3A'), 0, -0.05, 0.0, g, 0, 0, Math.PI, 1, 1.05, 1.05);
  } },
  h7: { hat: 0, build(g, ctx) {
    const hc = ctx.hair || '#1E1B3A';
    const tri = (k, sz) => extrude('ear' + k, s => { s.moveTo(-sz, 0); s.quadraticCurveTo(-sz * 0.55, sz * 1.1, -sz * 0.08, sz * 1.75); s.quadraticCurveTo(0, sz * 1.82, sz * 0.08, sz * 1.75); s.quadraticCurveTo(sz * 0.55, sz * 1.1, sz, 0); s.closePath(); }, k === 'o' ? 0.07 : 0.02, k === 'o' ? 0.03 : 0.008);
    [-1, 1].forEach(s => {
      const e = grp(g, s * 0.21, HT + 0.02, 0.02, -0.12, s * 0.25, s * -0.28);
      P(tri('o', 0.13), mat(shade(hc, 0.06)), 0, 0, 0, e);
      P(tri('i', 0.08), mat('#FFB7D5'), 0, 0.03, 0.05, e);
    });
  } },
  h8: { hat: 1, build(g) {
    const m = GOLD();
    P(cyl(0.34, 0.34, 0.15, 40, true), mat('#E8B923', { metalness: 0.25, roughness: 0.3, side: T.DoubleSide }), 0, HT + 0.12, 0, g);
    P(tor(0.34, 0.025, 8, 40), m, 0, HT + 0.05, 0, g, Math.PI / 2);
    for (let i = 0; i < 8; i++) { const a = i / 8 * tau; P(cone(0.07, 0.2, 4), m, Math.sin(a) * 0.32, HT + 0.28, Math.cos(a) * 0.32, g); P(sph(0.035, 10, 8), m, Math.sin(a) * 0.32, HT + 0.39, Math.cos(a) * 0.32, g); }
    [[0, '#39FF14', 0.06], [0.9, '#EF4444', 0.045], [-0.9, '#3B82F6', 0.045], [Math.PI, '#A855F7', 0.045]].forEach(([a, c, r]) => P(sph(r, 14, 10), mat(c, { roughness: 0.15, emissive: new T.Color(c), emissiveIntensity: 0.25 }), Math.sin(a) * 0.35, HT + 0.12, Math.cos(a) * 0.35, g, 0, 0, 0, 1, 1, 0.6));
  } },
  hq1: { hat: 0, build(g) {
    const blue = mat('#1F3A8A');
    P(cyl(HR + 0.075, HR + 0.075, 0.11, 48, true), mat('#1F3A8A', { side: T.DoubleSide }), 0, 0.17, 0, g, 0, 0, 0, 1, 1, 1);
    const plate = tmat('leafplate', 256, 112, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E5EAF0'); gr.addColorStop(1, '#AEB8C4'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#4B5563'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(w / 2 - 40, h / 2 + 22); c.quadraticCurveTo(w / 2 - 30, h / 2 - 34, w / 2 + 40, h / 2 - 26); c.quadraticCurveTo(w / 2 + 26, h / 2 + 26, w / 2 - 40, h / 2 + 22); c.stroke();
      c.beginPath(); c.moveTo(w / 2 - 48, h / 2 + 30); c.lineTo(w / 2 + 22, h / 2 - 12); c.stroke();
      c.fillStyle = '#6B7280'; [[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, tau); c.fill(); });
    }, { metalness: 0.25, roughness: 0.3 });
    const pm = metal('#C9D1DC');
    P(rbox(0.36, 0.15, 0.03, 0.012), [pm, pm, pm, pm, plate, pm], 0, 0.17, HR + 0.09, g);
    [-1, 1].forEach(s => P(rbox(0.07, 0.34, 0.02, 0.01), blue, s * 0.07, 0.0, -HR - 0.09, g, 0.2, 0, s * 0.3));
  } },
  hl1: { hat: 2, build(g) {
    const straw = tmat('straw2', 256, 256, (c, w, h) => { c.fillStyle = '#F7D46A'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(170,120,30,.3)'; c.lineWidth = 2; for (let r = 6; r < 130; r += 7) { c.beginPath(); c.arc(w / 2, h / 2, r, 0, tau); c.stroke(); } for (let y = 0; y < h; y += 8) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.globalAlpha = .25; c.stroke(); c.globalAlpha = 1; } });
    P(cyl(0.8, 0.8, 0.04, 56), straw, 0, HT + 0.06, 0, g);
    P(tor(0.8, 0.022, 8, 56), mat('#D9A73A'), 0, HT + 0.06, 0, g, Math.PI / 2);
    P(lathe('strawcrown2', [[0.42, 0], [0.4, 0.15], [0.33, 0.27], [0.2, 0.33], [0, 0.34]]), straw, 0, HT + 0.07, 0, g);
    P(cyl(0.425, 0.425, 0.1, 48), mat('#D62828'), 0, HT + 0.12, 0, g);
  } },
  hm1: { hat: 2, build(g) {
    const c = grp(g, 0, HT + 0.22, 0);
    P(cone(0.88, 0.42, 48), mat('#F8FAFC'), 0, 0, 0, c);
    P(tor(0.87, 0.03, 8, 56), mat('#DC2626'), 0, -0.21, 0, c, Math.PI / 2);
    P(cyl(0.33, 0.44, 0.035, 40, true), mat('#DC2626', { side: T.DoubleSide }), 0, 0.07, 0, c);
    const kanji = tmat('kanji', 128, 128, (x, w, h) => { x.fillStyle = '#F8FAFC'; x.fillRect(0, 0, w, h); x.fillStyle = '#DC2626'; x.font = '900 104px "Noto Sans JP","Yu Gothic","MS Gothic",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('火', w / 2, h / 2 + 6); });
    const f = 0.55, n = new T.Vector2(0.42, 0.88).normalize();
    P(G('kanjiplane', () => new T.PlaneGeometry(0.26, 0.26)), kanji, 0, 0.21 - 0.42 * f + n.y * 0.012, 0.88 * f + n.x * 0.012, c, -Math.atan2(0.88, 0.42));
  } }
};

// face accessories: g = head group
const FZ = HR + 0.01;
function arms2(g, m, y) { [-1, 1].forEach(s => P(rbox(0.02, 0.025, 0.32, 0.01), m, s * (HR + 0.02), y, 0.14, g)); }
const FACE = {
  f1: { build(g) {
    const fr = mat('#0B0B12', { roughness: 0.15, metalness: 0.4 });
    [-1, 1].forEach(s => P(rbox(0.17, 0.11, 0.03, 0.035), fr, s * 0.1, 0.04, FZ + 0.02 - 0.012, g, 0, s * 0.28));
    P(rbox(0.06, 0.02, 0.02, 0.008), fr, 0, 0.06, FZ + 0.03, g); arms2(g, fr, 0.06);
    [-1, 1].forEach(s => P(rbox(0.05, 0.012, 0.005, 0.004), mat('#FFFFFF', { transparent: true, opacity: 0.6 }), s * 0.1 - 0.03, 0.075, FZ + 0.042 - 0.012 - s * 0.012, g, 0, s * 0.28, 0.4));
  } },
  f2: { build(g) {
    const k = mat('#111111');
    [-1, 1].forEach(s => { P(tor(0.065, 0.012, 8, 24), k, s * 0.105, 0.04, FZ + 0.025, g, 0, s * 0.3); P(cyl(0.06, 0.06, 0.004, 20), glass('#E0F2FE', 0.3), s * 0.105, 0.04, FZ + 0.024, g, Math.PI / 2, 0, s * 0.3); });
    P(rbox(0.06, 0.016, 0.016, 0.006), k, 0, 0.05, FZ + 0.035, g); arms2(g, k, 0.05);
    P(sph(0.055, 16, 12), mat('#F4B8A0'), 0, -0.025, FZ + 0.045, g, 0, 0, 0, 1, 1.1, 1);
    [-1, 1].forEach(s => P(sph(0.06, 14, 10), mat('#3A2416'), s * 0.055, -0.085, FZ + 0.03, g, 0, 0, s * 0.35, 1.4, 0.55, 0.5));
    [-1, 1].forEach(s => P(rbox(0.11, 0.03, 0.02, 0.012), mat('#3A2416'), s * 0.105, 0.135, FZ + 0.01, g, 0, s * 0.3, s * -0.12));
  } },
  f3: { build(g) {
    const k = mat('#2B2B3A', { roughness: 0.3 });
    [-1, 1].forEach(s => { P(tor(0.072, 0.014, 8, 28), k, s * 0.105, 0.035, FZ + 0.03, g, 0, s * 0.3); P(cyl(0.066, 0.066, 0.004, 24), glass('#DBEAFE', 0.28), s * 0.105, 0.035, FZ + 0.028, g, Math.PI / 2, 0, s * 0.3); });
    P(tor(0.03, 0.01, 6, 12, Math.PI), k, 0, 0.04, FZ + 0.045, g); arms2(g, k, 0.05);
  } },
  f4: { build(g) {
    P(cyl(HR + 0.035, HR + 0.035, 0.08, 48, true), mat('#333333', { side: T.DoubleSide }), 0, 0.04, 0, g);
    [-1, 1].forEach(s => {
      const l = grp(g, s * 0.11, 0.04, FZ + 0.04, 0, s * 0.3, 0);
      P(cyl(0.095, 0.095, 0.09, 28), mat('#3FD0FF', { roughness: 0.35 }), 0, 0, 0, l, Math.PI / 2);
      P(tor(0.092, 0.018, 8, 28), mat('#1F2937'), 0, 0, 0.045, l);
      P(cyl(0.08, 0.08, 0.01, 28), glass('#67E8F9', 0.55), 0, 0, 0.047, l, Math.PI / 2);
    });
  } },
  f5: { build(g) {
    const c = '#2B3A67';
    P(G('mask', () => new T.CylinderGeometry(HR + 0.022, HR + 0.022, 0.22, 48, 1, true, -Math.PI * 0.62, Math.PI * 1.24)), mat(c, { side: T.DoubleSide }), 0, -0.1, 0, g);
    P(G('maskcap', () => new T.CylinderGeometry(HR + 0.022, HR - 0.05, 0.04, 48, 1, true, -Math.PI * 0.62, Math.PI * 1.24)), mat(shade(c, -.05), { side: T.DoubleSide }), 0, 0.01, 0, g, Math.PI);
    P(rbox(0.035, 0.06, 0.03, 0.012), mat(shade(c, .1)), 0, -0.03, FZ + 0.03, g);
  } },
  f6: { build(g) {
    const m = GOLD();
    P(tor(0.075, 0.014, 8, 28), m, 0.105, 0.035, FZ + 0.03, g, 0, 0.3);
    P(cyl(0.07, 0.07, 0.004, 24), glass('#FEF3C7', 0.3), 0.105, 0.035, FZ + 0.028, g, Math.PI / 2, 0, 0.3);
    P(tube('monochain', [[0.17, 0.0, FZ + 0.01], [0.24, -0.12, FZ - 0.02], [0.3, -0.25, FZ - 0.1], [HR + 0.02, -0.3, 0.12]], 0.008, 0.008, 20, 5), m, 0, 0, 0, g);
  } },
  f7: { eyes: true, build() {} },
  fl1: { eyes: true, build() {} }
};

// ---------- gear (weapons): grip at origin, pointing +y ----------
function katana(g, hilt, opts) {
  opts = opts || {};
  const k = grp(g);
  const wrap = tmat('tsuka:' + hilt, 64, 256, (c, w, h) => { c.fillStyle = hilt; c.fillRect(0, 0, w, h); c.fillStyle = '#F1F5F9'; for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(w / 2, y + 4); c.lineTo(w - 8, y + 16); c.lineTo(w / 2, y + 28); c.lineTo(8, y + 16); c.closePath(); c.fill(); } });
  P(rbox(0.075, 0.36, 0.055, 0.025), wrap, 0, 0.0, 0, k);
  P(rbox(0.085, 0.04, 0.065, 0.015), GOLD(), 0, -0.19, 0, k);
  P(cyl(0.11, 0.11, 0.025, 24), opts.guard || metal('#2a2a2a', 0.4), 0, 0.2, 0, k, 0, 0, 0, 1, 1, 0.7);
  P(rbox(0.07, 0.06, 0.04, 0.012), GOLD(), 0, 0.24, 0, k);
  if (opts.sheathed) {
    P(rbox(0.085, 1.16, 0.06, 0.03), mat(opts.saya || '#111111', { roughness: 0.25 }), 0, 0.84, 0, k);
    P(rbox(0.09, 0.05, 0.065, 0.02), GOLD(), 0, 0.5, 0, k);
  } else {
    P(extrude('blade', s => { s.moveTo(-0.03, 0); s.lineTo(0.03, 0); s.quadraticCurveTo(0.05, 0.6, 0.06, 1.08); s.lineTo(0.0, 1.2); s.quadraticCurveTo(-0.0, 0.6, -0.03, 0); }, 0.012, 0.004), metal('#E7ECF1', 0.18), 0, 0.26, 0, k);
    P(extrude('bladeEdge', s => { s.moveTo(0.012, 0.02); s.lineTo(0.03, 0.02); s.quadraticCurveTo(0.05, 0.6, 0.06, 1.08); s.lineTo(0.03, 1.12); s.quadraticCurveTo(0.03, 0.6, 0.012, 0.02); }, 0.016, 0.002), mat('#FFFFFF', { roughness: 0.1, metalness: 0.2 }), 0, 0.26, 0, k);
  }
  return k;
}
const WEAPON = {
  w1: { build(g) {
    const m = metal('#D7DEE6', 0.22);
    P(rbox(0.075, 0.82, 0.04, 0.02), m, 0, 0.18, 0, g);
    P(sph(0.17, 28, 18), m, 0, 0.74, 0, g, 0, 0, 0, 1, 1.32, 0.38);
    P(sph(0.14, 24, 14), metal('#AEB8C3', 0.3), 0, 0.75, 0.035, g, 0, 0, 0, 1, 1.3, 0.12);
  } },
  w2: { build(g) {
    P(cyl(0.065, 0.065, 0.8, 24), mat('#2563EB', { roughness: 0.3 }), 0, 0.3, 0, g);
    P(cyl(0.068, 0.068, 0.22, 24), mat('#111827'), 0, 0.02, 0, g);
    P(cone(0.065, 0.18, 24), mat('#F8FAFC'), 0, 0.79, 0, g);
    P(cone(0.02, 0.05, 12), mat('#111827'), 0, 0.89, 0, g);
    P(cyl(0.068, 0.06, 0.08, 24), mat('#111827'), 0, -0.13, 0, g);
    P(rbox(0.03, 0.34, 0.025, 0.01), SILVER(), 0, 0.42, 0.075, g);
  } },
  w3: { build(g) {
    P(rbox(0.1, 0.78, 0.07, 0.035), mat('#22D3EE', { roughness: 0.25 }), 0, 0.22, 0, g);
    P(rbox(0.11, 0.2, 0.08, 0.035), mat('#0891B2', { roughness: 0.4 }), 0, 0.05, 0, g);
    P(rbox(0.12, 0.26, 0.07, 0.03), mat('#0EA5E9', { roughness: 0.25 }), 0, 0.72, 0, g);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) P(rbox(0.04, 0.04, 0.1, 0.012), mat(r % 2 ? '#F8FAFC' : '#7DD3FC'), (c - 0.5) * 0.05, 0.62 + r * 0.06, 0.07, g);
  } },
  w4: { build(g) {
    P(cyl(0.055, 0.06, 1.0, 16), mat('#A16207'), 0, 0.3, 0, g);
    P(rbox(0.5, 0.22, 0.22, 0.04), metal('#6B7280', 0.4), 0, 0.86, 0, g);
    P(cyl(0.12, 0.12, 0.03, 20), metal('#4B5563'), 0.25, 0.86, 0, g, 0, 0, Math.PI / 2);
    const bug = grp(g, -0.27, 0.86, 0, 0, 0, Math.PI / 2);
    P(G('bugdome', () => new T.SphereGeometry(0.1, 20, 12, 0, tau, 0, Math.PI / 2)), mat('#EF4444', { roughness: 0.25 }), 0, 0, 0, bug);
    [[0.04, 0.03], [-0.045, 0.02], [0.0, -0.05]].forEach(([x, z]) => P(sph(0.022, 8, 6), mat('#111111'), x, 0.08, z, bug));
    P(rbox(0.01, 0.1, 0.12, 0.004), mat('#111111'), 0, 0.06, 0, bug);
    P(cyl(0.07, 0.065, 0.12, 16), mat('#1F2937'), 0, -0.16, 0, g);
  } },
  w5: { build(g) {
    P(cyl(0.055, 0.055, 0.36, 12), mat('#F8FAFC'), 0, 0.0, 0, g);
    P(cyl(0.03, 0.03, 0.34, 10), metal('#94A3B8'), 0, 0.34, 0, g);
    const h = grp(g, 0, 0.82, 0);
    P(tor(0.24, 0.028, 10, 40), mat('#E11D48', { roughness: 0.3 }), 0, 0, 0, h, 0, 0, 0, 1, 1.3, 1);
    const strings = tmat('strings', 128, 128, (c, w, hh) => { c.clearRect(0, 0, w, hh); c.strokeStyle = '#F1F5F9'; c.lineWidth = 2; for (let i = 4; i < w; i += 11) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, hh); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }, { transparent: true, alphaTest: 0.3, side: T.DoubleSide });
    P(G('racketface', () => new T.CircleGeometry(0.235, 32)), strings, 0, 0, 0, h, 0, 0, 0, 1, 1.3, 1);
    [-1, 1].forEach(s => P(cyl(0.02, 0.02, 0.24, 8), mat('#E11D48'), s * 0.06, -0.38, 0, g, 0, 0, s * 0.3));
  } },
  w6: { build(g) {
    const ball = tmat('basketball', 512, 256, (c, w, h) => {
      c.fillStyle = '#EA580C'; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 2600; i++) { c.fillRect((i * 97) % w, (i * 57 + (i >> 4)) % h, 2, 2); }
      c.strokeStyle = '#3B1405'; c.lineWidth = 6;
      [0, .25, .5, .75].forEach(u => { c.beginPath(); c.moveTo(u * w, 0); c.lineTo(u * w, h); c.stroke(); });
      c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
      [.125, .625].forEach(u => { c.beginPath(); for (let y = 0; y <= h; y += 4) { const x = u * w + Math.sin(y / h * Math.PI) * w * .09; y ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.beginPath(); for (let y = 0; y <= h; y += 4) { const x = u * w - Math.sin(y / h * Math.PI) * w * .09; y ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); });
    });
    P(sph(0.3, 40, 28), ball, 0, 0.36, 0.0, g, 0.4, 0.5, 0);
  } },
  w7: { build(g) {
    P(tor(0.07, 0.018, 8, 20), SILVER(), 0, -0.24, 0, g);
    const wrap = tmat('kunaiwrap', 64, 128, (c, w, h) => { c.fillStyle = '#1F2937'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6B7280'; c.lineWidth = 5; for (let y = -20; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + 14); c.stroke(); } });
    P(cyl(0.045, 0.04, 0.3, 12), wrap, 0, -0.03, 0, g);
    P(extrude('kunai', s => { s.moveTo(0, 0.62); s.lineTo(0.11, 0.14); s.lineTo(0.03, 0.0); s.lineTo(-0.03, 0.0); s.lineTo(-0.11, 0.14); s.closePath(); }, 0.03, 0.012), metal('#CBD5E1', 0.2), 0, 0.12, 0, g);
    P(rbox(0.012, 0.5, 0.045, 0.004), metal('#94A3B8', 0.3), 0, 0.4, 0, g);
  } },
  w8: { build(g) {
    P(cyl(0.045, 0.055, 1.75, 12), mat('#7C4A2D'), 0, 0.3, 0, g);
    P(tor(0.05, 0.015, 6, 14), GOLD(), 0, 1.1, 0, g, Math.PI / 2);
    P(sph(0.14, 28, 20), mat('#A78BFA', { emissive: new T.Color('#7C3AED'), emissiveIntensity: 0.55, roughness: 0.15 }), 0, 1.3, 0, g);
    for (let i = 0; i < 3; i++) { const a = i / 3 * tau; P(tube('prong' + i, [[0, 1.12, 0], [Math.sin(a) * 0.14, 1.22, Math.cos(a) * 0.14], [Math.sin(a) * 0.12, 1.38, Math.cos(a) * 0.12]], 0.02, 0.008, 10, 6), GOLD(), 0, 0, 0, g); }
    P(extrude('star', s => { for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.055 : 0.13, a = i / 10 * tau + Math.PI / 2; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); }, 0.04, 0.012), glow('#FDE047', 0.7), 0, 1.6, 0, g);
  } },
  w9: { build(g) { katana(g, '#111827'); },
    preview(g) { [-0.42, 0, 0.42].forEach((r, i) => { const k = grp(g, 0, 0, 0, 0, 0, r); katana(k, ['#1E3A8A', '#111827', '#7F1D1D'][i]); }); },
    extra(ctx) {
      // second sword clenched between the teeth
      const m = grp(ctx.head, -0.04, -0.105, HR + 0.06, 0, 0.12, -Math.PI / 2); m.userData.slot = 'weapon';
      katana(m, '#F8FAFC');
      // third sword carried on the back — handle UP, peeking over the right shoulder
      const h = grp(ctx.rig, -0.36, 2.12, -0.33, 0, 0, Math.PI + 0.62); h.userData.slot = 'weapon';
      katana(h, '#7F1D1D', { sheathed: true, saya: '#1F2937' });
      P(rbox(0.07, 1.25, 0.03, 0.012), mat('#7F1D1D'), 0.02, 2.0, 0.29, ctx.rig, 0, 0, -0.62).userData.slot = 'weapon'; // strap across the chest
    } },
  w10: { build(g) {
    const body = grp(g, 0, 0.92, 0);
    P(extrude('violin', s => {
      s.moveTo(0, -0.34);
      s.bezierCurveTo(0.26, -0.34, 0.27, -0.06, 0.16, -0.02); s.bezierCurveTo(0.1, 0.0, 0.1, 0.06, 0.15, 0.09);
      s.bezierCurveTo(0.24, 0.14, 0.2, 0.32, 0, 0.3); s.bezierCurveTo(-0.2, 0.32, -0.24, 0.14, -0.15, 0.09);
      s.bezierCurveTo(-0.1, 0.06, -0.1, 0.0, -0.16, -0.02); s.bezierCurveTo(-0.27, -0.06, -0.26, -0.34, 0, -0.34);
    }, 0.09, 0.02), mat('#B45309', { roughness: 0.3 }), 0, 0, 0, body);
    [-1, 1].forEach(s => P(extrude('fhole', sh => { sh.moveTo(0, -0.06); sh.quadraticCurveTo(0.02, 0, 0, 0.06); sh.lineTo(0.008, 0.06); sh.quadraticCurveTo(0.028, 0, 0.008, -0.06); sh.closePath(); }, 0.01, 0), mat('#1F1208'), s * 0.07, -0.02, 0.064, body, 0, 0, 0, s, 1, 1));
    P(rbox(0.06, 0.62, 0.03, 0.012), mat('#111111', { roughness: 0.3 }), 0, -0.12, 0.068, body);
    P(rbox(0.1, 0.03, 0.04, 0.01), mat('#E7C9A0'), 0, -0.12, 0.08, body);
    P(rbox(0.13, 0.08, 0.05, 0.02), mat('#1F2937'), 0.05, -0.31, 0.06, body);
    for (let i = 0; i < 4; i++) P(cyl(0.004, 0.004, 0.86, 4), mat('#F5F5F4'), (i - 1.5) * 0.014, 0.1, 0.09, body);
    P(rbox(0.055, 0.5, 0.045, 0.015), mat('#78350F'), 0, 0.35, 0, g);
    P(tor(0.045, 0.02, 8, 16), mat('#78350F'), 0, 0.04, 0, g, 0, Math.PI / 2);
    P(rbox(0.08, 0.14, 0.06, 0.02), mat('#5B2A0A'), 0, 0.13, 0, g);
    [0.09, 0.16].forEach(y => [-1, 1].forEach(s => P(cyl(0.012, 0.012, 0.07, 6), mat('#1F1208'), s * 0.05, y, 0, g, 0, 0, Math.PI / 2)));
  } },
  wq1: { build(g) {
    const wrap = tmat('gherkwrap', 64, 128, (c, w, h) => { c.fillStyle = '#78350F'; c.fillRect(0, 0, w, h); c.strokeStyle = '#A16207'; c.lineWidth = 5; for (let y = -20; y < h; y += 14) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + 12); c.stroke(); } });
    P(cyl(0.05, 0.05, 0.3, 12), wrap, 0, 0, 0, g);
    P(sph(0.06, 12, 8), GOLD(), 0, -0.17, 0, g);
    P(rbox(0.36, 0.06, 0.1, 0.025), GOLD(), 0, 0.17, 0, g);
    P(lathe('pickle', [[0, 0], [0.09, 0.03], [0.12, 0.15], [0.125, 0.5], [0.115, 0.85], [0.08, 0.98], [0, 1.02]], 24), mat('#4D7C0F', { roughness: 0.55 }), 0, 0.2, 0, g);
    seed = 5; for (let i = 0; i < 26; i++) { const a = rnd() * tau, y = 0.3 + rnd() * 0.75, r = 0.118; P(sph(0.022, 8, 6), mat('#84CC16'), Math.sin(a) * r, y, Math.cos(a) * r, g); }
  } },
  wq2: { build(g) {
    P(cyl(0.045, 0.05, 1.5, 12), mat('#A16207'), 0, 0.12, 0, g);
    P(cyl(0.12, 0.12, 0.12, 20), mat('#DC2626'), 0, -0.66, 0, g);
    const bristle = tmat('bristle', 128, 128, (c, w, h) => { c.fillStyle = '#FCD34D'; c.fillRect(0, 0, w, h); c.strokeStyle = '#D97706'; c.lineWidth = 2; for (let x = 2; x < w; x += 5) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (x % 3) - 1, h); c.stroke(); } });
    P(cyl(0.12, 0.3, 0.5, 24), bristle, 0, -0.97, 0, g, 0, 0, 0, 1, 1, 0.55);
    [-0.8, -0.86].forEach(y => P(tor(0.165, 0.012, 6, 24), mat('#B45309'), 0, y, 0, g, Math.PI / 2, 0, 0, 1, 0.58, 1));
  } },
  wm2: { build(g) {
    P(cyl(0.05, 0.05, 0.3, 12), mat('#1E293B'), 0, 0, 0, g);
    P(rbox(0.3, 0.06, 0.1, 0.025), mat('#38BDF8', { emissive: new T.Color('#0EA5E9'), emissiveIntensity: 0.4 }), 0, 0.17, 0, g);
    P(extrude('chidori', s => { s.moveTo(-0.03, 0); s.lineTo(0.05, 0); s.lineTo(0.09, 0.28); s.lineTo(0.0, 0.32); s.lineTo(0.12, 0.62); s.lineTo(0.02, 0.66); s.lineTo(0.08, 1.12); s.lineTo(-0.1, 0.62); s.lineTo(0.0, 0.58); s.lineTo(-0.12, 0.3); s.lineTo(-0.02, 0.27); s.closePath(); }, 0.04, 0.015), glow('#BAE6FD', 0.9), 0, 0.2, 0, g);
    seed = 9; for (let i = 0; i < 9; i++) { const y = 0.3 + rnd() * 0.9, a = rnd() * tau; P(rbox(0.14, 0.018, 0.018, 0.006), glow('#E0F2FE', 1.2), Math.cos(a) * 0.15, y, Math.sin(a) * 0.15, g, 0, a, (rnd() - 0.5) * 1.6); }
  } },
  wm1: { build(g) {
    const m = mat('#A855F7', { roughness: 0.25 });
    P(sph(0.13, 20, 14), mat('#7E22CE', { roughness: 0.25 }), 0, -0.08, 0, g);
    P(lathe('wobble', [[0, 0], [0.1, 0.02], [0.105, 0.6], [0.09, 0.74], [0.05, 0.81], [0, 0.83]], 28), m, 0, 0.0, 0, g, 0, 0, 0.12);
    P(rbox(0.02, 0.4, 0.02, 0.008), mat('#E9D5FF', { transparent: true, opacity: 0.7 }), -0.04, 0.35, 0.09, g, 0, 0, 0.12);
  } }
};

// ---------- relics (float beside the character) ----------
const RELIC = {
  r1(g) {
    P(extrude('onigiri', s => { s.moveTo(0, 0.24); s.quadraticCurveTo(0.06, 0.26, 0.21, -0.06); s.quadraticCurveTo(0.24, -0.16, 0.12, -0.17); s.lineTo(-0.12, -0.17); s.quadraticCurveTo(-0.24, -0.16, -0.21, -0.06); s.quadraticCurveTo(-0.06, 0.26, 0, 0.24); }, 0.16, 0.05), mat('#FAFAF7', { roughness: 0.85 }), 0, 0, 0, g);
    P(rbox(0.2, 0.17, 0.28, 0.02), mat('#111827', { roughness: 0.5 }), 0, -0.13, 0, g);
    seed = 3; for (let i = 0; i < 6; i++) P(sph(0.008, 6, 4), mat('#111111'), (rnd() - 0.5) * 0.2, 0.02 + rnd() * 0.12, 0.13, g, 0, 0, 0, 1.6, 1, 1);
  },
  r2(g) {
    const label = tmat('juice', 128, 192, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FDBA74'); gr.addColorStop(1, '#F97316'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#FFF7ED'; c.beginPath(); c.arc(w / 2, h * .45, 34, 0, tau); c.fill(); c.fillStyle = '#F97316'; c.beginPath(); c.arc(w / 2, h * .45, 26, 0, tau); c.fill(); c.strokeStyle = '#FFF7ED'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { const a = i / 8 * tau; c.beginPath(); c.moveTo(w / 2, h * .45); c.lineTo(w / 2 + Math.cos(a) * 24, h * .45 + Math.sin(a) * 24); c.stroke(); } c.fillStyle = '#16A34A'; c.beginPath(); c.ellipse(w / 2 + 14, h * .45 - 34, 14, 7, -.5, 0, tau); c.fill(); c.fillStyle = '#7C2D12'; c.font = '900 24px Arial'; c.textAlign = 'center'; c.fillText('JUICE', w / 2, h * .85); });
    const o = mat('#FB923C');
    P(rbox(0.3, 0.44, 0.2, 0.025), [o, o, mat('#FFEDD5'), o, label, label], 0, 0, 0, g);
    P(tube('straw', [[0.06, 0.2, 0.02], [0.06, 0.4, 0.02], [0.1, 0.46, 0.02], [0.18, 0.47, 0.02]], 0.018, 0.018, 12, 8), mat('#F8FAFC'), 0, 0, 0, g);
  },
  r3(g) {
    P(lathe('bowl', [[0, -0.18], [0.16, -0.18], [0.17, -0.2], [0.28, -0.12], [0.34, 0.04], [0.35, 0.08], [0.33, 0.08], [0.31, 0.03], [0.2, -0.1], [0, -0.13]], 40), mat('#DC2626', { side: T.DoubleSide, roughness: 0.3 }), 0, 0, 0, g);
    P(tor(0.34, 0.015, 6, 40), mat('#F8FAFC'), 0, 0.075, 0, g, Math.PI / 2);
    P(cyl(0.31, 0.31, 0.02, 40), mat('#E9A54A', { roughness: 0.35 }), 0, 0.03, 0, g);
    seed = 4; for (let i = 0; i < 9; i++) { const a = rnd() * tau, r = 0.05 + rnd() * 0.18; P(tube('noodle' + i, [[Math.cos(a) * r, 0.04, Math.sin(a) * r], [Math.cos(a + .6) * (r + .05), 0.06, Math.sin(a + .6) * (r + .05)], [Math.cos(a + 1.2) * r, 0.045, Math.sin(a + 1.2) * r]], 0.014, 0.014, 10, 5), mat('#FDE68A'), 0, 0, 0, g); }
    const egg = grp(g, 0.12, 0.05, 0.1, -0.3, 0, 0.2);
    P(G('egghalf', () => new T.SphereGeometry(0.08, 18, 12, 0, tau, 0, Math.PI / 2)), mat('#FFFFFF'), 0, 0, 0, egg, Math.PI, 0, 0, 1, 1.3, 1);
    P(cyl(0.045, 0.045, 0.01, 16), mat('#F59E0B'), 0, 0.003, 0, egg);
    const naru = tmat('naruto', 128, 128, (c, w, h) => { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); c.strokeStyle = '#EC4899'; c.lineWidth = 8; c.beginPath(); for (let t = 0; t < 14; t += .1) { const r = t * 4, x = w / 2 + Math.cos(t) * r, y = h / 2 + Math.sin(t) * r; t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); });
    P(cyl(0.07, 0.07, 0.025, 20), [mat('#FFFFFF'), naru, naru], -0.12, 0.06, 0.08, g, 0.3, 0, 0);
    P(rbox(0.16, 0.2, 0.01, 0.005), mat('#14532D'), -0.05, 0.12, -0.2, g, -0.2);
    P(rbox(0.13, 0.03, 0.09, 0.02), mat('#C08457'), 0.06, 0.05, -0.08, g, 0, 0.6);
    [-1, 1].forEach(s => P(cyl(0.012, 0.009, 0.7, 8), mat('#D6A85F'), s * 0.03 + 0.1, 0.14, 0.0, g, 0, 0, Math.PI / 2 - 0.2));
  },
  r4(g) {
    const c = grp(g, 0, 0, 0, Math.PI / 2, 0, 0);
    const face = tmat('compass', 256, 256, (x, w, h) => {
      x.fillStyle = '#FEF9E7'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1F2937'; x.lineWidth = 3; x.beginPath(); x.arc(w / 2, h / 2, 110, 0, tau); x.stroke();
      for (let i = 0; i < 16; i++) { const a = i / 16 * tau, r1 = i % 4 ? 96 : 86; x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * r1, h / 2 + Math.sin(a) * r1); x.lineTo(w / 2 + Math.cos(a) * 106, h / 2 + Math.sin(a) * 106); x.stroke(); }
      x.fillStyle = '#1F2937'; x.font = '900 30px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; [['N', 0, -64], ['E', 64, 0], ['S', 0, 64], ['W', -64, 0]].forEach(([t, dx, dy]) => x.fillText(t, w / 2 + dx, h / 2 + dy));
      x.fillStyle = '#DC2626'; x.beginPath(); x.moveTo(w / 2 + 50, h / 2 - 50); x.lineTo(w / 2 + 10, h / 2 - 6); x.lineTo(w / 2 - 6, h / 2 + 10); x.closePath(); x.fill();
      x.fillStyle = '#64748B'; x.beginPath(); x.moveTo(w / 2 - 50, h / 2 + 50); x.lineTo(w / 2 + 10, h / 2 - 6); x.lineTo(w / 2 - 6, h / 2 + 10); x.closePath(); x.fill();
      x.fillStyle = '#E8B923'; x.font = '900 20px Arial'; x.fillText('PROD', w / 2, h / 2 + 30);
    });
    const gm = GOLD();
    P(cyl(0.26, 0.26, 0.08, 40), [gm, face, gm], 0, 0, 0, c);
    P(tor(0.26, 0.025, 8, 40), gm, 0, 0.04, 0, c, Math.PI / 2);
    P(cyl(0.24, 0.24, 0.004, 40), glass('#FFFFFF', 0.18), 0, 0.045, 0, c);
    P(cyl(0.035, 0.035, 0.06, 12), gm, 0, 0.29, 0, g);
    P(tor(0.05, 0.014, 8, 18), gm, 0, 0.36, 0, g);
  },
  r5(g) {
    const paper = tmat('scrollpaper', 256, 192, (c, w, h) => { c.fillStyle = '#F5E6C4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7C2D12'; c.lineWidth = 3; for (let x = 30; x < w - 20; x += 26) { for (let y = 20; y < h - 20; y += 22) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6 + (x * y) % 8, y + 10); c.stroke(); } } c.fillStyle = '#B91C1C'; c.fillRect(w - 40, h - 46, 26, 26); });
    P(cyl(0.075, 0.075, 0.52, 24), mat('#F5E6C4'), 0, 0.12, 0, g, 0, 0, Math.PI / 2);
    P(rbox(0.48, 0.3, 0.012, 0.004), [paper, paper, paper, paper, paper, paper], 0, -0.06, 0.04, g, -0.15);
    P(cyl(0.06, 0.06, 0.48, 16), mat('#EAD7AE'), 0, -0.22, 0.07, g, 0, 0, Math.PI / 2);
    [-1, 1].forEach(s => { P(cyl(0.035, 0.035, 0.08, 12), mat('#78350F'), s * 0.3, 0.12, 0, g, 0, 0, Math.PI / 2); P(sph(0.045, 12, 8), mat('#78350F'), s * 0.35, 0.12, 0, g); P(sph(0.04, 10, 8), mat('#78350F'), s * 0.28, -0.22, 0.07, g); });
    P(tor(0.08, 0.018, 8, 20), mat('#DC2626'), 0, 0.12, 0, g, 0, Math.PI / 2, 0);
    P(rbox(0.04, 0.16, 0.012, 0.005), mat('#DC2626'), 0.03, 0.0, 0.08, g, 0, 0, 0.3);
  },
  r6(g) {
    P(sph(0.22, 28, 20), mat('#9A3412', { roughness: 0.5 }), 0, 0, 0, g, 0, 0, 0.3, 1.25, 1, 1);
    P(sph(0.14, 20, 14), mat('#C2410C', { roughness: 0.45 }), -0.07, 0.07, 0.1, g, 0, 0, 0.3, 1.1, 0.8, 0.7);
    P(cyl(0.05, 0.05, 0.72, 14), mat('#FAFAF5'), 0, 0, 0, g, 0, 0, Math.PI / 2 + 0.3);
    [-1, 1].forEach(s => { const x = s * 0.36 * Math.cos(0.3), y = s * 0.36 * Math.sin(0.3); [-1, 1].forEach(k => P(sph(0.065, 14, 10), mat('#FAFAF5'), x + k * 0.03 * Math.sin(0.3), y - k * 0.045, 0, g)); });
  },
  r7(g) {
    P(sph(0.22, 36, 24), glass('#C4B5FD', 0.5), 0, 0.08, 0, g);
    P(sph(0.12, 24, 16), glow('#E879F9', 0.9), 0, 0.08, 0, g);
    P(sph(0.06, 16, 10), glow('#FFFFFF', 1.1), 0.04, 0.12, 0.05, g);
    P(lathe('ballstand', [[0, -0.27], [0.2, -0.27], [0.2, -0.22], [0.12, -0.18], [0.09, -0.1], [0.14, -0.08], [0, -0.08]], 32), GOLD(), 0, 0, 0, g);
    for (let i = 0; i < 3; i++) { const a = i / 3 * tau; P(tube('claw' + i, [[Math.sin(a) * 0.1, -0.1, Math.cos(a) * 0.1], [Math.sin(a) * 0.19, -0.03, Math.cos(a) * 0.19], [Math.sin(a) * 0.17, 0.06, Math.cos(a) * 0.17]], 0.02, 0.008, 10, 6), GOLD(), 0, 0, 0, g); }
  },
  r8(g) {
    P(lathe('glass', [[0, -0.22], [0.13, -0.22], [0.16, 0.22], [0.15, 0.22], [0.12, -0.2], [0, -0.2]], 32), glass('#F8FAFC', 0.35), 0, 0, 0, g);
    P(cyl(0.142, 0.122, 0.3, 28), mat('#FDE68A', { roughness: 0.2 }), 0, -0.06, 0, g);
    P(sph(0.06, 16, 12), mat('#F59E0B', { roughness: 0.15 }), 0.03, 0.1, 0.03, g, 0, 0, 0, 1, 0.6, 1);
    P(G('eggshell', () => new T.SphereGeometry(0.08, 16, 10, 0, tau, Math.PI / 2, Math.PI / 2)), mat('#FFF7ED', { side: T.DoubleSide }), -0.1, 0.26, 0.0, g, 0.6, 0, 0.5, 1, 1.25, 1);
    const stripes = tmat('strawstripe', 32, 128, (c, w, h) => { for (let y = 0; y < h; y += 16) { c.fillStyle = '#EF4444'; c.fillRect(0, y, w, 8); c.fillStyle = '#FFFFFF'; c.fillRect(0, y + 8, w, 8); } });
    P(tube('shakestraw', [[0.04, -0.15, 0], [0.06, 0.25, 0], [0.12, 0.34, 0], [0.2, 0.36, 0]], 0.016, 0.016, 14, 8), stripes, 0, 0, 0, g);
  },
  rq1(g) {
    const green = mat('#4ADE80', { roughness: 0.5 }), dk = mat('#15803D');
    P(sph(0.24, 32, 22), green, 0, 0, 0, g, 0, 0, 0, 1.2, 0.85, 0.85);
    P(sph(0.18, 24, 16), mat('#BBF7D0'), 0, -0.05, 0.08, g, 0, 0, 0, 1.15, 0.75, 0.6);
    [-1, 1].forEach(s => { P(sph(0.075, 16, 12), green, s * 0.13, 0.17, 0.08, g); P(sph(0.05, 14, 10), mat('#FFFFFF'), s * 0.13, 0.18, 0.13, g); P(sph(0.028, 10, 8), mat('#111111'), s * 0.13, 0.185, 0.17, g); });
    P(G('frogmouth', () => new T.TorusGeometry(0.16, 0.012, 6, 24, Math.PI)), dk, 0, 0.06, 0.17, g, 0, 0, Math.PI, 1, 0.45, 1);
    [-1, 1].forEach(s => P(sph(0.04, 12, 8), SILVER(), s * 0.04, 0.22, -0.05, g));
    P(tor(0.06, 0.008, 6, 16, Math.PI), SILVER(), 0, 0.22, -0.05, g);
    [-1, 1].forEach(s => P(sph(0.055, 12, 8), dk, s * 0.22, -0.17, 0.08, g, 0, 0, 0, 1.3, 0.5, 1.2));
  },
  rq2(g) {
    const gold = mat('#E8B923', { metalness: 0.3, roughness: 0.28 });
    P(rbox(0.52, 0.34, 0.035, 0.012), gold, 0, 0, 0, g);
    P(extrude('flap', s => { s.moveTo(-0.25, 0.16); s.lineTo(0.25, 0.16); s.lineTo(0, -0.04); s.closePath(); }, 0.01, 0.006), mat('#F5CB45', { metalness: 0.3, roughness: 0.25 }), 0, 0, 0.024, g);
    const seal = tmat('seal200', 128, 128, (c, w, h) => { c.fillStyle = '#B91C1C'; c.fillRect(0, 0, w, h); c.fillStyle = '#FEE2E2'; c.font = '900 40px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('200', w / 2, h / 2 - 12); c.font = '900 28px Arial'; c.fillText('OK', w / 2, h / 2 + 24); });
    P(cyl(0.075, 0.08, 0.025, 24), [mat('#B91C1C'), seal, mat('#B91C1C')], 0, -0.03, 0.045, g, Math.PI / 2);
  },
  rm1(g) {
    const gm = GOLD();
    P(lathe('cup', [[0, -0.05], [0.04, -0.05], [0.05, 0.0], [0.17, 0.08], [0.21, 0.22], [0.22, 0.32], [0.2, 0.32], [0.19, 0.23], [0.15, 0.11], [0, 0.07]], 36), mat('#E8B923', { metalness: 0.3, roughness: 0.25, side: T.DoubleSide }), 0, 0, 0, g);
    P(cyl(0.035, 0.05, 0.16, 16), gm, 0, -0.12, 0, g);
    P(cyl(0.12, 0.14, 0.05, 28), gm, 0, -0.22, 0, g);
    P(rbox(0.32, 0.12, 0.32, 0.02), mat('#3F2A1D'), 0, -0.3, 0, g);
    P(rbox(0.14, 0.05, 0.01, 0.005), gm, 0, -0.3, 0.161, g);
    [-1, 1].forEach(s => P(G('handle', () => new T.TorusGeometry(0.08, 0.018, 8, 20, Math.PI)), gm, s * 0.2, 0.18, 0, g, 0, 0, s < 0 ? Math.PI / 2 : -Math.PI / 2));
    P(extrude('star', s => { for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.055 : 0.13, a = i / 10 * tau + Math.PI / 2; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); }, 0.04, 0.012), glow('#FFF3B0', 0.4), 0, 0.2, 0.2, g, 0, 0, 0, 0.45);
  }
};
/* ===== the dojo sensei (NPC) and scene poses ===== */
function senseiFace(g, w, h, mood) {
  const ppu = w / FW, X = u => w / 2 + u * ppu, Y = v => (FH / 2 - v) * ppu, S = v => v * ppu;
  g.lineCap = 'round'; g.lineJoin = 'round';
  [-1, 1].forEach(s => {
    const ex = X(s * 0.1), ey = Y(0.03);
    if (mood === 'happy') {
      g.strokeStyle = '#1d1533'; g.lineWidth = S(0.013);
      g.beginPath(); g.moveTo(ex - S(0.035), ey + S(0.008)); g.quadraticCurveTo(ex, ey - S(0.04), ex + S(0.035), ey + S(0.008)); g.stroke();
      g.fillStyle = 'rgba(255,150,180,.5)'; g.beginPath(); g.ellipse(X(s * 0.17), Y(-0.04), S(0.035), S(0.02), 0, 0, tau); g.fill();
    } else {
      g.fillStyle = '#1d1533'; g.beginPath(); g.ellipse(ex, ey, S(0.022), S(mood === 'sad' ? 0.028 : 0.032), 0, 0, tau); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - S(0.007), ey - S(0.012), S(0.007), 0, tau); g.fill();
      if (mood === 'sad') { g.fillStyle = 'rgba(96,165,250,.85)'; g.beginPath(); g.ellipse(ex + s * S(0.03), ey + S(0.05), S(0.008), S(0.014), 0, 0, tau); g.fill(); }
    }
  });
  g.strokeStyle = '#7A2E3B'; g.lineWidth = S(0.012); g.beginPath();
  if (mood === 'happy') { g.moveTo(X(-0.035), Y(-0.07)); g.quadraticCurveTo(X(0), Y(-0.1), X(0.035), Y(-0.07)); }
  else if (mood === 'sad') { g.moveTo(X(-0.03), Y(-0.09)); g.quadraticCurveTo(X(0), Y(-0.065), X(0.03), Y(-0.09)); }
  else { g.moveTo(X(-0.03), Y(-0.08)); g.lineTo(X(0.03), Y(-0.08)); }
  g.stroke();
}
function buildSensei(mood) {
  const spec = { hair: '#ECECEC', body: { id: '_sensei' }, legs: { id: '_hakama' }, feet: { id: '_zori' }, faceKind: 'sensei-' + mood };
  const rig = new T.Group();
  const head = buildHead(rig, spec);
  const white = mat('#ECECEC', { roughness: 0.8 }), white2 = mat('#F8F8F8', { roughness: 0.85 });
  // hair: bald crown, white tufts around the sides/back, top-knot
  [1.3, 1.65, 2.05, 2.5, 2.85].forEach((a, i) => [-1, 1].forEach(s => { const p = hp(s * a, 0.02 + (i % 2) * 0.08, 0.03); P(sph(0.12 + (i % 2) * 0.02, 14, 10), i % 2 ? white : white2, p[0], p[1], p[2], head, 0, 0, 0, 0.8, 1.15, 0.8); }));
  P(sph(0.13, 14, 10), white, 0, 0.05, -HR - 0.02, head, 0, 0, 0, 1, 1.1, 0.8);
  P(sph(0.11, 16, 12), white2, 0, HT + 0.13, -0.05, head);
  P(cyl(0.075, 0.085, 0.06, 16), mat('#C0392B'), 0, HT + 0.035, -0.05, head);
  // headband with a QA plate
  P(cyl(HR + 0.03, HR + 0.03, 0.09, 48, true), mat('#1F2A44', { side: T.DoubleSide }), 0, 0.2, 0, head);
  const qa = tmat('qaplate', 192, 96, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E5EAF0'); gr.addColorStop(1, '#AEB8C4'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#1F2A44'; c.font = '900 58px Arial Black, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('QA', w / 2, h / 2 + 3); }, { metalness: 0.25, roughness: 0.3 });
  const pm = metal('#C9D1DC');
  P(rbox(0.26, 0.13, 0.03, 0.012), [pm, pm, pm, pm, qa, pm], 0, 0.2, HR + 0.04, head);
  // bushy brows: their tilt shows the mood
  [-1, 1].forEach(s => {
    const rz = mood === 'sad' ? -s * 0.35 : mood === 'happy' ? -s * 0.12 : s * 0.18;
    P(rbox(0.14, 0.045, 0.05, 0.02), white, s * 0.1, mood === 'happy' ? 0.115 : 0.1, HR + 0.015, head, 0, 0, rz);
  });
  // long beard + droopy moustache
  P(extrude('beard', s => { s.moveTo(-0.21, 0); s.lineTo(-0.06, 0); s.quadraticCurveTo(0, -0.03, 0.06, 0); s.lineTo(0.21, 0); s.quadraticCurveTo(0.2, -0.24, 0.04, -0.46); s.lineTo(0, -0.52); s.lineTo(-0.04, -0.46); s.quadraticCurveTo(-0.2, -0.24, -0.21, 0); }, 0.08, 0.03), white2, 0, -0.1, HR - 0.005, head);
  [-1, 1].forEach(s => P(tube('mous' + s, [[0, -0.055, HR + 0.03], [s * 0.07, -0.07, HR + 0.035], [s * 0.13, -0.13, HR + 0.02], [s * 0.15, -0.2, HR]], 0.03, 0.012, 12, 8), white, 0, 0, 0, head));
  const body = buildBody(rig, spec);
  buildFeet(rig, spec.feet, body.legs);
  // staff in the right hand, standing on the ground
  body.arms[0].rotation.x = -0.25; body.arms[1].rotation.x = -0.12;
  P(cyl(0.05, 0.055, 2.75, 12), mat('#8B5A2B'), -ARM_X, 1.375, 0.21, rig);
  P(sph(0.09, 14, 10), mat('#A0522D'), -ARM_X, 2.78, 0.21, rig);
  P(tor(0.06, 0.018, 6, 14), mat('#C0392B'), -ARM_X, 2.55, 0.21, rig, Math.PI / 2);
  return { rig, head, arms: body.arms, legs: body.legs };
}
const POSES = {
  lift: { yaw: 0.25, f: [
    { arms: [[-Math.PI + 0.06, -0.12], [-Math.PI + 0.06, 0.12]], legs: [[0, -0.14], [0, 0.14]], bar: [2.83, 0.0] },
    { arms: [[-1.52, 0.0], [-1.52, 0.0]], legs: [[0, -0.2], [0, 0.2]], bar: [1.93, 0.84] }] },
  punch: { yaw: 1.0, gloves: true, f: [
    { arms: [[-1.15, 0.28], [-1.3, -0.3]], legs: [[-0.32, 0], [0.3, 0]] },
    { arms: [[-1.62, 0.06], [-1.2, -0.3]], legs: [[-0.42, 0], [0.36, 0]] }] },
  run: { yaw: 1.3, lean: 0.14, f: [
    { arms: [[0.75, 0], [-0.85, 0]], legs: [[-0.75, 0], [0.62, 0]] },
    { arms: [[-0.85, 0], [0.75, 0]], legs: [[0.62, 0], [-0.75, 0]] }] },
  idle: { yaw: 0.32, f: [
    { arms: [[0.04, -0.06], [0.04, 0.06]], legs: [[0, -0.03], [0, 0.03]], head: [0, 0.14, 0] },
    { arms: [[-0.04, -0.08], [-0.04, 0.08]], legs: [[0, -0.03], [0, 0.03]], head: [0.03, -0.12, 0.04] }] },
  sleep: { yaw: 0.6, sit: true, f: [
    { arms: [[-0.55, -0.04], [-0.55, 0.04]], legs: [[-1.52, -0.07], [-1.52, 0.07]], head: [0.38, 0, 0.3] },
    { arms: [[-0.5, -0.04], [-0.5, 0.04]], legs: [[-1.52, -0.07], [-1.52, 0.07]], head: [0.46, 0, 0.36] }] },
  read: { yaw: 0.35, book: true, f: [
    { arms: [[-1.12, 0.2], [-1.12, -0.2]], legs: [[0, -0.04], [0, 0.04]], head: [0.32, 0.05, 0] },
    { arms: [[-1.1, 0.2], [-1.1, -0.2]], legs: [[0, -0.04], [0, 0.04]], head: [0.3, -0.08, 0.05], page: true }] },
  joy: { yaw: 0.25, f: [
    { arms: [[-Math.PI + 0.2, -0.5], [-Math.PI + 0.2, 0.5]], legs: [[0, -0.14], [0, 0.14]], head: [-0.15, 0, 0] },
    { arms: [[-Math.PI + 0.05, -0.18], [-Math.PI + 0.05, 0.18]], legs: [[-0.3, -0.05], [0.3, 0.05]], head: [-0.25, 0, 0.08] }] },
  sad: { yaw: 0.3, f: [
    { arms: [[0.1, 0.07], [0.1, -0.07]], legs: [[0, 0.02], [0, -0.02]], head: [0.48, 0, 0.1] },
    { arms: [[0.12, 0.08], [0.12, -0.08]], legs: [[0, 0.02], [0, -0.02]], head: [0.42, 0.1, -0.08] }] },
  think: { yaw: 0.35, keepArms: true, f: [
    { arms: [[-Math.PI + 0.42, 0.5], [0.08, 0.22]], legs: [[0, -0.03], [0, 0.05]], head: [0.04, 0.22, 0.2] },
    { arms: [[-Math.PI + 0.5, 0.46], [0.08, 0.22]], legs: [[0, -0.03], [0, 0.05]], head: [0.0, 0.12, 0.26] }] },
  wave: { yaw: 0.3, f: [
    { arms: [[-Math.PI + 0.25, -0.55], [0.04, 0.06]], legs: [[0, -0.03], [0, 0.03]], head: [-0.05, 0.1, 0.08] },
    { arms: [[-Math.PI + 0.25, -0.05], [0.04, 0.06]], legs: [[0, -0.03], [0, 0.03]], head: [-0.05, 0.1, -0.04] }] },
  bow: { yaw: 0.3, f: [
    { arms: [[0.02, -0.04], [0.02, 0.04]], legs: [[0, 0], [0, 0]], head: [0.1, 0, 0], lean: 0.12 },
    { arms: [[0.0, -0.03], [0.0, 0.03]], legs: [[-0.2, 0], [-0.2, 0]], head: [0.3, 0, 0], lean: 0.4 }] },
  dab: { yaw: 0.3, f: [
    { arms: [[-Math.PI + 0.75, -1.25], [-1.75, 1.15]], legs: [[0, -0.12], [0, 0.12]], head: [0.55, 0.45, 0.25] },
    { arms: [[0.04, -0.06], [0.04, 0.06]], legs: [[0, -0.03], [0, 0.03]], head: [0, 0, 0] }] },
  jump: { yaw: 0.3, f: [
    { arms: [[0.5, -0.2], [0.5, 0.2]], legs: [[-0.45, -0.05], [-0.45, 0.05]], head: [0.15, 0, 0], y: -0.12 },
    { arms: [[-Math.PI + 0.15, -0.45], [-Math.PI + 0.15, 0.45]], legs: [[0.35, -0.2], [0.35, 0.2]], head: [-0.2, 0, 0], y: 0.45 }] },
  dance: { yaw: 0.18, f: [
    { arms: [[-Math.PI + 0.25, -0.35], [0, 0.85]], legs: [[0, -0.18], [0, 0.04]], head: [0, 0.2, 0.14] },
    { arms: [[0, -0.85], [-Math.PI + 0.25, 0.35]], legs: [[0, -0.04], [0, 0.18]], head: [0, -0.2, -0.14] }] }
};
function mirrorFrame(f) {
  const sw = arr => [[arr[1][0], -arr[1][1]], [arr[0][0], -arr[0][1]]];
  return Object.assign({}, f, { arms: sw(f.arms), legs: sw(f.legs), head: f.head ? [f.head[0], -f.head[1], -f.head[2]] : null });
}
function applyPose(a, name, fi, mirror) {
  const P0 = POSES[name]; if (!P0) return 0.32;
  let f = P0.f[fi % P0.f.length];
  if (mirror) f = P0.keepArms ? Object.assign({}, f, { head: f.head ? [f.head[0], -f.head[1], -f.head[2]] : null }) : mirrorFrame(f);
  a.arms.forEach((arm, i) => { arm.rotation.set(f.arms[i][0], 0, f.arms[i][1]); });
  a.legs.forEach((leg, i) => { leg.rotation.set(f.legs[i][0], 0, f.legs[i][1]); });
  if (f.head) a.head.rotation.set(f.head[0], f.head[1], f.head[2]);
  if (P0.lean) { a.rig.rotation.order = 'YXZ'; a.rig.rotation.x = P0.lean; }
  if (f.lean != null) { a.rig.rotation.order = 'YXZ'; a.rig.rotation.x = f.lean; }
  if (f.y != null) a.rig.position.y = f.y;
  if (P0.sit) a.rig.position.y = -0.76;
  if (P0.book) {
    const b = grp(a.rig, 0, 1.38, 0.86, -2.15, 0, 0); b.scale.setScalar(1.35); const cover = mat('#FF4FA3', { roughness: 0.5 }), paper = mat('#FFF7ED', { roughness: 0.9 });
    [-1, 1].forEach(s => { const h = grp(b, s * 0.02, 0, 0, 0, -s * 0.28, 0); P(rbox(0.36, 0.5, 0.03, 0.012), cover, s * 0.18, 0, -0.02, h); P(rbox(0.33, 0.46, 0.04, 0.01), paper, s * 0.17, 0, 0.012, h); for (let i = 0; i < 5; i++) P(rbox(0.24, 0.012, 0.005, 0.002), mat('#9CA3AF'), s * 0.17, 0.16 - i * 0.07, 0.035, h); });
    if (f.page) P(rbox(0.3, 0.44, 0.012, 0.004), paper, 0.0, 0, 0.12, b, 0, 0.35, 0);
  }
  if (P0.gloves) a.arms.forEach(arm => { const g = grp(arm); P(sph(0.3, 22, 16), mat('#DC2626', { roughness: 0.3 }), 0, -0.88, 0.02, g, 0, 0, 0, 1, 0.95, 1.1); P(cyl(0.27, 0.27, 0.12, 20), mat('#F8FAFC'), 0, -0.64, 0, g); });
  if (f.bar) {
    const b = grp(a.rig, 0, f.bar[0], f.bar[1]), st = metal('#9CA3AF', 0.3);
    P(cyl(0.045, 0.045, 2.7, 12), st, 0, 0, 0, b, 0, 0, Math.PI / 2);
    [-1, 1].forEach(s => { P(cyl(0.34, 0.34, 0.13, 28), mat('#39FF14', { roughness: 0.35 }), s * 1.16, 0, 0, b, 0, 0, Math.PI / 2); P(cyl(0.26, 0.26, 0.1, 24), mat('#B3001E', { roughness: 0.35 }), s * 1.02, 0, 0, b, 0, 0, Math.PI / 2); P(cyl(0.08, 0.08, 0.08, 12), st, s * 0.92, 0, 0, b, 0, 0, Math.PI / 2); });
  }
  return P0.yaw;
}
/* ===== assembling the avatar + rendering API ===== */
const WEAPON_ARM_X = -1.3;
const RELIC_POS = [1.22, 2.28, 0.0]; // right arm raised forward, Roblox "holding a tool" pose
function itemOf(spec, slot) { return spec[slot] || null; }
function normalizeTo(g, size) {
  const b = new T.Box3().setFromObject(g), s = new T.Vector3(); b.getSize(s);
  const k = size / Math.max(s.x, s.y, s.z, 1e-3), c = new T.Vector3(); b.getCenter(c);
  const inner = new T.Group(); while (g.children.length) inner.add(g.children[0]);
  inner.scale.setScalar(k); inner.position.copy(c.multiplyScalar(-k)); g.add(inner);
}
function tagSlot(g, slot) { g.userData.slot = slot; return g; }
function buildAvatar(spec) {
  const rig = new T.Group();
  const ctx = { rig, hair: spec.hair };
  const head = buildHead(rig, spec); ctx.head = head;
  const H = spec.head && HEAD[spec.head.id];
  buildHair(head, spec.hair || '#1E1B3A', H ? H.hat : 0);
  const body = buildBody(rig, spec); ctx.arms = body.arms;
  buildFeet(rig, spec.feet, body.legs);
  if (spec.face && FACE[spec.face.id]) FACE[spec.face.id].build(tagSlot(grp(head), 'face'), ctx);
  if (H) H.build(tagSlot(grp(head), 'head'), ctx);
  let weaponG = null;
  if (spec.weapon && WEAPON[spec.weapon.id]) {
    const arm = body.arms[0]; arm.rotation.x = WEAPON_ARM_X;
    weaponG = tagSlot(grp(arm, 0, -0.84, 0.0, -WEAPON_ARM_X + 0.16, 0, 0.22), 'weapon');
    WEAPON[spec.weapon.id].build(weaponG, ctx);
    if (WEAPON[spec.weapon.id].extra) WEAPON[spec.weapon.id].extra(ctx);
  }
  let relicG = null;
  if (spec.relic && RELIC[spec.relic.id]) {
    relicG = tagSlot(grp(rig, RELIC_POS[0], RELIC_POS[1], RELIC_POS[2]), 'relic');
    const inner = grp(relicG); RELIC[spec.relic.id](inner); normalizeTo(inner, 0.62);
    const aura = new T.Sprite(MC.get('aura') || (MC.set('aura', new T.SpriteMaterial({ map: tex('aura', 128, 128, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,214,90,.75)'); gr.addColorStop(.45, 'rgba(255,201,60,.32)'); gr.addColorStop(1, 'rgba(255,201,60,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false })), MC.get('aura')));
    aura.scale.set(0.95, 0.95, 1); aura.position.z = -0.25; aura.renderOrder = -1; relicG.add(aura);
    relicG.userData.inner = inner;
  }
  return { rig, head, arms: body.arms, legs: body.legs, weaponG, relicG };
}
// a single item on its own, Roblox-catalog style
function buildItemPreview(spec, slot) {
  const it = spec[slot], root = new T.Group();
  if (slot === 'head' && HEAD[it.id]) { const g = grp(root, 0, -HY, 0); const h = grp(g, 0, HY, 0); HEAD[it.id].build(h, { hair: spec.hair }); }
  else if (slot === 'face') { const a = buildAvatar({ hair: spec.hair, face: it }); root.add(a.head); a.head.position.set(0, 0, 0); }
  else if (slot === 'body') { const a = buildAvatar({ hair: spec.hair, body: it }); a.rig.children.slice().forEach(o => { if (o === a.head || a.legs.includes(o) || o.userData.slot === 'legs' || o.userData.slot === 'feet' || (o.userData.slot === null && !o.userData.region)) a.rig.remove(o); }); root.add(a.rig); }
  else if (slot === 'legs') { const a = buildAvatar({ hair: spec.hair, legs: it }); a.rig.children.slice().forEach(o => { const keep = a.legs.includes(o) || o.userData.slot === 'legs'; if (!keep) a.rig.remove(o); }); a.legs.forEach(l => l.children.slice().forEach(c => { if (c.userData.isFoot) l.remove(c); })); root.add(a.rig); }
  else if (slot === 'feet') buildFeet(root, it);
  else if (slot === 'weapon' && WEAPON[it.id]) { const g = grp(root, 0, 0, 0, 0, 0, -0.18); (WEAPON[it.id].preview || WEAPON[it.id].build)(g, {}); }
  else if (slot === 'relic' && RELIC[it.id]) RELIC[it.id](root);
  return root;
}

// ---------- rendering ----------
function lights(scene) {
  scene.add(new T.HemisphereLight(0xffffff, 0x8a8f9c, 0.78));
  const sun = new T.DirectionalLight(0xffffff, 0.72); sun.position.set(3, 6, 5); scene.add(sun);
  const fill = new T.DirectionalLight(0xdfe8ff, 0.28); fill.position.set(-4, 2, -3); scene.add(fill);
  const rim = new T.DirectionalLight(0xffc8d4, 0.22); rim.position.set(-2, 4, -6); scene.add(rim);
}
let SNAP = null;
function snapper() {
  if (SNAP) return SNAP;
  const canvas = document.createElement('canvas');
  const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setClearColor(0x000000, 0);
  const scene = new T.Scene(); lights(scene);
  const cam = new T.PerspectiveCamera(26, 1, 0.05, 100);
  return (SNAP = { r, scene, cam });
}
const VIEWS = {
  full: { w: 320, h: 400, cy: 1.6, vh: 3.75, yaw: 0.32, pitch: 0.06 },
  head: { w: 192, h: 192, cy: 2.62, vh: 1.95, yaw: 0.18, pitch: 0.04 },
  mini: { w: 160, h: 200, cy: 1.6, vh: 3.75, yaw: 0.32, pitch: 0.06 },
  left: { w: 320, h: 400, cy: 1.6, vh: 3.75, yaw: -0.38, pitch: 0.06 },
  pose: { w: 280, h: 350, cy: 1.6, vh: 3.75, yaw: 0.3, pitch: 0.06 }
};
function frameCamera(cam, center, radius, yaw, pitch, aspect) {
  cam.aspect = aspect; cam.updateProjectionMatrix();
  const fov = cam.fov * Math.PI / 180, d = radius / Math.sin(fov / 2) * (aspect < 1 ? 1 / aspect : 1);
  cam.position.set(center.x + Math.sin(yaw) * Math.cos(pitch) * d, center.y + Math.sin(pitch) * d, center.z + Math.cos(yaw) * Math.cos(pitch) * d);
  cam.lookAt(center);
}
function snap(spec, view, yawOverride) {
  if (view.indexOf('@') > 0) { const parts = view.split('@'); view = parts[0]; yawOverride = +parts[1]; }
  const S = snapper(), V = VIEWS[view] || (view.startsWith('pose:') || view.startsWith('sensei:') ? VIEWS.pose : VIEWS.full);
  let obj, w = V.w, h = V.h;
  if (view.startsWith('prop:')) {
    w = h = 240; obj = buildProp(view.slice(5)); obj.rotation.y = -0.55; obj.rotation.x = 0.0;
    S.scene.add(obj); obj.updateMatrixWorld(true);
    const sphere = new T.Box3().setFromObject(obj).getBoundingSphere(new T.Sphere());
    frameCamera(S.cam, sphere.center, sphere.radius * 1.0, 0, 0.32, 1);
  } else if (view.startsWith('item:')) {
    const slot = view.slice(5); w = h = 200;
    obj = buildItemPreview(spec, slot);
    obj.rotation.y = slot === 'weapon' ? 0.35 : slot === 'feet' ? 0.75 : slot === 'relic' ? 0.45 : 0.5;
    S.scene.add(obj); obj.updateMatrixWorld(true);
    const sphere = new T.Box3().setFromObject(obj).getBoundingSphere(new T.Sphere());
    frameCamera(S.cam, sphere.center, sphere.radius * 1.02, 0, 0.22, 1);
  } else {
    let yaw = V.yaw;
    if (view.startsWith('pose:')) { const [, name, fr, m] = view.split(':'); const a = buildAvatar(Object.assign({}, spec, { weapon: null, relic: null })); yaw = applyPose(a, name, +fr || 0, m === 'm'); if (m === 'm') yaw = -yaw; obj = a.rig; }
    else if (view.startsWith('sensei:')) { obj = buildSensei(view.slice(7) || 'calm').rig; yaw = 0.32; }
    else obj = buildAvatar(spec).rig;
    obj.rotation.y = yawOverride == null ? yaw : yawOverride; S.scene.add(obj);
    S.cam.aspect = w / h; S.cam.updateProjectionMatrix();
    const d = V.vh / 2 / Math.tan(S.cam.fov * Math.PI / 360);
    S.cam.position.set(0, V.cy + Math.sin(V.pitch) * d, Math.cos(V.pitch) * d); S.cam.lookAt(0, V.cy, 0);
  }
  S.r.setSize(w, h, false);
  S.r.render(S.scene, S.cam);
  const url = S.r.domElement.toDataURL('image/png');
  S.scene.remove(obj);
  return url;
}

// ---------- live, rotatable avatar ----------
const LIVE = { r: null, scene: null, cam: null, a: null, key: '', el: null, yaw: 0.32, vel: 0, drag: false, t: 0, raf: 0 };
function liveInit() {
  if (LIVE.r) return;
  const r = new T.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
  r.domElement.className = 'av3d-canvas';
  const scene = new T.Scene(); lights(scene);
  const plate = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, 0.08, 48), mat('#2A0A16', { roughness: 0.9 }));
  plate.position.y = -0.04; scene.add(plate);
  const ring = new T.Mesh(new T.TorusGeometry(1.25, 0.02, 6, 64), mat('#39FF14', { emissive: new T.Color('#39FF14'), emissiveIntensity: 0.8 }));
  ring.rotation.x = Math.PI / 2; scene.add(ring);
  const cam = new T.PerspectiveCamera(26, 0.8, 0.05, 100);
  Object.assign(LIVE, { r, scene, cam });
  const cv = r.domElement; let lx = 0, moved = 0;
  cv.addEventListener('pointerdown', e => { LIVE.drag = true; lx = e.clientX; moved = 0; LIVE.vel = 0; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
  cv.addEventListener('pointermove', e => { if (!LIVE.drag) return; const dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); LIVE.yaw += dx * 0.012; LIVE.vel = dx * 0.012; });
  const up = () => { LIVE.drag = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
}
function liveSize() {
  const el = LIVE.el; if (!el) return;
  const w = Math.max(60, el.clientWidth), h = Math.max(75, el.clientHeight || w * 1.25);
  const c = LIVE.r.domElement;
  if (c.width !== Math.round(w * LIVE.r.getPixelRatio()) || c.height !== Math.round(h * LIVE.r.getPixelRatio())) {
    LIVE.r.setSize(w, h, false); c.style.width = w + 'px'; c.style.height = h + 'px';
    LIVE.cam.aspect = w / h; LIVE.cam.updateProjectionMatrix();
    const vh = 4.25, cy = 1.42, pitch = 0.13, d = vh / 2 / Math.tan(LIVE.cam.fov * Math.PI / 360) * Math.max(1, 0.8 / (w / h));
    LIVE.cam.position.set(0, cy + Math.sin(pitch) * d, Math.cos(pitch) * d); LIVE.cam.lookAt(0, cy, 0);
  }
}
function liveLoop() {
  LIVE.raf = 0;
  if (!LIVE.el || !LIVE.el.isConnected || !LIVE.a) return;
  LIVE.t += 0.016;
  if (!LIVE.drag) { LIVE.yaw += LIVE.vel; LIVE.vel *= 0.92; }
  const a = LIVE.a, t = LIVE.t;
  a.rig.rotation.y = LIVE.yaw;
  a.head.rotation.y = Math.sin(t * 0.7) * 0.12; a.head.position.y = HY + Math.sin(t * 1.6) * 0.008;
  a.arms.forEach((arm, i) => { if (i === 0 && a.weaponG) { arm.rotation.x = WEAPON_ARM_X + Math.sin(t * 1.4) * 0.04; return; } arm.rotation.x = Math.sin(t * 1.3 + i * 2) * 0.06; arm.rotation.z = (i ? 1 : -1) * 0.03; });
  if (a.relicG) { a.relicG.position.y = RELIC_POS[1] + Math.sin(t * 1.8) * 0.06; a.relicG.userData.inner.rotation.y = t * 0.8; }
  a.rig.traverse(o => { if (o.userData.flame) { const k = 1 + Math.sin(t * 22 + o.id) * 0.12; o.scale.set(1, k, 1); } });
  liveSize();
  LIVE.r.render(LIVE.scene, LIVE.cam);
  LIVE.raf = requestAnimationFrame(liveLoop);
}
function mountLive(el, key, spec) {
  liveInit();
  if (LIVE.key !== key) {
    if (LIVE.a) LIVE.scene.remove(LIVE.a.rig);
    LIVE.a = buildAvatar(spec); LIVE.scene.add(LIVE.a.rig); LIVE.key = key;
  }
  if (LIVE.r.domElement.parentNode !== el) el.appendChild(LIVE.r.domElement);
  LIVE.el = el; el.classList.add('live-on');
  liveSize();
  if (!LIVE.raf) LIVE.raf = requestAnimationFrame(liveLoop);
}
const ray = new T.Raycaster();
function pick(ev) {
  if (!LIVE.r || !LIVE.a) return null;
  const rect = LIVE.r.domElement.getBoundingClientRect();
  const v = new T.Vector2((ev.clientX - rect.left) / rect.width * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(v, LIVE.cam);
  const hits = ray.intersectObject(LIVE.a.rig, true);
  for (const h of hits) {
    let o = h.object, region = null;
    while (o) { if (o.userData.slot) return { slot: o.userData.slot }; if (!region && o.userData.region) region = o.userData.region; o = o.parent; }
    if (region) return { region };
  }
  return null;
}
/* ===== Nihongo Quest: blocky 3D props for "Co jest na obrazku?" (keys = vocab kana) ===== */
const PB = (w, h, d, c, x, y, z, g, rx, ry, rz) => P(rbox(w, h, d, Math.min(w, h, d) * 0.12), mat(c), x, y, z, g, rx, ry, rz);
const PC = (rt, rb, h, c, x, y, z, g, rx, ry, rz) => P(cyl(rt, rb, h, 28), mat(c), x, y, z, g, rx, ry, rz);
const PS = (r, c, x, y, z, g, sx, sy, sz) => P(sph(r, 22, 16), mat(c), x, y, z, g, 0, 0, 0, sx, sy, sz);
const PK = (r, h, c, x, y, z, g, rx, ry, rz) => P(cone(r, h, 22), mat(c), x, y, z, g, rx, ry, rz);
const PT = (r, t, c, x, y, z, g, rx, ry, rz, arc) => P(tor(r, t, 10, 30, arc), mat(c), x, y, z, g, rx, ry, rz);
// blog: the baby is built from the feet up, so leaning forward tips it over its toes
function babyPose(g, p) {
  const S = '#FFD9C2', C = '#7FD4FF';
  // same invisible frame in every pose, so all frames get the same scale and framing
  const frame = new T.Mesh(new T.BoxGeometry(1.5, 2.15, 2.3), new T.MeshBasicMaterial());
  frame.visible = false; frame.position.set(0, 1.08, 0.1); g.add(frame);
  const b = new T.Group(); g.add(b);
  b.rotation.order = 'YXZ'; b.rotation.x = p.lean || 0; b.rotation.z = p.tilt || 0;
  b.position.y = p.y || 0; b.position.z = p.z || 0;
  PB(0.72, 0.68, 0.66, S, 0, 1.55, 0, b);
  PS(0.1, '#8D5524', 0, 1.92, 0, b, 1.2, 0.8, 1);
  [-0.14, 0.14].forEach(x => PS(0.055, '#1B1B1B', x, 1.6, 0.34, b));
  PS(0.08, '#E57373', 0, 1.42, 0.33, b, 1.4, 0.6, 0.4);
  [-0.25, 0.25].forEach(x => PS(0.07, '#FF8A80', x, 1.48, 0.33, b, 1, 0.7, 0.3));
  PB(0.6, 0.5, 0.42, C, 0, 0.97, 0, b);
  PB(0.64, 0.24, 0.46, '#FFFFFF', 0, 0.66, 0, b);
  // arms hang from the shoulders, legs from the hips: each limb in its own pivot group
  const limb = (x, y, rx, rz, w, h, d, col) => { const j = new T.Group(); j.position.set(x, y, 0); j.rotation.set(rx, 0, rz); b.add(j); PB(w, h, d, col, 0, -h / 2, 0, j); };
  limb(-0.4, 1.18, p.la == null ? -0.2 : p.la, 0.25, 0.18, 0.46, 0.18, C);
  limb(0.4, 1.18, p.ra == null ? -0.2 : p.ra, -0.25, 0.18, 0.46, 0.18, C);
  limb(-0.14, 0.56, p.ll || 0, 0, 0.2, 0.5, 0.22, S);
  limb(0.14, 0.56, p.rl || 0, 0, 0.2, 0.5, 0.22, S);
  if (p.stars) [[-0.45, 0.85, 1.05], [0.05, 1.0, 1.25], [0.5, 0.8, 0.95]].forEach(([x, y, z]) => PS(0.09, '#FFD600', x, y, z, g, 1, 1, 0.4));
}

// blog: a Roblox-style top-hat gentleman, the Monopoly mascot vibe
function monopolyMan(g) {
  const K = '#151515', W = '#F5F5F5', S = '#FFD9C2';
  PB(0.2, 0.62, 0.22, K, -0.13, 0.31, 0, g); PB(0.2, 0.62, 0.22, K, 0.13, 0.31, 0, g);
  PB(0.22, 0.1, 0.3, K, -0.13, 0.03, 0.04, g); PB(0.22, 0.1, 0.3, K, 0.13, 0.03, 0.04, g);
  PB(0.62, 0.66, 0.34, K, 0, 0.95, 0, g);
  PB(0.26, 0.6, 0.02, W, 0, 0.98, 0.17, g);
  PB(0.2, 0.08, 0.04, '#D32F2F', 0, 1.22, 0.19, g); PS(0.035, '#B71C1C', 0, 1.22, 0.21, g);
  PB(0.17, 0.6, 0.2, K, -0.42, 0.98, 0, g, 0, 0, 0.12);
  PB(0.17, 0.6, 0.2, K, 0.42, 0.98, 0.08, g, -0.35, 0, -0.12);
  PB(0.13, 0.1, 0.13, W, 0.46, 0.68, 0.2, g);
  PC(0.03, 0.03, 0.95, '#3E2723', 0.5, 0.42, 0.28, g, -0.15, 0, 0);
  PS(0.06, '#C9A227', 0.5, 0.9, 0.35, g);
  PB(0.5, 0.48, 0.46, S, 0, 1.55, 0, g);
  [-0.1, 0.1].forEach(x => PS(0.04, '#1B1B1B', x, 1.62, 0.23, g));
  PS(0.06, '#F4A3A3', 0, 1.53, 0.24, g);
  PS(0.1, W, -0.1, 1.44, 0.23, g, 1.5, 0.6, 0.5); PS(0.1, W, 0.1, 1.44, 0.23, g, 1.5, 0.6, 0.5);
  PC(0.36, 0.36, 0.04, K, 0, 1.8, 0, g);
  PC(0.22, 0.22, 0.42, K, 0, 2.02, 0, g);
  PC(0.225, 0.225, 0.08, '#B71C1C', 0, 1.86, 0, g);
}

// blog: Roblox-style plumber brothers (cap colour + letter tell them apart)
function plumber(g, cap, letter) {
  const S = '#FFD9C2', B = '#1E4FD8', K = '#3E2723';
  PB(0.22, 0.5, 0.24, B, -0.14, 0.25, 0, g); PB(0.22, 0.5, 0.24, B, 0.14, 0.25, 0, g);
  PB(0.26, 0.14, 0.34, '#5D4037', -0.14, 0.05, 0.04, g); PB(0.26, 0.14, 0.34, '#5D4037', 0.14, 0.05, 0.04, g);
  PB(0.62, 0.6, 0.36, cap, 0, 0.85, 0, g);
  PB(0.56, 0.42, 0.38, B, 0, 0.72, 0.005, g);
  [-0.17, 0.17].forEach(x => { PB(0.08, 0.36, 0.05, B, x, 1.02, 0.17, g); PS(0.045, '#FFD600', x, 0.9, 0.2, g); });
  PB(0.18, 0.56, 0.2, cap, -0.42, 0.88, 0, g, 0, 0, 0.18); PB(0.18, 0.56, 0.2, cap, 0.42, 0.95, 0.06, g, -0.6, 0, -0.5);
  PS(0.12, '#FFFFFF', -0.47, 0.56, 0, g); PS(0.12, '#FFFFFF', 0.58, 1.25, 0.22, g);
  PB(0.52, 0.5, 0.48, S, 0, 1.42, 0, g);
  [-0.1, 0.1].forEach(x => { PS(0.06, '#FFFFFF', x, 1.5, 0.24, g, 1, 1.3, 0.5); PS(0.035, '#1565C0', x, 1.5, 0.27, g); });
  PS(0.1, '#FFB199', 0, 1.39, 0.27, g);
  PB(0.36, 0.08, 0.06, K, 0, 1.31, 0.25, g);
  PB(0.58, 0.2, 0.54, cap, 0, 1.74, 0, g);
  PB(0.56, 0.05, 0.3, cap, 0, 1.66, 0.36, g);
  PC(0.12, 0.12, 0.02, '#FFFFFF', 0, 1.76, 0.27, g, Math.PI / 2, 0, 0);
  const lt = tex('letter-' + letter, 64, 64, (c, w, h) => { c.fillStyle = cap; c.font = 'bold 50px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(letter, w / 2, h / 2 + 3); });
  const tag = new T.Mesh(new T.PlaneGeometry(0.2, 0.2), new T.MeshBasicMaterial({ map: lt, transparent: true }));
  tag.position.set(0, 1.76, 0.285); g.add(tag);
}

// blog: a Minecraft-style cow: plain boxes with crisp pixel-art textures
function pixTex(key, w, h, draw) {
  const t = tex(key, w, h, draw);
  t.magFilter = T.NearestFilter; t.minFilter = T.NearestFilter; t.generateMipmaps = false; t.anisotropy = 1;
  return t;
}
// blog: a Minecraft red mushroom: cream stem, flat red cap with light dots
function mcMushroom(parent, x, y, z, s) {
  const m = new T.Group(); m.position.set(x, y, z); m.scale.setScalar(s || 1); parent.add(m);
  const cap = pixTex('mc-mushcap', 8, 8, (c) => {
    c.fillStyle = '#C62828'; c.fillRect(0, 0, 8, 8);
    c.fillStyle = '#E53935'; c.fillRect(1, 1, 6, 6);
    c.fillStyle = '#E8E8E8'; [[1, 2], [5, 1], [3, 4], [6, 5], [2, 6]].forEach(([px, py]) => c.fillRect(px, py, 1, 1));
    c.fillStyle = '#B0BEC5'; [[2, 2], [6, 1], [4, 4]].forEach(([px, py]) => c.fillRect(px, py, 1, 1));
  });
  const capM = new T.MeshLambertMaterial({ map: cap });
  const stem = new T.Mesh(new T.BoxGeometry(0.14, 0.4, 0.14), new T.MeshLambertMaterial({ color: '#D9CDA2' })); stem.position.y = 0.2; m.add(stem);
  const c1 = new T.Mesh(new T.BoxGeometry(0.5, 0.14, 0.5), capM); c1.position.y = 0.45; m.add(c1);
  const c2 = new T.Mesh(new T.BoxGeometry(0.32, 0.1, 0.32), capM); c2.position.y = 0.56; m.add(c2);
  return m;
}

function cow(g0, red) {
  // Minecraft proportions (1 texture pixel = 0.1): body 12x10x18, legs 4x12x4, head 8x8x6
  // red = the mooshroom: red hide, lilac-grey patches, mushrooms growing on its back and head
  const g = new T.Group(); g.rotation.y = -0.65; g0.add(g);
  const BROWN = red ? ['#8E1218', '#9C151C', '#A8191F', '#8A1016', '#B01D23', '#7E0E14'] : ['#3A291D', '#3F2D20', '#443123', '#3B2A1E', '#4A3626', '#36261B'];
  const GREY = red ? ['#A7A9BE', '#B3B5C9', '#9C9EB4', '#C0C2D4', '#A0A2B8'] : ['#A3A3A3', '#ADADAD', '#B8B8B8', '#9A9A9A', '#C2C2C2'];
  const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // paint a w x h pixel face: noisy brown, then grey patches given as [x, y, w, h] rects
  const face = (key, w, h, patches, extra) => pixTex('mc-' + (red ? 'red-' : '') + key, w, h, (c) => {
    const r = rnd(key.length * 7919 + w * 31 + h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { c.fillStyle = BROWN[Math.floor(r() * BROWN.length)]; c.fillRect(x, y, 1, 1); }
    (patches || []).forEach(([px, py, pw, ph]) => {
      for (let y = py; y < py + ph; y++) for (let x = px; x < px + pw; x++) { c.fillStyle = GREY[Math.floor(r() * GREY.length)]; c.fillRect(x, y, 1, 1); }
    });
    if (extra) extra(c);
  });
  const M = map => new T.MeshLambertMaterial({ map });
  const box = (w, h, d, mats, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mats); m.position.set(x, y, z); g.add(m); return m; };

  // body: 18 long (x), 10 tall (y), 12 wide (z)
  const side = face('side', 18, 10, [[3, 2, 5, 3], [4, 1, 3, 1], [2, 4, 3, 2], [11, 3, 2, 6], [10, 6, 4, 2], [13, 0, 3, 2], [9, 4, 2, 1]]);
  const side2 = face('side2', 18, 10, [[5, 3, 4, 3], [6, 2, 2, 1], [12, 1, 3, 2], [11, 2, 2, 5], [13, 5, 3, 2]]);
  const top = face('top', 18, 12, [[3, 3, 8, 4], [5, 2, 4, 1], [2, 5, 3, 3], [8, 7, 3, 2], [14, 0, 4, 3], [15, 3, 2, 1]]);
  const chest = face('chest', 12, 10, [[3, 2, 6, 5], [4, 1, 4, 1], [5, 7, 3, 2]]);
  const rear = face('rear', 12, 10, [[1, 1, 3, 3], [8, 5, 3, 3]]);
  const belly = face('belly', 18, 12, []);
  box(1.8, 1.0, 1.2, [M(chest), M(rear), M(top), M(belly), M(side), M(side2)], 0, 1.7, 0);

  // legs: dark hoof row at the bottom, a grey stripe down the front
  const legFront = face('legf', 4, 12, [[1, 3, 1, 6]], (c) => { c.fillStyle = '#1D1712'; c.fillRect(0, 11, 4, 1); c.fillStyle = '#2A1F17'; c.fillRect(0, 10, 4, 1); });
  const legSide = face('legs', 4, 12, [], (c) => { c.fillStyle = '#1D1712'; c.fillRect(0, 11, 4, 1); c.fillStyle = '#2A1F17'; c.fillRect(0, 10, 4, 1); });
  const legTop = face('legt', 4, 4, []);
  // each leg hangs from a pivot at the hip, so mountProp can swing it
  [[0.6, 0.35], [0.6, -0.35], [-0.6, 0.35], [-0.6, -0.35]].forEach(([x, z], i) => {
    const hip = new T.Group(); hip.position.set(x, 1.2, z); hip.userData.leg = i; g.add(hip);
    const m = new T.Mesh(new T.BoxGeometry(0.4, 1.2, 0.4), [M(legFront), M(legSide), M(legTop), M(legTop), M(legSide), M(legSide)]);
    m.position.y = -0.6; hip.add(m);
  });

  // head: 6 deep (x), 8 tall, 8 wide; the face is drawn on the +x side
  const head = face('head', 8, 8, [[0, 0, 3, 2], [1, 2, 2, 1], [5, 0, 1, 1]], (c) => {
    c.fillStyle = '#E8E8E8'; c.fillRect(0, 3, 1, 1); c.fillRect(7, 3, 1, 1);
    c.fillStyle = '#0E0E0E'; c.fillRect(1, 3, 1, 1); c.fillRect(6, 3, 1, 1);
    c.fillStyle = '#9C9C9C'; c.fillRect(2, 5, 4, 3); c.fillStyle = '#B0B0B0'; c.fillRect(2, 5, 4, 1);
    c.fillStyle = '#5F5F5F'; c.fillRect(3, 7, 2, 1);
    c.fillStyle = '#121212'; c.fillRect(2, 6, 1, 1); c.fillRect(5, 6, 1, 1);
  });
  const headSide = face('heads', 6, 8, [[0, 0, 2, 2]], (c) => { c.fillStyle = '#9E5A5C'; c.fillRect(3, 2, 2, 2); c.fillStyle = '#B86E70'; c.fillRect(3, 2, 1, 1); });
  const headTop = face('headt', 6, 8, [[1, 1, 3, 3], [2, 4, 2, 2]]);
  const headBack = face('headb', 8, 8, [[2, 2, 2, 2]]);
  box(0.6, 0.8, 0.8, [M(head), M(headBack), M(headTop), M(headBack), M(headSide), M(headSide)], 1.2, 2.0, 0);

  // horns: little dark grey 1x2x1 stubs on the top corners of the head
  const hornM = new T.MeshLambertMaterial({ color: '#4A4A4A' });
  [-1, 1].forEach(sz => box(0.1, 0.2, 0.1, hornM, 1.15, 2.5, sz * 0.45));

  if (red) {
    [[-0.5, 2.2, 0.2], [0.2, 2.2, -0.25], [0.55, 2.2, 0.3]].forEach(([x, y, z]) => mcMushroom(g, x, y, z, 1));
    mcMushroom(g, 1.2, 2.4, 0, 0.8);
  }
}

// blog: a classic flying saucer with a little green pilot
function ufo(g) {
  P(sph(1, 40, 20), metal('#B0BEC5', 0.25), 0, 0.5, 0, g, 0, 0, 0, 1.6, 0.32, 1.6);
  P(cyl(1.1, 0.7, 0.18, 40), metal('#78909C', 0.3), 0, 0.32, 0, g);
  for (let i = 0; i < 8; i++) { const a = i / 8 * tau; P(sph(0.1, 14, 10), glow(['#39FF14', '#FFD600', '#FF5C7A', '#3FD0FF'][i % 4], 1.2), Math.cos(a) * 1.25, 0.5, Math.sin(a) * 1.25, g); }
  PS(0.26, '#4CE65C', 0, 0.95, 0, g);
  [-0.1, 0.1].forEach(x => PS(0.07, '#111', x, 1.0, 0.22, g, 1, 1.3, 0.6));
  P(sph(0.6, 32, 16, ), glass('#9FE8FF', 0.38), 0, 0.72, 0, g, 0, 0, 0, 1, 0.85, 1);
}

const PROPS = {
  // blog: a proper tiger for "Eye of the Tiger" (orange, black stripes, white muzzle)
  'tiger': g => {
    const O = '#FF8F00', K = '#1B1B1B', W = '#FFF3E0';
    PS(0.55, O, 0, 0.62, 0, g, 1.35, 0.82, 0.82);
    [[-0.45, 0.25], [0.45, 0.25], [-0.45, -0.25], [0.45, -0.25]].forEach(([x, z]) => PC(0.12, 0.11, 0.45, O, x, 0.22, z, g));
    [-0.42, -0.14, 0.14].forEach(x => PB(0.07, 0.12, 0.9, K, x, 1.02, 0, g));
    [-0.3, 0.0].forEach(x => PB(0.07, 0.4, 0.1, K, x, 0.75, 0.43, g));
    [-0.3, 0.0].forEach(x => PB(0.07, 0.4, 0.1, K, x, 0.75, -0.43, g));
    PS(0.42, O, 0.8, 1.05, 0, g);
    [-0.22, 0.22].forEach(z => { PS(0.13, O, 0.72, 1.42, z, g, 1, 1, 0.7); PS(0.07, K, 0.76, 1.44, z, g, 1, 1, 0.6); });
    PB(0.05, 0.2, 0.08, K, 1.0, 1.32, 0, g); PB(0.05, 0.08, 0.3, K, 1.05, 1.25, 0, g);
    PS(0.22, W, 1.12, 0.94, 0, g, 0.9, 0.75, 1.2);
    PS(0.065, '#3E2723', 1.32, 1.02, 0, g);
    [-0.14, 0.14].forEach(z => { PS(0.07, '#FFEB3B', 1.13, 1.16, z, g); PS(0.035, K, 1.18, 1.16, z, g); });
    PC(0.06, 0.04, 0.8, O, -0.85, 0.85, 0, g, 0, 0, 0.75);
    PS(0.07, K, -1.15, 1.12, 0, g);
  },
  // blog: the classic rubber duck (for rubber duck debugging)
  'duck': g => {
    const Y = '#FFD600';
    PS(0.6, Y, 0, 0.5, 0, g, 1.25, 0.8, 1);
    [-0.5, 0.5].forEach(z => PS(0.28, '#FFC400', -0.08, 0.58, z, g, 1.3, 0.7, 0.35));
    PK(0.16, 0.32, Y, -0.78, 0.72, 0, g, 0, 0, 0.95);
    PS(0.4, Y, 0.48, 1.12, 0, g);
    PS(0.17, '#FF6D00', 0.88, 1.05, 0, g, 1.35, 0.5, 1.05);
    [-0.17, 0.17].forEach(z => { PS(0.075, '#111', 0.74, 1.24, z, g); PS(0.025, '#FFFFFF', 0.8, 1.27, z * 1.1, g); });
  },
  // blog: a Roblox-style baby learning to walk (frames for a flip-book: two steps and a faceplant)
  'baby': g => babyPose(g, {}),
  'baby-step1': g => babyPose(g, { ll: -0.45, rl: 0.3, la: -1.25, ra: -0.95 }),
  'baby-step2': g => babyPose(g, { ll: 0.3, rl: -0.45, la: -0.95, ra: -1.25 }),
  'baby-wobble': g => babyPose(g, { ll: -0.2, rl: 0.5, la: -2.4, ra: -0.4, lean: 0.38, tilt: 0.12 }),
  'baby-fall': g => babyPose(g, { ll: 0.6, rl: 0.9, la: -2.9, ra: -2.7, lean: 1.5, y: 0.32, z: -0.9, stars: true }),
  // blog: a proper gamepad, seen from above: grips, d-pad, coloured buttons, two sticks
  'gamepad': g0 => {
    // tilted towards the viewer so the buttons read at icon size
    const g = new T.Group(); g.rotation.x = 0.95; g0.add(g);
    const body = mat('#ECEFF1', { roughness: 0.45 }), dark = mat('#263238', { roughness: 0.5 });
    P(rbox(2.2, 0.32, 1.0, 0.14), body, 0, 0.3, 0, g);
    [-1, 1].forEach(s => P(sph(0.5, 28, 18), body, s * 0.95, 0.24, 0.35, g, 0, 0, 0, 1, 0.55, 1.25));
    PB(0.42, 0.1, 0.14, '#37474F', -0.72, 0.5, -0.05, g); PB(0.14, 0.1, 0.42, '#37474F', -0.72, 0.5, -0.05, g);
    [['#FFD600', 0.72, -0.25], ['#2E7D32', 0.72, 0.15], ['#1565C0', 0.52, -0.05], ['#D32F2F', 0.92, -0.05]].forEach(([c, x, z]) => P(cyl(0.085, 0.085, 0.1, 20), glow(c, 0.35), x, 0.5, z, g));
    [-0.32, 0.32].forEach(x => { P(cyl(0.16, 0.18, 0.1, 24), dark, x, 0.5, 0.28, g); P(cyl(0.12, 0.12, 0.08, 24), mat('#455A64'), x, 0.58, 0.28, g); });
    [-0.12, 0.12].forEach(x => PB(0.14, 0.06, 0.06, '#90A4AE', x, 0.48, -0.25, g));
    P(cyl(0.06, 0.06, 0.06, 16), glow('#39FF14', 0.9), 0, 0.48, -0.08, g);
  },
  'mario': g => plumber(g, '#E53935', 'M'),
  'luigi': g => plumber(g, '#2E9E3E', 'L'),
  'cow': g => cow(g),
  'mooshroom': g => cow(g, true),
  'mc-mushroom': g => mcMushroom(g, 0, 0, 0, 2.2),
  'ufo': g => ufo(g),
  // blog: Snorlax sitting down, big round body, sleepy head resting right on top of it
  'snorlax': g0 => {
    // icons are shown turned 0.55 rad; turn most of that back so he faces the viewer
    const g = new T.Group(); g.rotation.y = 0.38; g0.add(g);
    const B = '#2F7480', C = '#F3E3BF', K = '#1B1B1B', W = '#FFFFFF', P = '#7A4A2A';
    // body + belly
    PS(1, B, 0, 1.0, 0, g, 1.25, 1.0, 0.95);
    PS(1, C, 0, 0.92, 0.33, g, 1.0, 0.86, 0.68);
    // head, sunk into the shoulders
    PS(0.78, B, 0, 2.12, 0.05, g, 1.22, 0.78, 0.95);
    PS(0.66, C, 0, 2.02, 0.4, g, 1.12, 0.7, 0.6);
    [-1, 1].forEach(s => PK(0.22, 0.38, B, s * 0.6, 2.74, 0, g, 0, 0, -s * 0.32));
    // fast asleep: closed eyes, a flat mouth with two little fangs
    [-1, 1].forEach(s => PB(0.28, 0.045, 0.04, K, s * 0.27, 2.17, 0.76, g, 0, 0, s * 0.08));
    PB(0.5, 0.045, 0.04, K, 0, 1.91, 0.79, g);
    [-1, 1].forEach(s => PK(0.05, 0.11, W, s * 0.14, 1.98, 0.8, g));
    // arms hanging at the sides, paws on the ground with three claws
    [-1, 1].forEach(s => {
      PS(0.36, B, s * 1.18, 0.8, 0.15, g, 0.75, 1.25, 0.75);
      PS(0.28, B, s * 1.3, 0.32, 0.3, g, 1.1, 0.8, 1.0);
      [-0.12, 0, 0.12].forEach(dz => PK(0.065, 0.2, W, s * 1.52, 0.5, 0.3 + dz, g, 0, 0, -s * 0.6));
    });
    // big feet pointing at us: cream soles, brown pads, claws on top
    [-1, 1].forEach(s => {
      PS(0.4, B, s * 0.62, 0.42, 0.55, g, 1, 1, 0.8);
      PS(0.45, C, s * 0.62, 0.42, 0.85, g, 0.95, 1.0, 0.45);
      PS(0.24, P, s * 0.62, 0.32, 1.03, g, 1, 1.05, 0.3);
      [-0.16, 0, 0.16].forEach(dx => PK(0.065, 0.2, W, s * 0.62 + dx, 0.92, 0.95, g, 0, 0, -dx * 1.2));
    });
  },
  // blog: the top half of the Monopoly gentleman, arms out, cane up
  'monopoly-bust': g0 => {
    // icons are shown turned 0.55 rad to the side; undo that so he looks straight at the viewer
    const g = new T.Group(); g.rotation.y = 0.55; g0.add(g);
    const K = '#151515', W = '#FFFFFF', S = '#F5C9A8';
    PB(0.8, 0.62, 0.45, K, 0, 0.31, 0, g);
    PB(0.32, 0.55, 0.02, W, 0, 0.34, 0.23, g);
    PB(0.26, 0.09, 0.04, '#D32F2F', 0, 0.58, 0.25, g); PS(0.04, '#B71C1C', 0, 0.58, 0.27, g);
    [0.42, 0.3, 0.18].forEach(y => PS(0.025, K, 0, y, 0.25, g));
    PB(0.5, 0.2, 0.22, K, -0.6, 0.5, 0.02, g, 0, 0, 0.35);
    PS(0.13, S, -0.86, 0.62, 0.04, g, 1.2, 0.7, 0.6);
    PB(0.2, 0.62, 0.22, K, 0.58, 0.78, 0.02, g, 0, 0, -0.55);
    PS(0.12, S, 0.78, 1.08, 0.04, g);
    // a short cane, so the gentleman fills the icon
    PC(0.035, 0.035, 0.75, W, 0.86, 1.32, 0.04, g, 0, 0, -0.3);
    PB(0.2, 0.06, 0.06, W, 1.0, 1.7, 0.04, g, 0, 0, -0.3);
    PB(0.06, 0.13, 0.06, W, 1.08, 1.63, 0.04, g, 0, 0, -0.3);
    PB(0.6, 0.56, 0.52, S, 0, 0.95, 0, g);
    [-0.12, 0.12].forEach(x => PS(0.04, K, x, 1.05, 0.27, g));
    PS(0.08, '#E8A0A0', 0, 0.94, 0.29, g);
    [-1, 1].forEach(s => { PS(0.14, W, s * 0.14, 0.84, 0.27, g, 1.6, 0.65, 0.6); PS(0.07, W, s * 0.33, 0.9, 0.24, g); });
    PC(0.42, 0.42, 0.05, K, 0, 1.25, 0, g, 0, 0, 0.08);
    PC(0.27, 0.29, 0.6, K, 0.02, 1.55, 0, g, 0, 0, 0.08);
    PC(0.295, 0.295, 0.1, '#6A3FA0', 0.005, 1.33, 0, g, 0, 0, 0.08);
    PC(0.285, 0.285, 0.16, '#22A9C9', 0.03, 1.66, 0, g, 0, 0, 0.08);
  },
  // blog: Kabosu, the doge, side-eye and all
  'doge': g => {
    const O = '#E3A857', C = '#FBEBD0', K = '#1B1B1B';
    PS(0.8, O, 0, 1.0, 0, g, 1.1, 0.95, 1);
    [-1, 1].forEach(s => { PK(0.28, 0.55, O, s * 0.5, 1.78, -0.05, g, 0, 0, -s * 0.3); PK(0.17, 0.36, '#F4C7A1', s * 0.5, 1.74, 0.08, g, 0, 0, -s * 0.3); });
    PS(0.5, C, 0, 0.78, 0.5, g, 1.25, 0.75, 0.8);
    [-1, 1].forEach(s => PS(0.32, C, s * 0.5, 0.82, 0.35, g, 0.9, 0.9, 0.9));
    PS(0.32, C, 0, 0.84, 0.82, g, 1, 0.72, 0.9);
    PS(0.12, K, 0, 0.98, 1.1, g, 1.25, 0.8, 0.8);
    PB(0.26, 0.03, 0.04, '#3E2A20', -0.04, 0.7, 1.06, g, 0, 0, 0.18);
    [-1, 1].forEach(s => { PS(0.13, '#FFFFFF', s * 0.3, 1.2, 0.64, g, 1, 1.05, 0.6); PS(0.075, K, s * 0.3 - 0.06, 1.2, 0.7, g); PS(0.07, C, s * 0.3, 1.4, 0.6, g, 1.2, 0.8, 0.6); });
  },
  // blog: a pair of red boxing gloves with white cuffs and laces
  'boxing-gloves': g => {
    [[-0.55, 0.15, 0.35], [0.55, -0.1, -0.35]].forEach(([x, rz, ry]) => {
      const h = new T.Group(); h.position.set(x, 0.9, 0); h.rotation.set(0, ry, rz); g.add(h);
      P(sph(0.55, 28, 20), mat('#D32F2F', { roughness: 0.35 }), 0, 0.25, 0.05, h, 0, 0, 0, 1, 1.15, 1.05);
      P(sph(0.22, 20, 14), mat('#C62828', { roughness: 0.35 }), -0.42, 0.05, 0.3, h, 0, 0, 0.6, 1, 1.4, 1);
      P(cyl(0.36, 0.38, 0.45, 28), mat('#F5F5F5', { roughness: 0.6 }), 0, -0.48, 0, h);
      P(cyl(0.385, 0.385, 0.08, 28), mat('#D32F2F'), 0, -0.3, 0, h);
      [-0.2, -0.05, 0.1].forEach(y => PB(0.18, 0.025, 0.04, '#FFFFFF', 0.08, y, 0.56, h, 0, 0, 0.5));
    });
  },
  // blog: the Japanese flag on a little pole (hinomaru on both sides)
  'japan-flag': g => {
    PC(0.05, 0.05, 2.4, '#8D6E63', -0.95, 1.2, 0, g);
    PS(0.09, '#FFC93C', -0.95, 2.44, 0, g);
    PC(0.28, 0.32, 0.12, '#5D4037', -0.95, 0.06, 0, g);
    P(rbox(1.7, 1.13, 0.05, 0.02), mat('#FFFFFF', { roughness: 0.7 }), -0.08, 1.75, 0, g);
    [0.03, -0.03].forEach(z => P(cyl(0.34, 0.34, 0.012, 40), mat('#E60026', { roughness: 0.5 }), -0.08, 1.75, z, g, Math.PI / 2, 0, 0));
  },
  // blog: board games = the Carcassonne box with the top-hat gentleman next to it
  'boardgames': g => {
    const box = new T.Group(); box.scale.setScalar(0.7); box.position.set(-0.55, 0, -0.5); g.add(box);
    PROPS['carcassonne'](box);
    const m = new T.Group(); m.position.set(1.0, 0, 0.55); m.rotation.y = -0.45; m.scale.setScalar(1.3); g.add(m);
    monopolyMan(m);
  },
  'monopoly-man': g => monopolyMan(g),
  // blog: a Carcassonne board game box (lid art drawn on a canvas), a few tiles and a meeple
  'carcassonne': g => {
    const lid = tex('carc-lid', 512, 512, (c, w, h) => {
      const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#5DADE2'); sky.addColorStop(0.55, '#FDEBD0'); sky.addColorStop(1, '#F8C471');
      c.fillStyle = sky; c.fillRect(0, 0, w, h);
      c.fillStyle = '#6AA84F'; c.beginPath(); c.moveTo(0, h * .78); c.quadraticCurveTo(w * .3, h * .66, w * .55, h * .76); c.quadraticCurveTo(w * .8, h * .84, w, h * .72); c.lineTo(w, h); c.lineTo(0, h); c.fill();
      c.fillStyle = '#38761D'; c.beginPath(); c.moveTo(0, h * .9); c.quadraticCurveTo(w * .5, h * .8, w, h * .9); c.lineTo(w, h); c.lineTo(0, h); c.fill();
      // city walls and towers
      const stone = '#B7A99A', dark = '#7D6E60', roof = '#C0392B';
      c.fillStyle = stone; c.fillRect(w * .12, h * .5, w * .76, h * .24);
      for (let x = w * .12; x < w * .88; x += 22) { c.fillRect(x, h * .47, 12, h * .04); }
      [[.12, .36, .1], [.36, .3, .11], [.6, .33, .1], [.8, .38, .09]].forEach(([tx, ty, tw]) => {
        c.fillStyle = stone; c.fillRect(w * tx, h * ty, w * tw, h * (.74 - ty));
        c.fillStyle = roof; c.beginPath(); c.moveTo(w * (tx - .015), h * ty); c.lineTo(w * (tx + tw / 2), h * (ty - .1)); c.lineTo(w * (tx + tw + .015), h * ty); c.fill();
        c.fillStyle = dark; c.fillRect(w * (tx + tw / 2 - .012), h * (ty + .06), w * .024, h * .05);
      });
      c.fillStyle = dark; c.beginPath(); c.arc(w * .5, h * .74, w * .06, Math.PI, 0); c.fill();
      // road
      c.strokeStyle = '#E5D3B3'; c.lineWidth = 16; c.beginPath(); c.moveTo(w * .5, h * .76); c.quadraticCurveTo(w * .42, h * .9, w * .3, h); c.stroke();
      // title band
      c.fillStyle = 'rgba(20, 40, 90, .88)'; c.fillRect(0, h * .05, w, h * .16);
      c.font = 'bold 58px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 8; c.strokeStyle = '#1B2631'; c.strokeText('Carcassonne', w / 2, h * .13);
      c.fillStyle = '#F7DC6F'; c.fillText('Carcassonne', w / 2, h * .13);
      // a red meeple on the lid
      c.fillStyle = '#E74C3C'; c.beginPath(); c.arc(w * .82, h * .8, 14, 0, tau); c.fill();
      c.beginPath(); c.moveTo(w * .82 - 30, h * .86); c.lineTo(w * .82 + 30, h * .86); c.lineTo(w * .82 + 18, h * .97); c.lineTo(w * .82 - 18, h * .97); c.fill();
    });
    const band = tex('carc-side', 512, 64, (c, w, h) => {
      c.fillStyle = '#1F3A75'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#F7DC6F'; c.font = 'bold 34px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Carcassonne', w / 2, h / 2);
    });
    const top = new T.MeshStandardMaterial({ map: lid, roughness: 0.5 });
    const side = new T.MeshStandardMaterial({ map: band, roughness: 0.55 });
    const bottom = mat('#1F3A75');
    // the box leans back so the lid art faces the viewer, like on a shop shelf
    const box = new T.Mesh(new T.BoxGeometry(2.0, 0.45, 2.0), [side, side, top, bottom, side, side]);
    box.rotation.x = 1.15; box.position.set(0, 1.0, -0.2); g.add(box);
    // loose tiles in front, a red meeple on the side
    PB(0.6, 0.06, 0.6, '#7CB342', -0.75, 0.03, 0.95, g, 0, 0.35, 0);
    PB(0.6, 0.06, 0.6, '#8BC34A', -0.05, 0.03, 1.05, g, 0, -0.2, 0);
    PB(0.55, 0.012, 0.11, '#EFE3C8', -0.05, 0.07, 1.05, g, 0, -0.2, 0);
    const m = new T.Group(); m.position.set(1.25, 0, 0.75); m.scale.setScalar(1.4); g.add(m);
    PS(0.11, '#E53935', 0, 0.42, 0, m);
    PB(0.18, 0.26, 0.12, '#E53935', 0, 0.2, 0, m);
    PB(0.44, 0.1, 0.12, '#E53935', 0, 0.27, 0, m);
    PB(0.1, 0.18, 0.12, '#E53935', -0.08, 0.04, 0, m, 0, 0, 0.25);
    PB(0.1, 0.18, 0.12, '#E53935', 0.08, 0.04, 0, m, 0, 0, -0.25);
  },
  // ---- L2 things
  'かさ': g => { PC(0.03, 0.03, 1.5, '#5B3A1E', 0, 0.75, 0, g); PK(0.85, 0.45, '#E8442E', 0, 1.62, 0, g); PS(0.05, '#222', 0, 1.88, 0, g); PT(0.12, 0.035, '#5B3A1E', 0.12, 0.02, 0, g, 0, 0, Math.PI, Math.PI); },
  'かばん': g => { PB(1.2, 0.85, 0.45, '#8B4A22', 0, 0.42, 0, g); PT(0.3, 0.05, '#5B2E12', 0, 0.88, 0, g, 0, 0, 0, Math.PI); PB(0.25, 0.12, 0.06, '#E8B923', 0, 0.55, 0.24, g); },
  'くつ': g => { [-0.33, 0.33].forEach(x => { PB(0.5, 0.35, 1.1, '#2E6FD8', x, 0.25, 0, g); PB(0.54, 0.12, 1.16, '#F8FAFC', x, 0.06, 0, g); PB(0.4, 0.06, 0.4, '#F8FAFC', x, 0.43, 0.15, g); }); },
  'さいふ': g => { PB(1.0, 0.65, 0.18, '#C2185B', 0, 0.33, 0, g); PB(0.6, 0.12, 0.06, '#FFD54F', 0.18, 0.68, 0, g); PB(1.02, 0.08, 0.2, '#9C134A', 0, 0.62, 0, g); PS(0.06, '#E8B923', 0.4, 0.42, 0.1, g); },
  'じてんしゃ': g => { [-0.7, 0.7].forEach(x => { PT(0.42, 0.05, '#222', x, 0.45, 0, g); PC(0.05, 0.05, 0.1, '#999', x, 0.45, 0, g, Math.PI / 2); }); PB(1.3, 0.08, 0.08, '#E8442E', 0, 0.8, 0, g, 0, 0, 0.12); PB(0.08, 0.6, 0.08, '#E8442E', -0.25, 0.65, 0, g, 0, 0, -0.35); PB(0.08, 0.6, 0.08, '#E8442E', 0.55, 0.75, 0, g, 0, 0, 0.3); PB(0.35, 0.08, 0.2, '#222', -0.35, 1.0, 0, g); PB(0.08, 0.08, 0.5, '#222', 0.62, 1.1, 0, g); },
  'しんぶん': g => { const n = new T.Group(); g.add(n); n.rotation.x = -1.0; PB(1.1, 1.4, 0.04, '#F2F2EE', 0, 0.7, 0, n); PB(0.95, 0.16, 0.01, '#222', 0, 1.25, 0.03, n); [1.0, 0.85, 0.7, 0.55, 0.4, 0.25].forEach(y => PB(0.4, 0.05, 0.01, '#888', -0.25, y, 0.03, n)); PB(0.42, 0.45, 0.01, '#B0B0B0', 0.25, 0.75, 0.03, n); [0.4, 0.25].forEach(y => PB(0.42, 0.05, 0.01, '#888', 0.25, y, 0.03, n)); },
  'スマホ': g => { PB(0.62, 1.2, 0.08, '#1F2937', 0, 0.6, 0, g); PB(0.54, 1.02, 0.02, '#4FC3F7', 0, 0.62, 0.045, g); PC(0.04, 0.04, 0.02, '#111', 0, 1.13, 0.045, g, Math.PI / 2); },
  'Tシャツ': g => { PB(0.8, 0.95, 0.12, '#FF5C8A', 0, 0.48, 0, g); [-1, 1].forEach(s => PB(0.35, 0.32, 0.12, '#FF5C8A', s * 0.5, 0.82, 0, g, 0, 0, s * -0.6)); PT(0.12, 0.03, '#C2185B', 0, 0.95, 0.03, g, 0, 0, Math.PI, Math.PI); },
  'とけい': g => { PC(0.55, 0.55, 0.15, '#F8FAFC', 0, 0.55, 0, g, Math.PI / 2); PT(0.55, 0.06, '#E8442E', 0, 0.55, 0, g); PB(0.05, 0.38, 0.03, '#111', 0, 0.7, 0.09, g); PB(0.3, 0.05, 0.03, '#111', 0.13, 0.55, 0.09, g); PS(0.05, '#111', 0, 0.55, 0.1, g); },
  'ノート': g => { PB(0.9, 0.08, 1.2, '#2E6FD8', 0, 0.04, 0, g); PB(0.82, 0.04, 1.12, '#FFFFFF', 0.02, 0.09, 0, g); [-0.4, -0.2, 0, 0.2, 0.4].forEach(z => PT(0.05, 0.015, '#888', -0.45, 0.1, z, g, 0, Math.PI / 2)); PB(0.5, 0.02, 0.15, '#FFD54F', 0.05, 0.12, -0.35, g); },
  'ペン': g => { PC(0.06, 0.06, 1.3, '#E8442E', 0, 0.65, 0, g); PK(0.06, 0.18, '#F5D0A9', 0, 1.39, 0, g); PK(0.02, 0.06, '#111', 0, 1.49, 0, g); PB(0.03, 0.4, 0.04, '#B71C1C', 0.07, 0.35, 0, g); },
  'ぼうし': g => { PC(0.75, 0.75, 0.05, '#2E6FD8', 0, 0.03, 0.2, g, 0, 0, 0, 1, 1, 0.6); PS(0.5, '#2E6FD8', 0, 0.06, 0, g, 1, 0.8, 1); PS(0.06, '#FFFFFF', 0, 0.48, 0, g); },
  'ほん': g => { PB(1.0, 0.25, 1.3, '#7B2D8E', 0, 0.13, 0, g); PB(0.92, 0.2, 1.24, '#FFF8E7', 0.05, 0.13, 0, g); PB(0.08, 0.27, 1.32, '#5A1F69', -0.48, 0.13, 0, g); PB(0.5, 0.02, 0.2, '#FFD54F', 0.05, 0.27, 0, g); },
  'さかな': g => { PS(0.5, '#4FA3E0', 0, 0.5, 0, g, 1.4, 0.7, 0.45); PK(0.35, 0.45, '#2E7DC0', -0.85, 0.5, 0, g, 0, 0, Math.PI / 2, 1, 1, 0.3); PS(0.07, '#FFF', 0.45, 0.6, 0.2, g); PS(0.035, '#111', 0.48, 0.6, 0.25, g); PK(0.15, 0.3, '#2E7DC0', 0, 0.9, 0, g, 0, 0, 0.3, 1, 1, 0.2); },
  'にく': g => { PS(0.6, '#A63A2B', 0, 0.55, 0, g, 1.25, 0.7, 0.75); PS(0.5, '#C8553D', 0.05, 0.62, 0.12, g, 1.1, 0.55, 0.6); [-1, 1].forEach(sx => { PC(0.09, 0.09, 0.5, '#F5F0E6', sx * 0.85, 0.55, 0, g, 0, 0, Math.PI / 2); [-0.1, 0.1].forEach(z => PS(0.12, '#F5F0E6', sx * 1.12, 0.55, z, g)); }); },
  'やさい': g => { PK(0.18, 1.0, '#F57C00', -0.35, 0.5, 0, g, 0, 0, Math.PI); [-0.42, -0.35, -0.28].forEach(x => PK(0.05, 0.35, '#43A047', x, 1.15, 0, g)); PC(0.08, 0.1, 0.5, '#7CB342', 0.4, 0.25, 0, g); [[0.4, 0.65, 0], [0.22, 0.6, 0.1], [0.58, 0.6, 0.1], [0.4, 0.62, -0.17]].forEach(([x, y, z]) => PS(0.22, '#2E7D32', x, y, z, g)); },
  'ジーンズ': g => { PB(0.9, 0.25, 0.3, '#2F5DA8', 0, 1.3, 0, g); [-1, 1].forEach(s => PB(0.4, 1.2, 0.3, '#2F5DA8', s * 0.24, 0.62, 0, g)); PB(0.92, 0.06, 0.32, '#5B3A1E', 0, 1.42, 0, g); PB(0.1, 0.06, 0.33, '#E8B923', 0, 1.42, 0.01, g); },
  // ---- L3
  'テレビ': g => { PB(1.6, 1.0, 0.15, '#1F2937', 0, 0.75, 0, g); PB(1.45, 0.85, 0.02, '#64B5F6', 0, 0.75, 0.08, g); PB(0.12, 0.25, 0.12, '#1F2937', 0, 0.15, 0, g); PB(0.7, 0.05, 0.35, '#1F2937', 0, 0.03, 0, g); },
  'テニス': g => { PT(0.42, 0.05, '#E8442E', 0, 1.0, 0, g, 0, 0, 0); PC(0.4, 0.4, 0.01, '#F5F5F5', 0, 1.0, 0, g, Math.PI / 2, 0, 0); PC(0.06, 0.06, 0.6, '#222', 0, 0.3, 0, g); PS(0.17, '#D4E157', 0.6, 0.25, 0.2, g); },
  'アイスクリーム': g => { PK(0.3, 0.9, '#E0A55A', 0, 0.45, 0, g, Math.PI); PS(0.33, '#FFB6C1', 0, 1.0, 0, g); PS(0.28, '#FFF3E0', 0, 1.38, 0, g); PS(0.07, '#E8442E', 0, 1.68, 0, g); },
  'ハンバーガー': g => { PS(0.7, '#E0A050', 0, 0.85, 0, g, 1, 0.5, 1); PC(0.72, 0.72, 0.1, '#43A047', 0, 0.62, 0, g); PC(0.68, 0.68, 0.18, '#6D3B1F', 0, 0.5, 0, g); PB(1.3, 0.04, 1.3, '#FFC107', 0, 0.62, 0, g, 0, 0.6); PC(0.7, 0.7, 0.22, '#E0A050', 0, 0.3, 0, g); },
  'おちゃ': g => { PC(0.38, 0.32, 0.6, '#5D8A3A', 0, 0.3, 0, g); PC(0.33, 0.33, 0.02, '#9CCC65', 0, 0.58, 0, g); PS(0.2, '#FFFFFF', 0.1, 0.95, 0, g, 1, 0.6, 1); },
  'コーヒー': g => { PC(0.35, 0.3, 0.7, '#C62828', 0, 0.35, 0, g); PC(0.31, 0.31, 0.02, '#4E2A10', 0, 0.68, 0, g); PT(0.17, 0.05, '#C62828', 0.38, 0.38, 0, g, 0, 0, 0); PC(0.6, 0.6, 0.04, '#F8FAFC', 0, 0.02, 0, g); [-0.08, 0.08].forEach((x, i) => PS(0.06, '#E0E0E0', x, 0.9 + i * 0.15, 0, g, 1, 1.6, 1)); },
  'みず': g => { PC(0.3, 0.25, 0.9, '#B3E5FC', 0, 0.45, 0, g); PC(0.27, 0.23, 0.6, '#4FC3F7', 0, 0.32, 0, g); },
  'おさけ': g => { PC(0.3, 0.32, 0.9, '#F5F5F0', 0, 0.45, 0, g); PC(0.12, 0.25, 0.3, '#F5F5F0', 0, 1.05, 0, g); PC(0.1, 0.1, 0.15, '#B71C1C', 0, 1.27, 0, g); PB(0.4, 0.45, 0.02, '#E8442E', 0, 0.45, 0.31, g); },
  'いえ': g => { PB(1.4, 0.9, 1.1, '#FFF3E0', 0, 0.45, 0, g); PK(1.15, 0.7, '#C62828', 0, 1.25, 0, g, 0, Math.PI / 4, 0, 1, 1, 0.85); PB(0.3, 0.5, 0.04, '#6D3B1F', 0, 0.25, 0.56, g); PB(0.3, 0.3, 0.04, '#81D4FA', 0.42, 0.55, 0.56, g); PB(0.3, 0.3, 0.04, '#81D4FA', -0.42, 0.55, 0.56, g); },
  'がっこう': g => { PB(2.2, 1.0, 0.9, '#FFF8E1', 0, 0.5, 0, g); PB(0.6, 0.6, 0.9, '#FFF8E1', 0, 1.25, 0, g); PC(0.2, 0.2, 0.05, '#FFFFFF', 0, 1.3, 0.47, g, Math.PI / 2); PT(0.2, 0.03, '#E8442E', 0, 1.3, 0.47, g); [-0.8, -0.4, 0.4, 0.8].forEach(x => PB(0.25, 0.25, 0.04, '#81D4FA', x, 0.6, 0.46, g)); PB(0.3, 0.45, 0.04, '#6D3B1F', 0, 0.23, 0.46, g); },
  'おんがく': g => { PS(0.25, '#1F2937', -0.3, 0.3, 0, g, 1.2, 0.9, 0.6); PS(0.25, '#1F2937', 0.4, 0.45, 0, g, 1.2, 0.9, 0.6); PB(0.07, 1.0, 0.07, '#1F2937', -0.06, 0.8, 0, g); PB(0.07, 1.0, 0.07, '#1F2937', 0.64, 0.95, 0, g); PB(0.75, 0.15, 0.07, '#1F2937', 0.29, 1.35, 0, g, 0, 0, 0.2); },
  'えいが': g => { PB(1.2, 0.8, 0.12, '#1F2937', 0, 0.4, 0, g); PB(1.25, 0.2, 0.13, '#F8FAFC', -0.05, 0.95, 0, g, 0, 0, 0.25); [-0.45, -0.15, 0.15, 0.45].forEach(x => PB(0.12, 0.2, 0.14, '#1F2937', x - 0.05, 0.95 + x * 0.25, 0, g, 0, 0, 0.25)); },
  // ---- L4
  'いぬ': g => { PB(1.2, 0.5, 0.5, '#C68642', 0, 0.65, 0, g); [[-0.45, 0.2], [0.45, 0.2], [-0.45, -0.2], [0.45, -0.2]].forEach(([x, z]) => PB(0.16, 0.45, 0.16, '#C68642', x, 0.22, z, g)); PB(0.5, 0.45, 0.45, '#C68642', 0.75, 1.05, 0, g); PB(0.3, 0.2, 0.3, '#E0A060', 1.05, 0.95, 0, g); PS(0.06, '#111', 1.22, 1.0, 0, g); [-0.15, 0.15].forEach(z => PB(0.12, 0.3, 0.1, '#7B4A1E', 0.65, 1.3, z, g)); PB(0.1, 0.4, 0.1, '#C68642', -0.65, 1.0, 0, g, 0, 0, 0.6); },
  'ねこ': g => { PS(0.5, '#FFB74D', 0, 0.45, 0, g, 1.2, 0.8, 0.8); PS(0.38, '#FFB74D', 0.55, 0.95, 0, g); [-0.17, 0.17].forEach(z => PK(0.12, 0.25, '#FFB74D', 0.55, 1.35, z, g)); [-0.12, 0.12].forEach(z => PS(0.05, '#111', 0.88, 1.0, z, g)); PS(0.04, '#E91E63', 0.92, 0.9, 0, g); PC(0.06, 0.04, 0.9, '#FFB74D', -0.7, 0.75, 0, g, 0, 0, 0.6); },
  'いす': g => { PB(0.9, 0.12, 0.9, '#A0522D', 0, 0.75, 0, g); PB(0.9, 0.9, 0.1, '#A0522D', 0, 1.25, -0.4, g); [[-0.38, 0.38], [0.38, 0.38], [-0.38, -0.38], [0.38, -0.38]].forEach(([x, z]) => PB(0.1, 0.75, 0.1, '#7B3F1A', x, 0.37, z, g)); },
  'つくえ': g => { PB(1.8, 0.12, 1.0, '#B07040', 0, 1.0, 0, g); [[-0.8, 0.4], [0.8, 0.4], [-0.8, -0.4], [0.8, -0.4]].forEach(([x, z]) => PB(0.12, 1.0, 0.12, '#7B3F1A', x, 0.5, z, g)); PB(0.6, 0.3, 0.9, '#9A5C30', 0.55, 0.8, 0, g); PS(0.04, '#E8B923', 0.55, 0.8, 0.46, g); },
  'しゃしん': g => { PB(1.2, 0.9, 0.08, '#F8FAFC', 0, 0.6, 0, g, -0.15); PB(1.0, 0.7, 0.02, '#81D4FA', 0, 0.62, 0.04, g, -0.15); PK(0.28, 0.35, '#43A047', -0.2, 0.47, 0.06, g, -0.15); PS(0.1, '#FFD54F', 0.3, 0.8, 0.06, g); },
  'はな': g => { PC(0.04, 0.04, 1.2, '#43A047', 0, 0.6, 0, g); PS(0.2, '#43A047', 0.18, 0.55, 0, g, 1, 0.4, 0.6); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; PS(0.2, '#FF8FB1', Math.cos(a) * 0.25, 1.25 + Math.sin(a) * 0.25, 0, g, 1, 1, 0.4); } PS(0.15, '#FFD54F', 0, 1.25, 0.05, g, 1, 1, 0.6); },
  'ごはん': g => { PS(0.65, '#F8FAFC', 0, 0.55, 0, g, 1, 0.55, 1); PC(0.7, 0.4, 0.55, '#C62828', 0, 0.3, 0, g); PC(0.3, 0.3, 0.08, '#B71C1C', 0, 0.03, 0, g); PB(1.5, 0.05, 0.05, '#8D6E63', 0.2, 0.75, 0.25, g, 0, 0.3, 0.15); PB(1.5, 0.05, 0.05, '#8D6E63', 0.2, 0.78, 0.35, g, 0, 0.35, 0.2); },
  'パン': g => { PS(0.6, '#D7A35A', 0, 0.45, 0, g, 1.5, 0.75, 0.9); [-0.4, 0, 0.4].forEach(x => PB(0.06, 0.04, 0.5, '#A66B2A', x, 0.88, 0, g, 0, 0.5)); },
  'おてら': g => { PB(1.6, 0.3, 1.2, '#9E9E9E', 0, 0.15, 0, g); PB(1.2, 0.6, 0.9, '#C62828', 0, 0.6, 0, g); PK(1.2, 0.5, '#2B1B12', 0, 1.15, 0, g, 0, Math.PI / 4, 0, 1.3, 1, 1); PB(0.7, 0.4, 0.55, '#C62828', 0, 1.5, 0, g); PK(0.75, 0.4, '#2B1B12', 0, 1.85, 0, g, 0, Math.PI / 4, 0, 1.3, 1, 1); PC(0.04, 0.04, 0.5, '#E8B923', 0, 2.25, 0, g); },
  'こうえん': g => { PC(0.12, 0.15, 0.9, '#6D3B1F', -0.6, 0.45, 0, g); PS(0.55, '#43A047', -0.6, 1.2, 0, g); PB(1.1, 0.08, 0.35, '#A0522D', 0.5, 0.45, 0.2, g); PB(1.1, 0.35, 0.06, '#A0522D', 0.5, 0.7, 0.03, g); [0.05, 0.95].forEach(x => PB(0.06, 0.45, 0.3, '#424242', x, 0.22, 0.2, g)); PC(1.5, 1.5, 0.04, '#7CB342', 0, 0.0, 0, g); },
  'バスてい': g => { PC(0.05, 0.05, 1.8, '#9E9E9E', 0, 0.9, 0, g); PC(0.35, 0.35, 0.06, '#1E88E5', 0, 1.75, 0, g, Math.PI / 2); PB(0.4, 0.12, 0.07, '#FFFFFF', 0, 1.75, 0.03, g); PB(0.3, 0.4, 0.05, '#FFFFFF', 0, 1.2, 0.04, g); PC(0.3, 0.3, 0.05, '#616161', 0, 0.02, 0, g); },
  'びょういん': g => { PB(1.6, 1.4, 1.0, '#F8FAFC', 0, 0.7, 0, g); PB(0.5, 0.15, 0.04, '#E53935', 0, 1.15, 0.51, g); PB(0.15, 0.5, 0.04, '#E53935', 0, 1.15, 0.51, g); [-0.5, 0.5].forEach(x => [0.45, 0.8].forEach(y => PB(0.28, 0.22, 0.04, '#81D4FA', x, y, 0.51, g))); PB(0.35, 0.45, 0.04, '#90A4AE', 0, 0.22, 0.51, g); },
  'ゲーム': g => { PB(1.2, 0.25, 0.6, '#37474F', 0, 0.3, 0, g); [-0.62, 0.62].forEach(x => PS(0.3, '#37474F', x, 0.25, 0.1, g, 1, 0.7, 1.2)); PB(0.3, 0.08, 0.1, '#111', -0.4, 0.45, 0, g); PB(0.1, 0.08, 0.3, '#111', -0.4, 0.45, 0, g); [['#E53935', 0.42, -0.08], ['#43A047', 0.55, 0.05], ['#1E88E5', 0.29, 0.05], ['#FDD835', 0.42, 0.18]].forEach(([c, x, z]) => PS(0.06, c, x, 0.45, z, g)); },
  // ---- L5
  'おみやげ': g => { PB(1.0, 0.7, 1.0, '#E8442E', 0, 0.35, 0, g); PB(1.04, 0.72, 0.15, '#FFD54F', 0, 0.36, 0, g); PB(0.15, 0.72, 1.04, '#FFD54F', 0, 0.36, 0, g); [-1, 1].forEach(s => PT(0.15, 0.05, '#FFD54F', s * 0.15, 0.82, 0, g, 0, 0, s * 0.5)); },
  'プレゼント': g => { PB(1.0, 0.7, 1.0, '#7B2D8E', 0, 0.35, 0, g); PB(1.04, 0.72, 0.15, '#FF8FB1', 0, 0.36, 0, g); PB(0.15, 0.72, 1.04, '#FF8FB1', 0, 0.36, 0, g); [-1, 1].forEach(s => PT(0.15, 0.05, '#FF8FB1', s * 0.15, 0.82, 0, g, 0, 0, s * 0.5)); },
  'バス': g => { PB(2.4, 0.95, 0.95, '#FBC02D', 0, 0.7, 0, g); [-0.9, -0.4, 0.1, 0.6].forEach(x => PB(0.38, 0.35, 0.02, '#81D4FA', x, 0.9, 0.48, g)); PB(0.02, 0.45, 0.8, '#81D4FA', 1.2, 0.85, 0, g); [-0.8, 0.8].forEach(x => [0.45, -0.45].forEach(z => PC(0.22, 0.22, 0.15, '#222', x, 0.22, z, g, Math.PI / 2))); },
  'くだもの': g => { PS(0.35, '#E53935', -0.4, 0.35, 0, g); PC(0.03, 0.03, 0.2, '#5B3A1E', -0.4, 0.75, 0, g); PS(0.33, '#FB8C00', 0.35, 0.33, 0.1, g); PT(0.55, 0.13, '#FDD835', 0.1, 0.55, -0.3, g, Math.PI / 2, 0, 0.3, 1.6); },
  'たんじょうび': g => { PC(0.75, 0.75, 0.55, '#FFF3E0', 0, 0.28, 0, g); PC(0.77, 0.77, 0.1, '#FF8FB1', 0, 0.56, 0, g); [[-0.3, 0], [0, 0.25], [0.3, 0], [0, -0.25]].forEach(([x, z]) => { PC(0.04, 0.04, 0.35, '#64B5F6', x, 0.78, z, g); PS(0.06, '#FFC107', x, 1.0, z, g, 1, 1.6, 1); }); },
  'サーフィン': g => { PS(0.5, '#29B6F6', 0, 1.0, 0, g, 0.55, 2.1, 0.12); PB(0.05, 1.8, 0.03, '#FFFFFF', 0, 1.0, 0.06, g); PK(0.15, 0.25, '#0277BD', 0, 0.05, -0.05, g, Math.PI); },
  // ---- L6
  'でんき': g => { PS(0.45, '#FFF59D', 0, 0.9, 0, g, 1, 1.1, 1); PC(0.22, 0.22, 0.35, '#9E9E9E', 0, 0.3, 0, g); [0.2, 0.3, 0.4].forEach(y => PT(0.22, 0.025, '#757575', 0, y, 0, g, Math.PI / 2)); PB(0.05, 0.3, 0.05, '#FFB300', 0, 0.9, 0, g); },
  'まど': g => { PB(1.3, 1.3, 0.12, '#F8FAFC', 0, 0.65, 0, g); PB(1.1, 1.1, 0.02, '#81D4FA', 0, 0.65, 0.06, g); PB(0.08, 1.15, 0.05, '#F8FAFC', 0, 0.65, 0.07, g); PB(1.15, 0.08, 0.05, '#F8FAFC', 0, 0.65, 0.07, g); PB(1.4, 0.1, 0.25, '#ECEFF1', 0, 0.02, 0.1, g); },
  'でんしゃ': g => { PB(2.6, 0.9, 0.9, '#43A047', 0, 0.65, 0, g); PB(2.62, 0.2, 0.92, '#F8FAFC', 0, 0.45, 0, g); [-1.0, -0.5, 0, 0.5, 1.0].forEach(x => PB(0.35, 0.3, 0.02, '#81D4FA', x, 0.85, 0.46, g)); PB(0.05, 0.3, 0.05, '#555', 0, 1.25, 0, g); PB(1.0, 0.05, 0.05, '#555', 0, 1.4, 0, g); PB(2.8, 0.06, 1.0, '#424242', 0, 0.1, 0, g); },
  'おかね': g => { PB(1.3, 0.04, 0.7, '#A5D6A7', 0, 0.3, 0, g, 0, 0.2); PC(0.25, 0.25, 0.04, '#C49A2C', -0.35, 0.02, 0.45, g); PC(0.25, 0.25, 0.04, '#B0BEC5', 0.3, 0.06, 0.5, g); PC(0.25, 0.25, 0.04, '#C49A2C', 0.0, 0.1, 0.4, g); PC(0.18, 0.18, 0.05, '#E0E0E0', 0, 0.33, 0, g); },
  'にもつ': g => { PB(1.0, 1.3, 0.45, '#5C6BC0', 0, 0.75, 0, g); PB(0.06, 1.0, 0.47, '#3949AB', -0.25, 0.75, 0, g); PB(0.06, 1.0, 0.47, '#3949AB', 0.25, 0.75, 0, g); PT(0.2, 0.05, '#212121', 0, 1.42, 0, g, 0, 0, 0, Math.PI); [-0.4, 0.4].forEach(x => PC(0.07, 0.07, 0.1, '#212121', x, 0.07, 0, g, Math.PI / 2)); },
  'パソコン': g => { PB(1.5, 0.06, 1.0, '#B0BEC5', 0, 0.03, 0.3, g); PB(1.3, 0.02, 0.6, '#37474F', 0, 0.07, 0.35, g); PB(1.5, 1.0, 0.06, '#B0BEC5', 0, 0.55, -0.2, g, -0.2); PB(1.35, 0.85, 0.02, '#4FC3F7', 0, 0.55, -0.16, g, -0.2); },
  'シャワー': g => { PB(0.08, 1.4, 0.08, '#B0BEC5', 0, 0.7, -0.4, g); PB(0.08, 0.08, 0.5, '#B0BEC5', 0, 1.4, -0.15, g); PK(0.3, 0.3, '#CFD8DC', 0, 1.3, 0.1, g, Math.PI); for (let i = 0; i < 7; i++) PB(0.025, 0.7, 0.025, '#4FC3F7', (i - 3) * 0.08, 0.75, 0.1 + (i % 2) * 0.06, g); },
  'エアコン': g => { PB(1.8, 0.55, 0.45, '#F8FAFC', 0, 1.0, 0, g); PB(1.6, 0.08, 0.05, '#B0BEC5', 0, 0.8, 0.22, g); [0.2, 0.0, -0.2].forEach((y, i) => PB(1.2 - i * 0.2, 0.04, 0.04, '#81D4FA', 0, 0.45 + y, 0.4, g)); },
  // ---- L7
  'めがね': g => { [-0.38, 0.38].forEach(x => { PT(0.28, 0.04, '#1F2937', x, 0.4, 0, g); PC(0.26, 0.26, 0.01, '#B3E5FC', x, 0.4, 0, g, Math.PI / 2); }); PB(0.22, 0.05, 0.05, '#1F2937', 0, 0.45, 0, g); [-1, 1].forEach(s => PB(0.06, 0.06, 0.8, '#1F2937', s * 0.66, 0.42, -0.4, g)); },
  'くるま': g => { PB(2.0, 0.55, 1.0, '#E53935', 0, 0.5, 0, g); PB(1.1, 0.5, 0.9, '#E53935', -0.1, 1.0, 0, g); PB(0.02, 0.38, 0.8, '#81D4FA', 0.46, 1.0, 0, g); [-0.65, 0.65].forEach(x => [0.5, -0.5].forEach(z => PC(0.25, 0.25, 0.18, '#212121', x, 0.25, z, g, Math.PI / 2))); PB(0.05, 0.12, 0.25, '#FFF59D', 1.0, 0.6, 0.3, g); },
  'うた': g => { PS(0.3, '#9E9E9E', 0, 1.25, 0, g); PC(0.12, 0.08, 0.9, '#212121', 0, 0.6, 0, g); PT(0.33, 0.02, '#616161', 0, 1.25, 0, g, Math.PI / 2); [0.5, 0.7].forEach((x, i) => PS(0.08, '#E91E63', x, 1.4 + i * 0.25, 0, g)); },
  // ---- L8
  'カメラ': g => { PB(1.3, 0.8, 0.5, '#37474F', 0, 0.4, 0, g); PC(0.3, 0.3, 0.35, '#212121', 0, 0.4, 0.35, g, Math.PI / 2); PC(0.2, 0.2, 0.02, '#4FC3F7', 0, 0.4, 0.53, g, Math.PI / 2); PB(0.3, 0.12, 0.3, '#37474F', -0.35, 0.86, 0, g); PC(0.08, 0.08, 0.06, '#E53935', 0.45, 0.83, 0, g); },
  'トマト': g => { PS(0.55, '#E53935', 0, 0.5, 0, g, 1, 0.85, 1); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; PB(0.25, 0.04, 0.08, '#2E7D32', Math.cos(a) * 0.12, 0.96, Math.sin(a) * 0.12, g, 0, -a); } PC(0.03, 0.03, 0.15, '#2E7D32', 0, 1.02, 0, g); },
  'はし': g => { PB(0.08, 0.06, 1.8, '#8D3B2E', -0.12, 0.1, 0, g, 0, 0.06); PB(0.08, 0.06, 1.8, '#8D3B2E', 0.12, 0.1, 0, g, 0, -0.06); PB(0.6, 0.08, 0.18, '#F8FAFC', 0, 0.03, 0.75, g); },
  'おふろ': g => { PB(1.8, 0.7, 1.0, '#F8FAFC', 0, 0.35, 0, g); PB(1.6, 0.05, 0.8, '#4FC3F7', 0, 0.62, 0, g); [[-0.3, 0.1], [0.2, -0.2], [0.5, 0.2]].forEach(([x, z]) => PS(0.15, '#FFFFFF', x, 0.7, z, g)); PS(0.12, '#FFD54F', -0.5, 0.72, -0.2, g); },
  'ゆき': g => { PS(0.55, '#FFFFFF', 0, 0.5, 0, g); PS(0.4, '#FFFFFF', 0, 1.25, 0, g); PS(0.3, '#FFFFFF', 0, 1.8, 0, g); PK(0.06, 0.3, '#FB8C00', 0, 1.8, 0.4, g, Math.PI / 2); [-0.1, 0.1].forEach(x => PS(0.04, '#111', x, 1.9, 0.26, g)); PC(0.25, 0.25, 0.3, '#212121', 0, 2.15, 0, g); },
  'あめ': g => { PS(0.45, '#90A4AE', -0.3, 1.4, 0, g); PS(0.55, '#90A4AE', 0.25, 1.5, 0, g); PS(0.4, '#90A4AE', 0.65, 1.35, 0, g); [[-0.4, 0.7], [0, 0.5], [0.4, 0.75], [0.7, 0.45], [-0.15, 0.2]].forEach(([x, y]) => PS(0.08, '#29B6F6', x, y, 0, g, 1, 1.5, 1)); },
  'はれ': g => { PS(0.5, '#FFC107', 0, 1.0, 0, g); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; PB(0.08, 0.3, 0.08, '#FFB300', Math.cos(a) * 0.8, 1.0 + Math.sin(a) * 0.8, 0, g, 0, 0, a - Math.PI / 2); } },
  'くもり': g => { PS(0.45, '#B0BEC5', -0.4, 0.8, 0, g); PS(0.6, '#CFD8DC', 0.15, 0.95, 0, g); PS(0.45, '#B0BEC5', 0.7, 0.8, 0, g); PB(1.6, 0.4, 0.6, '#CFD8DC', 0.15, 0.6, 0, g); },
  // ---- L9
  'ギター': g => { PS(0.5, '#C67C3A', 0, 0.5, 0, g, 1, 1.05, 0.3); PS(0.38, '#C67C3A', 0, 1.1, 0, g, 1, 1, 0.3); PC(0.14, 0.14, 0.02, '#3E2723', 0, 0.75, 0.14, g, Math.PI / 2); PB(0.12, 1.1, 0.08, '#5D4037', 0, 1.85, 0, g); PB(0.2, 0.25, 0.1, '#3E2723', 0, 2.45, 0, g); },
  'ピアノ': g => { PB(1.8, 1.1, 0.7, '#212121', 0, 0.75, -0.1, g); PB(1.8, 0.1, 0.45, '#F8FAFC', 0, 0.68, 0.45, g); for (let i = 0; i < 9; i++) if (i % 7 !== 2 && i % 7 !== 6) PB(0.09, 0.08, 0.25, '#111', -0.8 + i * 0.2 + 0.1, 0.75, 0.38, g); [-0.8, 0.8].forEach(x => PB(0.1, 0.6, 0.1, '#212121', x, 0.3, 0.5, g)); },
  'チケット': g => { PB(1.4, 0.04, 0.7, '#FFC107', 0, 0.3, 0, g, 0.6); PB(0.03, 0.05, 0.65, '#FF8F00', 0.4, 0.3, 0, g, 0.6); PB(0.6, 0.05, 0.08, '#E65100', -0.2, 0.32, 0.1, g, 0.6); PB(0.4, 0.05, 0.06, '#E65100', -0.3, 0.35, -0.1, g, 0.6); },
  'おべんとう': g => { PB(1.4, 0.35, 0.9, '#C62828', 0, 0.18, 0, g); PB(1.3, 0.05, 0.8, '#212121', 0, 0.34, 0, g); PS(0.3, '#F8FAFC', -0.35, 0.4, 0, g, 1.2, 0.4, 1); PS(0.06, '#C62828', -0.35, 0.5, 0, g); PB(0.3, 0.12, 0.18, '#FFD54F', 0.25, 0.42, -0.2, g); PS(0.12, '#43A047', 0.45, 0.42, 0.15, g); PS(0.12, '#8D4A2B', 0.2, 0.42, 0.18, g); },
  'ピザ': g => { PK(0.9, 0.08, '#F5C26B', 0, 0.05, 0, g, 0, 0, 0, 1, 1, 1); PC(0.85, 0.85, 0.06, '#FFD54F', 0, 0.1, 0, g); PC(0.92, 0.92, 0.1, '#D7A35A', 0, 0.06, 0, g); [[0.3, 0.2], [-0.35, 0.3], [0.1, -0.45], [-0.3, -0.25], [0.5, -0.2]].forEach(([x, z]) => PC(0.13, 0.13, 0.04, '#C62828', x, 0.15, z, g)); },
  'くすり': g => { PC(0.18, 0.18, 0.5, '#E53935', -0.13, 0.4, 0, g, 0, 0, Math.PI / 2.5); PS(0.18, '#E53935', -0.33, 0.32, 0, g); PC(0.18, 0.18, 0.5, '#F8FAFC', 0.25, 0.55, 0, g, 0, 0, Math.PI / 2.5); PS(0.18, '#F8FAFC', 0.45, 0.63, 0, g); PC(0.3, 0.3, 0.08, '#FFFFFF', 0.4, 0.04, 0.45, g); },
  'てがみ': g => { const n = new T.Group(); g.add(n); n.rotation.x = -0.35; PB(1.4, 0.9, 0.05, '#FFF8E7', 0, 0.45, 0, n); [-1, 1].forEach(sx => PB(0.82, 0.04, 0.02, '#C9B79C', sx * 0.33, 0.62, 0.03, n, 0, 0, sx * -0.6)); PB(0.25, 0.3, 0.02, '#E53935', 0.5, 0.7, 0.03, n); PC(0.1, 0.1, 0.02, '#B71C1C', 0, 0.42, 0.04, n, Math.PI / 2); },
  'スキー': g => { [-0.2, 0.2].forEach(x => { PB(0.18, 0.05, 2.2, '#1E88E5', x, 0.05, 0, g); PB(0.18, 0.05, 0.3, '#1E88E5', x, 0.14, 1.15, g, -0.6); PB(0.22, 0.2, 0.35, '#212121', x, 0.17, 0, g); }); [-0.6, 0.6].forEach(x => PC(0.03, 0.03, 1.5, '#9E9E9E', x, 0.75, -0.2, g, 0.2)); },
  // ---- L10
  'ケーキ': g => { PB(0.8, 0.55, 0.9, '#FFF3E0', 0, 0.28, 0, g); PB(0.82, 0.08, 0.92, '#FF8FB1', 0, 0.3, 0, g); PB(0.82, 0.08, 0.92, '#FFFFFF', 0, 0.58, 0, g); PS(0.13, '#E53935', 0, 0.75, 0.1, g); },
  'すし': g => { PB(0.9, 0.35, 0.5, '#F8FAFC', 0, 0.18, 0, g); PB(1.0, 0.12, 0.55, '#FF8A65', 0, 0.42, 0, g); [-0.2, 0.05, 0.3].forEach(x => PB(0.04, 0.13, 0.56, '#FFCCBC', x, 0.43, 0, g, 0, 0, 0.3)); PB(1.2, 0.06, 0.8, '#5D4037', 0.1, -0.03, 0, g); },
  'りんご': g => { PS(0.55, '#E53935', 0, 0.55, 0, g, 1, 0.92, 1); PC(0.04, 0.04, 0.25, '#5B3A1E', 0, 1.12, 0, g, 0, 0, 0.2); PS(0.15, '#43A047', 0.15, 1.12, 0, g, 1.4, 0.5, 0.8); },
  'ぎゅうにゅう': g => { PB(0.7, 1.1, 0.7, '#F8FAFC', 0, 0.55, 0, g); PK(0.5, 0.35, '#F8FAFC', 0, 1.27, 0, g, 0, Math.PI / 4); PB(0.72, 0.4, 0.72, '#1E88E5', 0, 0.55, 0, g); PB(0.25, 0.2, 0.05, '#FFFFFF', 0, 0.55, 0.36, g); },
  'ふね': g => { PB(2.0, 0.5, 0.8, '#E53935', 0, 0.3, 0, g); PK(0.4, 0.5, '#E53935', 1.15, 0.3, 0, g, 0, 0, -Math.PI / 2, 1, 1, 2); PB(1.0, 0.45, 0.6, '#F8FAFC', -0.2, 0.75, 0, g); PC(0.15, 0.15, 0.4, '#212121', -0.2, 1.15, 0, g); [-0.5, -0.2, 0.1].forEach(x => PC(0.07, 0.07, 0.02, '#81D4FA', x, 0.78, 0.31, g, Math.PI / 2)); },
  'ひこうき': g => { PC(0.25, 0.25, 2.2, '#F8FAFC', 0, 0.6, 0, g, 0, 0, Math.PI / 2); PS(0.25, '#F8FAFC', 1.1, 0.6, 0, g, 1.4, 1, 1); PB(0.7, 0.06, 2.6, '#E53935', 0, 0.6, 0, g); PB(0.4, 0.5, 0.06, '#E53935', -1.0, 0.95, 0, g); PB(0.3, 0.06, 0.9, '#E53935', -1.0, 0.65, 0, g); },
  'しんかんせん': g => { PB(2.2, 0.75, 0.8, '#F8FAFC', -0.3, 0.55, 0, g); PS(0.4, '#F8FAFC', 0.95, 0.5, 0, g, 2.2, 0.85, 1); PB(2.8, 0.1, 0.82, '#1E88E5', 0.1, 0.4, 0, g); PS(0.12, '#37474F', 1.4, 0.65, 0, g, 2.5, 1, 2.8); [-1.1, -0.6, -0.1, 0.4].forEach(x => PB(0.3, 0.18, 0.02, '#37474F', x, 0.72, 0.41, g)); },
  'てぶくろ': g => { [-0.4, 0.4].forEach(x => { PB(0.55, 0.65, 0.22, '#E53935', x, 0.6, 0, g); PB(0.22, 0.35, 0.2, '#E53935', x + (x < 0 ? -0.33 : 0.33), 0.55, 0, g, 0, 0, x < 0 ? 0.6 : -0.6); PB(0.6, 0.25, 0.25, '#F8FAFC', x, 0.18, 0, g); }); },
  'サッカー': g => { PS(0.6, '#F8FAFC', 0, 0.6, 0, g); const t = (1 + Math.sqrt(5)) / 2; [[0, 1, t], [0, -1, t], [0, 1, -t], [0, -1, -t], [1, t, 0], [-1, t, 0], [1, -t, 0], [-1, -t, 0], [t, 0, 1], [-t, 0, 1], [t, 0, -1], [-t, 0, -1]].forEach(([x, y, z]) => { const L = Math.hypot(x, y, z); const m = P(sph(0.16, 5, 2), mat('#212121'), x / L * 0.56, 0.6 + y / L * 0.56, z / L * 0.56, g); m.lookAt(new T.Vector3(x * 2, 0.6 + y * 2, z * 2)); m.rotateX(Math.PI / 2); m.scale.set(1, 0.35, 1); }); },
  'やきゅう': g => { PS(0.3, '#F8FAFC', 0.5, 0.3, 0.3, g); PT(0.3, 0.02, '#E53935', 0.5, 0.3, 0.3, g, 0.3, 0.6); PC(0.06, 0.16, 1.8, '#C68642', -0.3, 0.8, 0, g, 0, 0, -0.5); },
  // ---- L11
  'やま': g => { PK(1.2, 1.6, '#6D4C41', 0, 0.8, 0, g, 0, Math.PI / 6); PK(0.45, 0.6, '#FFFFFF', 0, 1.32, 0, g, 0, Math.PI / 6); PK(0.7, 0.9, '#5D4037', 1.0, 0.45, -0.3, g); },
  'じんじゃ': g => { [-0.7, 0.7].forEach(x => PC(0.09, 0.1, 1.6, '#E53935', x, 0.8, 0, g)); PB(2.1, 0.15, 0.25, '#212121', 0, 1.68, 0, g); PB(1.9, 0.12, 0.2, '#E53935', 0, 1.55, 0, g); PB(1.7, 0.1, 0.15, '#E53935', 0, 1.25, 0, g); PB(0.12, 0.3, 0.15, '#E53935', 0, 1.4, 0, g); },
  'おもちゃ': g => { PS(0.45, '#A1887F', 0, 0.5, 0, g, 1, 1.1, 0.9); PS(0.35, '#A1887F', 0, 1.15, 0, g); [-0.25, 0.25].forEach(x => PS(0.13, '#8D6E63', x, 1.45, 0, g)); PS(0.12, '#D7CCC8', 0, 1.08, 0.3, g); PS(0.04, '#111', 0, 1.13, 0.4, g); [-0.12, 0.12].forEach(x => PS(0.045, '#111', x, 1.25, 0.3, g)); [-0.45, 0.45].forEach(x => PS(0.15, '#A1887F', x, 0.6, 0.1, g)); PB(0.3, 0.1, 0.05, '#E53935', 0, 0.88, 0.32, g); },
  'おかし': g => { PS(0.35, '#FF8FB1', 0, 0.4, 0, g, 1.3, 1, 1); [-1, 1].forEach(s => PK(0.25, 0.4, '#FF8FB1', s * 0.6, 0.4, 0, g, 0, 0, s * Math.PI / 2)); [-0.15, 0.15].forEach(x => PB(0.06, 0.6, 0.06, '#FFFFFF', x, 0.4, 0.31, g, 0, 0, 0.4)); },
  'ビール': g => { PC(0.4, 0.4, 1.0, '#FFB300', 0, 0.5, 0, g); PS(0.42, '#FFFFFF', 0, 1.05, 0, g, 1, 0.45, 1); PT(0.22, 0.07, '#FFE082', 0.45, 0.5, 0, g); },
  'キャンプ': g => { PK(1.0, 1.2, '#43A047', 0, 0.6, 0, g, 0, Math.PI / 4); PK(0.3, 0.6, '#1B5E20', 0, 0.3, 0.55, g, 0, Math.PI / 4); [-0.25, 0, 0.25].forEach((x, i) => PC(0.05, 0.05, 0.4, '#6D3B1F', 1.0 + x, 0.08, 0.6, g, 0, i, Math.PI / 2)); PK(0.15, 0.35, '#FF7043', 1.0, 0.3, 0.6, g); },
  'つり': g => { PC(0.03, 0.05, 2.0, '#6D3B1F', 0, 1.0, 0, g, 0, 0, -0.6); PC(0.005, 0.005, 1.2, '#424242', 0.95, 0.9, 0, g); PS(0.08, '#E53935', 0.95, 0.3, 0, g); PS(0.3, '#4FA3E0', 1.5, 0.15, 0, g, 1.4, 0.6, 0.4); },
  // ---- L12
  'たまご': g => { PS(0.45, '#FFF8E1', 0, 0.55, 0, g, 0.85, 1.15, 0.85); },
  'ジュース': g => { PB(0.6, 1.0, 0.4, '#FB8C00', 0, 0.5, 0, g); PS(0.18, '#FFB74D', 0, 0.55, 0.2, g, 1, 1, 0.3); PC(0.03, 0.03, 0.5, '#F8FAFC', 0.15, 1.15, 0, g, 0, 0, -0.3); },
  'は': g => { PB(0.7, 0.6, 0.6, '#FFFFFF', 0, 0.75, 0, g); [-0.2, 0.2].forEach(x => PK(0.17, 0.6, '#FFFFFF', x, 0.2, 0, g, Math.PI)); [-0.12, 0.12].forEach(x => PS(0.05, '#111', x, 0.85, 0.3, g)); },
  'きっぷ': g => { PB(1.2, 0.04, 0.6, '#81D4FA', 0, 0.3, 0, g, 0.6); PB(0.9, 0.05, 0.06, '#0D47A1', 0, 0.32, 0.05, g, 0.6); PC(0.05, 0.05, 0.06, '#FFFFFF', 0.45, 0.3, -0.1, g, 0.6); },
  'ふく': g => { PB(0.6, 0.6, 0.3, '#AB47BC', 0, 1.2, 0, g); PK(0.75, 1.0, '#AB47BC', 0, 0.45, 0, g, 0, 0, 0, 1, 1, 0.55); PB(0.62, 0.1, 0.32, '#7B1FA2', 0, 0.92, 0, g); [-1, 1].forEach(sx => PB(0.12, 0.35, 0.12, '#AB47BC', sx * 0.22, 1.62, 0, g)); PT(0.12, 0.03, '#7B1FA2', 0, 1.5, 0.12, g, 0, 0, Math.PI, Math.PI); },
};
function buildProp(name) {
  const g = new T.Group(); const fn = PROPS[name];
  if (fn) fn(g);
  normalizeTo(g, 2.2);
  return g;
}

/* ===== smooth real-time pose animation (Nihongo Quest) ===== */
const ANIMS = [];
let animRaf = 0, animLast = 0;
const ease = u => (1 - Math.cos(Math.PI * u)) / 2;
function frameOf(name, fi, mirror) {
  const P0 = POSES[name] || POSES.idle; let f = P0.f[fi % P0.f.length];
  if (mirror) f = P0.keepArms ? Object.assign({}, f, { head: f.head ? [f.head[0], -f.head[1], -f.head[2]] : null }) : mirrorFrame(f);
  return { f, P0 };
}
// Michael-Jackson style procedural moves (x slide + spin around own axis)
const PI = Math.PI;
function procPose(name, t, dur) {
  const ph = t / Math.max(0.01, dur), base = { arms: [[0.05, -0.08], [0.05, 0.08]], legs: [[0, -0.03], [0, 0.03]], head: [0, 0, 0], lean: 0, y: 0, x: 0, spin: 0 };
  if (name === "moonwalk" || name === "moonwalkL") {
    const d = name === "moonwalk" ? 1 : -1, s = Math.sin(t / 0.55 * PI * 2), st = Math.max(0, s), sb = Math.max(0, -s);
    return Object.assign(base, { spin: d * PI / 2, x: -d * (-0.55 + 1.1 * Math.min(1, ph * 1.05)), legs: [[-0.38 * st + 0.12 * sb, -0.03], [-0.38 * sb + 0.12 * st, 0.03]], arms: [[0.25 * s, -0.12], [-0.25 * s, 0.12]], head: [0.05, 0, 0], y: 0.04 * Math.abs(s) });
  }
  if (name === "spin") { const u = Math.min(1, ph * 1.15); return Object.assign(base, { spin: (1 - Math.cos(PI * u)) / 2 * PI * 2, arms: [[-0.25, -0.75], [-0.25, 0.75]], legs: [[0, -0.02], [0, 0.02]], head: [-0.1, 0, 0], y: 0.06 }); }
  if (name === "toe") return Object.assign(base, { y: 0.16, legs: [[0.15, -0.02], [0.15, 0.02]], arms: [[0.1, -0.35], [0.1, 0.35]], head: [-0.25, 0, 0.05], lean: -0.08 });
  if (name === "point") { const w = Math.sin(t * 6) * 0.04; return Object.assign(base, { arms: [[-PI + 0.25 + w, -0.25], [0.35, 0.55]], legs: [[0, -0.16], [0, 0.16]], head: [-0.3, -0.12, -0.08], y: 0.02 }); }
  if (name === "lean") { const u = Math.min(1, ph * 2.2), e = (1 - Math.cos(PI * Math.min(1, u))) / 2, back = ph > 0.75 ? (ph - 0.75) / 0.25 : 0; return Object.assign(base, { lean: 0.62 * e * (1 - back), arms: [[0.08, -0.06], [0.08, 0.06]], legs: [[-0.62 * e * (1 - back), -0.03], [-0.62 * e * (1 - back), 0.03]], head: [-0.35 * e * (1 - back), 0, 0] }); }
  if (name === "kick") { const s = Math.max(0, Math.sin(t / 0.6 * PI * 2)); return Object.assign(base, { legs: [[0, -0.03], [-0.5 * s, 0.75 * s]], arms: [[-PI + 0.3, -0.3], [0.2, 0.4 + 0.3 * s]], head: [-0.15, 0.2, 0], y: 0.03 * s }); }
  return null;
}
function targetPose(name, t, mirror, period, dur) {
  const pp = procPose(name, t, dur || 2); if (pp) return pp;
  const a = frameOf(name, 0, mirror), b = frameOf(name, 1, mirror), u = ease((Math.sin(t / period * Math.PI * 2 - Math.PI / 2) + 1) / 2);
  const L = (x, y) => x + (y - x) * u, fa = a.f, fb = b.f, P0 = a.P0;
  const hd = (f) => f.head || [0, 0, 0];
  return {
    arms: [0, 1].map(i => [L(fa.arms[i][0], fb.arms[i][0]), L(fa.arms[i][1], fb.arms[i][1])]),
    legs: [0, 1].map(i => [L(fa.legs[i][0], fb.legs[i][0]), L(fa.legs[i][1], fb.legs[i][1])]),
    head: [0, 1, 2].map(i => L(hd(fa)[i], hd(fb)[i])),
    lean: L(fa.lean != null ? fa.lean : (P0.lean || 0), fb.lean != null ? fb.lean : (P0.lean || 0)),
    y: L(fa.y || 0, fb.y || 0) + (P0.sit ? -0.76 : 0), x: 0, spin: 0
  };
}
function mountAnim(el, def) {
  if (el._anim) return el._anim;
  const W = Math.max(60, el.clientWidth || 160), H = Math.max(80, el.clientHeight || 200);
  const r = new T.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setClearColor(0x000000, 0); r.setSize(W, H, false);
  r.domElement.style.width = '100%'; r.domElement.style.height = '100%'; r.domElement.style.display = 'block';
  const scene = new T.Scene(); lights(scene);
  if (def.podium) { // blog: a glowing stage under the character (same look as the live QA Quest avatar)
    const pod = new T.Group(); scene.add(pod);
    const base = new T.Mesh(new T.CylinderGeometry(1.32, 1.42, 0.22, 64), mat('#0c1b3f', { roughness: 0.55, metalness: 0.2 }));
    base.position.y = -0.11; pod.add(base);
    const top = new T.Mesh(new T.CylinderGeometry(1.24, 1.24, 0.02, 64), mat('#13295e', { roughness: 0.35, metalness: 0.15 }));
    top.position.y = 0.0; pod.add(top);
    const rim = new T.Mesh(new T.TorusGeometry(1.32, 0.035, 10, 96), glow('#39FF14', 1.1));
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.0; pod.add(rim);
    const inner = new T.Mesh(new T.TorusGeometry(0.95, 0.012, 6, 96), glow('#39FF14', 0.6));
    inner.rotation.x = Math.PI / 2; inner.position.y = 0.012; pod.add(inner);
  }
  const n = def.actors.length, gap = def.gap || 2.3;
  const actors = def.actors.map((ac, i) => {
    const a = buildAvatar(ac.keepWeapon ? ac.spec : Object.assign({}, ac.spec, { weapon: null }));
    const holder = new T.Group(); holder.add(a.rig); scene.add(holder);
    holder.position.x = (i - (n - 1) / 2) * gap; holder.rotation.y = ac.yaw || 0;
    a.rig.rotation.order = 'YXZ';
    const cur = targetPose('idle', 0, false, 1);
    return { a, ac, cur, t0: (ac.offset || 0) };
  });
  const cam = new T.PerspectiveCamera(26, W / H, 0.05, 100);
  const vh = def.vh || 4.2, cy = def.cy || 1.65, span = Math.max(vh, (n - 1) * gap + 2.6) ;
  const d = (Math.max(vh, span * H / W) / 2) / Math.tan(cam.fov * Math.PI / 360);
  cam.position.set(0, cy + d * (def.pitch || 0.06), d); cam.lookAt(0, cy, 0);
  el.innerHTML = ''; el.appendChild(r.domElement);
  const h = { el, r, scene, cam, actors, t: 0 };
  el._anim = h; ANIMS.push(h);
  if (!animRaf) { animLast = performance.now(); animRaf = requestAnimationFrame(animLoop); }
  return h;
}
function poseAt(seq, t) { // seq: [[pose, seconds, period?], ...] looping
  const total = seq.reduce((s, x) => s + x[1], 0); let u = t % total;
  for (const x of seq) { if (u < x[1]) return { name: x[0], t: u, period: x[2] || 1.0, dur: x[1] }; u -= x[1]; }
  return { name: seq[0][0], t: 0, period: 1 };
}
function animLoop(now) {
  const dt = Math.min(0.05, (now - animLast) / 1000); animLast = now;
  for (let i = ANIMS.length - 1; i >= 0; i--) {
    const h = ANIMS[i];
    if (!h.el.isConnected) { try { h.r.dispose(); h.r.forceContextLoss(); } catch (e) {} ANIMS.splice(i, 1); continue; }
    h.t += dt;
    h.actors.forEach(o => {
      const p = poseAt(o.ac.seq, h.t + o.t0), tg = targetPose(p.name, p.t, !!o.ac.mirror, p.period, p.dur), c = o.cur, k = Math.min(1, dt * 9);
      [0, 1].forEach(j => { c.arms[j][0] += (tg.arms[j][0] - c.arms[j][0]) * k; c.arms[j][1] += (tg.arms[j][1] - c.arms[j][1]) * k; c.legs[j][0] += (tg.legs[j][0] - c.legs[j][0]) * k; c.legs[j][1] += (tg.legs[j][1] - c.legs[j][1]) * k; });
      [0, 1, 2].forEach(j => { c.head[j] += (tg.head[j] - c.head[j]) * k; });
      c.lean += (tg.lean - c.lean) * k; c.y += (tg.y - c.y) * k; c.x = (c.x || 0) + ((tg.x || 0) - (c.x || 0)) * Math.min(1, dt * 6);
      let ds = (tg.spin || 0) - (c.spin || 0); ds = ((ds + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; c.spin = (c.spin || 0) + ds * Math.min(1, dt * 10);
      const a = o.a;
      a.arms.forEach((arm, j) => arm.rotation.set(c.arms[j][0], 0, c.arms[j][1]));
      a.legs.forEach((leg, j) => leg.rotation.set(c.legs[j][0], 0, c.legs[j][1]));
      a.head.rotation.set(c.head[0], c.head[1], c.head[2]);
      a.rig.rotation.x = c.lean; a.rig.rotation.y = c.spin || 0; a.rig.position.y = c.y; a.rig.position.x = c.x || 0;
    });
    h.r.render(h.scene, h.cam);
  }
  animRaf = ANIMS.length ? requestAnimationFrame(animLoop) : 0;
}

/* ===== blog: live props (the cows: they shuffle their legs and can spin while beamed up) ===== */
function mountProp(el, name, opts) {
  opts = opts || {};
  const W = Math.max(40, el.clientWidth || 120), H = Math.max(40, el.clientHeight || 120);
  const r = new T.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setClearColor(0x000000, 0); r.setSize(W, H, false);
  r.domElement.style.width = '100%'; r.domElement.style.height = '100%'; r.domElement.style.display = 'block';
  const scene = new T.Scene(); lights(scene);
  const obj = buildProp(name); const yaw0 = -0.55; obj.rotation.y = yaw0; scene.add(obj); obj.updateMatrixWorld(true);
  const sphere = new T.Box3().setFromObject(obj).getBoundingSphere(new T.Sphere());
  const cam = new T.PerspectiveCamera(26, W / H, 0.05, 100);
  frameCamera(cam, sphere.center, sphere.radius * 1.0, 0, 0.32, W / H);
  const legs = []; obj.traverse(o => { if (o.userData.leg != null) legs.push(o); });
  el.innerHTML = ''; el.appendChild(r.domElement);
  const h = { spin: false, speed: 9, spinV: 0, angle: 0, t: (opts.offset || 0), last: performance.now(), raf: 0, obj: obj, legs: legs };
  const period = opts.period || 6.5, walkFor = 2.2;
  function frame(now) {
    if (!el.isConnected) { try { r.dispose(); r.forceContextLoss(); } catch (e) {} return; }
    const dt = Math.min(0.05, (now - h.last) / 1000); h.last = now; h.t += dt;
    // every few seconds: a couple of slow steps in place, eased in and out
    // ... but no walking while spinning: the legs settle and stay still
    const u = h.t % period, k = h.spin ? 0 : (u < walkFor ? Math.sin(Math.PI * u / walkFor) : 0);
    h.walk = (h.walk || 0) + (k - (h.walk || 0)) * Math.min(1, dt * 6);
    h.legs.forEach(l => { const ph = (l.userData.leg === 0 || l.userData.leg === 3) ? 0 : Math.PI; l.rotation.z = Math.sin(h.t * 7 + ph) * 0.38 * h.walk; });
    // spinning around its own axis, speeding up / slowing down smoothly
    h.spinV += ((h.spin ? h.speed : 0) - h.spinV) * Math.min(1, dt * 2.5);
    h.angle += h.spinV * dt; h.obj.rotation.y = yaw0 + h.angle;
    r.render(scene, cam);
    h.raf = requestAnimationFrame(frame);
  }
  h.raf = requestAnimationFrame(frame);
  return {
    setSpin: (on, speed) => { h.spin = !!on; if (speed) h.speed = speed; },
    // swap the model (the cow turning into a mooshroom), keeping the same camera
    setProp: next => {
      scene.remove(h.obj);
      const o = buildProp(next); o.rotation.y = yaw0 + h.angle; scene.add(o);
      h.obj = o; h.legs = []; o.traverse(x => { if (x.userData.leg != null) h.legs.push(x); });
    }
  };
}

window.QA3D = { ok: true, props: Object.keys(PROPS), mountAnim: mountAnim, mountProp: mountProp, snap: snap, mountLive: mountLive, pick: pick, live: LIVE, has: function (slot, id) { return slot === 'head' ? !!HEAD[id] : slot === 'face' ? !!FACE[id] : slot === 'weapon' ? !!WEAPON[id] : slot === 'relic' ? !!RELIC[id] : true; } };
})();


