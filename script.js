/* Simulasi Gerak Jatuh Bebas — fisika, animasi, grafik, validasi.
   Perjanjian arah: ke atas positif, a = −g. Hambatan udara diabaikan. */
'use strict';
const $ = i => document.getElementById(i);
const fmt = (n, d = 2) => { n = +n; if (Math.abs(n) < .5 * 10 ** -d) n = 0; return n.toFixed(d).replace('.', ',').replace('-', '−'); };
const pct = (a, b) => b ? Math.abs(a - b) / Math.abs(b) * 100 : (a ? 100 : 0);
const nice = v => { const p = 10 ** Math.floor(Math.log10(v)), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
const cv = $('cv'), cx = cv.getContext('2d'), gc = $('gr'), gx = gc.getContext('2d');

const S = { h0: 20, v0: 0, dir: -1, g: 9.8, t: 0, play: false, speed: 1, drag: false };
let T, N, AX = 25, SC = {}, last = 0, raf = 0;

/* ===== 1. FISIKA ===== */
function theory() {
  const vy0 = S.dir * S.v0, D = Math.sqrt(vy0 * vy0 + 2 * S.g * S.h0), tf = (vy0 + D) / S.g;
  return { vy0, D, tf, vyEnd: vy0 - S.g * tf, vEnd: D,
           hmax: S.h0 + (vy0 > 0 ? vy0 * vy0 / (2 * S.g) : 0), tp: vy0 > 0 ? vy0 / S.g : 0 };
}
const Y_ = t => t >= T.tf ? 0 : Math.max(0, S.h0 + T.vy0 * t - .5 * S.g * t * t);
const V_ = t => t > T.tf ? 0 : T.vy0 - S.g * t;

/* Simulasi numerik langkah demi langkah (Euler semi-implisit), tanpa rumus jadi */
function numeric(dt = .001) {
  if (T.tf <= 0) return { tf: 0, v: 0, hmax: S.h0 };
  let y = S.h0, v = T.vy0, t = 0, hm = y, n = 0;
  while (n++ < 2e7) {
    const vn = v - S.g * dt, yn = y + vn * dt;
    if (yn < 0) { const f = y / (y - yn); return { tf: t + dt * f, v: Math.abs(v - S.g * dt * f), hmax: hm }; }
    y = yn; v = vn; t += dt; hm = Math.max(hm, y);
  }
  return { tf: t, v: Math.abs(v), hmax: hm };
}

/* ===== 2. INPUT ===== */
function readParams() {
  const [h, v, g] = ['h0n', 'v0n', 'gn'].map(i => parseFloat($(i).value));
  if ([h, v, g].some(isNaN)) return 'Semua kolom harus berisi angka.';
  if (h < 0) return 'Tinggi awal tidak boleh negatif.';
  if (v < 0) return 'Kecepatan awal tidak boleh negatif. Pilih arah dengan tombol ↓ / ↑.';
  if (g <= 0) return 'Gravitasi harus lebih besar dari 0.';
  Object.assign(S, { h0: h, v0: v, g, dir: +document.querySelector('[name=dir]:checked').value });
  return '';
}
function change() {
  const e = readParams(); $('err').textContent = e;
  if (!e) { S.play = false; recalc(); }
}
function link(r, n) {
  $(r).oninput = () => { $(n).value = $(r).value; change(); };
  $(n).oninput = () => { $(r).value = $(n).value; change(); };
}
link('h0r', 'h0n'); link('v0r', 'v0n');
document.querySelectorAll('[name=dir]').forEach(e => e.onchange = change);
$('pl').onchange = () => { if ($('pl').value !== 'custom') $('gn').value = $('pl').value; change(); };
$('gn').oninput = () => { const m = [...$('pl').options].some(o => o.value === $('gn').value); $('pl').value = m ? $('gn').value : 'custom'; change(); };
const PRE = { free: [20, 0, -1], down: [30, 10, -1], up: [10, 15, 1] };
document.querySelectorAll('[data-pre]').forEach(b => b.onclick = () => {
  const [h, v, d] = PRE[b.dataset.pre];
  ['h0r', 'h0n'].forEach(i => $(i).value = h); ['v0r', 'v0n'].forEach(i => $(i).value = v);
  document.querySelector(`[name=dir][value="${d}"]`).checked = true; change();
});
document.querySelectorAll('[name=sp]').forEach(e => e.onchange = () => S.speed = +e.value);
['oV', 'oA', 'oT', 'oR'].forEach(i => $(i).onchange = refresh);

/* ===== 3. HITUNG ULANG & TAMPILKAN HASIL ===== */
function recalc() {
  T = theory(); N = numeric(); S.t = 0;
  if (!S.drag) AX = Math.max(T.hmax, S.h0, 5) * 1.12;
  $('tsl').max = T.tf || 1; $('tsl').disabled = T.tf <= 0;

  $('res').innerHTML = [
    ['Waktu jatuh', fmt(T.tf, 3) + ' s'], ['Laju saat mendarat', fmt(T.vEnd, 2) + ' m/s'],
    ['Tinggi maksimum', fmt(T.hmax, 2) + ' m'], ['Waktu ke puncak', T.tp > 0 ? fmt(T.tp, 3) + ' s' : '–'],
    ['Kecepatan awal v₀ᵧ', fmt(T.vy0, 2) + ' m/s'], ['Percepatan a', fmt(-S.g, 2) + ' m/s²']
  ].map(([l, v]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');

  let rows = '<tr><th>t (s)</th><th>y (m)</th><th>vᵧ (m/s)</th><th>laju |v| (m/s)</th></tr>';
  for (let i = 0; i <= (T.tf > 0 ? 10 : 0); i++) {
    const t = T.tf * i / 10; rows += `<tr><td>${fmt(t, 3)}</td><td>${fmt(Y_(t), 2)}</td><td>${fmt(V_(t), 2)}</td><td>${fmt(Math.abs(V_(t)), 2)}</td></tr>`;
  }
  $('tbl').innerHTML = rows;

  const { h0, g } = S, vy = T.vy0;
  $('manual').textContent =
`Ke atas positif, jadi v₀ᵧ = ${S.dir > 0 ? '+' : '−'}${fmt(S.v0, 2)} = ${fmt(vy, 3)} m/s

1) Waktu jatuh (y = 0):  t = (v₀ᵧ + √(v₀ᵧ² + 2·g·h₀)) / g
   √(${fmt(vy, 3)}² + 2×${fmt(g, 2)}×${fmt(h0, 2)}) = ${fmt(T.D, 3)}
   t = (${fmt(vy, 3)} + ${fmt(T.D, 3)}) / ${fmt(g, 2)} = ${fmt(T.tf, 3)} s

2) Kecepatan saat mendarat:  vᵧ = v₀ᵧ − g·t
   vᵧ = ${fmt(vy, 3)} − ${fmt(g, 2)}×${fmt(T.tf, 3)} = ${fmt(T.vyEnd, 3)} m/s

3) Cek dengan rumus lain:  v = √(v₀² + 2·g·h₀)
   v = √(${fmt(S.v0, 2)}² + 2×${fmt(g, 2)}×${fmt(h0, 2)}) = ${fmt(T.D, 3)} m/s

4) Tinggi maksimum:  ` + (vy > 0
  ? `h = h₀ + v₀ᵧ² / (2g) = ${fmt(h0, 2)} + ${fmt(vy, 3)}² / (2×${fmt(g, 2)}) = ${fmt(T.hmax, 3)} m`
  : `bola tidak naik (v₀ᵧ ≤ 0), jadi h_maks = h₀ = ${fmt(h0, 2)} m`);

  const ok = e => e < 1 ? '<span class="ok">sesuai</span>' : '<span class="bad">beda</span>';
  const row = (n, u, d, A, B) => `<tr><td>${n}</td><td>${fmt(A, d)} ${u}</td><td>${fmt(B, d)} ${u}</td><td>${fmt(pct(B, A), 3)} %</td><td>${ok(pct(B, A))}</td></tr>`;
  $('val').innerHTML = '<tr><th>Besaran</th><th>Rumus</th><th>Numerik (Δt = 0,001 s)</th><th>Galat</th><th>Status</th></tr>'
    + row('Waktu jatuh', 's', 3, T.tf, N.tf) + row('Laju mendarat', 'm/s', 3, T.vEnd, N.v) + row('Tinggi maksimum', 'm', 3, T.hmax, N.hmax);

  compare(); refresh();
}

function compare() {
  if (!T) return;
  const eT = parseFloat($('exT').value), eV = parseFloat($('exV').value);
  const eG = eT > 0 ? 2 * (S.h0 + T.vy0 * eT) / (eT * eT) : NaN;
  const cell = (v, ref, d) => isNaN(v) ? '–' : `${fmt(v, d)} (${fmt(pct(v, ref), 1)} %)`;
  $('cmp').innerHTML = '<tr><th>Besaran</th><th>Teori</th><th>Simulasi</th><th>Eksperimen (galat)</th></tr>'
    + `<tr><td>Waktu jatuh (s)</td><td>${fmt(T.tf, 3)}</td><td>${fmt(N.tf, 3)}</td><td>${cell(eT, T.tf, 3)}</td></tr>`
    + `<tr><td>Laju mendarat (m/s)</td><td>${fmt(T.vEnd, 2)}</td><td>${fmt(N.v, 2)}</td><td>${cell(eV, T.vEnd, 2)}</td></tr>`
    + `<tr><td>g hasil eksperimen (m/s²)</td><td>${fmt(S.g, 2)}</td><td>${fmt(S.g, 2)}</td><td>${cell(eG, S.g, 2)}</td></tr>`;
  const n = [];
  if (!isNaN(eT)) n.push(eT > T.tf ? 'Waktu eksperimen lebih besar dari teori. Hambatan udara dan waktu reaksi pengamat adalah penyebab yang umum.' : 'Waktu eksperimen lebih kecil atau sama dengan teori. Periksa kalibrasi skala, titik awal, dan jumlah frame video.');
  if (!isNaN(eV)) n.push(eV < T.vEnd ? 'Laju eksperimen lebih kecil dari teori, sesuai dugaan karena hambatan udara menahan bola.' : 'Laju eksperimen tidak lebih kecil dari teori. Periksa ketelitian pembacaan posisi pada Tracker.');
  $('cmpNote').textContent = n.join(' ');
}
['exT', 'exV'].forEach(i => $(i).oninput = compare);

/* ===== 4. GAMBAR PANGGUNG ===== */
function arrow(x, y1, y2, col, lab) {
  const dy = y2 - y1, d = Math.sign(dy); if (Math.abs(dy) < 3) return;
  cx.strokeStyle = cx.fillStyle = col; cx.lineWidth = 3;
  cx.beginPath(); cx.moveTo(x, y1); cx.lineTo(x, y2); cx.stroke();
  cx.beginPath(); cx.moveTo(x, y2); cx.lineTo(x - 6, y2 - d * 11); cx.lineTo(x + 6, y2 - d * 11); cx.fill();
  cx.font = 'bold 13px Trebuchet MS, sans-serif'; cx.textAlign = 'left'; cx.fillText(lab, x + 9, (y1 + y2) / 2 + 4);
}
function scene() {
  const dpr = devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const gy = H - 38, r = 12, s = (gy - 26) / AX, bx = W * .5, Y = y => gy - y * s;
  SC = { s, gy, bx, r };
  const sky = cx.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, '#8fcdf5'); sky.addColorStop(1, '#e4f4fd');
  cx.fillStyle = sky; cx.fillRect(0, 0, W, gy);
  cx.fillStyle = '#6aae5a'; cx.fillRect(0, gy, W, H - gy); cx.fillStyle = '#4c8a40'; cx.fillRect(0, gy, W, 5);

  if (S.h0 > 0) {                                   // menara
    const tw = 105, th = gy - Y(S.h0);
    cx.fillStyle = '#c9b78f'; cx.fillRect(bx - 120, Y(S.h0), tw, th);
    cx.strokeStyle = '#8c7c58'; cx.lineWidth = 2; cx.strokeRect(bx - 120, Y(S.h0), tw, th);
    cx.fillStyle = '#9c8a60'; cx.fillRect(bx - 120, Y(S.h0), tw, 6);
  }
  if ($('oR').checked) {                            // penggaris
    cx.strokeStyle = '#1c2b3a'; cx.fillStyle = '#1c2b3a'; cx.lineWidth = 1.5; cx.font = '11px Trebuchet MS, sans-serif'; cx.textAlign = 'right';
    cx.beginPath(); cx.moveTo(46, gy); cx.lineTo(46, 26); cx.stroke();
    const st = nice(AX / 6);
    for (let m = 0; m <= AX; m += st) { cx.beginPath(); cx.moveTo(46, Y(m)); cx.lineTo(54, Y(m)); cx.stroke(); cx.fillText(fmt(m, m % 1 ? 1 : 0), 40, Y(m) + 4); }
    cx.fillText('m', 40, 18);
  }
  const t = S.t, y = Y_(t), vy = V_(t), yc = Y(y) - r;
  cx.strokeStyle = 'rgba(28,43,58,.45)'; cx.lineWidth = 1; cx.setLineDash([4, 4]);
  cx.beginPath(); cx.moveTo(46, Y(y)); cx.lineTo(bx, Y(y)); cx.stroke(); cx.setLineDash([]);

  if ($('oT').checked && T.tf > 0) {                // jejak per selang waktu
    const di = [.1, .2, .5, 1, 2, 5, 10].reduce((a, b) => Math.abs(b - T.tf / 10) < Math.abs(a - T.tf / 10) ? b : a);
    cx.font = '11px Trebuchet MS, sans-serif'; cx.fillStyle = '#1c2b3a'; cx.textAlign = 'left';
    cx.fillText(`Jejak tiap ${fmt(di, 1)} s`, 64, 18);
    for (let n = 1; n * di <= Math.min(t, T.tf) + 1e-9; n++) {
      const gyy = Y(Y_(n * di)) - r;
      cx.fillStyle = 'rgba(214,69,43,.28)'; cx.beginPath(); cx.arc(bx, gyy, r, 0, 7); cx.fill();
      cx.fillStyle = '#1c2b3a'; cx.fillText(fmt(n * di, 1) + ' s', bx + r + 6, gyy + 4);
    }
  }
  cx.fillStyle = 'rgba(0,0,0,.18)'; const k = 1 - .5 * Math.min(y / AX, 1);   // bayangan
  cx.beginPath(); cx.ellipse(bx, gy + 2, r * 1.3 * k, 3 * k, 0, 0, 7); cx.fill();
  const bg = cx.createRadialGradient(bx - 4, yc - 4, 2, bx, yc, r);              // bola
  bg.addColorStop(0, '#ff9a80'); bg.addColorStop(1, '#c63a22'); cx.fillStyle = bg;
  cx.beginPath(); cx.arc(bx, yc, r, 0, 7); cx.fill();

  if ($('oV').checked) arrow(bx, yc, yc - Math.max(-150, Math.min(150, vy * 3)), '#1d6fb8', 'v');
  if ($('oA').checked) arrow(bx + 36, yc, yc + Math.min(130, S.g * 5), '#e8892b', 'a');
  $('hint').style.visibility = (S.t === 0 && !S.play) ? 'visible' : 'hidden';
}

function live() {
  const t = S.t;
  $('live').innerHTML = `<div>Waktu t<b>${fmt(t, 3)} s</b></div><div>Tinggi y<b>${fmt(Y_(t), 2)} m</b></div>`
    + `<div>Kecepatan vᵧ<b>${fmt(V_(t), 2)} m/s</b></div><div>Percepatan a<b>${fmt(-S.g, 2)} m/s²</b></div>`
    + (T.tf > 0 && t >= T.tf ? '<div class="done">Mendarat</div>' : '');
}

/* ===== 5. GRAFIK y–t, v–t, a–t ===== */
function graph() {
  if (!$('grafik').classList.contains('on')) return;
  const dpr = devicePixelRatio || 1, W = gc.clientWidth, H = gc.clientHeight;
  gc.width = W * dpr; gc.height = H * dpr; gx.setTransform(dpr, 0, 0, dpr, 0, 0); gx.clearRect(0, 0, W, H);
  gx.font = '11px Trebuchet MS, sans-serif';
  if (T.tf <= 0) { gx.fillStyle = '#5d7084'; gx.textAlign = 'center'; gx.fillText('Bola sudah di tanah (waktu jatuh = 0). Naikkan h₀ atau pilih lemparan ke atas.', W / 2, H / 2); return; }
  const vlo = Math.min(T.vyEnd, T.vy0, 0), vhi = Math.max(T.vy0, 0), vp = (vhi - vlo || 1) * .1;
  const defs = [
    { n: 'Tinggi y (m)', f: Y_, lo: 0, hi: Math.max(S.h0, T.hmax) * 1.1, c: '#1d6fb8' },
    { n: 'Kecepatan vᵧ (m/s)', f: V_, lo: vlo - vp, hi: vhi + vp, c: '#2f9e5b' },
    { n: 'Percepatan a (m/s²)', f: () => -S.g, lo: -S.g * 1.3, hi: S.g * .3, c: '#e8892b' }
  ];
  const cw = W / 3, py = 26, ph = H - 26 - 32;
  defs.forEach((d, i) => {
    const px = i * cw + 48, pw = cw - 48 - 14, X = tt => px + tt / T.tf * pw, Yg = v => py + ph - (v - d.lo) / (d.hi - d.lo) * ph;
    gx.fillStyle = '#1c2b3a'; gx.textAlign = 'left'; gx.font = 'bold 12px Trebuchet MS, sans-serif'; gx.fillText(d.n, px, 14); gx.font = '11px Trebuchet MS, sans-serif';
    gx.strokeStyle = '#e1e8ee'; gx.lineWidth = 1; gx.fillStyle = '#5d7084'; gx.textAlign = 'right';
    for (let k = 0; k <= 4; k++) { const v = d.lo + (d.hi - d.lo) * k / 4; gx.beginPath(); gx.moveTo(px, Yg(v)); gx.lineTo(px + pw, Yg(v)); gx.stroke(); gx.fillText(fmt(v, 1), px - 5, Yg(v) + 4); }
    gx.textAlign = 'center'; gx.fillText('0', px, H - 16); gx.fillText(fmt(T.tf, 2), px + pw, H - 16); gx.fillText('t (s)', px + pw / 2, H - 4);
    gx.strokeStyle = '#1c2b3a'; gx.strokeRect(px, py, pw, ph);
    const line = (tmax, dash, col, lw) => {
      gx.beginPath(); gx.setLineDash(dash); gx.strokeStyle = col; gx.lineWidth = lw;
      for (let j = 0; j <= 100; j++) { const tt = Math.min(T.tf * j / 100, tmax); j ? gx.lineTo(X(tt), Yg(d.f(tt))) : gx.moveTo(X(tt), Yg(d.f(tt))); if (tt >= tmax) break; }
      gx.stroke(); gx.setLineDash([]);
    };
    line(T.tf, [5, 4], '#9fb0bf', 1.5); line(S.t, [], d.c, 3);
    gx.fillStyle = '#d6452b'; gx.beginPath(); gx.arc(X(S.t), Yg(d.f(S.t)), 5, 0, 7); gx.fill();
  });
}

/* ===== 6. ANIMASI & KONTROL ===== */
function refresh() {
  scene(); live(); graph();
  $('tsl').value = S.t; $('play').textContent = S.play ? '⏸' : '▶';
}
function loop(ts) {
  if (!S.play) return;
  S.t = Math.min(S.t + Math.min((ts - last) / 1000, .05) * S.speed, T.tf); last = ts;
  if (S.t >= T.tf) S.play = false;
  refresh(); if (S.play) raf = requestAnimationFrame(loop);
}
function toggle() {
  if (T.tf <= 0) return;
  cancelAnimationFrame(raf);
  if (!S.play && S.t >= T.tf) S.t = 0;
  S.play = !S.play;
  if (S.play) { last = performance.now(); raf = requestAnimationFrame(loop); }
  refresh();
}
$('play').onclick = toggle;
$('reset').onclick = () => { cancelAnimationFrame(raf); S.play = false; S.t = 0; refresh(); };
$('step').onclick = () => { cancelAnimationFrame(raf); S.play = false; S.t = Math.min(S.t + .05, T.tf); refresh(); };
$('tsl').oninput = () => { cancelAnimationFrame(raf); S.play = false; S.t = +$('tsl').value; refresh(); };
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !/INPUT|SELECT|BUTTON|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); toggle(); }
});

/* Seret bola untuk mengubah h₀ (hanya saat t = 0) */
const pos = e => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
const onBall = p => S.t === 0 && !S.play && Math.hypot(p.x - SC.bx, p.y - (SC.gy - S.h0 * SC.s - SC.r)) < 26;
cv.onpointerdown = e => { if (onBall(pos(e))) { S.drag = true; cv.setPointerCapture(e.pointerId); } };
cv.onpointermove = e => {
  const p = pos(e);
  if (S.drag) {
    const h = Math.round(Math.min(Math.max((SC.gy - p.y - SC.r) / SC.s, 0), AX) * 2) / 2;
    ['h0r', 'h0n'].forEach(i => $(i).value = h); change();
  }
  cv.style.cursor = S.drag ? 'grabbing' : onBall(p) ? 'grab' : 'default';
};
cv.onpointerup = cv.onpointercancel = () => { if (S.drag) { S.drag = false; recalc(); } };

document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab,.pane').forEach(x => x.classList.remove('on'));
  b.classList.add('on'); $(b.dataset.tab).classList.add('on'); refresh();
});
window.addEventListener('resize', refresh);
change();
