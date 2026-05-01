(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __moduleCache = /* @__PURE__ */ new WeakMap;
  var __toCommonJS = (from) => {
    var entry = __moduleCache.get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function")
      __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
        get: () => from[key],
        enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
      }));
    __moduleCache.set(from, entry);
    return entry;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: (newValue) => all[name] = () => newValue
      });
  };

  // app.ts
  var exports_app = {};
  __export(exports_app, {
    initMuse: () => initMuse
  });
  var MEDIA = [
    { id: "m1", title: "Le Voyage de Chihiro", type: "movie", year: 2001, creator: "Hayao Miyazaki", pitch: "Une jeune fille s'égare dans un établissement de bains pour esprits et part à la recherche d'elle-même.", moods: ["emouvant", "mysterieux", "contemplatif"], themes: ["croissance", "magie", "identite"], engagement: 2, intensity: 2, duration: "2h 5m", goodFor: ["famille"], rating: 8.6 },
    { id: "m2", title: "Parasite", type: "movie", year: 2019, creator: "Bong Joon-ho", pitch: "Une famille pauvre s'immisce dans une maison riche jusqu'à ce que tout dérape.", moods: ["tendu", "sombre", "absurde"], themes: ["politique", "famille", "crime"], engagement: 3, intensity: 4, duration: "2h 12m", goodFor: ["soiree cine"], rating: 8.5 },
    { id: "m3", title: "Past Lives", type: "movie", year: 2023, creator: "Celine Song", pitch: "Deux amis d'enfance se retrouvent des decennies plus tard a New York.", moods: ["melancolique", "romantique", "contemplatif"], themes: ["amour", "identite"], engagement: 1, intensity: 2, duration: "1h 45m", goodFor: ["soiree calme"], rating: 7.9 },
    { id: "m4", title: "Mad Max: Fury Road", type: "movie", year: 2015, creator: "George Miller", pitch: "Deux heures de chaos en effets pratiques a travers un desert.", moods: ["epique", "energetique", "tendu"], themes: ["survie", "guerre"], engagement: 3, intensity: 5, duration: "2h", goodFor: ["adrenaline"], rating: 8.1 },
    { id: "m5", title: "Paddington 2", type: "movie", year: 2017, pitch: "Un ours poli se bat pour blanchir son nom. De la pure gentillesse.", moods: ["emouvant", "ludique", "inspirant"], themes: ["famille", "amitie"], engagement: 2, intensity: 1, duration: "1h 43m", goodFor: ["jours de pluie"], rating: 7.8 },
    { id: "m6", title: "Premier Contact", type: "movie", year: 2016, creator: "Denis Villeneuve", pitch: "Une linguiste etablit un premier contact et repense le temps lui-meme.", moods: ["cerebral", "melancolique", "mysterieux"], themes: ["tech", "decouverte", "amour"], engagement: 2, intensity: 3, duration: "1h 56m", goodFor: ["penseurs"], rating: 7.9 },
    { id: "m7", title: "Everything Everywhere All At Once", type: "movie", year: 2022, pitch: "La proprietaire d'une blanchisserie sauve le multivers. Oui, vraiment.", moods: ["absurde", "epique", "inspirant"], themes: ["famille", "identite"], engagement: 3, intensity: 4, duration: "2h 19m", goodFor: ["gouts audacieux"], rating: 8 },
    { id: "m8", title: "Before Sunrise", type: "movie", year: 1995, pitch: "Deux etrangers discutent a travers Vienne pendant une nuit.", moods: ["romantique", "contemplatif", "nostalgique"], themes: ["amour", "decouverte"], engagement: 1, intensity: 1, duration: "1h 41m", goodFor: ["soiree solo"], rating: 8.1 },
    { id: "m9", title: "The Grand Budapest Hotel", type: "movie", year: 2014, creator: "Wes Anderson", pitch: "Un concierge, un lobby boy, un tableau vole — parfaitement compose.", moods: ["ludique", "absurde", "nostalgique"], themes: ["amitie", "art"], engagement: 2, intensity: 2, duration: "1h 39m", goodFor: ["esthetes"], rating: 8.1 },
    { id: "m10", title: "Heredite", type: "movie", year: 2018, pitch: "Le deuil se transforme en quelque chose de bien pire.", moods: ["sombre", "tendu", "mysterieux"], themes: ["famille"], engagement: 2, intensity: 5, duration: "2h 7m", goodFor: ["fans d'horreur"], rating: 7.3 },
    { id: "m11", title: "La La Land", type: "movie", year: 2016, pitch: "Deux reveurs a LA, de la musique, et une fin amere.", moods: ["romantique", "melancolique", "inspirant"], themes: ["amour", "art"], engagement: 2, intensity: 2, duration: "2h 8m", goodFor: ["soiree en amoureux"], rating: 8 },
    { id: "m12", title: "Dune: Deuxieme Partie", type: "movie", year: 2024, pitch: "Sable, prophetie et vers geants — a l'echelle maximale.", moods: ["epique", "tendu", "mysterieux"], themes: ["guerre", "politique"], engagement: 3, intensity: 4, duration: "2h 46m", goodFor: ["grand ecran"], rating: 8.5 },
    { id: "m13", title: "Inception", type: "movie", year: 2010, creator: "Christopher Nolan", pitch: "Un voleur qui s'approprie des secrets par le biais des rêves reçoit une mission inverse.", moods: ["cerebral", "tendu", "epique"], themes: ["identite", "tech"], engagement: 3, intensity: 4, duration: "2h 28m", goodFor: ["réflexion"], rating: 8.8 },
    { id: "m14", title: "Interstellar", type: "movie", year: 2014, creator: "Christopher Nolan", pitch: "Des explorateurs voyagent à travers un trou de ver pour sauver l'humanité.", moods: ["epique", "emouvant", "contemplatif"], themes: ["decouverte", "famille"], engagement: 3, intensity: 4, duration: "2h 49m", goodFor: ["grand spectacle"], rating: 8.7 },
    { id: "m15", title: "The Dark Knight", type: "movie", year: 2008, creator: "Christopher Nolan", pitch: "Batman affronte le Joker dans un Gotham sombrant dans le chaos.", moods: ["sombre", "tendu", "epique"], themes: ["justice", "crime"], engagement: 3, intensity: 4, duration: "2h 32m", goodFor: ["fans d'action"], rating: 9.0 },
    { id: "m16", title: "Pulp Fiction", type: "movie", year: 1994, creator: "Quentin Tarantino", pitch: "Les vies de plusieurs criminels s'entremêlent dans un Los Angeles violent et absurde.", moods: ["absurde", "tendu", "ludique"], themes: ["crime", "identite"], engagement: 2, intensity: 4, duration: "2h 34m", goodFor: ["cinéphiles"], rating: 8.9 },
    { id: "m17", title: "Fight Club", type: "movie", year: 1999, creator: "David Fincher", pitch: "Un homme désabusé et un fabriquant de savon créent un club de combat souterrain.", moods: ["sombre", "absurde", "tendu"], themes: ["identite", "politique"], engagement: 3, intensity: 4, duration: "2h 19m", goodFor: ["réflexion"], rating: 8.8 },
    { id: "m18", title: "Matrix", type: "movie", year: 1999, creator: "Les Wachowski", pitch: "Un programmeur découvre que sa réalité n'est qu'une simulation informatique.", moods: ["cerebral", "epique", "tendu"], themes: ["tech", "identite"], engagement: 3, intensity: 4, duration: "2h 16m", goodFor: ["fans de SF"], rating: 8.7 },
    { id: "m19", title: "Les Évadés", type: "movie", year: 1994, pitch: "Un banquier condamné pour meurtre trouve l'espoir dans une prison impitoyable.", moods: ["emouvant", "inspirant", "contemplatif"], themes: ["amitie", "justice"], engagement: 2, intensity: 2, duration: "2h 22m", goodFor: ["soirée classique"], rating: 9.3 },
    { id: "m20", title: "Forrest Gump", type: "movie", year: 1994, pitch: "Un homme simple traverse l'histoire des États-Unis à travers son innocence.", moods: ["emouvant", "inspirant", "nostalgique"], themes: ["histoire", "amour"], engagement: 2, intensity: 2, duration: "2h 22m", goodFor: ["famille"], rating: 8.8 },
    { id: "m21", title: "Blade Runner 2049", type: "movie", year: 2017, creator: "Denis Villeneuve", pitch: "Un nouveau Blade Runner découvre un secret enterré qui pourrait changer le monde.", moods: ["contemplatif", "mysterieux", "sombre"], themes: ["tech", "identite"], engagement: 2, intensity: 3, duration: "2h 44m", goodFor: ["visuels"], rating: 8.0 },
    { id: "m22", title: "Joker", type: "movie", year: 2019, pitch: "La descente d'un humoriste raté dans la folie et le chaos criminel.", moods: ["sombre", "tendu", "melancholique"], themes: ["identite", "politique"], engagement: 2, intensity: 4, duration: "2h 2m", goodFor: ["ambiance pesante"], rating: 8.4 },
    { id: "m23", title: "Whiplash", type: "movie", year: 2014, pitch: "Un jeune batteur de jazz est poussé à ses limites par un professeur impitoyable.", moods: ["tendu", "energetique", "sombre"], themes: ["art", "croissance"], engagement: 3, intensity: 5, duration: "1h 46m", goodFor: ["adrénaline"], rating: 8.5 },
    { id: "m24", title: "Moonlight", type: "movie", year: 2016, pitch: "La vie d'un jeune homme noir en trois étapes, explorant son identité et sa sexualité.", moods: ["emouvant", "melancholique", "contemplatif"], themes: ["identite", "amour"], engagement: 1, intensity: 3, duration: "1h 51m", goodFor: ["cinéma d'auteur"], rating: 7.4 },
    { id: "m25", title: "The Social Network", type: "movie", year: 2010, pitch: "L'ascension fulgurante de Mark Zuckerberg et la création de Facebook.", moods: ["cerebral", "tendu", "energetique"], themes: ["tech", "amitie"], engagement: 2, intensity: 3, duration: "2h", goodFor: ["analystes"], rating: 7.8 },
    { id: "m26", title: "Get Out", type: "movie", year: 2017, pitch: "Un jeune homme noir découvre un secret terrifiant en rendant visite à la famille de sa petite amie.", moods: ["tendu", "mysterieux", "sombre"], themes: ["politique", "identite"], engagement: 3, intensity: 4, duration: "1h 44m", goodFor: ["frissons"], rating: 7.8 },
    { id: "m27", title: "Her", type: "movie", year: 2013, pitch: "Un homme tombe amoureux d'une intelligence artificielle avancée.", moods: ["romantique", "melancholique", "contemplatif"], themes: ["tech", "amour"], engagement: 1, intensity: 2, duration: "2h 6m", goodFor: ["nostalgie future"], rating: 8.0 },
    { id: "m28", title: "Ex Machina", type: "movie", year: 2014, pitch: "Un jeune codeur teste une IA humanoïde dans une retraite isolée.", moods: ["cerebral", "tendu", "mysterieux"], themes: ["tech", "identite"], engagement: 2, intensity: 3, duration: "1h 48m", goodFor: ["réflexion"], rating: 7.7 },
    { id: "m29", title: "Vice-Versa", type: "movie", year: 2015, pitch: "Les émotions d'une jeune fille tentent de la guider à travers un déménagement difficile.", moods: ["emouvant", "ludique", "inspirant"], themes: ["croissance", "famille"], engagement: 2, intensity: 2, duration: "1h 35m", goodFor: ["famille"], rating: 8.1 },
    { id: "m30", title: "Toy Story", type: "movie", year: 1995, pitch: "Les jouets d'un petit garçon prennent vie lorsqu'il n'est pas là.", moods: ["ludique", "inspirant", "emouvant"], themes: ["amitie", "famille"], engagement: 2, intensity: 2, duration: "1h 21m", goodFor: ["nostalgie"], rating: 8.3 },
    { id: "m31", title: "Spider-Man: New Generation", type: "movie", year: 2018, pitch: "Plusieurs Spider-People de différentes dimensions doivent s'unir pour sauver New York.", moods: ["energetique", "ludique", "epique"], themes: ["identite", "famille"], engagement: 3, intensity: 4, duration: "1h 57m", goodFor: ["visuels"], rating: 8.4 },
    { id: "m32", title: "Le Loup de Wall Street", type: "movie", year: 2013, pitch: "L'ascension et la chute d'un courtier en bourse corrompu à New York.", moods: ["absurde", "energetique", "ludique"], themes: ["crime", "politique"], engagement: 3, intensity: 4, duration: "3h", goodFor: ["soirée fun"], rating: 8.2 },
    { id: "m33", title: "Eternal Sunshine of the Spotless Mind", type: "movie", year: 2004, pitch: "Un couple tente d'effacer les souvenirs de leur relation passée.", moods: ["melancholique", "romantique", "cerebral"], themes: ["amour", "identite"], engagement: 2, intensity: 3, duration: "1h 48m", goodFor: ["cœur brisé"], rating: 8.3 },
    { id: "m34", title: "Princesse Mononoké", type: "movie", year: 1997, pitch: "Un prince s'implique dans une lutte entre les dieux de la forêt et les humains.", moods: ["epique", "mysterieux", "sombre"], themes: ["nature", "guerre"], engagement: 3, intensity: 4, duration: "2h 14m", goodFor: ["aventure"], rating: 8.4 },
    { id: "m35", title: "Le Château Ambulant", type: "movie", year: 2004, pitch: "Une jeune femme maudite trouve refuge dans le château mouvant d'un sorcier.", moods: ["ludique", "emouvant", "romantique"], themes: ["magie", "amour"], engagement: 2, intensity: 2, duration: "1h 59m", goodFor: ["évasion"], rating: 8.2 },
    { id: "m36", title: "Mon Voisin Totoro", type: "movie", year: 1988, pitch: "Deux sœurs se lient d'amitié avec des esprits de la forêt dans le Japon rural.", moods: ["cosy", "ludique", "emouvant"], themes: ["famille", "nature"], engagement: 1, intensity: 1, duration: "1h 26m", goodFor: ["réconfort"], rating: 8.1 },
    { id: "m37", title: "Le Tombeau des Lucioles", type: "movie", year: 1988, pitch: "Deux enfants luttent pour survivre au Japon pendant la Seconde Guerre mondiale.", moods: ["emouvant", "sombre", "melancholique"], themes: ["guerre", "famille"], engagement: 1, intensity: 5, duration: "1h 29m", goodFor: ["pleurer"], rating: 8.5 },
    { id: "m38", title: "Le Labyrinthe de Pan", type: "movie", year: 2006, pitch: "Une jeune fille s'échappe dans un monde fantastique sombre pendant la guerre civile espagnole.", moods: ["sombre", "mysterieux", "epique"], themes: ["magie", "histoire"], engagement: 2, intensity: 4, duration: "1h 58m", goodFor: ["fantastique"], rating: 8.2 },
    { id: "m39", title: "Old Boy", type: "movie", year: 2003, pitch: "Un homme cherche à se venger après avoir été emprisonné pendant 15 ans sans explication.", moods: ["sombre", "tendu", "absurde"], themes: ["crime", "identite"], engagement: 3, intensity: 5, duration: "2h", goodFor: ["choc"], rating: 8.4 },
    { id: "m40", title: "Mademoiselle", type: "movie", year: 2016, pitch: "Une servante est engagée par un escroc pour aider à séduire une riche héritière japonaise.", moods: ["mysterieux", "romantique", "tendu"], themes: ["crime", "identite"], engagement: 2, intensity: 3, duration: "2h 25m", goodFor: ["intrigue"], rating: 8.1 },
    { id: "m41", title: "Memories of Murder", type: "movie", year: 2003, pitch: "Deux détectives tentent de résoudre le premier meurtre en série de l'histoire de la Corée du Sud.", moods: ["sombre", "mysterieux", "tendu"], themes: ["crime", "histoire"], engagement: 2, intensity: 4, duration: "2h 11m", goodFor: ["polar"], rating: 8.1 },
    { id: "m42", title: "Portrait de la jeune fille en feu", type: "movie", year: 2019, pitch: "Une peintre tombe amoureuse de la femme dont elle doit faire le portrait de mariage.", moods: ["romantique", "melancholique", "contemplatif"], themes: ["amour", "art"], engagement: 1, intensity: 2, duration: "2h", goodFor: ["beauté"], rating: 8.1 },
    { id: "m43", title: "Le Fabuleux Destin d'Amélie Poulain", type: "movie", year: 2001, pitch: "Une jeune femme timide décide de changer la vie des gens autour d'elle à Montmartre.", moods: ["ludique", "romantique", "cosy"], themes: ["amour", "identite"], engagement: 1, intensity: 1, duration: "2h 2m", goodFor: ["bonne humeur"], rating: 8.3 },
    { id: "m44", title: "Intouchables", type: "movie", year: 2011, pitch: "Un aristocrate devenu tétraplégique engage un jeune de banlieue pour s'occuper de lui.", moods: ["emouvant", "inspirant", "ludique"], themes: ["amitie", "famille"], engagement: 2, intensity: 1, duration: "1h 52m", goodFor: ["réconfort"], rating: 8.5 },
    { id: "m45", title: "Léon", type: "movie", year: 1994, pitch: "Un tueur à gages prend sous son aile une jeune fille dont la famille a été massacrée.", moods: ["sombre", "emouvant", "tendu"], themes: ["crime", "amitie"], engagement: 2, intensity: 4, duration: "1h 50m", goodFor: ["classique"], rating: 8.5 },
    { id: "m46", title: "Le Cinquième Élément", type: "movie", year: 1997, pitch: "Un chauffeur de taxi devient responsable du sort du monde dans un futur coloré.", moods: ["ludique", "epique", "absurde"], themes: ["decouverte", "amour"], engagement: 3, intensity: 3, duration: "2h 6m", goodFor: ["fun"], rating: 7.6 },
    { id: "m47", title: "Amadeus", type: "movie", year: 1984, pitch: "L'histoire de la rivalité supposée entre Mozart et Salieri à Vienne.", moods: ["epique", "melancholique", "inspirant"], themes: ["art", "histoire"], engagement: 2, intensity: 3, duration: "2h 40m", goodFor: ["musique"], rating: 8.4 },
    { id: "m48", title: "2001 : L'Odyssée de l'espace", type: "movie", year: 1968, pitch: "Une mission vers Jupiter confrontée à une IA défaillante et à l'évolution humaine.", moods: ["contemplatif", "mysterieux", "cerebral"], themes: ["tech", "decouverte"], engagement: 1, intensity: 2, duration: "2h 29m", goodFor: ["expérience"], rating: 8.3 },
    { id: "m49", title: "Seven", type: "movie", year: 1995, pitch: "Deux détectives traquent un tueur en série qui utilise les sept péchés capitaux.", moods: ["sombre", "tendu", "mysterieux"], themes: ["crime", "justice"], engagement: 3, intensity: 5, duration: "2h 7m", goodFor: ["frissons"], rating: 8.6 },
    { id: "m50", title: "Gran Torino", type: "movie", year: 2008, pitch: "Un vétéran bougon se lie d'amitié avec ses voisins immigrés.", moods: ["emouvant", "sombre", "inspirant"], themes: ["amitie", "croissance"], engagement: 2, intensity: 3, duration: "1h 56m", goodFor: ["leçon de vie"], rating: 8.1 },

    { id: "s1", title: "Fleabag", type: "series", year: 2016, creator: "Phoebe Waller-Bridge", pitch: "Une femme brise le quatrieme mur et votre coeur en 12 episodes.", moods: ["sombre", "ludique", "melancholique"], themes: ["identite", "famille", "amour"], engagement: 2, intensity: 3, duration: "12 × 25m", goodFor: ["binge"], rating: 8.7 },
    { id: "s2", title: "The Bear", type: "series", year: 2022, pitch: "Un chef herite du restaurant de sandwichs chaotique de sa famille a Chicago.", moods: ["tendu", "energetique", "melancholique"], themes: ["famille", "art"], engagement: 3, intensity: 4, duration: "episodes 30m", goodFor: ["amateurs de cuisine"], rating: 8.6 },
    { id: "s3", title: "Severance", type: "series", year: 2022, pitch: "Des employes de bureau divisent leur conscience entre travail et maison.", moods: ["mysterieux", "cerebral", "tendu"], themes: ["tech", "identite"], engagement: 3, intensity: 3, duration: "episodes 1h", goodFor: ["fans d'enigmes"], rating: 8.7 },
    { id: "s4", title: "Ted Lasso", type: "series", year: 2020, pitch: "Un entraineur americain optimiste dirige une equipe de foot britannique.", moods: ["emouvant", "inspirant", "ludique"], themes: ["amitie", "famille"], engagement: 2, intensity: 2, duration: "episodes 30m", goodFor: ["semaines difficiles"], rating: 8.8 },
    { id: "s5", title: "Chernobyl", type: "series", year: 2019, pitch: "Une reconstruction meticuleuse et devastatrice du desastre de 1986.", moods: ["sombre", "tendu", "contemplatif"], themes: ["histoire", "politique", "survie"], engagement: 2, intensity: 5, duration: "5 × 1h", goodFor: ["passionnes d'histoire"], rating: 9.4 },
    { id: "s6", title: "Schitt's Creek", type: "series", year: 2015, pitch: "Une famille riche perd tout et vit dans un motel.", moods: ["emouvant", "ludique", "inspirant"], themes: ["famille", "amitie"], engagement: 2, intensity: 1, duration: "episodes 22m", goodFor: ["confort"], rating: 8.5 },
    { id: "s7", title: "True Detective S1", type: "series", year: 2014, pitch: "Deux detectives de Louisiane, une affaire, dix-sept ans.", moods: ["sombre", "mysterieux", "contemplatif"], themes: ["crime", "identite"], engagement: 3, intensity: 4, duration: "8 × 1h", goodFor: ["amateurs de noir"], rating: 8.9 },
    { id: "s8", title: "The Kingdom of Dreams", type: "series", year: 2013, pitch: "Un regard tranquille a l'interieur du studio de Miyazaki.", moods: ["contemplatif", "nostalgique", "emouvant"], themes: ["art"], engagement: 1, intensity: 1, duration: "2h", goodFor: ["apres-midis calmes"], rating: 8 },
    { id: "s9", title: "Mr. Robot", type: "series", year: 2015, pitch: "Un hacker avec un trouble de l'identite s'attaque a une megacorp.", moods: ["sombre", "tendu", "cerebral"], themes: ["tech", "politique", "identite"], engagement: 3, intensity: 4, duration: "episodes 45m", goodFor: ["curieux de tech"], rating: 8.5 },
    { id: "s10", title: "Heartstopper", type: "series", year: 2022, pitch: "Deux garcons tombent amoureux dans une ecole britannique. Doux et lumineux.", moods: ["emouvant", "romantique", "inspirant"], themes: ["amour", "croissance", "identite"], engagement: 1, intensity: 1, duration: "episodes 30m", goodFor: ["nuits douces"], rating: 8.2 },
    { id: "s11", title: "Breaking Bad", type: "series", year: 2008, pitch: "Un professeur de chimie atteint d'un cancer commence à fabriquer de la méthamphétamine.", moods: ["sombre", "tendu", "epique"], themes: ["crime", "famille"], engagement: 3, intensity: 5, duration: "5 saisons", goodFor: ["classique"], rating: 9.5 },
    { id: "s12", title: "Better Call Saul", type: "series", year: 2015, pitch: "La transformation d'un avocat raté en l'avocat véreux de Breaking Bad.", moods: ["sombre", "absurde", "melancholique"], themes: ["crime", "identite"], engagement: 2, intensity: 3, duration: "6 saisons", goodFor: ["écriture fine"], rating: 8.9 },
    { id: "s13", title: "The Wire", type: "series", year: 2002, pitch: "Un regard réaliste sur le trafic de drogue à Baltimore à travers les yeux des flics et des dealers.", moods: ["sombre", "cerebral", "contemplatif"], themes: ["crime", "politique"], engagement: 3, intensity: 4, duration: "5 saisons", goodFor: ["réalisme"], rating: 9.3 },
    { id: "s14", title: "The Sopranos", type: "series", year: 1999, pitch: "Un parrain de la mafia du New Jersey tente de concilier sa vie de famille et son empire criminel.", moods: ["sombre", "absurde", "emouvant"], themes: ["famille", "crime"], engagement: 2, intensity: 4, duration: "6 saisons", goodFor: ["chef d'œuvre"], rating: 9.2 },
    { id: "s15", title: "Mad Men", type: "series", year: 2007, pitch: "La vie d'une agence de publicité à New York dans les années 60.", moods: ["contemplatif", "melancholique", "nostalgique"], themes: ["identite", "histoire"], engagement: 2, intensity: 2, duration: "7 saisons", goodFor: ["ambiance"], rating: 8.7 },
    { id: "s16", title: "Succession", type: "series", year: 2018, pitch: "Les luttes de pouvoir au sein d'une famille richissime à la tête d'un empire médiatique.", moods: ["absurde", "tendu", "sombre"], themes: ["famille", "politique"], engagement: 3, intensity: 4, duration: "4 saisons", goodFor: ["satire"], rating: 8.9 },
    { id: "s17", title: "Barry", type: "series", year: 2018, pitch: "Un tueur à gages décide de devenir acteur à Los Angeles.", moods: ["absurde", "sombre", "tendu"], themes: ["art", "identite"], engagement: 2, intensity: 4, duration: "4 saisons", goodFor: ["humour noir"], rating: 8.8 },
    { id: "s18", title: "Atlanta", type: "series", year: 2016, pitch: "Deux cousins tentent de percer dans la scène rap d'Atlanta.", moods: ["absurde", "melancholique", "contemplatif"], themes: ["art", "identite"], engagement: 2, intensity: 2, duration: "4 saisons", goodFor: ["surréalisme"], rating: 8.6 },
    { id: "s19", title: "BoJack Horseman", type: "series", year: 2014, pitch: "Un cheval star de télé déchu lutte contre la dépression à Hollywood.", moods: ["melancholique", "absurde", "emouvant"], themes: ["identite", "art"], engagement: 2, intensity: 3, duration: "6 saisons", goodFor: ["introspection"], rating: 8.8 },
    { id: "s20", title: "Rick and Morty", type: "series", year: 2013, pitch: "Les aventures interdimensionnelles d'un savant fou et de son petit-fils.", moods: ["absurde", "energetique", "cerebral"], themes: ["tech", "decouverte"], engagement: 3, intensity: 4, duration: "7 saisons", goodFor: ["fun"], rating: 9.1 },
    { id: "s21", title: "Stranger Things", type: "series", year: 2016, pitch: "Des enfants affrontent des forces surnaturelles dans les années 80.", moods: ["mysterieux", "nostalgique", "epique"], themes: ["amitie", "famille"], engagement: 3, intensity: 3, duration: "4 saisons", goodFor: ["aventure"], rating: 8.7 },
    { id: "s22", title: "The Crown", type: "series", year: 2016, pitch: "La vie de la reine Elizabeth II au fil des décennies.", moods: ["contemplatif", "melancholique", "epique"], themes: ["histoire", "politique"], engagement: 2, intensity: 2, duration: "6 saisons", goodFor: ["biographie"], rating: 8.6 },
    { id: "s23", title: "Black Mirror", type: "series", year: 2011, pitch: "Des histoires indépendantes explorant les dérives de la technologie.", moods: ["sombre", "tendu", "cerebral"], themes: ["tech", "politique"], engagement: 2, intensity: 4, duration: "6 saisons", goodFor: ["réflexion"], rating: 8.7 },
    { id: "s24", title: "The Last of Us", type: "series", year: 2023, pitch: "Un survivant escorte une jeune fille à travers un monde dévasté par un champignon.", moods: ["emouvant", "sombre", "tendu"], themes: ["survie", "famille"], engagement: 3, intensity: 4, duration: "1 saison", goodFor: ["émotion"], rating: 8.8 },
    { id: "s25", title: "Dark", type: "series", year: 2017, pitch: "Des disparitions d'enfants révèlent des secrets de voyage dans le temps sur trois générations.", moods: ["mysterieux", "cerebral", "sombre"], themes: ["identite", "famille"], engagement: 3, intensity: 4, duration: "3 saisons", goodFor: ["casse-tête"], rating: 8.7 },
    { id: "s26", title: "The White Lotus", type: "series", year: 2021, pitch: "Les vacances chaotiques de clients riches dans un hôtel de luxe.", moods: ["absurde", "tendu", "ludique"], themes: ["politique", "identite"], engagement: 2, intensity: 3, duration: "2 saisons", goodFor: ["critique sociale"], rating: 7.9 },
    { id: "s27", title: "Beef", type: "series", year: 2023, pitch: "Une altercation sur un parking dégénère en une vengeance obsessionnelle.", moods: ["absurde", "tendu", "energetique"], themes: ["identite", "famille"], engagement: 3, intensity: 4, duration: "1 saison", goodFor: ["tension"], rating: 8.0 },
    { id: "s28", title: "I May Destroy You", type: "series", year: 2020, pitch: "Une jeune femme tente de reconstruire sa vie après une agression sexuelle.", moods: ["sombre", "melancholique", "emouvant"], themes: ["identite", "amour"], engagement: 2, intensity: 4, duration: "1 saison", goodFor: ["choc"], rating: 8.1 },
    { id: "s29", title: "Blue Eye Samurai", type: "series", year: 2023, pitch: "Une guerrière métisse cherche à se venger dans le Japon d'Edo.", moods: ["epique", "sombre", "tendu"], themes: ["guerre", "identite"], engagement: 3, intensity: 4, duration: "1 saison", goodFor: ["animation"], rating: 8.7 },
    { id: "s30", title: "Arcane", type: "series", year: 2021, pitch: "L'origine de deux champions emblématiques de League of Legends sur fond de guerre civile.", moods: ["epique", "emouvant", "sombre"], themes: ["famille", "politique"], engagement: 3, intensity: 4, duration: "1 saison", goodFor: ["visuels"], rating: 9.0 },
    { id: "s31", title: "Cowboy Bebop", type: "series", year: 1998, pitch: "Des chasseurs de primes voyagent dans l'espace sur fond de jazz.", moods: ["nostalgique", "melancholique", "epique"], themes: ["decouverte", "art"], engagement: 2, intensity: 3, duration: "26 épisodes", goodFor: ["culte"], rating: 8.9 },
    { id: "s32", title: "Neon Genesis Evangelion", type: "series", year: 1995, pitch: "Des adolescents pilotent des robots géants pour sauver l'humanité, mais sombrent dans la dépression.", moods: ["sombre", "cerebral", "mysterieux"], themes: ["identite", "religion"], engagement: 3, intensity: 4, duration: "26 épisodes", goodFor: ["philosophie"], rating: 8.5 },
    { id: "s33", title: "Fullmetal Alchemist: Brotherhood", type: "series", year: 2009, pitch: "Deux frères utilisent l'alchimie pour tenter de retrouver leurs corps.", moods: ["epique", "emouvant", "inspirant"], themes: ["famille", "magie"], engagement: 3, intensity: 3, duration: "64 épisodes", goodFor: ["aventure"], rating: 9.1 },
    { id: "s34", title: "L'Attaque des Titans", type: "series", year: 2013, pitch: "L'humanité lutte contre des géants mangeurs d'hommes derrière des murs.", moods: ["epique", "sombre", "tendu"], themes: ["guerre", "politique"], engagement: 3, intensity: 5, duration: "4 saisons", goodFor: ["intensité"], rating: 9.1 },
    { id: "s35", title: "Vinland Saga", type: "series", year: 2019, pitch: "Un jeune viking cherche la vengeance avant de découvrir le sens de la paix.", moods: ["epique", "melancholique", "contemplatif"], themes: ["guerre", "croissance"], engagement: 3, intensity: 4, duration: "2 saisons", goodFor: ["historique"], rating: 8.8 },
    { id: "s36", title: "Pluto", type: "series", year: 2023, pitch: "Un détective robot enquête sur une série de meurtres de robots et d'humains.", moods: ["cerebral", "mysterieux", "emouvant"], themes: ["tech", "identite"], engagement: 3, intensity: 3, duration: "8 épisodes", goodFor: ["mystère"], rating: 8.2 },
    { id: "s37", title: "The Boys", type: "series", year: 2019, pitch: "Un groupe de justiciers s'attaque à des super-héros corrompus qui abusent de leurs pouvoirs.", moods: ["absurde", "sombre", "energetique"], themes: ["politique", "crime"], engagement: 3, intensity: 4, duration: "3 saisons", goodFor: ["anti-héros"], rating: 8.7 },
    { id: "s38", title: "Invincible", type: "series", year: 2021, pitch: "Le fils du plus grand super-héros du monde découvre la vérité sur son père.", moods: ["epique", "sombre", "emouvant"], themes: ["famille", "identite"], engagement: 3, intensity: 4, duration: "2 saisons", goodFor: ["animation adulte"], rating: 8.7 },
    { id: "s39", title: "Peaky Blinders", type: "series", year: 2013, pitch: "Un gang familial règne sur Birmingham après la Première Guerre mondiale.", moods: ["sombre", "tendu", "epique"], themes: ["crime", "histoire"], engagement: 2, intensity: 4, duration: "6 saisons", goodFor: ["classe"], rating: 8.8 },
    { id: "s40", title: "Sherlock", type: "series", year: 2010, pitch: "Le détective légendaire résout des crimes dans le Londres moderne.", moods: ["cerebral", "mysterieux", "ludique"], themes: ["crime", "amitie"], engagement: 3, intensity: 3, duration: "4 saisons", goodFor: ["génial"], rating: 9.1 },
    { id: "s41", title: "Mindhunter", type: "series", year: 2017, pitch: "Deux agents du FBI interrogent des tueurs en série pour comprendre leur psychologie.", moods: ["sombre", "tendu", "cerebral"], themes: ["crime", "histoire"], engagement: 2, intensity: 3, duration: "2 saisons", goodFor: ["psychologie"], rating: 8.6 },
    { id: "s42", title: "Narcos", type: "series", year: 2015, pitch: "L'histoire vraie de la montée en puissance des cartels de la drogue en Colombie.", moods: ["sombre", "tendu", "epique"], themes: ["crime", "politique"], engagement: 2, intensity: 4, duration: "3 saisons", goodFor: ["historique"], rating: 8.8 },
    { id: "s43", title: "Le Jeu de la Dame", type: "series", year: 2020, pitch: "Une orpheline devient un prodige des échecs tout en luttant contre ses addictions.", moods: ["emouvant", "inspirant", "melancholique"], themes: ["croissance", "identite"], engagement: 2, intensity: 2, duration: "7 épisodes", goodFor: ["esthétique"], rating: 8.6 },
    { id: "s44", title: "Squid Game", type: "series", year: 2021, pitch: "Des personnes endettées participent à des jeux d'enfants mortels pour une grosse somme d'argent.", moods: ["sombre", "tendu", "absurde"], themes: ["survie", "politique"], engagement: 3, intensity: 5, duration: "1 saison", goodFor: ["suspense"], rating: 8.0 },
    { id: "s45", title: "The Expanse", type: "series", year: 2015, pitch: "Une conspiration menace l'équilibre fragile entre la Terre, Mars et la Ceinture d'astéroïdes.", moods: ["epique", "mysterieux", "tendu"], themes: ["tech", "politique"], engagement: 3, intensity: 3, duration: "6 saisons", goodFor: ["hard SF"], rating: 8.5 },
    { id: "s46", title: "Firefly", type: "series", year: 2002, pitch: "L'équipage d'un petit vaisseau spatial tente de survivre en marge de la société.", moods: ["ludique", "epique", "nostalgique"], themes: ["amitie", "decouverte"], engagement: 2, intensity: 2, duration: "14 épisodes", goodFor: ["culte"], rating: 9.0 },
    { id: "s47", title: "Battlestar Galactica", type: "series", year: 2004, pitch: "Les derniers survivants de l'humanité fuient une race de robots cherchant à les exterminer.", moods: ["epique", "sombre", "tendu"], themes: ["survie", "politique"], engagement: 3, intensity: 4, duration: "4 saisons", goodFor: ["épopée"], rating: 8.7 },
    { id: "s48", title: "Twin Peaks", type: "series", year: 1990, pitch: "Un agent du FBI enquête sur le meurtre d'une jeune fille dans une ville étrange.", moods: ["mysterieux", "absurde", "sombre"], themes: ["crime", "magie"], engagement: 2, intensity: 3, duration: "3 saisons", goodFor: ["étrangeté"], rating: 8.8 },
    { id: "s49", title: "The Good Place", type: "series", year: 2016, pitch: "Une femme arrive accidentellement au 'Bon Endroit' après sa mort.", moods: ["ludique", "absurde", "cerebral"], themes: ["identite", "croissance"], engagement: 2, intensity: 2, duration: "4 saisons", goodFor: ["humour"], rating: 8.2 },
    { id: "s50", title: "The Boys", type: "series", year: 2019, pitch: "Un groupe de justiciers s'en prend à des super-héros corrompus qui abusent de leurs pouvoirs.", moods: ["absurde", "energetique", "sombre"], themes: ["politique", "crime"], engagement: 3, intensity: 4, duration: "3 saisons", goodFor: ["action"], rating: 8.7 },

    { id: "mu1", title: "Nights", type: "music", year: 2016, creator: "Frank Ocean", pitch: "Une chanson en deux parties qui change tout en son milieu.", moods: ["melancolique", "contemplatif", "nostalgique"], themes: ["amour", "identite"], engagement: 1, intensity: 2, duration: "5m 07s", goodFor: ["casque"], rating: 9.4 },
    { id: "mu2", title: "Get Lucky", type: "music", year: 2013, creator: "Daft Punk feat. Pharrell", pitch: "Le disco ressuscite. Un pur plaisir rythmique.", moods: ["inspirant", "ludique", "energetique"], themes: ["art"], engagement: 2, intensity: 2, duration: "4m 09s", goodFor: ["bonne humeur"], rating: 8.9 },
    { id: "mu3", title: "Alright", type: "music", year: 2015, creator: "Kendrick Lamar", pitch: "Un hymne de survie defiant et teinte de gospel.", moods: ["cerebral", "epique", "inspirant"], themes: ["politique", "identite"], engagement: 2, intensity: 4, duration: "3m 39s", goodFor: ["ecoute profonde"], rating: 9.2 },
    { id: "mu4", title: "Skinny Love", type: "music", year: 2008, creator: "Bon Iver", pitch: "Un plaidoyer brise enregistre dans une cabane en hiver.", moods: ["melancolique", "contemplatif", "cosy"], themes: ["amour", "nature"], engagement: 1, intensity: 3, duration: "3m 58s", goodFor: ["jours de pluie"], rating: 9 },
    { id: "mu5", title: "The Less I Know the Better", type: "music", year: 2015, creator: "Tame Impala", pitch: "Une ligne de basse qui vous hantera pendant des annees.", moods: ["nostalgique", "ludique", "melancolique"], themes: ["amour"], engagement: 2, intensity: 2, duration: "3m 36s", goodFor: ["conduite"], rating: 8.8 },
    { id: "mu6", title: "Bags", type: "music", year: 2019, creator: "Clairo", pitch: "Les papillons timides d'une confession imminente.", moods: ["cosy", "romantique", "nostalgique"], themes: ["amour", "croissance"], engagement: 1, intensity: 1, duration: "4m 27s", goodFor: ["matins"], rating: 8.2 },
    { id: "mu7", title: "360", type: "music", year: 2024, creator: "Charli XCX", pitch: "Club-pop stroboscopique avec un clin d'oeil et un rictus.", moods: ["energetique", "ludique", "tendu"], themes: ["identite", "art"], engagement: 3, intensity: 3, duration: "2m 13s", goodFor: ["avant-soiree"], rating: 8.4 },
    { id: "mu8", title: "Weird Fishes / Arpeggi", type: "music", year: 2007, creator: "Radiohead", pitch: "Des guitares entrelacees qui montent comme la maree.", moods: ["melancolique", "contemplatif", "epique"], themes: ["amour"], engagement: 2, intensity: 3, duration: "5m 18s", goodFor: ["casque"], rating: 9.1 },
    { id: "mu9", title: "Dreams", type: "music", year: 1977, creator: "Fleetwood Mac", pitch: "Stevie Nicks, un coeur brise, et ce groove de batterie parfait.", moods: ["nostalgique", "melancolique", "inspirant"], themes: ["amour"], engagement: 1, intensity: 2, duration: "4m 17s", goodFor: ["tout le monde"], rating: 9.3 },
    { id: "mu10", title: "One More Time", type: "music", year: 2000, creator: "Daft Punk", pitch: "Un cri vocode vers le dancefloor qui ne vieillit jamais.", moods: ["energetique", "ludique", "inspirant"], themes: ["art"], engagement: 2, intensity: 2, duration: "5m 20s", goodFor: ["toute humeur"], rating: 9 },
    { id: "mu11", title: "Motion Sickness", type: "music", year: 2017, creator: "Phoebe Bridgers", pitch: "Une chanson de rupture qui avance au lieu de stagner.", moods: ["melancolique", "energetique", "tendu"], themes: ["amour", "identite"], engagement: 2, intensity: 3, duration: "4m 03s", goodFor: ["marche"], rating: 8.7 },
    { id: "mu12", title: "Redbone", type: "music", year: 2016, creator: "Childish Gambino", pitch: "Soul lente en falsetto. Restez eveille.", moods: ["romantique", "mysterieux", "nostalgique"], themes: ["amour"], engagement: 1, intensity: 2, duration: "5m 27s", goodFor: ["tard le soir"], rating: 8.9 },
    { id: "mu13", title: "Blinding Lights", type: "music", year: 2020, creator: "The Weeknd", pitch: "Un hymne synth-pop irrésistible sur les lumières de la ville.", moods: ["energetique", "nostalgique", "ludique"], themes: ["amour"], engagement: 2, intensity: 3, duration: "3m 20s", goodFor: ["conduite de nuit"], rating: 9.2 },
    { id: "mu14", title: "Stay", type: "music", year: 2021, creator: "The Kid LAROI & Justin Bieber", pitch: "Un morceau pop-rock frénétique sur le besoin de l'autre.", moods: ["energetique", "tendu", "romantique"], themes: ["amour"], engagement: 2, intensity: 4, duration: "2m 21s", goodFor: ["radio"], rating: 8.5 },
    { id: "mu15", title: "Bad Guy", type: "music", year: 2019, creator: "Billie Eilish", pitch: "Un morceau sombre et minimaliste qui a redéfini la pop moderne.", moods: ["sombre", "ludique", "mysterieux"], themes: ["identite"], engagement: 1, intensity: 3, duration: "3m 14s", goodFor: ["casque"], rating: 8.9 },
    { id: "mu16", title: "Levitating", type: "music", year: 2020, creator: "Dua Lipa", pitch: "Un pur concentré de disco-pop joyeux et spatial.", moods: ["inspirant", "ludique", "energetique"], themes: ["amour"], engagement: 2, intensity: 2, duration: "3m 23s", goodFor: ["fête"], rating: 8.8 },
    { id: "mu17", title: "Montero", type: "music", year: 2021, creator: "Lil Nas X", pitch: "Une célébration audacieuse de l'identité sur un rythme flamenco-pop.", moods: ["ludique", "energetique", "mysterieux"], themes: ["identite", "amour"], engagement: 2, intensity: 3, duration: "2m 17s", goodFor: ["danse"], rating: 8.7 },
    { id: "mu18", title: "Drivers License", type: "music", year: 2021, creator: "Olivia Rodrigo", pitch: "Une ballade déchirante sur le premier chagrin d'amour.", moods: ["melancolique", "emouvant", "nostalgique"], themes: ["amour"], engagement: 1, intensity: 2, duration: "4m 02s", goodFor: ["pleurer dans sa voiture"], rating: 8.6 },
    { id: "mu19", title: "Good 4 U", type: "music", year: 2021, creator: "Olivia Rodrigo", pitch: "Un hymne pop-punk plein de colère sardonique.", moods: ["energetique", "tendu", "ludique"], themes: ["amour"], engagement: 2, intensity: 4, duration: "2m 58s", goodFor: ["défoulement"], rating: 8.7 },
    { id: "mu20", title: "Heat Waves", type: "music", year: 2020, creator: "Glass Animals", pitch: "Une mélodie psychédélique-pop sur la nostalgie et les amours perdues.", moods: ["nostalgique", "melancolique", "contemplatif"], themes: ["amour"], engagement: 1, intensity: 2, duration: "3m 58s", goodFor: ["été"], rating: 8.8 },
    { id: "mu21", title: "As It Was", type: "music", year: 2022, creator: "Harry Styles", pitch: "Une chanson joyeuse en apparence qui cache une réflexion sur le changement.", moods: ["nostalgique", "ludique", "melancolique"], themes: ["croissance", "identite"], engagement: 1, intensity: 2, duration: "2m 47s", goodFor: ["marche matinale"], rating: 9.1 },
    { id: "mu22", title: "Flowers", type: "music", year: 2023, creator: "Miley Cyrus", pitch: "Un hymne à l'indépendance et à l'amour de soi.", moods: ["inspirant", "cosy", "nostalgique"], themes: ["identite", "amour"], engagement: 2, intensity: 2, duration: "3m 20s", goodFor: ["reconstruction"], rating: 8.9 },
    { id: "mu23", title: "Kill Bill", type: "music", year: 2022, creator: "SZA", pitch: "Une confession honnête et sombre sur la jalousie post-rupture.", moods: ["sombre", "melancholique", "tendu"], themes: ["amour"], engagement: 1, intensity: 3, duration: "2m 33s", goodFor: ["soirée solo"], rating: 9.0 },
    { id: "mu24", title: "Vampire", type: "music", year: 2023, creator: "Olivia Rodrigo", pitch: "Une ballade gothique-pop sur l'exploitation émotionnelle.", moods: ["tendu", "epique", "sombre"], themes: ["amour"], engagement: 2, intensity: 4, duration: "3m 39s", goodFor: ["catharsis"], rating: 8.8 },
    { id: "mu25", title: "Paint The Town Red", type: "music", year: 2023, creator: "Doja Cat", pitch: "Un morceau de rap décontracté qui échantillonne Dionne Warwick.", moods: ["ludique", "energetique", "absurde"], themes: ["identite"], engagement: 3, intensity: 2, duration: "3m 50s", goodFor: ["attitude"], rating: 8.4 },
    { id: "mu26", title: "Cruel Summer", type: "music", year: 2019, creator: "Taylor Swift", pitch: "Un banger pop sur l'angoisse d'un amour d'été secret.", moods: ["energetique", "epique", "nostalgique"], themes: ["amour"], engagement: 2, intensity: 4, duration: "2m 58s", goodFor: ["chanter fort"], rating: 9.0 },
    { id: "mu27", title: "Anti-Hero", type: "music", year: 2022, creator: "Taylor Swift", pitch: "Une exploration lucide et pleine d'autodérision des insécurités.", moods: ["absurde", "melancolique", "cerebral"], themes: ["identite"], engagement: 2, intensity: 2, duration: "3m 20s", goodFor: ["introspection"], rating: 8.8 },
    { id: "mu28", title: "Seven", type: "music", year: 2023, creator: "Jungkook feat. Latto", pitch: "Un morceau UK garage fluide sur l'amour quotidien.", moods: ["ludique", "energetique", "romantique"], themes: ["amour"], engagement: 2, intensity: 2, duration: "3m 04s", goodFor: ["playlist été"], rating: 8.5 },
    { id: "mu29", title: "Super Shy", type: "music", year: 2023, creator: "NewJeans", pitch: "Une pop légère et rafraîchissante sur la timidité amoureuse.", moods: ["ludique", "cosy", "inspirant"], themes: ["amour"], engagement: 1, intensity: 1, duration: "2m 34s", goodFor: ["matin"], rating: 8.7 },
    { id: "mu30", title: "Ditto", type: "music", year: 2022, creator: "NewJeans", pitch: "Un morceau mélancolique et nostalgique au rythme garage.", moods: ["melancolique", "nostalgique", "contemplatif"], themes: ["amitie", "amour"], engagement: 1, intensity: 2, duration: "3m 06s", goodFor: ["jours gris"], rating: 9.0 },
    { id: "mu31", title: "Hype Boy", type: "music", year: 2022, creator: "NewJeans", pitch: "Un hymne R&B-pop addictif sur l'attirance.", moods: ["energetique", "ludique", "inspirant"], themes: ["amour"], engagement: 2, intensity: 2, duration: "2m 59s", goodFor: ["danse"], rating: 8.9 },
    { id: "mu32", title: "Starboy", type: "music", year: 2016, creator: "The Weeknd feat. Daft Punk", pitch: "Un morceau dark-pop sur la célébrité et l'excès.", moods: ["sombre", "energetique", "mysterieux"], themes: ["identite"], engagement: 3, intensity: 3, duration: "3m 50s", goodFor: ["nuit"], rating: 9.1 },
    { id: "mu33", title: "Save Your Tears", type: "music", year: 2020, creator: "The Weeknd", pitch: "Une pop nostalgique inspirée des années 80 sur le regret.", moods: ["nostalgique", "melancolique", "ludique"], themes: ["amour"], engagement: 1, intensity: 2, duration: "3m 35s", goodFor: ["soirée"], rating: 9.0 },
    { id: "mu34", title: "Die For You", type: "music", year: 2016, creator: "The Weeknd", pitch: "Une ballade R&B intense sur le dévouement absolu.", moods: ["romantique", "emouvant", "sombre"], themes: ["amour"], engagement: 1, intensity: 3, duration: "4m 20s", goodFor: ["intimité"], rating: 9.1 },
    { id: "mu35", title: "Creepin'", type: "music", year: 2022, creator: "Metro Boomin, The Weeknd & 21 Savage", pitch: "Une reprise atmosphérique d'un classique R&B des années 2000.", moods: ["sombre", "melancolique", "tendu"], themes: ["amour"], engagement: 2, intensity: 3, duration: "3m 41s", goodFor: ["ambiance"], rating: 8.8 },
    { id: "mu36", title: "Sunflower", type: "music", year: 2018, creator: "Post Malone & Swae Lee", pitch: "Le morceau phare de Spider-Verse, doux et mélodique.", moods: ["ludique", "cosy", "inspirant"], themes: ["amour", "famille"], engagement: 1, intensity: 1, duration: "2m 38s", goodFor: ["détente"], rating: 9.2 },
    { id: "mu37", title: "Circles", type: "music", year: 2019, creator: "Post Malone", pitch: "Une chanson pop-rock mélancolique sur les cycles relationnels.", moods: ["melancolique", "nostalgique", "contemplatif"], themes: ["amour"], engagement: 1, intensity: 2, duration: "3m 35s", goodFor: ["conduite"], rating: 9.1 },
    { id: "mu38", title: "Better Now", type: "music", year: 2018, creator: "Post Malone", pitch: "Un morceau énergique sur le regret post-rupture.", moods: ["energetique", "melancolique", "tendu"], themes: ["amour"], engagement: 2, intensity: 3, duration: "3m 51s", goodFor: ["radio"], rating: 8.8 },
    { id: "mu39", title: "Starway to Heaven", type: "music", year: 1971, creator: "Led Zeppelin", pitch: "Une épopée rock qui monte crescendo vers la légende.", moods: ["epique", "mysterieux", "contemplatif"], themes: ["art", "decouverte"], engagement: 2, intensity: 4, duration: "8m 02s", goodFor: ["écoute profonde"], rating: 9.6 },
    { id: "mu40", title: "Bohemian Rhapsody", type: "music", year: 1975, creator: "Queen", pitch: "Une suite d'opéra-rock qui défie toutes les règles.", moods: ["epique", "absurde", "emouvant"], themes: ["identite", "art"], engagement: 3, intensity: 4, duration: "5m 55s", goodFor: ["culte"], rating: 9.7 },
    { id: "mu41", title: "Imagine", type: "music", year: 1971, creator: "John Lennon", pitch: "Un hymne universel à la paix et à l'unité.", moods: ["emouvant", "inspirant", "contemplatif"], themes: ["politique", "amour"], engagement: 1, intensity: 1, duration: "3m 03s", goodFor: ["espoir"], rating: 9.5 },
    { id: "mu42", title: "Like a Rolling Stone", type: "music", year: 1965, creator: "Bob Dylan", pitch: "Six minutes qui ont changé l'histoire de la musique populaire.", moods: ["cerebral", "energetique", "nostalgique"], themes: ["politique", "identite"], engagement: 2, intensity: 3, duration: "6m 13s", goodFor: ["révolution"], rating: 9.4 },
    { id: "mu43", title: "Smells Like Teen Spirit", type: "music", year: 1991, creator: "Nirvana", pitch: "L'hymne de la génération X qui a lancé l'ère du grunge.", moods: ["energetique", "sombre", "tendu"], themes: ["identite"], engagement: 3, intensity: 5, duration: "5m 01s", goodFor: ["défoulement"], rating: 9.5 },
    { id: "mu44", title: "Billie Jean", type: "music", year: 1982, creator: "Michael Jackson", pitch: "La ligne de basse la plus reconnaissable de l'histoire.", moods: ["energetique", "ludique", "mysterieux"], themes: ["amour", "art"], engagement: 3, intensity: 3, duration: "4m 54s", goodFor: ["danse"], rating: 9.6 },
    { id: "mu45", title: "Lose Yourself", type: "music", year: 2002, creator: "Eminem", pitch: "Un morceau de rap intense sur la saisie des opportunités.", moods: ["inspirant", "tendu", "epique"], themes: ["identite", "art"], engagement: 2, intensity: 4, duration: "5m 26s", goodFor: ["motivation"], rating: 9.4 },
    { id: "mu46", title: "Hurt", type: "music", year: 2002, creator: "Johnny Cash", pitch: "Une reprise dévastatrice qui semble être une confession finale.", moods: ["sombre", "melancholique", "emouvant"], themes: ["identite", "histoire"], engagement: 1, intensity: 4, duration: "3m 38s", goodFor: ["pleurer"], rating: 9.5 },
    { id: "mu47", title: "Rolling in the Deep", type: "music", year: 2010, creator: "Adele", pitch: "Un morceau de soul moderne sur une rupture amère.", moods: ["epique", "emouvant", "tendu"], themes: ["amour"], engagement: 2, intensity: 4, duration: "3m 48s", goodFor: ["puissance"], rating: 9.3 },
    { id: "mu48", title: "Space Oddity", type: "music", year: 1969, creator: "David Bowie", pitch: "L'histoire de Major Tom perdu dans l'espace.", moods: ["mysterieux", "melancholique", "epique"], themes: ["decouverte", "identite"], engagement: 1, intensity: 2, duration: "5m 18s", goodFor: ["évasion"], rating: 9.4 },
    { id: "mu49", title: "Purple Rain", type: "music", year: 1984, creator: "Prince", pitch: "Une ballade rock-soul monumentale avec un solo légendaire.", moods: ["epique", "emouvant", "nostalgique"], themes: ["amour", "art"], engagement: 2, intensity: 3, duration: "8m 41s", goodFor: ["finale"], rating: 9.5 },
    { id: "mu50", title: "A Day in the Life", type: "music", year: 1967, creator: "The Beatles", pitch: "La conclusion épique de Sgt. Pepper, un chef-d'œuvre expérimental.", moods: ["cerebral", "mysterieux", "epique"], themes: ["art", "histoire"], engagement: 2, intensity: 3, duration: "5m 33s", goodFor: ["immersion"], rating: 9.8 },

    { id: "v1", title: "Stardew Valley", type: "videogame", year: 2016, pitch: "Heritez d'une ferme. Plantez. Devenez amis. Oubliez le temps.", moods: ["cosy", "emouvant", "contemplatif"], themes: ["nature", "amitie"], engagement: 4, intensity: 1, duration: "100+ heures", goodFor: ["detente"], rating: 8.9 },
    { id: "v2", title: "Hades", type: "videogame", year: 2020, pitch: "Echappez de l'enfer, mourez, recommencez — avec des dialogues ciseles.", moods: ["energetique", "ludique", "epique"], themes: ["famille", "magie"], engagement: 4, intensity: 3, duration: "30h", goodFor: ["courtes sessions"], rating: 9.3 },
    { id: "v3", title: "Disco Elysium", type: "videogame", year: 2019, pitch: "Un detective amnesique et ivre se dispute avec lui-meme.", moods: ["cerebral", "sombre", "absurde"], themes: ["politique", "identite", "crime"], engagement: 4, intensity: 4, duration: "40h", goodFor: ["lecteurs"], rating: 9.4 },
    { id: "v4", title: "Outer Wilds", type: "videogame", year: 2019, pitch: "Une boucle temporelle de 22 minutes. Un systeme solaire a comprendre.", moods: ["mysterieux", "contemplatif", "melancolique"], themes: ["decouverte", "nature"], engagement: 4, intensity: 2, duration: "20h", goodFor: ["explorateurs"], rating: 9.5 },
    { id: "v5", title: "Elden Ring", type: "videogame", year: 2022, pitch: "Un monde ouvert qui veut votre mort, magnifiquement.", moods: ["epique", "tendu", "mysterieux"], themes: ["survie", "magie", "guerre"], engagement: 5, intensity: 4, duration: "80h", goodFor: ["joueurs patients"], rating: 9.5 },
    { id: "v6", title: "Animal Crossing: New Horizons", type: "videogame", year: 2020, pitch: "Une ile deserte qui devient un petit village parfait.", moods: ["cosy", "emouvant", "ludique"], themes: ["nature", "amitie"], engagement: 4, intensity: 1, duration: "infini", goodFor: ["rituel quotidien"], rating: 8.4 },
    { id: "v7", title: "Celeste", type: "videogame", year: 2018, pitch: "Grimpez une montagne. Grimpez en vous-meme. Dur et bienveillant.", moods: ["inspirant", "tendu", "melancolique"], themes: ["identite", "croissance"], engagement: 4, intensity: 3, duration: "10h", goodFor: ["un week-end"], rating: 9.1 },
    { id: "v8", title: "Red Dead Redemption 2", type: "videogame", year: 2018, pitch: "Un western lent sur un gang a la fin d'une ere.", moods: ["melancolique", "epique", "contemplatif"], themes: ["histoire", "amitie"], engagement: 4, intensity: 4, duration: "60h", goodFor: ["longues soirees"], rating: 9.3 },
    { id: "v9", title: "Slay the Spire", type: "videogame", year: 2019, pitch: "Construisez un deck, montez la tour, perdez, recommencez.", moods: ["cerebral", "ludique"], themes: ["decouverte"], engagement: 5, intensity: 2, duration: "infini", goodFor: ["trajets"], rating: 9 },
    { id: "v10", title: "Journey", type: "videogame", year: 2012, pitch: "Deux heures de beaute sans mots a travers le desert et les ruines.", moods: ["contemplatif", "inspirant", "mysterieux"], themes: ["decouverte", "amitie"], engagement: 3, intensity: 2, duration: "2h", goodFor: ["non-joueurs"], rating: 8.9 },
    { id: "v11", title: "Baldur's Gate 3", type: "videogame", year: 2023, pitch: "Une aventure RPG massive dans l'univers de Donjons & Dragons.", moods: ["epique", "mysterieux", "cerebral"], themes: ["magie", "amitie", "politique"], engagement: 5, intensity: 3, duration: "100h+", goodFor: ["longues aventures"], rating: 9.6 },
    { id: "v12", title: "Cyberpunk 2077", type: "videogame", year: 2020, pitch: "Devenez un mercenaire dans une métropole futuriste obsédée par le pouvoir.", moods: ["sombre", "tendu", "energetique"], themes: ["tech", "identite", "crime"], engagement: 4, intensity: 4, duration: "50h", goodFor: ["immersion"], rating: 8.5 },
    { id: "v13", title: "The Witcher 3: Wild Hunt", type: "videogame", year: 2015, pitch: "Un chasseur de monstres cherche sa fille adoptive dans un monde déchiré.", moods: ["epique", "melancholique", "sombre"], themes: ["magie", "famille", "guerre"], engagement: 5, intensity: 3, duration: "70h+", goodFor: ["fans de fantasy"], rating: 9.5 },
    { id: "v14", title: "God of War Ragnarök", type: "videogame", year: 2022, pitch: "Kratos et son fils affrontent la fin du monde dans la mythologie nordique.", moods: ["epique", "emouvant", "tendu"], themes: ["famille", "guerre", "croissance"], engagement: 4, intensity: 4, duration: "40h", goodFor: ["action cinématographique"], rating: 9.4 },
    { id: "v15", title: "Spider-Man 2", type: "videogame", year: 2023, pitch: "Deux Spider-Men s'unissent pour protéger New York contre de nouveaux vilains.", moods: ["energetique", "inspirant", "ludique"], themes: ["amitie", "famille"], engagement: 3, intensity: 3, duration: "25h", goodFor: ["fans de Marvel"], rating: 9.0 },
    { id: "v16", title: "Alan Wake 2", type: "videogame", year: 2023, pitch: "Un écrivain et une agente du FBI luttent contre une horreur surnaturelle.", moods: ["mysterieux", "sombre", "tendu"], themes: ["art", "crime"], engagement: 4, intensity: 4, duration: "25h", goodFor: ["soirée frisson"], rating: 8.9 },
    { id: "v17", title: "Resident Evil 4 Remake", type: "videogame", year: 2023, pitch: "Un agent spécial sauve la fille du président d'un culte terrifiant en Espagne.", moods: ["tendu", "sombre", "energetique"], themes: ["survie", "crime"], engagement: 3, intensity: 5, duration: "20h", goodFor: ["adrénaline"], rating: 9.1 },
    { id: "v18", title: "Street Fighter 6", type: "videogame", year: 2023, pitch: "La nouvelle référence du jeu de combat avec un mode histoire complet.", moods: ["energetique", "ludique", "inspirant"], themes: ["identite", "art"], engagement: 4, intensity: 4, duration: "infini", goodFor: ["compétition"], rating: 8.8 },
    { id: "v19", title: "Hi-Fi RUSH", type: "videogame", year: 2023, pitch: "Un jeu d'action en rythme où tout le monde bouge en mesure.", moods: ["energetique", "ludique", "inspirant"], themes: ["art", "amitie"], engagement: 3, intensity: 3, duration: "12h", goodFor: ["bonne humeur"], rating: 8.9 },
    { id: "v20", title: "Dave the Diver", type: "videogame", year: 2023, pitch: "Plongez le jour, gérez un bar à sushis la nuit.", moods: ["cosy", "ludique", "absurde"], themes: ["nature", "decouverte"], engagement: 4, intensity: 2, duration: "30h", goodFor: ["détente"], rating: 8.9 },
    { id: "v21", title: "Sea of Stars", type: "videogame", year: 2023, pitch: "Un RPG au tour par tour inspiré des classiques des années 90.", moods: ["nostalgique", "ludique", "inspirant"], themes: ["magie", "amitie"], engagement: 3, intensity: 2, duration: "30h", goodFor: ["nostalgie"], rating: 8.7 },
    { id: "v22", title: "Cocoon", type: "videogame", year: 2023, pitch: "Un jeu de puzzle fascinant où vous voyagez à l'intérieur de mondes portables.", moods: ["cerebral", "mysterieux", "contemplatif"], themes: ["decouverte"], engagement: 4, intensity: 2, duration: "6h", goodFor: ["réflexion"], rating: 8.8 },
    { id: "v23", title: "Dredge", type: "videogame", year: 2023, pitch: "Un jeu de pêche relaxant... jusqu'à ce que la nuit tombe.", moods: ["mysterieux", "sombre", "cosy"], themes: ["nature", "decouverte"], engagement: 4, intensity: 3, duration: "15h", goodFor: ["ambiance"], rating: 8.4 },
    { id: "v24", title: "Viewfinder", type: "videogame", year: 2023, pitch: "Utilisez des photos pour remodeler le monde qui vous entoure.", moods: ["cerebral", "absurde", "inspirant"], themes: ["art", "decouverte"], engagement: 3, intensity: 1, duration: "5h", goodFor: ["surréalisme"], rating: 8.2 },
    { id: "v25", title: "Jusant", type: "videogame", year: 2023, pitch: "Grimpez une tour monumentale à votre propre rythme.", moods: ["contemplatif", "melancholique", "mysterieux"], themes: ["nature", "croissance"], engagement: 4, intensity: 2, duration: "5h", goodFor: ["calme"], rating: 8.1 },
    { id: "v26", title: "Tunic", type: "videogame", year: 2022, pitch: "Un petit renard explore un monde rempli de secrets et de puzzles anciens.", moods: ["mysterieux", "nostalgique", "ludique"], themes: ["decouverte", "magie"], engagement: 4, intensity: 3, duration: "15h", goodFor: ["explorateurs"], rating: 8.5 },
    { id: "v27", title: "Ghost of Tsushima", type: "videogame", year: 2020, pitch: "Un samouraï doit choisir entre son code d'honneur et la survie de son île.", moods: ["epique", "melancholique", "contemplatif"], themes: ["guerre", "histoire", "identite"], engagement: 4, intensity: 3, duration: "40h", goodFor: ["beauté"], rating: 9.0 },
    { id: "v28", title: "Hollow Knight", type: "videogame", year: 2017, pitch: "Explorez un vaste royaume d'insectes en ruines dans ce jeu exigeant.", moods: ["sombre", "melancholique", "mysterieux"], themes: ["decouverte", "nature"], engagement: 5, intensity: 4, duration: "40h+", goodFor: ["joueurs acharnés"], rating: 9.1 },
    { id: "v29", title: "Ori and the Will of the Wisps", type: "videogame", year: 2020, pitch: "Une aventure de plateforme d'une beauté époustouflante et émouvante.", moods: ["emouvant", "epique", "inspirant"], themes: ["nature", "famille"], engagement: 4, intensity: 3, duration: "15h", goodFor: ["visuels"], rating: 9.2 },
    { id: "v30", title: "Cuphead", type: "videogame", year: 2017, pitch: "Un jeu d'action au style des dessins animés des années 30, incroyablement difficile.", moods: ["absurde", "energetique", "ludique"], themes: ["art"], engagement: 4, intensity: 5, duration: "10h", goodFor: ["challenge"], rating: 8.8 },

    { id: "b1", title: "Wingspan", type: "boardgame", year: 2019, pitch: "Un jeu de gestion serein sur l'attraction d'oiseaux dans vos reserves.", moods: ["cosy", "contemplatif", "emouvant"], themes: ["nature"], engagement: 4, intensity: 2, duration: "60-90m", goodFor: ["1-5 joueurs"], rating: 8.1 },
    { id: "b2", title: "Codenames", type: "boardgame", year: 2015, pitch: "Donnez des indices d'un mot a votre equipe. Evitez l'assassin.", moods: ["ludique", "tendu"], themes: ["amitie"], engagement: 5, intensity: 2, duration: "15m", goodFor: ["fetes"], rating: 7.6 },
    { id: "b3", title: "Gloomhaven: Les Mâchoires du Lion", type: "boardgame", year: 2020, pitch: "Un jeu tactique d'exploration de donjon avec une vraie campagne.", moods: ["epique", "cerebral", "tendu"], themes: ["magie", "guerre", "amitie"], engagement: 5, intensity: 4, duration: "90m", goodFor: ["1-4 joueurs"], rating: 8.5 },
    { id: "b4", title: "Patchwork", type: "boardgame", year: 2014, pitch: "Deux joueurs assemblent une couverture. Doucement impitoyable.", moods: ["cosy", "cerebral"], themes: ["art"], engagement: 4, intensity: 2, duration: "30m", goodFor: ["couples"], rating: 7.7 },
    { id: "b5", title: "Spirit Island", type: "boardgame", year: 2017, pitch: "Cooperez en tant qu'esprits defendant une ile contre des colonisateurs.", moods: ["epique", "cerebral", "tendu"], themes: ["politique", "nature", "magie"], engagement: 5, intensity: 4, duration: "90-120m", goodFor: ["1-4 joueurs"], rating: 8.4 },
    { id: "b6", title: "Just One", type: "boardgame", year: 2018, pitch: "Jeu d'ambiance cooperatif. Ecrivez un indice. Pas de doublons.", moods: ["ludique", "emouvant", "inspirant"], themes: ["amitie"], engagement: 5, intensity: 1, duration: "20m", goodFor: ["tous ages"], rating: 7.7 },
    { id: "b7", title: "Brass: Birmingham", type: "boardgame", year: 2018, pitch: "Strategie economique lourde a travers la revolution industrielle.", moods: ["cerebral", "tendu"], themes: ["histoire", "politique"], engagement: 5, intensity: 5, duration: "2-3h", goodFor: ["joueurs serieux"], rating: 8.7 },
    { id: "b8", title: "Pandemic", type: "boardgame", year: 2008, pitch: "Cooperez pour arreter quatre maladies avant qu'elles ne consument le monde.", moods: ["tendu", "cerebral"], themes: ["survie"], engagement: 5, intensity: 3, duration: "45m", goodFor: ["2-4 joueurs"], rating: 7.6 },
    { id: "b9", title: "Azul", type: "boardgame", year: 2017, pitch: "Recuperez des tuiles pour decorer un palais portugais. Magnifiques pieces.", moods: ["cosy", "ludique", "contemplatif"], themes: ["art"], engagement: 4, intensity: 2, duration: "30-45m", goodFor: ["2-4 joueurs"], rating: 7.8 },
    { id: "b10", title: "Dixit", type: "boardgame", year: 2008, pitch: "Narration avec des cartes illustrees surrealistes.", moods: ["ludique", "absurde", "contemplatif"], themes: ["art"], engagement: 5, intensity: 1, duration: "30m", goodFor: ["3-8 joueurs"], rating: 7.6 },
    { id: "b11", title: "7 Wonders Duel", type: "boardgame", year: 2015, pitch: "Le meilleur jeu de stratégie exclusivement pour deux joueurs.", moods: ["tendu", "cerebral"], themes: ["histoire", "politique"], engagement: 5, intensity: 3, duration: "30m", goodFor: ["couples"], rating: 8.1 },
    { id: "b12", title: "Terraforming Mars", type: "boardgame", year: 2016, pitch: "Colonisez la planète rouge en gérant vos ressources et vos projets.", moods: ["epique", "cerebral", "contemplatif"], themes: ["tech", "politique", "nature"], engagement: 5, intensity: 4, duration: "2-3h", goodFor: ["joueurs experts"], rating: 8.4 },
    { id: "b13", title: "Scythe", type: "boardgame", year: 2016, pitch: "Développez votre faction dans une Europe alternative des années 1920.", moods: ["epique", "tendu", "contemplatif"], themes: ["histoire", "guerre", "politique"], engagement: 5, intensity: 4, duration: "2h", goodFor: ["fans de stratégie"], rating: 8.2 },
    { id: "b14", title: "Root", type: "boardgame", year: 2018, pitch: "Une guerre asymétrique pour le contrôle de la forêt entre oiseaux et chats.", moods: ["tendu", "ludique", "epique"], themes: ["guerre", "nature", "politique"], engagement: 5, intensity: 4, duration: "90m", goodFor: ["groupes réguliers"], rating: 8.1 },
    { id: "b15", title: "Everdell", type: "boardgame", year: 2018, pitch: "Construisez une cité pour les animaux de la forêt sous l'arbre éternel.", moods: ["cosy", "contemplatif", "ludique"], themes: ["nature", "art"], engagement: 4, intensity: 2, duration: "60-90m", goodFor: ["visuels"], rating: 8.0 },
    { id: "b16", title: "The Crew", type: "boardgame", year: 2019, pitch: "Un jeu de plis coopératif où vous devez communiquer sans parler.", moods: ["tendu", "cerebral", "inspirant"], themes: ["decouverte", "amitie"], engagement: 5, intensity: 3, duration: "20m", goodFor: ["famille"], rating: 7.9 },
    { id: "b17", title: "Cascadia", type: "boardgame", year: 2021, pitch: "Créez l'écosystème le plus harmonieux dans le Nord-Ouest Pacifique.", moods: ["cosy", "contemplatif", "ludique"], themes: ["nature"], engagement: 4, intensity: 1, duration: "45m", goodFor: ["zen"], rating: 8.0 },
    { id: "b18", title: "Ark Nova", type: "boardgame", year: 2021, pitch: "Gérez un zoo moderne en soutenant des projets de conservation.", moods: ["cerebral", "contemplatif", "epique"], themes: ["nature", "politique"], engagement: 5, intensity: 4, duration: "2-3h", goodFor: ["amateurs de zoo"], rating: 8.5 },
    { id: "b19", title: "Dune: Imperium", type: "boardgame", year: 2020, pitch: "Mélange parfait de deck-building et de placement d'ouvriers sur Arrakis.", moods: ["tendu", "epique", "cerebral"], themes: ["politique", "guerre", "identite"], engagement: 5, intensity: 4, duration: "2h", goodFor: ["fans de Dune"], rating: 8.4 },
    { id: "b20", title: "Les Ruines Perdues de Narak", type: "boardgame", year: 2020, pitch: "Explorez une île mystérieuse et découvrez ses secrets perdus.", moods: ["epique", "mysterieux", "ludique"], themes: ["decouverte", "magie"], engagement: 4, intensity: 3, duration: "90m", goodFor: ["aventure"], rating: 8.1 },
    { id: "b21", title: "Heat: Pedal to the Metal", type: "boardgame", year: 2022, pitch: "Un jeu de course automobile intense et accessible.", moods: ["energetique", "tendu", "ludique"], themes: ["art"], engagement: 5, intensity: 3, duration: "60m", goodFor: ["famille"], rating: 8.2 },
    { id: "b22", title: "Earth", type: "boardgame", year: 2023, pitch: "Construisez votre propre île autonome avec un moteur de cartes massif.", moods: ["contemplatif", "cosy", "cerebral"], themes: ["nature"], engagement: 5, intensity: 2, duration: "60-90m", goodFor: ["amateurs de combos"], rating: 8.1 },
    { id: "b23", title: "Wyrmspan", type: "boardgame", year: 2024, pitch: "Le successeur de Wingspan, mais avec des dragons.", moods: ["cosy", "mysterieux", "ludique"], themes: ["magie", "nature"], engagement: 4, intensity: 2, duration: "90m", goodFor: ["fantasy"], rating: 8.0 },
    { id: "b24", title: "Unmatched", type: "boardgame", year: 2019, pitch: "Faites s'affronter des personnages légendaires sur un plateau.", moods: ["tendu", "epique", "ludique"], themes: ["guerre", "histoire"], engagement: 5, intensity: 3, duration: "20-40m", goodFor: ["duel"], rating: 7.9 },
    { id: "b25", title: "Les Aventuriers du Rail", type: "boardgame", year: 2004, pitch: "Reliez les villes américaines par chemin de fer pour gagner.", moods: ["ludique", "cosy", "nostalgique"], themes: ["histoire", "decouverte"], engagement: 4, intensity: 1, duration: "45m", goodFor: ["famille"], rating: 7.4 },
    { id: "b26", title: "Carcassonne", type: "boardgame", year: 2000, pitch: "Posez des tuiles pour construire une ville médiévale française.", moods: ["cosy", "ludique", "contemplatif"], themes: ["histoire"], engagement: 4, intensity: 2, duration: "35m", goodFor: ["classique"], rating: 7.4 },
    { id: "b27", title: "Catan", type: "boardgame", year: 1995, pitch: "Négociez des ressources pour coloniser l'île de Catan.", moods: ["ludique", "tendu", "nostalgique"], themes: ["identite", "politique"], engagement: 5, intensity: 2, duration: "60-90m", goodFor: ["tout le monde"], rating: 7.1 },
    { id: "b28", title: "Splendor", type: "boardgame", year: 2014, pitch: "Devenez le marchand de pierres précieuses le plus riche de la Renaissance.", moods: ["cerebral", "ludique", "cosy"], themes: ["histoire"], engagement: 5, intensity: 2, duration: "30m", goodFor: ["rapide"], rating: 7.4 },
    { id: "b29", title: "7 Wonders", type: "boardgame", year: 2010, pitch: "Bâtissez votre civilisation à travers trois âges de l'histoire.", moods: ["epique", "cerebral", "ludique"], themes: ["histoire", "politique"], engagement: 5, intensity: 3, duration: "30m", goodFor: ["grands groupes"], rating: 7.7 },
    { id: "b30", title: "Kingdomino", type: "boardgame", year: 2016, pitch: "Un jeu de dominos intelligent pour construire votre royaume.", moods: ["cosy", "ludique", "contemplatif"], themes: ["identite"], engagement: 4, intensity: 1, duration: "15-20m", goodFor: ["enfants"], rating: 7.4 }
  ];

  var ALL_MOODS = ["cosy", "tendu", "inspirant", "melancholique", "ludique", "cerebral", "epique", "romantique", "sombre", "emouvant", "mysterieux", "absurde", "nostalgique", "energetique", "contemplatif"];
  var ALL_THEMES = ["amitie", "survie", "amour", "guerre", "decouverte", "identite", "famille", "nature", "tech", "crime", "magie", "histoire", "croissance", "art", "politique"];
  var TYPE_LABEL = {
    movie: "Film",
    series: "Série",
    music: "Morceau",
    videogame: "Jeu vidéo",
    boardgame: "Jeu de société"
  };
  var TYPE_PLURAL = {
    movie: "Films",
    series: "Séries",
    music: "Morceaux",
    videogame: "Jeux vidéo",
    boardgame: "Jeux de société"
  };
  var TYPE_ICON = {
    movie: "\uD83C\uDFAC",
    series: "\uD83D\uDCFA",
    music: "\uD83C\uDFB5",
    videogame: "\uD83C\uDFAE",
    boardgame: "\uD83C\uDFB2"
  };
  var ALL_TYPES = ["movie", "series", "music", "videogame", "boardgame"];
  function emptyProfile() {
    const m = {};
    ALL_MOODS.forEach((x) => m[x] = 0);
    const t = {};
    ALL_THEMES.forEach((x) => t[x] = 0);
    return {
      moodScores: m,
      themeScores: t,
      typeScores: { movie: 0, series: 0, music: 0, videogame: 0, boardgame: 0 },
      engagementPref: 3,
      intensityPref: 3,
      likedIds: [],
      dislikedIds: [],
      sampleSize: 0
    };
  }
  function buildProfile(interactions) {
    const p = emptyProfile();
    let eSum = 0, iSum = 0, w = 0;
    for (const { itemId, reaction } of interactions) {
      if (reaction === "skip")
        continue;
      const item = MEDIA.find((m) => m.id === itemId);
      if (!item)
        continue;
      const weight = reaction === "like" ? 1 : -0.6;
      item.moods.forEach((m) => p.moodScores[m] += weight);
      item.themes.forEach((t) => p.themeScores[t] += weight);
      p.typeScores[item.type] += weight;
      if (reaction === "like") {
        p.likedIds.push(item.id);
        eSum += item.engagement;
        iSum += item.intensity;
        w += 1;
      } else {
        p.dislikedIds.push(item.id);
      }
      p.sampleSize += 1;
    }
    if (w > 0) {
      p.engagementPref = eSum / w;
      p.intensityPref = iSum / w;
    }
    return p;
  }
  function scoreItem(item, p) {
    let s = 0;
    for (const m of item.moods)
      s += p.moodScores[m] * 1.2;
    for (const t of item.themes)
      s += p.themeScores[t] * 0.8;
    s += p.typeScores[item.type] * 0.4;
    s -= Math.abs(item.engagement - p.engagementPref) * 0.3;
    s -= Math.abs(item.intensity - p.intensityPref) * 0.3;
    if (item.rating)
      s += (item.rating - 7) * 0.15;
    return s;
  }
  function similarity(a, b) {
    const sA = new Set([...a.moods, ...a.themes]);
    const sB = new Set([...b.moods, ...b.themes]);
    let inter = 0;
    sA.forEach((x) => sB.has(x) && inter++);
    const denom = Math.sqrt(sA.size * sB.size) || 1;
    return inter / denom - Math.abs(a.intensity - b.intensity) * 0.05;
  }
  function pickNext(interactions, opts = {}) {
    const seen = new Set(interactions.map((i) => i.itemId));
    const typeFilter = opts.types && opts.types.length > 0 ? new Set(opts.types) : null;
    const profile = buildProfile(interactions);
    const pool = MEDIA.filter((m) => !seen.has(m.id) && (!typeFilter || typeFilter.has(m.type)));
    if (pool.length === 0)
      return null;
    if (profile.sampleSize < 4) {
      const counts = {};
      interactions.forEach((i) => {
        const it = MEDIA.find((m) => m.id === i.itemId);
        if (it)
          counts[it.type] = (counts[it.type] ?? 0) + 1;
      });
      const sorted = [...pool].sort((a, b) => (counts[a.type] ?? 0) - (counts[b.type] ?? 0) + Math.random() * 0.5 - 0.25);
      return sorted[0];
    }
    if (opts.surprise)
      return pool[Math.floor(Math.random() * pool.length)];
    const scored = pool.map((item) => ({ item, score: scoreItem(item, profile) })).sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(6, scored.length));
    const idx = Math.floor(Math.pow(Math.random(), 2) * top.length);
    return top[idx].item;
  }
  function finalRecommendations(interactions, n = 3, opts = {}) {
    const seen = new Set(interactions.map((i) => i.itemId));
    const typeFilter = opts.types && opts.types.length > 0 ? new Set(opts.types) : null;
    const profile = buildProfile(interactions);
    const liked = profile.likedIds.map((id) => MEDIA.find((m) => m.id === id)).filter(Boolean);
    const disliked = profile.dislikedIds.map((id) => MEDIA.find((m) => m.id === id)).filter(Boolean);
    const candidates = MEDIA.filter((m) => !seen.has(m.id) && (!typeFilter || typeFilter.has(m.type))).map((item) => {
      let score = scoreItem(item, profile);
      const sL = liked.length ? liked.reduce((s, l) => s + similarity(item, l), 0) / liked.length : 0;
      score += sL * 4;
      const sD = disliked.length ? disliked.reduce((s, d) => s + similarity(item, d), 0) / disliked.length : 0;
      score -= sD * 3;
      return { item, score };
    }).sort((a, b) => b.score - a.score);
    const picks = [];
    const usedTypes = new Set;
    for (const c of candidates) {
      if (picks.length >= n)
        break;
      if (picks.length < n - 1 && usedTypes.has(c.item.type))
        continue;
      picks.push(c);
      usedTypes.add(c.item.type);
    }
    while (picks.length < n && candidates.length > picks.length)
      picks.push(candidates[picks.length]);
    return picks.map(({ item }) => {
      const similarLiked = liked.map((l) => ({ l, s: similarity(item, l) })).sort((a, b) => b.s - a.s).slice(0, 2).filter(({ s }) => s > 0.1).map(({ l }) => l);
      const reasons = [];
      const topMoods = Object.entries(profile.moodScores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m);
      const shared = item.moods.filter((m) => topMoods.includes(m));
      if (shared.length)
        reasons.push(`Correspond a vos gouts pour des experiences ${shared.join(" & ")}`);
      if (similarLiked.length)
        reasons.push(`Partage une ambiance avec ${similarLiked.map((l) => `"${l.title}"`).join(" et ")}`);
      if (Math.abs(item.intensity - profile.intensityPref) <= 1) {
        const lab = profile.intensityPref < 2.5 ? "plus legere" : profile.intensityPref > 3.5 ? "plus intense" : "equilibree";
        reasons.push(`Correspond a l'intensite ${lab} que vous appreciez`);
      }
      if (Math.abs(item.engagement - profile.engagementPref) <= 1) {
        const lab = profile.engagementPref < 2.5 ? "passive" : profile.engagementPref > 3.5 ? "active" : "moderee";
        reasons.push(`Bon niveau d'engagement (${lab})`);
      }
      if (reasons.length === 0)
        reasons.push("Un choix de qualite pour elargir vos horizons");
      return { item, reasons: reasons.slice(0, 3) };
    });
  }
  var FAV_KEY = "muse.favorites.v1";
  var SESSION_KEY = "muse.session.v1";
  function getFavorites() {
    if (typeof localStorage === "undefined")
      return [];
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
    } catch {
      return [];
    }
  }
  function setFavorites(ids) {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  }
  function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx >= 0) {
      favs.splice(idx, 1);
      setFavorites(favs);
      return false;
    }
    favs.push(id);
    setFavorites(favs);
    return true;
  }
  function isFavorite(id) {
    return getFavorites().includes(id);
  }
  function getSession() {
    if (typeof localStorage === "undefined")
      return { interactions: [], types: [] };
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{"interactions":[],"types":[]}');
    } catch {
      return { interactions: [], types: [] };
    }
  }
  function setSession(s) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }
  function getRoute() {
    const h = location.hash.replace(/^#\/?/, "") || "home";
    if (["home", "focus", "discover", "results", "favorites"].includes(h))
      return h;
    return "home";
  }
  function navigate(route) {
    location.hash = `#/${route === "home" ? "" : route}`;
  }
  var toastTimeout;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    if (toastTimeout)
      clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => el.classList.remove("show"), 2000);
  }
  var esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function header(active) {
    return "";
  }
  function renderCardHTML(item) {
    const moods = item.moods.slice(0, 3).map((m) => `<span class="chip">${m}</span>`).join("");
    return `
    <span class="card-type">${TYPE_LABEL[item.type]}${item.year ? " · " + item.year : ""}</span>
    <h2 class="card-title serif">${esc(item.title)}</h2>
    ${item.creator ? `<div class="card-creator">${esc(item.creator)}</div>` : ""}
    <p class="card-pitch">${esc(item.pitch)}</p>
    <div class="card-bars">
      <div class="bar"><span>Intensite · ${item.intensity}/5</span><div class="bar-track"><span style="width:${item.intensity * 20}%"></span></div></div>
      <div class="bar"><span>Engagement · ${item.engagement}/5</span><div class="bar-track"><span style="width:${item.engagement * 20}%"></span></div></div>
    </div>
    <div class="card-meta">
      <span class="chip">⏱ ${esc(item.duration)}</span>
      ${moods}
    </div>
    <span class="stamp like">Interesse</span>
    <span class="stamp pass">Passer</span>`;
  }
  function renderHome() {
    return `
    ${header("home")}
    <main>
      <section class="hero">
        <div class="hero-inner">
          <span class="tag"><span class="tag-dot"></span>Un moteur de gouts, pas un catalogue</span>
          <h1>Vous ne savez pas quoi <span class="grad serif">regarder, jouer ou ecouter</span> ce soir ?</h1>
          <p>Faites defiler quelques cartes. Muse apprend vos gouts en temps reel et finit par vous proposer <em>trois choix parfaits</em> parmi films, series, musique, jeux video et jeux de societe — avec une raison claire pour chacun.</p>
          <div class="hero-cta">
            <a href="#/focus" class="btn btn-primary">Demarrer une session →</a>
            <a href="#/favorites" class="btn btn-ghost">Vos favoris</a>
          </div>
        </div>
      </section>
      <section class="features">
        <div class="feature">
          <div class="feature-head"><span class="feature-icon">✦</span><span class="feature-num">01</span></div>
          <h3>Faites defiler pour apprendre</h3>
          <p>Droite pour interesse, gauche pour passer, skip si neutre. Les cartes s'adaptent instantanement.</p>
        </div>
        <div class="feature">
          <div class="feature-head"><span class="feature-icon">◇</span><span class="feature-num">02</span></div>
          <h3>Recommandation hybride</h3>
          <p>Vecteurs de contenu plus profil de gout, plus similarite avec ce que vous avez aime.</p>
        </div>
        <div class="feature">
          <div class="feature-head"><span class="feature-icon">⊞</span><span class="feature-num">03</span></div>
          <h3>Tous les formats</h3>
          <p>Un bon jeu peut repondre au meme besoin qu'un film. Muse croise les formats.</p>
        </div>
      </section>
    </main>`;
  }
  function renderFocus() {
    const session = getSession();
    const selected = new Set(session.types && session.types.length ? session.types : ALL_TYPES);
    const chip = (t) => `
    <button class="focus-chip ${selected.has(t) ? "active" : ""}" data-type="${t}">
      <span class="icon">${TYPE_ICON[t]}</span>
      <span class="label">${TYPE_PLURAL[t]}</span>
      <span class="meta">${MEDIA.filter((m) => m.type === t).length} items</span>
    </button>`;
    return `
    ${header("focus")}
    <main>
      <section class="focus container-narrow">
        <h2 class="serif">De quoi avez-vous envie ?</h2>
        <p class="lead">Choisissez un ou plusieurs formats. Vous pourrez changer d'avis lors de la prochaine session.</p>
        <div class="focus-grid" id="focusGrid">
          ${ALL_TYPES.map(chip).join("")}
        </div>
        <div class="focus-actions">
          <button class="btn btn-primary" id="startBtn">Commencer · ${selected.size} format${selected.size === 1 ? "" : "s"}</button>
          <button class="btn btn-ghost btn-sm" id="resetBtn">Reinitialiser la session</button>
        </div>
      </section>
    </main>`;
  }
  function renderDiscover() {
    const session = getSession();
    const types = session.types.length ? session.types : ALL_TYPES;
    const total = MEDIA.filter((m) => types.includes(m.type)).length;
    const profile = buildProfile(session.interactions);
    const topMoods = Object.entries(profile.moodScores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...topMoods.map(([, v]) => v));
    return `
    ${header("focus")}
    <main>
      <section class="discover">
        <div class="discover-main">
          <div class="progress-row">
            <span>${session.interactions.length} / ${Math.min(total, 12)}</span>
            <span>${types.map((t) => TYPE_PLURAL[t]).join(" · ")}</span>
          </div>
          <div class="progress-bar"><span style="width:${Math.min(100, session.interactions.length / 12 * 100)}%"></span></div>
          <div class="stack" id="stack"></div>
          <div class="actions">
            <button class="action-btn pass" id="passBtn" title="Pass">✕</button>
            <button class="action-btn skip" id="skipBtn" title="Skip">↷</button>
            <button class="action-btn like large" id="likeBtn" title="Interested">♥</button>
          </div>
          <div class="session-actions">
            <button class="btn btn-ghost btn-sm" id="surpriseBtn">✨ Surprends-moi</button>
            ${session.interactions.length >= 4 ? `<a href="#/results" class="btn btn-primary btn-sm">Voir les choix →</a>` : ""}
            <button class="btn btn-ghost btn-sm" id="restartBtn">Recommencer</button>
          </div>
        </div>
        <aside class="sidebar">
          <h3>Votre profil</h3>
          ${topMoods.length === 0 ? `<p class="empty">Faites defiler quelques cartes pour voir apparaitre vos gouts ici.</p>` : `<div class="mood-list">${topMoods.map(([m, v]) => `<div class="mood-row"><span class="mood-label">${m}</span><div class="mood-track"><span style="width:${v / max * 100}%"></span></div></div>`).join("")}</div>`}
        </aside>
      </section>
    </main>`;
  }
  function renderResults() {
    const session = getSession();
    const recs = finalRecommendations(session.interactions, 3, { types: session.types });
    return `
    ${header("focus")}
    <main>
      <section class="results">
        <div class="results-head">
          <h1>Trois choix pour votre soiree</h1>
          <p>Base sur ${session.interactions.filter((i) => i.reaction !== "skip").length} reactions dans vos formats selectionnes.</p>
        </div>
        ${recs.map((r, i) => `
          <article class="rec">
            <div class="rec-rank">Pick ${String(i + 1).padStart(2, "0")} · ${TYPE_LABEL[r.item.type]}</div>
            <h2 class="rec-title">${esc(r.item.title)}</h2>
            ${r.item.creator ? `<div class="rec-creator">${esc(r.item.creator)}${r.item.year ? " · " + r.item.year : ""} · ${esc(r.item.duration)}</div>` : `<div class="rec-creator">${r.item.year ?? ""} · ${esc(r.item.duration)}</div>`}
            <p class="rec-pitch">${esc(r.item.pitch)}</p>
            <div class="rec-reasons">
              <h4>Pourquoi ce choix</h4>
              <ul>${r.reasons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            </div>
            <div class="rec-actions">
              <button class="btn btn-ghost btn-sm fav-toggle" data-id="${r.item.id}">${isFavorite(r.item.id) ? "★ Enregistre" : "☆ Enregistrer"}</button>
            </div>
          </article>
        `).join("")}
        <div class="hero-cta" style="margin-top:2rem">
          <a href="#/focus" class="btn btn-primary">Nouvelle session</a>
          <a href="#/favorites" class="btn btn-ghost">Voir les favoris</a>
        </div>
      </section>
    </main>`;
  }
  function renderFavorites() {
    const ids = getFavorites();
    const items = ids.map((id) => MEDIA.find((m) => m.id === id)).filter((x) => Boolean(x));
    return `
    ${header("favorites")}
    <main>
      <section class="container-narrow" style="padding:3rem 1.5rem 5rem">
        <div class="results-head">
          <h1 class="serif">Vos favoris</h1>
          <p>${items.length === 0 ? "Enregistrez des choix lors de vos sessions pour les retrouver ici." : `${items.length} element${items.length === 1 ? "" : "s"} enregistre(s) localement.`}</p>
        </div>
        ${items.length === 0 ? `<div class="empty-state"><span class="serif">Rien pour l'instant</span>Commencez une session et enregistrez ce que vous aimez.</div>` : `<div class="fav-list">${items.map((it) => `
            <article class="fav">
              <button class="remove fav-toggle" data-id="${it.id}">supprimer</button>
              <span class="card-type">${TYPE_LABEL[it.type]}</span>
              <h3>${esc(it.title)}</h3>
              ${it.creator ? `<div class="creator">${esc(it.creator)}${it.year ? " · " + it.year : ""}</div>` : ""}
              <p class="pitch">${esc(it.pitch)}</p>
            </article>`).join("")}</div>`}
      </section>
    </main>`;
  }
  function mountSwipe() {
    const stack = document.getElementById("stack");
    if (!stack)
      return;
    let current = null;
    const session = getSession();
    const showCard = () => {
      const sess = getSession();
      const types = sess.types.length ? sess.types : ALL_TYPES;
      current = pickNext(sess.interactions, { types });
      stack.innerHTML = "";
      if (!current) {
        stack.innerHTML = `<div class="card" style="cursor:default;display:grid;place-items:center;text-align:center;padding:2rem">
        <div>
          <div class="serif" style="font-size:1.5rem;margin-bottom:0.5rem">Vous avez tout vu !</div>
          <p style="color:var(--muted-foreground);margin-bottom:1rem">C'est le moment de decouvrir vos recommandations.</p>
          <a href="#/results" class="btn btn-primary btn-sm">Voir les choix →</a>
        </div>
      </div>`;
        return;
      }
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = renderCardHTML(current);
      stack.appendChild(card);
      attachDrag(card);
    };
    const react = (reaction) => {
      if (!current)
        return;
      const sess = getSession();
      sess.interactions.push({ itemId: current.id, reaction });
      setSession(sess);
      if (sess.interactions.length >= 12) {
        navigate("results");
        return;
      }
      render();
    };
    const animateOut = (card, dir, reaction) => {
      card.classList.remove("dragging");
      const x = dir === "left" ? -window.innerWidth : dir === "right" ? window.innerWidth : 0;
      const y = dir === "down" ? 600 : 0;
      const rot = dir === "left" ? -25 : dir === "right" ? 25 : 0;
      card.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      card.style.opacity = "0";
      setTimeout(() => react(reaction), 300);
    };
    const attachDrag = (card) => {
      let startX = 0, startY = 0, dragging = false;
      const stampLike = card.querySelector(".stamp.like");
      const stampPass = card.querySelector(".stamp.pass");
      const onDown = (clientX, clientY) => {
        startX = clientX;
        startY = clientY;
        dragging = true;
        card.classList.add("dragging");
      };
      const onMove = (clientX, clientY) => {
        if (!dragging)
          return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        const rot = dx * 0.06;
        card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        stampLike.style.opacity = String(Math.max(0, Math.min(1, dx / 100)));
        stampPass.style.opacity = String(Math.max(0, Math.min(1, -dx / 100)));
      };
      const onUp = (clientX) => {
        if (!dragging)
          return;
        dragging = false;
        const dx = clientX - startX;
        if (dx > 100)
          animateOut(card, "right", "like");
        else if (dx < -100)
          animateOut(card, "left", "dislike");
        else {
          card.style.transform = "";
          stampLike.style.opacity = "0";
          stampPass.style.opacity = "0";
          card.classList.remove("dragging");
        }
      };
      card.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
      window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
      window.addEventListener("mouseup", (e) => onUp(e.clientX));
      card.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        onDown(t.clientX, t.clientY);
      }, { passive: true });
      window.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        if (t)
          onMove(t.clientX, t.clientY);
      }, { passive: true });
      window.addEventListener("touchend", (e) => {
        const t = e.changedTouches[0];
        if (t)
          onUp(t.clientX);
      });
    };
    document.getElementById("passBtn")?.addEventListener("click", () => {
      const card = stack.querySelector(".card");
      if (card && current)
        animateOut(card, "left", "dislike");
    });
    document.getElementById("skipBtn")?.addEventListener("click", () => {
      const card = stack.querySelector(".card");
      if (card && current)
        animateOut(card, "down", "skip");
    });
    document.getElementById("likeBtn")?.addEventListener("click", () => {
      const card = stack.querySelector(".card");
      if (card && current)
        animateOut(card, "right", "like");
    });
    document.getElementById("surpriseBtn")?.addEventListener("click", () => {
      const sess = getSession();
      const types = sess.types.length ? sess.types : ALL_TYPES;
      current = pickNext(sess.interactions, { types, surprise: true });
      if (!current)
        return;
      stack.innerHTML = "";
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = renderCardHTML(current);
      stack.appendChild(card);
      attachDrag(card);
      toast("Choix surprise !");
    });
    document.getElementById("restartBtn")?.addEventListener("click", () => {
      const types = session.types;
      setSession({ interactions: [], types });
      render();
    });
    showCard();
  }
  function attachFocus() {
    const grid = document.getElementById("focusGrid");
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    if (!grid || !startBtn)
      return;
    const sess = getSession();
    const selected = new Set(sess.types && sess.types.length ? sess.types : ALL_TYPES);
    const updateBtn = () => {
      startBtn.textContent = `Start swiping · ${selected.size} format${selected.size === 1 ? "" : "s"}`;
      startBtn.disabled = selected.size === 0;
    };
    grid.querySelectorAll(".focus-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const t = btn.dataset.type;
        if (selected.has(t))
          selected.delete(t);
        else
          selected.add(t);
        btn.classList.toggle("active", selected.has(t));
        updateBtn();
      });
    });
    startBtn.addEventListener("click", () => {
      setSession({ interactions: [], types: Array.from(selected) });
      navigate("discover");
    });
    resetBtn?.addEventListener("click", () => {
      clearSession();
      toast("Session reinitialisee");
      render();
    });
    updateBtn();
  }
  function attachFavToggles() {
    document.querySelectorAll(".fav-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const added = toggleFavorite(id);
        toast(added ? "Ajoute aux favoris" : "Retire");
        render();
      });
    });
  }
  function render() {
    const root = document.getElementById("app");
    if (!root)
      return;
    const route = getRoute();
    let html = "";
    switch (route) {
      case "home":
        html = renderHome();
        break;
      case "focus":
        html = renderFocus();
        break;
      case "discover":
        html = renderDiscover();
        break;
      case "results":
        html = renderResults();
        break;
      case "favorites":
        html = renderFavorites();
        break;
    }
    root.innerHTML = html;
    if (route === "focus")
      attachFocus();
    if (route === "discover")
      mountSwipe();
    if (route === "results" || route === "favorites")
      attachFavToggles();
    window.scrollTo(0, 0);
  }
  function initMuse() {
    if (!document.getElementById("muse-fonts")) {
      const l = document.createElement("link");
      l.id = "muse-fonts";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap";
      document.head.appendChild(l);
    }
    window.addEventListener("hashchange", render);
    render();
  }
  initMuse();
})();
