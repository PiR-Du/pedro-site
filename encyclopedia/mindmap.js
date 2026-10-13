// Carte mentale (D3.js) : nœuds regroupés par catégorie, sans liens.
// Toute l'apparence vient du CSS (.graph__*) : ce fichier ne pose que des classes et des positions.

const NODE_SIZE = 12;
let simulation;

function renderGraph() {
    const container = document.getElementById('mindmap');
    if (!container || typeof d3 === 'undefined') return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    container.innerHTML = '';
    if (simulation) simulation.stop();

    const nodes = data.infos.map((info, idx) => ({ ...info, id: `info-${idx}`, label: info.title }));

    // Regroupement par catégorie, pour les enveloppes et l'attraction
    const nodesByCategory = {};
    nodes.forEach(node => {
        (nodesByCategory[node.category] = nodesByCategory[node.category] || []).push(node);
    });

    // Un centre par catégorie, réparti sur un cercle
    const categories = Object.keys(nodesByCategory);
    const catCenters = {};
    categories.forEach((cat, i) => {
        const angle = (i / categories.length) * 2 * Math.PI;
        catCenters[cat] = {
            x: width / 2 + Math.cos(angle) * (width / 3.5),
            y: height / 2 + Math.sin(angle) * (height / 3.5)
        };
    });

    const svg = d3.select('#mindmap')
        .append('svg')
        .call(d3.zoom().on('zoom', event => g.attr('transform', event.transform)));

    const g = svg.append('g');
    const hullLayer = g.append('g');
    const nodeLayer = g.append('g');
    const labelLayer = g.append('g');

    simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-80))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(28))
        .force('x', d3.forceX(d => catCenters[d.category].x).strength(0.12))
        .force('y', d3.forceY(d => catCenters[d.category].y).strength(0.12));

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

    const hulls = hullLayer.selectAll('path')
        .data(categories)
        .enter().append('path')
        .attr('class', 'graph__hull');

    const hullLabels = labelLayer.selectAll('text')
        .data(categories)
        .enter().append('text')
        .attr('class', 'graph__hull-label')
        .text(d => d);

    simulation.on('tick', () => {
        node.attr('transform', d => `translate(${d.x},${d.y})`);

        hulls.attr('d', d => {
            const points = nodesByCategory[d].map(n => [n.x, n.y]);
            if (points.length < 3) {
                points.push([points[0][0] + 1, points[0][1] + 1]);
                points.push([points[0][0] - 1, points[0][1] - 1]);
            }
            const hull = d3.polygonHull(points);
            return hull ? 'M' + hull.join('L') + 'Z' : null;
        });

        hullLabels
            .attr('x', d => d3.mean(nodesByCategory[d], n => n.x))
            .attr('y', d => d3.min(nodesByCategory[d], n => n.y) - 24);
    });

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
