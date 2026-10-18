// Applique le thème choisi avant le premier rendu (script classique, chargé dans <head>).
// Sans choix enregistré, le site est en clair, quelle que soit la préférence système.
(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  } catch (e) { /* stockage indisponible : thème clair */ }
})();
