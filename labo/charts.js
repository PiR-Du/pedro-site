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
    // Droite des moindres carrés y = a + b x
    droite: (xs, ys) => {
      const mx = stats.moyenne(xs), my = stats.moyenne(ys);
      const b = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
      return { a: my - b * mx, b };
    },
    // Quartiles de Tukey (médiane de chaque moitié) et moustaches à 1,5 écart interquartile
    tukey: values => {
      const s = [...values].sort((a, b) => a - b), n = s.length, half = Math.floor(n / 2);
      const q1 = stats.mediane(s.slice(0, n % 2 ? half + 1 : half)), q3 = stats.mediane(s.slice(half));
      const iqr = q3 - q1, lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
      const inside = s.filter(v => v >= lo && v <= hi);
      return { q1, me: stats.mediane(s), q3, iqr, min: inside[0], max: inside[inside.length - 1], out: s.filter(v => v < lo || v > hi) };
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
  // donnees : { unite, decimales, items: [{ label, valeur, accent, groupe }] }. Options : axeMin, max, trier (du plus grand au plus petit),
  // groupe (ne garder que les items de ce groupe : une paire peut montrer une partie des données d'un côté, tout de l'autre).

  function barres(spec, data, w) {
    const o = { ...data, ...spec };
    const kept = spec.groupe ? data.items.filter(i => i.groupe === spec.groupe) : data.items;
    const items = o.trier ? [...kept].sort((a, b) => b.valeur - a.valeur) : kept;
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
  // Option valeurs : 'toutes' (une valeur sur chaque colonne) ou 'aucune' (pas même sur les colonnes accent).

  function colonnes(spec, data, w) {
    const o = { ...data, ...spec };
    const items = data.items;
    const hasAccent = items.some(i => i.accent);
    const min = o.axeMin ?? 0;
    const tickList = ticks(min, o.max ?? Math.max(...items.map(i => i.valeur)), 4).filter(t => t >= min);
    if (tickList.length < 2) tickList.push(min + 1);   // toutes les valeurs nulles : un axe minimal plutôt qu'une division par zéro
    // Axe tronqué entre deux graduations : on gradue aussi son départ, sauf s'il touche la graduation suivante
    if (tickList[0] > min && tickList[0] - min > (tickList[1] - tickList[0]) * 0.3) tickList.unshift(min);
    const max = tickList[tickList.length - 1];
    // Une décimale de plus pour un départ d'axe non rond (17,5 %), jamais pour les graduations rondes
    const tickLabel = t => fmt(t, { ...o, decimales: Number.isInteger(t) ? o.decimalesAxe ?? 0 : Math.max(o.decimalesAxe ?? 0, 1) });
    const axisW = Math.max(...tickList.map(t => measure(tickLabel(t)))) + 8;
    const top = 20, axisH = 24;
    const h = Math.round(Math.min(Math.max(w * 0.62, 240), 400));
    const plotX = axisW, plotW = w - axisW, plotH = h - top - axisH;
    const sy = v => top + plotH - ((v - min) / (max - min)) * plotH;
    const slot = plotW / items.length;
    // Avec des traits théoriques, des colonnes plus fines laissent dépasser le trait de chaque côté
    const hasTheory = items.some(i => i.theorie != null);
    const barW = hasTheory ? slot * 0.6 : Math.min(slot - 2, 24 + slot * 0.3);
    // Une étiquette sur deux, trois… si la place manque
    // Toutes les étiquettes si elles tiennent, sinon seulement la première et la dernière
    const fits = Math.max(...items.map(i => measure(i.label))) <= slot - 4;
    const axisLabel = (item, i, x) => {
      if (fits) return text(x, h - axisH + 14, item.label, 'viz__tick', 'middle');
      if (i === 0) return text(plotX, h - axisH + 14, item.label, 'viz__tick', 'start');
      if (i === items.length - 1) return text(w, h - axisH + 14, item.label, 'viz__tick', 'end');
      return '';
    };

    const grid = tickList.map(t => line(plotX, sy(t), w, sy(t), 'viz__grid') + text(plotX - 8, sy(t), tickLabel(t), 'viz__tick', 'end')).join('');
    const bars = items.map((item, i) => {
      const x = plotX + i * slot + (slot - barW) / 2;
      const y = sy(Math.min(Math.max(item.valeur, min), max));
      const cls = hasAccent && !item.accent ? 'viz__mark viz__mark--muted' : 'viz__mark';
      const showValue = o.valeurs === 'toutes' || (item.accent && o.valeurs !== 'aucune');
      // Valeur théorique attendue : un trait sur la colonne, pour comparer l'observé au calcul
      const over = (slot - barW) / 2 - 1;
      const theory = item.theorie == null ? '' : line(x - over, sy(Math.min(item.theorie, max)), x + barW + over, sy(Math.min(item.theorie, max)), 'viz__ref');
      const tip = item.theorie == null ? fmt(item.valeur, o) : `${fmt(item.valeur, o)}, théorie ${fmt(item.theorie, o)}`;
      return `<g class="viz__item"><title>${esc(item.label)} : ${esc(tip)}</title>
        <rect x="${x}" y="${y}" width="${barW}" height="${sy(min) - y}" class="${cls}"/>
        ${theory}
        ${showValue ? text(x + barW / 2, y - 8, fmt(item.valeur, o), 'viz__value', 'middle') : ''}
        ${axisLabel(item, i, x + barW / 2)}</g>`;
    }).join('');
    return frame(w, h, spec, grid + line(plotX, sy(min), w, sy(min), 'viz__axis') + bars);
  }

  // ---------- Courbe ----------
  // donnees : { unite, points: [{ x: 'libellé', y }] }. Options : plage [début, fin] (index), axeMin,
  // reference { valeur, libelle } (droite horizontale, une valeur limite par exemple),
  // tendance (droite des moindres carrés sur les points affichés), fenetre [début, fin] (index : bande grisée
  // et droite de tendance propre à cette période, épaisse et en tirets).

  function courbe(spec, data, w) {
    const o = { ...data, ...spec };
    const all = data.points;
    const [from, to] = o.plage || [0, all.length - 1];
    const points = all.slice(from, to + 1);
    const ys = points.map(p => p.y);
    const tickList = ticks(o.axeMin ?? Math.min(0, ...ys), Math.max(...ys, o.reference ? o.reference.valeur : -Infinity), 4);
    const min = tickList[0], max = tickList[tickList.length - 1];
    const tickFmt = { ...o, decimales: o.decimalesAxe ?? o.decimales };
    const axisW = Math.max(...tickList.map(t => measure(fmt(t, tickFmt)))) + 8;
    const endW = measure(fmt(points[points.length - 1].y, o)) + 12;
    const top = 16, axisH = 24;
    const h = Math.round(Math.min(Math.max(w * 0.6, 240), 400));
    const plotX = axisW, plotW = w - axisW - endW, plotH = h - top - axisH;
    const sx = i => plotX + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
    const sy = v => top + plotH - ((v - min) / (max - min)) * plotH;
    const every = Math.ceil(points.length / Math.max(Math.floor(plotW / 56), 2));

    const grid = tickList.map(t => line(plotX, sy(t), plotX + plotW, sy(t), 'viz__grid') + text(plotX - 8, sy(t), fmt(t, tickFmt), 'viz__tick', 'end')).join('');
    // Le dernier libellé est toujours affiché : on retire le libellé régulier qui le toucherait
    const lastI = points.length - 1;
    const showLabel = i => i === lastI || (i % every === 0 && lastI - i >= every);
    const labels = points.map((p, i) => showLabel(i) ? text(sx(i), h - axisH + 14, p.x, 'viz__tick', 'middle') : '').join('');
    const path = points.map((p, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');
    const hits = points.map((p, i) => `<g class="viz__item"><title>${esc(p.x)} : ${esc(fmt(p.y, o))}</title><circle cx="${sx(i)}" cy="${sy(p.y)}" r="12" class="viz__hit"/></g>`).join('');
    const last = points[points.length - 1];
    const end = `<circle cx="${sx(points.length - 1)}" cy="${sy(last.y)}" r="4" class="viz__mark viz__dot"/>${text(sx(points.length - 1) + 8, sy(last.y), fmt(last.y, o), 'viz__value')}`;
    const ref = o.reference
      ? line(plotX, sy(o.reference.valeur), plotX + plotW, sy(o.reference.valeur), 'viz__ref viz__ref--thin') +
        text(plotX + plotW, sy(o.reference.valeur) - 10, o.reference.libelle || fmt(o.reference.valeur, o), 'viz__label viz__label--strong', 'end')
      : '';
    // Droite des moindres carrés entre les index i0 et i1 des points affichés (l'abscisse est le rang : pas régulier)
    const trendLine = (i0, i1, cls) => {
      const idx = Array.from({ length: i1 - i0 + 1 }, (_, k) => i0 + k);
      if (idx.length < 2) return '';
      const { a, b } = stats.droite(idx, idx.map(i => points[i].y));
      return line(sx(i0), sy(a + b * i0), sx(i1), sy(a + b * i1), cls);
    };
    let band = '', trends = '';
    if (o.tendance) trends += trendLine(0, lastI, 'viz__trend');
    if (o.fenetre) {
      const i0 = Math.max(o.fenetre[0] - from, 0), i1 = Math.min(o.fenetre[1] - from, lastI);
      if (i1 > i0) {
        band = `<rect x="${sx(i0)}" y="${top}" width="${Math.max(sx(i1) - sx(i0), 0)}" height="${Math.max(plotH, 0)}" class="viz__band"/>`;
        trends += trendLine(i0, i1, 'viz__trend viz__trend--fenetre');
      }
    }
    return frame(w, h, spec, band + grid + labels + ref + `<path d="${path}" class="viz__line"/>` + trends + end + hits);
  }

  // ---------- Courbes : plusieurs séries sur le même axe ----------
  // donnees : { unite, decimales, x: ['libellé', ...], series: [{ libelle, serie, tirets, valeurs: [...] }] }.
  // Options : axeMin, reference { valeur, libelle } (libellé à gauche, au-dessus de la droite).
  // Légende en haut : les fins de courbes proches se chevaucheraient.

  function courbes(spec, data, w) {
    const o = { ...data, ...spec };
    const all = data.series.flatMap(s => s.valeurs);
    const tickList = ticks(o.axeMin ?? Math.min(0, ...all), Math.max(...all), 4);
    const min = tickList[0], max = tickList[tickList.length - 1];
    const tickFmt = { ...o, decimales: o.decimalesAxe ?? o.decimales };
    const axisW = Math.max(...tickList.map(t => measure(fmt(t, tickFmt)))) + 8;
    const leg = legend(data.series.map((s, i) => ({ libelle: s.libelle, serie: s.serie ?? i + 1 })), 0, 10, w);
    const top = leg.height + 20, axisH = 24;
    const h = Math.round(Math.min(Math.max(w * 0.6, 240), 400)) + leg.height;
    const n = data.x.length;
    const plotX = axisW, plotW = w - axisW - 8, plotH = h - top - axisH;
    const sx = i => plotX + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2);
    const sy = v => top + plotH - ((v - min) / (max - min)) * plotH;
    const every = Math.ceil(n / Math.max(Math.floor(plotW / 48), 2));

    const grid = tickList.map(t => line(plotX, sy(t), plotX + plotW, sy(t), 'viz__grid') + text(plotX - 8, sy(t), fmt(t, tickFmt), 'viz__tick', 'end')).join('');
    const labels = data.x.map((x, i) => i % every === 0 ? text(sx(i), h - axisH + 14, x, 'viz__tick', 'middle') : '').join('');
    const ref = o.reference
      ? line(plotX, sy(o.reference.valeur), plotX + plotW, sy(o.reference.valeur), 'viz__ref viz__ref--thin') +
        text(plotX + 8, sy(o.reference.valeur) - 10, o.reference.libelle || fmt(o.reference.valeur, o), 'viz__label', 'start')
      : '';
    const lines = data.series.map((s, k) => {
      const serie = s.serie ?? k + 1;
      const path = s.valeurs.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join('');
      const dots = s.valeurs.map((v, i) => `<g class="viz__item"><title>${esc(s.libelle)}, ${esc(data.x[i])} : ${esc(fmt(v, o))}</title>
        <circle cx="${sx(i)}" cy="${sy(v)}" r="3.5" class="viz__mark viz__mark--s${serie} viz__dot"/><circle cx="${sx(i)}" cy="${sy(v)}" r="10" class="viz__hit"/></g>`).join('');
      return `<path d="${path}" class="viz__line viz__line--s${serie}${s.tirets ? ' viz__line--dash' : ''}"/>` + dots;
    }).join('');
    return frame(w, h, spec, leg.svg + grid + labels + ref + lines);
  }

  // ---------- Plateau : carte de chaleur des 40 cases d'un plateau de jeu ----------
  // donnees : { unite, items: 40 × [{ label, valeur, accent }] } dans l'ordre du plateau, case 0 en bas à droite.
  // La case accent (la prison) sort de l'échelle : elle prend la couleur d'accent au lieu d'écraser la rampe.

  // Coordonnées (colonne, ligne) d'une case sur une grille 11 × 11, dans le sens du jeu
  function boardCell(i) {
    if (i <= 10) return [10 - i, 10];
    if (i <= 20) return [0, 10 - (i - 10)];
    if (i <= 30) return [i - 20, 0];
    return [10, i - 30];
  }

  // Intensité de 0 à 1 vers un pourcentage de mélange : jamais blanc pur, pour garder la case visible
  const heatMix = t => Math.round(8 + Math.max(0, Math.min(1, t)) * 82);

  function plateau(spec, data, w) {
    const o = { ...data, ...spec };
    const items = data.items;
    const size = Math.min(w, 560);
    const c = size / 11;
    const scale = items.filter(i => !i.accent && i.valeur > 0).map(i => i.valeur);
    const lo = Math.min(...scale), hi = Math.max(...scale);
    const t = v => (v - lo) / (hi - lo || 1);
    const showValues = c >= 40;

    const cells = items.map((item, i) => {
      const [col, row] = boardCell(i);
      const x = col * c, y = row * c;
      const mix = item.accent ? null : heatMix(t(item.valeur));
      const fill = item.accent ? '' : ` style="fill: color-mix(in oklab, var(--color-data-3) ${mix}%, var(--color-bg))"`;
      const cls = item.accent ? 'viz__mark' : 'viz__cell';
      const dark = item.accent || mix > 55;
      const value = showValues ? text(x + c / 2, y + c / 2, num(item.valeur, 1), `viz__tick${dark ? ' viz__tick--inverse' : ''}`, 'middle') : '';
      return `<g class="viz__item"><title>${esc(item.label)} : ${esc(fmt(item.valeur, o))}</title>
        <rect x="${x + 1}" y="${y + 1}" width="${c - 2}" height="${c - 2}" class="${cls}"${fill}/>${value}</g>`;
    }).join('');

    // Centre du plateau : la légende de la rampe et le sens de rotation
    const cx = c * 1.6, inner = size - c * 3.2;
    const steps = 5, sw = Math.min(inner / steps, 48);
    const ramp = Array.from({ length: steps }, (_, k) =>
      `<rect x="${cx + k * sw}" y="${c * 1.6 + 24}" width="${sw - 2}" height="12" class="viz__cell" style="fill: color-mix(in oklab, var(--color-data-3) ${heatMix(k / (steps - 1))}%, var(--color-bg))"/>`).join('');
    const rampEnd = cx + steps * sw - 2;
    const legendY = c * 1.6;
    const legendBody = text(cx, legendY + 6, o.legendeTitre || 'Fréquentation', 'viz__eyebrow') + ramp +
      text(cx, legendY + 52, fmt(lo, { ...o, decimales: 1 }), 'viz__tick') +
      text(rampEnd, legendY + 52, fmt(hi, { ...o, decimales: 1 }), 'viz__tick', 'end');
    const accentItem = items.find(i => i.accent);
    const accentLegend = accentItem
      ? `<rect x="${cx}" y="${legendY + 72}" width="12" height="12" class="viz__mark"/>` +
        text(cx + 18, legendY + 78, `${accentItem.label}, ${fmt(accentItem.valeur, { ...o, decimales: 1 })}`, 'viz__label viz__label--strong')
      : '';
    const sens = inner > 160 ? text(size - c * 1.6, size - c * 1.6 - 8, o.sens || 'Départ en bas à droite, sens horaire', 'viz__label', 'end') : '';

    return frame(size, size, spec, cells + legendBody + accentLegend + sens);
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
  // donnees : { x: { libelle, court, decimales }, y: { libelle, court, decimales }, groupes: [{ id, libelle, serie }], points: [{ label, x, y, groupe }] }
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
      const { a, b } = stats.droite(xs, ys);
      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      trend = line(sx(x0), sy(a + b * x0), sx(x1), sy(a + b * x1), 'viz__trend');
    }
    let coef = '';
    if (o.coefficient) coef = text(plotX + 8, top + 8, `r = ${num(stats.pearson(xs, ys), 2)}`, 'viz__label viz__label--strong');

    const dots = pts.map(p => {
      const g = data.groupes?.[groupIndex(p.groupe)];
      const serie = g ? (g.serie ?? groupIndex(p.groupe) + 1) : 1;
      return `<g class="viz__item"><title>${esc(p.label)} : ${esc(num(p.x, data.x.decimales))} ${esc(data.x.court || '')}, ${esc(num(p.y, data.y.decimales))} ${esc(data.y.court || '')}</title>
        <circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="5" class="viz__mark viz__mark--s${serie} viz__dot"/>
        <circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="12" class="viz__hit"/></g>`;
    }).join('');
    return frame(w, h, spec, leg.svg + grid + axes + trend + coef + dots);
  }

  // ---------- Petits multiples : un nuage par jeu de données, mêmes axes partout ----------
  // donnees : { x: { libelle }, y: { libelle }, panneaux: [{ titre, points: [{ x, y }] }] }. Options : tendance, coefficient.

  function multiples(spec, data, w) {
    const o = { ...data, ...spec };
    const panels = data.panneaux;
    const all = panels.flatMap(p => p.points);
    const cols = w >= 520 ? 2 : 1, gapX = 24, gapY = 20;
    const pw = (w - gapX * (cols - 1)) / cols;
    const xt = ticks(Math.min(0, ...all.map(p => p.x)), Math.max(...all.map(p => p.x)), 4);
    const yt = ticks(Math.min(0, ...all.map(p => p.y)), Math.max(...all.map(p => p.y)), 3);
    const axisW = Math.max(...yt.map(t => measure(num(t)))) + 8;
    const titleH = 28, bottom = 22;
    const ph = Math.round(Math.min(Math.max(pw * 0.66, 180), 260));
    // Marge droite : la moitié du dernier libellé de l'axe x, centré sur le bord du tracé
    const plotW = pw - axisW - measure(num(xt[xt.length - 1])) / 2 - 6, plotH = ph - titleH - bottom;
    const rows = Math.ceil(panels.length / cols);
    const h = rows * ph + (rows - 1) * gapY + 24;

    const body = panels.map((p, k) => {
      const ox = (k % cols) * (pw + gapX), oy = Math.floor(k / cols) * (ph + gapY);
      const plotX = ox + axisW, base = oy + titleH + plotH;
      const sx = v => plotX + ((v - xt[0]) / (xt[xt.length - 1] - xt[0])) * plotW;
      const sy = v => base - ((v - yt[0]) / (yt[yt.length - 1] - yt[0])) * plotH;
      const xs = p.points.map(pt => pt.x), ys = p.points.map(pt => pt.y);
      const grid = yt.map(t => line(plotX, sy(t), plotX + plotW, sy(t), 'viz__grid') + text(plotX - 8, sy(t), num(t), 'viz__tick', 'end')).join('') +
        xt.map(t => text(sx(t), base + 14, num(t), 'viz__tick', 'middle')).join('');
      const head = text(ox, oy + 10, p.titre, 'viz__label viz__label--strong') +
        (o.coefficient ? text(plotX + plotW, oy + 10, `r = ${num(stats.pearson(xs, ys), 2)}`, 'viz__label', 'end') : '');
      let trend = '';
      if (o.tendance) {
        const { a, b } = stats.droite(xs, ys);
        trend = line(sx(xt[0]), sy(a + b * xt[0]), sx(xt[xt.length - 1]), sy(a + b * xt[xt.length - 1]), 'viz__trend');
      }
      const dots = p.points.map(pt => `<g class="viz__item"><title>${esc(p.titre)} : x = ${esc(num(pt.x))}, y = ${esc(num(pt.y, 2))}</title>
        <circle cx="${sx(pt.x)}" cy="${sy(pt.y)}" r="4.5" class="viz__mark viz__dot"/><circle cx="${sx(pt.x)}" cy="${sy(pt.y)}" r="10" class="viz__hit"/></g>`).join('');
      return grid + line(plotX, base, plotX + plotW, base, 'viz__axis') + head + trend + dots;
    }).join('');
    const axes = text(w - 6, h - 4, `${data.x.libelle} en abscisse, ${data.y.libelle} en ordonnée`, 'viz__label', 'end');
    return frame(w, h, spec, body + axes);
  }

  // ---------- Anneau : les parts d'un tout ----------
  // donnees : { unite, items: [{ label, valeur, serie }] }, parts dans l'ordre des items, depuis midi dans le sens horaire.
  // Option valeurs: 'toutes' (la valeur suit chaque libellé de la légende).

  function anneau(spec, data, w) {
    const o = { ...data, ...spec };
    const items = data.items;
    const total = items.reduce((s, i) => s + i.valeur, 0);
    const side = w >= 400;
    const size = Math.min(side ? w * 0.5 : w, 240);
    const cx = size / 2, cy = size / 2, R = size / 2 - 2, r0 = R * 0.56;
    const pt = (ang, rad) => `${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`;
    const serie = (item, i) => item.serie ?? i + 1;
    let a = -Math.PI / 2;
    const slices = items.map((item, i) => {
      const da = (item.valeur / total) * 2 * Math.PI, a1 = a + da, large = da > Math.PI ? 1 : 0;
      const d = `M${pt(a, R)} A${R},${R} 0 ${large} 1 ${pt(a1, R)} L${pt(a1, r0)} A${r0},${r0} 0 ${large} 0 ${pt(a, r0)} Z`;
      a = a1;
      return `<g class="viz__item"><title>${esc(item.label)} : ${esc(fmt(item.valeur, o))}</title><path d="${d}" class="viz__mark viz__mark--s${serie(item, i)} viz__slice"/></g>`;
    }).join('');
    // Légende à droite si la place le permet, dessous sinon
    const lx = side ? size + 24 : 0, ly = side ? Math.max(cy - (items.length - 1) * 12, 8) : size + 24;
    const leg = items.map((item, i) => {
      const y = ly + i * 24;
      const label = o.valeurs === 'toutes' ? `${item.label}, ${fmt(item.valeur, o)}` : item.label;
      return `<rect x="${lx}" y="${y - 6}" width="12" height="12" class="viz__mark viz__mark--s${serie(item, i)}"/>${text(lx + 18, y, label, 'viz__label')}`;
    }).join('');
    const h = side ? size : size + 24 + items.length * 24;
    return frame(w, h, spec, slices + leg);
  }

  // ---------- Boîte à moustaches horizontale ----------
  // donnees : { unite, valeurs: [...] }. Quartiles de Tukey, moustaches jusqu'à la dernière valeur à moins de 1,5 écart
  // interquartile de la boîte, valeurs atypiques en points. Option points: true, chaque valeur dessinée sous la boîte.

  function boite(spec, data, w) {
    const o = { ...data, ...spec };
    const values = data.valeurs, t = stats.tukey(values);
    const tickList = ticks(o.axeMin ?? Math.min(...values), Math.max(...values), w < 400 ? 3 : 5);
    const min = tickList[0], max = tickList[tickList.length - 1];
    const margin = 10;
    const sx = v => margin + ((v - min) / (max - min)) * (w - 2 * margin);
    const rowH = 20, boxTop = 8 + 3 * rowH + 8, boxH = 32, mid = boxTop + boxH / 2;

    // Trois lignes de libellés, une par repère, reliées à la boîte par un trait fin
    const marks = [
      { v: t.q1, label: `Q1 ${fmt(t.q1, o)}`, anchor: 'end' },
      { v: t.me, label: `Médiane ${fmt(t.me, o)}`, anchor: 'start', strong: true },
      { v: t.q3, label: `Q3 ${fmt(t.q3, o)}`, anchor: 'start' },
    ].map((m, i) => {
      const x = sx(m.v), y = 8 + i * rowH + 6, lw = measure(m.label, 500);
      let anchor = m.anchor;
      if (anchor === 'end' && x - lw - 6 < 0) anchor = 'start';
      if (anchor === 'start' && x + lw + 6 > w) anchor = 'end';
      return line(x, y + 8, x, boxTop, 'viz__grid') + text(anchor === 'end' ? x - 6 : x + 6, y, m.label, 'viz__label viz__label--strong', anchor);
    }).join('');

    const box = line(sx(t.min), mid, sx(t.q1), mid, 'viz__ref viz__ref--thin') + line(sx(t.q3), mid, sx(t.max), mid, 'viz__ref viz__ref--thin') +
      line(sx(t.min), mid - 8, sx(t.min), mid + 8, 'viz__ref viz__ref--thin') + line(sx(t.max), mid - 8, sx(t.max), mid + 8, 'viz__ref viz__ref--thin') +
      `<g class="viz__item"><title>${esc(`Q1 ${fmt(t.q1, o)}, médiane ${fmt(t.me, o)}, Q3 ${fmt(t.q3, o)}`)}</title><rect x="${sx(t.q1)}" y="${boxTop}" width="${sx(t.q3) - sx(t.q1)}" height="${boxH}" class="viz__box"/></g>` +
      line(sx(t.me), boxTop, sx(t.me), boxTop + boxH, 'viz__ref viz__ref--accent');
    const outliers = t.out.map(v => `<g class="viz__item"><title>Valeur atypique : ${esc(fmt(v, o))}</title>
      <circle cx="${sx(v)}" cy="${mid}" r="5" class="viz__mark viz__dot"/></g>${text(sx(v), mid - 16, fmt(v, o), 'viz__value', sx(v) > w - 40 ? 'end' : 'middle')}`).join('');

    // Points empilés par colonne de pixels, comme un histogramme en points
    let dots = '', stripH = 0;
    if (o.points) {
      const r = 3.5, col = 2 * r + 1, counts = {};
      const top = boxTop + boxH + 20;
      dots = [...values].sort((a, b) => a - b).map(v => {
        const bin = Math.round(sx(v) / col), k = counts[bin] = (counts[bin] || 0) + 1;
        stripH = Math.max(stripH, k * (2 * r + 1));
        return `<g class="viz__item"><title>${esc(fmt(v, o))}</title><circle cx="${bin * col}" cy="${top + r + (k - 1) * (2 * r + 1)}" r="${r}" class="viz__mark viz__mark--ink viz__dot"/></g>`;
      }).join('');
      stripH += 20;
    }
    const baseY = boxTop + boxH + 16 + stripH;
    const axis = line(0, baseY, w, baseY, 'viz__axis') + tickList.map(v => {
      const anchor = sx(v) < 24 ? 'start' : sx(v) > w - 24 ? 'end' : 'middle';
      return line(sx(v), baseY, sx(v), baseY + 4, 'viz__axis') + text(sx(v), baseY + 16, fmt(v, o), 'viz__tick', anchor);
    }).join('');
    return frame(w, baseY + 28, spec, marks + box + outliers + dots + axis);
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

  // ---------- Essais répétés : un point par essai (un sondage, une expérience), empilés par classe ----------
  // donnees : { unite, decimales, min, max, pas, groupes: [{ id, libelle, serie }], valeurs: [{ v, groupe }],
  // references: [{ valeur, libelle, accent }] }. Alimenté en direct par un module interactif.

  function essais(spec, data, w) {
    const o = { ...data, ...spec };
    const { min, max } = o, step = o.pas || 1;
    const bins = Math.max(Math.round((max - min) / step), 1);
    const groups = data.groupes || [];
    const leg = groups.length ? legend(groups, 0, 10, w) : { svg: '', height: 0 };
    const counts = new Array(bins).fill(0);
    const placed = data.valeurs.map(d => {
      const bin = Math.min(Math.max(Math.floor((d.v - min) / step), 0), bins - 1);
      return { ...d, bin, k: counts[bin]++ };
    });
    const colW = w / bins;
    const maxCount = Math.max(1, ...counts);
    // Le rayon diminue quand une pile monte : le graphique garde une hauteur raisonnable
    const r = Math.max(Math.min(colW / 2 - 0.5, 6, 240 / maxCount / 2 - 0.5), 1.2);
    const refs = data.references || [];
    const top = leg.height + 12 + refs.length * 20;
    const stackH = maxCount * (2 * r + 1);
    const h = Math.round(top + Math.max(stackH, 120) + 8 + 28);
    const baseY = h - 28;
    const sx = v => ((v - min) / (max - min)) * w;

    const tickList = ticks(min, max, w < 400 ? 4 : 10).filter(t => t >= min && t <= max);
    const axis = line(0, baseY, w, baseY, 'viz__axis') + tickList.map(t => {
      const anchor = sx(t) < 24 ? 'start' : sx(t) > w - 24 ? 'end' : 'middle';
      return line(sx(t), baseY, sx(t), baseY + 4, 'viz__axis') + text(sx(t), baseY + 16, fmt(t, { ...o, decimales: 0 }), 'viz__tick', anchor);
    }).join('');

    const serieOf = id => { const k = groups.findIndex(g => g.id === id); return k < 0 ? 1 : groups[k].serie ?? k + 1; };
    const dots = placed.map(p => `<g class="viz__item"><title>${esc(fmt(p.v, o))}</title>
      <circle cx="${(p.bin + 0.5) * colW}" cy="${baseY - r - 1 - p.k * (2 * r + 1)}" r="${r}" class="viz__mark viz__mark--s${serieOf(p.groupe)}${r > 2.5 ? ' viz__dot' : ''}"/></g>`).join('');

    const lines = refs.map((ref, i) => {
      const x = sx(ref.valeur), y = leg.height + 12 + i * 20 + 6;
      const label = ref.libelle || fmt(ref.valeur, o);
      const anchor = x + measure(label, 500) + 6 > w ? 'end' : 'start';
      return line(x, y - 8, x, baseY, ref.accent ? 'viz__ref viz__ref--accent' : 'viz__ref viz__ref--thin') +
        text(anchor === 'end' ? x - 6 : x + 6, y, label, 'viz__label viz__label--strong', anchor);
    }).join('');

    return frame(w, h, spec, leg.svg + axis + lines + dots);
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
    sucette: () => [[14, 66], [26, 52], [38, 44], [50, 30]].map(([y, x]) => line(12, y, 12 + x, y, 'viz__ref viz__ref--thin') + `<circle cx="${12 + x}" cy="${y}" r="4" class="viz__mark"/>`).join('') + line(12, 6, 12, 58, 'viz__axis'),
    aires: () => `<path d="M10,56 L10,42 L30,38 L50,40 L70,32 L86,30 L86,56 Z" class="viz__mark viz__mark--muted"/>` +
      `<path d="M10,42 L30,38 L50,40 L70,32 L86,30 L86,14 L70,18 L50,28 L30,24 L10,30 Z" class="viz__mark"/>` + line(10, 56, 86, 56, 'viz__axis'),
    treemap: () => [[10, 8, 42, 48, ''], [54, 8, 32, 28, ' viz__mark--muted'], [54, 38, 18, 18, ' viz__mark--ink'], [74, 38, 12, 18, ' viz__mark--muted']]
      .map(([x, y, rw, rh, c]) => `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" class="viz__mark${c}"/>`).join(''),
    bande: () => [[16, 0], [26, 0], [30, 1], [34, 0], [36, 2], [38, 1], [42, 0], [44, 3], [50, 1], [58, 0], [80, 0]]
      .map(([x, k]) => `<circle cx="${x}" cy="${50 - k * 8}" r="3.5" class="viz__mark viz__mark--ink"/>`).join('') + line(10, 56, 86, 56, 'viz__axis'),
    pente: () => line(24, 8, 24, 56, 'viz__axis') + line(72, 8, 72, 56, 'viz__axis') +
      [[44, 16, ''], [30, 38, ' viz__mark--muted'], [20, 48, ' viz__mark--muted']].map(([a, b, c]) => line(24, a, 72, b, 'viz__ref viz__ref--thin') +
        `<circle cx="24" cy="${a}" r="3.5" class="viz__mark${c}"/><circle cx="72" cy="${b}" r="3.5" class="viz__mark${c}"/>`).join(''),
    halteres: () => [[14, 20, 70], [28, 30, 58], [42, 40, 52], [56, 26, 34]].map(([y, a, b]) => line(a, y, b, y, 'viz__ref viz__ref--thin') +
      `<circle cx="${a}" cy="${y}" r="4" class="viz__mark viz__mark--muted"/><circle cx="${b}" cy="${y}" r="4" class="viz__mark"/>`).join(''),
    carte: () => [['M12,12 L40,8 L44,28 L16,32 Z', 1], ['M40,8 L72,12 L68,30 L44,28 Z', 3], ['M72,12 L86,24 L80,44 L68,30 Z', 0],
      ['M16,32 L44,28 L46,54 L20,56 Z', 2], ['M44,28 L68,30 L80,44 L64,56 L46,54 Z', 1]].map(([d, k]) => `<path d="${d}" class="viz__heat viz__heat--${k} viz__slice"/>`).join(''),
    symboles: () => `<path d="M12,12 L40,8 L72,12 L86,24 L80,44 L64,56 L20,56 L16,32 Z" class="viz__box"/>` +
      [[30, 24, 6], [56, 30, 11], [70, 44, 4], [34, 46, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" class="viz__mark viz__dot"/>`).join(''),
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
    if (data.panneaux) {
      head = ['Jeu', data.x.libelle, data.y.libelle];
      rows = data.panneaux.flatMap(p => p.points.map(pt => [p.titre, num(pt.x), num(pt.y, 2)]));
    } else if (data.series) {
      head = [o.colonneLabel || 'Période', ...data.series.map(s => s.libelle)];
      rows = data.x.map((x, i) => [x, ...data.series.map(s => fmt(s.valeurs[i], o))]);
    } else if (data.items) {
      head = [o.colonneLabel || 'Libellé', o.colonneValeur || 'Valeur'];
      rows = data.items.map(i => [i.label, fmt(i.valeur, o)]);
    } else if (data.points && data.x) {
      head = ['Point', data.x.libelle, data.y.libelle];
      rows = data.points.map(p => [p.label, num(p.x, data.x.decimales), num(p.y, data.y.decimales)]);
    } else if (data.points) {
      head = [o.colonneLabel || 'Période', o.colonneValeur || 'Valeur'];
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

  const RENDERERS = { barres, colonnes, courbe, courbes, points, chiffre, nuage, multiples, anneau, boite, causal, plateau, essais };
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

  // Nouvelles données pour un visuel déjà monté (graphique alimenté par une simulation)
  function update(el, data, spec = el._viz?.spec) {
    if (!el._viz) return;
    el._viz.data = data;
    el._viz.spec = spec;
    el._viz.width = 0;
    draw(el);
  }

  function reset() {
    if (observer) observer.disconnect();
  }

  // Le texte des SVG dépend de la police : on redessine une fois Inter chargée
  if (document.fonts) document.fonts.ready.then(() => document.querySelectorAll('.viz-host').forEach(el => { if (el._viz) { el._viz.width = 0; draw(el); } }));

  return { mount, update, reset, table, picto, stats, fmt, num, esc, isSvg: type => type in RENDERERS };
})();
