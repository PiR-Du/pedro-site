// Global App State and Initialization
let data = { infos: [] };

function initApp() {
    // 1. Try to load from localStorage first
    const localData = localStorage.getItem('encyclopedia_data');
    
    if (localData) {
        data = JSON.parse(localData);
        if (typeof INITIAL_DATA !== 'undefined') {
            INITIAL_DATA.infos.forEach(initialInfo => {
                const exists = data.infos.some(info => 
                    info.title === initialInfo.title && 
                    info.source === initialInfo.source
                );
                if (!exists) data.infos.push(initialInfo);
            });
        }
    } else if (typeof INITIAL_DATA !== 'undefined') {
        data = JSON.parse(JSON.stringify(INITIAL_DATA));
    }
    
    // CRITICAL: Initialize colorScale domain with ALL sorted sources before rendering anything
    if (typeof colorScale !== 'undefined') {
        const allSources = Array.from(new Set(data.infos.map(i => i.source))).sort();
        colorScale.domain(allSources);
    }
    
    saveData();
    onDataLoaded();
}

function saveData() {
    localStorage.setItem('encyclopedia_data', JSON.stringify(data));
}

function onDataLoaded() {
    // This is called when data is ready
    if (typeof renderGraph === 'function') renderGraph();
    if (typeof renderSachants === 'function') renderSachants();
}

// Initial Load
document.addEventListener('DOMContentLoaded', initApp);

window.addEventListener('resize', () => {
    if (typeof renderGraph === 'function') renderGraph();
});

// Sidebar Rendering (Moved from form.js)
function renderSachants() {
    const container = document.getElementById('sachants-container');
    if (!container) return;
    container.innerHTML = '';
    
    const sources = Array.from(new Set(data.infos.map(i => i.source))).sort();

    sources.forEach(s => {
        const count = data.infos.filter(i => i.source === s).length;
        const color = typeof colorScale !== 'undefined' ? colorScale(s) : 'inherit';
        const div = document.createElement('div');
        div.className = 'source-item';
        div.style.color = color;
        div.style.fontWeight = '600';
        div.innerHTML = `<span>${s}</span> <span class="count" style="color:var(--muted-foreground)">${count} infos</span>`;
        div.onclick = () => showProfile(s);
        container.appendChild(div);
    });
}

function showProfile(name) {
    const shell = document.querySelector('.encyclopedia-shell');
    const profileName = document.getElementById('profile-name');
    const profileNotes = document.getElementById('profile-notes');
    const color = typeof colorScale !== 'undefined' ? colorScale(name) : 'inherit';

    shell.classList.add('has-profile');
    
    profileName.innerText = `Profil de ${name}`;
    profileName.style.color = color;
    
    const notes = data.infos.filter(i => i.source === name);
    profileNotes.innerHTML = notes.map(n => `
        <div class="note-card">
            <span class="note-cat" style="color: ${color}">[${n.category}]</span>
            <strong class="note-title">${n.title}</strong>
            <p class="note-text">${n.text}</p>
        </div>
    `).join('');

    if (typeof highlightSource === 'function') highlightSource(name);
}

function closeProfile() {
    const shell = document.querySelector('.encyclopedia-shell');
    shell.classList.remove('has-profile');
    
    d3.selectAll(".node circle, .node text").transition().duration(500).attr("opacity", 1);
}
