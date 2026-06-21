const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
let currentMode = 'meal';

function init() {
  const ingredients = new Set();
  MEALS.forEach(m => m.ingredients.forEach(i => ingredients.add(i)));
  window.allIngredients = Array.from(ingredients).sort();
  setMode('meal');
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });

  const container = document.getElementById('selectors-container');
  const label = document.getElementById('select-label');
  container.innerHTML = '';

  if (mode === 'meal') {
    label.textContent = "Quel plat vous fait envie ?";
    const select = document.createElement('select');
    select.id = 'main-select';
    MEALS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.title;
      select.appendChild(opt);
    });
    container.appendChild(select);
  } else {
    label.textContent = "De quels ingrédients disposez-vous ? (choisissez-en jusqu'à 3)";
    for (let i = 0; i < 3; i++) {
      const select = document.createElement('select');
      select.className = 'ingredient-select';
      const emptyOpt = document.createElement('option');
      emptyOpt.value = "";
      emptyOpt.textContent = "-- Choisir un ingrédient --";
      select.appendChild(emptyOpt);
      window.allIngredients.forEach(ing => {
        const opt = document.createElement('option');
        opt.value = ing;
        opt.textContent = ing.charAt(0).toUpperCase() + ing.slice(1);
        select.appendChild(opt);
      });
      container.appendChild(select);
    }
  }
}

function generatePlan() {
  let plan = [];

  if (currentMode === 'meal') {
    const select = document.getElementById('main-select');
    const anchor = MEALS.find(m => m.id == select.value);
    if (!anchor) return;
    plan.push(anchor);
    const others = MEALS
      .filter(m => m.id != anchor.id)
      .map(m => ({ ...m, score: m.ingredients.filter(i => anchor.ingredients.includes(i)).length }))
      .sort((a, b) => b.score - a.score);
    plan.push(...others.slice(0, 4));
  } else {
    const selects = document.querySelectorAll('.ingredient-select');
    const selected = Array.from(selects).map(s => s.value).filter(v => v !== "");
    if (selected.length === 0) {
      if (typeof showToast === 'function') showToast('Choisissez au moins un ingrédient.', 'error');
      else alert('Choisissez au moins un ingrédient.');
      return;
    }
    plan = MEALS
      .map(m => ({ ...m, score: selected.filter(si => m.ingredients.includes(si)).length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  renderPlan(plan);
}

function renderPlan(plan) {
  const container = document.getElementById('plan-result');
  container.innerHTML = '';

  const sharedIngredients = getSharedIngredients(plan);

  plan.forEach((meal, i) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `
      <div class="day-label">${DAYS[i]}</div>
      <div class="meal-info">
        <h3>${meal.title}</h3>
        <p class="meal-ingredients">${meal.ingredients.join(' · ')}</p>
      </div>`;
    container.appendChild(card);
  });

  if (sharedIngredients.length > 0) {
    const summary = document.createElement('div');
    summary.className = 'batch-shared-summary';
    summary.innerHTML = `
      <p class="eyebrow" style="margin-bottom:0.5rem;">Ingrédients mutualisés</p>
      <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
        ${sharedIngredients.map(i => `<span class="lp-tech-tag">${i}</span>`).join('')}
      </div>`;
    container.appendChild(summary);
  }

  container.scrollIntoView({ behavior: 'smooth' });
}

function getSharedIngredients(plan) {
  if (plan.length < 2) return [];
  const counts = {};
  plan.forEach(meal => {
    meal.ingredients.forEach(ing => {
      counts[ing] = (counts[ing] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([ing]) => ing);
}

document.addEventListener('DOMContentLoaded', init);
