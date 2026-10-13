const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
let currentMode = 'meal';
let allIngredients = [];

function init() {
  const ingredients = new Set();
  MEALS.forEach(m => m.ingredients.forEach(i => ingredients.add(i)));
  allIngredients = Array.from(ingredients).sort();
  setMode('meal');

  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });
  document.getElementById('plan-form').addEventListener('submit', e => {
    e.preventDefault();
    generatePlan();
  });
}

function makeSelect(id, label, options, placeholder) {
  const select = document.createElement('select');
  select.className = 'select';
  select.id = id;
  select.setAttribute('aria-label', label);
  if (placeholder) select.add(new Option(placeholder, ''));
  options.forEach(([value, text]) => select.add(new Option(text, value)));
  return select;
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('[data-mode]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
  });

  const container = document.getElementById('selectors-container');
  const label = document.getElementById('select-label');
  container.innerHTML = '';

  if (mode === 'meal') {
    label.textContent = "Quel plat vous fait envie ?";
    container.appendChild(makeSelect('main-select', 'Plat de départ', MEALS.map(m => [m.id, m.title])));
  } else {
    label.textContent = "De quels ingrédients disposez-vous ? (jusqu'à trois)";
    const options = allIngredients.map(ing => [ing, ing.charAt(0).toUpperCase() + ing.slice(1)]);
    for (let i = 0; i < 3; i++) {
      const select = makeSelect(`ingredient-${i + 1}`, `Ingrédient ${i + 1}`, options, 'Choisir un ingrédient');
      select.classList.add('ingredient-select');
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
    const selected = Array.from(document.querySelectorAll('.ingredient-select')).map(s => s.value).filter(Boolean);
    if (selected.length === 0) {
      showToast('Choisissez au moins un ingrédient.', 'error');
      document.querySelector('.ingredient-select').focus();
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
  const shared = getSharedIngredients(plan);

  container.innerHTML = `
    <ol class="plan">
      ${plan.map((meal, i) => `
      <li class="plan__day">
        <span class="eyebrow">${DAYS[i]}</span>
        <h3 class="plan__meal">${escapeHtml(meal.title)}</h3>
        <p class="plan__ingredients">${meal.ingredients.map(escapeHtml).join(', ')}</p>
      </li>`).join('')}
    </ol>
    ${shared.length ? `
    <div class="drawer__section">
      <h3 class="eyebrow">Ingrédients mutualisés</h3>
      <div class="cluster cluster--1">${shared.map(i => `<span class="tag">${escapeHtml(i)}</span>`).join('')}</div>
    </div>` : ''}`;

  const title = document.getElementById('plan-title');
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  title.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  title.focus({ preventScroll: true });
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
