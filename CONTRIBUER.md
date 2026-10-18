# Ajouter une fiche au Labo data

Tout le contenu du Labo data est dans **`labo/data.js`**. Ajouter une fiche, c'est ajouter une entrée à ce fichier : pas de HTML à toucher. La page génère le sommaire, les filtres, la fiche détaillée et les graphiques.

## Les fichiers

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `labo/data.js` | Rubriques, données des graphiques, guide « Quel graphique ? », fiches | **Oui, c'est le seul** |
| `labo/charts.js` | Dessin des graphiques en SVG | Seulement pour un nouveau type de graphique |
| `labo/app.js` | Sommaire, filtres, fiche, adresses | Non |
| `css/lab.css` | Styles propres au Labo | Non |

## 1. Annoncer une fiche « à venir »

Une ligne suffit. Elle apparaît en gris, non cliquable :

```js
{ id: 'axe-zero', rubrique: 'mensonges', statut: 'a-venir', titre: 'L\'axe qui ne part pas de zéro' },
```

Pour une astuce Excel, ajoutez le thème : `theme: 'recherche'` (`recherche`, `texte`, `dates`, `tcd`, `modernes`).

## 2. Publier une fiche

Complétez l'entrée et passez `statut` à `'publiee'`. Le gabarit est toujours le même, pensé pour un carrousel Instagram : **volet 1** = titre et visuel principal, **volets 2 à 6** = les blocs.

```js
{
  id: 'axe-zero',                  // unique, en minuscules avec tirets : il devient l'adresse ?fiche=axe-zero
  rubrique: 'mensonges',           // datasets | mensonges | excel | choisir | notions
  theme: 'recherche',              // Excel uniquement
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

**Bloc formule (Excel)** : ajoutez `formule: '=RECHERCHEX(valeur; plage; retour)'`, affichée en bloc de code au-dessus du texte.

**Équations** : tout bloc peut porter `equations: [{ eq: 'π = π · P', note: 'ce que dit la formule' }]`, affichées en grand sous le texte, chacune suivie de son explication. Écrivez-les en Unicode (indices `pᵢⱼ`, `Xₙ₊₁`, `√`, `Σ`, `⟶`) : pas de LaTeX. `suite` ajoute un paragraphe après les équations.

**Un visuel dans un bloc** : tout bloc peut porter son propre `visuel`, au même format que le visuel principal.

## 3. Les visuels

Les données d'un graphique vont dans **`LABO_DONNEES`**, sous une clé. Le visuel y renvoie par `donnees: 'cle'`. `titre` et `alt` sont **obligatoires** : ce sont le titre et le texte alternatif lus par les lecteurs d'écran. `legende` s'affiche sous le graphique. Un bouton « Voir les données » est ajouté automatiquement sous chaque graphique.

| `type` | Format des données | Options |
|---|---|---|
| `barres` | `{ unite, decimales, items: [{ label, valeur, accent }] }` | `axeMin`, `max`, `trier` (du plus grand au plus petit) |
| `anneau` | `{ unite, items: [{ label, valeur, serie }] }`, parts dans l'ordre des items | `valeurs: 'toutes'` (valeurs dans la légende) |
| `boite` | `{ unite, valeurs: [...] }` : boîte à moustaches, quartiles de Tukey, atypiques au-delà de 1,5 écart interquartile | `points` (chaque valeur sous la boîte), `axeMin` |
| `multiples` | `{ x: { libelle }, y: { libelle }, panneaux: [{ titre, points: [{ x, y }] }] }` : un petit nuage par panneau, mêmes axes | `tendance`, `coefficient` |
| `colonnes` | idem, avec `theorie` facultatif par item (trait de valeur attendue) | `axeMin` (axe tronqué), `valeurs: 'toutes'`, `max` |
| `plateau` | 40 `items` dans l'ordre d'un plateau de jeu, case 0 en bas à droite | `legendeTitre`, `sens` |
| `courbe` | `{ unite, points: [{ x: 'janv.', y: 12 }] }` | `plage: [début, fin]` (index), `axeMin`, `decimalesAxe`, `reference: { valeur, libelle }` (droite horizontale) |
| `points` | `{ unite, valeurs: [1850, 1900, …] }` | `pas` (largeur d'une classe), `marqueurs: ['mediane', 'moyenne']` |
| `chiffre` | `{ unite, valeurs: […] }` | `stat: 'moyenne'` ou `'mediane'`, `libelle`, `sousTitre` |
| `nuage` | `{ x: { libelle }, y: { libelle }, groupes: [{ id, libelle, serie }], points: [{ label, x, y, groupe }] }` | `tendance`, `coefficient` |
| `causal` | aucune donnée | `cause`, `effets: [a, b]`, `lien` |
| `tableur` | `{ colonnes: […], lignes: [[…], …] }` | `cellule`, `formule`, `formuleEn`, `filtre: { colonne, egal }` ou `resultat: [[…]]` |
| `selecteur` | lit `LABO_GUIDE` | aucune |
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

Idées pour les cas à venir : **axe tronqué**, `colonnes` avec `axeMin` côté trompeur. **Cherry picking**, `courbe` avec `plage` côté trompeur, la série complète côté corrigé. **Biais d'échantillon**, deux `barres` sur une clé qui contient l'échantillon et la population.

## 4. Images et fichiers de données

Le Labo n'utilise aucune image : tous les visuels sont dessinés en SVG à partir des données, ce qui les garde nets, accessibles et adaptés au thème sombre. Si une fiche a vraiment besoin d'une image (photo, capture d'écran) :

- placez-la dans **`labo/images/`**, nommée comme la fiche (`axe-zero-capture.webp`), en WebP de 1 200 px de large au plus ;
- les fichiers source d'un dataset (CSV, script de simulation) vont dans **`labo/datasets/`**, et les valeurs utiles sont recopiées dans `LABO_DONNEES` ;
- l'affichage d'une image n'existe pas encore comme type de visuel : demandez-le, c'est un ajout de quelques lignes dans `labo/app.js`.

## 5. Vérifier

1. Ouvrez `labo/index.html` : la fiche apparaît dans sa rubrique, avec le bon compteur.
2. Ouvrez `labo/index.html?fiche=votre-id` : visuel, blocs, numéros de volets.
3. Réduisez la fenêtre à la largeur d'un téléphone et basculez en thème sombre (bouton en pied de page).
4. Ouvrez la console (F12) : une clé de données ou un type de visuel inconnus y sont signalés.

## Adresses partageables

- Une rubrique : `labo/index.html?rubrique=excel`, et un thème : `&theme=modernes`
- Une fiche : `labo/index.html?fiche=moyenne-vs-mediane`
- Le sélecteur, sur une question : `labo/index.html?fiche=quel-graphique&question=relation`
