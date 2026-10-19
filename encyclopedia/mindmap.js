// Carte mentale (D3.js) : un nœud central, une branche par catégorie, une feuille par savoir.
// Toute l'apparence vient du CSS (.graph__*) : ce fichier ne pose que des classes et des positions.

const LEAF_RADIUS = 6;        // rayon du point d'un savoir
const LABEL_OFFSET = 8;       // écart entre le point et son titre
const PILL_PAD_X = 12;        // marge horizontale d'une pastille de catégorie
const PILL_HEIGHT = 28;
const BRANCH_RADIUS = 150;    // distance du centre aux catégories, au placement initial
const LEAF_RADIUS_RING = 230; // distance du centre aux savoirs, au placement initial
const BOX_GAP = 6;            // écart minimal entre deux emprises
const FIT_MARGIN = 24;        // marge entre la carte et le bord du cadre au cadrage initial
const LAYOUT_TICKS = 300;     // itérations calculées avant le premier affichage
let simulation;

// Écarte deux à deux les emprises qui se chevauchent (écart compris), sur l'axe le moins coûteux.
// Les nœuds fixés (fx) ne bougent pas. Renvoie le nombre de chevauchements traités.
function separateBoxes(items, boxOf, gap, strength) {
    const boxes = items.map(boxOf);
    let overlaps = 0;
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const a = boxes[i], b = boxes[j];
            const overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) + gap;
            const overlapY = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) + gap;
            if (overlapX <= 0 || overlapY <= 0) continue;
            overlaps++;
            const horizontal = overlapX < overlapY;
            const axis = horizontal ? 'x' : 'y';
            const sign = horizontal
                ? Math.sign((a.x0 + a.x1) - (b.x0 + b.x1)) || 1
                : Math.sign((a.y0 + a.y1) - (b.y0 + b.y1)) || 1;
            const push = (horizontal ? overlapX : overlapY) / 2 * strength * sign;
            const fixedI = items[i].fx != null, fixedJ = items[j].fx != null;
            if (!fixedI) items[i][axis] += fixedJ ? 2 * push : push;
            if (!fixedJ) items[j][axis] -= fixedI ? 2 * push : push;
        }
    }
    return overlaps;
}

// Branche courbe d'un parent vers un enfant : départ et arrivée à l'horizontale
function branchPath(l) {
    const s = l.source, t = l.target;
    const mx = (s.x + t.x) / 2;
    return `M${s.x},${s.y} C${mx},${s.y} ${mx},${t.y} ${t.x},${t.y}`;
}

function renderGraph() {
    const container = document.getElementById('mindmap');
    if (!container || typeof d3 === 'undefined') return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const cx = width / 2, cy = height / 2;
    container.innerHTML = '';
    if (simulation) simulation.stop();

    // Regroupement par catégorie
    const infosByCategory = d3.group(data.infos, i => i.category);
    const categories = Array.from(infosByCategory.keys())
        .sort((a, b) => infosByCategory.get(b).length - infosByCategory.get(a).length);

    const nodes = [];
    const links = [];

    // Chaque catégorie reçoit un secteur proportionnel à son nombre de savoirs, ses feuilles s'y répartissent
    const total = data.infos.length;
    let angle = -Math.PI / 2;
    categories.forEach((cat, ci) => {
        const infos = infosByCategory.get(cat);
        const sector = (infos.length / total) * 2 * Math.PI;
        const mid = angle + sector / 2;
        const branch = {
            id: `cat-${ci}`, kind: 'branch', label: cat, angle: mid,
            x: cx + Math.cos(mid) * BRANCH_RADIUS,
            y: cy + Math.sin(mid) * BRANCH_RADIUS
        };
        nodes.push(branch);
        infos.forEach((info, k) => {
            const a = angle + sector * (k + 0.5) / infos.length;
            const leaf = {
                ...info, id: `info-${ci}-${k}`, kind: 'leaf', label: info.title, parent: branch,
                x: cx + Math.cos(a) * LEAF_RADIUS_RING,
                y: cy + Math.sin(a) * LEAF_RADIUS_RING
            };
            nodes.push(leaf);
            links.push({ source: branch, target: leaf });
        });
        angle += sector;
    });

    // Titre d'une feuille du côté opposé à sa catégorie : la branche arrive toujours sur le point
    const isLeft = n => n.x < n.parent.x;

    const zoom = d3.zoom().scaleExtent([0.3, 3]).on('zoom', event => g.attr('transform', event.transform));
    const svg = d3.select('#mindmap').append('svg').call(zoom);
    const g = svg.append('g');
    const linkLayer = g.append('g');
    const nodeLayer = g.append('g');

    const link = linkLayer.selectAll('path')
        .data(links)
        .enter().append('path')
        .attr('class', 'graph__link');

    const leaves = nodes.filter(n => n.kind === 'leaf');
    const hubs = nodes.filter(n => n.kind === 'branch');

    const leaf = nodeLayer.selectAll('g.graph__node')
        .data(leaves)
        .enter().append('g')
        .attr('class', d => `graph__node swatch--${seriesOf(d.source)}`)
        .on('mouseover', showTooltip)
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip)
        .on('click', (event, d) => {
            if (event.defaultPrevented) return; // glissé, pas cliqué
            hideTooltip();
            showNodeDetail(d);
        });

    leaf.append('circle').attr('r', LEAF_RADIUS);
    const leafLabel = leaf.append('text')
        .attr('dy', '.35em')
        .text(d => d.label);

    const hub = nodeLayer.selectAll('g.graph__hub')
        .data(hubs)
        .enter().append('g')
        .attr('class', 'graph__hub');
    const pill = hub.append('rect');
    hub.append('text').attr('dy', '.35em').text(d => d.label);

    // Dimensions réelles des titres, pour les emprises et les pastilles
    leaf.each(function (d) { d.labelWidth = this.querySelector('text').getComputedTextLength(); });
    hub.each(function (d) {
        d.w = this.querySelector('text').getComputedTextLength() + 2 * PILL_PAD_X;
        d.h = PILL_HEIGHT;
    });
    pill
        .attr('x', d => -d.w / 2).attr('y', d => -d.h / 2)
        .attr('width', d => d.w).attr('height', d => d.h);

    // Emprise d'un nœud : pastille, ou point et titre
    function boxOf(n) {
        if (n.kind !== 'leaf') return { x0: n.x - n.w / 2, x1: n.x + n.w / 2, y0: n.y - n.h / 2, y1: n.y + n.h / 2 };
        const reach = LEAF_RADIUS + LABEL_OFFSET + n.labelWidth;
        return isLeft(n)
            ? { x0: n.x - reach, x1: n.x + LEAF_RADIUS, y0: n.y - 10, y1: n.y + 10 }
            : { x0: n.x - LEAF_RADIUS, x1: n.x + reach, y0: n.y - 10, y1: n.y + 10 };
    }

    const separate = strength => separateBoxes(nodes, boxOf, BOX_GAP, strength);

    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).distance(70).strength(0.6))
        .force('charge', d3.forceManyBody().strength(d => d.kind === 'leaf' ? -80 : -400).distanceMax(300))
        // Les catégories restent groupées autour du milieu du cadre, leurs savoirs autour d'elles
        .force('x', d3.forceX(cx).strength(d => d.kind === 'branch' ? 0.08 : 0))
        .force('y', d3.forceY(cy).strength(d => d.kind === 'branch' ? 0.08 : 0))
        .force('boxes', () => separate(0.5))
        .stop();

    // Placement calculé avant l'affichage, puis passes de séparation jusqu'à ce que plus rien ne se chevauche
    simulation.tick(LAYOUT_TICKS);
    for (let pass = 0; pass < 200; pass++) {
        if (separate(1) === 0) break;
    }
    nodes.forEach(n => { n.vx = 0; n.vy = 0; });

    function draw() {
        link.attr('d', branchPath);
        leaf.attr('transform', d => `translate(${d.x},${d.y})`);
        leafLabel
            .attr('dx', d => isLeft(d) ? -(LEAF_RADIUS + LABEL_OFFSET) : LEAF_RADIUS + LABEL_OFFSET)
            .attr('text-anchor', d => isLeft(d) ? 'end' : 'start');
        hub.attr('transform', d => `translate(${d.x},${d.y})`);
    }

    // Cadrage initial : toute la carte visible, sans agrandir au-delà de l'échelle 1
    draw();
    const boxes = nodes.map(boxOf);
    const x0 = d3.min(boxes, b => b.x0), x1 = d3.max(boxes, b => b.x1);
    const y0 = d3.min(boxes, b => b.y0), y1 = d3.max(boxes, b => b.y1);
    const scale = Math.min(1, (width - 2 * FIT_MARGIN) / (x1 - x0), (height - 2 * FIT_MARGIN) / (y1 - y0));
    svg.call(zoom.transform, d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2));

    simulation.on('tick', draw);

    // Glisser une catégorie entraîne ses savoirs
    const drag = d3.drag()
        .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
        });
    leaf.call(drag);
    hub.call(drag);
}

// Infobulle : seules ses coordonnées passent par des propriétés personnalisées
const tooltip = document.getElementById('tooltip');

function showTooltip(event, d) {
    if (!tooltip) return;
    const box = tooltip.parentElement.getBoundingClientRect();
    tooltip.innerHTML = `
        <strong>${escapeHtml(d.title)}</strong>
        <span>${escapeHtml(d.text)}</span>
        <span class="mono">${escapeHtml(d.source)} · ${escapeHtml(d.category)}</span>`;
    tooltip.hidden = false;
    const x = Math.min(event.clientX - box.left + 16, box.width - tooltip.offsetWidth - 8);
    const y = Math.min(event.clientY - box.top + 16, box.height - tooltip.offsetHeight - 8);
    tooltip.style.setProperty('--tip-x', `${Math.max(x, 8)}px`);
    tooltip.style.setProperty('--tip-y', `${Math.max(y, 8)}px`);
}

function hideTooltip() {
    if (tooltip) tooltip.hidden = true;
}

// Met en avant les savoirs d'un contributeur et leurs branches en estompant les autres. null rétablit tout.
function highlightSource(name) {
    d3.selectAll('.graph__node').classed('is-dimmed', d => name !== null && d.source !== name);
    d3.selectAll('.graph__link').classed('is-dimmed', l => name !== null && l.target.source !== name);
}
