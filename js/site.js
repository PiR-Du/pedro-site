// Fonctions partagées par les pages outils.
// Script classique : les scripts de page (app.js) s'appuient sur ces globales.

const FORMSPREE_ID = 'meenoaez';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Couleur résolue d'un token (les bibliothèques de dessin ne lisent pas les variables CSS).
function cssColor(token) {
  const probe = document.createElement('span');
  probe.className = 'color-probe';
  probe.style.setProperty('color', `var(${token})`);
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

// ---------- Messages éphémères ----------

function showToast(message, type = 'default', duration = 3200) {
  let region = document.getElementById('toast-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'toast-region';
    region.className = 'toast-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  const toast = document.createElement('p');
  toast.className = 'toast' + (type === 'error' ? ' toast--error' : '');
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---------- Tiroir de détail (<dialog class="drawer" id="detail-drawer">) ----------

function openDrawer(html) {
  const drawer = document.getElementById('detail-drawer');
  if (!drawer) return;
  drawer.querySelector('.drawer__content').innerHTML = html;
  if (!drawer.open) drawer.showModal();
  drawer.scrollTop = 0;
}

function closeDrawer() {
  const drawer = document.getElementById('detail-drawer');
  if (drawer && drawer.open) drawer.close();
}

document.addEventListener('click', e => {
  // Clic sur le fond d'un <dialog> : la cible est le dialogue lui-même
  if (e.target instanceof HTMLDialogElement && e.target.hasAttribute('data-dismissable')) e.target.close();
  const closer = e.target.closest('[data-close-dialog]');
  if (closer) closer.closest('dialog')?.close();
});

// ---------- Formulaires de contribution (<form data-contribute="outil">) ----------

function setFieldError(control, message) {
  const field = control.closest('.field');
  if (!field) return;
  let error = field.querySelector('.error');
  if (!message) {
    field.classList.remove('field--invalid');
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
    if (error) error.remove();
    return;
  }
  if (!error) {
    error = document.createElement('p');
    error.className = 'error';
    error.id = `${control.id}-error`;
    field.appendChild(error);
  }
  error.textContent = message;
  field.classList.add('field--invalid');
  control.setAttribute('aria-invalid', 'true');
  control.setAttribute('aria-describedby', error.id);
}

function readContribution(form) {
  const data = {};
  let firstInvalid = null;
  form.querySelectorAll('[name]').forEach(control => {
    const raw = control.value.trim();
    let message = '';
    if (control.required && !raw) message = 'Erreur : ce champ est obligatoire.';
    else if (raw && control.type === 'url' && !control.checkValidity()) message = "Erreur : l'adresse doit commencer par https://";
    setFieldError(control, message);
    if (message && !firstInvalid) firstInvalid = control;

    if (control.hasAttribute('data-split')) {
      let list = raw.split(',').map(s => s.trim()).filter(Boolean);
      if (control.hasAttribute('data-lower')) list = list.map(s => s.toLowerCase());
      data[control.name] = list.length || !control.dataset.default ? list : [control.dataset.default];
    } else {
      data[control.name] = raw || control.dataset.default || '';
    }
  });
  if (firstInvalid) { firstInvalid.focus(); return null; }
  return data;
}

async function sendContribution(tool, data, button) {
  const label = button ? button.textContent : '';
  if (button) { button.disabled = true; button.textContent = 'Envoi en cours'; }
  try {
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: `Nouvelle contribution : ${tool}`, tool, ...data })
    });
    if (!response.ok) throw new Error('Erreur Formspree');
    return true;
  } catch (err) {
    console.error(err);
    showToast("Erreur lors de l'envoi. Réessayez plus tard.", 'error');
    return false;
  } finally {
    if (button) { button.disabled = false; button.textContent = label; }
  }
}

document.addEventListener('submit', async e => {
  const form = e.target.closest('form[data-contribute]');
  if (!form) return;
  e.preventDefault();
  const data = readContribution(form);
  if (!data) return;
  const ok = await sendContribution(form.dataset.contribute, data, form.querySelector('[type="submit"]'));
  if (!ok) return;
  const title = data[form.dataset.labelField || 'title'];
  form.reset();
  form.closest('details')?.removeAttribute('open');
  showToast(`« ${title} » envoyé, merci.`);
});

document.addEventListener('input', e => {
  if (e.target.matches('form[data-contribute] [aria-invalid="true"]')) setFieldError(e.target, '');
});
