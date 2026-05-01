// Mindmap Graph Logic (D3.js) - No Links Version

let simulation;
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

function renderGraph() {
    const container = document.getElementById('mindmap');
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    container.innerHTML = '';

    // Nodes
    const nodes = data.infos.map((info, idx) => ({
        ...info,
        id: `info-${idx}`,
        label: info.title
    }));

    // Grouping for Hulls and Clustering
    const nodesByCategory = {};
    nodes.forEach(node => {
        if (!nodesByCategory[node.category]) nodesByCategory[node.category] = [];
        nodesByCategory[node.category].push(node);
    });

    // Define centers for categories to cluster them naturally
    const categories = Object.keys(nodesByCategory);
    const catCenters = {};
    categories.forEach((cat, i) => {
        const angle = (i / categories.length) * 2 * Math.PI;
        catCenters[cat] = {
            x: width / 2 + Math.cos(angle) * (width / 3.5),
            y: height / 2 + Math.sin(angle) * (height / 3.5)
        };
    });

    const svg = d3.select("#mindmap")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }))
        .append("g");

    const g = svg.append("g");

    // Layers
    const hullLayer = g.append("g").attr("class", "hulls");
    const nodeLayer = g.append("g").attr("class", "nodes");
    const labelLayer = g.append("g").attr("class", "labels");

    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-80))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(25))
        // Clustering force (No visible links)
        .force("x", d3.forceX(d => catCenters[d.category].x).strength(0.12))
        .force("y", d3.forceY(d => catCenters[d.category].y).strength(0.12));

    const node = nodeLayer.selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    node.append("circle")
        .attr("r", 7)
        .attr("fill", d => colorScale(d.source))
        .attr("stroke", "var(--surface)")
        .attr("stroke-width", 1.5);

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(d => d.label)
        .attr("fill", "var(--foreground)")
        .style("font-size", "11px")
        .style("font-weight", "500");

    // Sober Hulls (Clouds)
    const hulls = hullLayer.selectAll("path")
        .data(categories)
        .enter().append("path")
        .attr("fill", "#64748b")
        .attr("fill-opacity", 0.02)
        .attr("stroke", "#64748b")
        .attr("stroke-opacity", 0.05)
        .attr("stroke-width", 35)
        .attr("stroke-linejoin", "round");

    const hullLabels = labelLayer.selectAll("text")
        .data(categories)
        .enter().append("text")
        .text(d => d)
        .attr("fill", "var(--muted-foreground)")
        .attr("fill-opacity", 0.3)
        .attr("font-size", "13px")
        .attr("font-weight", "600")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .style("letter-spacing", "0.1em")
        .style("text-transform", "uppercase");

    simulation.on("tick", () => {
        node.attr("transform", d => `translate(${d.x},${d.y})`);

        hulls.attr("d", d => {
            const groupNodes = nodesByCategory[d];
            const points = groupNodes.map(n => [n.x, n.y]);
            if (points.length < 3) {
                points.push([points[0][0]+1, points[0][1]+1]);
                points.push([points[0][0]-1, points[0][1]-1]);
            }
            const hull = d3.polygonHull(points);
            return hull ? "M" + hull.join("L") + "Z" : null;
        });

        hullLabels
            .attr("x", d => d3.mean(nodesByCategory[d], n => n.x))
            .attr("y", d => {
                const minY = d3.min(nodesByCategory[d], node => node.y);
                return minY - 15; 
            });
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

const tooltip = document.getElementById('tooltip');
function showTooltip(event, d) {
    if (!tooltip) return;
    tooltip.style.opacity = '1';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
    
    tooltip.innerHTML = `
        <h4 style="color:${colorScale(d.source)}">${d.title}</h4>
        <p style="font-size:0.8rem; margin-top:0.25rem;">${d.text}</p>
        <div style="display:flex; justify-content:space-between; margin-top:0.75rem; font-size:0.7rem; color:var(--muted-foreground);">
            <span>Par: ${d.source}</span>
            <span style="background:var(--surface-soft); padding:0 4px; border-radius:3px;">${d.category}</span>
        </div>
    `;
}
function hideTooltip() { if (tooltip) tooltip.style.opacity = '0'; }

function highlightSource(name) {
    d3.selectAll(".node circle").transition().duration(200).attr("opacity", 0.2);
    d3.selectAll(".node text").transition().duration(200).attr("opacity", 0.2);

    d3.selectAll(".node")
        .filter(d => d.source === name)
        .selectAll("circle, text")
        .transition().duration(500)
        .attr("opacity", 1)
        .attr("r", 15);
    
    setTimeout(() => {
        d3.selectAll(".node circle").transition().duration(500).attr("opacity", 1).attr("r", 7);
        d3.selectAll(".node text").transition().duration(500).attr("opacity", 1);
    }, 5000);
}
