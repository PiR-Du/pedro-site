# Système de design

Version 1, octobre 2026. Spécimen vivant : [`styleguide.html`](styleguide.html).

Fondation : style typographique international, d'après *Grid Systems in Graphic Design* de Josef Müller-Brockmann. Une grille stricte, une famille sans empattement, des compositions asymétriques, beaucoup de blanc. La hiérarchie est portée par la taille et la graisse, la séparation par des filets de 1 px et par l'espace. Aucune décoration.

---

## 1. Architecture

### Feuilles de style, dans l'ordre de chargement

| Fichier | Contenu | Couche |
|---|---|---|
| `css/tokens.css` | Toutes les variables : couleurs, espacements, typographie, grille, formes, mouvement. Déclare l'ordre des couches. | `tokens` |
| `css/base.css` | `@font-face`, reset, typographie de base, éléments HTML nus, focus | `base` |
| `css/layout.css` | Conteneur, grille, classes de placement, sections, piles | `layout` |
| `css/components.css` | Atomes, molécules, organismes (BEM), primitives de mouvement | `components` |
| `css/utilities.css` | 8 utilitaires et la règle `[hidden]` | `utilities` |
| `css/styleguide.css` | Spécimens du guide de style uniquement, non chargé par le site | `components` |
| `css/vendor/leaflet-core.css` | Styles structurels de Leaflet 1.9.4 (page ville uniquement), sans habillage | `vendor` |

```css
@layer tokens, base, vendor, layout, components, utilities;
```

La cascade est tenue par `@layer` : une règle d'une couche postérieure l'emporte toujours, quelle que soit la spécificité. Conséquence : aucun `!important`, aucun sélecteur renforcé artificiellement.

### Règles d'écriture

- **Aucune valeur en dur hors de `tokens.css`** pour les couleurs, espacements, tailles de police, interlignages, rayons, durées et courbes.
- Sont admises hors tokens les valeurs structurelles sans dimension de design : `0`, `100%`, `1fr`, `1`, `none`, les numéros de lignes de grille, et les `1px` de la classe `.sr-only`.
- Les points de rupture sont écrits en dur dans les `@media` (48 rem et 64 rem), car CSS n'accepte pas de variable dans une requête média. Ils ne changent que les tokens de grille : les composants en ont rarement besoin.
- Propriétés logiques (`inline-size`, `padding-block`, `inset-inline`) plutôt que physiques.
- BEM : `.bloc`, `.bloc__element`, `.bloc--variante`. États : attributs ARIA d'abord (`[aria-pressed="true"]`, `[aria-current="page"]`), classes `.is-*` sinon.
- Aucun style inline, y compris dans les gabarits JS. Le JS pose des classes ou des attributs.

### Scripts

| Fichier | Rôle |
|---|---|
| `js/theme-init.js` | Script classique en `<head>` : applique le thème mémorisé avant le premier rendu |
| `js/theme.js` | Module : bascule `[data-theme-toggle]`, mémorisation |
| `js/motion.js` | Module : apparitions, révélation de texte, compteurs, calque de grille |
| `js/main.js` | Module d'entrée commun : charge les Web Components, le thème et le mouvement |
| `js/components/site-header.js` | Web Component `<site-header>` : marque, sept liens numérotés, menu repliable sous 1024 px |
| `js/components/site-footer.js` | Web Component `<site-footer>` : mentions, lien vers le guide, bascule de thème |
| `js/site.js` | Script classique partagé par les outils : échappement HTML, messages éphémères, tiroir, formulaires de contribution, lecture d'une couleur de token |
| `js/home.js` | Compteurs et dernières entrées de l'accueil |

Aucune dépendance ajoutée. Motion One a été écarté : les trois primitives retenues tiennent en 70 lignes environ avec `IntersectionObserver` et des transitions CSS.

---

## 2. Grille

| | Mobile | Tablette | Bureau |
|---|---|---|---|
| À partir de | 0 | 768 px (48 rem) | 1024 px (64 rem) |
| Colonnes (`--grid-columns`) | 4 | 8 | 12 |
| Gouttière (`--grid-gutter`) | 16 px | 24 px | 24 px |
| Marge (`--grid-margin`) | 16 px | 32 px | 64 px |

Largeur maximale : `--container-max` = 1440 px, marges comprises. À 1440 px, une colonne mesure 87,33 px.

### Utilisation

```html
<div class="container grid">
  <h2 class="col-1-5">Titre</h2>
  <p class="col-7-12">Texte</p>
</div>
```

- `.container` : boîte de contenu unique du site. Toute grille vit dedans.
- `.grid` : expose les colonnes.
- `.grid__band` : bande pleine largeur en `subgrid`. Ses enfants s'accrochent aux lignes de la grille parente, ce qui garantit que titres, textes et filets de bandes différentes partagent les mêmes alignements.
- `.col-A-B` : de la colonne A à la colonne B incluse, sur bureau. `.md-col-A-B` sur tablette, `.sm-col-A-B` sur mobile. Sans classe de palier, un bloc occupe toute la largeur.
- Calque de contrôle : la touche `G` superpose la grille réelle. Le calque vit dans le même `.container.grid` que le contenu, il ne peut donc pas dériver.

### Compositions de référence

| Usage | Bureau | Tablette |
|---|---|---|
| Titre de section et contenu | `col-1-4` + `col-5-12` | `md-col-1-3` + `md-col-4-8` |
| Titre et chapô décalé | `col-1-9` puis `col-7-12` à la ligne suivante | `md-col-4-8` |
| Filtres et résultats | `col-1-3` + `col-4-12` | `md-col-1-3` + `md-col-4-8` |
| Entrée éditoriale | folio 1, titre 2 à 6, texte 7 à 10, méta 11 à 12 | folio 1, titre 2 à 4, texte 5 à 8 |

Le centrage est proscrit, sauf pour le contenu d'un bouton.

---

## 3. Espacement

Grille de 8 pt. Le numéro du token est le multiplicateur de 8.

| Token | Valeur | Usage type |
|---|---|---|
| `--space-half` | 4 px | Ajustements fins uniquement : décalage de soulignement, padding d'une touche |
| `--space-1` | 8 px | Entre un label et son champ, entre deux filtres |
| `--space-2` | 16 px | Padding interne des contrôles, gouttière mobile |
| `--space-3` | 24 px | Gouttière, espace entre blocs liés |
| `--space-4` | 32 px | Entre rangées de grille |
| `--space-5` | 40 px | Hauteur des contrôles compacts |
| `--space-6` | 48 px | Hauteur des contrôles, section resserrée |
| `--space-8` | 64 px | Marge bureau, hauteur du header, section sur mobile |
| `--space-10` | 80 px | |
| `--space-12` | 96 px | Hauteur d'une zone de texte |
| `--space-16` | 128 px | Section sur grand écran |
| `--space-20` | 160 px | |

`--section-gap` = `clamp(64px, 8vw, 128px)` : seule valeur fluide, bornée par deux paliers.

---

## 4. Typographie

### Familles

- **Inter** variable (100 à 900), sous-ensemble latin, auto-hébergée : `fonts/inter-var-latin.woff2`, 48 Ko. Licence SIL OFL 1.1.
- **JetBrains Mono** variable, sous-ensemble latin : `fonts/jetbrains-mono-var-latin.woff2`, 40 Ko. Licence SIL OFL 1.1. Réservée aux folios, étiquettes, états et code.
- `font-display: swap`, Inter préchargée. Instrument Serif est abandonnée.

Graisses : 400 (texte), 500 (libellés, boutons), 700 (titres).

### Échelle : Major Third, ratio 1,25, base 16 px

**Pourquoi 1,25 et pas 1,333.** Sept pages sur huit sont des outils denses (filtres, tableaux, formulaires, classements). Elles ont besoin de paliers rapprochés dans les petites tailles : 12,8, 16, 20 et 25 px. Avec 1,333, on saute de 16 à 21,3 puis 28,4 px, ce qui est trop grossier pour une interface. Le contraste d'échelle voulu par le style suisse s'obtient en sautant des paliers (du texte en 16 px à côté d'un titre en 119 px, soit 9 paliers d'écart), pas en élargissant le ratio.

| Token | Calcul | Bureau | Mobile | Usage |
|---|---|---|---|---|
| `--text-sm` | 16 ÷ 1,25 | 12,80 px | 12,80 px | Étiquettes, légendes, métadonnées. Plancher du site. |
| `--text-base` | 16 | 16,00 px | 16,00 px | Corps de texte, contrôles |
| `--text-lg` | 16 × 1,25 | 20,00 px | 20,00 px | Chapô, `h4` |
| `--text-xl` | 16 × 1,25² | 25,00 px | 25,00 px | |
| `--text-2xl` | 16 × 1,25³ | 31,25 px | 25,00 px | `h3` |
| `--text-3xl` | 16 × 1,25⁴ | 39,06 px | 31,25 px | Titre d'entrée éditoriale |
| `--text-4xl` | 16 × 1,25⁵ | 48,83 px | 39,06 px | `h2` |
| `--text-5xl` | 16 × 1,25⁶ | 61,04 px | 39,06 px | |
| `--text-6xl` | 16 × 1,25⁷ | 76,29 px | 48,83 px | `h1`, grands chiffres |
| `--text-7xl` | 16 × 1,25⁸ | 95,37 px | 48,83 px | |
| `--text-8xl` | 16 × 1,25⁹ | 119,21 px | 61,04 px | Titre d'affiche (`.display`) |

Les paliers à partir de `2xl` sont fluides : `clamp(borne basse, intersection + pente × vw, borne haute)`, interpolés linéairement entre 375 px et 1440 px de large. Les deux bornes sont toujours des paliers de l'échelle.

Le palier `xs` (10,24 px) existe dans l'échelle théorique et n'est volontairement pas déclaré : rien ne descend sous 12,8 px.

### Interlignage et interlettrage

| Token | Valeur | Pour |
|---|---|---|
| `--leading-sm` | 20 px | `--text-sm` (1,56) |
| `--leading-base` | 24 px | `--text-base` (1,5) |
| `--leading-lg` | 32 px | `--text-lg` (1,6) |
| `--leading-xl` | 32 px | `--text-xl` (1,28) |
| `--leading-heading` | 1,15 | Titres fluides |
| `--leading-display` | 1,05 | `h1`, `.display`, grands chiffres |
| `--tracking-display` | −0,04 em | Titres d'affiche |
| `--tracking-heading` | −0,02 em | Titres |
| `--tracking-label` | 0,08 em | Capitales monospace |

Les interlignages du texte courant sont des multiples de 8 (4 toléré pour 20 px). **Exception assumée** : les titres fluides utilisent un ratio sans unité, car une taille qui varie en continu ne peut pas tomber sur un multiple de 8 à toutes les largeurs.

Longueur de ligne : `--measure` = 68 ch, appliqué par défaut à `p`, `li`, `dd`. Texte ferré à gauche, `text-wrap: pretty` pour le texte, `balance` pour les titres.

---

## 5. Couleur

### Méthode

1. **Rôles d'abord** (approche Huemint) : fond, surface, texte, accent, sans partir d'une teinte.
2. **Harmonie** (approche Coolors) : gamme neutre de teinte unique, légèrement chaude (teinte 80°, chroma inférieur à 0,01), et un seul accent complémentaire franc.
3. **Validation en situation** (approche Realtime Colors) : section 08 du guide de style, où la palette habille un vrai fragment de page, en clair, en sombre et en aplat inversé.

Le fond est un gris papier neutre, ni blanc pur ni crème. L'accent est un bordeaux : un rouge profond, plus feutré que le rouge signalétique suisse.

### Rôles

| Rôle | Token | Clair | Sombre | Part |
|---|---|---|---|---|
| Fond | `--color-bg` | `#EFEFEC` | `#121211` | **60 %** |
| Surface (aplat) | `--color-surface` | `#E5E5E1` | `#1D1D1B` | compris dans les 60 % |
| Champ de saisie | `--color-surface-sunken` | `#F6F6F3` | `#0A0A09` | compris dans les 60 % |
| Texte, filets forts | `--color-text` | `#111111` | `#ECECE8` | **30 %** |
| Texte atténué | `--color-text-muted` | `#4A4A46` | `#A9A9A2` | compris dans les 30 % |
| Filet | `--color-border` | `#C6C6C0` | `#34342F` | compris dans les 30 % |
| Contour de contrôle | `--color-border-strong` | `#77776F` | `#7C7C74` | compris dans les 30 % |
| Accent | `--color-accent` | `#7B1E2E` | `#E07A8A` | **10 %** |
| Texte sur accent | `--color-on-accent` | `#F6F6F3` | `#121211` | |
| Succès | `--color-success` | `#1F6B3A` | `#5FBF82` | ponctuel |
| Danger | `--color-danger` | = accent | = accent | ponctuel |

**Où va l'accent** : bouton principal, folios, lien actif de la navigation, erreurs, élément sélectionné sur une carte ou un graphique. Jamais en fond de section, jamais en bordure décorative.

**Erreur et accent partagent le bordeaux.** Une erreur ne repose donc jamais sur la couleur seule : elle porte le préfixe « Erreur : », une graisse 700 et un contour de 2 px sur le champ.

### Contrastes (WCAG 2.2)

| Couple | Clair | Sombre | Niveau |
|---|---|---|---|
| Texte sur fond | 16,39 | 15,83 | AAA |
| Texte sur surface | 14,95 | 14,25 | AAA |
| Texte sur champ | 17,44 | 16,72 | AAA |
| Texte atténué sur fond | 7,73 | 7,93 | AAA |
| Texte atténué sur surface | 7,05 | 7,14 | AAA |
| Fond sur texte (aplat inversé) | 16,39 | 15,83 | AAA |
| Accent sur fond | 8,82 | 6,53 | AAA / AA |
| Accent sur surface | 8,04 | 5,89 | AAA / AA |
| Texte sur accent (bouton) | 9,38 | 6,53 | AAA / AA |
| Succès sur fond | 5,66 | 8,27 | AA / AAA |
| Contour de contrôle sur fond | 3,92 | 4,46 | conforme (3:1 requis) |
| Filet décoratif sur fond | 1,49 | 1,50 | non concerné : purement décoratif, ne porte aucune information |

Tout le corps de texte atteint AAA. L'accent atteint AAA en clair et AA en sombre : un bordeaux foncé serait illisible sur fond noir, le thème sombre utilise donc un bordeaux éclairci, tirant sur le rosé.

### Séries de données

`--color-data-1` à `--color-data-8`, pour distinguer joueurs et catégories dans les graphiques. Toutes à 4,5:1 au moins sur le fond dans les deux thèmes. Jamais en fond de bloc, jamais en dégradé. Une série est toujours doublée d'un libellé.

### Thèmes

Les couleurs sont déclarées une seule fois avec `light-dark()`. Le thème suit `prefers-color-scheme` par défaut, `data-theme="light"` ou `data-theme="dark"` sur `<html>` force l'un ou l'autre en changeant `color-scheme`. Le sombre est un noir neutre, sans teinte violette ni bleue.

---

## 6. Formes et profondeur

- `--radius` = 0. Appliqué aux contrôles de formulaire dans `base.css`, rien d'autre n'a de rayon.
- Aucune ombre : ni `box-shadow`, ni `drop-shadow`, ni `text-shadow`.
- Aucun `backdrop-filter`, aucun dégradé.
- Séparation par filet de 1 px : `--border` (discret, entre éléments d'une liste) et `--border-strong` (encre, entre sections et autour des contrôles actifs).
- Profondeur par aplat : `--color-surface` pour un bloc mis en avant, aplat inversé pour un état actif ou un message.
- Un bloc mis en avant est signalé par un filet fort **au-dessus**, jamais par une bande latérale.
- Focus : contour de 2 px en accent, décalé de 2 px, sur tout élément focalisable.

---

## 7. Mouvement

Inspiré des primitives In View, Text Effect, Animated Group et Animated Number de Motion Primitives, transposées sans bibliothèque.

| Primitive | Déclenchement | Mise en œuvre |
|---|---|---|
| Apparition | `data-reveal` | Opacité 0 vers 1, translation de 16 px, 600 ms |
| Apparition en cascade | `data-reveal-group` sur le parent | Décalage de 80 ms par enfant, jusqu'à 8 |
| Révélation de texte | `data-reveal="lines"` et `.reveal-lines__line` | Chaque ligne monte derrière un masque, 600 ms |
| Filet tracé | `.rule[data-reveal]` | `scaleX` de 0 à 1 depuis la gauche |
| Compteur | `data-count="87"` | De 0 à la valeur en 600 ms, à l'entrée dans la fenêtre |
| Changement de page | automatique | `@view-transition { navigation: auto; }`, fondu natif |

| Token | Valeur |
|---|---|
| `--duration-fast` | 200 ms |
| `--duration-base` | 400 ms |
| `--duration-slow` | 600 ms |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |

### Garanties

- **Aucune animation au survol.** `:hover` ne change que `color`, `background-color`, `border-color` ou `text-decoration`, sans `transition`. Vérifiable par recherche : aucune règle `:hover` ne contient `transition`, `transform` ou `animation`.
- **Sans JS, rien n'est caché.** Les états masqués sont écrits sous `.has-motion`, classe que seul `js/motion.js` pose. Le HTML contient déjà les valeurs finales des compteurs.
- **`prefers-reduced-motion: reduce`** : le module ne pose pas `.has-motion`, les compteurs affichent leur valeur finale, et tous les tokens de durée valent 0.

---

## 8. Composants

### Atomes

| Composant | Classes | Notes |
|---|---|---|
| Titres | `.display`, `.title-1` à `.title-4` | Découplent l'apparence du niveau sémantique `h1` à `h6` |
| Texte | `.lead`, `.text-sm` | |
| Étiquette | `.eyebrow` | Monospace, capitales, atténuée |
| Folio | `.folio` | Numéro d'ordre en accent |
| Grand chiffre | `.numeral`, `.numeral--sm` | Chiffres tabulaires |
| Lien | `.link`, `.link--accent`, `.link--plain` | Souligné en permanence, sauf `--plain` |
| Bouton | `.btn`, `--primary`, `--danger`, `--quiet`, `--sm`, `--block` | 48 px de haut, 40 px en `--sm`. Survol : aplat inversé. |
| Champs | `.input`, `.select`, `.textarea` | 48 px, 16 px de corps (pas de zoom iOS) |
| Libellés | `.label`, `.hint`, `.error` | |
| Étiquette de type | `.tag`, `--solid`, `--accent` | |
| Filtre à bascule | `.chip` | État par `aria-pressed` |
| Filet | `.rule`, `.rule--strong` | |
| Icône | `.icon` | 4 pictogrammes maison en trait droit de 2 px : flèche, lien externe, plus, fermer. Aucune bibliothèque. |
| Touche | `.kbd` | |
| Pastille de série | `.swatch`, `.swatch--1` à `--8` | Carrée |
| Lien d'évitement | `.skip-link` | |

### Molécules

| Composant | Classes | Remplace |
|---|---|---|
| Champ complet | `.field`, `.field--invalid`, `.field-row` | `.cf-field`, `.field`, `.filter-group`, `.form-group`, `.input-group` |
| Groupe de boutons | `.btn-group` | `.setup-footer`, `.modal-actions`, `.awards-footer`, `.actions` |
| Sélecteur segmenté | `.segmented`, `.segmented__item` | `.tabs`, `.chart-tabs`, `.ville-view-toggle` |
| Groupe de filtres | `.chip-group` | `.mood-bar`, `.type-pills` |
| Élément de navigation | `.nav-item` | `.nav-dropdown a` |
| Entrée éditoriale | `.entry-list`, `.entry`, `.entry--compact` | `.lp-card`, `.media-card`, `.place-card`, `.day-card`, `.history-game-card`, `.award-card`, `.welcome-card` |
| Statistique | `.stat` | `.lp-stat`, `.gstat`, `.summary-stat`, `.stat-pill` |
| Tableau typographique | `.spec` | `.detail-section` |
| Ligne d'état | `.status`, `--loading`, `--ready`, `--error` | `.status-bar`, `.badge` |
| Avis | `.notice` | `.resume-banner` |
| État vide | `.empty` | `.empty-message` et ses 3 tailles, `.ville-empty` |
| Message éphémère | `.toast-region`, `.toast`, `.toast--error` | 2 systèmes de toast |
| Panneau dépliable | `.disclosure__panel` | `.contribute-panel` |

### Organismes, gabarits, pages

| Organisme | Forme |
|---|---|
| `<site-header>` | Web Component sans Shadow DOM. Repli HTML dans chaque page : marque et lien « Sommaire » vers l'accueil. `display: contents`, l'en-tête interne est collant. |
| `<site-footer>` | Web Component sans Shadow DOM. Repli HTML : copyright et mention. |
| En-tête de page | `.page-head` : folio, catégorie, filet tracé, titre en colonnes 1 à 7, chapô en colonnes 8 à 12 |
| Gabarit outil | `.tool`, `.tool__aside` (filtres, collant avec `--sticky`), `.tool__main`, `.tool__bar` |
| Liste de résultats | `.results` et `.result` : tableau typographique à 4 colonnes (étiquette, titre, texte, méta), lien étendu à la ligne par `.entry__link` |
| Registre | `.ledger` : libellé à gauche, titre et texte à droite (plan de repas, trophées) |
| Tiroir de détail | `<dialog class="drawer">` natif, ouvert par `openDrawer()` de `js/site.js`. Un seul composant pour médiathèque, web, ville et encyclopédie. Piège à focus, Échap et retour du focus fournis par le navigateur. |
| Boîte de dialogue | `<dialog class="modal">` : confirmation et choix de couleur du suivi de scores |
| Formulaire de contribution | `<details class="disclosure">` et `<form data-contribute="outil">`. Validation, erreurs rattachées aux champs et envoi gérés une seule fois dans `js/site.js`. Le panneau se déplie sans JS. |
| Carte | `.map`, `.map-marker`, `.map-tooltip` : habillage de Leaflet, tuiles désaturées par `--map-filter` |
| Graphe | `.graph`, `.graph__node`, `.graph__hull` : carte mentale D3 stylée par classes |
| Sudoku | `.sudoku`, `.sudoku__cell`, `.numpad` |
| Suivi de scores | `.view`, `.avatar`, `.standings`, `.score-row`, `.stepper`, `.score-table`, `.podium`, `.color-picker` |

Gabarits : accueil (affiche, chiffres, sommaire numéroté), outil à filtres (médiathèque, web, ville, encyclopédie), outil à deux colonnes (batch cooking, sudoku), outil à vues (suivi de scores).

### Exceptions documentées

- `js/site.js` et `encyclopedia/mindmap.js` appellent `style.setProperty` à trois endroits : pour lire la couleur résolue d'un token (Chart.js ne lit pas les variables CSS) et pour transmettre les coordonnées de l'infobulle du graphe par `--tip-x` et `--tip-y`. Aucune valeur de design n'y est écrite.
- Les bibliothèques de dessin reçoivent quelques nombres en dur (taille des nœuds du graphe, rayon des points du graphique) : ce sont des multiples de 4 et la taille de police reprend `--text-sm`.
- `score/app.js` garde la liste des 8 anciennes couleurs hexadécimales, uniquement pour convertir les parties enregistrées avant la refonte vers les séries de données.

### Ce qui remplace les motifs bannis

| Motif banni | Remplacement |
|---|---|
| Rangée de cartes | Liste éditoriale numérotée (`.entry`) sur la grille |
| Grille de 58 cartes | Tableau typographique à lignes compactes (`.entry--compact`) |
| Carte de statistique | Grand chiffre sous un filet fort (`.stat`) |
| Pastille arrondie colorée | Étiquette rectangulaire monospace (`.tag`) |
| Bandeau à bordure gauche | Filet fort au-dessus (`.notice`) |
| Emoji | Initiale, chiffre ou mot |
| Ombre de survol | Aplat inversé ou soulignement instantané |

---

## 9. Sources consultées

- Müller-Brockmann, *Grid Systems in Graphic Design* : grille modulaire, drapeau à droite, peu de tailles et de grands écarts, chiffres en grand, un seul accent.
- Typescale : calcul de l'échelle 1,25 sur base 16.
- Motion Primitives : nomenclature des primitives (In View, Text Effect, Animated Group, Animated Number), transposées en CSS et `IntersectionObserver`.
- Siteinspire, Godly, Awwwards, Land-book, Lapa Ninja : ces galeries sont composées d'images. La consultation automatisée n'en retourne que les noms de sites et les catégories (« Typographic », « Grid Layout », « Minimal »), pas les mises en page. Aucune composition n'en a donc été tirée directement, et rien n'en a été copié.
- Huemint, Coolors, Realtime Colors : méthode en trois temps décrite en section 5, appliquée à la main et vérifiée par calcul de contraste.
