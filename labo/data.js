// Labo data : tout le contenu de la section. Ajouter une fiche = ajouter une entrée à LABO_FICHES.
// Format détaillé et exemples : CONTRIBUER.md à la racine du site.
// Script classique (et non JSON) pour que la page fonctionne aussi ouverte en local, sans serveur.

// ═══════════════════════════════
//  RUBRIQUES (ordre d'affichage)
// ═══════════════════════════════
const LABO_RUBRIQUES = [
  {
    id: 'datasets',
    titre: 'Datasets fun',
    description: 'Des mini-études de bout en bout sur des données ludiques : une question, des données, une méthode, un résultat.',
  },
  {
    id: 'mensonges',
    titre: 'Les graphiques qui mentent',
    description: 'Les mêmes données, deux graphiques : celui qui trompe et celui qui dit vrai. Seule la représentation change.',
  },
  {
    id: 'excel',
    titre: 'Astuces Excel',
    description: 'Un problème, une formule, un exemple concret. Classées par thème.',
    themes: [
      { id: 'recherche', titre: 'Recherche' },
      { id: 'texte', titre: 'Texte' },
      { id: 'dates', titre: 'Dates' },
      { id: 'tcd', titre: 'Tableaux croisés dynamiques' },
      { id: 'modernes', titre: 'Formules modernes' },
    ],
  },
  {
    id: 'choisir',
    titre: 'Quel graphique pour quelle question ?',
    description: 'Partir de la question, pas du graphique. Un guide pour choisir la bonne forme, et savoir quand l\'éviter.',
  },
  {
    id: 'notions',
    titre: 'Notions de data vulgarisées',
    description: 'Les idées qui reviennent partout, expliquées avec un dessin plutôt qu\'une équation.',
  },
];

// ═══════════════════════════════
//  DONNÉES DES GRAPHIQUES
//  Une paire « trompeur / corrigé » pointe vers UNE seule clé : les deux graphiques lisent les mêmes valeurs.
// ═══════════════════════════════
// Les 40 cases du Monopoly, édition française, dans l'ordre du plateau (0 = Départ, 10 = Prison).
// Les fréquences sont les probabilités exactes de la chaîne de Markov : labo/datasets/monopoly-markov.js
const MONOPOLY_CASES = [
  'Départ', 'Belleville', 'Caisse', 'Lecourbe', 'Impôts', 'Montparnasse', 'Vaugirard', 'Chance', 'Courcelles', 'République',
  'Prison', 'Villette', 'Électricité', 'Neuilly', 'Paradis', 'Gare de Lyon', 'Mozart', 'Caisse', 'Saint-Michel', 'Pigalle',
  'Parc gratuit', 'Matignon', 'Chance', 'Malesherbes', 'Henri-Martin', 'Gare du Nord', 'Saint-Honoré', 'Bourse', 'Eaux', 'La Fayette',
  'Allez en prison', 'Breteuil', 'Foch', 'Caisse', 'Capucines', 'Saint-Lazare', 'Chance', 'Champs-Élysées', 'Taxe de luxe', 'Rue de la Paix',
];
const monopolyCases = valeurs => ({
  unite: '%',
  decimales: 2,
  colonneLabel: 'Case',
  colonneValeur: 'Part des lancers qui finissent sur la case',
  items: MONOPOLY_CASES.map((label, i) => ({ label, valeur: valeurs[i], accent: i === 10 })),
});

// Douze mois fictifs mais réalistes, construits selon le modèle de la cause commune : glaces ≈ 2,6 T − 6 (milliers),
// coups de soleil ≈ 3 T − 18 (consultations), plus un bruit propre à chaque série, indépendant de l'autre.
// r(glaces, coups) = 0,962 ; à température égale (corrélation partielle), −0,075.
const GLACES_MOIS = [
  { mois: 'Janvier', court: 'Janv.', t: 7, glaces: 13, coups: 6 },
  { mois: 'Février', court: 'Févr.', t: 8, glaces: 14, coups: 9 },
  { mois: 'Mars', court: 'Mars', t: 11, glaces: 23, coups: 12 },
  { mois: 'Avril', court: 'Avr.', t: 14, glaces: 32, coups: 19 },
  { mois: 'Mai', court: 'Mai', t: 18, glaces: 37, coups: 38 },
  { mois: 'Juin', court: 'Juin', t: 22, glaces: 56, coups: 52 },
  { mois: 'Juillet', court: 'Juil.', t: 25, glaces: 58, coups: 60 },
  { mois: 'Août', court: 'Août', t: 25, glaces: 61, coups: 58 },
  { mois: 'Septembre', court: 'Sept.', t: 21, glaces: 50, coups: 36 },
  { mois: 'Octobre', court: 'Oct.', t: 16, glaces: 39, coups: 22 },
  { mois: 'Novembre', court: 'Nov.', t: 11, glaces: 19, coups: 8 },
  { mois: 'Décembre', court: 'Déc.', t: 8, glaces: 14, coups: 6 },
];
const GLACES_GROUPES = [
  { id: 'frais', libelle: 'Moins de 12 °C', serie: 3 },
  { id: 'doux', libelle: '12 à 20 °C', serie: 5 },
  { id: 'chaud', libelle: 'Plus de 20 °C', serie: 1 },
];
const glacesGroupe = t => t < 12 ? 'frais' : t <= 20 ? 'doux' : 'chaud';

const LABO_DONNEES = {
  // Salaires nets mensuels des 20 salariés d'une entreprise fictive, dont 2 dirigeants
  salaires: {
    libelle: 'Salaire net mensuel',
    unite: '€',
    valeurs: [1850, 1900, 1950, 2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400, 2500, 2600, 2700, 2800, 3000, 3200, 9500, 14000],
  },
  // Moyenne des 20 salaires quand le salaire du PDG s varie, les 19 autres fixes : (51 800 + s) / 20
  'salaires-pdg': {
    unite: '€',
    colonneLabel: 'Salaire du PDG',
    colonneValeur: 'Salaire moyen de l\'entreprise',
    points: Array.from({ length: 19 }, (_, i) => 4000 + i * 2000)
      .map(s => ({ x: s.toLocaleString('fr-FR'), y: (51800 + s) / 20 })),
  },
  // Écart moyen E(a) = (1/n) Σ |xᵢ − a| entre une valeur résumé a et chacun des 20 salaires
  'salaires-ecart': {
    unite: '€',
    colonneLabel: 'Valeur résumé a',
    colonneValeur: 'Écart moyen aux 20 salaires',
    points: [
      1790, 1690, 1590, 1490, 1395, 1320, 1265, 1230, 1215, 1220, 1240, 1270, 1310, 1360, 1420, 1480,
      1550, 1620, 1700, 1780, 1860, 1940, 2020, 2100, 2180, 2260, 2340, 2420, 2500, 2580, 2660,
    ].map((y, i) => ({ x: (1500 + i * 100).toLocaleString('fr-FR'), y })),
  },
  // Insee, base Tous salariés 2024 : déciles du salaire net mensuel en EQTP, secteur privé (Insee Première n° 2079)
  'salaires-france-deciles': {
    unite: '€',
    colonneLabel: 'Part des salariés qui gagnent moins',
    colonneValeur: 'Salaire net mensuel (EQTP)',
    points: [1492, 1669, 1823, 1992, 2190, 2442, 2785, 3305, 4334].map((y, i) => ({ x: `${(i + 1) * 10} %`, y })),
  },
  // Répartition par tranches de 500 €, estimée par interpolation linéaire entre les déciles Insee 2024 (et le 99e centile)
  'salaires-france-tranches': {
    unite: '%',
    decimales: 1,
    decimalesAxe: 0,
    colonneLabel: 'Tranche de salaire net (milliers d\'euros)',
    colonneValeur: 'Part des salariés (estimation)',
    items: [
      { label: '< 1,5', valeur: 10.5 },
      { label: '1,5-2', valeur: 29.9 },
      { label: '2-2,5', valeur: 21.3, accent: true },
      { label: '2,5-3', valeur: 12.4, accent: true },
      { label: '3-3,5', valeur: 7.8 },
      { label: '3,5-4', valeur: 4.9 },
      { label: '4-4,5', valeur: 3.5 },
      { label: '≥ 4,5', valeur: 9.7 },
    ],
  },

  // Monopoly, édition française. Une observation = un lancer de dés : la case où le pion finit.
  // Valeurs exactes (chaîne de Markov), confirmées par une simulation d'un million de lancers.
  'monopoly-groupes': {
    unite: '%',
    decimales: 2,
    decimalesAxe: 0,
    colonneLabel: 'Groupe',
    colonneValeur: 'Fréquentation moyenne par case',
    items: [
      { label: 'Orange', valeur: 2.93, accent: true },
      { label: 'Rouge', valeur: 2.90 },
      { label: 'Jaune', valeur: 2.69 },
      { label: 'Gares', valeur: 2.62 },
      { label: 'Vert', valeur: 2.58 },
      { label: 'Rose', valeur: 2.51 },
      { label: 'Compagnies', valeur: 2.48 },
      { label: 'Marron', valeur: 2.41 },
      { label: 'Bleu foncé', valeur: 2.38 },
      { label: 'Bleu ciel', valeur: 2.33 },
    ],
  },
  // Stratégie « payer pour sortir de prison » au tour suivant
  'monopoly-cases': monopolyCases([
    3.08, 2.62, 1.76, 2.20, 2.38, 2.26, 2.33, 1.33, 2.36, 2.31, 6.24, 2.69, 2.29, 2.37, 2.47, 3.10, 2.79, 2.41, 2.94, 3.06,
    2.85, 2.81, 1.56, 2.71, 3.17, 2.73, 2.73, 2.70, 2.66, 2.63, 0, 2.68, 2.60, 2.17, 2.46, 2.38, 1.28, 2.15, 2.15, 2.60,
  ]),
  // Stratégie « tenter les doubles » : jusqu'à 3 lancers en prison
  'monopoly-cases-attendre': monopolyCases([
    2.90, 2.46, 1.66, 2.08, 2.24, 2.13, 2.19, 1.25, 2.22, 2.18, 11.57, 2.55, 2.32, 2.17, 2.43, 2.81, 2.68, 2.13, 2.82, 2.78,
    2.80, 2.59, 1.56, 2.55, 2.99, 2.55, 2.56, 2.54, 2.51, 2.48, 0, 2.52, 2.45, 2.05, 2.32, 2.24, 1.20, 2.02, 2.03, 2.47,
  ]),
  // Somme de deux dés : 36 combinaisons équiprobables
  'deux-des': {
    unite: '%',
    decimales: 1,
    colonneLabel: 'Somme des deux dés',
    colonneValeur: 'Probabilité',
    items: [
      { label: '2', valeur: 2.78 }, { label: '3', valeur: 5.56 }, { label: '4', valeur: 8.33 }, { label: '5', valeur: 11.11 },
      { label: '6', valeur: 13.89, accent: true }, { label: '7', valeur: 16.67 }, { label: '8', valeur: 13.89, accent: true },
      { label: '9', valeur: 11.11, accent: true }, { label: '10', valeur: 8.33 }, { label: '11', valeur: 5.56 }, { label: '12', valeur: 2.78 },
    ],
  },
  // Probabilité que le pion soit sur la case Prison après n lancers, en partant de Départ (μ₀ Pⁿ)
  'monopoly-convergence': {
    unite: '%',
    decimales: 2,
    colonneValeur: 'Probabilité d\'être sur la case Prison',
    points: [
      9.55, 6.85, 3.01, 8.03, 6.42, 5.33, 7.06, 6.02, 5.90, 6.54, 6.17, 6.22, 6.34, 6.15, 6.22, 6.28, 6.23, 6.25, 6.24, 6.22,
      6.24, 6.24, 6.24, 6.24, 6.24, 6.23, 6.24, 6.24, 6.24, 6.24,
    ].map((y, i) => ({ x: String(i + 1), y })),
  },
  // Hôtel sur tout le groupe : nombre de lancers adverses pour rembourser terrains et constructions
  'monopoly-rentabilite': {
    unite: 'lancers',
    decimales: 1,
    decimalesAxe: 0,
    colonneLabel: 'Groupe',
    colonneValeur: 'Lancers adverses pour rentabiliser',
    items: [
      { label: 'Orange', valeur: 24.2, accent: true },
      { label: 'Bleu ciel', valeur: 27.0 },
      { label: 'Rouge', valeur: 31.5 },
      { label: 'Rose', valeur: 32.2 },
      { label: 'Jaune', valeur: 32.5 },
      { label: 'Bleu foncé', valeur: 32.6 },
      { label: 'Marron', valeur: 37.7 },
      { label: 'Vert', valeur: 38.5 },
    ],
  },
  // Hôtel sur tout le groupe : loyer moyen encaissé à chaque lancer d'un adversaire (Σ πᵢ × loyerᵢ)
  'monopoly-loyer': {
    unite: '€',
    decimales: 0,
    colonneLabel: 'Groupe',
    colonneValeur: 'Loyer moyen par lancer adverse',
    items: [
      { label: 'Vert', valeur: 102 },
      { label: 'Jaune', valeur: 94 },
      { label: 'Rouge', valeur: 93 },
      { label: 'Orange', valeur: 85, accent: true },
      { label: 'Bleu foncé', valeur: 84 },
      { label: 'Rose', valeur: 60 },
      { label: 'Bleu ciel', valeur: 40 },
      { label: 'Marron', valeur: 16 },
    ],
  },

  // ----- Fiche « Les glaces donnent-elles des coups de soleil ? » -----
  glaces: {
    x: { libelle: 'Glaces vendues (milliers)', court: 'milliers de glaces' },
    y: { libelle: 'Coups de soleil (consultations)', court: 'consultations' },
    groupes: GLACES_GROUPES,
    points: GLACES_MOIS.map(m => ({ label: `${m.mois}, ${m.t} °C`, x: m.glaces, y: m.coups, groupe: glacesGroupe(m.t) })),
  },
  // Les trois séries centrées réduites, z = (x − x̄) / σ : la même échelle pour des grandeurs sans unité commune
  'glaces-z': (() => {
    const z = v => {
      const m = v.reduce((s, x) => s + x, 0) / v.length;
      const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length);
      return v.map(x => Math.round(((x - m) / sd) * 100) / 100);
    };
    return {
      unite: 'σ',
      decimales: 2,
      decimalesAxe: 0,
      colonneLabel: 'Mois',
      x: GLACES_MOIS.map(m => m.court),
      series: [
        { libelle: 'Glaces vendues', serie: 3, valeurs: z(GLACES_MOIS.map(m => m.glaces)) },
        { libelle: 'Coups de soleil', serie: 1, valeurs: z(GLACES_MOIS.map(m => m.coups)) },
        { libelle: 'Température', serie: 6, tirets: true, valeurs: z(GLACES_MOIS.map(m => m.t)) },
      ],
    };
  })(),
  // Chaque effet face à la cause commune, sur les mêmes axes
  'glaces-temperature': {
    x: { libelle: 'température (°C)' },
    y: { libelle: 'valeur du mois' },
    panneaux: [
      { titre: 'Glaces vendues (milliers)', points: GLACES_MOIS.map(m => ({ x: m.t, y: m.glaces })) },
      { titre: 'Coups de soleil (consultations)', points: GLACES_MOIS.map(m => ({ x: m.t, y: m.coups })) },
    ],
  },
  // Résidus de chaque série après régression sur la température : ce que la chaleur n'explique pas
  'glaces-residus': (() => {
    const t = GLACES_MOIS.map(m => m.t);
    const mean = v => v.reduce((s, x) => s + x, 0) / v.length;
    const residus = y => {
      const mt = mean(t), my = mean(y);
      const b = t.reduce((s, x, i) => s + (x - mt) * (y[i] - my), 0) / t.reduce((s, x) => s + (x - mt) ** 2, 0);
      return y.map((v, i) => Math.round((v - my - b * (t[i] - mt)) * 10) / 10);
    };
    const rg = residus(GLACES_MOIS.map(m => m.glaces)), rc = residus(GLACES_MOIS.map(m => m.coups));
    return {
      x: { libelle: 'Glaces en plus ou en moins (milliers)', court: 'milliers de glaces', decimales: 1 },
      y: { libelle: 'Coups de soleil en plus ou en moins', court: 'consultations', decimales: 1 },
      groupes: GLACES_GROUPES,
      points: GLACES_MOIS.map((m, i) => ({ label: `${m.mois}, ${m.t} °C`, x: rg[i], y: rc[i], groupe: glacesGroupe(m.t) })),
    };
  })(),
  // Loi exacte de r entre deux variables indépendantes, n = 12 : f(r) = (315/256)(1 − r²)⁴, intégrée par tranche de 0,1
  'r-hasard-12': {
    unite: '%',
    decimales: 1,
    decimalesAxe: 0,
    colonneLabel: 'Tranche de r (centre)',
    colonneValeur: 'Probabilité entre deux séries indépendantes de 12 valeurs',
    items: [0.0, 0.1, 0.5, 1.4, 2.9, 5.0, 7.3, 9.5, 11.2, 12.1, 12.1, 11.2, 9.5, 7.3, 5.0, 2.9, 1.4, 0.5, 0.1, 0.0]
      .map((valeur, i) => {
        const centre = -0.95 + i * 0.1;
        return { label: centre.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), valeur, accent: Math.abs(centre) > 0.6 };
      }),
  },
  // Corrélations publiées entre des grandeurs sans lien de cause
  'correlations-absurdes': {
    decimales: 2,
    decimalesAxe: 1,
    colonneLabel: 'Corrélation',
    colonneValeur: 'Coefficient r',
    items: [
      { label: 'Glaces / coups de soleil', valeur: 0.96, accent: true },
      { label: 'Chocolat / prix Nobel', valeur: 0.79 },
      { label: 'Nicolas Cage / noyades', valeur: 0.67 },
      { label: 'Cigognes / naissances', valeur: 0.62 },
    ],
  },
  // Un été fictif : 40 % de jours chauds. Coups de soleil : 35 % par jour chaud, 5 % par jour frais, glace ou pas.
  'glaces-ajustement': {
    unite: '%',
    colonneLabel: 'Groupe',
    colonneValeur: 'Part des plagistes avec un coup de soleil',
    items: [
      { label: 'Glace, brut', valeur: 26 },
      { label: 'Sans glace, brut', valeur: 11 },
      { label: 'Glace, ajusté', valeur: 17, accent: true },
      { label: 'Sans glace, ajusté', valeur: 17, accent: true },
    ],
  },

  // ----- Fiche « Quel graphique ? » -----
  // Loi de Stevens ψ = k·S^β : rapport perçu quand la grandeur réelle double, 2^β
  'perception-stevens': {
    decimales: 2,
    decimalesAxe: 1,
    colonneLabel: 'La grandeur qui double',
    colonneValeur: 'Rapport perçu, 2^β',
    items: [
      { label: 'Longueur (β ≈ 1)', valeur: 2.00, accent: true },
      { label: 'Surface (β ≈ 0,7)', valeur: 1.62 },
      { label: 'Volume (β ≈ 0,6)', valeur: 1.52 },
      { label: 'Luminosité (β ≈ 0,33)', valeur: 1.26 },
    ],
  },
  // Chiffre d'affaires de 4 magasins fictifs : 10 % d'écart entre le premier et le dernier
  magasins: {
    unite: 'k€',
    colonneLabel: 'Magasin',
    colonneValeur: 'Chiffre d\'affaires annuel',
    items: [
      { label: 'Nantes', valeur: 55 },
      { label: 'Lille', valeur: 52 },
      { label: 'Rennes', valeur: 51 },
      { label: 'Lyon', valeur: 50 },
    ],
  },
  // Cinq marques fictives aux parts proches, dans l'ordre où un tableur les recevrait
  'parts-proches': {
    unite: '%',
    colonneLabel: 'Marque',
    colonneValeur: 'Part de marché',
    items: [
      { label: 'Bravo', valeur: 21 },
      { label: 'Écho', valeur: 17 },
      { label: 'Alpha', valeur: 23 },
      { label: 'Delta', valeur: 19 },
      { label: 'Charlie', valeur: 20 },
    ],
  },
  // NOAA GML, moyennes annuelles du CO₂ à Mauna Loa (fichier co2_annmean_mlo.txt, version du 9 octobre 2026), une année sur cinq
  'co2-mauna-loa': {
    unite: 'ppm',
    decimales: 2,
    decimalesAxe: 0,
    colonneLabel: 'Année',
    colonneValeur: 'CO₂ atmosphérique, moyenne annuelle',
    points: [
      [1960, 316.91], [1965, 320.04], [1970, 325.68], [1975, 331.13], [1980, 338.76], [1985, 346.35], [1990, 354.45],
      [1995, 360.97], [2000, 369.71], [2005, 379.98], [2010, 390.10], [2015, 401.01], [2020, 414.21], [2025, 427.35],
    ].map(([x, y]) => ({ x: String(x), y })),
  },
  // Quartet d'Anscombe (1973) : 4 jeux de 11 points, mêmes moyennes, variances, corrélation et droite de régression
  anscombe: (() => {
    const x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
    const jeux = [
      { titre: 'I. Une vraie droite', x, y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68] },
      { titre: 'II. Une courbe', x, y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74] },
      { titre: 'III. Un point aberrant', x, y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73] },
      { titre: 'IV. Un seul point décide', x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89] },
    ];
    return {
      x: { libelle: 'x' },
      y: { libelle: 'y' },
      panneaux: jeux.map(j => ({ titre: j.titre, points: j.x.map((xi, i) => ({ x: xi, y: j.y[i] })) })),
    };
  })(),

  // Feuille d'exemple pour les astuces Excel
  commandes: {
    colonnes: ['Client', 'Ville', 'Montant'],
    lignes: [
      ['Amélie', 'Toulouse', '120'],
      ['Bruno', 'Paris', '85'],
      ['Chloé', 'Madrid', '240'],
      ['David', 'Toulouse', '60'],
      ['Emma', 'Paris', '310'],
      ['Farid', 'Toulouse', '175'],
      ['Gaëlle', 'Madrid', '95'],
      ['Hugo', 'Paris', '130'],
    ],
  },
};

// ═══════════════════════════════
//  GUIDE « QUEL GRAPHIQUE ? »
//  court : libellé du bouton. picto : barres-h, colonnes, sucette, courbe, aires, empilees, anneau, treemap, nuage, bulles,
//  chaleur, histogramme, boite, bande, pente, halteres, carte, symboles, chiffre
// ═══════════════════════════════
const LABO_GUIDE = [
  {
    id: 'comparer',
    court: 'Comparer',
    question: 'Comparer des valeurs entre catégories',
    exemple: 'Quel magasin vend le plus ?',
    graphiques: [
      { nom: 'Barres horizontales', picto: 'barres-h', quand: 'Pour classer des catégories, surtout avec des libellés longs. Triez de la plus grande à la plus petite.', eviter: 'Au-delà d\'une vingtaine de catégories : un tableau trié sera plus lisible.' },
      { nom: 'Colonnes', picto: 'colonnes', quand: 'Pour quelques catégories aux noms courts, ou des catégories qui ont un ordre naturel (tranches d\'âge).', eviter: 'Quand les libellés sont longs : ils se chevauchent ou finissent en biais.' },
      { nom: 'Points ou sucettes', picto: 'sucette', quand: 'Pour beaucoup de catégories aux valeurs proches, ou quand l\'axe ne peut pas partir de zéro : un point se lit par sa position, pas par sa longueur.', eviter: 'Pour des totaux qui s\'additionnent (un chiffre d\'affaires) : la barre, qui part de zéro, reste plus parlante.' },
    ],
  },
  {
    id: 'evolution',
    court: 'Évolution',
    question: 'Montrer une évolution dans le temps',
    exemple: 'Nos ventes augmentent-elles depuis janvier ?',
    graphiques: [
      { nom: 'Courbe', picto: 'courbe', quand: 'Pour une tendance sur de nombreuses périodes. Jusqu\'à 4 ou 5 courbes, chacune nommée au bout de sa ligne.', eviter: 'Pour des catégories sans ordre : relier des points suggère une continuité qui n\'existe pas.' },
      { nom: 'Colonnes', picto: 'colonnes', quand: 'Pour peu de périodes (les 4 trimestres) ou des volumes qui se comparent d\'une période à l\'autre.', eviter: 'Sur 50 périodes ou plus : la forêt de colonnes masque la tendance.' },
      { nom: 'Aires empilées', picto: 'aires', quand: 'Pour suivre un total et sa composition dans le temps, avec 2 ou 3 couches.', eviter: 'Pour suivre une couche du milieu : seule celle du bas repose sur une base droite, les autres ondulent avec leurs voisines.' },
    ],
  },
  {
    id: 'ecart',
    court: 'Avant / après',
    question: 'Comparer deux moments ou deux groupes, catégorie par catégorie',
    exemple: 'Quels rayons ont progressé entre 2024 et 2025 ?',
    graphiques: [
      { nom: 'Graphique en pente', picto: 'pente', quand: 'Pour deux dates et une dizaine de catégories au plus : la pente de chaque trait dit tout de suite qui monte et qui baisse.', eviter: 'Avec plus de deux dates (passez à la courbe), ou quand trop de traits se croisent.' },
      { nom: 'Haltères', picto: 'halteres', quand: 'Pour montrer l\'écart entre deux valeurs, une ligne par catégorie, triées par écart.', eviter: 'Quand les deux points se recouvrent presque partout : tracez plutôt la différence en barres.' },
    ],
  },
  {
    id: 'repartition',
    court: 'Répartition',
    question: 'Montrer une répartition, les parts d\'un tout',
    exemple: 'Comment se répartit notre budget ?',
    graphiques: [
      { nom: 'Barres empilées à 100 %', picto: 'empilees', quand: 'Pour comparer la même répartition entre plusieurs groupes ou années.', eviter: 'Avec plus de 5 segments : seuls le premier et le dernier se comparent facilement.' },
      { nom: 'Anneau ou camembert', picto: 'anneau', quand: 'Pour une seule répartition, 2 à 5 parts, quand une part domine nettement.', eviter: 'Pour comparer des parts proches, ou plusieurs camemberts entre eux : l\'œil compare mal les angles.' },
      { nom: 'Treemap', picto: 'treemap', quand: 'Pour une répartition en beaucoup de parts, ou à deux niveaux (un budget par poste, puis par sous-poste).', eviter: 'Pour comparer précisément deux parts : l\'œil sous-estime les surfaces.' },
    ],
  },
  {
    id: 'relation',
    court: 'Relation',
    question: 'Montrer la relation entre deux variables',
    exemple: 'Les clients qui viennent souvent dépensent-ils plus ?',
    graphiques: [
      { nom: 'Nuage de points', picto: 'nuage', quand: 'Pour voir si deux mesures varient ensemble, et repérer les valeurs atypiques.', eviter: 'Pour conclure à une cause : une corrélation n\'est pas une preuve.' },
      { nom: 'Graphique à bulles', picto: 'bulles', quand: 'Pour ajouter une troisième mesure, portée par la taille des bulles.', eviter: 'Quand les bulles se recouvrent, ou quand la taille exacte compte : l\'œil sous-estime les surfaces.' },
      { nom: 'Carte de chaleur', picto: 'chaleur', quand: 'Pour croiser deux catégories (jour × heure) et repérer les zones chaudes.', eviter: 'Pour lire des valeurs précises : affichez le chiffre dans la case ou dans un tableau.' },
    ],
  },
  {
    id: 'distribution',
    court: 'Distribution',
    question: 'Montrer comment des valeurs se distribuent',
    exemple: 'Nos délais de livraison sont-ils réguliers ?',
    graphiques: [
      { nom: 'Histogramme', picto: 'histogramme', quand: 'Pour voir la forme des données : symétrique, étalée d\'un côté, avec plusieurs bosses.', eviter: 'Avec très peu de valeurs (moins de 20) : montrez plutôt chaque point.' },
      { nom: 'Boîte à moustaches', picto: 'boite', quand: 'Pour comparer les distributions de plusieurs groupes côte à côte.', eviter: 'Pour un public non initié, sans légende : la boîte demande une explication. Et pour une distribution à deux bosses, que la boîte cache.' },
      { nom: 'Points, un par valeur', picto: 'bande', quand: 'Pour moins d\'une centaine de valeurs : chaque individu reste visible, valeurs atypiques comprises.', eviter: 'Au-delà de quelques centaines de points : ils se recouvrent, passez à l\'histogramme.' },
    ],
  },
  {
    id: 'lieu',
    court: 'Lieu',
    question: 'Montrer une donnée qui dépend du lieu',
    exemple: 'Dans quels départements nos clients sont-ils les plus nombreux ?',
    graphiques: [
      { nom: 'Carte choroplèthe', picto: 'carte', quand: 'Pour un taux ou une part (pour 1 000 habitants), sur des zones de tailles comparables. Une seule teinte, du clair au foncé.', eviter: 'Pour des effectifs bruts : les grandes zones peu peuplées dominent la carte. Rapportez d\'abord à la population.' },
      { nom: 'Symboles proportionnels', picto: 'symboles', quand: 'Pour des effectifs (clients par ville) : un cercle par lieu, de surface proportionnelle à la valeur.', eviter: 'Avec un rayon proportionnel à la valeur : un cercle de rayon double a une surface quatre fois plus grande.' },
    ],
  },
  {
    id: 'chiffre',
    court: 'Un seul chiffre',
    question: 'Mettre en avant un seul chiffre',
    exemple: 'Combien de clients ce mois-ci ?',
    graphiques: [
      { nom: 'Grand chiffre', picto: 'chiffre', quand: 'Quand le message tient en une valeur. Ajoutez la comparaison qui lui donne du sens (sur un an, contre l\'objectif).', eviter: 'Seul, sans contexte : 3 290 € est-ce beaucoup ? Et quand il cache une distribution très étalée.' },
    ],
  },
];

// ═══════════════════════════════
//  FICHES
//  statut : 'publiee' (cliquable) ou 'a-venir' (visible, discrète, non cliquable)
//  blocs.type : definition, exemple, erreur, astuce, retenir, probleme, formule, question, donnees, methode, resultat, limite
// ═══════════════════════════════
const LABO_FICHES = [

  // ---------- Datasets fun ----------
  {
    id: 'monopoly-cases-rentables',
    rubrique: 'datasets',
    statut: 'publiee',
    date: '2026-10-18',
    titre: 'Monopoly : pourquoi les cases orange sont les meilleures',
    accroche: 'Un calcul exact, des parties simulées en direct et un peu de probabilités. Toutes les cases ne se valent pas, et c\'est la prison qui décide.',
    visuel: {
      type: 'barres',
      donnees: 'monopoly-groupes',
      titre: 'Fréquentation moyenne d\'une case, par groupe',
      alt: 'Barres horizontales triées. Orange 2,93 %, rouge 2,90 %, jaune 2,69 %, gares 2,62 %, vert 2,58 %, rose 2,51 %, compagnies 2,48 %, marron 2,41 %, bleu foncé 2,38 %, bleu ciel 2,33 %.',
      legende: 'Part des lancers de dés qui finissent sur une case du groupe, en moyenne par case. Si le plateau était équitable, chaque case recevrait 2,5 %.',
    },
    blocs: [
      { type: 'question', titre: 'La question', texte: 'Si toutes les cases avaient la même chance d\'être visitées, chacune recevrait 1/40, soit 2,5 % des arrêts. Est-ce le cas ? Et quel groupe de couleur vaut-il mieux acheter ?' },
      { type: 'donnees', titre: 'Les données', texte: 'Pas de données à télécharger : on les fabrique de deux façons. Une **simulation** lance les dés un million de fois et compte les arrêts. Un **calcul exact** décrit le plateau comme une chaîne de Markov et en tire les probabilités à long terme. Les deux méthodes concordent à 0,02 point près.' },
      { type: 'methode', titre: 'Les règles modélisées', texte: ['Deux dés à 6 faces, et un double fait rejouer.', 'Trois doubles de suite, la case « Allez en prison » ou une carte « Allez en prison » envoient en prison.', 'Les cartes qui déplacent le pion sont appliquées : 7 cartes Chance sur 16 (Départ, Rue de la Paix, Henri-Martin, Villette, Gare de Lyon, « Reculez de 3 cases », prison) et 3 cartes Caisse de communauté sur 16 (Départ, Belleville, prison).', 'Par défaut, on paie pour sortir de prison dès le tour suivant.', 'Une observation = un lancer de dés : on note la case où le pion finit son déplacement.'] },
      {
        type: 'maths',
        titre: 'La somme de deux dés n\'est pas uniforme',
        texte: 'Deux dés donnent 36 combinaisons, toutes aussi probables. Mais elles ne se répartissent pas également entre les totaux : une seule fait 2 (1 + 1), six font 7 (1 + 6, 2 + 5, 3 + 4 et leurs inverses).',
        equations: [
          { eq: 'P(S = s) = (6 − |s − 7|) / 36', note: 'Pour un total s de 2 à 12. La loi est triangulaire, avec un sommet à 7 (6 chances sur 36, soit 16,7 %).' },
          { eq: 'E[S] = 7   ·   σ(S) = √(35/6) ≈ 2,42', note: 'Un lancer fait avancer de 7 cases en moyenne. Un tour de plateau (40 cases) demande donc un peu moins de 6 lancers.' },
        ],
        visuel: {
          type: 'colonnes',
          donnees: 'deux-des',
          valeurs: 'toutes',
          titre: 'Probabilité de chaque total avec deux dés',
          alt: 'Colonnes en triangle, de 2 à 12. 2 et 12 : 2,8 %. 7 : 16,7 %, le maximum. 6, 8 et 9 sont mis en avant : 13,9 %, 13,9 % et 11,1 %.',
          legende: 'Depuis la prison (case 10), un 6, un 8 ou un 9 mène pile sur les trois cases orange : 13,9 + 13,9 + 11,1 = 38,9 % de chances au lancer qui suit la sortie.',
        },
      },
      {
        type: 'maths',
        titre: 'Le plateau est une chaîne de Markov',
        texte: 'Où ira le pion au prochain lancer ? Cela dépend de la case où il est, pas du chemin qui l\'y a mené. Un processus sans mémoire de ce type s\'appelle une **chaîne de Markov**.',
        equations: [
          { eq: 'P(Xₙ₊₁ = j | Xₙ = i) = pᵢⱼ', note: 'Xₙ est l\'état du pion après n lancers. pᵢⱼ, la probabilité de passer de l\'état i à l\'état j, se calcule avec la loi des dés et les cartes. Tous les pᵢⱼ forment la matrice de transition P.' },
          { eq: 'μₙ₊₁ = μₙ · P', note: 'μₙ est la loi du pion après n lancers : une ligne de probabilités, une par état. Un lancer de plus revient à multiplier par P.' },
          { eq: 'π = π · P   avec   Σ πᵢ = 1', note: 'La loi stationnaire π ne bouge plus quand on lance les dés : c\'est la fréquentation à long terme de chaque case. On l\'obtient en résolvant ce système linéaire, ou en multipliant par P jusqu\'à ce que plus rien ne change.' },
        ],
        suite: 'Pour gérer les doubles et la prison, un état n\'est pas seulement une case : c\'est une case et le nombre de doubles déjà faits dans le tour (0, 1 ou 2), plus un état « en prison ». La matrice compte 118 états (39 cases × 3 + 1).',
        visuel: {
          type: 'plateau',
          donnees: 'monopoly-cases',
          titre: 'La loi stationnaire π sur le plateau',
          alt: 'Plateau de 40 cases coloré du clair au foncé selon la fréquentation. La prison, en bas à gauche, est en couleur d\'accent à 6,24 %. Les cases foncées se concentrent sur le côté gauche et le haut du plateau, entre la prison et la case « Allez en prison ». Les cases Chance sont les plus claires.',
          legende: 'Chaque case porte sa probabilité à long terme, en %. Le deuxième quart du plateau, juste après la prison, est le plus fréquenté.',
        },
      },
      {
        type: 'maths',
        titre: 'Combien de lancers pour oublier le Départ ?',
        texte: 'Tous les pions partent de la case Départ. Au début, leur position dépend beaucoup de ce point de départ ; puis le hasard brasse tout, et la loi du pion se rapproche de π.',
        equations: [
          { eq: 'μₙ = μ₀ · Pⁿ  ⟶  π', note: 'μ₀ met toute la probabilité sur Départ. Quand n grandit, μ₀Pⁿ tend vers π, quel que soit le point de départ : la chaîne est irréductible et apériodique.' },
          { eq: 'd(n) = ½ Σ |μₙ(i) − πᵢ|', note: 'La distance à l\'équilibre : 12 % après 10 lancers, 2,1 % après 20, 0,4 % après 30. Elle est multipliée par 0,84 environ à chaque lancer : la convergence est géométrique.' },
        ],
        visuel: {
          type: 'courbe',
          donnees: 'monopoly-convergence',
          reference: { valeur: 6.24, libelle: 'Équilibre π : 6,24 %' },
          titre: 'Probabilité d\'être sur la case Prison après n lancers',
          alt: 'Courbe sur 30 lancers. Elle part de 9,55 % au premier lancer, oscille fortement jusqu\'au dixième lancer entre 3 % et 8 %, puis se stabilise sur 6,24 % à partir du vingtième.',
          legende: 'Les vagues du début viennent des sauts de 7 cases en moyenne : il faut quelques tours de plateau pour que les positions se mélangent. Après une vingtaine de lancers, la probabilité ne bouge plus.',
        },
      },
      {
        type: 'simulation',
        titre: 'Plusieurs parties en même temps',
        texte: 'Chaque plateau est une partie indépendante, avec ses propres dés. Une case fonce à chaque arrêt du pion. Au début, les parties ne se ressemblent pas ; après quelques milliers de lancers, toutes dessinent le même motif : celui de π.',
        equations: [
          { eq: 'Nᵢ(n) / n  ⟶  πᵢ', note: 'Nᵢ(n) compte les arrêts sur la case i en n lancers. C\'est la loi des grands nombres, dans sa version pour les chaînes de Markov (le théorème ergodique) : la fréquence observée tend vers la probabilité exacte.' },
          { eq: 'marge ≈ 1,96 × √(πᵢ (1 − πᵢ) / n)', note: 'Ordre de grandeur de l\'erreur à 95 %. Pour la prison (πᵢ = 6,24 %) et 10 000 lancers : ± 0,47 point. Les lancers successifs d\'une même partie sont liés, l\'erreur réelle est donc un peu plus grande.' },
        ],
        visuel: {
          type: 'simulation',
          donnees: 'monopoly-cases',
          attendre: 'monopoly-cases-attendre',
          parties: 9,
          alt: 'Simulation interactive : plusieurs plateaux de Monopoly joués en même temps, une carte de chaleur des arrêts par partie, un graphique cumulé comparé à la théorie et une courbe de l\'écart à la théorie.',
          legende: 'Les dés sont tirés dans votre navigateur. Essayez « Tenter les doubles » : la prison grimpe vers 11,6 %.',
        },
      },
      {
        type: 'resultat',
        titre: 'Le résultat : la prison déforme le plateau',
        texte: 'La case Prison reçoit 6,24 % des arrêts, deux fois et demie la moyenne : 3,97 % de pions incarcérés et 2,27 % de simples visites. On en sort en lançant deux dés, et les totaux les plus probables mènent aux cases orange et rouges, qui récoltent le surplus.',
        visuel: {
          type: 'colonnes',
          donnees: 'monopoly-cases',
          titre: 'Fréquentation des 40 cases, de Départ à Rue de la Paix',
          alt: 'Colonnes pour les 40 cases dans l\'ordre du plateau. Elles tournent autour de 2,5 %, sauf la prison à 6,24 %, les cases Chance entre 1,3 et 1,6 % et « Allez en prison » à 0 %.',
          legende: 'La case « Allez en prison » est à zéro : le pion n\'y finit jamais son déplacement. Les cases Chance perdent les 7 cartes sur 16 qui renvoient ailleurs.',
        },
      },
      { type: 'resultat', titre: 'Payer ou rester en prison ?', texte: ['**Payer tout de suite** : la prison reçoit 6,24 % des lancers, le pion repart vite et passe plus souvent sur les terrains.', '**Tenter les doubles** (jusqu\'à 3 lancers) : la prison monte à 11,57 % et toutes les autres cases baissent d\'environ 5 %. Le classement des groupes ne change pas, l\'orange reste en tête.', 'En début de partie, mieux vaut sortir vite pour acheter. En fin de partie, quand le plateau est couvert d\'hôtels adverses, rester en prison protège : c\'est un abri.'] },
      {
        type: 'resultat',
        titre: 'Un hôtel orange rentabilisé en 24 lancers',
        texte: 'Fréquentation ne veut pas dire rentabilité : il faut croiser π avec les loyers et le prix des constructions.',
        equations: [
          { eq: 'R = Σ πᵢ × loyerᵢ', note: 'Loyer moyen encaissé à chaque lancer d\'un adversaire, avec un hôtel sur chaque terrain du groupe. La somme porte sur les cases du groupe.' },
          { eq: 'seuil = coût / R', note: 'Coût = prix des terrains + 5 constructions par terrain (4 maisons puis l\'hôtel). Orange : 2 060 € ÷ 85 € ≈ 24 lancers adverses.' },
        ],
        visuel: {
          type: 'barres',
          donnees: 'monopoly-rentabilite',
          titre: 'Lancers adverses nécessaires pour rembourser un groupe avec hôtels',
          alt: 'Barres horizontales triées, la plus courte en haut. Orange 24,2 lancers, bleu ciel 27,0, rouge 31,5, rose 32,2, jaune 32,5, bleu foncé 32,6, marron 37,7, vert 38,5.',
          legende: 'Plus la barre est courte, plus le groupe est vite remboursé. Avec 3 adversaires, 24 lancers adverses représentent environ 7 tours de table.',
        },
      },
      {
        type: 'resultat',
        titre: 'Le vert rapporte le plus, mais coûte le plus',
        texte: 'En loyer brut, le vert l\'emporte : 102 € par lancer adverse. Mais ses trois hôtels coûtent 3 920 €, presque le double de l\'orange. Le bleu foncé, avec la Rue de la Paix, rapporte autant que l\'orange pour un coût supérieur de 690 €.',
        visuel: {
          type: 'barres',
          donnees: 'monopoly-loyer',
          titre: 'Loyer moyen encaissé par lancer adverse, groupe couvert d\'hôtels',
          alt: 'Barres horizontales triées. Vert 102 €, jaune 94 €, rouge 93 €, orange 85 €, bleu foncé 84 €, rose 60 €, bleu ciel 40 €, marron 16 €.',
          legende: 'Le revenu seul classe le vert en tête ; rapporté au coût, il finit dernier. L\'orange combine fréquentation élevée et constructions bon marché (100 € la maison).',
        },
      },
      { type: 'limite', titre: 'Les limites', texte: ['Les cartes sont tirées au hasard à chaque fois, comme si le paquet était remélangé ; dans le jeu, elles sont remises sous la pile.', 'Le modèle ignore les choix des joueurs, les enchères, les hypothèques et les faillites.', 'Les prix et loyers sont ceux de l\'édition classique en euros. Le calcul de rentabilité suppose des hôtels partout, ce qu\'aucune partie n\'atteint d\'un coup.'] },
      { type: 'retenir', titre: 'À retenir', texte: 'Une seule règle, la prison, suffit à déformer tout le plateau. La chaîne de Markov donne les probabilités exactes, la simulation les retrouve, et la loi des grands nombres explique pourquoi les deux finissent par coïncider.' },
    ],
    sources: [
      { titre: 'Robert B. Ash et Richard L. Bishop, « Monopoly as a Markov Process », Mathematics Magazine, vol. 45, n° 1, 1972, p. 26-29' },
      { titre: 'Ian Stewart, « How Fair Is Monopoly? », Scientific American, avril 1996', url: 'https://www.scientificamerican.com/article/how-fair-is-monopoly/' },
      { titre: 'Ian Stewart, « Monopoly Revisited », Scientific American, octobre 1996 (copie PDF, Harvard)', url: 'https://abel.math.harvard.edu/archive/21b_fall_05/Articles/monopolyrevisited.pdf' },
      { titre: 'Truman Collins, « Probabilities in the Game of Monopoly », simulation informatique à grande échelle' },
      { titre: '« Using Board Games and Mathematica to Teach the Fundamentals of Finite Stationary Markov Chains », arXiv:1410.1107', url: 'https://arxiv.org/abs/1410.1107' },
      { titre: 'Wikipédia, « Chaîne de Markov »', url: 'https://fr.wikipedia.org/wiki/Cha%C3%AEne_de_Markov' },
      { titre: 'Le script de calcul de cette fiche : chaîne de Markov exacte, 118 états', url: 'datasets/monopoly-markov.js' },
    ],
  },
  { id: 'prenoms-mode', rubrique: 'datasets', statut: 'a-venir', titre: 'Les prénoms qui reviennent à la mode tous les 100 ans' },
  { id: 'pokemon-stats', rubrique: 'datasets', statut: 'a-venir', titre: 'Pokémon : le type le plus fort est-il le plus fréquent ?' },

  // ---------- Les graphiques qui mentent ----------
  {
    id: 'moyenne-vs-mediane',
    rubrique: 'mensonges',
    statut: 'publiee',
    date: '2026-10-18',
    titre: 'Le salaire moyen vous ment',
    accroche: 'Dans cette entreprise, le salaire moyen est de 3 290 €. Pourtant, 18 salariés sur 20 gagnent moins que ça. Et en France, deux salariés sur trois gagnent moins que le salaire moyen.',
    visuel: {
      type: 'paire',
      donnees: 'salaires',
      mauvais: {
        type: 'chiffre',
        stat: 'moyenne',
        libelle: 'Salaire moyen chez nous',
        sousTitre: 'Bien payés, non ?',
        titre: 'Le chiffre affiché : le salaire moyen',
        alt: 'Un grand chiffre seul : salaire moyen de 3 290 euros nets par mois.',
        legende: 'Le chiffre mis en avant sur la page recrutement : la moyenne des 20 salaires.',
      },
      corrige: {
        type: 'points',
        pas: 500,
        marqueurs: ['mediane', 'moyenne'],
        titre: 'Les 20 salaires, un point par personne',
        alt: 'Histogramme en points : 18 salaires entre 1 850 et 3 200 euros, puis deux points isolés à 9 500 et 14 000 euros. La médiane, 2 325 euros, est au cœur du groupe ; la moyenne, 3 290 euros, est à droite de presque tous les points.',
        legende: 'Les mêmes 20 salaires. Deux salaires de direction tirent la moyenne vers le haut ; la médiane reste au milieu du groupe.',
      },
    },
    blocs: [
      {
        type: 'definition',
        titre: 'Moyenne ou médiane ?',
        texte: 'La **moyenne** additionne tous les salaires et divise par le nombre de personnes. La **médiane** coupe le groupe en deux : une moitié gagne moins, l\'autre moitié gagne plus.',
        equations: [
          { eq: 'x̄ = (x₁ + x₂ + … + xₙ) / n', note: 'La moyenne de n valeurs. Ici : 65 800 € ÷ 20 = 3 290 €.' },
          { eq: 'Me = (x₍₁₀₎ + x₍₁₁₎) / 2', note: 'On range les salaires du plus petit au plus grand : x₍₁₎ ≤ x₍₂₎ ≤ … ≤ x₍₂₀₎. Avec un nombre pair de valeurs, la médiane est la moyenne des deux du milieu : (2 300 + 2 350) / 2 = 2 325 €. Avec un nombre impair, c\'est la valeur du milieu.' },
        ],
      },
      { type: 'exemple', titre: 'Deux salaires suffisent', texte: 'Sans les deux dirigeants (9 500 € et 14 000 €), la moyenne des 18 autres tombe à 2 350 €. Leur présence l\'augmente de 940 €. La médiane, elle, bouge à peine : 2 325 € contre 2 275 €.' },
      {
        type: 'maths',
        titre: 'Une seule valeur peut tout déplacer',
        texte: 'Faisons varier le salaire du PDG, noté s, sans toucher aux 19 autres. La moyenne suit chaque euro qu\'on lui donne ; la médiane ne le voit pas.',
        equations: [
          { eq: 'x̄(s) = (51 800 + s) / 20', note: '51 800 € est la somme des 19 autres salaires. Chaque euro donné au PDG ajoute 1/20 d\'euro à la moyenne : + 1 000 € pour lui, + 50 € pour « le salarié moyen ».' },
          { eq: 'Me(s) = 2 325 €   pour tout s ≥ 2 350 €', note: 'Tant que le PDG reste dans la moitié haute, son salaire exact ne change rien à la médiane.' },
          { eq: 'point de rupture : 1/n pour x̄  ·  50 % pour Me', note: 'Le point de rupture est la part des valeurs qu\'il faut fausser pour envoyer un indicateur aussi loin qu\'on veut. Une seule valeur suffit pour la moyenne. Pour la médiane, il faut en changer 10 sur 20 : c\'est l\'indicateur le plus robuste possible.' },
        ],
        visuel: {
          type: 'courbe',
          donnees: 'salaires-pdg',
          reference: { valeur: 2325, libelle: 'Médiane : 2 325 €, quel que soit s' },
          titre: 'Salaire moyen de l\'entreprise selon le salaire du PDG',
          alt: 'Droite qui monte régulièrement : le salaire moyen passe de 2 790 € quand le PDG gagne 4 000 € à 4 590 € quand il gagne 40 000 €. Une ligne horizontale à 2 325 € marque la médiane, qui ne bouge pas.',
          legende: 'En abscisse, le salaire du PDG ; en ordonnée, le salaire moyen des 20 salariés. Aujourd\'hui, le PDG gagne 14 000 € et la moyenne vaut 3 290 €.',
        },
      },
      {
        type: 'maths',
        titre: 'Chaque indicateur minimise une erreur',
        texte: 'Résumer 20 salaires par un seul nombre a, c\'est forcément se tromper. La moyenne et la médiane sont chacune le meilleur choix, mais pas pour la même façon de mesurer l\'erreur.',
        equations: [
          { eq: 'Σ (xᵢ − a)²  est minimale pour  a = x̄', note: 'On dérive : −2 Σ (xᵢ − a) = 0, donc a = (1/n) Σ xᵢ. La moyenne minimise les écarts **au carré** : un écart de 10 000 € pèse 10 000 fois plus qu\'un écart de 100 €. D\'où sa sensibilité aux valeurs extrêmes.' },
          { eq: 'Σ |xᵢ − a|  est minimale pour  a = Me', note: 'Quand a monte d\'un euro, il se rapproche d\'un euro de chaque salaire situé au-dessus et s\'éloigne d\'un euro de chaque salaire situé en dessous. La somme cesse de baisser quand il y a autant de salaires de chaque côté : c\'est la médiane.' },
          { eq: 'E(Me) = 1 215 €   ·   E(x̄) = 1 692 €', note: 'E(a) = (1/n) Σ |xᵢ − a| est l\'écart moyen entre a et chaque salaire. Annoncer la moyenne, c\'est se tromper de 1 692 € par salarié en moyenne ; la médiane ramène l\'erreur à 1 215 €.' },
        ],
        visuel: {
          type: 'courbe',
          donnees: 'salaires-ecart',
          reference: { valeur: 1215, libelle: 'Minimum : 1 215 €' },
          titre: 'Écart moyen aux 20 salaires selon la valeur choisie pour les résumer',
          alt: 'Courbe en forme de V arrondi. L\'écart moyen vaut 1 790 € pour a = 1 500 €, descend jusqu\'à 1 215 € autour de 2 300 €, la médiane, puis remonte en ligne presque droite jusqu\'à 2 660 € pour a = 4 500 €.',
          legende: 'Le creux est à la médiane. Au-delà de 3 200 €, la courbe remonte presque en ligne droite : chaque euro ajouté éloigne a de 18 salaires et ne le rapproche que de 2.',
        },
      },
      {
        type: 'maths',
        titre: 'Mesurer l\'asymétrie',
        texte: 'L\'écart entre la moyenne et la médiane n\'est pas un accident : il mesure à quel point la distribution penche d\'un côté.',
        equations: [
          { eq: 'σ = √( (1/n) Σ (xᵢ − x̄)² ) ≈ 2 930 €', note: 'L\'écart-type, la dispersion autour de la moyenne. Sans les deux dirigeants, il tombe à 374 € : lui aussi est dominé par les valeurs extrêmes.' },
          { eq: 'Sk = 3 (x̄ − Me) / σ = 3 × 965 / 2 930 ≈ 0,99', note: 'Le coefficient d\'asymétrie de Pearson. Il vaut 0 pour une distribution symétrique, et devient positif quand une longue queue tire la moyenne vers la droite.' },
          { eq: 'MAD = médiane des |xᵢ − Me| = 300 €', note: 'L\'écart absolu médian, la version robuste de l\'écart-type : la moitié des salariés gagnent à moins de 300 € de la médiane. Les deux dirigeants n\'y pèsent pas plus que les autres.' },
        ],
      },
      {
        type: 'donnees',
        titre: 'En France : 2 733 € de moyenne, 2 190 € de médiane',
        texte: 'Les vrais salaires suivent le même schéma. Dans le secteur privé en 2024, le salaire net mensuel moyen en équivalent temps plein est de 2 733 €, et la médiane de 2 190 €. Selon l\'Insee, la médiane est **inférieure de 19,9 %** à la moyenne.',
        visuel: {
          type: 'courbe',
          donnees: 'salaires-france-deciles',
          reference: { valeur: 2733, libelle: 'Moyenne : 2 733 €' },
          titre: 'Les déciles du salaire net mensuel, secteur privé, France, 2024',
          alt: 'Courbe des neuf déciles. Elle monte doucement de 1 492 € (10 % des salariés gagnent moins) à 2 190 € (50 %), puis de plus en plus vite : 2 785 € à 70 %, 3 305 € à 80 %, 4 334 € à 90 %. La ligne de la moyenne, 2 733 €, croise la courbe entre 60 % et 70 %.',
          legende: 'Lecture : 90 % des salariés gagnent moins de 4 334 € net par mois. Hors du graphique, les 1 % les mieux payés gagnent plus de 10 261 €. Source : Insee, base Tous salariés 2024.',
        },
      },
      {
        type: 'maths',
        titre: 'Deux salariés sur trois sous la moyenne',
        texte: 'L\'Insee ne publie pas la part des salariés qui gagnent moins que la moyenne. On peut l\'estimer à partir des déciles, en supposant les salaires répartis régulièrement entre deux déciles voisins.',
        equations: [
          { eq: 'F(x) ≈ pₖ + (pₖ₊₁ − pₖ) × (x − Dₖ) / (Dₖ₊₁ − Dₖ)', note: 'F(x) est la part des salariés qui gagnent moins de x, et Dₖ le décile qui laisse pₖ des salariés en dessous. Entre deux déciles, on trace une droite : c\'est l\'interpolation linéaire.' },
          { eq: 'F(2 733) ≈ 60 % + 10 % × (2 733 − 2 442) / (2 785 − 2 442) ≈ 68,5 %', note: 'Environ deux salariés sur trois gagnent moins que le salaire moyen. Dans l\'entreprise fictive, c\'est 18 sur 20, soit 90 %.' },
          { eq: 'K = (D9 + D1 − 2 Me) / (D9 − D1) ≈ 0,51', note: 'Le coefficient d\'asymétrie de Kelly, calculé avec les seuls déciles. D9 est 2 144 € au-dessus de la médiane, D1 698 € en dessous : la queue de droite est trois fois plus longue que celle de gauche.' },
        ],
        visuel: {
          type: 'colonnes',
          donnees: 'salaires-france-tranches',
          valeurs: 'toutes',
          titre: 'Part des salariés par tranche de 500 € nets, secteur privé, 2024 (estimation)',
          alt: 'Colonnes par tranche de salaire net, en milliers d\'euros. Moins de 1 500 € : 10,5 %. 1 500 à 2 000 € : 29,9 %, le maximum. 2 000 à 2 500 € : 21,3 %, la tranche de la médiane. 2 500 à 3 000 € : 12,4 %, la tranche de la moyenne. Puis 7,8 %, 4,9 % et 3,5 %, et 9,7 % au-delà de 4 500 €.',
          legende: 'En couleur, la tranche de la médiane (2 190 €) puis celle de la moyenne (2 733 €). La tranche la plus peuplée est encore en dessous : 1 500 à 2 000 €. La dernière colonne regroupe tous les salaires au-delà de 4 500 €, jusqu\'à plus de 10 000 €.',
        },
      },
      { type: 'erreur', titre: 'L\'erreur fréquente', texte: 'Résumer des données asymétriques par leur moyenne : salaires, prix de l\'immobilier, patrimoine, temps d\'attente. Quelques valeurs extrêmes suffisent à la pousser loin de ce que vit la majorité.' },
      {
        type: 'astuce',
        titre: 'Le réflexe',
        texte: [
          'Calculez les deux : `=MOYENNE(A2:A21)` et `=MEDIANE(A2:A21)`. Si elles sont très éloignées, les données sont asymétriques.',
          'Affichez la médiane, et montrez la distribution quand vous le pouvez : un point par personne, un histogramme ou les déciles.',
          'Besoin d\'une moyenne malgré tout ? `=MOYENNE.REDUITE(A2:A21;0,2)` écarte 10 % des valeurs de chaque côté avant de calculer : 2 409 € ici, au lieu de 3 290 €.',
        ],
      },
      {
        type: 'limite',
        titre: 'Les limites',
        texte: [
          'Les 20 salaires de l\'entreprise sont fictifs, choisis pour rendre l\'effet visible.',
          'Les chiffres Insee couvrent le secteur privé, sans la fonction publique, en équivalent temps plein : un salarié à mi-temps est compté comme s\'il travaillait à temps plein. Depuis 2024, le champ inclut aussi les apprentis, les stagiaires et Mayotte.',
          'La répartition par tranches et la part des salariés sous la moyenne sont des estimations par interpolation entre déciles, pas des chiffres publiés par l\'Insee.',
          'La médiane a ses angles morts : elle ne dit rien de l\'écart entre le bas et le haut. Les déciles complètent le tableau.',
        ],
      },
      { type: 'retenir', titre: 'À retenir', texte: 'La moyenne répond à « combien chacun aurait-il si on partageait tout également ? ». La médiane répond à « combien gagne une personne typique ? ». Pour un salaire, c\'est presque toujours la deuxième question qu\'on se pose.' },
    ],
    sources: [
      { titre: 'Insee, « Les salaires dans le secteur privé en 2024 », Insee Première n° 2079, octobre 2025', url: 'https://www.insee.fr/fr/statistiques/8657156' },
      { titre: 'Darrell Huff, How to Lie with Statistics, W. W. Norton, 1954, chapitre 2 « The Well-Chosen Average »' },
      { titre: 'Peter J. Huber et Elvezio M. Ronchetti, Robust Statistics, 2e édition, Wiley, 2009 (point de rupture et estimateurs robustes)' },
      { titre: 'Wikipédia, « Médiane (statistiques) »', url: 'https://fr.wikipedia.org/wiki/M%C3%A9diane_(statistiques)' },
      { titre: 'Wikipédia, « Asymétrie (statistiques) »', url: 'https://fr.wikipedia.org/wiki/Asym%C3%A9trie_(statistiques)' },
    ],
  },
  { id: 'cherry-picking', rubrique: 'mensonges', statut: 'a-venir', titre: 'Cherry picking : choisir la période qui arrange' },
  { id: 'biais-echantillon', rubrique: 'mensonges', statut: 'a-venir', titre: 'Le sondage parfait… auprès des mauvaises personnes' },
  { id: 'axe-zero', rubrique: 'mensonges', statut: 'a-venir', titre: 'L\'axe qui ne part pas de zéro' },

  // ---------- Astuces Excel ----------
  {
    id: 'excel-filtre',
    rubrique: 'excel',
    theme: 'modernes',
    statut: 'publiee',
    date: '2026-10-18',
    titre: 'FILTRE : la fin des filtres manuels',
    accroche: 'Une formule, et la liste se met à jour toute seule dès que les données changent.',
    visuel: {
      type: 'tableur',
      donnees: 'commandes',
      cellule: 'E2',
      formule: '=FILTRE(A2:C9;B2:B9="Toulouse";"Aucune commande")',
      formuleEn: '=FILTER(A2:C9,B2:B9="Toulouse","Aucune commande")',
      filtre: { colonne: 'Ville', egal: 'Toulouse' },
      alt: 'À gauche, un tableau de 8 commandes avec client, ville et montant. À droite, le résultat de la formule FILTRE : les 3 commandes de Toulouse, Amélie 120, David 60 et Farid 175.',
      legende: 'Les en-têtes sont recopiés à la main en E1:G1 ; la formule, saisie en E2, remplit seule les lignes du dessous.',
    },
    blocs: [
      { type: 'probleme', titre: 'Le problème', texte: 'Vous voulez la liste des commandes d\'une ville. Avec un filtre automatique, il faut refaire la manipulation à chaque mise à jour, et le résultat ne peut pas alimenter un autre calcul.' },
      { type: 'formule', titre: 'La formule', formule: '=FILTRE(tableau; condition; [si_vide])', texte: ['**tableau** : la plage à renvoyer, ici A2:C9.', '**condition** : un test sur une colonne de même hauteur, ici B2:B9="Toulouse".', '**si_vide** (facultatif) : ce qui s\'affiche si aucune ligne ne correspond.'] },
      { type: 'exemple', titre: 'L\'exemple', texte: 'Saisie en E2, `=FILTRE(A2:C9;B2:B9="Toulouse";"Aucune commande")` renvoie les 3 commandes toulousaines. Les cellules voisines se remplissent seules : c\'est le **débordement**. Ajoutez une commande à Toulouse dans les données, elle apparaît aussitôt.' },
      { type: 'erreur', titre: 'L\'erreur fréquente', texte: 'Oublier le troisième argument : sans résultat, la formule affiche `#CALC!`. Autre piège, une cellule déjà remplie dans la zone de débordement bloque la formule et provoque une erreur de propagation.' },
      { type: 'astuce', titre: 'Pour aller plus loin', texte: ['Plusieurs critères à la fois (ET) : multipliez les conditions, `(B2:B9="Toulouse")*(C2:C9>100)`.', 'L\'un ou l\'autre (OU) : additionnez-les, `(B2:B9="Toulouse")+(B2:B9="Paris")`.', 'Résultat trié par montant décroissant : `=TRIER(FILTRE(A2:C9;B2:B9="Toulouse");3;-1)`.'] },
      { type: 'retenir', titre: 'À retenir', texte: 'FILTRE existe dans Excel 365 et Excel 2021 ou plus récent. Les versions anglaises s\'écrivent FILTER, avec des virgules à la place des points-virgules.' },
    ],
  },
  { id: 'excel-recherchex', rubrique: 'excel', theme: 'recherche', statut: 'a-venir', titre: 'RECHERCHEX : oubliez RECHERCHEV' },
  { id: 'excel-index-equiv', rubrique: 'excel', theme: 'recherche', statut: 'a-venir', titre: 'INDEX + EQUIV, le duo des versions anciennes' },
  { id: 'excel-textavant', rubrique: 'excel', theme: 'texte', statut: 'a-venir', titre: 'Couper un texte en deux avec TEXTE.AVANT et TEXTE.APRES' },
  { id: 'excel-joindre', rubrique: 'excel', theme: 'texte', statut: 'a-venir', titre: 'JOINDRE.TEXTE : fusionner une liste en une cellule' },
  { id: 'excel-nb-jours-ouvres', rubrique: 'excel', theme: 'dates', statut: 'a-venir', titre: 'Compter les jours ouvrés entre deux dates' },
  { id: 'excel-tcd-pourcentages', rubrique: 'excel', theme: 'tcd', statut: 'a-venir', titre: 'Afficher des pourcentages dans un tableau croisé dynamique' },
  { id: 'excel-let', rubrique: 'excel', theme: 'modernes', statut: 'a-venir', titre: 'LET : nommer les étapes d\'une formule' },
  { id: 'excel-lambda', rubrique: 'excel', theme: 'modernes', statut: 'a-venir', titre: 'LAMBDA : créer sa propre fonction' },

  // ---------- Quel graphique ? ----------
  {
    id: 'quel-graphique',
    rubrique: 'choisir',
    statut: 'publiee',
    date: '2026-10-18',
    titre: 'Quel graphique pour quelle question ?',
    accroche: 'Ne partez pas du graphique qui vous plaît. Partez de la question que vous posez à vos données, et de ce que l\'œil sait lire : une position, mieux qu\'un angle ; une longueur, mieux qu\'une surface.',
    visuel: {
      type: 'selecteur',
      alt: 'Sélecteur : choisissez une question parmi huit (comparer, évolution, avant / après, répartition, relation, distribution, lieu, un seul chiffre) pour voir les graphiques conseillés, quand les utiliser et quand les éviter.',
      legende: 'Choisissez votre question : le guide affiche les formes adaptées, quand les utiliser et quand les éviter.',
    },
    blocs: [
      { type: 'definition', titre: 'Le principe', texte: 'Un graphique sert à répondre à une question. Le cartographe Jacques Bertin l\'a formalisé en 1967 : chaque donnée est traduite en **variable visuelle**, une position, une longueur, un angle, une surface, une couleur. Choisir un graphique, c\'est choisir la variable que l\'œil lira le mieux pour la question posée.' },
      { type: 'exemple', titre: 'L\'exemple', texte: '« Quel magasin vend le plus ? » est une comparaison : des barres horizontales, triées. « Nos ventes montent-elles ? » est une évolution : une courbe. Mêmes données, deux questions, deux graphiques.' },
      {
        type: 'definition',
        titre: 'Ce que l\'œil compare le mieux',
        texte: 'En 1984, les statisticiens William Cleveland et Robert McGill ont demandé à des volontaires de comparer deux valeurs codées de différentes façons, et mesuré leurs erreurs. Leur classement, retrouvé en 2010 par Jeffrey Heer et Michael Bostock sur des participants recrutés en ligne, va du plus précis au moins précis :',
        suite: [
          '**Position sur une échelle commune** : barres alignées, points, courbes.',
          '**Position sur des échelles décalées** : petits multiples, segments du milieu d\'une barre empilée.',
          '**Longueur, direction, angle** : barres flottantes, pentes, camemberts.',
          '**Surface** : bulles, treemaps, symboles proportionnels.',
          '**Volume, courbure** : graphiques en 3D.',
          '**Teinte, saturation, luminosité** : cartes de chaleur, cartes choroplèthes.',
        ],
      },
      {
        type: 'maths',
        titre: 'Pourquoi les surfaces trompent : la loi de Stevens',
        texte: 'Notre perception ne suit pas la grandeur réelle, mais une puissance de celle-ci. Le psychologue Stanley Smith Stevens l\'a mesuré dans les années 1950 pour la vue, l\'ouïe, le toucher.',
        equations: [
          { eq: 'ψ = k · S^β', note: 'S est la grandeur physique (une longueur, une surface), ψ la grandeur perçue, k une constante. L\'exposant β dépend de ce que l\'on regarde : environ 1 pour une longueur, 0,7 pour une surface, 0,6 pour un volume.' },
          { eq: 'ψ(2S) / ψ(S) = 2^β', note: 'Quand la grandeur double, la perception est multipliée par 2^β. Une barre deux fois plus longue paraît deux fois plus longue (2¹ = 2). Une bulle de surface double ne paraît que 1,62 fois plus grande (2^0,7).' },
          { eq: 'S × 2^(1/β) = S × 2^(1/0,7) ≈ 2,7 S', note: 'Pour qu\'une bulle paraisse deux fois plus grosse, il faudrait multiplier sa surface par 2,7 environ. Certains cartographes corrigent ce biais (l\'échelle de Flannery, 1971) ; les tableurs, jamais : mieux vaut éviter les surfaces quand la valeur exacte compte.' },
        ],
        visuel: {
          type: 'barres',
          donnees: 'perception-stevens',
          titre: 'Ce que l\'œil perçoit quand une grandeur double',
          alt: 'Barres horizontales. Une longueur doublée paraît multipliée par 2,00, une surface par 1,62, un volume par 1,52, une luminosité par 1,26. Seule la longueur est en couleur.',
          legende: 'Rapport perçu 2^β quand la grandeur réelle est multipliée par 2, avec les exposants moyens de Stevens. Seule la longueur est perçue fidèlement.',
        },
      },
      {
        type: 'maths',
        titre: 'Comparer : une barre part de zéro',
        texte: 'Une barre code la valeur par sa **longueur**. L\'œil compare donc des longueurs, et le rapport des longueurs n\'est égal au rapport des valeurs que si toutes les barres partent de zéro.',
        equations: [
          { eq: 'longueur = v − axeMin', note: 'Avec un axe qui démarre à 48 k€, la barre de Nantes (55 k€) mesure 7 et celle de Lyon (50 k€) mesure 2 : un rapport de 3,5 pour un écart réel de 10 %.' },
          { eq: 'facteur de mensonge = effet montré / effet réel = 250 % / 10 % = 25', note: 'L\'indicateur d\'Edward Tufte. Effet montré : 7 / 2 − 1 = 250 %. Effet réel : 55 / 50 − 1 = 10 %. Un graphique honnête a un facteur proche de 1.' },
        ],
        visuel: {
          type: 'paire',
          donnees: 'magasins',
          mauvais: {
            type: 'barres',
            axeMin: 48,
            titre: 'Chiffre d\'affaires des magasins, axe démarrant à 48 k€',
            alt: 'Barres horizontales sur un axe qui commence à 48 k€. Nantes, 55 k€, a une barre trois fois et demie plus longue que Lyon, 50 k€.',
            legende: 'Nantes semble écraser les trois autres magasins.',
          },
          corrige: {
            type: 'barres',
            titre: 'Chiffre d\'affaires des magasins, axe partant de zéro',
            alt: 'Barres horizontales de longueurs presque égales : Nantes 55 k€, Lille 52 k€, Rennes 51 k€, Lyon 50 k€.',
            legende: 'Les quatre magasins se tiennent à 10 % près. Pour zoomer sur de petits écarts, préférez des points : une position ne prétend pas mesurer une longueur.',
          },
        },
      },
      {
        type: 'maths',
        titre: 'Répartition : l\'angle, une comparaison difficile',
        texte: 'Un camembert code chaque part par un angle, et en même temps par un arc et une surface. Avec des parts proches, les différences deviennent trop petites pour l\'œil, d\'autant que deux parts ne partent jamais du même endroit.',
        equations: [
          { eq: 'θᵢ = 360° × pᵢ', note: 'La part pᵢ devient un angle θᵢ. Alpha (23 %) occupe 82,8°, Bravo (21 %) 75,6° : 7,2° d\'écart, soit 2 % d\'un tour, entre deux parts qui ne sont même pas voisines.' },
          { eq: 'Σ pᵢ = 100 %', note: 'La vraie force du camembert : il dit « ceci est un tout ». Si les valeurs ne s\'additionnent pas en un total qui a du sens, il est exclu d\'office.' },
        ],
        visuel: {
          type: 'paire',
          donnees: 'parts-proches',
          mauvais: {
            type: 'anneau',
            verdict: 'Illisible',
            titre: 'Parts de marché de cinq marques, en anneau',
            alt: 'Anneau en cinq parts presque égales, avec une légende sans valeurs : Bravo, Écho, Alpha, Delta, Charlie. On ne peut pas dire laquelle est la plus grande.',
            legende: 'Quelle marque est en tête ? Et laquelle est deuxième ?',
          },
          corrige: {
            type: 'barres',
            trier: true,
            verdict: 'Lisible',
            titre: 'Parts de marché de cinq marques, en barres triées',
            alt: 'Barres horizontales triées : Alpha 23 %, Bravo 21 %, Charlie 20 %, Delta 19 %, Écho 17 %.',
            legende: 'Le classement se lit d\'un coup d\'œil, même pour un point d\'écart : les barres partagent la même ligne de départ.',
          },
        },
      },
      {
        type: 'maths',
        titre: 'Évolution : une courbe se lit par sa pente',
        texte: 'Une courbe ne code pas la valeur par une longueur, mais par une **position** et une **pente**. Elle n\'a donc pas besoin de partir de zéro : ce qui compte, c\'est que la variation se voie.',
        equations: [
          { eq: 'pente = Δy / Δx', note: 'Entre 1960 et 1970, le CO₂ atmosphérique monte de 0,88 ppm par an ; entre 2015 et 2025, de 2,63 ppm par an. La pente triple : c\'est ce que la courbe doit montrer.' },
          { eq: 'Δ% = (427,35 − 316,91) / 316,91 ≈ + 34,8 %', note: 'La hausse totale en 65 ans. Sur un axe qui part de zéro, elle n\'occupe qu\'un cinquième de la hauteur du graphique.' },
          { eq: 'médiane des |θᵢ| ≈ 45°', note: 'La règle de Cleveland, dite « banking to 45° » : choisir le rapport hauteur / largeur pour que les segments de la courbe soient inclinés de 45° en médiane. C\'est autour de cet angle que l\'œil distingue le mieux deux pentes.' },
        ],
        visuel: {
          type: 'paire',
          donnees: 'co2-mauna-loa',
          mauvais: {
            type: 'courbe',
            verdict: 'Écrasée',
            titre: 'CO₂ à Mauna Loa, axe partant de zéro',
            alt: 'Courbe de 1960 à 2025 sur un axe de 0 à 600 ppm. Elle monte de 317 à 427 ppm mais paraît presque plate, collée en haut du graphique.',
            legende: 'L\'axe à zéro gaspille plus des trois quarts de la hauteur : l\'accélération disparaît.',
          },
          corrige: {
            type: 'courbe',
            axeMin: 300,
            verdict: 'Lisible',
            titre: 'CO₂ à Mauna Loa, axe de 300 à 450 ppm',
            alt: 'La même courbe sur un axe de 300 à 450 ppm. Elle monte de 316,91 ppm en 1960 à 427,35 ppm en 2025, de plus en plus vite.',
            legende: 'La courbe s\'accélère : la hausse annuelle a triplé. Source : NOAA GML, moyennes annuelles, une année sur cinq.',
          },
        },
      },
      {
        type: 'maths',
        titre: 'Relation : le coefficient ne remplace pas le nuage',
        texte: 'En 1973, le statisticien Francis Anscombe a construit quatre jeux de 11 points. Leurs résumés statistiques sont identiques au centième près. Leurs nuages n\'ont rien à voir.',
        equations: [
          { eq: 'r = Σ (xᵢ − x̄)(yᵢ − ȳ) / √( Σ (xᵢ − x̄)² × Σ (yᵢ − ȳ)² )', note: 'Le coefficient de corrélation de Pearson, de −1 à 1, mesure à quel point les points s\'alignent sur une droite. Ici, r = 0,816 pour les quatre jeux.' },
          { eq: 'ŷ = 3,00 + 0,500 x', note: 'La droite des moindres carrés, la même pour les quatre jeux. Sa pente vaut b = r × s(y) / s(x). Mêmes moyennes aussi (x̄ = 9, ȳ = 7,50) et mêmes variances (11 pour x, 4,12 pour y).' },
          { eq: 'R² = r² ≈ 0,67', note: 'La droite « explique » 67 % de la variance de y dans les quatre cas. Elle n\'a pourtant de sens que pour le jeu I : le II est une courbe, le III une droite parfaite déviée par un seul point, et dans le IV un point isolé crée à lui seul toute la corrélation.' },
        ],
        visuel: {
          type: 'multiples',
          donnees: 'anscombe',
          tendance: true,
          coefficient: true,
          titre: 'Le quartet d\'Anscombe : quatre nuages, une seule droite',
          alt: 'Quatre nuages de 11 points sur les mêmes axes, chacun avec la même droite de régression et r = 0,82. I : des points dispersés autour de la droite. II : des points sur un arc de parabole. III : dix points parfaitement alignés et un point aberrant au-dessus. IV : dix points empilés à x = 8 et un point isolé à x = 19.',
          legende: 'Même droite, même r partout. Seul le dessin révèle la courbe, l\'aberrant et le point qui décide de tout. En 2017, le « Datasaurus » de Matejka et Fitzmaurice a poussé l\'idée jusqu\'à cacher un dinosaure derrière les mêmes statistiques.',
        },
      },
      {
        type: 'maths',
        titre: 'Distribution : la boîte à moustaches, mode d\'emploi',
        texte: 'John Tukey a popularisé la boîte à moustaches en 1977 pour résumer une distribution en cinq nombres. Appliquée aux 20 salaires de la fiche « Le salaire moyen vous ment », elle désigne d\'elle-même les deux salaires de direction.',
        equations: [
          { eq: 'Q1 = 2 075 €   ·   Me = 2 325 €   ·   Q3 = 2 750 €', note: 'Les quartiles coupent les valeurs rangées en quatre groupes égaux. Méthode de Tukey : Q1 est la médiane de la moitié basse (les 10 plus petits salaires), Q3 celle de la moitié haute. Excel (`QUARTILE.INCLURE`) interpole autrement et donne 2 087,5 € et 2 725 € : les méthodes diffèrent un peu, jamais beaucoup.' },
          { eq: 'EI = Q3 − Q1 = 675 €', note: 'L\'écart interquartile, la largeur de la boîte : la moitié centrale des salariés tient dans 675 €.' },
          { eq: 'Q3 + 1,5 × EI = 3 762,5 €', note: 'Au-delà de cette limite, une valeur est dite atypique et dessinée à part : ici 9 500 € et 14 000 €. Pourquoi 1,5 ? Pour une loi normale, la limite tombe à 2,7 écarts-types de la moyenne, et seules 0,7 % des valeurs la dépassent.' },
          { eq: 'h = 2 × EI × n^(−1/3) = 2 × 675 × 20^(−1/3) ≈ 497 €', note: 'Pour un histogramme, la règle de Freedman et Diaconis donne la largeur des classes : environ 500 €, le pas du graphique en points de la fiche sur les salaires. La règle de Sturges, k = 1 + log₂ n, soit 5 à 6 classes, suppose des données symétriques : ici, elle mettrait 18 salariés sur 20 dans la première classe.' },
        ],
        visuel: {
          type: 'boite',
          donnees: 'salaires',
          points: true,
          titre: 'Les 20 salaires en boîte à moustaches',
          alt: 'Boîte à moustaches horizontale sur un axe de 0 à 15 000 €. La boîte, étroite, va de 2 075 € à 2 750 €, avec la médiane à 2 325 €. Les moustaches vont de 1 850 € à 3 200 €. Deux points isolés, 9 500 € et 14 000 €, sont marqués comme atypiques. Sous la boîte, les 20 salaires en points.',
          legende: 'La boîte contient la moitié centrale des salariés ; les moustaches s\'arrêtent à la dernière valeur non atypique. Dessous, les 20 salaires un par un.',
        },
      },
      {
        type: 'maths',
        titre: 'Un seul chiffre : toujours avec sa référence',
        texte: 'Un grand chiffre seul ne répond à aucune question : il lui faut un point de comparaison, l\'an dernier, un objectif, une moyenne. Et la façon de calculer l\'écart change le message.',
        equations: [
          { eq: 'Δ = v₁ − v₀   ·   Δ% = (v₁ − v₀) / v₀', note: 'L\'écart absolu et l\'écart relatif. 3 290 € contre 3 100 € l\'an dernier : + 190 €, soit + 6,1 %.' },
          { eq: '10 % ⟶ 12 % : + 2 points, soit + 20 %', note: 'Quand le chiffre est lui-même un taux, distinguez les **points de pourcentage** (12 − 10 = 2) de la variation relative (2 / 10 = 20 %). Les deux sont justes ; annoncer le second sans le préciser gonfle l\'effet.' },
        ],
      },
      { type: 'erreur', titre: 'L\'erreur fréquente : la 3D', texte: 'Donner de la profondeur à des barres ou à un camembert. La perspective agrandit ce qui est devant et rapetisse ce qui est derrière : une part au premier plan paraît plus grosse qu\'elle n\'est. La troisième dimension n\'ajoute aucune donnée ; Tufte y voit de l\'encre qui ne porte aucune information.' },
      {
        type: 'astuce',
        titre: 'Les réflexes',
        texte: [
          'Écrivez d\'abord la phrase que le lecteur doit retenir. « Plus que » annonce une comparaison, « depuis » une évolution, « la moitié de » une répartition, « plus… plus… » une relation.',
          'Barres : l\'axe part de zéro, toujours. Courbes : l\'axe peut commencer ailleurs, à condition de le montrer.',
          'Triez les catégories sans ordre naturel, de la plus grande à la plus petite.',
          'Remplacez la légende par des libellés directs, au bout des courbes ou des barres.',
        ],
      },
      {
        type: 'limite',
        titre: 'Les limites',
        texte: [
          'Le classement de Cleveland et McGill porte sur une tâche précise : comparer deux valeurs. Pour saisir une tendance ou un ordre de grandeur, les écarts entre formes se réduisent.',
          'Le camembert n\'a pas toujours tort : pour estimer la part d\'un tout (« à peu près un tiers »), Spence et Lewandowsky (1991) le trouvent aussi précis que les barres. Skau et Kosara (2016) montrent qu\'on le lit surtout par l\'arc et la surface, plus que par l\'angle.',
          'Les exposants de Stevens varient selon les études et les personnes : 2^0,7 est un ordre de grandeur, pas une constante.',
          'Les magasins et les marques sont fictifs. Le CO₂ de Mauna Loa et le quartet d\'Anscombe sont des données publiées.',
        ],
      },
      { type: 'retenir', titre: 'À retenir', texte: 'Une question, un graphique. Si un graphique doit répondre à deux questions, faites-en deux. Et dans le doute, choisissez la position sur un axe commun : c\'est ce que l\'œil lit le mieux.' },
    ],
    sources: [
      { titre: 'Jacques Bertin, Sémiologie graphique. Les diagrammes, les réseaux, les cartes, Mouton et Gauthier-Villars, 1967' },
      { titre: 'William S. Cleveland et Robert McGill, « Graphical Perception: Theory, Experimentation, and Application to the Development of Graphical Methods », Journal of the American Statistical Association, vol. 79, n° 387, 1984, p. 531-554' },
      { titre: 'Jeffrey Heer et Michael Bostock, « Crowdsourcing Graphical Perception: Using Mechanical Turk to Assess Visualization Design », actes de CHI 2010' },
      { titre: 'Stanley S. Stevens, « On the Psychophysical Law », Psychological Review, vol. 64, n° 3, 1957, p. 153-181' },
      { titre: 'James J. Flannery, « The Relative Effectiveness of Some Common Graduated Point Symbols in the Presentation of Quantitative Data », The Canadian Cartographer, vol. 8, n° 2, 1971' },
      { titre: 'William S. Cleveland, Marylyn E. McGill et Robert McGill, « The Shape Parameter of a Two-Variable Graph », Journal of the American Statistical Association, vol. 83, n° 402, 1988, p. 289-300' },
      { titre: 'Edward R. Tufte, The Visual Display of Quantitative Information, Graphics Press, 1983 (facteur de mensonge, encre des données)' },
      { titre: 'Francis J. Anscombe, « Graphs in Statistical Analysis », The American Statistician, vol. 27, n° 1, 1973, p. 17-21' },
      { titre: 'Justin Matejka et George Fitzmaurice, « Same Stats, Different Graphs », actes de CHI 2017 (le Datasaurus)' },
      { titre: 'John W. Tukey, Exploratory Data Analysis, Addison-Wesley, 1977' },
      { titre: 'David Freedman et Persi Diaconis, « On the Histogram as a Density Estimator: L2 Theory », Zeitschrift für Wahrscheinlichkeitstheorie und verwandte Gebiete, vol. 57, 1981, p. 453-476' },
      { titre: 'Herbert A. Sturges, « The Choice of a Class Interval », Journal of the American Statistical Association, vol. 21, n° 153, 1926, p. 65-66' },
      { titre: 'Ian Spence et Stephan Lewandowsky, « Displaying Proportions and Percentages », Applied Cognitive Psychology, vol. 5, n° 1, 1991, p. 61-77' },
      { titre: 'Drew Skau et Robert Kosara, « Arcs, Angles, or Areas: Individual Data Encodings in Pie and Donut Charts », Computer Graphics Forum, vol. 35, n° 3 (EuroVis), 2016' },
      { titre: 'NOAA Global Monitoring Laboratory, moyennes annuelles du CO₂ à Mauna Loa', url: 'https://gml.noaa.gov/ccgg/trends/data.html' },
      { titre: 'Financial Times, « Visual Vocabulary », le guide des graphiques par question', url: 'https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary' },
      { titre: 'Wikipédia, « Quartet d\'Anscombe »', url: 'https://fr.wikipedia.org/wiki/Quartet_d%27Anscombe' },
      { titre: 'Wikipédia, « Boîte à moustaches »', url: 'https://fr.wikipedia.org/wiki/Bo%C3%AEte_%C3%A0_moustaches' },
    ],
  },
  { id: 'camembert-ou-barres', rubrique: 'choisir', statut: 'a-venir', titre: 'Camembert ou barres : le test des 5 secondes' },
  { id: 'double-axe', rubrique: 'choisir', statut: 'a-venir', titre: 'Pourquoi fuir les graphiques à deux axes' },

  // ---------- Notions ----------
  {
    id: 'correlation-causalite',
    rubrique: 'notions',
    statut: 'publiee',
    date: '2026-10-18',
    titre: 'Les glaces donnent-elles des coups de soleil ?',
    accroche: 'Plus on vend de glaces, plus il y a de coups de soleil : r = 0,96. Les deux montent ensemble, et pourtant aucune ne cause l\'autre. Mesurer le lien, trouver le coupable, puis le retirer du calcul.',
    visuel: {
      type: 'nuage',
      donnees: 'glaces',
      tendance: true,
      coefficient: true,
      titre: 'Glaces vendues et coups de soleil, mois par mois',
      alt: 'Nuage de 12 points, un par mois, avec r = 0,96. Les points forment une ligne qui monte : les mois où l\'on vend le plus de glaces sont aussi ceux où il y a le plus de coups de soleil. Les mois chauds, au-dessus de 20 °C, sont tous en haut à droite.',
      legende: 'Un point par mois, coloré selon la température. La corrélation est très forte, mais la couleur trahit le vrai responsable.',
    },
    blocs: [
      {
        type: 'definition',
        titre: 'Corrélation : varier ensemble',
        texte: 'Deux variables sont **corrélées** quand elles varient ensemble : l\'une monte, l\'autre aussi (ou l\'inverse). Pour le mesurer, on regarde mois par mois si les glaces et les coups de soleil sont du même côté de leur moyenne.',
        equations: [
          { eq: 'Cov(G, C) = (1/n) Σ (Gᵢ − Ḡ)(Cᵢ − C̄) ≈ 335', note: 'La covariance. Chaque mois apporte un produit, positif quand glaces et coups de soleil sont tous deux au-dessus (ou tous deux en dessous) de leur moyenne, négatif sinon. Ici, Ḡ ≈ 34,7 milliers de glaces et C̄ ≈ 27,2 consultations. Son unité, des « milliers de glaces × consultations », ne parle à personne.' },
          { eq: 'r = Cov(G, C) / (σ(G) × σ(C)) = 335 / (17,5 × 19,9) ≈ 0,96', note: 'Le coefficient de Pearson divise la covariance par les deux écarts-types : il n\'a plus d\'unité et reste entre −1 et 1. À 1, les points sont parfaitement alignés sur une droite qui monte ; à 0, il n\'y a aucune tendance en ligne droite.' },
          { eq: 'r = (1/n) Σ z(Gᵢ) × z(Cᵢ)   avec   z(x) = (x − x̄) / σ', note: 'La même formule, lue autrement : r est la moyenne des produits des **scores z**, l\'écart de chaque mois à la moyenne compté en écarts-types. Juillet : z(G) = 1,34 et z(C) = 1,65, produit 2,20. Les mois d\'été (deux z positifs) et d\'hiver (deux z négatifs) donnent tous un produit positif.' },
        ],
        visuel: {
          type: 'courbes',
          donnees: 'glaces-z',
          reference: { valeur: 0, libelle: 'Moyenne de l\'année' },
          titre: 'Glaces, coups de soleil et température au fil de l\'année, en scores z',
          alt: 'Trois courbes sur douze mois, en écarts-types autour de la moyenne. Glaces vendues, coups de soleil et température, en tirets, partent toutes autour de −1 en janvier, passent au-dessus de 0 en mai, culminent autour de +1,5 en juillet et août, puis redescendent ensemble vers −1 en décembre.',
          legende: 'Centrées et réduites, les trois séries se superposent presque : elles sont au-dessus de leur moyenne les mêmes mois. La température, en tirets, mène la danse.',
        },
      },
      {
        type: 'maths',
        titre: 'La droite de régression : prédire n\'est pas expliquer',
        texte: 'La droite tracée sur le nuage résume le lien en une équation. Elle permet de prédire, pas de dire ce qui cause quoi.',
        equations: [
          { eq: 'Ĉ = a + b G   avec   b = r × σ(C) / σ(G) ≈ 1,10', note: 'La droite des moindres carrés, et a = C̄ − b Ḡ ≈ −10,8. Un mois qui vend 1 000 glaces de plus compte en moyenne 1,1 consultation de plus pour coup de soleil.' },
          { eq: 'R² = r² ≈ 0,93', note: 'La droite « explique » 93 % de la variance des coups de soleil. Pour prédire, c\'est excellent : les ventes d\'un glacier suffisent à estimer l\'affluence chez le dermatologue. Pour agir, c\'est inutile : interdire les glaces n\'éviterait aucun coup de soleil.' },
        ],
      },
      {
        type: 'exemple',
        titre: 'Le facteur caché',
        texte: 'La chaleur fait vendre des glaces. La chaleur pousse aussi à s\'exposer au soleil. Glaces et coups de soleil n\'ont aucun lien direct : ils ont une cause commune. Les statisticiens l\'appellent un **facteur de confusion**.',
        visuel: {
          type: 'causal',
          cause: 'Chaleur',
          effets: ['Glaces vendues', 'Coups de soleil'],
          lien: 'Corrélées, sans lien de cause',
          titre: 'Schéma : une cause commune',
          alt: 'Schéma. La chaleur, en haut, envoie une flèche vers « Glaces vendues » et une autre vers « Coups de soleil ». Entre les deux effets, un trait pointillé : corrélés, sans lien de cause.',
        },
      },
      {
        type: 'maths',
        titre: 'Le modèle de la cause commune',
        texte: 'Écrivons ce que dit le schéma : chaque effet dépend de la température T, plus un bruit qui lui est propre.',
        equations: [
          { eq: 'G = a₁ + b₁ T + ε₁   ·   C = a₂ + b₂ T + ε₂', note: 'ε₁ et ε₂ regroupent tout le reste (un jour férié, une campagne de prévention) ; ils sont indépendants entre eux et de T. Ici, b₁ ≈ 2,72 : un degré de plus, 2 720 glaces de plus. Et b₂ ≈ 3,04 consultations de plus par degré.' },
          { eq: 'Cov(G, C) = b₁ b₂ Var(T) = 2,72 × 3,04 × 40,6 ≈ 335', note: 'Les bruits, indépendants, ne contribuent pas à la covariance : il ne reste que ce qui passe par T. On retrouve la covariance observée.' },
          { eq: 'r(G, C) = r(G, T) × r(C, T) = 0,991 × 0,973 ≈ 0,964', note: 'En divisant par les écarts-types : la corrélation entre deux effets d\'une même cause est le produit de leurs corrélations avec elle. Observé : 0,962. La température suffit à expliquer tout le lien. Et comme un produit de deux nombres plus petits que 1 est plus petit que chacun, r(G, C) reste toujours en dessous des deux corrélations avec la cause.' },
        ],
        visuel: {
          type: 'multiples',
          donnees: 'glaces-temperature',
          tendance: true,
          coefficient: true,
          titre: 'Chaque effet face à la température',
          alt: 'Deux nuages de 12 points sur les mêmes axes, avec la température en abscisse. À gauche, les glaces vendues montent en ligne presque droite avec la température, r = 0,99. À droite, les coups de soleil aussi, r = 0,97.',
          legende: 'La température prédit chaque série presque parfaitement. Le lien entre glaces et coups de soleil n\'est que l\'écho de ces deux liens.',
        },
      },
      {
        type: 'maths',
        titre: 'Retirer la chaleur : la corrélation partielle',
        texte: 'Si la température explique tout, alors à température égale, glaces et coups de soleil ne devraient plus rien avoir en commun. Pour le vérifier, on retire à chaque série ce que la température prédit, et on regarde ce qui reste : les **résidus**.',
        equations: [
          { eq: 'e(Gᵢ) = Gᵢ − (a₁ + b₁ Tᵢ)', note: 'Le résidu d\'un mois : ses ventes de glaces, moins celles qu\'on attendait vu sa température. Mai a vendu 4 500 glaces de moins que prévu, juin 3 700 de plus.' },
          { eq: 'r(G, C | T) = (r(G, C) − r(G, T) r(C, T)) / √((1 − r(G, T)²)(1 − r(C, T)²)) ≈ −0,08', note: 'La corrélation partielle, celle des résidus, calculée directement avec les trois coefficients. Le numérateur retire ce que le modèle de la cause commune prévoit : 0,962 − 0,964. De 0,96, la corrélation tombe à −0,08. À température égale, il n\'y a plus de lien.' },
        ],
        visuel: {
          type: 'nuage',
          donnees: 'glaces-residus',
          tendance: true,
          coefficient: true,
          titre: 'Ce qui reste une fois la température retirée',
          alt: 'Nuage de 12 points, les résidus des deux séries. Les points sont dispersés sans direction autour de zéro, entre −4,5 et +3,7 milliers de glaces et entre −7,9 et +5,1 consultations. La droite de tendance est presque plate, r = −0,08. Les couleurs des trois groupes de température sont mélangées.',
          legende: 'Chaque point est un mois. En abscisse, les glaces vendues en plus ou en moins de ce que prévoyait la température ; en ordonnée, pareil pour les coups de soleil. Le nuage n\'a plus de direction, et les mois chauds ne sont plus regroupés.',
        },
      },
      {
        type: 'maths',
        titre: 'Et si c\'était le hasard ?',
        texte: 'Avant de chercher une cause, il faut écarter la coïncidence. Avec douze mois seulement, deux séries sans aucun rapport peuvent-elles afficher r = 0,96 ?',
        equations: [
          { eq: 't = r √(n − 2) / √(1 − r²) = 0,962 × √10 / √(1 − 0,925) ≈ 11,1', note: 'Si les deux variables étaient indépendantes (et à peu près normales), t suivrait une loi de Student à n − 2 = 10 degrés de liberté. Au-delà de 2,23, on n\'a que 5 % de chances de l\'observer par hasard. 11,1 est très loin au-delà.' },
          { eq: 'f(r) = (1 − r²)^((n − 4)/2) / B(½, (n − 2)/2)', note: 'La loi exacte de r entre deux variables indépendantes, établie par Ronald Fisher en 1915. B est la fonction bêta : elle ramène l\'aire sous la courbe à 1. Pour n = 12, f(r) = (315/256) (1 − r²)⁴ : une cloche centrée sur 0, mais large. |r| dépasse 0,58 une fois sur 20, et 0,96 moins d\'une fois sur un million.' },
          { eq: '1 − 0,95²⁰ ≈ 64 %', note: 'Le revers : testez 20 paires de séries indépendantes, et vous avez 64 % de chances qu\'au moins une passe le seuil de 5 %. Qui compare beaucoup de séries finit toujours par trouver une corrélation « significative ».' },
        ],
        visuel: {
          type: 'colonnes',
          donnees: 'r-hasard-12',
          valeurs: 'aucune',
          titre: 'Valeurs de r entre deux séries indépendantes de 12 valeurs',
          alt: 'Colonnes en cloche de r = −1 à r = 1, par tranches de 0,1. Les deux tranches centrales, autour de 0, valent 12,1 % chacune. La probabilité baisse vers les bords. Les tranches au-delà de 0,6 en valeur absolue, en couleur, valent 1,4 %, 0,5 %, 0,1 % et presque 0 de chaque côté.',
          legende: 'Probabilité de chaque tranche de r, de largeur 0,1. En couleur, |r| > 0,6 : 3,9 % des cas en tout. Notre r = 0,96 tombe dans la dernière tranche, où le hasard n\'arrive presque jamais.',
        },
      },
      {
        type: 'donnees',
        titre: 'Des corrélations absurdes, mais publiées',
        texte: [
          '**Chocolat et prix Nobel** : r = 0,79 sur 23 pays, entre la consommation de chocolat par habitant et le nombre de lauréats par habitant (Franz Messerli, New England Journal of Medicine, 2012). Facteur caché probable : la richesse du pays.',
          '**Cigognes et naissances** : r = 0,62 sur 17 pays d\'Europe, avec p = 0,008, entre le nombre de couples de cigognes et le nombre de naissances (Robert Matthews, 2000). Facteur caché : la superficie. Un grand pays a plus de cigognes et plus d\'habitants.',
          '**Nicolas Cage et noyades** : r = 0,67 entre le nombre de films de l\'acteur et les noyades en piscine aux États-Unis, de 1999 à 2009 (Tyler Vigen). Aucun facteur caché : une coïncidence, trouvée en croisant automatiquement des milliers de séries.',
        ],
        visuel: {
          type: 'barres',
          donnees: 'correlations-absurdes',
          titre: 'Quatre corrélations sans lien de cause',
          alt: 'Barres horizontales. Glaces et coups de soleil, r = 0,96, en couleur. Chocolat et prix Nobel, 0,79. Nicolas Cage et noyades, 0,67. Cigognes et naissances, 0,62.',
          legende: 'Toutes sont « statistiquement significatives ». Deux ont un facteur caché, une est une pure coïncidence, et la nôtre est fictive.',
        },
      },
      { type: 'erreur', titre: 'L\'erreur fréquente', texte: 'Lire une corrélation comme une preuve. « Les enfants qui prennent un petit-déjeuner ont de meilleures notes, donc le petit-déjeuner rend meilleur à l\'école. » Le niveau de vie de la famille peut expliquer les deux.' },
      {
        type: 'erreur',
        titre: 'L\'autre piège : deux tendances',
        texte: 'Corréler deux séries qui montent toutes les deux avec le temps. Le prix du timbre et le nombre d\'abonnés à Internet augmentent depuis trente ans : r est proche de 1, sans le moindre lien. Le statisticien George Udny Yule a décrit ces « corrélations absurdes » entre séries temporelles dès 1926. Ici, le temps joue le rôle du facteur caché.',
        equations: [
          { eq: 'Δxₜ = xₜ − xₜ₋₁', note: 'Le remède : corréler les variations d\'une période à l\'autre plutôt que les niveaux. Deux séries liées par une cause bougent ensemble d\'une année sur l\'autre ; deux tendances indépendantes, non.' },
        ],
      },
      {
        type: 'maths',
        titre: 'Prouver une cause : l\'expérience',
        texte: 'Pour savoir si les glaces donnent des coups de soleil, l\'idéal serait de les **distribuer au hasard** : tirer à pile ou face qui en mange une. Le hasard rend la glace indépendante de la météo, et le facteur caché disparaît. Faute d\'expérience, on peut comparer à température égale. Prenons un été fictif avec 40 % de jours chauds. Par jour chaud, 70 % des plagistes mangent une glace et 35 % attrapent un coup de soleil ; par jour frais, 20 % et 5 %, glace ou pas.',
        equations: [
          { eq: 'P(C | glace) = 26 %   ·   P(C | sans glace) = 11 %', note: 'La comparaison brute : les mangeurs de glace ont 2,4 fois plus de coups de soleil. Ils sont surtout plus nombreux les jours chauds : 70 % des glaces sont mangées par temps chaud.' },
          { eq: 'P(C | do(glace)) = Σₜ P(C | glace, t) × P(t) = 0,4 × 35 % + 0,6 × 5 % = 17 %', note: 'La formule d\'ajustement, dans les notations de Judea Pearl : on compare à température égale, puis on pondère par la fréquence de chaque météo. do(glace) se lit « si l\'on imposait une glace à tout le monde ». Le calcul donne aussi 17 % sans glace : l\'effet causal est nul.' },
        ],
        visuel: {
          type: 'barres',
          donnees: 'glaces-ajustement',
          titre: 'Part des plagistes avec un coup de soleil, avant et après ajustement sur la météo',
          alt: 'Barres horizontales. Comparaison brute : 26 % avec glace, 11 % sans glace. Après ajustement sur la température, en couleur : 17 % avec glace et 17 % sans glace.',
          legende: 'Brut, la glace semble multiplier le risque par 2,4. À météo égale, les deux barres sont identiques.',
        },
      },
      {
        type: 'methode',
        titre: 'Sans expérience : les critères de Bradford Hill',
        texte: 'On ne peut pas toujours tirer au sort : personne n\'oblige des volontaires à fumer. En 1950, Richard Doll et Austin Bradford Hill établissent pourtant le lien entre tabac et cancer du poumon. Ronald Fisher, le père de l\'expérience aléatoire, objecte qu\'un gène pourrait pousser à la fois à fumer et au cancer : un facteur caché. En 1965, Hill propose neuf critères pour juger qu\'une association est causale. Les glaces passent le premier, la force, mais échouent à la spécificité, à la plausibilité et à l\'expérience.',
        suite: [
          '**Force** : une association forte résiste mieux à un facteur caché.',
          '**Constance** : on la retrouve dans d\'autres pays, d\'autres études, d\'autres méthodes.',
          '**Spécificité** : la cause produit un effet précis, pas tous les maux à la fois.',
          '**Temporalité** : la cause précède l\'effet. Le seul critère indispensable.',
          '**Gradient** : plus de cause, plus d\'effet. Les gros fumeurs ont plus de cancers que les petits.',
          '**Plausibilité** et **cohérence** : un mécanisme connu, compatible avec le reste du savoir.',
          '**Expérience** : supprimer la cause fait baisser l\'effet.',
          '**Analogie** : une cause semblable a déjà produit un effet semblable.',
        ],
      },
      { type: 'astuce', titre: 'Les trois questions à se poser', texte: ['Une troisième variable peut-elle expliquer les deux ?', 'Le lien peut-il aller dans l\'autre sens ?', 'Est-ce une coïncidence, sur une période trop courte ou parmi trop de séries comparées ?'] },
      {
        type: 'astuce',
        titre: 'Dans Excel',
        texte: [
          '`=COEFFICIENT.CORRELATION(B2:B13;C2:C13)` donne r entre les glaces (colonne B) et les coups de soleil (colonne C).',
          '`=PENTE(C2:C13;B2:B13)` et `=ORDONNEE.ORIGINE(C2:C13;B2:B13)` donnent la droite de régression, `=COEFFICIENT.DETERMINATION(C2:C13;B2:B13)` le R².',
          'La corrélation partielle en trois colonnes, avec la température en A : `=B2-PREVISION.LINEAIRE(A2;B$2:B$13;A$2:A$13)` pour les résidus des glaces, la même formule sur C pour les coups de soleil, puis `COEFFICIENT.CORRELATION` des deux colonnes de résidus.',
        ],
      },
      {
        type: 'limite',
        titre: 'Les limites',
        texte: [
          'Les douze mois sont fictifs, fabriqués avec le modèle de la cause commune : c\'est pour cela que la corrélation partielle tombe si nettement à zéro. Sur des données réelles, il reste souvent un peu de lien, dû à d\'autres facteurs.',
          'La chaleur ne brûle pas la peau : ce sont les ultraviolets. La température sert ici de mesure commode du beau temps et du temps passé dehors. Les UV culminent autour du solstice, fin juin, quand la chaleur culmine en juillet et août.',
          'r ne mesure que les liens en ligne droite. Une relation en U peut donner r = 0 : voir le quartet d\'Anscombe dans la fiche « Quel graphique pour quelle question ? ».',
          'Le test de Student suppose des observations indépendantes. Douze mois qui se suivent ne le sont pas tout à fait : la p-valeur donne un ordre de grandeur, pas une certitude.',
          'Ajuster ne corrige que les facteurs mesurés. Un facteur caché inconnu reste caché : seule l\'expérience aléatoire les neutralise tous.',
        ],
      },
      { type: 'retenir', titre: 'À retenir', texte: 'Corrélation n\'est pas causalité, mais ce n\'est pas rien : c\'est un indice. Pour remonter à la cause, écartez le hasard, cherchez le facteur caché et retirez-le du calcul. Et quand c\'est possible, tirez au sort.' },
    ],
    sources: [
      { titre: 'Karl Pearson, « Mathematical Contributions to the Theory of Evolution. III. Regression, Heredity, and Panmixia », Philosophical Transactions of the Royal Society A, vol. 187, 1896, p. 253-318' },
      { titre: 'Ronald A. Fisher, « Frequency Distribution of the Values of the Correlation Coefficient in Samples from an Indefinitely Large Population », Biometrika, vol. 10, n° 4, 1915, p. 507-521' },
      { titre: 'George Udny Yule, « Why do we Sometimes get Nonsense-Correlations between Time-Series? », Journal of the Royal Statistical Society, vol. 89, n° 1, 1926, p. 1-63' },
      { titre: 'Richard Doll et A. Bradford Hill, « Smoking and Carcinoma of the Lung », British Medical Journal, vol. 2, n° 4682, 1950, p. 739-748' },
      { titre: 'Ronald A. Fisher, « Cancer and Smoking », Nature, vol. 182, 1958, p. 596' },
      { titre: 'Austin Bradford Hill, « The Environment and Disease: Association or Causation? », Proceedings of the Royal Society of Medicine, vol. 58, n° 5, 1965, p. 295-300' },
      { titre: 'Robert Matthews, « Storks Deliver Babies (p = 0.008) », Teaching Statistics, vol. 22, n° 2, 2000, p. 36-38' },
      { titre: 'Franz H. Messerli, « Chocolate Consumption, Cognitive Function, and Nobel Laureates », New England Journal of Medicine, vol. 367, 2012, p. 1562-1564' },
      { titre: 'Tyler Vigen, Spurious Correlations', url: 'https://www.tylervigen.com/spurious-correlations' },
      { titre: 'Judea Pearl, Causality: Models, Reasoning, and Inference, 2e édition, Cambridge University Press, 2009 (opérateur do et formule d\'ajustement)' },
      { titre: 'Judea Pearl et Dana Mackenzie, The Book of Why, Basic Books, 2018' },
      { titre: 'Organisation mondiale de la santé, Global Solar UV Index: A Practical Guide, 2002' },
      { titre: 'Wikipédia, « Corrélation (statistiques) »', url: 'https://fr.wikipedia.org/wiki/Corr%C3%A9lation_(statistiques)' },
      { titre: 'Wikipédia, « Facteur de confusion »', url: 'https://fr.wikipedia.org/wiki/Facteur_de_confusion' },
    ],
  },
  { id: 'biais-selection', rubrique: 'notions', statut: 'a-venir', titre: 'Le biais du survivant : les avions qui reviennent' },
  { id: 'mediane-moyenne', rubrique: 'notions', statut: 'a-venir', titre: 'Médiane, moyenne, mode : trois façons de dire « typique »' },
  { id: 'loi-grands-nombres', rubrique: 'notions', statut: 'a-venir', titre: 'La loi des grands nombres, avec une pièce de monnaie' },
];
