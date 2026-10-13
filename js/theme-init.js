// Applique le thème choisi avant le premier rendu (script classique, chargé dans <head>).
// Sans choix enregistré, la préférence système s'applique via color-scheme.
(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  } catch (e) { /* stockage indisponible : préférence système */ }
})();
