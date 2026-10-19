# Ajouter une fiche au Labo data

Tout le contenu du Labo data est dans **`labo/data.js`**. Ajouter une fiche, c'est ajouter une entrée à ce fichier : pas de HTML à toucher. La page génère le sommaire, les filtres, la fiche détaillée et les graphiques.

## Les fichiers

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `labo/data.js` | Rubriques, données des graphiques, guide « Quel graphique ? », fiches | **Oui, c'est le seul** |
| `labo/charts.js` | Dessin des graphiques en SVG | Seulement pour un nouveau type de graphique |
| `labo/interactifs.js` | Exemples à manipuler (curseurs, sondages simulés) | Seulement pour un nouvel exemple interactif |
| `labo/app.js` | Sommaire, filtres, fiche, adresses | Non |
| `css/lab.css` | Styles propres au Labo | Non |

## 1. Annoncer une fiche « à venir »

Une ligne suffit. Elle apparaît en gris, non cliquable :

```js
{ id: 'axe-zero', rubrique: 'mensonges', statut: 'a-venir', titre: 'L\'axe qui ne part pas de zéro' },
```

## 2. Publier une fiche

Complétez l'entrée et passez `statut` à `'publiee'`. Le gabarit est toujours le même, pensé pour un carrousel Instagram : **volet 1** = titre et visuel principal, **volets 2 à 6** = les blocs.

```js
{
  id: 'axe-zero',                  // unique, en minuscules avec tirets : il devient l'adresse ?fiche=axe-zero
  rubrique: 'mensonges',           // datasets | mensonges | choisir | notions
  statut: 'publiee',
  date: '2026-11-02',              // AAAA-MM-JJ
  titre: 'L\'axe qui ne part pas de zéro',   // titre accrocheur, 60 caractères au plus
  accroche: 'Une hausse de 2 % qui ressemble à une explosion.',  // une ou deux phrases
  visuel: { /* voir § 3 */ },
  blocs: [                         // 4 à 6 blocs courts
    { type: 'definition', titre: '…', texte: '…' },
    { type: 'exemple', titre: '…', texte: '…' },
    { type: 'erreur', titre: '…', texte: '…' },
    { type: 'astuce', titre: '…', texte: ['point 1', 'point 2'] },  // un tableau = une liste à puces
    { type: 'retenir', titre: '…', texte: '…' },
  ],
  sources: [{ titre: 'Insee, salaires 2024', url: 'https://…' }],  // facultatif
},
```

**Types de blocs** : `definition`, `exemple`, `erreur`, `astuce`, `retenir`, `probleme`, `formule`, `question`, `donnees`, `methode`, `resultat`, `limite`, `maths`, `simulation`.

**Dans les textes** : `**gras**` et `` `code` ``. Les espaces insécables (avant `€`, `%`, `?`, `:`, dans `3 290`) sont posées automatiquement. Pensez à échapper les apostrophes (`l\'axe`) ou à utiliser des guillemets doubles.

**Bloc formule** : ajoutez `formule: '=MEDIANE(B2:B21)'`, affichée en bloc de code au-dessus du texte.

**Équations** : tout bloc peut porter `equations: [{ eq: 'π = π · P', note: 'ce que dit la formule' }]`, affichées en grand sous le texte, chacune suivie de son explication. Écrivez-les en Unicode (indices `pᵢⱼ`, `Xₙ₊₁`, `√`, `Σ`, `⟶`) : pas de LaTeX. `suite` ajoute un paragraphe après les équations.

**Un visuel dans un bloc** : tout bloc peut porter son propre `visuel`, au même format que le visuel principal.

## 3. Les visuels

Les données d'un graphique vont dans **`LABO_DONNEES`**, sous une clé. Le visuel y renvoie par `donnees: 'cle'`. `titre` et `alt` sont **obligatoires** : ce sont le titre et le texte alternatif lus par les lecteurs d'écran. `legende` s'affiche sous le graphique. Un bouton « Voir les données » est ajouté automatiquement sous chaque graphique.

| `type` | Format des données | Options |
|---|---|---|
| `barres` | `{ unite, decimales, items: [{ label, valeur, accent, groupe }] }` | `axeMin`, `max`, `trier` (du plus grand au plus petit), `groupe` (ne montre que les items de ce groupe) |
| `anneau` | `{ unite, items: [{ label, valeur, serie }] }`, parts dans l'ordre des items | `valeurs: 'toutes'` (valeurs dans la légende) |
| `boite` | `{ unite, valeurs: [...] }` : boîte à moustaches, quartiles de Tukey, atypiques au-delà de 1,5 écart interquartile | `points` (chaque valeur sous la boîte), `axeMin` |
| `multiples` | `{ x: { libelle }, y: { libelle }, panneaux: [{ titre, points: [{ x, y }] }] }` : un petit nuage par panneau, mêmes axes | `tendance`, `coefficient` |
| `colonnes` | idem, avec `theorie` facultatif par item (trait de valeur attendue) | `axeMin` (axe tronqué), `valeurs: 'toutes'`, `max` |
| `plateau` | 40 `items` dans l'ordre d'un plateau de jeu, case 0 en bas à droite | `legendeTitre`, `sens` |
| `courbe` | `{ unite, points: [{ x: 'janv.', y: 12 }] }` | `plage: [début, fin]` (index), `axeMin`, `decimalesAxe`, `reference: { valeur, libelle }` (droite horizontale), `tendance` (droite des moindres carrés), `fenetre: [début, fin]` (index : période grisée avec sa propre tendance, en tirets) |
| `points` | `{ unite, valeurs: [1850, 1900, …] }` | `pas` (largeur d'une classe), `marqueurs: ['mediane', 'moyenne']` |
| `chiffre` | `{ unite, valeurs: […] }` | `stat: 'moyenne'` ou `'mediane'`, `libelle`, `sousTitre` |
| `nuage` | `{ x: { libelle }, y: { libelle }, groupes: [{ id, libelle, serie }], points: [{ label, x, y, groupe }] }` | `tendance`, `coefficient` |
| `causal` | aucune donnée | `cause`, `effets: [a, b]`, `lien` |
| `selecteur` | lit `LABO_GUIDE` | aucune |
| `essais` | `{ min, max, pas, groupes: [{ id, libelle, serie }], valeurs: [{ v, groupe }], references: [{ valeur, libelle, accent }] }` : un point par essai répété (un sondage simulé), empilés par classe | alimenté par un module `interactif` |
| `interactif` | selon le module, voir § 3 bis | `module`, `tableau: false` (pas de « Voir les données ») |
| `simulation` | deux clés de 40 cases : `donnees` (théorie « payer ») et `attendre` (théorie « tenter les doubles ») | `parties` (1, 4, 9 ou 16), `autoplay`. Code dans `labo/simulation.js`, propre au Monopoly |

`accent: true` met une barre en couleur et grise les autres. `serie` (1 à 8) choisit une couleur de série du système de design, toujours dans le même ordre.

### Paire « trompeur / corrigé »

Pour les graphiques qui mentent, la clé `donnees` est déclarée **une seule fois, au niveau de la paire** : les deux graphiques lisent forcément les mêmes valeurs, seule la représentation change.

```js
visuel: {
  type: 'paire',
  donnees: 'ventes-2025',
  mauvais: { type: 'colonnes', axeMin: 95, titre: '…', alt: '…', legende: '…' },
  corrige: { type: 'colonnes', titre: '…', alt: '…', legende: '…' },
},
```

Quand le premier graphique est maladroit plutôt que menteur, `verdict: 'Illisible'` (ou tout autre mot) remplace l'étiquette « Trompeur » ou « Corrigé » de chaque côté.

Exemples dans `data.js` : **axe tronqué** (`axe-zero`), `colonnes` avec `axeMin` côté trompeur. **Cherry picking** (`cherry-picking`), `courbe` avec `plage` côté trompeur, la série complète avec `fenetre` côté corrigé. **Biais d'échantillon** (`biais-echantillon`), `barres` avec `groupe: 'digest'` côté trompeur, toutes les barres côté corrigé.

### 3 bis. Les exemples interactifs

Chaque fiche des « graphiques qui mentent » a au moins un exemple que le lecteur manipule. On le place dans un bloc `interactif` (étiquette « À vous de jouer »), avec un visuel du même type :

```js
{
  type: 'interactif',
  titre: 'Coupez l\'axe vous-même',
  texte: 'Ce que le lecteur doit essayer.',
  visuel: {
    type: 'interactif',
    module: 'axe-tronque',        // le nom d'un module de labo/interactifs.js
    donnees: 'impot-bush',
    titre: '…', alt: '…', legende: '…',
    tableau: false,               // facultatif : masque « Voir les données »
  },
},
```

| `module` | Données | Options |
|---|---|---|
| `axe-tronque` | deux `items`, avant puis après | `depart` (axe au chargement), `axeMax`, `reperes: [{ valeur, libelle }]` |
| `fenetre-tendance` | `points` annuels (`x` = l'année) | `debut`, `fin`, `presets: [{ libelle, debut, fin }]` ou `{ libelle, pire: 10 }` (la période de 10 ans à la pente la plus basse) |
| `sondage` | `{ reel, biaise, tailles, candidat, adversaire, methodes: { hasard, biaise } }` | aucune |

Un nouveau module s'ajoute à `MODULES` dans `labo/interactifs.js` : une fonction `markup` (les réglages, en HTML) et une fonction `init` (les écouteurs, puis `LaboCharts.mount` ou `LaboCharts.update` pour redessiner).

## 4. Images et fichiers de données

Le Labo n'utilise aucune image : tous les visuels sont dessinés en SVG à partir des données, ce qui les garde nets, accessibles et adaptés au thème sombre. Si une fiche a vraiment besoin d'une image (photo, capture d'écran) :

- placez-la dans **`labo/images/`**, nommée comme la fiche (`axe-zero-capture.webp`), en WebP de 1 200 px de large au plus ;
- les fichiers source d'un dataset (CSV, script de simulation) vont dans **`labo/datasets/`**, et les valeurs utiles sont recopiées dans `LABO_DONNEES` ;
- affichez-la avec le visuel `image` :

```js
visuel: {
  type: 'image',
  src: 'images/axe-zero-capture.webp',   // chemin relatif à labo/index.html
  largeur: 1200, hauteur: 800,            // facultatif, évite un saut de mise en page
  alt: '…', legende: '…',
  credit: 'Auteur, source, licence',      // obligatoire si la licence l'exige (CC BY, CC BY-SA…)
  creditUrl: 'https://…',                 // facultatif
},
```

Une photo ou une capture s'affiche telle quelle. Pour un **schéma SVG** (Wikimedia Commons, par exemple), mieux vaut l'intégrer à la page pour qu'il suive le thème clair ou sombre :

1. gardez le fichier d'origine dans `labo/images/` et vérifiez qu'il ne contient pas de `<script>` ;
2. créez à côté un `.js` qui l'expose dans `LABO_SCHEMAS['id']`, en remplaçant ses couleurs par les tokens (`var(--color-text)` pour le trait, `var(--color-bg)` pour le fond, `var(--color-data-1)` pour l'accent). Modèle : `labo/images/biais-selection-avion.js` ;
3. chargez ce script dans `labo/index.html`, avant `data.js`, et ajoutez `schema: 'id'` au visuel. `src` reste l'image de repli.

## 5. Vérifier

1. Ouvrez `labo/index.html` : la fiche apparaît dans sa rubrique, avec le bon compteur.
2. Ouvrez `labo/index.html?fiche=votre-id` : visuel, blocs, numéros de volets.
3. Réduisez la fenêtre à la largeur d'un téléphone et basculez en thème sombre (bouton en pied de page).
4. Ouvrez la console (F12) : une clé de données ou un type de visuel inconnus y sont signalés.

## Adresses partageables

- Une rubrique : `labo/index.html?rubrique=notions`
- Une fiche : `labo/index.html?fiche=moyenne-vs-mediane`
- Le sélecteur, sur une question : `labo/index.html?fiche=quel-graphique&question=relation`
