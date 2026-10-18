// Labo data : graphiques en SVG fait main.
// Script classique : expose la globale LaboCharts, utilisée par app.js.
// Chaque visuel est redessiné à la largeur réelle de son conteneur (1 unité SVG = 1 px),
// ce qui garde un texte lisible sur mobile. Les couleurs viennent des classes de css/lab.css,
// donc des tokens : le thème sombre s'applique sans recalcul.

const LaboCharts = (() => {
  let uid = 0;

  // ---------- Outils ----------

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function num(value, decimals = 0) {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  // Unité précédée d'une espace fine insécable, à la française
  function fmt(value, options = {}) {
    const unit = options.unite ? ` ${options.unite}` : '';
    return `${num(value, options.decimales ?? 0)}${unit}`;
  }

  const stats = {
    moyenne: values => values.reduce((s, v) => s + v, 0) / values.length,
    mediane: values => {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },
    pearson: (xs, ys) => {
      const mx = stats.moyenne(xs), my = stats.moyenne(ys);
      let sxy = 0, sxx = 0, syy = 0;
      xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
      return sxy / Math.sqrt(sxx * syy);
    },
  };

  const STAT_LABELS = { moyenne: 'Moyenne', mediane: 'Médiane' };

  // Graduations rondes : 1, 2 ou 5 fois une puissance de 10
  function ticks(min, max, count) {
    const span = max - min || 1;
    const raw = span / Math.max(count, 1);
    const pow = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map(m => m * pow).find(s => s >= raw);
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const list = [];
    for (let v = start; v <= end + step / 2; v += step) list.push(+v.toFixed(10));
    return list;
  }

  // Mesure du texte avec la police réellement chargée
  const canvas = document.createElement('canvas').getContext('2d');
  let font = { size: 13, family: 'sans-serif' };
  function measure(text, weight = 400) {
    canvas.font = `${weight} ${font.size}px ${font.family}`;
    return canvas.measureText(String(text)).width;
  }

  function frame(w, h, spec, body, extra = '') {
    const id = `viz-${++uid}`;
    return `<svg class="viz" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="${id}-t" aria-describedby="${id}-d">
      <title id="${id}-t">${esc(spec.titre || '')}</title>
      <desc id="${id}-d">${esc(spec.alt || '')}</desc>
      ${extra}${body}
    </svg>`;
  }

  const text = (x, y, content, cls = '', anchor = 'start', baseline = 'middle') =>
    `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}" dominant-baseline="${baseline}">${esc(content)}</text>`;

  const line = (x1, y1, x2, y2, cls) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;

  function legend(groups, x, y, w) {
    // Pastille carrée et libellé en encre : l'identité ne repose jamais sur la couleur du texte
    let cx = x, cy = y;
    const parts = groups.map((g, i) => {
      const itemW = 12 + 6 + measure(g.libelle) + 16;
      if (cx + itemW > x + w && cx > x) { cx = x; cy += 20; }
      const out = `<rect x="${cx}" y="${cy - 6}" width="12" height="12" class="viz__mark viz__mark--s${g.serie ?? i + 1}"/>${text(cx + 18, cy, g.libelle, 'viz__label')}`;
      cx += itemW;
      return out;
    });
    return { svg: parts.join(''), height: cy - y + 20 };
  }

  // ---------- Barres horizontales ----------
  // donnees : { unite, decimales, items: [{ label, valeur, accent }] }

  function barres(spec, data, w) {
    const o = { ...data, ...spec };
    const items = data.items;
    const hasAccent = items.some(i => i.accent);
    const labelW = Math.min(Math.max(...items.map(i => measure(i.label))) + 12, w * 0.42);
    const valueW = Math.max(...items.map(i => measure(fmt(i.valeur, o)))) + 12;
    const barH = 20, gap = 12, top = 4, axisH = 28;
    const plotX = labelW, plotW = Math.max(w - labelW - valueW, 40);
    const min = o.axeMin ?? 0;
    const tickList = ticks(min, o.max ?? Math.max(...items.map(i => i.valeur)), plotW < 260 ? 3 : 5);
    const max = tickList[tickList.length - 1];
    const sx = v => plotX + ((v - min) / (max - min)) * plotW;
    const h = top + items.length * (barH + gap) + axisH;
    const baseY = h - axisH + gap / 2;

    const grid = tickList.map(t => line(sx(t), top, sx(t), baseY, 'viz__grid') + text(sx(t), baseY + 14, fmt(t, { ...o, decimales: o.decimalesAxe ?? 0 }), 'viz__tick', 'middle')).join('');
    const bars = items.map((item, i) => {
      const y = top + i * (barH + gap);
      const bw = Math.max(sx(item.valeur) - sx(min), 0);
      const cls = hasAccent && !item.accent ? 'viz__mark viz__mark--muted' : 'viz__mark';
      return `<g class="viz__item"><title>${esc(item.label)} : ${esc(fmt(item.valeur, o))}</title>
        <rect x="${plotX}" y="${y}" width="${bw}" height="${barH}" class="${cls}"/>
        ${text(plotX - 8, y + barH / 2, item.label, item.accent ? 'viz__label viz__label--strong' : 'viz__label', 'end')}
        ${text(plotX + bw + 6, y + barH / 2, fmt(item.valeur, o), 'viz__value')}</g>`;
    }).join('');
    return frame(w, h, spec, grid + line(plotX, top, plotX, baseY, 'viz__axis') + bars);
  }

  // ---------- Colonnes ----------
  // donnees : { unite, items: [{ label, valeur, accent }] }. Option axeMin pour un axe tronqué.

  function colonnes(spec, data, w) {
    const o = { ...data, ...spec };
    const items = data.items;
    const hasAccent = items.some(i => i.accent);
    const min = o.axeMin ?? 0;
    const tickList = ticks(min, o.max ?? Math.max(...items.map(i => i.valeur)), 4).filter(t => t >= min);
    const max = tickList[tickList.length - 1];
    const axisW = Math.max(...tickList.map(t => measure(fmt(t, { ...o, decimales: o.decimalesAxe ?? 0 })))) + 8;
    const top = 20, axisH = 24;
    const h = Math.round(Math.min(Math.max(w * 0.62, 240), 400));
    const plotX = axisW, plotW = w - axisW, plotH = h - top - axisH;
    const sy = v => top + plotH - ((v - min) / (max - min)) * plotH;
    const slot = plotW / items.length;
    const barW = Math.min(slot - 2, 24 + slot * 0.3);
    // Une étiquette sur deux, trois… si la place manque
    // Toutes les étiquettes si elles tiennent, sinon seulement la première et la dernière
    const fits = Math.max(...items.map(i => measure(i.label))) <= slot - 4;
    const axisLabel = (item, i, x) => {
      if (fits) return text(x, h - axisH + 14, item.label, 'viz__tick', 'middle');
      if (i === 0) return text(plotX, h - axisH + 14, item.label, 'viz__tick', 'start');
      if (i === items.length - 1) return text(w, h - axisH + 14, item.label, 'viz__tick', 'end');
      return '';
    };
    const tickFmt = { ...o, decimales: o.decimalesAxe ?? 0 };

    const grid = tickList.map(t => line(plotX, sy(t), w, sy(t), 'viz__grid') + text(plotX - 8, sy(t), fmt(t, tickFmt), 'viz__tick', 'end')).join('');
    const bars = items.map((item, i) => {
      const x = plotX + i * slot + (slot - barW) / 2;
      const y = sy(Math.max(item.valeur, min));
      const cls = hasAccent && !item.accent ? 'viz__mark viz__mark--muted' : 'viz__mark';
      const showValue = o.valeurs === 'toutes' || item.accent;
      return `<g class="viz__item"><title>${esc(item.label)} : ${esc(fmt(item.valeur, o))}</title>
        <rect x="${x}" y="${y}" width="${barW}" height="${sy(min) - y}" class="${cls}"/>
        ${showValue ? text(x + barW / 2, y - 8, fmt(item.valeur, o), 'viz__value', 'middle') : ''}
        ${axisLabel(item, i, x + barW / 2)}</g>`;
    }).join('');
    return frame(w, h, spec, grid + line(plotX, sy(min), w, sy(min), 'viz__axis') + bars);
  }

  // ---------- Courbe ----------
  // donnees : { unite, points: [{ x: 'libellé', y }] }. Options : plage [début, fin] (index), axeMin.

  function courbe(spec, data, w) {
    const o = { ...data, ...spec };
    const all = data.points;
    const [from, to] = o.plage || [0, all.length - 1];
    const points = all.slice(from, to + 1);
    const ys = points.map(p => p.y);
    const tickList = ticks(o.axeMin ?? Math.min(0, ...ys), Math.max(...ys), 4);
    const min = tickList[0], max = tickList[tickList.length - 1];
    const axisW = Math.max(...tickList.map(t => measure(fmt(t, o)))) + 8;
    const endW = measure(fmt(points[points.length - 1].y, o)) + 12;
    const top = 16, axisH = 24;
    const h = Math.round(Math.min(Math.max(w * 0.6, 240), 400));
    const plotX = axisW, plotW = w - axisW - endW, plotH = h - top - axisH;
    const sx = i => plotX + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
    const sy = v => top + plotH - ((v - min) / (max - min)) * plotH;
    const every = Math.ceil(points.length / Math.max(Math.floor(plotW / 56), 2));

    const grid = tickList.map(t => line(plotX, sy(t), plotX + plotW, sy(t), 'viz__grid') + text(plotX - 8, sy(t), fmt(t, o), 'viz__tick', 'end')).join('');
    const labels = points.map((p, i) => (i % every === 0 || i === points.length - 1) ? text(sx(i), h - axisH + 14, p.x, 'viz__tick', 'middle') : '').join('');
    const path = points.map((p, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');
    const hits = points.map((p, i) => `<g class="viz__item"><title>${esc(p.x)} : ${esc(fmt(p.y, o))}</title><circle cx="${sx(i)}" cy="${sy(p.y)}" r="12" class="viz__hit"/></g>`).join('');
    const last = points[points.length - 1];
    const end = `<circle cx="${sx(points.length - 1)}" cy="${sy(last.y)}" r="4" class="viz__mark viz__dot"/>${text(sx(points.length - 1) + 8, sy(last.y), fmt(last.y, o), 'viz__value')}`;
    return frame(w, h, spec, grid + labels + `<path d="${path}" class="viz__line"/>` + end + hits);
  }

  // ---------- Histogramme en points : un point par individu ----------
  // donnees : { unite, valeurs: [...] }. Options : pas (largeur d'une classe), marqueurs ['mediane', 'moyenne'].

  function points(spec, data, w) {
    const o = { ...data, ...spec };
    const values = data.valeurs;
    const step = o.pas;
    const start = Math.floor(Math.min(...values) / step) * step;
    const end = Math.ceil((Math.max(...values) + 1) / step) * step;
    const bins = Math.round((end - start) / step);
    const counts = new Array(bins).fill(0);
    const placed = [...values].sort((a, b) => a - b).map(v => {
      const bin = Math.min(Math.floor((v - start) / step), bins - 1);
      return { v, bin, k: counts[bin]++ };
    });
    const colW = w / bins;
    const r = Math.max(Math.min(colW / 2 - 1, 7), 2.5);
    const maxCount = Math.max(...counts);
    const markers = (o.marqueurs || []).map(key => ({ key, value: stats[key](values) })).sort((a, b) => a.value - b.value);
    const labelRows = markers.length ? 2 : 0;
    const top = 8 + labelRows * 20;
    const stackH = maxCount * (2 * r + 2);
    const h = Math.round(top + Math.max(stackH, 96) + 8 + 28);
    const baseY = h - 28;
    const sx = v => ((v - start) / (end - start)) * w;

    const tickList = ticks(start, end, w < 400 ? 3 : 5).filter(t => t >= start && t <= end);
    const axis = line(0, baseY, w, baseY, 'viz__axis') + tickList.map(t => {
      const anchor = sx(t) < 24 ? 'start' : sx(t) > w - 24 ? 'end' : 'middle';
      return line(sx(t), baseY, sx(t), baseY + 4, 'viz__axis') + text(sx(t), baseY + 16, fmt(t, o), 'viz__tick', anchor);
    }).join('');

    const dots = placed.map(p => `<g class="viz__item"><title>${esc(fmt(p.v, o))}</title>
      <circle cx="${(p.bin + 0.5) * colW}" cy="${baseY - r - 2 - p.k * (2 * r + 2)}" r="${r}" class="viz__mark viz__mark--ink viz__dot"/></g>`).join('');

    // Libellés de part et d'autre de leur trait : le premier à gauche, le suivant à droite
    const refs = markers.map((m, i) => {
      const x = sx(m.value);
      const label = `${STAT_LABELS[m.key]} ${fmt(m.value, o)}`;
      const lw = measure(label, 500);
      let anchor = i === 0 && markers.length > 1 ? 'end' : 'start';
      if (anchor === 'end' && x - lw - 6 < 0) anchor = 'start';
      if (anchor === 'start' && x + lw + 6 > w) anchor = 'end';
      const tx = anchor === 'end' ? x - 6 : x + 6;
      const y = 8 + (i % 2) * 20 + 6;
      const cls = m.key === 'mediane' ? 'viz__ref viz__ref--accent' : 'viz__ref';
      return line(x, y - 8, x, baseY, cls) + text(tx, y, label, 'viz__label viz__label--strong', anchor);
    }).join('');

    return frame(w, h, spec, axis + dots + refs);
  }

  // ---------- Grand chiffre ----------
  // Un indicateur seul, calculé sur les données : { stat: 'moyenne', libelle, sousTitre }

  function chiffre(spec, data, w) {
    const o = { ...data, ...spec };
    const value = stats[o.stat](data.valeurs);
    const size = Math.round(Math.min(Math.max(w / 5, 48), 112));
    const h = Math.round(24 + 20 + size * 1.1 + (o.sousTitre ? 36 : 12));
    const body = text(0, 20, o.libelle || STAT_LABELS[o.stat], 'viz__eyebrow', 'start') +
      `<text x="0" y="${24 + 12 + size}" class="viz__hero" font-size="${size}">${esc(fmt(value, o))}</text>` +
      (o.sousTitre ? text(0, h - 14, o.sousTitre, 'viz__label') : '');
    return frame(w, h, spec, body);
  }

  // ---------- Nuage de points ----------
  // donnees : { x: { libelle, unite }, y: { libelle, unite }, groupes: [{ id, libelle, serie }], points: [{ label, x, y, groupe }] }
  // Options : tendance (droite des moindres carrés), coefficient (affiche r).

  function nuage(spec, data, w) {
    const o = { ...data, ...spec };
    const pts = data.points;
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const xt = ticks(Math.min(0, ...xs), Math.max(...xs), w < 400 ? 3 : 5);
    const yt = ticks(Math.min(0, ...ys), Math.max(...ys), 4);
    const leg = data.groupes ? legend(data.groupes, 0, 10, w) : { svg: '', height: 0 };
    const axisW = Math.max(...yt.map(t => measure(num(t)))) + 8;
    const top = leg.height + 28, bottom = 44;
    const h = Math.round(Math.min(Math.max(w * 0.8, 300), 460));
    const plotX = axisW, plotW = w - axisW - 8, plotH = h - top - bottom;
    const sx = v => plotX + ((v - xt[0]) / (xt[xt.length - 1] - xt[0])) * plotW;
    const sy = v => top + plotH - ((v - yt[0]) / (yt[yt.length - 1] - yt[0])) * plotH;
    const groupIndex = id => data.groupes ? data.groupes.findIndex(g => g.id === id) : 0;

    const grid = yt.map(t => line(plotX, sy(t), plotX + plotW, sy(t), 'viz__grid') + text(plotX - 8, sy(t), num(t), 'viz__tick', 'end')).join('') +
      xt.map(t => text(sx(t), top + plotH + 14, num(t), 'viz__tick', 'middle')).join('');
    const axes = line(plotX, top + plotH, plotX + plotW, top + plotH, 'viz__axis') +
      text(plotX + plotW, h - 8, data.x.libelle, 'viz__label', 'end') +
      text(plotX, top - 12, data.y.libelle, 'viz__label', 'start');

    let trend = '';
    if (o.tendance) {
      const mx = stats.moyenne(xs), my = stats.moyenne(ys);
      const slope = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      trend = line(sx(x0), sy(my + slope * (x0 - mx)), sx(x1), sy(my + slope * (x1 - mx)), 'viz__trend');
    }
    let coef = '';
    if (o.coefficient) coef = text(plotX + 8, top + 8, `r = ${num(stats.pearson(xs, ys), 2)}`, 'viz__label viz__label--strong');

    const dots = pts.map(p => {
      const g = data.groupes?.[groupIndex(p.groupe)];
      const serie = g ? (g.serie ?? groupIndex(p.groupe) + 1) : 1;
      return `<g class="viz__item"><title>${esc(p.label)} : ${esc(num(p.x))} ${esc(data.x.court || '')}, ${esc(num(p.y))} ${esc(data.y.court || '')}</title>
        <circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="5" class="viz__mark viz__mark--s${serie} viz__dot"/>
        <circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="12" class="viz__hit"/></g>`;
    }).join('');
    return frame(w, h, spec, leg.svg + grid + axes + trend + coef + dots);
  }

  // ---------- Schéma de causalité : une cause commune, deux effets ----------
  // { cause, effets: [a, b], lien }

  function causal(spec, data, w) {
    const boxH = 40, h = 240;
    const id = `fleche-${++uid}`;
    const boxW = Math.min(Math.max(...[spec.cause, ...spec.effets].map(t => measure(t, 500))) + 32, (w - 24) / 2);
    const cx = w / 2, cy = 20;
    const lx = 0, rx = w - boxW, by = h - boxH - 36;
    const box = (x, y, label, cls = '') => `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" class="viz__box ${cls}"/>${text(x + boxW / 2, y + boxH / 2, label, 'viz__label viz__label--strong', 'middle')}`;
    const defs = `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="viz__arrowhead"/></marker></defs>`;
    const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="viz__arrow" marker-end="url(#${id})"/>`;
    const body = box(cx - boxW / 2, cy, spec.cause, 'viz__box--cause') +
      box(lx, by, spec.effets[0]) + box(rx, by, spec.effets[1]) +
      arrow(cx - boxW / 4, cy + boxH, lx + boxW / 2, by - 2) +
      arrow(cx + boxW / 4, cy + boxH, rx + boxW / 2, by - 2) +
      line(lx + boxW, by + boxH / 2, rx, by + boxH / 2, 'viz__link') +
      text(w / 2, by + boxH + 22, spec.lien || '', 'viz__label', 'middle');
    return frame(w, h, spec, body, defs);
  }

  // ---------- Tableur (HTML) ----------
  // donnees : { colonnes: [...], lignes: [[...], ...] }
  // Options : cellule, formule, formuleEn, filtre { colonne, egal } (résultat calculé) ou resultat (lignes données).

  const letters = n => String.fromCharCode(65 + n);

  function sheet(caption, headers, rows, firstCol, cls = () => '') {
    const head = `<tr><th class="sheet__corner" scope="col"><span class="sr-only">Ligne</span></th>${headers.map((_, i) => `<th scope="col" class="sheet__col">${letters(firstCol + i)}</th>`).join('')}</tr>`;
    const body = rows.map((row, r) => `<tr><th scope="row" class="sheet__row">${r + 1}</th>${row.map((cell, c) =>
      `<td class="sheet__cell ${cls(r, c)}">${esc(cell)}</td>`).join('')}</tr>`).join('');
    return `<div class="sheet"><p class="eyebrow sheet__caption">${esc(caption)}</p><div class="table-scroll"><table class="sheet__table"><thead>${head}</thead><tbody>${body}</tbody></table></div></div>`;
  }

  function tableur(spec, data) {
    let result = spec.resultat;
    if (!result && spec.filtre) {
      const col = data.colonnes.indexOf(spec.filtre.colonne);
      result = data.lignes.filter(l => l[col] === spec.filtre.egal);
    }
    const firstCol = spec.cellule.charCodeAt(0) - 65;
    const source = sheet(`Données, A1:${letters(data.colonnes.length - 1)}${data.lignes.length + 1}`, data.colonnes, [data.colonnes, ...data.lignes], 0,
      r => r === 0 ? 'sheet__cell--head' : '');
    const out = sheet(`Résultat, la formule est en ${spec.cellule}`, data.colonnes, [data.colonnes, ...result], firstCol,
      (r, c) => r === 0 ? 'sheet__cell--head' : r === 1 && c === 0 ? 'sheet__cell--formula' : 'sheet__cell--spill');
    return `<div class="sheet-view">
      <p class="sheet__bar"><span class="sheet__ref">${esc(spec.cellule)}</span><code class="sheet__formula">${esc(spec.formule)}</code></p>
      ${spec.formuleEn ? `<p class="hint">Version anglaise : <code>${esc(spec.formuleEn)}</code></p>` : ''}
      <div class="sheet-view__grid">${source}${out}</div>
    </div>`;
  }

  // ---------- Pictogrammes du sélecteur (96 × 64) ----------

  const PICTOS = {
    'barres-h': () => [[0, 46], [8, 70], [16, 30], [24, 58]].map(([y, bw]) => `<rect x="12" y="${y + 10}" width="${bw}" height="6" class="viz__mark"/>`).join('') + line(12, 6, 12, 58, 'viz__axis'),
    colonnes: () => [[18, 26], [34, 44], [50, 16], [66, 34]].map(([x, bh]) => `<rect x="${x}" y="${56 - bh}" width="10" height="${bh}" class="viz__mark"/>`).join('') + line(10, 56, 86, 56, 'viz__axis'),
    courbe: () => `<path d="M10,48 L28,40 L42,44 L58,26 L72,30 L86,12" class="viz__line"/>` + line(10, 56, 86, 56, 'viz__axis'),
    empilees: () => [12, 30, 48].map(y => `<rect x="10" y="${y}" width="34" height="10" class="viz__mark"/><rect x="46" y="${y}" width="24" height="10" class="viz__mark viz__mark--muted"/><rect x="72" y="${y}" width="14" height="10" class="viz__mark viz__mark--ink"/>`).join(''),
    anneau: () => `<circle cx="48" cy="32" r="20" class="viz__ring viz__ring--muted"/><circle cx="48" cy="32" r="20" class="viz__ring" pathLength="100" stroke-dasharray="62 38" transform="rotate(-90 48 32)"/>`,
    nuage: () => [[18, 46], [26, 40], [34, 42], [42, 32], [50, 34], [58, 24], [66, 26], [76, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" class="viz__mark"/>`).join('') + line(10, 56, 86, 56, 'viz__axis') + line(10, 6, 10, 56, 'viz__axis'),
    bulles: () => [[24, 40, 5], [44, 28, 9], [68, 20, 6], [62, 44, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" class="viz__mark"/>`).join('') + line(10, 56, 86, 56, 'viz__axis'),
    histogramme: () => [6, 14, 26, 36, 28, 16, 8, 4].map((bh, i) => `<rect x="${12 + i * 9}" y="${56 - bh}" width="8" height="${bh}" class="viz__mark"/>`).join('') + line(10, 56, 86, 56, 'viz__axis'),
    boite: () => [[24, 18, 40, 30], [56, 12, 30, 22]].map(([x, t, b, m]) => line(x + 8, t - 8, x + 8, b + 10, 'viz__axis') + `<rect x="${x}" y="${t}" width="16" height="${b - t}" class="viz__box"/>` + line(x, m, x + 16, m, 'viz__ref')).join(''),
    chiffre: () => `<text x="10" y="46" class="viz__hero" font-size="36">42</text>`,
    chaleur: () => [0, 1, 2, 3].map(r => [0, 1, 2, 3, 4, 5].map(c => `<rect x="${12 + c * 12}" y="${8 + r * 12}" width="11" height="11" class="viz__heat viz__heat--${(r + c) % 4}"/>`).join('')).join(''),
  };

  function picto(kind, label) {
    const draw = PICTOS[kind];
    if (!draw) return '';
    return `<svg class="viz viz--picto" viewBox="0 0 96 64" role="img" aria-label="${esc(label)}">${draw()}</svg>`;
  }

  // ---------- Vue tableau : le jumeau accessible de chaque graphique ----------

  function table(spec, data) {
    const o = { ...data, ...spec };
    let head, rows;
    if (data.items) {
      head = [o.colonneLabel || 'Libellé', o.colonneValeur || 'Valeur'];
      rows = data.items.map(i => [i.label, fmt(i.valeur, o)]);
    } else if (data.points && data.x) {
      head = ['Point', data.x.libelle, data.y.libelle];
      rows = data.points.map(p => [p.label, num(p.x), num(p.y)]);
    } else if (data.points) {
      head = ['Période', o.colonneValeur || 'Valeur'];
      rows = data.points.map(p => [p.x, fmt(p.y, o)]);
    } else if (data.valeurs) {
      head = ['Rang', data.libelle || 'Valeur'];
      rows = [...data.valeurs].sort((a, b) => a - b).map((v, i) => [String(i + 1), fmt(v, o)]);
      rows.push(['Médiane', fmt(stats.mediane(data.valeurs), o)], ['Moyenne', fmt(stats.moyenne(data.valeurs), o)]);
    } else return '';
    return `<details class="disclosure viz-data">
      <summary class="disclosure__summary">Voir les données</summary>
      <div class="disclosure__body table-scroll">
        <table class="viz-data__table"><thead><tr>${head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table>
      </div>
    </details>`;
  }

  // ---------- Montage et redessin à la largeur du conteneur ----------

  const RENDERERS = { barres, colonnes, courbe, points, chiffre, nuage, causal };
  const observer = 'ResizeObserver' in window ? new ResizeObserver(entries => entries.forEach(e => draw(e.target))) : null;

  function draw(el) {
    const viz = el._viz;
    const w = Math.floor(el.clientWidth);
    if (!viz || !w || w === viz.width) return;
    viz.width = w;
    const cs = getComputedStyle(el);
    font = { size: parseFloat(cs.fontSize), family: cs.fontFamily };
    try {
      el.innerHTML = RENDERERS[viz.spec.type](viz.spec, viz.data, w);
    } catch (err) {
      console.error('Visuel impossible à dessiner', viz.spec, err);
      el.innerHTML = `<p class="empty">Visuel indisponible : ${esc(viz.spec.alt || '')}</p>`;
    }
  }

  function mount(el, spec, data) {
    el._viz = { spec, data, width: 0 };
    draw(el);
    if (observer) observer.observe(el);
  }

  function reset() {
    if (observer) observer.disconnect();
  }

  // Le texte des SVG dépend de la police : on redessine une fois Inter chargée
  if (document.fonts) document.fonts.ready.then(() => document.querySelectorAll('.viz-host').forEach(el => { if (el._viz) { el._viz.width = 0; draw(el); } }));

  return { mount, reset, table, tableur, picto, stats, fmt, isSvg: type => type in RENDERERS };
})();
