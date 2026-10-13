# Audit UI/UX du site

Date : 13 octobre 2026. Périmètre : 8 pages, `style.css`, `shared-layout.js`, 7 scripts de page.
État audité : commit `7ad93ff` (branche `main`).

Méthode : lecture du code, extraction statique automatisée de `style.css` (tailles, couleurs, espacements, classes mortes), captures Playwright aux trois largeurs (`audit/before/`), Lighthouse sur les 8 pages (`audit/before/lighthouse/summary.json`), `html-validate`, calcul des contrastes WCAG à partir des valeurs `oklch` converties en sRGB.

Gravité : **critique** (bloque un usage ou viole une règle non négociable), **majeur** (dégrade nettement l'expérience ou la maintenance), **mineur** (finition).

---

## 0. Inventaire

### Pages

| N° | Fichier | Rôle | Dépendances externes |
|---|---|---|---|
| 00 | `index.html` | Accueil : titre, 5 compteurs, 7 liens vers les outils | aucune |
| 01 | `mediatheque/index.html` | Recommandations culturelles filtrables, tiroir de détail, formulaire | aucune |
| 02 | `ville/index.html` | Carte et liste de lieux, filtres, tiroir, formulaire | Leaflet 1.9.4 (unpkg), tuiles CARTO |
| 03 | `encyclopedia/index.html` | Carte mentale D3, panneau de profil, formulaire | D3 v7 (d3js.org) |
| 04 | `batch-cooking/index.html` | Générateur de plan de repas, formulaire | aucune |
| 05 | `score/index.html` | Suivi de scores (5 vues, graphiques, trophées, `localStorage`) | Chart.js 4.4.1 (cdnjs) |
| 06 | `sudoku/sudoku.html` | Solveur Python dans le navigateur | Pyodide 0.25.1 (jsDelivr) |
| 07 | `web/index.html` | Sélection de sites, filtres, tiroir, formulaire | aucune |

### Feuilles de style et ordre de chargement

1. `style.css?v=7` : 3 584 lignes, 114 Ko, 841 règles, un seul fichier pour tout le site.
2. Google Fonts : Inter (400, 500, 600, parfois 700), Instrument Serif (romain et italique), JetBrains Mono (400, 500). Chargée **après** `style.css`, sans `preconnect`.
3. `leaflet.css` sur la page ville uniquement.

### Scripts

| Fichier | Rôle |
|---|---|
| `shared-layout.js` | Injecte header et footer par `outerHTML` au `DOMContentLoaded`, gère les menus, les panneaux de contribution, l'envoi Formspree et les toasts |
| `*/data.js` | Données en variables globales (`MEDIA`, `PLACES`, `MEALS`, `INITIAL_DATA`, `SITES`) |
| `*/app.js` | Logique de chaque page. `score/app.js` pèse 47 Ko (1 208 lignes) |
| Scripts inline | 6 pages portent un bloc `<script>` de soumission de formulaire quasi identique ; l'accueil porte le compteur |

### Blocs récurrents (HTML dupliqué)

| Bloc | Occurrences | Forme actuelle |
|---|---|---|
| Header et navigation | 8 | Injecté par JS dans `<div id="site-header">`, absent sans JS |
| Footer | 8 | Idem |
| En-tête de page (folio, filet, titre, chapô) | 6 + 1 variante (`welcome-hero`) | HTML copié, avec styles inline correctifs sur sudoku et encyclopédie |
| Formulaire de contribution (déclencheur, panneau, champs, note) | 5 | HTML copié, 5 fonctions `submit…` presque identiques |
| Tiroir de détail | 3 | HTML copié, 3 implémentations JS dont une sans gestion du focus |
| Barre latérale de filtres | 3 | HTML copié |
| Balise `<link>` Google Fonts | 8 | Copiée avec des graisses différentes selon les pages |

Aucune image, aucune icône fichier, aucune police locale. Pas de favicon (404 sur chaque page).

---

## 1. Hiérarchie visuelle

| Constat | Gravité | Correction prévue |
|---|---|---|
| Sur l'accueil, les 7 outils ont tous le même poids : même taille de titre, même cadre, grille 2 × 4 avec une case vide. Rien n'indique par où commencer. | Majeur | Liste éditoriale numérotée pleine largeur, un outil par ligne, folio, titre fort, descriptif, donnée vivante alignée à droite. |
| Les 5 compteurs sont le contenu le plus vivant de la page et sont composés en 20 px monospace. | Majeur | Grands chiffres (`--text-6xl`) traités comme des titres d'affiche. |
| Le manifeste de l'accueil (« Connaissances, outils et curiosités ») est en 11,2 px capitales monospace : le deuxième niveau de lecture est le plus petit texte de la page. | Majeur | Chapô en `--text-lg`, placé en colonnes 7 à 12 face au titre. |
| Pages outils : l'en-tête occupe 420 px de haut avant le premier contrôle utile (ville, médiathèque). Sur mobile, l'outil commence sous la ligne de flottaison. | Majeur | En-tête compact sur deux colonnes asymétriques : titre à gauche, chapô et compteur à droite. |
| Médiathèque : 58 cartes identiques sur 3 colonnes, 4 700 px de défilement, pastille violette pleine sur chaque carte. L'œil n'a aucun point d'ancrage. | Majeur | Tableau typographique : une ligne par œuvre, colonnes type, titre, genre, contributeur. |
| Score : 6 panneaux encadrés de même poids (classement, stats, graphique, historique, saisie). L'action principale (saisir une manche) n'est pas dominante. | Majeur | Saisie en colonne dominante à gauche, classement en grands chiffres, le reste en tableaux sans cadre. |
| Encyclopédie : pas de `<h1>`, le titre de page est un `<h2>` de 20 px dans la barre latérale. | Majeur | En-tête de page commun avec `<h1>`. |

## 2. Typographie

| Constat | Gravité | Correction prévue |
|---|---|---|
| **3 familles** (Inter, Instrument Serif, JetBrains Mono). Le serif porte tous les titres, ce qui contredit le parti pris suisse annoncé dans les commentaires du CSS. | Majeur | Inter seule pour titres et texte, JetBrains Mono pour folios et détails techniques. |
| **53 tailles de police distinctes** dans `style.css`, dont 15 `clamp()` différents pour des titres de même rôle. Aucune échelle : 0,58 / 0,6 / 0,625 / 0,63 / 0,65 / 0,67 / 0,68 / 0,6875 / 0,7 / 0,72 / 0,75 rem coexistent. | Critique | Échelle modulaire Major Third (1,25), 11 paliers en tokens. |
| Tailles sous 12 px : 0,58 rem (9,3 px), 0,6 rem (9,6 px, 9 occurrences), 0,625 rem, 0,63 rem, `10px`. Folios, compteurs, pieds de carte. | Critique | Plancher à `--text-sm` (12,8 px). |
| 19 interlignages distincts (0,94 à 1,85), 17 interlettrages distincts. | Majeur | 4 interlignages de texte en multiples de 4 px, 2 ratios pour les titres, 4 interlettrages. |
| 6 graisses déclarées (400 à 800) alors que 700 n'est chargée que sur 3 pages et 800 jamais : ailleurs, le navigateur synthétise un faux gras. | Majeur | Inter variable auto-hébergée, 3 graisses : 400, 500, 700. |
| Longueur de ligne : chapô à `38rem` en 17 px, environ 78 caractères, au-dessus de la cible. Descriptions de cartes non plafonnées. Tiroir de détail : environ 50 caractères, correct. | Mineur | Token `--measure: 68ch` appliqué à tous les paragraphes. |
| `font-family` écrit en dur 31 fois (`'JetBrains Mono', monospace`) à côté de la variable `--font-mono` (27 fois). | Mineur | Token unique. |
| Polices chargées depuis Google Fonts sans `preconnect`, feuille bloquante, 3 familles. | Majeur | 2 fichiers `woff2` locaux (48 Ko et 40 Ko), `font-display: swap`, `preload` d'Inter. |

## 3. Grille et alignements

| Constat | Gravité | Correction prévue |
|---|---|---|
| **Aucune grille commune.** 32 valeurs de `max-width` distinctes, dont 7 largeurs de conteneur différentes selon les pages : 72 rem (accueil), 1600 px (médiathèque, ville, web), 800 px (batch), 48 rem, 56 rem, 64 rem et 72 rem selon la vue (score), pleine largeur (encyclopédie). Le bord gauche du contenu saute d'une page à l'autre (visible en comparant `ville-desktop.png` : en-tête à 144 px, contenu à 24 px). | Critique | Un conteneur unique (`--container-max`), 12 / 8 / 4 colonnes, marges en tokens. |
| **45 valeurs d'espacement distinctes** en `margin` et `padding`. 243 occurrences sur 469 (52 %) sont hors grille de 8, 111 sont hors grille de 4 (0,35 / 0,45 / 0,55 / 0,6 / 0,65 / 0,7 / 0,85 / 0,95 / 1,1 / 1,15 rem). | Critique | 11 paliers de 8 à 160 px, plus un demi-palier de 4 px. |
| 22 valeurs de `gap`, dont 0,35 / 0,4 / 0,45 / 0,55 rem. | Majeur | Mêmes tokens. |
| 21 requêtes média avec 13 points de rupture différents (480, 600, 639, 640, 700, 760, 767, 768, 799, 800, 850, 900, 960, 980, 1080 px). | Majeur | 2 points de rupture : 768 px et 1024 px. |
| Accueil : la grille des outils sort du conteneur de 44 px de chaque côté (les filets horizontaux dépassent l'alignement du titre). | Mineur | Tout le contenu dans la même boîte. |
| Ville : barre d'ambiances centrée sous un en-tête ferré à gauche. Score, vue résultats : tout est centré. | Mineur | Ferré à gauche partout, asymétrie assumée. |
| 6 échelles de `z-index` sans logique (1, 40, 100, 150, 200, 1000). | Mineur | 4 tokens d'empilement. |

## 4. Couleurs

### Palette réelle

63 couleurs littérales dans `style.css`, auxquelles s'ajoutent 34 couleurs hexadécimales codées en dur dans les scripts (`ville/app.js` : 13 types de lieux, `score/app.js` : 8 joueurs, `mindmap.js` : `d3.schemeTableau10` et `#64748b`).

| Rôle | Clair | Sombre |
|---|---|---|
| Fond | `#F5F1E9` ivoire chaud | `#030301` |
| Surface | `#FAF8F2`, `#F1EDE5` | `#111`, `#1A1A18` environ |
| Texte | `#060402` | `#EFEDE5` |
| Texte atténué | `#6A6259` | `#969289` |
| Accent | `#6A0ECE` violet | `#945FF9` violet clair |
| Bordure | `#DBD7CF`, `#BCB7AC` | `#211F1B` |
| Bandeaux de page | 6 dégradés de teintes différentes (violet, cyan, ambre, vert, orange, rose) | idem |

Répartition : le fond occupe bien environ 60 %, mais l'accent violet est dispersé (pastilles pleines, fonds lilas, bordures, textes de 9 px) et concurrencé par 6 autres teintes de bandeau et jusqu'à 13 couleurs de marqueurs.

### Contrastes mesurés

| Couple | Ratio | Verdict |
|---|---|---|
| Texte sur fond (clair) | 18,2 | AAA |
| Texte atténué sur fond (clair) | 5,36 | AA, mais sous le seuil AAA visé pour le corps de texte |
| Violet sur fond | 7,30 | AAA en ratio, mais utilisé à 9,3 px |
| Succès sur fond | 4,49 | **Échec AA** pour du texte courant |
| Flèche des cartes d'accueil (`--border-strong`) | 1,78 | **Échec** (3:1 requis) |
| Bordure des champs sur fond | 1,28 | **Échec** critère 1.4.11 (3:1 requis) |
| Étoile « coup de cœur » sur surface | 2,36 | **Échec** |
| Bordure sur fond (sombre) | 1,26 | **Échec** |
| Texte atténué (sombre) | 6,64 | AA |

Lighthouse signale `color-contrast` sur 5 pages sur 8.

| Constat | Gravité | Correction prévue |
|---|---|---|
| Bordures de champs à 1,28:1 : les contrôles de formulaire sont à peine délimités. | Critique | `--color-border-strong` à 3,9:1 pour tout contrôle. |
| Mode sombre violet sur noir : combinaison bannie. | Critique | Sombre neutre `#121211`, accent rouge `#FF5A47`. |
| Mode sombre incomplet : la légende de la carte est en `background:white` codé en dur, le graphe de l'encyclopédie garde `#fafafa`, le sélecteur `[data-theme="dark"]` existe dans le CSS mais rien ne pose jamais cet attribut. | Majeur | Tout en tokens `light-dark()`, attribut `data-theme` géré par `js/theme.js`. |
| Variable `--shadow-lg` utilisée mais jamais définie. | Mineur | Supprimée avec les ombres. |

## 5. Principes de Gestalt

| Principe | Violation | Gravité | Correction prévue |
|---|---|---|---|
| Proximité | Accueil : le filet du pied de carte sépare la donnée vivante (« Toulouse (13) · Madrid (68) ») de la carte qu'elle décrit, avec autant d'espace au-dessus qu'en dessous. | Mineur | Donnée sur la même ligne de base que le titre, à droite. |
| Proximité | Ville : la barre d'ambiances est à 60 px de l'en-tête et à 70 px des filtres, elle ne se rattache à aucun des deux alors qu'elle est un filtre. | Majeur | Ambiances regroupées avec les autres filtres. |
| Similarité | Le même objet « filtre à bascule » a 4 apparences : `.mood-pill` (plein violet), `.type-pill` (fond lilas), `.chart-tab` (pilule ronde), `.tab-btn` (rectangle). | Majeur | Un seul atome `.chip`, un seul état actif (aplat inversé). |
| Similarité | Le bouton principal a 7 implémentations : `.btn-primary`, `.generate-btn`, `.cf-submit`, `.submit-round-btn`, `.contribute-trigger`, `.add-btn`, `.submit-btn`, avec 5 rayons différents. | Majeur | Un atome `.btn` et ses modificateurs. |
| Similarité | 21 rayons d'angle différents : cartes à 4, 12, 16 et 20 px sur la même page (ville : barre latérale 4 px, cartes de lieu 16 px, déclencheur 12 px). | Majeur | Rayon 0 partout. |
| Alignement | 7 largeurs de conteneur (voir section 3). | Critique | Grille unique. |
| Continuité | Le folio annonce 7 outils numérotés de 01 à 07, mais le menu les range en 3 groupes dans un autre ordre, et « BoardNight » s'appelle « Suivi de Scores » dans le menu. | Majeur | Même ordre et mêmes libellés partout, folio repris dans le menu. |

## 6. UX

| Constat | Gravité | Correction prévue |
|---|---|---|
| **Débordement horizontal de 65 px sur mobile, sur les 8 pages** : la navigation à trois boutons ne tient pas à 375 px, toute la page défile latéralement. | Critique | Navigation mobile repliée derrière un bouton « Menu ». |
| **La carte de la page ville est inutilisable** : les tuiles CARTO renvoient « API KEY REQUIRED » (visible sur `ville-desktop.png`). Vérifié en local, à confirmer sur le domaine de production. | Critique | Voir question ouverte n° 4. |
| Header et footer absents sans JavaScript : aucune navigation possible. | Majeur | Web Components avec repli HTML dans la page. |
| Navigation : 3 menus déroulants pour 7 liens. Deux clics pour changer d'outil, aucun lien visible directement. | Majeur | 7 liens directs sur bureau, liste numérotée sur mobile. |
| Formulaires : aucun `<form>`, validation limitée à un toast d'erreur qui disparaît en 3,2 s, pas de message rattaché au champ, pas d'`aria-invalid`, la touche Entrée ne soumet pas. | Majeur | Vrais `<form>`, erreur sous le champ, `aria-describedby`. |
| Note contradictoire : 3 formulaires affichent « Sauvegardé localement » alors qu'ils envoient à Formspree. | Majeur | Texte corrigé : « Envoyé à Pierre, intégré manuellement ». |
| États vides : médiathèque sans résultat affiche une zone blanche. Chargement du sudoku : pastille sans texte accessible. | Majeur | Molécules `.empty` et `.status` avec `role="status"`. |
| Changement de vue du score : `window.scrollTo(0,0)` sans déplacement du focus, un lecteur d'écran n'est pas prévenu. | Majeur | Focus déplacé sur le titre de la vue. |
| CLS élevé : 1,02 sur médiathèque, 0,13 à 0,23 sur 6 autres pages. Causes : header injecté après le premier rendu, polices web tardives, grilles remplies par JS. | Majeur | Hauteur de header réservée, polices locales préchargées. |
| Sudoku : 9 s de blocage du fil principal au chargement de Pyodide, Lighthouse performance 67. | Majeur | Chargement différé, voir question ouverte n° 5. |
| Le tiroir de la page ville n'a pas de bouton de fermeture focalisable (`<div onclick>`), pas de `role="dialog"`, pas de retour du focus. Les deux autres tiroirs le font correctement. | Majeur | Un seul composant tiroir pour les 3 pages. |
| Appel à l'action de l'accueil : aucun. La page est un sommaire, c'est cohérent, mais la flèche des cartes est à 1,78:1. | Mineur | Titre entier cliquable et souligné au survol. |

## 7. Accessibilité

| Constat | Gravité | Correction prévue |
|---|---|---|
| Score : pas de `<main>`, vues en `<div>`, sauts de niveaux de titres (`h1` puis `h3`), boîtes de dialogue sans nom accessible, `aria-label` sur des `div` sans rôle. Lighthouse 89. | Majeur | `<main>`, sections titrées, `aria-labelledby` sur les dialogues. |
| 9 éléments cliquables sont des `<div role="button">` ou des `<div onclick>` (cartes média, cartes d'accueil du score, fermeture du tiroir ville) au lieu de `<button>` ou `<a>`. | Majeur | Éléments natifs. |
| Champs sans nom accessible : recherche de la page ville (aucun label), les `<select>` des pages ville et batch, 4 `<label>` sans attribut `for`. | Majeur | Molécule `.field` systématique. |
| `aria-hidden="true"` sur un tiroir qui contient un bouton focalisable (médiathèque, web). | Majeur | Attribut `inert` quand le tiroir est fermé. |
| `role="menu"` sur les menus déroulants sans la navigation au clavier que ce rôle impose (flèches, Début, Fin). | Majeur | Simple liste de liens dans une `<nav>`, sans rôle de menu. |
| `prefers-reduced-motion` : **0 occurrence**. 10 `@keyframes`, 60 transitions, confettis, pulsation infinie. | Critique | Tokens de durée mis à zéro, aucune animation décorative. |
| Focus visible : présent globalement, mais supprimé (`outline: none`) sur 5 familles de champs et remplacé par une ombre lilas à faible contraste. | Majeur | Contour de 2 px en accent sur tout élément focalisable. |
| Cibles tactiles : boutons de 28 px (pas-à-pas du score), 25,6 px (fermeture des panneaux), pilules de 24 px de haut. | Majeur | 40 px minimum, 48 px pour les contrôles principaux. |
| Pas de lien d'évitement. | Mineur | `.skip-link` sur chaque page. |
| 53 `<button>` sans attribut `type`. | Mineur | `type="button"` partout hors soumission. |
| Sudoku : `role="grid"` sans `row` ni `gridcell`. | Mineur | Structure ARIA complète ou rôle retiré. |

## 8. Qualité du code front

| Constat | Mesure | Gravité | Correction prévue |
|---|---|---|---|
| CSS mort | **202 classes sur 507 (40 %)** ne sont référencées dans aucun HTML ni JS. 307 règles sur 841, environ 40 Ko sur 114. Restes de 4 versions antérieures (ancienne accueil, ancien batch cooking, « discover » à balayage, page de contribution). | Majeur | Réécriture complète, rien n'est repris. |
| Sélecteurs redéfinis | 65 sélecteurs déclarés 2 à 4 fois à des endroits différents du fichier (`.stats-grid` × 4, `:root` × 3). | Majeur | Un composant, une définition. |
| `!important` | 13, dont 9 sur `.section-head` aussitôt contredits 130 lignes plus bas. | Majeur | Aucun, cascade tenue par `@layer`. |
| Styles inline | 17 attributs `style=""` dans le HTML, 48 dans les gabarits JS. | Majeur | Classes uniquement. |
| JS qui manipule les styles | 19 accès `.style.` directs, dont `cssText` avec couleurs, rayons et ombres en dur (légende et marqueurs de la carte). | Majeur | Classes et propriétés personnalisées. |
| Gestionnaires inline | 64 attributs `onclick`, `onkeydown`. | Mineur | `addEventListener` et délégation. |
| Duplication JS | Tiroir de détail écrit 3 fois, soumission de formulaire 5 fois, toast 2 fois (`showToast` et `toast`). | Majeur | Modules partagés dans `js/`. |
| Injection HTML | Données interpolées dans `innerHTML` sans échappement. Les données sont locales aujourd'hui, le risque est faible mais réel si une contribution est collée telle quelle dans `data.js`. | Mineur | Fonction d'échappement commune. |
| Validation HTML | 135 erreurs `html-validate` : boutons sans type (53), balises auto-fermantes (49), styles inline (15), éléments non natifs (9), `aria-label` mal placés (5), un titre vide, un BOM UTF-8. | Mineur | 0 erreur visée. |
| SEO | `<title>` et descriptions présents partout. Manquent : `canonical`, `og:image`, `og:url`, données structurées, favicon, `theme-color`. | Mineur | Ajoutés en phase 4. |

## 9. Anti-patterns de la liste « À bannir »

| Élément | Occurrences | Où |
|---|---|---|
| Dégradés | **25** déclarations `gradient`, dont 6 visibles en production (bandeau de 2 px en haut de chaque page outil), le reste dans du CSS mort | `style.css` l. 3259 à 3264 |
| Coloration arc-en-ciel | 6 teintes de bandeau, 13 couleurs de marqueurs, `schemeTableau10` | `style.css`, `ville/app.js`, `mindmap.js` |
| Icônes Lucide | 0 | |
| Fond blanc pur | **14** (`#fff`, `white`), dont la légende de la carte et le texte des pastilles | `style.css`, `ville/app.js` l. 61 à 80 |
| Ombres portées | **45** `box-shadow`, 3 variables d'ombre, 5 ombres en dur dans le JS | partout |
| Trois cartes sur une rangée | Médiathèque et web (grille de cartes sur 3 colonnes), podium (3 cartes), trophées (3 colonnes) | `.media-grid`, `.podium`, `.awards-grid` |
| Bento grids | 0 | |
| Emojis | **41 distincts, 46 occurrences** : 20 avatars de joueurs, 3 médailles, 17 trophées, flèches `↗ ▶ ↩` | `score/app.js`, `score/index.html`, `web/app.js` |
| Effet verre | **5** `backdrop-filter`, dont le header et le fond des dialogues | `style.css` l. 100, 1589 |
| Tirets cadratins | **environ 80 dans des textes visibles** : 41 dans le HTML (titres, descriptions, balises meta), 30 dans les données, 9 dans les chaînes de `score/app.js` et `shared-layout.js`. Les 57 de `ville/app.js` sont presque tous des commentaires | toutes les pages |
| Bande de couleur sur le bord gauche | 1 : joueur en tête du classement | `.player-standing.rank-1::before` |
| « Ce n'est pas X, c'est Y » | 0 | |
| Coins arrondis doux | **21 rayons distincts**, 132 déclarations, jusqu'à 2 rem et 9999 px | partout |
| Violet et noir | Tout le mode sombre | `style.css` l. 40 à 56 |
| Orbes, halos radiaux, grilles de points | 7 `radial-gradient` et 3 grilles en fond, tous dans du CSS mort | `style.css` |
| Flèches animées | 1 : flèche des cartes d'accueil, translation de 5 px au survol | `.lp-card:hover .lp-card-arrow` |
| Animations au survol | **11 règles** `:hover` avec `transform`, plus 60 `transition` dont 15 `all` | `style.css` |
| Néon, pastels | Fond lilas `--primary-soft` sur pilules et boutons, 6 fonds pastel à 14 % | `style.css` |

---

## 10. Mesures de référence

### Lighthouse (mobile, avant refonte)

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Accueil | 81 | 100 | 96 | 100 | 3,6 s | 0 | 0 ms |
| Médiathèque | 73 | 92 | 96 | 100 | 2,0 s | **1,02** | 0 ms |
| Ville | 82 | 88 | 96 | 100 | 2,6 s | 0,23 | 0 ms |
| Encyclopédie | 85 | 91 | 96 | 100 | 2,6 s | 0,18 | 10 ms |
| Batch cooking | 90 | 88 | 96 | 100 | 2,0 s | 0,17 | 0 ms |
| Score | 88 | 89 | 96 | 100 | 2,6 s | 0,13 | 0 ms |
| Sudoku | 67 | 89 | 77 | 100 | 2,0 s | 0,07 | **9 050 ms** |
| Web | 89 | 92 | 96 | 100 | 2,0 s | 0,18 | 0 ms |

Le score d'accessibilité de 100 sur l'accueil ne couvre que les contrôles automatisables : il ne voit ni le débordement mobile, ni les textes de 9 px, ni l'absence de navigation sans JS.

### Autres

- `html-validate` : 135 erreurs sur 8 pages.
- Débordement horizontal à 375 px : 65 px sur 8 pages sur 8.
- Erreurs console : 1 par page (favicon 404).

---

## 11. Les 10 problèmes les plus importants

1. **Débordement horizontal de 65 px sur mobile, sur toutes les pages** (navigation). Critique.
2. **Carte de la page ville hors service** : tuiles CARTO refusées. Critique.
3. **Aucune échelle typographique** : 53 tailles, dont des textes de 9,3 px, et 3 familles. Critique.
4. **Aucune grille** : 7 largeurs de conteneur, 45 valeurs d'espacement, 52 % hors grille de 8. Critique.
5. **Contrastes en échec** sur les bordures de champs (1,28:1), les flèches, l'étoile et le texte de succès. Critique.
6. **Aucune prise en compte de `prefers-reduced-motion`** malgré 10 animations et 60 transitions. Critique.
7. **Navigation et pied de page absents sans JavaScript**, et à l'origine d'un décalage de mise en page (CLS jusqu'à 1,02). Majeur.
8. **40 % de CSS mort** et 65 sélecteurs redéfinis dans un fichier unique de 114 Ko. Majeur.
9. **Composants en variantes multiples** : 7 boutons principaux, 4 filtres à bascule, 21 rayons, 3 tiroirs. Majeur.
10. **Anti-patterns présents en nombre** : 45 ombres, 25 dégradés, 46 emojis, environ 80 tirets cadratins visibles, mode sombre violet sur noir, effet verre sur le header. Critique au regard du cahier des charges.

---

## 12. Questions ouvertes avant la refonte

Ces points touchent au contenu ou au fonctionnement, pas seulement à l'apparence. Ils attendent une décision.

1. **Avatars emoji du suivi de scores.** La règle « aucun emoji » supprime les 20 avatars, les médailles et les icônes de trophées. Proposition : avatar remplacé par l'initiale du joueur dans un carré à sa couleur, médailles remplacées par les rangs 1, 2, 3 en grands chiffres, trophées en titre typographique seul. Les parties déjà enregistrées dans `localStorage` restent lisibles (l'emoji stocké est simplement ignoré).
2. **Couleurs de catégories.** 13 couleurs de marqueurs sur la carte, 8 couleurs de joueurs, 10 couleurs de contributeurs dans l'encyclopédie. Proposition : 8 séries de données en tokens pour les joueurs et les contributeurs (une donnée a besoin d'être distinguée), marqueurs de carte monochromes en encre avec le type porté par le filtre et l'infobulle, accent rouge réservé au lieu sélectionné et aux coups de cœur.
3. **Confettis de fin de partie.** Mouvement purement décoratif. Proposition : suppression, remplacée par la révélation ligne à ligne du nom du vainqueur.
4. **Fond de carte.** CARTO exige désormais une clé. Proposition : tuiles OpenStreetMap standard (gratuites, sans clé, usage modéré admis), désaturées par un filtre CSS pour rester dans la palette. Autre option : fournir une clé CARTO ou Stadia.
5. **Sudoku.** Pyodide bloque le fil principal 9 s. Proposition : ne le charger qu'au premier clic sur « Résoudre », avec la ligne d'état « Chargement de Python ». Le premier résultat arrive plus tard, mais la page est utilisable tout de suite.
6. **Libellé « BoardNight ».** L'accueil dit « BoardNight », le menu « Suivi de Scores », le titre de page « Notez chaque manche, célébrez chaque victoire ». Proposition : « Suivi de scores » partout, « BoardNight » conservé dans le `<title>`.
