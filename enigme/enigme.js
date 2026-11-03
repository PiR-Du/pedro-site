// Moteur du Cahier d'épreuves : validation d'un mot, adresse, texte voilé.

// DEBUT-REFERENCE
const LONGUEUR_DOSSIER = 12;
const CLE_VOILE = 0x5a;

function normaliser(saisie) {
  return saisie
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function nomDossier(saisie) {
  const octets = new TextEncoder().encode(normaliser(saisie));
  const empreinte = await crypto.subtle.digest('SHA-256', octets);
  const hexa = [...new Uint8Array(empreinte)].map(o => o.toString(16).padStart(2, '0')).join('');
  return hexa.slice(0, LONGUEUR_DOSSIER);
}

function devoiler(valeur) {
  const octets = Uint8Array.from(atob(valeur), c => c.charCodeAt(0) ^ CLE_VOILE);
  return new TextDecoder().decode(octets);
}
// FIN-REFERENCE

const MESSAGE_REFUS = "Erreur : ce mot n'ouvre aucune page.";
const MESSAGE_RESEAU = 'Erreur : le réseau ne répond pas, réessayez.';

function afficherErreur(form, message) {
  const champ = form.querySelector('.field');
  const erreur = form.querySelector('.error');
  erreur.textContent = message;
  erreur.hidden = false;
  champ.classList.add('field--invalid');
}

function effacerErreur(form) {
  const champ = form.querySelector('.field');
  const erreur = form.querySelector('.error');
  erreur.textContent = '';
  erreur.hidden = true;
  champ.classList.remove('field--invalid');
}

function initFormulaire(form) {
  const saisie = form.querySelector('input[name="mot"]');
  const racine = form.dataset.racine;

  saisie.addEventListener('input', () => effacerErreur(form));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    effacerErreur(form);
    if (normaliser(saisie.value) === '') {
      afficherErreur(form, MESSAGE_REFUS);
      return;
    }
    try {
      const nom = await nomDossier(saisie.value);
      const reponse = await fetch(racine + nom + '/', { method: 'HEAD', cache: 'no-store' });
      if (reponse.ok) {
        location.href = racine + nom + '/';
      } else {
        afficherErreur(form, MESSAGE_REFUS);
      }
    } catch (e) {
      afficherErreur(form, MESSAGE_RESEAU);
    }
  });
}

function initAdresse() {
  const adresse = document.body.dataset.adresse;
  if (adresse) history.replaceState(null, '', location.pathname + adresse);
}

function initVoiles() {
  document.querySelectorAll('[data-voile]').forEach(el => {
    const texte = el.querySelector('.voile__texte');
    texte.textContent = devoiler(el.dataset.voile);
    el.addEventListener('click', () => el.classList.toggle('is-devoile'));
  });
}

document.querySelectorAll('[data-enigme]').forEach(initFormulaire);
initAdresse();
initVoiles();
