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
const LABO_DONNEES = {
  // Salaires nets mensuels des 20 salariés d'une entreprise fictive, dont 2 dirigeants
  salaires: {
    libelle: 'Salaire net mensuel',
    unite: '€',
    valeurs: [1850, 1900, 1950, 2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400, 2500, 2600, 2700, 2800, 3000, 3200, 9500, 14000],
  },

  // Monopoly, édition française : fréquentation des cases sur 1 million de tours simulés.
  // Pourcentage des arrêts de pion (prison comprise). Script de simulation décrit dans la fiche.
  'monopoly-groupes': {
    unite: '%',
    decimales: 2,
    decimalesAxe: 0,
    colonneLabel: 'Groupe de couleur',
    colonneValeur: 'Fréquentation moyenne par case',
    items: [
      { label: 'Orange', valeur: 2.94, accent: true },
      { label: 'Rouge', valeur: 2.90 },
      { label: 'Jaune', valeur: 2.69 },
      { label: 'Gares', valeur: 2.62 },
      { label: 'Vert', valeur: 2.57 },
      { label: 'Rose', valeur: 2.52 },
      { label: 'Marron', valeur: 2.42 },
      { label: 'Bleu foncé', valeur: 2.38 },
      { label: 'Bleu ciel', valeur: 2.32 },
    ],
  },
  'monopoly-cases': {
    unite: '%',
    decimales: 2,
    colonneLabel: 'Case',
    colonneValeur: 'Fréquentation',
    items: [
      { label: 'Départ', valeur: 3.05 }, { label: 'Belleville', valeur: 2.64 }, { label: 'Caisse', valeur: 1.75 },
      { label: 'Lecourbe', valeur: 2.20 }, { label: 'Impôts', valeur: 2.38 }, { label: 'Montparnasse', valeur: 2.26 },
      { label: 'Vaugirard', valeur: 2.31 }, { label: 'Chance', valeur: 1.34 }, { label: 'Courcelles', valeur: 2.36 },
      { label: 'République', valeur: 2.30 }, { label: 'Prison', valeur: 6.26, accent: true }, { label: 'Villette', valeur: 2.69 },
      { label: 'Électricité', valeur: 2.27 }, { label: 'Neuilly', valeur: 2.40 }, { label: 'Paradis', valeur: 2.47 },
      { label: 'Gare de Lyon', valeur: 3.12 }, { label: 'Mozart', valeur: 2.80 }, { label: 'Caisse', valeur: 2.39 },
      { label: 'Saint-Michel', valeur: 2.95 }, { label: 'Pigalle', valeur: 3.06 }, { label: 'Parc gratuit', valeur: 2.85 },
      { label: 'Matignon', valeur: 2.79 }, { label: 'Chance', valeur: 1.57 }, { label: 'Malesherbes', valeur: 2.76 },
      { label: 'Henri-Martin', valeur: 3.15 }, { label: 'Gare du Nord', valeur: 2.72 }, { label: 'Saint-Honoré', valeur: 2.74 },
      { label: 'Bourse', valeur: 2.71 }, { label: 'Eaux', valeur: 2.63 }, { label: 'La Fayette', valeur: 2.63 },
      { label: 'Allez en prison', valeur: 0 }, { label: 'Breteuil', valeur: 2.67 }, { label: 'Foch', valeur: 2.59 },
      { label: 'Caisse', valeur: 2.19 }, { label: 'Capucines', valeur: 2.46 }, { label: 'Saint-Lazare', valeur: 2.37 },
      { label: 'Chance', valeur: 1.27 }, { label: 'Champs-Élysées', valeur: 2.15 }, { label: 'Taxe de luxe', valeur: 2.15 },
      { label: 'Rue de la Paix', valeur: 2.60 },
    ],
  },

  // Douze mois fictifs mais réalistes : ventes de glaces et consultations pour coups de soleil
  glaces: {
    x: { libelle: 'Glaces vendues (milliers)', court: 'milliers de glaces' },
    y: { libelle: 'Coups de soleil (consultations)', court: 'consultations' },
    groupes: [
      { id: 'frais', libelle: 'Moins de 12 °C', serie: 3 },
      { id: 'doux', libelle: '12 à 20 °C', serie: 5 },
      { id: 'chaud', libelle: 'Plus de 20 °C', serie: 1 },
    ],
    points: [
      { label: 'Janvier, 7 °C', x: 12, y: 3, groupe: 'frais' },
      { label: 'Février, 8 °C', x: 14, y: 4, groupe: 'frais' },
      { label: 'Mars, 11 °C', x: 20, y: 9, groupe: 'frais' },
      { label: 'Avril, 14 °C', x: 27, y: 15, groupe: 'doux' },
      { label: 'Mai, 18 °C', x: 38, y: 31, groupe: 'doux' },
      { label: 'Juin, 22 °C', x: 52, y: 50, groupe: 'chaud' },
      { label: 'Juillet, 25 °C', x: 61, y: 70, groupe: 'chaud' },
      { label: 'Août, 25 °C', x: 59, y: 64, groupe: 'chaud' },
      { label: 'Septembre, 21 °C', x: 46, y: 38, groupe: 'chaud' },
      { label: 'Octobre, 16 °C', x: 30, y: 14, groupe: 'doux' },
      { label: 'Novembre, 11 °C', x: 19, y: 6, groupe: 'frais' },
      { label: 'Décembre, 8 °C', x: 13, y: 3, groupe: 'frais' },
    ],
  },

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
//  court : libellé du bouton. picto : barres-h, colonnes, courbe, empilees, anneau, nuage, bulles, histogramme, boite, chiffre, chaleur
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
      { nom: 'Boîte à moustaches', picto: 'boite', quand: 'Pour comparer les distributions de plusieurs groupes côte à côte.', eviter: 'Pour un public non initié, sans légende : la boîte demande une explication.' },
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
    accroche: 'Un million de tours de plateau simulés. Toutes les cases ne se valent pas, et c\'est la prison qui décide.',
    visuel: {
      type: 'barres',
      donnees: 'monopoly-groupes',
      titre: 'Fréquentation moyenne d\'une case, par groupe de couleur',
      alt: 'Barres horizontales triées. Orange 2,94 %, rouge 2,90 %, jaune 2,69 %, gares 2,62 %, vert 2,57 %, rose 2,52 %, marron 2,42 %, bleu foncé 2,38 %, bleu ciel 2,32 %.',
      legende: 'Part des arrêts de pion, en moyenne par case du groupe. Le groupe orange arrive en tête, juste devant le rouge.',
    },
    blocs: [
      { type: 'question', titre: 'La question', texte: 'Si toutes les cases avaient la même chance d\'être visitées, chacune recevrait 2,5 % des arrêts. Est-ce le cas ? Et quel groupe de couleur vaut-il mieux acheter ?' },
      { type: 'donnees', titre: 'Les données', texte: 'Pas de données à télécharger : on les fabrique. Un programme lance deux dés un million de fois, déplace un pion sur les 40 cases du plateau français et note chaque case où il s\'arrête.' },
      { type: 'methode', titre: 'La méthode', texte: ['Deux dés à 6 faces, et un double fait rejouer.', 'Trois doubles de suite, la case « Allez en prison » ou une carte « Allez en prison » envoient en prison.', 'Les cartes Chance et Caisse de communauté qui déplacent le pion sont appliquées (Départ, Rue de la Paix, Gare de Lyon, « Reculez de 3 cases »…).', 'On sort de prison au tour suivant, en payant.'] },
      {
        type: 'resultat',
        titre: 'Le résultat',
        texte: 'La prison reçoit 6,26 % des arrêts, plus du double d\'une case normale. Or on en sort en lançant deux dés, et 6, 8 et 9 font partie des totaux les plus fréquents : ils mènent pile sur le groupe orange.',
        visuel: {
          type: 'colonnes',
          donnees: 'monopoly-cases',
          titre: 'Fréquentation des 40 cases, de Départ à Rue de la Paix',
          alt: 'Colonnes pour les 40 cases dans l\'ordre du plateau. Elles tournent autour de 2,5 %, sauf la prison à 6,26 %, les cases Chance autour de 1,3 à 1,6 % et « Allez en prison » à 0 %.',
          legende: 'La prison dépasse toutes les autres cases. La case « Allez en prison » est à zéro : le pion n\'y reste jamais.',
        },
      },
      { type: 'limite', titre: 'Les limites', texte: 'Le modèle ignore les choix des joueurs (rester en prison en fin de partie, par exemple) et le prix des terrains. Fréquentation ne veut pas dire rentabilité : il faut aussi compter le coût des maisons et les loyers.' },
      { type: 'retenir', titre: 'À retenir', texte: 'Une simulation répond à des questions que l\'intuition rate. Ici, une seule règle, la prison, déforme tout le plateau et rend le groupe orange le plus visité.' },
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
    accroche: 'Dans cette entreprise, le salaire moyen est de 3 290 €. Pourtant, 18 salariés sur 20 gagnent moins que ça.',
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
      { type: 'definition', titre: 'Moyenne ou médiane ?', texte: 'La **moyenne** additionne tous les salaires et divise par le nombre de personnes. La **médiane** coupe le groupe en deux : une moitié gagne moins, l\'autre moitié gagne plus.' },
      { type: 'exemple', titre: 'Deux salaires suffisent', texte: 'Sans les deux dirigeants (9 500 € et 14 000 €), la moyenne des 18 autres tombe à 2 350 €. Leur présence l\'augmente de 940 €. La médiane, elle, bouge à peine : 2 325 € contre 2 275 €.' },
      { type: 'erreur', titre: 'L\'erreur fréquente', texte: 'Résumer des données asymétriques par leur moyenne : salaires, prix de l\'immobilier, patrimoine, temps d\'attente. Quelques valeurs extrêmes suffisent à la pousser loin de ce que vit la majorité.' },
      { type: 'astuce', titre: 'Le réflexe', texte: 'Calculez les deux. Si la moyenne et la médiane sont très éloignées, les données sont asymétriques : affichez la médiane, et montrez la distribution quand vous le pouvez.' },
      { type: 'retenir', titre: 'À retenir', texte: 'La moyenne répond à « combien chacun aurait-il si on partageait tout également ? ». La médiane répond à « combien gagne une personne typique ? ». Pour un salaire, c\'est presque toujours la deuxième question qu\'on se pose.' },
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
    accroche: 'Ne partez pas du graphique qui vous plaît. Partez de la question que vous posez à vos données.',
    visuel: {
      type: 'selecteur',
      alt: 'Sélecteur : choisissez une question parmi six (comparer, évolution, répartition, relation, distribution, un seul chiffre) pour voir les graphiques conseillés, quand les utiliser et quand les éviter.',
      legende: 'Choisissez votre question : le guide affiche les formes adaptées, quand les utiliser et quand les éviter.',
    },
    blocs: [
      { type: 'definition', titre: 'Le principe', texte: 'Un graphique sert à répondre à une question. Comparer, suivre une évolution, montrer une répartition, une relation ou une distribution : chaque question a ses formes, et en exclut d\'autres.' },
      { type: 'exemple', titre: 'L\'exemple', texte: '« Quel magasin vend le plus ? » est une comparaison : des barres horizontales, triées. « Nos ventes montent-elles ? » est une évolution : une courbe. Mêmes données, deux questions, deux graphiques.' },
      { type: 'erreur', titre: 'L\'erreur fréquente', texte: 'Le camembert par défaut. Au-delà de 5 parts, ou pour des valeurs proches, l\'œil ne sait pas comparer des angles. Des barres triées sont presque toujours plus lisibles.' },
      { type: 'astuce', titre: 'L\'astuce', texte: 'Écrivez d\'abord la phrase que le lecteur doit retenir. « Plus que » annonce une comparaison, « depuis » une évolution, « la moitié de » une répartition.' },
      { type: 'retenir', titre: 'À retenir', texte: 'Une question, un graphique. Si un graphique doit répondre à deux questions, faites-en deux.' },
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
    accroche: 'Plus on vend de glaces, plus il y a de coups de soleil. Les deux montent ensemble, et pourtant aucune ne cause l\'autre.',
    visuel: {
      type: 'nuage',
      donnees: 'glaces',
      tendance: true,
      coefficient: true,
      titre: 'Glaces vendues et coups de soleil, mois par mois',
      alt: 'Nuage de 12 points, un par mois. Les points forment une ligne qui monte : les mois où l\'on vend le plus de glaces sont aussi ceux où il y a le plus de coups de soleil. Les mois chauds, au-dessus de 20 °C, sont tous en haut à droite.',
      legende: 'Un point par mois, coloré selon la température. La corrélation est très forte, mais la couleur trahit le vrai responsable.',
    },
    blocs: [
      { type: 'definition', titre: 'Corrélation', texte: 'Deux variables sont **corrélées** quand elles varient ensemble : l\'une monte, l\'autre aussi (ou l\'inverse). Le coefficient r va de −1 à 1. Ici, il est proche de 1.' },
      {
        type: 'exemple',
        titre: 'Le facteur caché',
        texte: 'La chaleur fait vendre des glaces. La chaleur pousse aussi à s\'exposer au soleil. Glaces et coups de soleil n\'ont aucun lien direct : ils ont une cause commune.',
        visuel: {
          type: 'causal',
          cause: 'Chaleur',
          effets: ['Glaces vendues', 'Coups de soleil'],
          lien: 'Corrélées, sans lien de cause',
          titre: 'Schéma : une cause commune',
          alt: 'Schéma. La chaleur, en haut, envoie une flèche vers « Glaces vendues » et une autre vers « Coups de soleil ». Entre les deux effets, un trait pointillé : corrélés, sans lien de cause.',
        },
      },
      { type: 'erreur', titre: 'L\'erreur fréquente', texte: 'Lire une corrélation comme une preuve. « Les enfants qui prennent un petit-déjeuner ont de meilleures notes, donc le petit-déjeuner rend meilleur à l\'école. » Le niveau de vie de la famille peut expliquer les deux.' },
      { type: 'astuce', titre: 'Les trois questions à se poser', texte: ['Une troisième variable peut-elle expliquer les deux ?', 'Le lien peut-il aller dans l\'autre sens ?', 'Est-ce une coïncidence, sur une période ou un échantillon trop court ?'] },
      { type: 'retenir', titre: 'À retenir', texte: 'Corrélation n\'est pas causalité. Pour prouver une cause, il faut une expérience contrôlée, comme un essai clinique, ou isoler l\'effet de toutes les autres variables.' },
    ],
  },
  { id: 'biais-selection', rubrique: 'notions', statut: 'a-venir', titre: 'Le biais du survivant : les avions qui reviennent' },
  { id: 'mediane-moyenne', rubrique: 'notions', statut: 'a-venir', titre: 'Médiane, moyenne, mode : trois façons de dire « typique »' },
  { id: 'loi-grands-nombres', rubrique: 'notions', statut: 'a-venir', titre: 'La loi des grands nombres, avec une pièce de monnaie' },
];
