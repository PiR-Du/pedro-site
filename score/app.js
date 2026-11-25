// ============================================================
// JEUX
// ============================================================
// Chaque jeu décrit sa feuille de score :
// - 'rounds' : un score par joueur et par manche (partie libre, Papayoo, Vale of Eternity…) ;
// - 'bids'   : annonce, plis et bonus à chaque manche (Skull King) ;
// - 'sheet'  : une feuille unique remplie en fin de partie, une ligne par catégorie (`rows`) ;
// - 'seasons': deux décrets, pièces et monstres à chaque saison (Cartographers) ;
// - 'belote' : preneur, points, belote et annonces à chaque donne, deux équipes ;
// - 'tarot'  : preneur, contrat, bouts, points et primes à chaque donne.
//
// Ligne de feuille (`rows`) :
// - nombre saisi par défaut ; `neg` le retranche ; `pts` convertit la saisie en points ;
// - `check` : case à cocher qui vaut ce nombre de points ;
// - `pair`  : deux saisies multipliées entre elles (Akropolis : valeur × étoiles) ;
// - `score: false` : ne compte pas, sert au départage ;
// - `award` : trophée remis au meilleur de la ligne.
// `word` nomme la manche : manche, donne ou course (toutes au féminin).
const GAMES = {
  skullking: {
    label: 'Skull King', kind: 'bids', min: 2, max: 8, rounds: 10, direction: 'high',
    hint: '2 à 8 joueurs, 10 manches. À la manche n, chacun reçoit n cartes. Annonce réussie : 20 points par pli (ou 10 × n pour une annonce de zéro), plus les bonus. Annonce ratée : −10 par pli d\'écart (ou −10 × n pour une annonce de zéro ratée).',
  },
  caprices: {
    label: 'Les Caprices du Roi', kind: 'sheet', min: 2, max: 5, direction: 'high',
    hint: '2 à 5 joueurs, 4 manches, décompte en fin de partie : valeur des Sujets, les deux caprices communs et les quatre caprices à +30, +20, +15 et +10.',
    tiebreak: { key: 'sujets', low: true },
    tiebreakHint: 'En cas d\'égalité, le joueur dont les Sujets valent le moins l\'emporte.',
    // Les valeurs au-delà des exemples du livret (suite de 8 cartes, famille de 5)
    // ne sont pas connues : elles se saisissent.
    rows: [
      { key: 'sujets', label: 'Valeur des Sujets' },
      { key: 'ordre', label: '« De l\'ordre ! »' },
      { key: 'union', label: '« L\'union fait la force ! »', max: 75 },
      { key: 'c30', label: 'Caprice à +30', check: 30 },
      { key: 'c20', label: 'Caprice à +20', check: 20 },
      { key: 'c15', label: 'Caprice à +15', check: 15 },
      { key: 'c10', label: 'Caprice à +10', check: 10 },
    ],
  },
  cartographers: {
    label: 'Cartographers', kind: 'seasons', min: 2, max: 8, rounds: 4, direction: 'high',
    hint: '2 à 8 joueurs, 4 saisons. Chaque saison compte deux décrets (printemps A et B, été B et C, automne C et D, hiver D et A), plus 1 point par pièce et −1 par case vide voisine d\'un monstre.',
  },
  belote: {
    label: 'Belote', kind: 'belote', min: 2, max: 2, teams: true, word: 'donne', target: 1000, direction: 'high',
    hint: '2 équipes de 2, partie en 1000 points. Chaque donne vaut 162 points (dix de der compris). Le preneur doit faire plus que la défense, belote et annonces comprises, sinon il est dedans : la défense marque 162 plus toutes les annonces. Capot : 250.',
  },
  tarot: {
    label: 'Tarot', kind: 'tarot', min: 3, max: 5, word: 'donne', direction: 'high',
    hint: '3 à 5 joueurs. Contrat : (25 + écart au seuil) × coefficient (petite 1, garde 2, garde sans 4, garde contre 6). Seuil selon les bouts : 56, 51, 41 ou 36. Petit au bout : 10 × coefficient. Poignée : 20, 30 ou 40 au camp gagnant. À 5, le preneur appelle un partenaire.',
  },
  papayoo: {
    label: 'Papayoo', kind: 'rounds', min: 3, max: 8, word: 'donne', direction: 'low', roundTotal: 250,
    hint: '3 à 8 joueurs, le plus petit score gagne. Les Payoo valent leur chiffre, le Papayoo 40 points : 250 points par donne. Jouez autant de donnes que de joueurs, ou jusqu\'au score convenu.',
    titles: { win: 'L\'Immaculé', winText: t => `${t} pts seulement. Les Payoo ne l'ont jamais attrapé.`, last: 'Le Papayoyo', lastText: t => `${t} pts ramassés. Il collectionne les Payoo comme d'autres les timbres.` },
    extraAwards: g => {
      const zeros = g.players.map((_, i) => g.rounds.filter(r => (r[i] ?? 0) === 0).length);
      const worst = g.players.map((_, i) => Math.max(...g.rounds.map(r => r[i] ?? 0)));
      const out = [];
      const z = bestOf(g, zeros, v => v >= 1);
      if (z) out.push({ title: 'Les Mains propres', player: z.who, desc: `${plural(z.v, 'donne')} sans ramasser un seul point.` });
      const w = bestOf(g, worst, v => v >= 40);
      if (w) out.push({ title: 'La Douche froide', player: w.who, desc: `${w.v} pts en une seule donne. Le Papayoo était dans le lot.` });
      return out;
    },
  },
  citadelles: {
    label: 'Citadelles', kind: 'sheet', min: 2, max: 8, direction: 'high',
    hint: '2 à 8 joueurs. La partie s\'arrête à la fin du tour où une cité atteint 7 quartiers. Décompte : coût des quartiers, +3 pour les cinq types, +4 pour la première cité complète, +2 pour les autres cités complètes, plus les effets des quartiers merveilleux.',
    tiebreak: { key: 'role', low: false },
    tiebreakHint: 'En cas d\'égalité, le joueur qui a révélé le personnage de rang le plus élevé au dernier tour l\'emporte.',
    titles: { win: 'Le Bâtisseur royal', winText: t => `${t} pts. Sa cité éclipse toutes les autres.`, last: 'Le Sans-Logis', lastText: t => `${t} pts. Quelques masures et beaucoup de promesses.` },
    rows: [
      { key: 'quartiers', label: 'Valeur des quartiers', hint: 'Coût de construction de chaque quartier de la cité',
        award: { title: 'L\'Architecte', text: v => `${v} pts de quartiers bâtis. Les plus belles pierres du royaume.` } },
      { key: 'couleurs', label: 'Cinq types de quartiers', check: 3,
        award: { title: 'L\'Éclectique', text: () => 'Les cinq types de quartiers dans sa cité : noble, religieux, commerçant, militaire et merveilleux.' } },
      { key: 'premier', label: 'Première cité complète', check: 4,
        award: { title: 'Le Pressé', text: () => 'Le premier à terminer sa cité. Il a sonné la fin de la partie.' } },
      { key: 'complete', label: 'Cité complète', check: 2, hint: 'Les autres joueurs qui ont terminé' },
      { key: 'merveilles', label: 'Quartiers merveilleux', hint: 'Points des effets de fin de partie',
        award: { title: 'Le Merveilleux', text: v => `${v} pts tirés des quartiers merveilleux. Une cité pleine de surprises.` } },
      { key: 'role', label: 'Rang du dernier personnage', score: false, hint: 'Départage, de 1 à 8' },
    ],
  },
  akropolis: {
    label: 'Akropolis', kind: 'sheet', min: 2, max: 4, direction: 'high',
    hint: '2 à 4 joueurs. Chaque type de quartier rapporte la hauteur de ses quartiers valides multipliée par les étoiles de ses places, plus 1 point par pierre.',
    tiebreak: { key: 'pierres', low: false },
    tiebreakHint: 'En cas d\'égalité, le joueur qui a le plus de pierres l\'emporte.',
    titles: { win: 'L\'Archonte', winText: t => `${t} pts. Sa cité domine l'Acropole.`, last: 'Le Métèque', lastText: t => `${t} pts. Une cité qui reste au pied de la colline.` },
    rows: [
      { key: 'habitations', label: 'Habitations (bleu)', pair: ['Hauteurs', 'Étoiles'],
        award: { title: 'Le Démos', text: v => `${v} pts d'habitations. Le peuple a trouvé à se loger.` } },
      { key: 'marches', label: 'Marchés (jaune)', pair: ['Hauteurs', 'Étoiles'],
        award: { title: 'L\'Agora', text: v => `${v} pts de marchés. Le commerce ne dort jamais.` } },
      { key: 'casernes', label: 'Casernes (rouge)', pair: ['Hauteurs', 'Étoiles'],
        award: { title: 'Le Stratège', text: v => `${v} pts de casernes. Les remparts sont gardés.` } },
      { key: 'temples', label: 'Temples (violet)', pair: ['Hauteurs', 'Étoiles'],
        award: { title: 'Le Grand Prêtre', text: v => `${v} pts de temples. Les dieux veillent sur sa cité.` } },
      { key: 'jardins', label: 'Jardins (vert)', pair: ['Hauteurs', 'Étoiles'],
        award: { title: 'Le Jardinier', text: v => `${v} pts de jardins. La cité la plus verte de l'Égée.` } },
      { key: 'pierres', label: 'Pierres', hint: '1 point par pierre',
        award: { title: 'Le Carrier', text: v => `${plural(v, 'pierre')} en réserve. Prêt pour le prochain chantier.` } },
    ],
  },
  harmonies: {
    label: 'Harmonies', kind: 'sheet', min: 2, max: 4, direction: 'high',
    hint: '2 à 4 joueurs. Décompte des paysages (arbres, montagnes, champs, bâtiments, eau), puis des cartes Animal. L\'esprit de la nature est une variante.',
    titles: { win: 'L\'Esprit de la forêt', winText: t => `${t} pts. Un paysage où chaque espèce trouve sa place.`, last: 'Le Promeneur', lastText: t => `${t} pts. Une jolie balade, à défaut d'un écosystème.` },
    rows: [
      { key: 'arbres', label: 'Arbres', award: { title: 'Le Forestier', text: v => `${v} pts d'arbres. Une canopée digne de ce nom.` } },
      { key: 'montagnes', label: 'Montagnes', award: { title: 'Le Montagnard', text: v => `${v} pts de montagnes. Il a l'air des sommets.` } },
      { key: 'champs', label: 'Champs', award: { title: 'Le Moissonneur', text: v => `${v} pts de champs. La récolte sera bonne.` } },
      { key: 'batiments', label: 'Bâtiments', award: { title: 'Le Bâtisseur', text: v => `${v} pts de bâtiments. Un village en pleine nature.` } },
      { key: 'eau', label: 'Eau', hint: 'Rivière ou îles, selon la face du plateau',
        award: { title: 'La Source', text: v => `${v} pts d'eau. Les rivières coulent de son côté.` } },
      { key: 'animaux', label: 'Cartes Animal',
        award: { title: 'Le Naturaliste', text: v => `${v} pts d'animaux. Tout le monde a trouvé son habitat.` } },
      { key: 'esprit', label: 'Esprit de la nature', hint: 'Variante' },
    ],
  },
  faraway: {
    label: 'Faraway', kind: 'sheet', min: 2, max: 6, direction: 'high',
    hint: '2 à 6 joueurs, 8 manches. Les cartes se révèlent dans l\'ordre inverse : la région 8 compte en premier, la région 1 en dernier. Chaque carte ne voit que les cartes révélées avant elle. Les sanctuaires comptent à la fin.',
    titles: { win: 'Le Grand Explorateur', winText: t => `${t} pts. Son voyage en Alula restera dans les chroniques.`, last: 'Le Touriste égaré', lastText: t => `${t} pts. Il a surtout vu du pays.` },
    rows: [
      ...[8, 7, 6, 5, 4, 3, 2, 1].map(n => ({ key: `r${n}`, label: `Région ${n}` })),
      { key: 'sanctuaires', label: 'Sanctuaires',
        award: { title: 'Le Pèlerin', text: v => `${v} pts de sanctuaires. Il a pris le temps de se recueillir.` } },
    ],
    extraAwards: g => {
      const out = [];
      const best = g.players.map((_, i) => Math.max(...[1, 2, 3, 4, 5, 6, 7, 8].map(n => toInt(g.sheet[`r${n}`][i]))));
      const b = bestOf(g, best, v => v > 0);
      if (b) out.push({ title: 'La Découverte', player: b.who, desc: `${b.v} pts sur une seule région. Le joyau du voyage.` });
      const late = g.players.map((_, i) => toInt(g.sheet.r1[i]) + toInt(g.sheet.r2[i]));
      const l = bestOf(g, late, v => v > 0);
      if (l) out.push({ title: 'Le Patient', player: l.who, desc: `${l.v} pts sur les régions 1 et 2, celles qui voient tout le voyage.` });
      return out;
    },
  },
  wyrmspan: {
    label: 'Wyrmspan', kind: 'sheet', min: 2, max: 5, direction: 'high',
    hint: '2 à 5 joueurs, 4 manches. Décompte : points imprimés des dragons, capacités de fin de partie, œufs, ressources en cache, cartes glissées, objectifs de manche et guilde.',
    titles: { win: 'Le Maître des Dragons', winText: t => `${t} pts. Le sanctuaire le plus couru du royaume.`, last: 'Le Gardien de lézards', lastText: t => `${t} pts. Les dragons viendront, un jour.` },
    rows: [
      { key: 'dragons', label: 'Dragons', hint: 'Points imprimés sur les cartes',
        award: { title: 'Le Dompteur', text: v => `${v} pts de dragons. Une ménagerie impressionnante.` } },
      { key: 'fin', label: 'Capacités de fin de partie',
        award: { title: 'Le Stratège', text: v => `${v} pts de capacités de fin de partie. Tout était prévu.` } },
      { key: 'oeufs', label: 'Œufs', hint: '1 point par œuf',
        award: { title: 'La Couveuse', text: v => `${plural(v, 'œuf')}. La relève est assurée.` } },
      { key: 'cache', label: 'Ressources en cache', hint: '1 point par ressource',
        award: { title: 'Le Trésorier', text: v => `${v} pts de ressources en cache. Un dragon, ça amasse.` } },
      { key: 'glisses', label: 'Cartes glissées', hint: '1 point par carte' },
      { key: 'objectifs', label: 'Objectifs de manche',
        award: { title: 'L\'Ambitieux', text: v => `${v} pts d'objectifs de manche. Toujours en tête de course.` } },
      { key: 'guilde', label: 'Guilde des dragons',
        award: { title: 'Le Guildien', text: v => `${v} pts de guilde. Bien vu chez les dragonologues.` } },
      { key: 'autres', label: 'Autres points', hint: 'Restes de pièces et de ressources, selon le livret' },
    ],
  },
  vale: {
    label: 'Vale of Eternity', kind: 'rounds', min: 2, max: 4, rounds: 10, target: 60, direction: 'high',
    hint: '2 à 4 joueurs. La partie s\'arrête à la fin de la manche où un joueur atteint 60 points, ou après 10 manches. Notez les points gagnés à chaque manche.',
    titles: { win: 'L\'Éternel', winText: t => `${t} pts. Ses créatures entrent dans la légende.`, last: 'L\'Invocateur raté', lastText: t => `${t} pts. Les créatures n'ont pas répondu à l'appel.` },
  },
  chateau: {
    label: 'Château Combo', kind: 'sheet', min: 2, max: 5, direction: 'high',
    hint: '2 à 5 joueurs. La partie s\'arrête quand chacun a 9 cartes en carré de 3 × 3. Chaque carte rapporte les points de son effet de décompte.',
    titles: { win: 'Le Seigneur du Château', winText: t => `${t} pts. Le combo parfait, en neuf cartes.`, last: 'Le Valet de pied', lastText: t => `${t} pts. Le château attendra.` },
    rows: [
      { key: 'nobles', label: 'Nobles', hint: 'Cartes à bannière bleue',
        award: { title: 'Le Courtisan', text: v => `${v} pts de nobles. Toute la cour à sa table.` } },
      { key: 'villageois', label: 'Villageois', hint: 'Cartes à bannière jaune',
        award: { title: 'L\'Ami du peuple', text: v => `${v} pts de villageois. Le village le suivrait partout.` } },
    ],
  },
  pointcity: {
    label: 'Point City', kind: 'sheet', min: 2, max: 4, direction: 'high',
    hint: '2 à 4 joueurs. La partie s\'arrête quand le marché ne peut plus être rempli. Décompte : points imprimés des bâtiments, plus les jetons Civiques.',
    tiebreak: { key: 'ressources', low: false },
    tiebreakHint: 'En cas d\'égalité, le joueur qui a le plus de cartes Ressource non dépensées l\'emporte.',
    titles: { win: 'Le Maire', winText: t => `${t} pts. Réélu dans un fauteuil.`, last: 'Le Promoteur en faillite', lastText: t => `${t} pts. Le chantier est à l'arrêt.` },
    rows: [
      { key: 'batiments', label: 'Bâtiments', hint: 'Points imprimés',
        award: { title: 'L\'Urbaniste', text: v => `${v} pts de bâtiments. Une skyline qui en impose.` } },
      { key: 'civiques', label: 'Jetons Civiques',
        award: { title: 'Le Conseiller municipal', text: v => `${v} pts de jetons Civiques. Il connaît les bons dossiers.` } },
      { key: 'ressources', label: 'Ressources non dépensées', score: false, hint: 'Départage' },
    ],
  },
  courtisans: {
    label: 'Courtisans', kind: 'sheet', min: 2, max: 5, direction: 'high',
    hint: '2 à 5 joueurs. En fin de partie, chaque famille est en estime ou en disgrâce sur la table de la Reine. Chaque carte de votre domaine rapporte +1 si sa famille est en estime, −1 si elle est en disgrâce ; un noble compte double.',
    titles: { win: 'Le Favori de la Reine', winText: t => `${t} pts. La Reine ne jure que par lui.`, last: 'L\'Exilé', lastText: t => `${t} pts. Prié de quitter la cour avant la nuit.` },
    rows: [
      { key: 'estime', label: 'Familles en estime', hint: '+1 par carte, +2 par noble',
        award: { title: 'L\'Intrigant', text: v => `+${v} pts de familles en estime. Il a misé sur les bons chevaux.` } },
      { key: 'disgrace', label: 'Familles en disgrâce', neg: true, hint: 'Saisir en positif : 1 par carte, 2 par noble',
        award: { title: 'Le Mal Entouré', text: v => `−${v} pts de familles en disgrâce. Ses amis ont mauvaise réputation.` } },
    ],
  },
  emblemes: {
    label: 'Emblèmes', kind: 'rounds', min: 3, max: 5, rounds: 3, start: 3, direction: 'high',
    hint: '3 à 5 joueurs, 3 manches. Chacun commence avec 3 pièces d\'or, comptées dans le total. Notez le solde de pièces de chaque manche : récompenses des lieux et effets, moins les vols.',
    tiebreakHint: 'En cas d\'égalité, le détenteur du pion Premier joueur l\'emporte, ou le plus proche de lui dans le sens horaire.',
    titles: { win: 'Le Porte-Bannière', winText: t => `${t} pièces d'or. Son emblème flotte sur le château.`, last: 'Le Sans-Blason', lastText: t => `${t} pièces d'or. Une famille qui reste dans l'ombre.` },
  },
  ouad: {
    label: 'Once Upon a Draft', kind: 'sheet', min: 2, max: 6, direction: 'high',
    hint: '2 à 6 joueurs, 3 chapitres. Une étoile vaut 2 points, un cœur 1 point, une paire de gemmes 1 point. La majorité de gemmes rapporte 4 cœurs, à chaque joueur ex æquo.',
    tiebreak: { key: 'carte', low: false },
    tiebreakHint: 'En cas d\'égalité, le joueur qui a la carte de plus forte valeur dans son équipe l\'emporte.',
    titles: { win: 'Il était une fois…', winText: t => `${t} pts. L'équipe la plus féerique du royaume.`, last: 'Le Grand Méchant Loup', lastText: t => `${t} pts. Il ne vécut pas heureux, et n'eut pas beaucoup de points.` },
    rows: [
      { key: 'etoiles', label: 'Étoiles', hint: '2 points par étoile', pts: n => 2 * n,
        award: { title: 'L\'Étoile du conte', text: v => `${v} pts d'étoiles. Il a remporté les plis qui comptaient.` } },
      { key: 'coeurs', label: 'Cœurs', hint: '1 point par cœur, hors majorité',
        award: { title: 'Le Cœur tendre', text: v => `${plural(v, 'cœur')} récoltés. Tout le monde l'aime.` } },
      { key: 'gemmes', label: 'Gemmes', hint: '1 point par paire', pts: n => Math.floor(n / 2),
        award: { title: 'Le Dragon', text: v => `${v} pts de gemmes. Assis sur son trésor.` } },
      { key: 'carte', label: 'Carte la plus forte', score: false, hint: 'Départage, de 1 à 50' },
    ],
    // La majorité de gemmes rapporte 4 cœurs, soit 4 points, à chaque ex æquo
    extra: {
      label: 'Majorité de gemmes', hint: '+4 cœurs, calculé',
      fn: g => {
        const gems = g.sheet.gemmes.map(toInt);
        const top = Math.max(...gems);
        return gems.map(v => (top > 0 && v === top ? 4 : 0));
      },
    },
  },
  athletes: {
    label: 'Athlètes de compète', kind: 'rounds', min: 2, max: 6, rounds: 4, word: 'course', direction: 'high',
    hint: '2 à 6 joueurs, 4 courses : Pépère, Galère, Pépère, Galère. Notez les points de chaque course : Trophée en Or du 1er, Médaille d\'Argent du 2e (valeurs imprimées sur les jetons, croissantes), et 1 point de Bronze par case Étoile en Galère.',
    tiebreakHint: 'En cas d\'égalité, pas de départage : tout le monde a gagné.',
    titles: { win: 'Le Champion olympique', winText: t => `${t} pts. Le podium lui va si bien.`, last: 'La Lanterne rouge', lastText: t => `${t} pts. Il a surtout trébuché avec style.` },
  },
  free: {
    label: 'Partie libre', kind: 'rounds', min: 2, max: 8,
    hint: 'N\'importe quel jeu : un score par joueur et par manche.',
  },
};
const GAME_ORDER = ['skullking', 'caprices', 'cartographers', 'belote', 'tarot', 'papayoo', 'citadelles', 'akropolis', 'harmonies', 'faraway', 'wyrmspan', 'vale', 'chateau', 'pointcity', 'courtisans', 'emblemes', 'ouad', 'athletes', 'free'];

// Cartographers : les décrets comptés à chaque saison
const SEASONS = [
  { name: 'Printemps', edicts: ['A', 'B'] },
  { name: 'Été', edicts: ['B', 'C'] },
  { name: 'Automne', edicts: ['C', 'D'] },
  { name: 'Hiver', edicts: ['D', 'A'] },
];
const SEASON_FIELDS = ['e1', 'e2', 'coins', 'monsters'];

const TIEBREAK_HINTS = {
  seasons: 'En cas d\'égalité, le joueur qui a perdu le moins de points à cause des monstres l\'emporte.',
};

// Tarot : coefficients, seuils selon le nombre de bouts, primes
const TAROT_CONTRACTS = {
  petite: { label: 'Petite', mult: 1 },
  garde: { label: 'Garde', mult: 2 },
  gardesans: { label: 'Garde sans', mult: 4 },
  gardecontre: { label: 'Garde contre', mult: 6 },
};
const TAROT_THRESHOLDS = [56, 51, 41, 36];
const TAROT_HANDFULS = { simple: 20, double: 30, triple: 40 };
const TAROT_SLAMS = { annonce: 400, nonannonce: 200, chute: -200 };

function gameDef(g) { return GAMES[g?.game] || GAMES.free; }
function kindOf(g) { return gameDef(g).kind; }
function sheetRows(g) { return gameDef(g).rows || []; }
// Nom de la manche (manche, donne, course), toujours au féminin
function word(g) { return gameDef(g).word || 'manche'; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
// Saisies détaillées à chaque manche, nécessaires pour corriger une manche
const DETAIL_KINDS = ['bids', 'seasons', 'belote', 'tarot'];

// ============================================================
// ÉTAT
// ============================================================
// Chaque joueur porte une série de données (1 à 8), définie dans css/tokens.css.
const SERIES_NAMES = ['Rouge', 'Encre', 'Bleu', 'Vert', 'Ocre', 'Gris', 'Prune', 'Sarcelle'];
const SERIES_ORDER = [1, 3, 4, 5, 7, 8, 2, 6];
// Couleurs des parties enregistrées avant la refonte, converties vers une série.
const LEGACY_COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706', '#db2777', '#0891b2', '#65a30d'];

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
}

let state = {
  currentGame: null,
  history: readJson('boardnight_history', []),
  setupGame: 'skullking',
  setupPlayers: [],
  avatarEditIdx: null,
  pendingSeries: null,
  activeChart: null,
  chartMode: 'line',
  // Belote et Tarot : saisie de la donne en cours, avant validation
  draft: null,
  draftFor: null,
};

// ============================================================
// UTILITAIRES
// ============================================================
function seriesOf(player, fallbackIdx = 0) {
  if (player.series) return player.series;
  const legacy = LEGACY_COLORS.indexOf(player.color);
  return ((legacy >= 0 ? legacy : (player.idx ?? fallbackIdx)) % 8) + 1;
}

function avatarHtml(player, fallbackIdx = 0) {
  const initial = (player.name || '?').trim().charAt(0) || '?';
  return `<span class="avatar swatch--${seriesOf(player, fallbackIdx)}" aria-hidden="true">${escapeHtml(initial)}</span>`;
}

function playerCell(player, fallbackIdx = 0) {
  return `<span class="player-cell">${avatarHtml(player, fallbackIdx)}${escapeHtml(player.name)}</span>`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR');
}

function plural(n, word) {
  return `${n} ${word}${Math.abs(n) > 1 ? 's' : ''}`;
}

function signed(n) {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0';
}

function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

// Résumé de l'avancement, pour l'en-tête de partie et le bandeau de reprise
function progressText(g) {
  if (kindOf(g) === 'sheet') return 'Décompte de fin de partie';
  if (kindOf(g) === 'seasons') {
    const n = g.rounds.length;
    if (n >= SEASONS.length) return `${SEASONS.length} saisons jouées`;
    return `${SEASONS[n].name}, saison ${n + 1} sur ${SEASONS.length}`;
  }
  const w = word(g);
  const done = `${plural(g.rounds.length, w)} terminée${g.rounds.length > 1 ? 's' : ''}`;
  const total = gameDef(g).rounds;
  if (total) {
    if (g.rounds.length >= total) return `${total} ${w}s jouées`;
    return `${cap(w)} ${g.rounds.length + 1} sur ${total} · ${done}`;
  }
  return `${cap(w)} ${g.rounds.length + 1} en cours · ${done}`;
}

function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('is-active'));
  const view = document.getElementById('view-' + v);
  view.classList.add('is-active');
  if (v === 'welcome') renderWelcome();
  if (v === 'history') renderHistory();
  if (v === 'game') {
    const g = state.currentGame;
    document.getElementById('game-display-name').textContent = g.name;
    const isSheet = kindOf(g) === 'sheet';
    document.querySelectorAll('[data-rounds-only]').forEach(el => { el.hidden = isSheet; });
    // La feuille des Caprices a une colonne par joueur : elle prend 8 colonnes de la grille
    document.getElementById('round-form').className = isSheet ? 'col-1-8 stack' : 'col-1-5 md-col-1-4 stack';
    document.getElementById('game-side').className = isSheet ? 'col-9-12 stack stack--6' : 'col-7-12 md-col-5-8 stack stack--6';
    const tiebreak = document.getElementById('tiebreak-hint');
    const tiebreakText = gameDef(g).tiebreakHint || TIEBREAK_HINTS[kindOf(g)] || '';
    tiebreak.textContent = tiebreakText;
    tiebreak.hidden = !tiebreakText;
    document.querySelector('[data-action="undo"]').textContent = `Annuler la dernière ${word(g)}`;
    document.getElementById('rounds-title').textContent = `Historique des ${word(g)}s`;
    document.getElementById('rounds-help').textContent = `Un clic sur un score rouvre la ${word(g)} pour la corriger.`;
    document.getElementById('chart-no-data').textContent = `Validez une ${word(g)} pour voir le graphique.`;
    document.querySelector('[data-action="chart"][data-mode="bar"]').textContent = `${cap(word(g))}s`;
    refreshGame();
  }
  if (v === 'awards') renderAwards();
  window.scrollTo(0, 0);
  // Le titre de la vue reçoit le focus : le changement est annoncé aux lecteurs d'écran
  view.querySelector('.view__title')?.focus({ preventScroll: true });
}

function refreshGame() {
  updateRoundInfo(); renderLeaderboard(); renderScoreInputs();
  if (kindOf(state.currentGame) !== 'sheet') { renderRoundHistory(); renderChart(); renderLiveStats(); }
}

function toast(msg, type = 'default', dur = 2800) {
  showToast(msg, type === 'error' ? 'error' : 'default', dur);
}

function saveHistory() { localStorage.setItem('boardnight_history', JSON.stringify(state.history)); }
function saveCurrentGame() {
  if (state.currentGame) localStorage.setItem('boardnight_current', JSON.stringify(state.currentGame));
  else localStorage.removeItem('boardnight_current');
}

// ============================================================
// CONFIRMATION
// ============================================================
function showConfirm(msg, onConfirm, confirmLabel = 'Confirmer', danger = false) {
  const dialog = document.getElementById('confirm-overlay');
  document.getElementById('confirm-msg').textContent = msg;
  const btn = document.getElementById('confirm-ok');
  btn.textContent = confirmLabel;
  btn.className = 'btn ' + (danger ? 'btn--danger' : 'btn--primary');
  btn.onclick = () => { dialog.close(); onConfirm(); };
  dialog.showModal();
}

// ============================================================
// ACCUEIL
// ============================================================
function gameRow(g, idx, deletable = false) {
  const top3 = (g.finalRanked || []).slice(0, 3);
  const meta = [plural(g.players?.length || 0, 'joueur')];
  if (kindOf(g) !== 'sheet') meta.push(plural(g.rounds?.length || 0, word(g)));
  return `
    <li class="result">
      <span class="eyebrow">${formatDate(g.date)}</span>
      <h3 class="result__title"><button type="button" class="entry__link" data-action="review" data-index="${idx}">${escapeHtml(g.name)}</button></h3>
      <p class="result__body">${top3.map((p, r) => `${r + 1}. ${escapeHtml(p.name)} ${p.total}`).join(' · ')}</p>
      <span class="eyebrow result__meta">${meta.join(' · ')}</span>
      ${deletable ? `<button type="button" class="btn btn--quiet btn--sm" data-action="delete-game" data-index="${idx}" aria-label="Supprimer la partie ${escapeHtml(g.name)} du ${formatDate(g.date)}">Supprimer</button>` : ''}
    </li>`;
}

function renderWelcome() {
  const list = document.getElementById('recent-games-list');
  list.innerHTML = state.history.length
    ? state.history.slice(-5).reverse().map((g, i) => gameRow(g, state.history.length - 1 - i)).join('')
    : '<li class="empty">Aucune partie enregistrée pour le moment.</li>';
}

// ============================================================
// CONFIGURATION
// ============================================================
function initSetup() {
  // Reprend le jeu et les joueurs de la dernière partie
  const last = state.history[state.history.length - 1];
  state.setupGame = GAMES[last?.game] ? last.game : 'skullking';
  if (last && last.players && last.players.length >= 2) {
    state.setupPlayers = last.players.map((p, i) => ({ name: p.name, series: seriesOf(p, i), ...(p.members ? { members: [...p.members] } : {}) }));
  } else {
    state.setupPlayers = [{ name: 'Joueur 1', series: 1 }, { name: 'Joueur 2', series: 3 }];
  }
  renderSetup();
}

function renderSetup() {
  const def = GAMES[state.setupGame];
  // Liste déroulante par ordre alphabétique, la partie libre en dernier
  const keys = GAME_ORDER.filter(k => k !== 'free').sort((a, b) => GAMES[a].label.localeCompare(GAMES[b].label, 'fr'));
  const picker = document.getElementById('game-picker');
  picker.innerHTML = [...keys, 'free'].map(key => `<option value="${key}">${escapeHtml(GAMES[key].label)}</option>`).join('');
  picker.value = state.setupGame;
  document.getElementById('game-hint').textContent = def.hint;
  document.getElementById('free-fields').hidden = state.setupGame !== 'free';
  document.getElementById('count-range').textContent = def.min === def.max ? `(${def.min})` : `(${def.min} à ${def.max})`;
  document.getElementById('count-label').firstChild.textContent = def.teams ? 'Nombre d\'équipes ' : 'Nombre de joueurs ';
  document.getElementById('players-legend').textContent = def.teams ? 'Équipes' : 'Joueurs';
  setPlayerCount(state.setupPlayers.length);
}

// Nom par défaut d'un joueur ou d'une équipe ; un nom saisi n'est jamais remplacé
function defaultName(i) { return `${GAMES[state.setupGame].teams ? 'Équipe' : 'Joueur'} ${i + 1}`; }

function pickGame(key) {
  if (!GAMES[key]) return;
  state.setupGame = key;
  state.setupPlayers.forEach((p, i) => { if (/^(Joueur|Équipe) \d+$/.test(p.name)) p.name = defaultName(i); });
  renderSetup();
}

// Ajuste la liste des joueurs au nombre voulu, dans les bornes du jeu
function setPlayerCount(n) {
  const def = GAMES[state.setupGame];
  n = Math.max(def.min, Math.min(def.max, n));
  while (state.setupPlayers.length > n) state.setupPlayers.pop();
  while (state.setupPlayers.length < n) {
    const used = state.setupPlayers.map(p => p.series);
    const free = SERIES_ORDER.find(s => !used.includes(s)) || 1;
    state.setupPlayers.push({ name: defaultName(state.setupPlayers.length), series: free });
  }
  document.getElementById('player-count').textContent = n;
  document.querySelector('[data-action="count"][data-step="-1"]').disabled = n <= def.min;
  document.querySelector('[data-action="count"][data-step="1"]').disabled = n >= def.max;
  renderSetupPlayers();
}

// Belote : nom par défaut des deux membres d'une équipe
function defaultMember(i, m) { return `Joueur ${2 * i + m + 1}`; }

function renderSetupPlayers() {
  const teams = GAMES[state.setupGame].teams;
  document.getElementById('player-list').innerHTML = state.setupPlayers.map((p, i) => {
    if (teams && !p.members) p.members = [defaultMember(i, 0), defaultMember(i, 1)];
    const members = teams ? `
    <div class="bid-row__fields bid-row__fields--2">${p.members.map((m, mi) => `
      <input class="input" type="text" value="${escapeHtml(m)}" placeholder="Membre ${mi + 1}" aria-label="Membre ${mi + 1} de ${escapeHtml(p.name)}" data-index="${i}" data-member="${mi}">`).join('')}
    </div>` : '';
    return `
    <div class="player-row">
      <button type="button" class="avatar swatch--${p.series}" data-action="pick-color" data-index="${i}" aria-label="Changer la couleur de ${escapeHtml(p.name)}, actuellement ${SERIES_NAMES[p.series - 1]}">${escapeHtml(p.name.trim().charAt(0) || '?')}</button>
      <input class="input" type="text" value="${escapeHtml(p.name)}" placeholder="Nom du joueur" aria-label="Nom du joueur ${i + 1}" data-index="${i}">
    </div>${members}`;
  }).join('');
}

function startGame() {
  const def = GAMES[state.setupGame];
  const players = state.setupPlayers.map((p, i) => {
    const out = { name: p.name.trim() || defaultName(i), series: p.series };
    if (def.teams) out.members = [0, 1].map(m => (p.members?.[m] || '').trim() || defaultMember(i, m));
    return out;
  });
  if (players.length < def.min || players.length > def.max) { toast(`${def.label} se joue de ${def.min} à ${def.max} joueurs.`, 'error'); return; }

  const isFree = state.setupGame === 'free';
  const g = {
    id: Date.now(),
    game: state.setupGame,
    name: isFree ? (document.getElementById('game-name-input').value.trim() || 'Soirée Jeux') : def.label,
    direction: isFree ? document.getElementById('score-direction').value : def.direction,
    date: new Date().toISOString(),
    players,
    rounds: [],
    details: [],
    currentRound: 1,
    pending: null,
    editing: null,
  };
  if (def.kind === 'sheet') {
    g.sheet = {};
    def.rows.forEach(row => { g.sheet[row.key] = players.map(() => (row.check ? false : row.pair ? [0, 0] : 0)); });
    g.rounds = [players.map(() => 0)];
  }
  state.draft = null;
  state.draftFor = null;
  state.currentGame = g;
  saveCurrentGame();
  showView('game');
}

// ============================================================
// COULEUR DU JOUEUR
// ============================================================
function openAvatarModal(i) {
  state.avatarEditIdx = i;
  state.pendingSeries = state.setupPlayers[i].series;
  document.getElementById('color-picker').innerHTML = SERIES_NAMES.map((name, si) => `
    <button type="button" class="color-picker__option" data-action="select-color" data-series="${si + 1}" aria-pressed="${si + 1 === state.pendingSeries}">
      <span class="swatch swatch--${si + 1}"></span>${name}
    </button>`).join('');
  document.getElementById('avatar-modal').showModal();
}

function selectColor(el) {
  state.pendingSeries = Number(el.dataset.series);
  document.querySelectorAll('.color-picker__option').forEach(o => o.setAttribute('aria-pressed', String(o === el)));
}

function confirmAvatar() {
  state.setupPlayers[state.avatarEditIdx].series = state.pendingSeries;
  document.getElementById('avatar-modal').close();
  renderSetupPlayers();
}

// ============================================================
// SKULL KING : DÉCOMPTE
// ============================================================
// Annonce de zéro : 10 × nombre de cartes si réussie, −10 × nombre de cartes sinon.
// Annonce d'au moins un pli : 20 par pli si réussie, −10 par pli d'écart sinon.
// Les bonus ne comptent que si l'annonce est réussie.
function skullKingScore(cards, bid, tricks, bonus) {
  if (bid === 0) return tricks === 0 ? 10 * cards + bonus : -10 * cards;
  if (tricks === bid) return 20 * bid + bonus;
  return -10 * Math.abs(tricks - bid);
}

// ============================================================
// BELOTE : DÉCOMPTE
// ============================================================
// 162 points par donne, dix de der compris. Belote-rebelote : 20 points, toujours
// gardés par l'équipe qui l'a. Le preneur doit faire plus que la défense, belote et
// annonces comprises ; sinon il est dedans et la défense prend 162 plus toutes les
// annonces. Capot du preneur : 250 plus ses annonces.
const TRUMPS = {
  coeur: { label: 'Cœur', sym: '♥' },
  carreau: { label: 'Carreau', sym: '♦' },
  trefle: { label: 'Trèfle', sym: '♣' },
  pique: { label: 'Pique', sym: '♠' },
};

// Les parties d'avant l'ajout des membres n'ont que les noms d'équipe
function hasMembers(g) { return g.players.every(p => p.members?.length === 2); }

// Nom du joueur qui a pris (ou de l'équipe, pour une ancienne partie)
function takerName(g, d) {
  const team = g.players[d.taker];
  if (!team) return '';
  return hasMembers(g) && d.takerMember != null ? team.members[d.takerMember] : team.name;
}

function beloteScore(d) {
  const t = d.taker;
  const o = 1 - t;
  const bel = [0, 0];
  if (d.belote !== '' && d.belote != null) bel[d.belote] = 20;
  const ann = [toInt(d.ann0), toInt(d.ann1)];
  const pts = Math.max(0, Math.min(162, toInt(d.pts)));
  const s = [0, 0];
  let made;
  if (d.capot) {
    made = true;
    s[t] = 250 + ann[t] + bel[t];
    s[o] = bel[o];
  } else {
    made = pts + ann[t] + bel[t] > 162 - pts + ann[o] + bel[o];
    if (made) {
      s[t] = pts + ann[t] + bel[t];
      s[o] = 162 - pts + ann[o] + bel[o];
    } else {
      s[t] = bel[t];
      s[o] = 162 + ann[t] + ann[o] + bel[o];
    }
  }
  return { scores: s, made };
}

// ============================================================
// TAROT : DÉCOMPTE
// ============================================================
// Valeur de la donne pour un défenseur, vue du preneur :
// ±(25 + écart) × coefficient, petit au bout ±10 × coefficient,
// poignée au camp gagnant, chelem. Le preneur reçoit V × (n − 1) ;
// à 5 joueurs avec un partenaire, le preneur 2V et l'appelé V.
function tarotScore(d, n) {
  const mult = TAROT_CONTRACTS[d.contract]?.mult || 1;
  const pts = Math.max(0, Math.min(91, parseFloat(d.pts) || 0));
  const diff = pts - TAROT_THRESHOLDS[d.bouts || 0];
  const made = diff >= 0;
  const sign = made ? 1 : -1;
  let v = sign * (25 + Math.round(Math.abs(diff))) * mult;
  if (d.petit === 'attaque') v += 10 * mult;
  if (d.petit === 'defense') v -= 10 * mult;
  if (TAROT_HANDFULS[d.poignee]) v += sign * TAROT_HANDFULS[d.poignee];
  if (TAROT_SLAMS[d.chelem]) v += TAROT_SLAMS[d.chelem];
  const scores = Array(n).fill(-v);
  const partner = n === 5 && d.called != null && d.called !== d.taker ? d.called : null;
  if (partner != null) { scores[d.taker] = 2 * v; scores[partner] = v; }
  else scores[d.taker] = v * (n - 1);
  return { scores, made, diff, value: v };
}

// ============================================================
// CARTOGRAPHERS : DÉCOMPTE
// ============================================================
// Saison : deux décrets + 1 par pièce sur la piste − 1 par case vide voisine d'un monstre.
// Les pièces restent sur la piste : elles rapportent à chaque saison.
function seasonScore(d, i) {
  return d.e1[i] + d.e2[i] + d.coins[i] - d.monsters[i];
}

// Points perdus aux monstres sur toute la partie (départage)
function monsterLosses(g) {
  return g.players.map((_, i) => (g.details || []).reduce((s, d) => s + (d ? d.monsters[i] : 0), 0));
}

// Intitulé court d'une manche (tableau, graphique) et nom dans une phrase
function roundLabel(g, i) {
  return kindOf(g) === 'seasons' ? SEASONS[i].name : `${word(g).charAt(0).toUpperCase()}${i + 1}`;
}
function roundName(g, i) {
  return kindOf(g) === 'seasons' ? SEASONS[i].name.toLowerCase() : `${word(g)} ${i + 1}`;
}

// ============================================================
// FEUILLES DE FIN DE PARTIE : DÉCOMPTE
// ============================================================
// Points d'une case de la feuille, selon le type de ligne
function rowPoints(row, v) {
  if (row.check) return v ? row.check : 0;
  if (row.score === false) return 0;
  if (row.pair) return toInt(v?.[0]) * toInt(v?.[1]);
  const n = toInt(v);
  const p = row.pts ? row.pts(n) : n;
  return row.neg ? -p : p;
}

// Points calculés hors saisie (Once Upon a Draft : majorité de gemmes)
function sheetExtra(g) {
  const extra = gameDef(g).extra;
  return extra ? extra.fn(g) : g.players.map(() => 0);
}

function sheetTotals(g) {
  const extra = sheetExtra(g);
  return g.players.map((_, i) => sheetRows(g).reduce((sum, row) => sum + rowPoints(row, g.sheet[row.key]?.[i]), extra[i]));
}

// ============================================================
// PARTIE : AFFICHAGE
// ============================================================
function updateRoundInfo() {
  document.getElementById('round-info').textContent = progressText(state.currentGame);
}

function renderLeaderboard() {
  const g = state.currentGame; if (!g) return;
  const ranked = getRanked(g);
  const leaderTotal = ranked[0].total;
  const showTrend = kindOf(g) !== 'sheet';
  document.getElementById('leaderboard').innerHTML = ranked.map((p, rank) => {
    const trend = [];
    if (rank > 0 && (g.rounds.length > 0 || !showTrend)) {
      const gap = g.direction === 'high' ? leaderTotal - p.total : p.total - leaderTotal;
      trend.push(`écart ${gap}`);
    }
    if (showTrend && g.rounds.length > 1) {
      const delta = getPrevRank(g, p.idx) - (rank + 1);
      if (delta !== 0) trend.push(delta > 0 ? `+${delta} place${delta > 1 ? 's' : ''}` : `−${Math.abs(delta)} place${delta < -1 ? 's' : ''}`);
    }
    return `
      <li class="standing${rank === 0 ? ' standing--leader' : ''}">
        <span class="folio">${rank + 1}</span>
        ${avatarHtml(p)}
        <span class="standing__name">${escapeHtml(p.name)}</span>
        <span class="standing__trend">${trend.join(' · ')}</span>
        <span class="standing__score">${p.total}</span>
      </li>`;
  }).join('');
}

function setFormChrome({ title, submit, summary = '', back = false, copy = false, submitHidden = false }) {
  document.getElementById('form-title').textContent = title;
  const submitBtn = document.getElementById('form-submit');
  submitBtn.textContent = submit;
  submitBtn.hidden = submitHidden;
  const sum = document.getElementById('form-summary');
  sum.textContent = summary;
  sum.hidden = !summary;
  const backBtn = document.getElementById('form-back-btn');
  backBtn.hidden = !back;
  if (back) backBtn.textContent = back;
  document.getElementById('copy-last-round-btn').hidden = !copy;
  document.getElementById('form-help').hidden = submitHidden;
  showFormError('');
}

function showFormError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg ? `Erreur : ${msg}` : '';
  el.hidden = !msg;
}

function renderScoreInputs() {
  const g = state.currentGame; if (!g) return;
  const kind = kindOf(g);
  if (kind === 'bids') renderBidInputs(g);
  else if (kind === 'seasons') renderSeasonInputs(g);
  else if (kind === 'sheet') renderSheet(g);
  else if (kind === 'belote' || kind === 'tarot') renderDealInputs(g);
  else renderFreeInputs(g);
}

// Message affiché quand toutes les manches prévues sont jouées
function renderComplete(g) {
  document.getElementById('score-inputs').innerHTML = `<p class="empty">Les ${gameDef(g).rounds} ${word(g)}s sont jouées. Terminez la partie pour voir le podium, ou cliquez sur un score pour le corriger.</p>`;
  setFormChrome({ title: 'Partie complète', submit: '', submitHidden: true });
}

// Un score par joueur et par manche (partie libre, Papayoo, Vale of Eternity…)
function renderFreeInputs(g) {
  const editing = g.editing;
  const w = word(g);
  if (editing == null && gameDef(g).rounds && g.rounds.length >= gameDef(g).rounds) { renderComplete(g); return; }
  const values = editing != null ? g.rounds[editing] : null;
  document.getElementById('score-inputs').innerHTML = g.players.map((p, i) => `
    <div class="score-row">
      ${avatarHtml(p, i)}
      <label class="score-row__name" for="score-${i}">${escapeHtml(p.name)}</label>
      <div class="stepper">
        <button type="button" class="stepper__btn" data-step="-1" data-index="${i}" aria-label="Retirer 1 point à ${escapeHtml(p.name)}">−</button>
        <button type="button" class="stepper__btn" data-step="1" data-index="${i}" aria-label="Ajouter 1 point à ${escapeHtml(p.name)}">+</button>
      </div>
      <input class="input" type="number" inputmode="numeric" id="score-${i}" value="${values ? values[i] ?? 0 : 0}" data-index="${i}">
    </div>`).join('');
  setFormChrome(editing != null
    ? { title: `Correction, ${w} ${editing + 1}`, submit: 'Enregistrer la correction', back: 'Annuler la correction' }
    : { title: `Scores, ${w} ${g.rounds.length + 1}`, submit: `Valider la ${w}`, copy: g.rounds.length > 0 });
  document.getElementById('copy-last-round-btn').textContent = `Copier la ${w} précédente`;
  updateRoundTotal();
}

// Papayoo : chaque donne distribue 250 points, le total se contrôle à la frappe
function updateRoundTotal() {
  const g = state.currentGame;
  const expected = gameDef(g).roundTotal;
  if (!expected || !document.getElementById('score-0')) return;
  const sum = g.players.reduce((s, _, i) => s + toInt(document.getElementById('score-' + i).value), 0);
  const el = document.getElementById('form-summary');
  el.textContent = `Total de la ${word(g)} : ${sum} sur ${expected}.`;
  el.hidden = false;
}

// ============================================================
// BELOTE ET TAROT : SAISIE D'UNE DONNE
// ============================================================
function newDraft(g) {
  if (kindOf(g) === 'belote') return { taker: 0, takerMember: hasMembers(g) ? 0 : null, trump: '', pts: 82, capot: false, belote: '', ann0: 0, ann1: 0 };
  return { taker: 0, called: null, contract: 'garde', bouts: 1, pts: 51, petit: '', poignee: '', chelem: '' };
}

// La saisie en cours est rattachée à une donne : elle repart à zéro quand on change de donne
function currentDraft(g) {
  const ri = g.editing ?? g.rounds.length;
  const key = `${g.id}:${ri}:${g.editing != null}`;
  if (state.draftFor !== key || !state.draft) {
    state.draft = g.editing != null && g.details?.[ri] ? { ...g.details[ri] } : newDraft(g);
    state.draftFor = key;
  }
  return state.draft;
}

function chipGroup(key, label, options, current) {
  return `
    <div class="field">
      <span class="label" id="lbl-${key}">${label}</span>
      <div class="chip-group" role="group" aria-labelledby="lbl-${key}">${options.map(o => `
        <button type="button" class="chip" data-action="draft" data-key="${key}" data-value="${o.v}" aria-pressed="${o.v === current}">${escapeHtml(o.label)}</button>`).join('')}
      </div>
    </div>`;
}

function draftField(key, label, value, attrs = '') {
  return `
    <div class="field">
      <label class="label" for="draft-${key}">${label}</label>
      <input class="input" type="number" inputmode="decimal" id="draft-${key}" data-draft="${key}" value="${value}" ${attrs}>
    </div>`;
}

function dealScore(g, d) {
  return kindOf(g) === 'belote' ? beloteScore(d) : tarotScore(d, g.players.length);
}

function renderDealInputs(g) {
  const d = currentDraft(g);
  const ri = g.editing ?? g.rounds.length;
  const names = g.players.map((p, i) => ({ v: i, label: p.name }));
  let fields;
  if (kindOf(g) === 'belote') {
    // Preneur : un des quatre joueurs (siège = équipe × 2 + membre)
    const taker = hasMembers(g)
      ? chipGroup('seat', 'Preneur', g.players.flatMap((p, i) => p.members.map((m, mi) => ({ v: 2 * i + mi, label: `${m} (${p.name})` }))), d.taker * 2 + (d.takerMember ?? 0))
      : chipGroup('taker', 'Preneur', names, d.taker);
    fields = [
      taker,
      chipGroup('trump', 'Atout', Object.entries(TRUMPS).map(([v, t]) => ({ v, label: `${t.sym} ${t.label}` })), d.trump),
      draftField('pts', 'Points du preneur', d.pts, 'min="0" max="162"'),
      chipGroup('capot', 'Capot du preneur', [{ v: 0, label: 'Non' }, { v: 1, label: 'Oui' }], d.capot ? 1 : 0),
      chipGroup('belote', 'Belote-rebelote', [{ v: '', label: 'Aucune' }, ...names], d.belote),
      `<div class="bid-row__fields bid-row__fields--2">${g.players.map((p, i) => draftField(`ann${i}`, `Annonces, ${escapeHtml(p.name)}`, d[`ann${i}`], 'min="0" step="10"')).join('')}</div>`,
    ];
  } else {
    fields = [
      chipGroup('taker', 'Preneur', names, d.taker),
      g.players.length === 5 ? chipGroup('called', 'Appelé', names.map(o => (o.v === d.taker ? { ...o, label: `${o.label} (seul)` } : o)), d.called) : '',
      chipGroup('contract', 'Contrat', Object.entries(TAROT_CONTRACTS).map(([v, c]) => ({ v, label: c.label })), d.contract),
      chipGroup('bouts', 'Bouts du preneur', [0, 1, 2, 3].map(v => ({ v, label: `${v} (${TAROT_THRESHOLDS[v]})` })), d.bouts),
      draftField('pts', 'Points du preneur', d.pts, 'min="0" max="91" step="0.5"'),
      chipGroup('petit', 'Petit au bout', [{ v: '', label: 'Non' }, { v: 'attaque', label: 'Attaque' }, { v: 'defense', label: 'Défense' }], d.petit),
      chipGroup('poignee', 'Poignée', [{ v: '', label: 'Aucune' }, { v: 'simple', label: 'Simple (20)' }, { v: 'double', label: 'Double (30)' }, { v: 'triple', label: 'Triple (40)' }], d.poignee),
      chipGroup('chelem', 'Chelem', [{ v: '', label: 'Aucun' }, { v: 'annonce', label: 'Annoncé, réussi' }, { v: 'nonannonce', label: 'Non annoncé, réussi' }, { v: 'chute', label: 'Annoncé, chuté' }], d.chelem),
    ];
  }
  const results = g.players.map((p, i) => `
    <div class="bid-row">
      ${avatarHtml(p, i)}
      <span class="bid-row__name">${escapeHtml(p.name)}</span>
      <output class="bid-row__result" id="result-${i}"></output>
    </div>`).join('');
  document.getElementById('score-inputs').innerHTML = `<div class="stack stack--3">${fields.join('')}</div><div>${results}</div>`;
  const title = g.editing != null ? `Correction, donne ${ri + 1}` : `Donne ${ri + 1}`;
  setFormChrome(g.editing != null
    ? { title, submit: 'Enregistrer la correction', back: 'Annuler la correction' }
    : { title, submit: 'Valider la donne' });
  updateDealPreview();
}

function setDraft(key, raw) {
  const g = state.currentGame; if (!g) return;
  const d = currentDraft(g);
  let v = raw === '' ? '' : /^-?\d+$/.test(raw) ? Number(raw) : raw;
  if (key === 'capot') v = v === 1;
  if (key === 'belote' && v === d.belote) v = '';
  if (key === 'seat') { d.taker = Math.floor(v / 2); d.takerMember = v % 2; }
  else d[key] = v;
  renderDealInputs(g);
  // Le groupe est redessiné : le focus revient au bouton choisi
  document.querySelector(`[data-action="draft"][data-key="${key}"][data-value="${raw}"]`)?.focus();
}

function updateDealPreview() {
  const g = state.currentGame;
  if (!['belote', 'tarot'].includes(kindOf(g)) || !document.getElementById('result-0')) return;
  const d = currentDraft(g);
  const r = dealScore(g, d);
  r.scores.forEach((s, i) => {
    const out = document.getElementById('result-' + i);
    out.textContent = signed(s);
    out.classList.toggle('is-negative', s < 0);
  });
  const sum = document.getElementById('form-summary');
  if (kindOf(g) === 'belote') {
    const taker = takerName(g, d);
    sum.textContent = d.capot ? `Capot de ${taker}.` : r.made ? `${taker} fait son contrat.` : `${taker} est dedans.`;
  } else {
    const gap = Math.abs(Math.round(r.diff));
    sum.textContent = r.made ? `Contrat fait de ${gap}, ${signed(r.value)} par défenseur.` : `Contrat chuté de ${gap || 1}, ${signed(r.value)} par défenseur.`;
  }
  sum.hidden = false;
}

function validateDeal(g, d) {
  if (kindOf(g) === 'belote') {
    const pts = toInt(d.pts);
    if (!d.capot && (pts < 0 || pts > 162)) return 'les points du preneur sont entre 0 et 162.';
    if (toInt(d.ann0) < 0 || toInt(d.ann1) < 0) return 'les annonces ne peuvent pas être négatives.';
    if (!TRUMPS[d.trump]) return 'choisissez l\'atout de la donne.';
    return '';
  }
  const pts = parseFloat(d.pts);
  if (!Number.isFinite(pts) || pts < 0 || pts > 91) return 'les points du preneur sont entre 0 et 91.';
  if (g.players.length === 5 && d.called == null) return 'choisissez le joueur appelé (le preneur s\'il joue seul).';
  return '';
}

// Skull King : annonces d'abord, puis plis et bonus
function bidPhase(g) {
  if (g.editing != null) return 'all';
  return g.pending?.phase === 'tricks' ? 'tricks' : 'bids';
}

function renderBidInputs(g) {
  const total = gameDef(g).rounds;
  const wrap = document.getElementById('score-inputs');
  if (g.editing == null && g.rounds.length >= total) {
    wrap.innerHTML = `<p class="empty">Les ${total} manches sont jouées. Terminez la partie pour voir le podium, ou cliquez sur un score pour le corriger.</p>`;
    setFormChrome({ title: 'Partie complète', submit: '', submitHidden: true });
    return;
  }
  const ri = g.editing ?? g.rounds.length;
  const cards = ri + 1;
  const phase = bidPhase(g);
  const d = phase === 'all' ? g.details[ri] : null;
  const bids = d ? d.bids : (g.pending?.bids || []);

  const field = (kind, label, i, value, extra = '') => `
    <div class="field">
      <label class="label" for="${kind}-${i}">${label}</label>
      <input class="input" type="number" inputmode="numeric" id="${kind}-${i}" data-field="${kind}" data-index="${i}" value="${value}" ${extra}>
    </div>`;

  wrap.innerHTML = g.players.map((p, i) => {
    const fields = [];
    if (phase === 'tricks') {
      fields.push(`<div class="field"><span class="label">Annonce</span><span class="bid-row__fixed">${bids[i]}</span></div>`);
    } else {
      fields.push(field('bid', 'Annonce', i, d ? d.bids[i] : (bids[i] ?? 0), `min="0" max="${cards}"`));
    }
    if (phase !== 'bids') {
      const tricks = d ? d.tricks[i] : (bids[i] ?? 0);
      fields.push(field('tricks', 'Plis', i, tricks, `min="0" max="${cards}"`));
      fields.push(field('bonus', 'Bonus', i, d ? d.bonus[i] : 0, 'step="10"'));
    }
    return `
      <div class="bid-row" role="group" aria-label="${escapeHtml(p.name)}">
        ${avatarHtml(p, i)}
        <span class="bid-row__name">${escapeHtml(p.name)}</span>
        <output class="bid-row__result" id="result-${i}"></output>
        <div class="bid-row__fields">${fields.join('')}</div>
      </div>`;
  }).join('');

  const title = phase === 'all' ? `Correction, manche ${cards}` : `Manche ${cards} · ${plural(cards, 'carte')}`;
  if (phase === 'bids') setFormChrome({ title, submit: 'Valider les annonces' });
  else if (phase === 'tricks') setFormChrome({ title, submit: 'Valider la manche', back: 'Modifier les annonces' });
  else setFormChrome({ title, submit: 'Enregistrer la correction', back: 'Annuler la correction' });
  updateBidPreview();
}

function readBidForm(g) {
  const ri = g.editing ?? g.rounds.length;
  const phase = bidPhase(g);
  const val = (kind, i) => toInt(document.getElementById(`${kind}-${i}`)?.value);
  const bids = g.players.map((_, i) => (phase === 'tricks' ? g.pending.bids[i] : val('bid', i)));
  const tricks = phase === 'bids' ? null : g.players.map((_, i) => val('tricks', i));
  const bonus = phase === 'bids' ? null : g.players.map((_, i) => val('bonus', i));
  return { ri, cards: ri + 1, phase, bids, tricks, bonus };
}

// Résultat de chaque joueur et contrôle des totaux, à chaque frappe
function updateBidPreview() {
  const g = state.currentGame;
  if (kindOf(g) !== 'bids' || !document.getElementById('result-0')) return;
  const f = readBidForm(g);
  const bidSum = f.bids.reduce((a, b) => a + b, 0);
  g.players.forEach((_, i) => {
    const out = document.getElementById('result-' + i);
    if (f.phase === 'bids') { out.textContent = ''; return; }
    const s = skullKingScore(f.cards, f.bids[i], f.tricks[i], f.bonus[i]);
    out.textContent = signed(s);
    out.classList.toggle('is-negative', s < 0);
  });
  let summary = `Annonces : ${bidSum} pour ${plural(f.cards, 'pli')}.`;
  if (f.phase !== 'bids') {
    const trickSum = f.tricks.reduce((a, b) => a + b, 0);
    summary += ` Plis notés : ${trickSum} sur ${f.cards}.`;
  }
  const sum = document.getElementById('form-summary');
  sum.textContent = summary;
  sum.hidden = false;
}

function validateBidForm(f) {
  const bad = (arr, label) => arr && arr.some(v => v < 0 || v > f.cards) ? `chaque ${label} doit être entre 0 et ${f.cards}.` : '';
  const err = bad(f.bids, 'annonce') || bad(f.tricks, 'nombre de plis');
  if (err) return err;
  // Un pli peut disparaître (Kraken), donc moins de plis que de cartes est admis
  if (f.tricks && f.tricks.reduce((a, b) => a + b, 0) > f.cards) return `il y a au plus ${plural(f.cards, 'pli')} dans cette manche.`;
  if (f.bonus && f.bonus.some(b => b < 0)) return 'un bonus ne peut pas être négatif.';
  return '';
}

// Cartographers : deux décrets, pièces et monstres pour chaque joueur
function renderSeasonInputs(g) {
  const wrap = document.getElementById('score-inputs');
  if (g.editing == null && g.rounds.length >= SEASONS.length) {
    wrap.innerHTML = '<p class="empty">Les quatre saisons sont jouées. Terminez la partie pour voir le podium, ou cliquez sur un score pour le corriger.</p>';
    setFormChrome({ title: 'Partie complète', submit: '', submitHidden: true });
    return;
  }
  const ri = g.editing ?? g.rounds.length;
  const season = SEASONS[ri];
  const d = g.editing != null ? g.details[ri] : null;
  const labels = { e1: `Décret ${season.edicts[0]}`, e2: `Décret ${season.edicts[1]}`, coins: 'Pièces', monsters: 'Monstres (−)' };
  // Les pièces ne se perdent pas : on reprend le total de la saison précédente
  const initial = (k, i) => (d ? d[k][i] : k === 'coins' ? (g.details?.[ri - 1]?.coins?.[i] ?? 0) : 0);

  wrap.innerHTML = g.players.map((p, i) => `
    <div class="bid-row" role="group" aria-label="${escapeHtml(p.name)}">
      ${avatarHtml(p, i)}
      <span class="bid-row__name">${escapeHtml(p.name)}</span>
      <output class="bid-row__result" id="result-${i}"></output>
      <div class="bid-row__fields bid-row__fields--2">${SEASON_FIELDS.map(k => `
        <div class="field">
          <label class="label" for="${k}-${i}">${labels[k]}</label>
          <input class="input" type="number" inputmode="numeric" min="0" id="${k}-${i}" data-field="${k}" data-index="${i}" value="${initial(k, i)}">
        </div>`).join('')}
      </div>
    </div>`).join('');

  const summary = 'Pièces : le total de la piste. Monstres : les points perdus, en positif.';
  if (d) setFormChrome({ title: `Correction, ${season.name.toLowerCase()}`, submit: 'Enregistrer la correction', back: 'Annuler la correction', summary });
  else setFormChrome({ title: `${season.name} · décrets ${season.edicts.join(' et ')}`, submit: 'Valider la saison', summary });
  updateSeasonPreview();
}

function readSeasonForm(g) {
  const f = { ri: g.editing ?? g.rounds.length };
  SEASON_FIELDS.forEach(k => { f[k] = g.players.map((_, i) => toInt(document.getElementById(`${k}-${i}`)?.value)); });
  return f;
}

function updateSeasonPreview() {
  const g = state.currentGame;
  if (kindOf(g) !== 'seasons' || !document.getElementById('result-0')) return;
  const f = readSeasonForm(g);
  g.players.forEach((_, i) => {
    const s = seasonScore(f, i);
    const out = document.getElementById('result-' + i);
    out.textContent = signed(s);
    out.classList.toggle('is-negative', s < 0);
  });
}

// Feuille de fin de partie : une ligne par catégorie, une colonne par joueur
function renderSheet(g) {
  const def = gameDef(g);
  const totals = sheetTotals(g);
  const extra = sheetExtra(g);
  const head = g.players.map((p, i) => `<th scope="col">${playerCell(p, i)}</th>`).join('');
  const numInput = (row, i, p, v, part, label) => `<input class="input" type="number" inputmode="numeric" min="0" ${row.max ? `max="${row.max}"` : ''} data-field="${row.key}" data-index="${i}"${part != null ? ` data-part="${part}"` : ''} value="${v}" aria-label="${label}, ${escapeHtml(p.name)}">`;
  const rowHead = (label, hint) => `<th scope="row"><span class="sheet__label">${label}</span>${hint ? `<span class="hint sheet__hint">${hint}</span>` : ''}</th>`;
  const rows = def.rows.map(row => {
    const cells = g.players.map((p, i) => {
      const v = g.sheet[row.key]?.[i];
      if (row.check) {
        return `<td><button type="button" class="chip" data-action="toggle-sheet" data-field="${row.key}" data-index="${i}" aria-pressed="${!!v}" aria-label="${row.label}, rempli par ${escapeHtml(p.name)}">${v ? '+' + row.check : '0'}</button></td>`;
      }
      if (row.pair) {
        const [a, b] = v || [0, 0];
        return `<td><span class="sheet__pair">${numInput(row, i, p, a, 0, `${row.label}, ${row.pair[0].toLowerCase()}`)}<span aria-hidden="true">×</span>${numInput(row, i, p, b, 1, `${row.label}, ${row.pair[1].toLowerCase()}`)}</span></td>`;
      }
      return `<td>${numInput(row, i, p, v ?? 0, null, row.label)}</td>`;
    }).join('');
    const hint = row.pair ? `${row.pair[0]} × ${row.pair[1].toLowerCase()}` : row.hint;
    return `<tr>${rowHead(row.label + (row.neg ? ' (−)' : ''), hint)}${cells}</tr>`;
  }).join('');
  const extraRow = def.extra
    ? `<tr>${rowHead(def.extra.label, def.extra.hint)}${extra.map(v => `<td class="score-table__total sheet__extra">${v}</td>`).join('')}</tr>`
    : '';
  document.getElementById('score-inputs').innerHTML = `
    <div class="table-scroll">
      <table class="score-table sheet">
        <thead><tr><th scope="col">Catégorie</th>${head}</tr></thead>
        <tbody>${rows}${extraRow}
          <tr class="sheet__total"><th scope="row">Total</th>${totals.map(t => `<td class="score-table__total sheet__sum">${t}</td>`).join('')}</tr>
        </tbody>
      </table>
    </div>`;
  const summary = def.rows.some(r => r.check) ? 'Une case se coche pour chaque joueur qui remplit la condition.' : '';
  setFormChrome({ title: 'Feuille de score', submit: 'Terminer la partie', summary });
}

function updateSheet(field, i, value, part) {
  const g = state.currentGame;
  const row = sheetRows(g).find(r => r.key === field);
  if (!row) return;
  const n = Math.max(0, row.max ? Math.min(row.max, toInt(value)) : toInt(value));
  if (row.check) g.sheet[field][i] = !g.sheet[field][i];
  else if (row.pair) {
    const cell = Array.isArray(g.sheet[field][i]) ? g.sheet[field][i] : [0, 0];
    cell[Number(part) || 0] = n;
    g.sheet[field][i] = cell;
  } else g.sheet[field][i] = n;
  g.rounds = [sheetTotals(g)];
  saveCurrentGame();
  renderLeaderboard();
  if (row.check) {
    // Le bouton est redessiné : on lui rend le focus
    renderSheet(g);
    document.querySelector(`[data-action="toggle-sheet"][data-field="${field}"][data-index="${i}"]`)?.focus();
  } else {
    document.querySelectorAll('.sheet .sheet__sum').forEach((td, pi) => { td.textContent = g.rounds[0][pi]; });
    const extra = sheetExtra(g);
    document.querySelectorAll('.sheet .sheet__extra').forEach((td, pi) => { td.textContent = extra[pi]; });
  }
}

// ============================================================
// PARTIE : SAISIE
// ============================================================
function copyLastRound() {
  const g = state.currentGame; if (!g || !g.rounds.length) return;
  const last = g.rounds[g.rounds.length - 1];
  g.players.forEach((_, i) => { document.getElementById('score-' + i).value = last[i] ?? 0; });
  toast(`Scores copiés depuis la ${word(g)} précédente.`);
}

function submitRound() {
  const g = state.currentGame; if (!g) return;
  const kind = kindOf(g);
  if (kind === 'sheet') { endGame(); return; }

  let scores;
  let detail = null;
  if (kind === 'bids') {
    const f = readBidForm(g);
    const err = validateBidForm(f);
    if (err) { showFormError(err); return; }
    if (f.phase === 'bids') {
      g.pending = { phase: 'tricks', bids: f.bids };
      saveCurrentGame();
      renderScoreInputs();
      document.getElementById('tricks-0')?.select();
      return;
    }
    scores = g.players.map((_, i) => skullKingScore(f.cards, f.bids[i], f.tricks[i], f.bonus[i]));
    detail = { bids: f.bids, tricks: f.tricks, bonus: f.bonus };
  } else if (kind === 'seasons') {
    const f = readSeasonForm(g);
    if (SEASON_FIELDS.some(k => f[k].some(v => v < 0))) { showFormError('les valeurs se saisissent en positif, les monstres compris.'); return; }
    scores = g.players.map((_, i) => seasonScore(f, i));
    detail = { e1: f.e1, e2: f.e2, coins: f.coins, monsters: f.monsters };
  } else if (kind === 'belote' || kind === 'tarot') {
    const d = currentDraft(g);
    const err = validateDeal(g, d);
    if (err) { showFormError(err); return; }
    scores = dealScore(g, d).scores;
    detail = { ...d };
    state.draft = null;
    state.draftFor = null;
  } else {
    if (!document.getElementById('score-0')) return;
    scores = g.players.map((_, i) => toInt(document.getElementById('score-' + i).value));
  }

  const before = getTotals(g).map(p => p.total);
  const wasEditing = g.editing;
  if (wasEditing != null) {
    g.rounds[wasEditing] = scores;
    if (detail) g.details[wasEditing] = detail;
    g.editing = null;
  } else {
    g.rounds.push(scores);
    g.details = g.details || [];
    g.details[g.rounds.length - 1] = detail;
    g.currentRound = g.rounds.length + 1;
    g.pending = null;
  }
  saveCurrentGame();
  refreshGame();
  document.querySelector('#score-inputs input')?.select();

  const seasons = kind === 'seasons';
  const w = word(g);
  if (wasEditing != null) { toast(seasons ? `${SEASONS[wasEditing].name} corrigé.` : `${cap(w)} ${wasEditing + 1} corrigée.`); return; }
  checkDramaticMoments(g);
  toast(seasons ? `${SEASONS[g.rounds.length - 1].name} enregistré.` : `${cap(w)} ${g.rounds.length} enregistrée.`);
  // Score à atteindre (Belote, Vale of Eternity) : la partie s'arrête là
  const target = gameDef(g).target;
  const reached = target ? getTotals(g).filter(p => p.total >= target && before[p.idx] < target) : [];
  if (reached.length) {
    setTimeout(() => toast(`${reached.map(p => p.name).join(' et ')} atteint ${target} points. Terminez la partie pour voir le podium.`, 'default', 4500), 1200);
  } else if (gameDef(g).rounds && g.rounds.length >= gameDef(g).rounds) {
    const last = seasons ? 'Dernière saison jouée' : `Dernière ${w} jouée`;
    setTimeout(() => toast(`${last}. Terminez la partie pour voir le podium.`, 'default', 4000), 1200);
  }
}

// Bouton secondaire du formulaire : retour aux annonces ou fin de correction
function formBack() {
  const g = state.currentGame; if (!g) return;
  if (g.editing != null) g.editing = null;
  else if (g.pending) g.pending = { phase: 'bids', bids: g.pending.bids };
  state.draft = null;
  saveCurrentGame();
  renderScoreInputs();
  document.querySelector('#score-inputs input')?.select();
}

function editRound(roundIdx) {
  const g = state.currentGame; if (!g || g._readonly) return;
  if (DETAIL_KINDS.includes(kindOf(g)) && !g.details?.[roundIdx]) { toast(`Cette ${word(g)} n'a pas de détail à corriger.`, 'error'); return; }
  g.editing = roundIdx;
  saveCurrentGame();
  renderScoreInputs();
  const form = document.getElementById('round-form');
  form.scrollIntoView({ block: 'start' });
  form.querySelector('input')?.select();
}

function undoLastRound() {
  const g = state.currentGame;
  const w = word(g);
  if (!g || !g.rounds.length) { toast(`Aucune ${w} à annuler.`); return; }
  showConfirm(
    `Annuler la ${w} ${g.rounds.length} ? Les scores seront perdus.`,
    () => {
      g.rounds.pop();
      if (g.details) g.details.length = g.rounds.length;
      g.currentRound = g.rounds.length + 1;
      g.editing = null;
      g.pending = null;
      state.draft = null;
      saveCurrentGame();
      refreshGame();
      toast(`${cap(w)} annulée.`);
    },
    `Annuler la ${w}`,
    true
  );
}

function renderRoundHistory() {
  const g = state.currentGame; if (!g) return;
  const wrap = document.getElementById('round-history-wrap');
  if (!g.rounds.length) {
    wrap.innerHTML = `<p class="empty">Aucune ${word(g)} pour le moment.</p>`;
    return;
  }
  const totals = getTotals(g);
  // Meilleur score de chaque manche
  const roundBests = g.rounds.map(r => g.direction === 'high' ? Math.max(...r) : Math.min(...r));
  // Détail d'une case : annonce et plis (Skull King), décrets, pièces et monstres (Cartographers)
  const detailText = (pi, ri) => {
    const d = g.details?.[ri];
    if (!d) return '';
    if (kindOf(g) === 'belote') {
      const r = beloteScore(d);
      const trump = TRUMPS[d.trump] ? ` à ${TRUMPS[d.trump].label.toLowerCase()}` : '';
      return `preneur ${takerName(g, d)}${trump}, ${d.capot ? 'capot' : `${toInt(d.pts)} pts`}${r.made ? '' : ', dedans'}`;
    }
    if (kindOf(g) === 'tarot') {
      const r = tarotScore(d, g.players.length);
      const gap = Math.round(Math.abs(r.diff));
      return `preneur ${g.players[d.taker]?.name}, ${TAROT_CONTRACTS[d.contract]?.label.toLowerCase()}, ${plural(d.bouts, 'bout')}, ${d.pts} pts, ${r.made ? `fait de ${gap}` : `chuté de ${gap || 1}`}`;
    }
    if (d.coins) return `décrets ${d.e1[pi]} et ${d.e2[pi]}, ${plural(d.coins[pi], 'pièce')}, monstres −${d.monsters[pi]}`;
    return `annonce ${d.bids[pi]}, ${plural(d.tricks[pi], 'pli')}, bonus ${d.bonus[pi]}`;
  };
  const cellLabel = (p, pi, ri, val) => {
    const extra = detailText(pi, ri);
    return `${escapeHtml(p.name)}, ${roundName(g, ri)} : ${val}${extra ? ', ' + extra : ''}. Corriger`;
  };
  wrap.innerHTML = `<table class="score-table">
    <thead>
      <tr>
        <th scope="col">Joueur</th>
        ${g.rounds.map((_, i) => `<th scope="col">${roundLabel(g, i)}</th>`).join('')}
        <th scope="col">Total</th>
      </tr>
    </thead>
    <tbody>
      ${g.players.map((p, pi) => `
        <tr>
          <th scope="row">${playerCell(p, pi)}</th>
          ${g.rounds.map((r, ri) => {
            const val = r[pi] ?? 0;
            const extra = detailText(pi, ri);
            const title = extra ? ` title="${extra.charAt(0).toUpperCase() + extra.slice(1)}"` : '';
            return `<td><button type="button" class="score-table__cell${val === roundBests[ri] ? ' is-best' : ''}" data-action="edit-round" data-round="${ri}" aria-label="${cellLabel(p, pi, ri, val)}"${title}>${val}</button></td>`;
          }).join('')}
          <td class="score-table__total">${totals.find(t => t.idx === pi)?.total ?? 0}</td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

// ============================================================
// STATISTIQUES EN DIRECT
// ============================================================
function renderLiveStats() {
  const g = state.currentGame; if (!g) return;
  const panel = document.getElementById('live-stats-grid');
  if (!panel) return;

  if (!g.rounds.length) {
    panel.innerHTML = `<p class="empty">Jouez une ${word(g)} pour voir les statistiques.</p>`;
    return;
  }

  const totals = getTotals(g);
  const ranked = getRanked(g);
  const n = g.players.length;
  const nRounds = g.rounds.length;

  const leader = ranked[0];
  const second = ranked[1];
  const gap = Math.abs(leader.total - second.total);

  // Manches remportées (meilleur score de la manche)
  const roundWins = Array(n).fill(0);
  g.rounds.forEach(r => {
    const best = g.direction === 'high' ? Math.max(...r) : Math.min(...r);
    r.forEach((v, i) => { if (v === best) roundWins[i]++; });
  });
  const topWinner = totals.reduce((a, b) => roundWins[a.idx] >= roundWins[b.idx] ? a : b);

  // Le plus régulier (variance la plus basse)
  const variances = totals.map(p => ({ ...p, v: variance(p.perRound) }));
  const mostConsistent = variances.reduce((a, b) => a.v <= b.v ? a : b);

  // Élan : 2 dernières manches comparées aux 2 précédentes
  let momentum = null;
  if (nRounds >= 4) {
    const momScores = totals.map(p => {
      const last2 = p.perRound.slice(-2).reduce((a, b) => a + b, 0);
      const prev2 = p.perRound.slice(-4, -2).reduce((a, b) => a + b, 0);
      return { ...p, mom: last2 - prev2 };
    });
    momentum = momScores.reduce((a, b) => (g.direction === 'high' ? a.mom >= b.mom : a.mom <= b.mom) ? a : b);
  }

  // Série de manches gagnées en cours
  let streak = 0; let streakPlayer = null;
  for (let ri = nRounds - 1; ri >= 0; ri--) {
    const r = g.rounds[ri];
    const best = g.direction === 'high' ? Math.max(...r) : Math.min(...r);
    const winnerIdx = r.indexOf(best);
    if (streak === 0) { streak = 1; streakPlayer = winnerIdx; }
    else if (winnerIdx === streakPlayer) streak++;
    else break;
  }

  // Remontée : places gagnées depuis la première manche
  let biggestClimber = null;
  if (nRounds >= 2) {
    const afterR1 = g.players.map((_, i) => g.rounds[0][i]);
    const sortedR1 = [...afterR1].sort((a, b) => g.direction === 'high' ? b - a : a - b);
    const initialRanks = afterR1.map(v => sortedR1.indexOf(v) + 1);
    const climbers = ranked.map((p, currentRank) => ({ ...p, gain: initialRanks[p.idx] - (currentRank + 1) }));
    biggestClimber = climbers.reduce((a, b) => a.gain >= b.gain ? a : b);
  }

  const stats = [
    { label: 'En tête', value: leader.name, sub: leader.total + ' pts' },
    { label: 'Écart avec le 2e', value: gap + ' pts', sub: second.name + ' à ' + second.total },
    { label: `${cap(word(g))}s remportées`, value: topWinner.name, sub: roundWins[topWinner.idx] + ' sur ' + nRounds },
    { label: 'Plus régulier', value: mostConsistent.name, sub: 'variance ' + Math.round(mostConsistent.v) },
  ];

  // Belote et Tarot : qui prend le plus souvent
  if (['belote', 'tarot'].includes(kindOf(g)) && g.details?.length) {
    const takes = g.players.map((_, i) => g.details.filter(d => d && d.taker === i).length);
    const best = totals.reduce((a, b) => takes[a.idx] >= takes[b.idx] ? a : b);
    stats.push({ label: kindOf(g) === 'belote' && hasMembers(g) ? 'Prises par équipe' : 'Prises', value: best.name, sub: takes[best.idx] + ' sur ' + nRounds });
  }
  // Belote : preneur le plus fréquent parmi les quatre joueurs, et atout le plus pris
  if (kindOf(g) === 'belote' && hasMembers(g) && g.details?.some(Boolean)) {
    const deals = g.details.filter(Boolean);
    const seats = g.players.flatMap((p, i) => p.members.map((m, mi) => ({ name: m, n: deals.filter(d => d.taker === i && d.takerMember === mi).length })));
    const top = seats.reduce((a, b) => (b.n > a.n ? b : a));
    if (top.n) stats.push({ label: 'Preneur', value: top.name, sub: `${top.n} sur ${nRounds}` });
    const trumps = Object.entries(TRUMPS).map(([k, t]) => ({ t, n: deals.filter(d => d.trump === k).length })).sort((a, b) => b.n - a.n);
    if (trumps[0].n) stats.push({ label: 'Atout le plus pris', value: `${trumps[0].t.sym} ${trumps[0].t.label}`, sub: `${trumps[0].n} sur ${nRounds}` });
  }

  // Skull King : annonces réussies
  const exact = exactBids(g);
  if (exact) {
    const best = totals.reduce((a, b) => exact[a.idx] >= exact[b.idx] ? a : b);
    stats.push({ label: 'Annonces réussies', value: best.name, sub: exact[best.idx] + ' sur ' + nRounds });
  }

  if (streak >= 2 && streakPlayer !== null) {
    stats.push({ label: 'Série en cours', value: g.players[streakPlayer].name, sub: `${streak} ${word(g)}s d'affilée` });
  }
  if (momentum && nRounds >= 4) {
    stats.push({ label: 'Élan', value: momentum.name, sub: (momentum.mom > 0 ? '+' : '') + momentum.mom + ' sur les 2 dernières' });
  }
  if (biggestClimber && biggestClimber.gain > 0) {
    stats.push({ label: 'Remontée', value: biggestClimber.name, sub: '+' + plural(biggestClimber.gain, 'place') });
  }

  panel.innerHTML = `<dl class="spec">${stats.map(s => `
    <dt class="spec__term">${s.label}</dt>
    <dd class="spec__value"><strong>${escapeHtml(s.value)}</strong> <span class="muted">${escapeHtml(s.sub)}</span></dd>`).join('')}</dl>`;
}

// Nombre d'annonces réussies par joueur, ou null hors Skull King
function exactBids(g) {
  if (kindOf(g) !== 'bids' || !g.details?.length) return null;
  return g.players.map((_, i) => g.details.filter(d => d && d.bids[i] === d.tricks[i]).length);
}

// ============================================================
// GRAPHIQUE
// ============================================================
function renderChart() {
  const g = state.currentGame; if (!g) return;
  const noData = document.getElementById('chart-no-data');
  const wrap = document.getElementById('chart-wrap');
  const canvas = document.getElementById('main-chart');
  if (state.activeChart) { state.activeChart.destroy(); state.activeChart = null; }
  const hasData = g.rounds.length > 0 && typeof Chart !== 'undefined';
  noData.hidden = hasData;
  wrap.hidden = !hasData;
  if (!hasData) return;

  const labels = g.rounds.map((_, i) => roundLabel(g, i));
  const mode = state.chartMode;
  const colors = g.players.map((p, i) => cssColor(`--color-data-${seriesOf(p, i)}`));
  const partialTotals = ri => g.players.map((_, i) => g.rounds.slice(0, ri + 1).reduce((s, r) => s + (r[i] ?? 0), 0));
  const lineSet = (p, pi, data) => ({
    label: p.name, data,
    borderColor: colors[pi], backgroundColor: colors[pi],
    tension: 0, fill: false, pointStyle: 'rect', pointRadius: 4, borderWidth: 2,
  });

  let type = 'line';
  let datasets;
  let options = chartOptions();

  if (mode === 'line') {
    datasets = g.players.map((p, pi) => {
      let cum = 0;
      return lineSet(p, pi, g.rounds.map(r => { cum += r[pi] ?? 0; return cum; }));
    });
  } else if (mode === 'bar') {
    type = 'bar';
    datasets = g.players.map((p, pi) => ({
      label: p.name, data: g.rounds.map(r => r[pi] ?? 0),
      backgroundColor: colors[pi], borderWidth: 0, borderRadius: 0,
    }));
  } else if (mode === 'rank') {
    datasets = g.players.map((p, pi) => lineSet(p, pi, g.rounds.map((_, ri) => {
      const partial = partialTotals(ri);
      const sorted = [...partial].sort((a, b) => g.direction === 'high' ? b - a : a - b);
      return sorted.indexOf(partial[pi]) + 1;
    })));
    options.scales.y = { ...options.scales.y, reverse: true, min: 1, max: g.players.length, ticks: { ...options.scales.y.ticks, stepSize: 1 } };
  } else {
    datasets = g.players.map((p, pi) => lineSet(p, pi, g.rounds.map((_, ri) => {
      const partial = partialTotals(ri);
      const leader = g.direction === 'high' ? Math.max(...partial) : Math.min(...partial);
      return g.direction === 'high' ? partial[pi] - leader : leader - partial[pi];
    })));
  }

  state.activeChart = new Chart(canvas, { type, data: { labels, datasets }, options });
}

function chartOptions() {
  const text = cssColor('--color-text-muted');
  const grid = cssColor('--color-border');
  const font = { family: "'JetBrains Mono', monospace", size: 12.8 }; // --text-sm
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'start', labels: { font, color: text, usePointStyle: true, pointStyle: 'rect', padding: 16, boxWidth: 8, boxHeight: 8 } },
    },
    scales: {
      x: { grid: { color: grid }, border: { color: text }, ticks: { font, color: text } },
      y: { grid: { color: grid }, border: { color: text }, ticks: { font, color: text } },
    },
    animation: { duration: reduced ? 0 : 400 },
  };
}

function switchChart(mode, el) {
  state.chartMode = mode;
  document.querySelectorAll('[data-action="chart"]').forEach(t => t.setAttribute('aria-pressed', String(t === el)));
  renderChart();
}

// ============================================================
// FIN DE PARTIE
// ============================================================
function endGame() {
  const g = state.currentGame;
  if (!g) return;
  const kind = kindOf(g);
  if (kind !== 'sheet' && !g.rounds.length) { toast(`Jouez au moins une ${word(g)} d'abord.`, 'error'); return; }
  let msg = `Terminer la partie « ${g.name} » ?`;
  const target = gameDef(g).target;
  const targetReached = target && getTotals(g).some(p => p.total >= target);
  if (gameDef(g).rounds && g.rounds.length < gameDef(g).rounds && !targetReached) {
    msg = `Terminer la partie après ${plural(g.rounds.length, kind === 'seasons' ? 'saison' : word(g))} sur ${gameDef(g).rounds} ?`;
  }
  showConfirm(
    msg,
    () => {
      if (kind === 'sheet') g.rounds = [sheetTotals(g)];
      g.editing = null;
      g.pending = null;
      const ranked = getRanked(g);
      g.winner = ranked[0].name;
      g.finalRanked = ranked;
      g.stats = computeStats(g);
      state.history.push({ ...g });
      saveHistory();
      saveCurrentGame();
      showView('awards');
    },
    'Terminer la partie'
  );
}

function abandonGame() {
  showConfirm(
    'Abandonner la partie ? La progression sera perdue.',
    () => {
      state.currentGame = null;
      saveCurrentGame();
      document.getElementById('resume-banner').hidden = true;
      showView('welcome');
    },
    'Abandonner',
    true
  );
}

// ============================================================
// RÉSULTATS
// ============================================================
function statHtml(value, label) {
  return `<p class="stat"><span class="numeral numeral--sm">${escapeHtml(String(value))}</span><span class="eyebrow">${label}</span></p>`;
}

function renderAwards() {
  const g = state.currentGame;
  if (!g || !g.finalRanked) return;

  document.getElementById('awards-game-name').textContent = g.name + ', ' + formatDate(g.date);
  document.getElementById('awards-winner').textContent = g.finalRanked[0].name;

  document.getElementById('podium').innerHTML = g.finalRanked.slice(0, 3).map((p, i) => `
    <li class="podium__place">
      <span class="podium__rank" aria-hidden="true">${i + 1}</span>
      <span class="podium__name"><span class="sr-only">Rang ${i + 1} : </span>${playerCell(p)}</span>
      <span class="podium__score">${p.total} pts</span>
    </li>`).join('');

  document.getElementById('awards-grid').innerHTML = generateAwards(g).map(a => `
    <li class="ledger__row">
      <span class="eyebrow">${escapeHtml(a.player)}</span>
      <h4 class="ledger__title">${a.title}</h4>
      <p class="ledger__text">${escapeHtml(a.desc)}</p>
    </li>`).join('');

  const gap = Math.abs(g.finalRanked[0].total - (g.finalRanked[1]?.total ?? 0));
  let summary;
  if (kindOf(g) === 'sheet') {
    const rows = sheetRows(g);
    let third;
    if (g.game === 'caprices') {
      const filled = rows.filter(r => r.check).reduce((s, r) => s + g.sheet[r.key].filter(Boolean).length, 0);
      third = statHtml(filled, 'Caprices remplis');
    } else {
      // Meilleure case de la feuille, toutes catégories et tous joueurs confondus
      const best = Math.max(0, ...rows.filter(r => r.score !== false && !r.neg).flatMap(r => g.players.map((_, i) => rowPoints(r, g.sheet[r.key]?.[i]))));
      third = statHtml(best, 'Meilleure catégorie');
    }
    summary = statHtml(g.players.length, 'Joueurs') +
      statHtml(g.finalRanked[0].total, 'Score du vainqueur') +
      third +
      statHtml(gap, "Points d'écart final");
  } else if (kindOf(g) === 'seasons') {
    summary = statHtml(g.rounds.length, 'Saisons') +
      statHtml(g.players.length, 'Joueurs') +
      statHtml(Math.max(...g.rounds.flat()), 'Meilleure saison') +
      statHtml(gap, "Points d'écart final");
  } else if (kindOf(g) === 'belote' && g.details?.some(Boolean)) {
    const deals = g.details.filter(Boolean);
    const madeCount = deals.filter(d => beloteScore(d).made).length;
    summary = statHtml(g.rounds.length, 'Donnes') +
      statHtml(deals.filter(d => d.capot).length, 'Capots') +
      statHtml(`${Math.round(100 * madeCount / deals.length)} %`, 'Contrats réussis') +
      statHtml(Math.max(...g.rounds.flat()), 'Plus grosse donne');
  } else {
    const allScores = g.rounds.flatMap(r => r);
    const w = word(g);
    summary = statHtml(g.rounds.length, `${cap(w)}s`) +
      statHtml(g.players.length, gameDef(g).teams ? 'Équipes' : 'Joueurs') +
      statHtml(g.direction === 'low' ? Math.min(...allScores) : Math.max(...allScores), `Record de ${w}`) +
      statHtml(gap, "Points d'écart final");
  }
  document.getElementById('awards-summary').innerHTML = summary;
}

// ============================================================
// HISTORIQUE
// ============================================================
function renderHistory() {
  const allPlayers = {};
  state.history.forEach(g => {
    g.players?.forEach(p => {
      if (!allPlayers[p.name]) allPlayers[p.name] = { wins: 0, games: 0 };
      allPlayers[p.name].games++;
    });
    if (g.winner) {
      if (!allPlayers[g.winner]) allPlayers[g.winner] = { wins: 0, games: 0 };
      allPlayers[g.winner].wins++;
    }
  });
  const topPlayer = Object.entries(allPlayers).sort((a, b) => b[1].wins - a[1].wins)[0];
  const totalRounds = state.history.reduce((s, g) => s + (kindOf(g) === 'sheet' ? 0 : (g.rounds?.length || 0)), 0);

  document.getElementById('global-stats').innerHTML =
    statHtml(state.history.length, 'Parties jouées') +
    statHtml(totalRounds, 'Manches au total') +
    statHtml(Object.keys(allPlayers).length, 'Joueurs') +
    (topPlayer ? statHtml(topPlayer[1].wins, `Victoires de ${escapeHtml(topPlayer[0])}`) : '');

  document.getElementById('history-games-list').innerHTML = state.history.length
    ? state.history.slice().reverse().map((g, i) => gameRow(g, state.history.length - 1 - i, true)).join('')
    : '<li class="empty">Aucune partie jouée. Lancez votre première partie.</li>';
}

// Supprime une seule partie de l'historique, après confirmation
function deleteGame(idx) {
  const g = state.history[idx];
  if (!g) return;
  showConfirm(
    `Supprimer la partie « ${g.name} » du ${formatDate(g.date)} ? Elle disparaîtra de l'historique et des statistiques.`,
    () => {
      state.history.splice(idx, 1);
      saveHistory();
      renderHistory();
      toast('Partie supprimée.');
    },
    'Supprimer',
    true
  );
}

function reviewGame(idx) {
  const g = state.history[idx];
  if (!g) return;
  state.currentGame = { ...g, _readonly: true };
  state.currentGame.finalRanked = state.currentGame.finalRanked || getRanked(g);
  state.currentGame.stats = state.currentGame.stats || computeStats(g);
  showView('awards');
}

function discardCurrentGame() {
  state.currentGame = null;
  localStorage.removeItem('boardnight_current');
  document.getElementById('resume-banner').hidden = true;
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================
const ACTIONS = {
  'new-game': () => { showView('setup'); initSetup(); },
  'history': () => showView('history'),
  'welcome': () => showView('welcome'),
  'resume': () => showView('game'),
  'discard': discardCurrentGame,
  'count': el => setPlayerCount(state.setupPlayers.length + Number(el.dataset.step)),
  'pick-color': el => openAvatarModal(Number(el.dataset.index)),
  'select-color': selectColor,
  'confirm-color': confirmAvatar,
  'undo': undoLastRound,
  'end': endGame,
  'abandon': abandonGame,
  'copy-round': copyLastRound,
  'form-back': formBack,
  'toggle-sheet': el => updateSheet(el.dataset.field, Number(el.dataset.index)),
  'draft': el => setDraft(el.dataset.key, el.dataset.value),
  'chart': el => switchChart(el.dataset.mode, el),
  'review': el => reviewGame(Number(el.dataset.index)),
  'delete-game': el => deleteGame(Number(el.dataset.index)),
  'edit-round': el => editRound(Number(el.dataset.round)),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el);
});

document.getElementById('setup-form').addEventListener('submit', e => { e.preventDefault(); startGame(); });
document.getElementById('game-picker').addEventListener('change', e => pickGame(e.target.value));
document.getElementById('round-form').addEventListener('submit', e => { e.preventDefault(); submitRound(); });

document.getElementById('player-list').addEventListener('input', e => {
  if (!e.target.matches('.input')) return;
  const p = state.setupPlayers[Number(e.target.dataset.index)];
  if (e.target.dataset.member != null) p.members[Number(e.target.dataset.member)] = e.target.value;
  else p.name = e.target.value;
});

const scoreInputs = document.getElementById('score-inputs');

// Saisie : aperçu Skull King et feuille des Caprices mis à jour à chaque frappe
scoreInputs.addEventListener('input', e => {
  const g = state.currentGame; if (!g) return;
  showFormError('');
  if (kindOf(g) === 'bids') updateBidPreview();
  if (kindOf(g) === 'seasons') updateSeasonPreview();
  if (kindOf(g) === 'rounds') updateRoundTotal();
  if (kindOf(g) === 'sheet' && e.target.dataset.field) updateSheet(e.target.dataset.field, Number(e.target.dataset.index), e.target.value, e.target.dataset.part);
  if (e.target.dataset.draft) {
    currentDraft(g)[e.target.dataset.draft] = e.target.value;
    updateDealPreview();
  }
});

// Pas-à-pas de la partie libre : appui long à la souris ou au doigt, activation simple au clavier
scoreInputs.addEventListener('pointerdown', e => {
  const btn = e.target.closest('[data-step]');
  if (btn) startStep(Number(btn.dataset.index), Number(btn.dataset.step));
});
scoreInputs.addEventListener('click', e => {
  const btn = e.target.closest('[data-step]');
  if (btn && e.detail === 0) stepScore(Number(btn.dataset.index), Number(btn.dataset.step));
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(type => scoreInputs.addEventListener(type, stopStep, true));

// Entrée passe au champ suivant, puis valide sur le dernier
scoreInputs.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.matches('input')) return;
  e.preventDefault();
  const inputs = [...scoreInputs.querySelectorAll('input')];
  const next = inputs[inputs.indexOf(e.target) + 1];
  if (next) next.select();
  else if (kindOf(state.currentGame) === 'sheet') e.target.blur();
  else submitRound();
});

// Le graphique reprend les couleurs du thème quand celui-ci change
document.addEventListener('click', e => {
  if (e.target.closest('[data-theme-toggle]') && state.currentGame) setTimeout(renderChart, 0);
});

// ============================================================
// DÉMARRAGE
// ============================================================
// Reprise d'une partie en cours
(function restoreSession() {
  const saved = localStorage.getItem('boardnight_current');
  if (!saved) return;
  try {
    const g = JSON.parse(saved);
    if (g && g.id && !g._readonly && !g.winner && g.rounds) {
      state.currentGame = g;
      const banner = document.getElementById('resume-banner');
      banner.hidden = false;
      banner.querySelector('.resume-game-name').textContent = g.name;
      banner.querySelector('.resume-round').textContent = progressText(g);
    }
  } catch (e) { localStorage.removeItem('boardnight_current'); }
})();

initSetup();
renderWelcome();

// ============================================================
// CALCULS (classement, statistiques, trophées)
// ============================================================
function variance(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
  return arr.reduce((s,x)=>s+(x-mean)**2,0)/arr.length;
}

function getTotals(g) {
  // Emblèmes : les pièces de départ comptent dans le total
  const start = kindOf(g) === 'sheet' ? 0 : (gameDef(g).start || 0);
  return g.players.map((p,i) => ({
    ...p, idx: i,
    total: start + g.rounds.reduce((s,r) => s + (r[i] ?? 0), 0),
    perRound: g.rounds.map(r => r[i] ?? 0),
  }));
}

function getRanked(g) {
  const totals = getTotals(g);
  // Feuille de fin de partie : ligne de départage (Caprices : la plus faible valeur de Sujets)
  const tb = kindOf(g) === 'sheet' && g.sheet ? gameDef(g).tiebreak : null;
  const tbValues = tb && g.sheet[tb.key] ? g.sheet[tb.key].map(toInt) : null;
  // Cartographers : à égalité, le moins de points perdus aux monstres l'emporte
  const monsters = kindOf(g) === 'seasons' ? monsterLosses(g) : null;
  return totals.sort((a,b) => {
    const diff = g.direction === 'high' ? b.total - a.total : a.total - b.total;
    if (diff !== 0) return diff;
    if (tbValues && tbValues[a.idx] !== tbValues[b.idx]) return tb.low ? tbValues[a.idx] - tbValues[b.idx] : tbValues[b.idx] - tbValues[a.idx];
    if (monsters && monsters[a.idx] !== monsters[b.idx]) return monsters[a.idx] - monsters[b.idx];
    return a.idx - b.idx;
  });
}

// Fixed: stable sort + compare by value not reference
function getPrevRank(g, playerIdx) {
  if (g.rounds.length < 2) return 0;
  const prevRounds = g.rounds.slice(0, -1);
  const totals = g.players.map((_,i) => prevRounds.reduce((s,r)=>s+(r[i]??0),0));
  const sorted = g.players.map((_,i) => ({i, v: totals[i]}))
    .sort((a,b) => g.direction==='high' ? b.v-a.v || a.i-b.i : a.v-b.v || a.i-b.i);
  return sorted.findIndex(x => x.i === playerIdx) + 1;
}

// Stepper with long-press acceleration
let _stepInterval = null;
let _stepCount = 0;
function startStep(i, d) {
  stepScore(i, d);
  _stepCount = 0;
  _stepInterval = setInterval(() => {
    _stepCount++;
    const step = _stepCount > 15 ? 10 : _stepCount > 8 ? 5 : 1;
    stepScore(i, d * step);
  }, 120);
}
function stopStep() { clearInterval(_stepInterval); _stepInterval = null; }

function stepScore(i, d) {
  const input = document.getElementById('score-'+i);
  if (input) input.value = toInt(input.value) + d;
  updateRoundTotal();
}

function checkDramaticMoments(g) {
  if (g.rounds.length < 2) return;
  const ranked = getRanked(g);
  const prev = getPrevRank(g, ranked[0].idx);
  if (prev > 1) toast(`${ranked[0].name} prend la tête.`, 'default', 3500);
  const lastRound = g.rounds[g.rounds.length-1];
  const maxScore = Math.max(...lastRound);
  if (maxScore > 0) {
    const allPrev = g.rounds.slice(0,-1).flatMap(r => r);
    const prevMax = allPrev.length ? Math.max(...allPrev) : 0;
    if (maxScore > prevMax * 1.5 && maxScore > 20) {
      const hero = g.players[lastRound.indexOf(maxScore)];
      if (g.direction === 'high') setTimeout(() => toast(`${hero.name} bat le record de ${word(g)}.`, 'default', 3500), 1200);
    }
  }
}

function computeStats(g) {
  const totals = getTotals(g);
  const ranked = getRanked(g);
  const n = g.players.length;

  // Comeback: biggest rank gain from first half to second half
  let comeback = {gain: -Infinity, player: null};
  if (g.rounds.length > 2) {
    const half = Math.ceil(g.rounds.length / 2);
    totals.forEach(p => {
      const firstHalfTotal = g.rounds.slice(0, half).reduce((s,r) => s+(r[p.idx]??0), 0);
      const secondHalfTotal = g.rounds.slice(half).reduce((s,r) => s+(r[p.idx]??0), 0);
      const gain = g.direction === 'high' ? secondHalfTotal - firstHalfTotal : firstHalfTotal - secondHalfTotal;
      if (gain > comeback.gain) { comeback.gain = gain; comeback.player = p; }
    });
  }

  // Lead dominance: who was #1 most often
  const leadCounts = {};
  g.players.forEach(p => leadCounts[p.name] = 0);
  g.rounds.forEach((_,ri) => {
    const partial = g.players.map((p,pi) => ({
      name: p.name,
      total: g.rounds.slice(0,ri+1).reduce((s,r)=>s+(r[pi]??0),0)
    }));
    partial.sort((a,b) => g.direction==='high'?b.total-a.total:a.total-b.total);
    leadCounts[partial[0].name] = (leadCounts[partial[0].name]||0) + 1;
  });
  const tyrant = Object.entries(leadCounts).sort((a,b)=>b[1]-a[1])[0];

  // Variance per player
  const vars = totals.map(p => ({...p, var: variance(p.perRound)}));
  vars.sort((a,b) => b.var - a.var);
  const gambler = vars[0]; // highest variance
  const wall = vars[vars.length-1]; // lowest variance

  // Round wins
  const roundWins = Array(n).fill(0);
  g.rounds.forEach(r => {
    const best = g.direction === 'high' ? Math.max(...r) : Math.min(...r);
    r.forEach((v,i) => { if(v === best) roundWins[i]++; });
  });

  // Sniper: winner who scored best in last round
  let sniper = null;
  if (g.rounds.length > 1) {
    const lastRound = g.rounds[g.rounds.length-1];
    const best = g.direction==='high' ? Math.max(...lastRound) : Math.min(...lastRound);
    const sniperIdx = lastRound.indexOf(best);
    if (ranked[0].idx === sniperIdx) sniper = g.players[sniperIdx];
  }

  // Sleeper: low first half, high second half
  let sleeper = null;
  totals.forEach(p => {
    const half = Math.floor(p.perRound.length / 2);
    if (half < 1) return;
    const first = p.perRound.slice(0, half).reduce((a,b)=>a+b, 0) / half;
    const second = p.perRound.slice(half).reduce((a,b)=>a+b, 0) / (p.perRound.length - half);
    if (g.direction === 'high' && second > first * 1.5 && first > 0) sleeper = p;
    if (g.direction === 'low' && second < first * 0.67 && first > 0) sleeper = p;
  });

  // Biggest single round score
  let bigBang = {val: g.direction==='high'?-Infinity:Infinity, player: null};
  totals.forEach(p => {
    p.perRound.forEach(score => {
      if ((g.direction==='high' && score > bigBang.val) || (g.direction==='low' && score < bigBang.val)) {
        bigBang.val = score;
        bigBang.player = p;
      }
    });
  });

  // Biggest score drop
  let collapse = {val: -Infinity, player: null};
  totals.forEach(p => {
    for (let i=1; i < p.perRound.length; i++) {
      const drop = g.direction==='high' ? p.perRound[i-1] - p.perRound[i] : p.perRound[i] - p.perRound[i-1];
      if (drop > collapse.val) { collapse.val = drop; collapse.player = p; }
    }
  });

  // Reversal: was behind most of the game but won
  let reversal = null;
  totals.forEach(p => {
    let behindCount = 0;
    g.rounds.forEach((_,ri) => {
      const partial = g.players.map((_2,i2) => g.rounds.slice(0,ri+1).reduce((s,r)=>s+(r[i2]??0),0));
      const leaderVal = g.direction==='high' ? Math.max(...partial) : Math.min(...partial);
      if (partial[p.idx] !== leaderVal) behindCount++;
    });
    if (behindCount > g.rounds.length * 0.6 && ranked[0].name === p.name) reversal = p;
  });

  // Tourist: always in the bottom half, every single round
  let tourist = null;
  if (n >= 3) {
    totals.forEach(p => {
      const alwaysBottom = g.rounds.every((_,ri) => {
        const partial = g.players.map((_2,i2) => g.rounds.slice(0,ri+1).reduce((s,r)=>s+(r[i2]??0),0));
        const sorted = [...partial].sort((a,b) => g.direction==='high'?b-a:a-b);
        const myRank = sorted.indexOf(partial[p.idx]);
        return myRank >= Math.floor(n/2);
      });
      if (alwaysBottom) tourist = p;
    });
  }

  // Clutch: best last 2 rounds combined
  let clutch = {val: g.direction==='high'?-Infinity:Infinity, player: null};
  totals.forEach(p => {
    const last2 = p.perRound.slice(-2).reduce((a,b)=>a+b,0);
    if ((g.direction==='high' && last2 > clutch.val) || (g.direction==='low' && last2 < clutch.val)) {
      clutch.val = last2; clutch.player = p;
    }
  });

  // Phoenix: last place at halfway, won final
  let phoenix = null;
  if (g.rounds.length >= 4) {
    const half = Math.ceil(g.rounds.length / 2);
    const halfTotals = g.players.map((_,i) => g.rounds.slice(0,half).reduce((s,r)=>s+(r[i]??0),0));
    const worstHalf = g.direction==='high' ? Math.min(...halfTotals) : Math.max(...halfTotals);
    if (halfTotals[ranked[0].idx] === worstHalf) phoenix = ranked[0];
  }

  return {
    comeback: comeback.player,
    tyrant: tyrant?.[0],
    gambler,
    wall,
    sniper,
    sleeper,
    bigBang: bigBang.player,
    collapse: collapse.player,
    reversal,
    tourist,
    clutch: clutch.player,
    phoenix,
    ranked,
    leadCounts,
    roundWins,
  };
}

// Joueur(s) qui ont la meilleure valeur, ex æquo compris.
// Renvoie null si la valeur ne passe pas le seuil `ok`, ou si tout le monde est à égalité :
// un trophée partagé par toute la table ne distingue personne.
function bestOf(g, values, ok, low = false) {
  const v = low ? Math.min(...values) : Math.max(...values);
  if (!ok(v)) return null;
  const names = g.players.filter((_, i) => values[i] === v).map(p => p.name);
  if (names.length === g.players.length) return null;
  return { v, who: names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}` : names[0] };
}

function fois(n) { return `${n} fois`; }

// Trophées des Caprices du Roi : la partie n'a qu'une feuille, pas de manches
function capriceAwards(g) {
  const ranked = g.finalRanked;
  const awards = [];
  const add = (title, b, desc) => { if (b) awards.push({ title, player: b.who, desc: desc(b.v) }); };
  const col = key => g.sheet[key].map(toInt);

  awards.push({ title: 'Le Favori du Roi', player: ranked[0].name, desc: `Vainqueur avec ${ranked[0].total} pts. Le roi est comblé.` });
  if (ranked.length > 1) {
    const last = ranked[ranked.length - 1];
    awards.push({ title: 'Le Disgracié', player: last.name, desc: `Dernière place avec ${last.total} pts. Le roi a la mémoire courte, heureusement.` });
  }
  if (ranked.length >= 2 && ranked[0].total === ranked[1].total) {
    awards.push({ title: 'Départagé', player: ranked[1].name, desc: `Même total que ${ranked[0].name}, mais des Sujets de plus grande valeur. Le roi préfère les humbles.` });
  }

  add('Le Recruteur', bestOf(g, col('sujets'), v => v > 0), v => `Les Sujets les plus précieux du royaume : ${v} pts de cartes.`);
  add('Le Maître de l\'Ordre', bestOf(g, col('ordre'), v => v > 0), v => `${v} pts avec « De l'ordre ! ». Une suite impeccable, le roi applaudit.`);
  add('Le Rassembleur', bestOf(g, col('union'), v => v > 0), v => `${v} pts avec « L'union fait la force ! ». Toute une caste derrière lui.`);

  const rows = sheetRows(g);
  const capCount = g.players.map((_, i) => rows.filter(r => r.check && g.sheet[r.key][i]).length);
  const capPoints = g.players.map((_, i) => rows.reduce((s, r) => s + (r.check && g.sheet[r.key][i] ? r.check : 0), 0));
  add('Le Courtisan', bestOf(g, capCount, v => v > 0), v => `${v} caprice${v > 1 ? 's' : ''} sur 4 remplis. Toujours le premier à flatter Sa Majesté.`);
  add('Le Chouchou', bestOf(g, g.sheet.c30.map(Number), v => v > 0), () => 'A rempli le caprice à +30, le plus cher aux yeux du roi.');

  // Plus de la moitié des points viennent des caprices
  const share = g.players.map((_, i) => {
    const total = g.finalRanked.find(p => p.idx === i)?.total || 0;
    return total > 0 ? Math.round(100 * capPoints[i] / total) : 0;
  });
  add('L\'Opportuniste', bestOf(g, share, v => v >= 50), v => `${v} % de ses points viennent des caprices. Il sait ce que le roi veut entendre.`);

  // Aucun caprice rempli, alors qu'un autre joueur en a rempli au moins un
  if (Math.max(...capCount) > 0) {
    add('Le Rebelle', bestOf(g, capCount, v => v === 0, true), () => 'Aucun caprice rempli. Le roi a pris note.');
  }
  return awards;
}

// Trophées de Skull King : annonces, plis et bonus de chaque manche
function skullKingAwards(g) {
  const ranked = g.finalRanked;
  const awards = [];
  const add = (title, b, desc) => { if (b) awards.push({ title, player: b.who, desc: desc(b.v) }); };
  const rounds = g.details.map((d, ri) => d && { ...d, ri, cards: ri + 1 }).filter(Boolean);
  const n = rounds.length;
  const per = fn => g.players.map((_, i) => rounds.reduce((s, d) => s + fn(d, i), 0));

  const exact = per((d, i) => d.bids[i] === d.tricks[i] ? 1 : 0);
  const zeros = per((d, i) => d.bids[i] === 0 && d.tricks[i] === 0 ? 1 : 0);
  const bonus = per((d, i) => d.bids[i] === d.tricks[i] ? d.bonus[i] : 0);
  const over = per((d, i) => d.tricks[i] < d.bids[i] ? 1 : 0);
  const under = per((d, i) => d.tricks[i] > d.bids[i] ? 1 : 0);
  const bigBid = g.players.map((_, i) => Math.max(0, ...rounds.filter(d => d.bids[i] === d.tricks[i]).map(d => d.bids[i])));
  const bestRound = g.players.map((_, i) => Math.max(...g.rounds.map(r => r[i] ?? 0)));
  const worstRound = g.players.map((_, i) => Math.min(...g.rounds.map(r => r[i] ?? 0)));

  awards.push({ title: 'Le Skull King', player: ranked[0].name, desc: `Maître des sept mers avec ${ranked[0].total} pts. Tout l'équipage salue son capitaine.` });
  if (ranked.length > 1) {
    const last = ranked[ranked.length - 1];
    awards.push({ title: 'Le Moussaillon', player: last.name, desc: `Dernière place avec ${last.total} pts. Il reste du pont à briquer.` });
    const gap = ranked[0].total - ranked[1].total;
    if (gap <= 20) awards.push({ title: 'Le Second', player: ranked[1].name, desc: `${gap} pts d'écart avec le capitaine. Une seule annonce de plus et le navire changeait de main.` });
  }

  add('Le Devin', bestOf(g, exact, v => v > 0), v => `${v} annonce${v > 1 ? 's' : ''} tenue${v > 1 ? 's' : ''} sur ${n}. Il lit dans les cartes.`);
  add('Le Passager clandestin', bestOf(g, zeros, v => v >= 2), v => `${v} annonces de zéro tenues. Personne ne l'a vu monter à bord.`);
  add('Le Chasseur de trésors', bestOf(g, bonus, v => v >= 20), v => `${v} pts de bonus encaissés : pirates, sirènes et 14 ramassés au bon moment.`);
  add('Le Grand Pari', bestOf(g, bigBid, v => v >= 3), v => `A annoncé ${v} plis et les a tous pris. Audace récompensée.`);
  add('L\'Abordage', bestOf(g, bestRound, v => v > 0), v => `${v} pts en une seule manche. Le plus beau coup de la partie.`);
  add('Le Naufragé', bestOf(g, worstRound, v => v < 0, true), v => `${signed(v)} en une seule manche. Le navire a coulé corps et biens.`);
  add('Les Yeux plus gros que le ventre', bestOf(g, over, v => v >= 2), v => `${fois(v)} moins de plis que promis. L'appétit, pas la prise.`);
  add('Le Pilleur malgré lui', bestOf(g, under, v => v >= 2), v => `${fois(v)} plus de plis que prévu. Le butin lui tombait dessus sans qu'il le veuille.`);

  // En tête du classement après le plus grand nombre de manches
  const lead = g.players.map(() => 0);
  g.rounds.forEach((_, ri) => {
    const partial = g.players.map((__, i) => g.rounds.slice(0, ri + 1).reduce((s, r) => s + (r[i] ?? 0), 0));
    const top = Math.max(...partial);
    partial.forEach((v, i) => { if (v === top) lead[i]++; });
  });
  add('Le Capitaine au long cours', bestOf(g, lead, v => v >= 3), v => `En tête après ${v} manches. Il a tenu la barre.`);

  // Les trois dernières manches, les plus chargées en cartes
  if (g.rounds.length >= 5) {
    const finish = g.players.map((_, i) => g.rounds.slice(-3).reduce((s, r) => s + (r[i] ?? 0), 0));
    add('Le Vent en poupe', bestOf(g, finish, v => v > 0), v => `${v} pts sur les trois dernières manches, quand les mains sont les plus grosses.`);
  }
  return awards;
}

// Trophées de Cartographers : décrets, pièces et monstres de chaque saison
function cartographersAwards(g) {
  const ranked = g.finalRanked;
  const awards = [];
  const add = (title, b, desc) => { if (b) awards.push({ title, player: b.who, desc: desc(b.v) }); };
  const rounds = g.details.map((d, ri) => d && { ...d, ri }).filter(Boolean);
  const per = fn => g.players.map((_, i) => rounds.reduce((s, d) => s + fn(d, i), 0));
  const pts = v => `${v} pt${Math.abs(v) > 1 ? 's' : ''}`;

  const edictPts = per((d, i) => d.e1[i] + d.e2[i]);
  const coinPts = per((d, i) => d.coins[i]);
  const monsters = monsterLosses(g);
  const bestSeason = g.players.map((_, i) => Math.max(...g.rounds.map(r => r[i] ?? 0)));
  // Meilleur total sur un même décret (chaque décret compte deux saisons)
  const bestEdict = g.players.map((_, i) => {
    const byLetter = {};
    rounds.forEach(d => {
      const [a, b] = SEASONS[d.ri].edicts;
      byLetter[a] = (byLetter[a] || 0) + d.e1[i];
      byLetter[b] = (byLetter[b] || 0) + d.e2[i];
    });
    return Math.max(0, ...Object.values(byLetter));
  });

  awards.push({ title: 'Le Cartographe royal', player: ranked[0].name, desc: `${pts(ranked[0].total)} de réputation. Sa carte rejoint la bibliothèque de la reine.` });
  if (ranked.length > 1) {
    const last = ranked[ranked.length - 1];
    awards.push({ title: 'Le Gribouilleur', player: last.name, desc: `Dernière place avec ${pts(last.total)}. Une carte qui tient plus du croquis.` });
    const gap = ranked[0].total - ranked[1].total;
    if (gap === 0) awards.push({ title: 'Départagé', player: ranked[1].name, desc: `Même total que ${ranked[0].name}, mais plus de points perdus aux monstres. La reine n'aime pas les frontières mal gardées.` });
    else if (gap <= 5) awards.push({ title: 'À une case près', player: ranked[1].name, desc: `${pts(gap)} d'écart avec le vainqueur. Une forêt bien placée et la carte changeait de main.` });
  }

  add('Le Légiste', bestOf(g, edictPts, v => v > 0), v => `${pts(v)} gagnés avec les décrets. Il lit les ordres de la reine mieux que personne.`);
  add('Le Spécialiste', bestOf(g, bestEdict, v => v >= 10), v => `${pts(v)} sur un seul décret. Il en a fait sa spécialité.`);
  add('La Saison dorée', bestOf(g, bestSeason, v => v > 0), v => `${pts(v)} en une seule saison. La plus belle page de la partie.`);
  add('Le Marchand', bestOf(g, coinPts, v => v >= 5), v => `${pts(v)} rapportés par les pièces. Chaque pièce paie à chaque saison.`);
  add('Le Rempart', bestOf(g, monsters, () => true, true), v => (v === 0 ? 'Aucun point perdu aux monstres. Ses frontières sont sûres.' : `Seulement ${pts(v)} perdus aux monstres. Ses frontières tiennent.`));
  add('La Proie des monstres', bestOf(g, monsters, v => v >= 5), v => `${pts(v)} perdus aux monstres. Les embuscades l'ont trouvé à chaque fois.`);

  // L'hiver est la saison la plus courte : bien finir compte double
  if (g.rounds.length === SEASONS.length) {
    add('L\'Hiver triomphal', bestOf(g, g.rounds[SEASONS.length - 1], v => v > 0), v => `${pts(v)} en hiver, la saison la plus courte.`);
  }

  // En tête du classement après le plus grand nombre de saisons
  const lead = g.players.map(() => 0);
  g.rounds.forEach((_, ri) => {
    const partial = g.players.map((__, i) => g.rounds.slice(0, ri + 1).reduce((s, r) => s + (r[i] ?? 0), 0));
    const top = Math.max(...partial);
    partial.forEach((v, i) => { if (v === top) lead[i]++; });
  });
  add('Le Pionnier', bestOf(g, lead, v => v >= 3), v => `En tête après ${v} saisons sur ${g.rounds.length}. Il a tracé la route.`);
  return awards;
}

// Trophées d'une feuille de fin de partie : vainqueur, dernier, puis le meilleur de chaque ligne
function sheetAwards(g) {
  const def = gameDef(g);
  const ranked = g.finalRanked;
  const awards = [];
  const add = (title, b, desc) => { if (b) awards.push({ title, player: b.who, desc: desc(b.v) }); };
  const t = def.titles || {};

  awards.push({ title: t.win || 'Le Champion', player: ranked[0].name, desc: t.winText ? t.winText(ranked[0].total) : `Vainqueur avec ${ranked[0].total} pts.` });
  if (ranked.length > 1) {
    const last = ranked[ranked.length - 1];
    awards.push({ title: t.last || 'L\'Escargot', player: last.name, desc: t.lastText ? t.lastText(last.total) : `Dernière place avec ${last.total} pts.` });
    const gap = ranked[0].total - ranked[1].total;
    if (gap === 0 && def.tiebreak) awards.push({ title: 'Départagé', player: ranked[1].name, desc: `Même total que ${ranked[0].name}, perdu au départage. ${def.tiebreakHint || ''}`.trim() });
    else if (gap > 0 && gap <= 3) awards.push({ title: 'Champion du Presque', player: ranked[1].name, desc: `${plural(gap, 'point')} d'écart avec ${ranked[0].name}. La victoire vous frôlait.` });
  }

  def.rows.forEach(row => {
    if (!row.award) return;
    // Une ligne négative récompense le plus gros malus, saisi en positif
    const values = g.players.map((_, i) => (row.neg ? toInt(g.sheet[row.key][i]) : rowPoints(row, g.sheet[row.key][i])));
    add(row.award.title, bestOf(g, values, v => v >= (row.award.min ?? 1)), row.award.text);
  });

  // La catégorie qui pèse le plus lourd dans le total d'un joueur
  const scored = def.rows.filter(r => r.score !== false && !r.neg && !r.check);
  if (scored.length >= 3) {
    const share = g.players.map((_, i) => {
      const total = ranked.find(p => p.idx === i)?.total || 0;
      const top = Math.max(0, ...scored.map(r => rowPoints(r, g.sheet[r.key][i])));
      return total > 0 ? Math.round(100 * top / total) : 0;
    });
    add('Le Spécialiste', bestOf(g, share, v => v >= 50), v => `${v} % de ses points dans une seule catégorie. Une idée fixe, et elle a payé.`);
    const spread = g.players.map((_, i) => scored.filter(r => rowPoints(r, g.sheet[r.key][i]) > 0).length);
    add('L\'Équilibriste', bestOf(g, spread, v => v === scored.length), () => `Des points dans les ${scored.length} catégories. Rien n'a été laissé de côté.`);
  }

  if (def.extraAwards) awards.push(...def.extraAwards(g));
  return awards;
}

// Trophées de la Belote : prises, chutes, capots, belotes et annonces de chaque donne
function beloteAwards(g) {
  const ranked = g.finalRanked;
  const awards = [];
  const add = (title, b, desc) => { if (b) awards.push({ title, player: b.who, desc: desc(b.v) }); };
  const deals = g.details.filter(Boolean);
  const per = fn => g.players.map((_, i) => deals.reduce((s, d) => s + fn(d, i), 0));

  awards.push({ title: 'Le Maître de la Belote', player: ranked[0].name, desc: `${ranked[0].total} pts. L'atout n'a plus de secret.` });
  if (ranked.length > 1) {
    const last = ranked[ranked.length - 1];
    awards.push({ title: 'Les Mal Coupés', player: last.name, desc: `${last.total} pts. La revanche est déjà réclamée.` });
  }
  // Joueur par joueur quand les membres sont connus, sinon équipe par équipe
  const seats = hasMembers(g)
    ? g.players.flatMap((p, i) => p.members.map((m, mi) => ({ name: m, is: d => d.taker === i && d.takerMember === mi })))
    : g.players.map((p, i) => ({ name: p.name, is: d => d.taker === i }));
  const bestSeat = (fn, ok) => {
    const values = seats.map(s => deals.filter(d => s.is(d)).reduce((sum, d) => sum + fn(d), 0));
    const v = Math.max(...values);
    if (!ok(v)) return null;
    const names = seats.filter((_, k) => values[k] === v).map(s => s.name);
    if (names.length === seats.length) return null;
    return { v, who: names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}` : names[0] };
  };
  const made = d => (beloteScore(d).made ? 1 : 0);

  add('Le Preneur', bestSeat(() => 1, v => v >= 2), v => `A pris ${fois(v)} sur ${deals.length} donnes. Jamais peur de l'atout.`);
  if (hasMembers(g)) add('L\'Équipe qui ose', bestOf(g, per((d, i) => (d.taker === i ? 1 : 0)), v => v >= 2), v => `${plural(v, 'prise')} pour l'équipe. On ne passe pas chez eux.`);
  add('Le Contrat en béton', bestSeat(made, v => v >= 2), v => `${plural(v, 'contrat')} réussi${v > 1 ? 's' : ''}. Quand il prend, il passe.`);
  add('Dedans', bestSeat(d => 1 - made(d), v => v >= 1), v => `${fois(v)} dedans. La défense le remercie.`);
  add('Le Capot', bestSeat(d => (d.capot ? 1 : 0), v => v >= 1), v => `${plural(v, 'capot')}. Tous les plis, sans exception.`);
  // Atout préféré : la couleur la plus souvent choisie, si elle se détache
  const byTrump = Object.keys(TRUMPS).map(k => ({ k, n: deals.filter(d => d.trump === k).length })).sort((a, b) => b.n - a.n);
  if (byTrump[0].n >= 2 && byTrump[0].n > byTrump[1].n) {
    const t = TRUMPS[byTrump[0].k];
    const ok = deals.filter(d => d.trump === byTrump[0].k && beloteScore(d).made).length;
    awards.push({ title: 'La Couleur fétiche', player: `${t.sym} ${t.label}`, desc: `Atout ${fois(byTrump[0].n)}, ${plural(ok, 'contrat')} réussi${ok > 1 ? 's' : ''}.` });
  }
  add('Belote et rebelote', bestOf(g, per((d, i) => (d.belote === i ? 1 : 0)), v => v >= 2), v => `${fois(v)} le roi et la dame d'atout. La chance des couples royaux.`);
  add('Le Chanteur', bestOf(g, per((d, i) => toInt(d[`ann${i}`])), v => v >= 20), v => `${v} pts d'annonces. Tierces, cinquantes et carrés.`);
  // Plus grosse donne de la partie, avec le preneur et l'atout
  let top = null;
  g.rounds.forEach((r, ri) => r.forEach((v, i) => { if (!top || v > top.v) top = { v, i, ri }; }));
  if (top && top.v > 0) {
    const d = g.details[top.ri];
    const how = d ? `, ${d.taker === top.i ? 'en attaque' : 'en défense'} sur une prise de ${takerName(g, d)}${TRUMPS[d.trump] ? ` à ${TRUMPS[d.trump].label.toLowerCase()}` : ''}` : '';
    awards.push({ title: 'La Grosse Donne', player: g.players[top.i].name, desc: `${top.v} pts à la donne ${top.ri + 1}${how}.` });
  }
  return awards;
}

// Trophées du Tarot : prises, contrats, bouts, petit au bout et appels
function tarotAwards(g) {
  const ranked = g.finalRanked;
  const awards = [];
  const add = (title, b, desc) => { if (b) awards.push({ title, player: b.who, desc: desc(b.v) }); };
  const n = g.players.length;
  const deals = g.details.filter(Boolean).map(d => ({ ...d, r: tarotScore(d, n) }));
  const per = fn => g.players.map((_, i) => deals.reduce((s, d) => s + fn(d, i), 0));
  const big = ['gardesans', 'gardecontre'];

  awards.push({ title: 'L\'Excuse parfaite', player: ranked[0].name, desc: `Vainqueur avec ${signed(ranked[0].total)}. Aucune excuse à présenter.` });
  if (ranked.length > 1) {
    const last = ranked[ranked.length - 1];
    awards.push({ title: 'Le Petit sec', player: last.name, desc: `${signed(last.total)}. Seul, sans protection, et tout le monde l'a vu.` });
  }
  add('Le Preneur', bestOf(g, per((d, i) => (d.taker === i ? 1 : 0)), v => v >= 2), v => `A pris ${fois(v)}. Il aime avoir la main.`);
  add('Le Téméraire', bestOf(g, per((d, i) => (d.taker === i && big.includes(d.contract) ? 1 : 0)), v => v >= 1), v => `${fois(v)} garde sans ou garde contre. Le chien, très peu pour lui.`);
  add('Le Contrat en or', bestOf(g, per((d, i) => (d.taker === i && d.r.made ? 1 : 0)), v => v >= 2), v => `${plural(v, 'contrat')} fait${v > 1 ? 's' : ''}.`);
  add('La Chute', bestOf(g, per((d, i) => (d.taker === i && !d.r.made ? 1 : 0)), v => v >= 2), v => `${fois(v)} chuté. Les défenses ont apprécié.`);
  add('Le Collectionneur de bouts', bestOf(g, per((d, i) => (d.taker === i ? toInt(d.bouts) : 0)), v => v >= 3), v => `${plural(v, 'bout')} ramenés en attaque.`);
  add('Le Petit au bout', bestOf(g, per((d, i) => (d.taker === i && d.petit === 'attaque' ? 1 : 0)), v => v >= 1), v => `${fois(v)} le petit au dernier pli. Le geste le plus élégant du tarot.`);
  add('La Poignée de main', bestOf(g, per((d, i) => (d.taker === i && d.poignee ? 1 : 0)), v => v >= 1), v => `${fois(v)} une poignée montrée. Des atouts à revendre.`);
  if (n === 5) add('Le Fidèle Second', bestOf(g, per((d, i) => (d.called === i && d.taker !== i ? 1 : 0)), v => v >= 2), v => `Appelé ${fois(v)}. Le partenaire que tout le monde veut.`);
  const best = g.players.map((_, i) => Math.max(...g.rounds.map(r => r[i] ?? 0)));
  add('La Donne du siècle', bestOf(g, best, v => v > 0), v => `${signed(v)} en une seule donne.`);
  const worst = g.players.map((_, i) => Math.min(...g.rounds.map(r => r[i] ?? 0)));
  add('La Bérézina', bestOf(g, worst, v => v < 0, true), v => `${signed(v)} en une seule donne.`);
  return awards;
}

function generateAwards(g) {
  if (kindOf(g) === 'sheet' && g.sheet) return g.game === 'caprices' ? capriceAwards(g) : sheetAwards(g);
  if (kindOf(g) === 'seasons' && g.details?.some(Boolean)) return cartographersAwards(g);
  if (kindOf(g) === 'bids' && g.details?.some(Boolean)) return skullKingAwards(g);
  if (kindOf(g) === 'belote' && g.details?.some(Boolean)) return beloteAwards(g);
  if (kindOf(g) === 'tarot' && g.details?.some(Boolean)) return tarotAwards(g);
  const ranked = g.finalRanked;
  const stats = g.stats;
  const awards = [];
  const t = gameDef(g).titles || {};
  const w = word(g);

  // Champion (always first, always displayed)
  awards.push({ priority: 0, title: t.win || 'Le Champion', player: ranked[0].name, desc: t.winText ? t.winText(ranked[0].total) : `Vainqueur incontesté avec ${ranked[0].total} pts. À la prochaine.` });

  // Last place
  if (ranked.length > 1) {
    const snail = ranked[ranked.length-1];
    awards.push({ priority: 1, title: t.last || 'L\'Escargot', player: snail.name, desc: t.lastText ? t.lastText(snail.total) : `Dernière place avec ${snail.total} pts. L'important c'est le voyage.` });
  }
  // Trophées propres au jeu (Papayoo…)
  (gameDef(g).extraAwards?.(g) || []).forEach(a => awards.push({ priority: 1.5, ...a }));

  // Tyrant : led the most rounds
  if (stats.tyrant) {
    const tyrantCount = stats.leadCounts[stats.tyrant];
    awards.push({ priority: 2, title:'Le Tyran', player: stats.tyrant, desc: `En tête pendant ${tyrantCount} ${w}${tyrantCount>1?'s':''}. Le pouvoir est addictif.` });
  }

  // Gambler : highest variance (distinct from wall)
  if (stats.gambler && stats.gambler.name !== stats.wall?.name && g.rounds.length > 1) {
    awards.push({ priority: 3, title:'Le Flambeur', player: stats.gambler.name, desc: `Scores imprévisibles sur chaque ${w}. Vit pour le chaos.` });
  }

  // Wall : most consistent (distinct from gambler)
  if (stats.wall && stats.wall.name !== stats.gambler?.name && g.rounds.length > 1) {
    const wallIsWinner = ranked[0].name === stats.wall.name;
    awards.push({ priority: 4, title:'Le Mur', player: stats.wall.name, desc: wallIsWinner ? `Régularité absolue ET victoire. Le combo parfait.` : `Scores ultra-réguliers. Pas premier, mais imperturbable.` });
  }

  // Comeback
  if (stats.comeback && g.rounds.length > 2) {
    awards.push({ priority: 5, title:'La Fusée', player: stats.comeback.name, desc: `La plus grosse remontée en seconde moitié de partie. Pas de panique, juste du talent.` });
  }

  // Sniper
  if (stats.sniper) {
    awards.push({ priority: 6, title:'Le Sniper', player: stats.sniper.name, desc: `Meilleur score lors de la toute dernière ${w}. Le timing, c'est tout.` });
  }

  // Big Bang
  if (stats.bigBang) {
    awards.push({ priority: 7, title:'Le Big Bang', player: stats.bigBang.name, desc: `Le plus haut score sur une seule ${w}. Un tour légendaire.` });
  }

  // Collapse
  if (stats.collapse && g.rounds.length > 2) {
    awards.push({ priority: 8, title:'L\'Effondrement', player: stats.collapse.name, desc: `La plus grosse chute entre deux ${w}s. Ce qui monte doit redescendre.` });
  }

  // Reversal
  if (stats.reversal) {
    awards.push({ priority: 9, title:'Le Retournement', player: stats.reversal.name, desc: `Derrière pendant la majorité de la partie, vainqueur à la fin. Magistral.` });
  }

  // Clutch
  if (stats.clutch) {
    awards.push({ priority: 10, title:'Le Sang-Froid', player: stats.clutch.name, desc: `Meilleures deux dernières ${w}s combinées. La pression fait les diamants.` });
  }

  // Tourist : fixed condition: always in bottom half every round
  if (stats.tourist) {
    awards.push({ priority: 11, title:'Le Touriste', player: stats.tourist.name, desc: `Jamais sorti du bas du classement. Juste content d'être là.` });
  }

  // Sleeper
  if (stats.sleeper) {
    awards.push({ priority: 12, title:'La Menace Fantôme', player: stats.sleeper.name, desc: `Discret en première moitié, explosif en seconde. On n'aurait pas dû les ignorer.` });
  }

  // Phoenix
  if (stats.phoenix) {
    awards.push({ priority: 13, title:'Le Phoenix', player: stats.phoenix.name, desc: `Dernier à mi-partie, champion à la fin. Renaître des cendres, c'est un art.` });
  }

  // Low-score direction bonus
  if (g.direction === 'low') {
    awards.push({ priority: 14, title:'Le Minimaliste', player: ranked[0].name, desc: `Moins c'est mieux. Le plus bas score remporte la mise.` });
  }

  // Champion du presque : 2nd place within 5%
  if (ranked.length >= 2) {
    const winner = ranked[0]; const runnerUp = ranked[1];
    const pct = Math.abs(winner.total - runnerUp.total) / Math.max(1, Math.abs(winner.total));
    if (pct < 0.05) {
      awards.push({ priority: 15, title:'Champion du Presque', player: runnerUp.name, desc: `${Math.abs(winner.total - runnerUp.total)} point(s) d'écart. La victoire vous frôlait.` });
    }
  }

  // Round wins trophy
  const roundWinLeader = g.players.map((p, idx) => ({ ...p, idx }))
    .reduce((a,b) => stats.roundWins[a.idx] >= stats.roundWins[b.idx] ? a : b);
  if (stats.roundWins[roundWinLeader.idx] >= Math.ceil(g.rounds.length * 0.5)) {
    awards.push({ priority: 16, title:'Le Dominateur', player: roundWinLeader.name, desc: `A remporté ${stats.roundWins[roundWinLeader.idx]} ${w}${stats.roundWins[roundWinLeader.idx]>1?'s':''} sur ${g.rounds.length}. Une présence écrasante.` });
  }

  // Sort by priority and return all
  return awards.sort((a,b) => a.priority - b.priority);
}
