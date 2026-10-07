// Genera docs/estado-rf.html a partir de docs/estado-rf.json.
// Uso: node scripts/generar-estado.mjs
// El HTML es el contenido del artefacto "Avance del PRD": la plataforma le agrega el esqueleto al publicarlo.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const datos = JSON.parse(readFileSync(join(raiz, 'docs', 'estado-rf.json'), 'utf8'));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const promedio = (lista) => (lista.length ? lista.reduce((s, r) => s + r.pct, 0) / lista.length : 0);
const estado = (pct) => (pct >= 100 ? 'hecho' : pct > 0 ? 'parcial' : 'pendiente');

const rfs = datos.rf;
const total = Math.round(promedio(rfs));
const criticos = rfs.filter((r) => r.critico);
const cuenta = { hecho: 0, parcial: 0, pendiente: 0 };
for (const r of rfs) cuenta[estado(r.pct)]++;

// Mantiene el orden de aparición de los grupos en el PRD.
const grupos = [];
for (const r of rfs) {
  let g = grupos.find((x) => x.nombre === r.grupo);
  if (!g) grupos.push((g = { nombre: r.grupo, items: [] }));
  g.items.push(r);
}

const fila = (r) => `
        <li class="rf ${estado(r.pct)}" data-estado="${estado(r.pct)}" data-critico="${r.critico ? 1 : 0}">
          <span class="rf-id">${esc(r.id)}</span>
          <span class="rf-titulo">${esc(r.titulo)}${r.critico ? ' <span class="critico">@CRITICO</span>' : ''}</span>
          <span class="rf-barra" role="img" aria-label="${r.pct} por ciento"><i style="width:${r.pct}%"></i></span>
          <span class="rf-pct">${r.pct}%</span>
        </li>`;

const seccion = (g) => {
  const hechos = g.items.filter((r) => r.pct >= 100).length;
  return `
    <section class="grupo" data-grupo>
      <header class="grupo-cab">
        <h2>${esc(g.nombre)}</h2>
        <p class="grupo-dato"><strong>${Math.round(promedio(g.items))}%</strong> · ${hechos} de ${g.items.length} completos</p>
      </header>
      <ul class="lista">${g.items.map(fila).join('')}
      </ul>
    </section>`;
};

const html = `<title>Avance del PRD</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
  /* Tablero de lectura rápida: resumen arriba, un grupo por funcionalidad, una fila por RF. */
  :root {
    --bg: #f4f5f3;
    --surface: #ffffff;
    --fg: #1c2321;
    --muted: #5d6764;
    --line: #dde1de;
    --track: #e6e9e6;
    --hecho: #1f7a4d;
    --parcial: #b7791f;
    --pendiente: #8a9490;
    --critico: #b3261e;
    --font-body: 'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-mono: 'IBM Plex Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #141918; --surface: #1c2220; --fg: #e8ece9; --muted: #98a39f; --line: #2c3532; --track: #2a322f;
      --hecho: #4cc38a; --parcial: #e3a94a; --pendiente: #6f7a76; --critico: #ff7b72;
      color-scheme: dark;
    }
  }
  :root[data-theme="dark"] {
    --bg: #141918; --surface: #1c2220; --fg: #e8ece9; --muted: #98a39f; --line: #2c3532; --track: #2a322f;
    --hecho: #4cc38a; --parcial: #e3a94a; --pendiente: #6f7a76; --critico: #ff7b72;
    color-scheme: dark;
  }
  body { background: var(--bg); color: var(--fg); font-family: var(--font-body); font-size: 15px; line-height: 1.45; padding-inline: 16px; padding-block: 28px 56px; }
  .pagina { max-width: 860px; margin-inline: auto; display: flex; flex-direction: column; gap: 28px; }
  h1, h2, p { margin: 0; }

  .resumen { display: grid; grid-template-columns: auto 1fr; gap: 8px 28px; align-items: end; }
  .resumen h1 { grid-column: 1 / -1; font-size: 15px; font-weight: 500; color: var(--muted); letter-spacing: .02em; }
  .total { font-size: clamp(56px, 14vw, 88px); font-weight: 600; line-height: 1; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
  .total small { font-size: .4em; font-weight: 500; color: var(--muted); margin-left: 2px; }
  .datos { min-width: 0; display: flex; flex-direction: column; gap: 10px; padding-bottom: 6px; }
  .reparto { display: flex; height: 10px; border-radius: 3px; overflow: hidden; background: var(--track); }
  .reparto i { display: block; height: 100%; }
  .reparto .hecho { background: var(--hecho); }
  .reparto .parcial { background: var(--parcial); }
  .conteo { display: flex; flex-wrap: wrap; gap: 4px 18px; font-size: 13px; color: var(--muted); }
  .conteo b { color: var(--fg); font-weight: 600; font-variant-numeric: tabular-nums; }
  .conteo span::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; background: var(--pendiente); }
  .conteo .hecho::before { background: var(--hecho); }
  .conteo .parcial::before { background: var(--parcial); }
  .criticos { font-size: 13px; color: var(--muted); }
  .criticos strong { color: var(--critico); font-weight: 600; }
  .meta { font-size: 12px; color: var(--muted); font-family: var(--font-mono); }

  .filtros { display: flex; flex-wrap: wrap; gap: 8px; }
  .filtros button { font: inherit; font-size: 13px; padding: 5px 12px; border: 1px solid var(--line); background: var(--surface); color: var(--fg); border-radius: 6px; cursor: pointer; }
  .filtros button[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
  .filtros button:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }

  .grupo { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
  .grupo-cab { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 4px 16px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
  .grupo-cab h2 { font-size: 16px; font-weight: 600; min-width: 0; }
  .grupo-dato { font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; }
  .grupo-dato strong { color: var(--fg); }
  .lista { list-style: none; margin: 0; padding: 0; }
  .rf { display: grid; grid-template-columns: 64px minmax(0, 1fr) 120px 44px; align-items: center; gap: 4px 14px; padding: 9px 16px; }
  .rf + .rf { border-top: 1px solid var(--line); }
  .rf[hidden] { display: none; }
  .rf-id { font-family: var(--font-mono); font-size: 12.5px; color: var(--muted); }
  .rf-titulo { min-width: 0; }
  .critico { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--critico); border: 1px solid currentColor; border-radius: 3px; padding: 0 5px; margin-left: 6px; white-space: nowrap; }
  .rf-barra { display: block; height: 8px; border-radius: 3px; background: var(--track); overflow: hidden; }
  .rf-barra i { display: block; height: 100%; border-radius: 3px; background: var(--pendiente); }
  .rf.hecho .rf-barra i { background: var(--hecho); }
  .rf.parcial .rf-barra i { background: var(--parcial); }
  .rf-pct { text-align: right; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .rf.pendiente .rf-pct { color: var(--muted); font-weight: 400; }

  .escala { font-size: 12.5px; color: var(--muted); max-width: 65ch; }

  @media (max-width: 560px) {
    .resumen { grid-template-columns: 1fr; }
    .rf { grid-template-columns: 56px minmax(0, 1fr) 40px; }
    .rf-barra { grid-column: 2 / 3; grid-row: 2; }
    .rf-pct { grid-row: 1; grid-column: 3; }
    .rf-id { grid-row: 1; }
  }
</style>

<main class="pagina">
  <header class="resumen">
    <h1>${esc(datos.proyecto)} · avance de los requerimientos funcionales</h1>
    <p class="total">${total}<small>%</small></p>
    <div class="datos">
      <div class="reparto" role="img" aria-label="${cuenta.hecho} completos, ${cuenta.parcial} parciales, ${cuenta.pendiente} sin empezar">
        <i class="hecho" style="width:${(cuenta.hecho / rfs.length) * 100}%"></i><i class="parcial" style="width:${(cuenta.parcial / rfs.length) * 100}%"></i>
      </div>
      <p class="conteo">
        <span class="hecho"><b>${cuenta.hecho}</b> completos</span>
        <span class="parcial"><b>${cuenta.parcial}</b> parciales</span>
        <span><b>${cuenta.pendiente}</b> sin empezar</span>
        <span style="--x:0"><b>${rfs.length}</b> en total</span>
      </p>
      <p class="criticos"><strong>@CRITICO</strong> · ${Math.round(promedio(criticos))}% en promedio (${criticos.filter((r) => r.pct >= 100).length} de ${criticos.length} completos)</p>
      <p class="meta">actualizado ${esc(datos.actualizado)} · commit ${esc(datos.commit)}</p>
    </div>
  </header>

  <div class="filtros" role="group" aria-label="Filtrar requerimientos">
    <button type="button" id="f-todos" aria-pressed="true" data-filtro="todos">Todos</button>
    <button type="button" id="f-criticos" aria-pressed="false" data-filtro="criticos">Solo @CRITICO</button>
    <button type="button" id="f-pendientes" aria-pressed="false" data-filtro="pendientes">Sin completar</button>
  </div>
${grupos.map(seccion).join('')}

  <p class="escala">${esc(datos.escala)}</p>
</main>

<script>
  (function () {
    var botones = document.querySelectorAll('[data-filtro]');
    function aplicar(filtro) {
      document.querySelectorAll('.rf').forEach(function (el) {
        var ver = filtro === 'todos' || (filtro === 'criticos' && el.dataset.critico === '1') || (filtro === 'pendientes' && el.dataset.estado !== 'hecho');
        el.hidden = !ver;
      });
      document.querySelectorAll('[data-grupo]').forEach(function (g) {
        g.hidden = !g.querySelector('.rf:not([hidden])');
      });
      botones.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro)); });
    }
    botones.forEach(function (b) { b.addEventListener('click', function () { aplicar(b.dataset.filtro); }); });
  })();
</script>
`;

writeFileSync(join(raiz, 'docs', 'estado-rf.html'), html);
console.log(`docs/estado-rf.html generado: ${rfs.length} RF, ${total}% de avance, ${cuenta.hecho} completos.`);
