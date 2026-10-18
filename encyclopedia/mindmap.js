// Carte mentale (D3.js) : nœuds regroupés par catégorie, sans liens.
// Toute l'apparence vient du CSS (.graph__*) : ce fichier ne pose que des classes et des positions.

const NODE_SIZE = 12;
const ZONE_PADDING = 16;     // marge intérieure d'une zone de catégorie
const ZONE_LABEL_SPACE = 20; // hauteur réservée à l'intitulé, posé au-dessus de la zone
const ZONE_GAP = 24;         // écart minimal entre deux zones
const NODE_GAP = 8;          // écart minimal entre deux titres d'une même zone
const FIT_MARGIN = 24;       // marge entre les zones et le bord du cadre au cadrage initial
const LAYOUT_TICKS = 300;    // itérations calculées avant le premier affichage
let simulation;

// Écarte deux à deux les emprises qui se chevauchent (écart compris), sur l'axe le moins coûteux.
// groupOf donne les nœuds déplacés d'un bloc. Renvoie le nombre de chevauchements traités.
function separateBoxes(items, boxOf, groupOf, gap, strength) {
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
            groupOf(items[i]).forEach(n => { n[axis] += push; });
            groupOf(items[j]).forEach(n => { n[axis] -= push; });
        }
    }
    return overlaps;
}

function renderGraph() {
    const container = document.getElementById('mindmap');
    if (!container || typeof d3 === 'undefined') return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    container.innerHTML = '';
    if (simulation) simulation.stop();

    const nodes = data.infos.map((info, idx) => ({ ...info, id: `info-${idx}`, label: info.title }));

    // Regroupement par catégorie, pour les zones et l'attraction
    const nodesByCategory = {};
    nodes.forEach(node => {
        (nodesByCategory[node.category] = nodesByCategory[node.category] || []).push(node);
    });

    // Un centre par catégorie, réparti sur un cercle ; chaque nœud part de son centre
    const categories = Object.keys(nodesByCategory);
    const catCenters = {};
    categories.forEach((cat, i) => {
        const angle = (i / categories.length) * 2 * Math.PI;
        catCenters[cat] = {
            x: width / 2 + Math.cos(angle) * (width / 3.5),
            y: height / 2 + Math.sin(angle) * (height / 3.5)
        };
    });
    nodes.forEach((n, i) => {
        n.x = catCenters[n.category].x + Math.cos(i) * NODE_SIZE;
        n.y = catCenters[n.category].y + Math.sin(i) * NODE_SIZE;
    });

    const zoom = d3.zoom().on('zoom', event => g.attr('transform', event.transform));
    const svg = d3.select('#mindmap')
        .append('svg')
        .call(zoom);

    const g = svg.append('g');
    const hullLayer = g.append('g');
    const nodeLayer = g.append('g');
    const labelLayer = g.append('g');

    const node = nodeLayer.selectAll('g')
        .data(nodes)
        .enter().append('g')
        .attr('class', d => `graph__node swatch--${seriesOf(d.source)}`)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .on('mouseover', showTooltip)
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip)
        .on('click', (event, d) => {
            if (event.defaultPrevented) return; // glissé, pas cliqué
            hideTooltip();
            showNodeDetail(d);
        });

    node.append('rect')
        .attr('x', -NODE_SIZE / 2)
        .attr('y', -NODE_SIZE / 2)
        .attr('width', NODE_SIZE)
        .attr('height', NODE_SIZE);

    node.append('text')
        .attr('dx', NODE_SIZE)
        .attr('dy', '.35em')
        .text(d => d.label);

    // Largeur réelle du titre, pour que la zone englobe le texte et pas seulement le carré
    node.each(function (d) { d.labelWidth = this.querySelector('text').getComputedTextLength(); });

    const hulls = hullLayer.selectAll('rect')
        .data(categories)
        .enter().append('rect')
        .attr('class', 'graph__hull');

    const hullLabels = labelLayer.selectAll('text')
        .data(categories)
        .enter().append('text')
        .attr('class', 'graph__hull-label')
        .text(d => d);

    // Largeur minimale d'une zone : celle de son intitulé
    const catLabelWidth = {};
    hullLabels.each(function (d) { catLabelWidth[d] = this.getComputedTextLength(); });

    // Emprise d'un nœud : son carré et son titre
    function nodeBox(n) {
        return {
            x0: n.x - NODE_SIZE / 2,
            x1: n.x + NODE_SIZE + n.labelWidth,
            y0: n.y - NODE_SIZE,
            y1: n.y + NODE_SIZE
        };
    }

    // Zone d'une catégorie : rectangle englobant ses nœuds et leurs titres, avec une marge,
    // au moins aussi large que son intitulé
    function categoryBox(cat) {
        const members = nodesByCategory[cat];
        const x0 = d3.min(members, n => n.x - NODE_SIZE / 2) - ZONE_PADDING;
        const x1 = Math.max(
            d3.max(members, n => n.x + NODE_SIZE + n.labelWidth) + ZONE_PADDING,
            x0 + catLabelWidth[cat]
        );
        const y0 = d3.min(members, n => n.y - NODE_SIZE / 2) - ZONE_PADDING;
        const y1 = d3.max(members, n => n.y + NODE_SIZE / 2) + ZONE_PADDING;
        return { x0, x1, y0, y1 };
    }

    // Emprise totale : la zone et son intitulé au-dessus, pour l'écartement et le cadrage
    function categoryExtent(cat) {
        const box = categoryBox(cat);
        return { ...box, y0: box.y0 - ZONE_LABEL_SPACE };
    }

    const separateNodes = strength => separateBoxes(nodes, nodeBox, n => [n], NODE_GAP, strength);
    const separateZones = strength => separateBoxes(categories, categoryExtent, cat => nodesByCategory[cat], ZONE_GAP, strength);

    simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-40))
        .force('x', d3.forceX(d => catCenters[d.category].x).strength(0.1))
        .force('y', d3.forceY(d => catCenters[d.category].y).strength(0.1))
        .force('nodes', () => separateNodes(0.5))
        .force('zones', () => separateZones(0.5))
        .stop();

    // Placement calculé avant l'affichage, puis passes de séparation jusqu'à ce que plus rien ne se chevauche
    simulation.tick(LAYOUT_TICKS);
    for (let pass = 0; pass < 200; pass++) {
        if (separateNodes(1) + separateZones(1) === 0) break;
    }
    nodes.forEach(n => { n.vx = 0; n.vy = 0; });

    function draw() {
        node.attr('transform', d => `translate(${d.x},${d.y})`);

        const boxes = Object.fromEntries(categories.map(cat => [cat, categoryBox(cat)]));
        hulls
            .attr('x', d => boxes[d].x0)
            .attr('y', d => boxes[d].y0)
            .attr('width', d => boxes[d].x1 - boxes[d].x0)
            .attr('height', d => boxes[d].y1 - boxes[d].y0);

        // Intitulé en drapeau, juste au-dessus de l'angle haut gauche de la zone
        hullLabels
            .attr('x', d => boxes[d].x0)
            .attr('y', d => boxes[d].y0 - ZONE_LABEL_SPACE);
    }

    // Cadrage initial : toutes les zones et leurs intitulés visibles, sans agrandir au-delà de l'échelle 1
    draw();
    const boxes = categories.map(categoryExtent);
    const x0 = d3.min(boxes, b => b.x0), x1 = d3.max(boxes, b => b.x1);
    const y0 = d3.min(boxes, b => b.y0), y1 = d3.max(boxes, b => b.y1);
    const scale = Math.min(1, (width - 2 * FIT_MARGIN) / (x1 - x0), (height - 2 * FIT_MARGIN) / (y1 - y0));
    svg.call(zoom.transform, d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2));

    simulation.on('tick', draw);

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
    }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
    }
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

// Met en avant les nœuds d'un contributeur en estompant les autres. null rétablit tout.
function highlightSource(name) {
    d3.selectAll('.graph__node').classed('is-dimmed', d => name !== null && d.source !== name);
}
