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
    { id: "m1", title: "Spirited Away", type: "movie", year: 2001, creator: "Hayao Miyazaki", pitch: "A girl wanders into a spirit bathhouse and finds herself.", moods: ["wholesome", "mysterious", "contemplative"], themes: ["coming-of-age", "magic", "identity"], engagement: 2, intensity: 2, duration: "2h 5m", goodFor: ["family"], rating: 8.6 },
    { id: "m2", title: "Parasite", type: "movie", year: 2019, creator: "Bong Joon-ho", pitch: "A poor family schemes their way into a rich household — until it spirals.", moods: ["tense", "dark", "absurd"], themes: ["politics", "family", "crime"], engagement: 3, intensity: 4, duration: "2h 12m", goodFor: ["movie nights"], rating: 8.5 },
    { id: "m3", title: "Past Lives", type: "movie", year: 2023, creator: "Celine Song", pitch: "Two childhood friends reunite decades later in New York.", moods: ["melancholic", "romantic", "contemplative"], themes: ["love", "identity"], engagement: 1, intensity: 2, duration: "1h 45m", goodFor: ["quiet nights"], rating: 7.9 },
    { id: "m4", title: "Mad Max: Fury Road", type: "movie", year: 2015, creator: "George Miller", pitch: "Two hours of practical-effect chaos across a desert.", moods: ["epic", "energetic", "tense"], themes: ["survival", "war"], engagement: 3, intensity: 5, duration: "2h", goodFor: ["adrenaline"], rating: 8.1 },
    { id: "m5", title: "Paddington 2", type: "movie", year: 2017, pitch: "A polite bear fights to clear his name. Pure kindness.", moods: ["wholesome", "playful", "uplifting"], themes: ["family", "friendship"], engagement: 2, intensity: 1, duration: "1h 43m", goodFor: ["bad days"], rating: 7.8 },
    { id: "m6", title: "Arrival", type: "movie", year: 2016, creator: "Denis Villeneuve", pitch: "A linguist makes first contact — and rethinks time itself.", moods: ["cerebral", "melancholic", "mysterious"], themes: ["tech", "discovery", "love"], engagement: 2, intensity: 3, duration: "1h 56m", goodFor: ["thinkers"], rating: 7.9 },
    { id: "m7", title: "Everything Everywhere All At Once", type: "movie", year: 2022, pitch: "A laundromat owner saves the multiverse. Yes, really.", moods: ["absurd", "epic", "uplifting"], themes: ["family", "identity"], engagement: 3, intensity: 4, duration: "2h 19m", goodFor: ["bold tastes"], rating: 8 },
    { id: "m8", title: "Before Sunrise", type: "movie", year: 1995, pitch: "Two strangers walk and talk through Vienna for one night.", moods: ["romantic", "contemplative", "nostalgic"], themes: ["love", "discovery"], engagement: 1, intensity: 1, duration: "1h 41m", goodFor: ["solo nights"], rating: 8.1 },
    { id: "m9", title: "The Grand Budapest Hotel", type: "movie", year: 2014, creator: "Wes Anderson", pitch: "A concierge, a lobby boy, a stolen painting — perfectly composed.", moods: ["playful", "absurd", "nostalgic"], themes: ["friendship", "art"], engagement: 2, intensity: 2, duration: "1h 39m", goodFor: ["aesthetes"], rating: 8.1 },
    { id: "m10", title: "Hereditary", type: "movie", year: 2018, pitch: "Grief curdles into something much, much worse.", moods: ["dark", "tense", "mysterious"], themes: ["family"], engagement: 2, intensity: 5, duration: "2h 7m", goodFor: ["horror fans"], rating: 7.3 },
    { id: "m11", title: "La La Land", type: "movie", year: 2016, pitch: "Two dreamers in LA, music, and bittersweet endings.", moods: ["romantic", "melancholic", "uplifting"], themes: ["love", "art"], engagement: 2, intensity: 2, duration: "2h 8m", goodFor: ["date night"], rating: 8 },
    { id: "m12", title: "Dune: Part Two", type: "movie", year: 2024, pitch: "Sand, prophecy, and giant worms — at maximum scale.", moods: ["epic", "tense", "mysterious"], themes: ["war", "politics"], engagement: 3, intensity: 4, duration: "2h 46m", goodFor: ["big screen"], rating: 8.5 },
    { id: "s1", title: "Fleabag", type: "series", year: 2016, creator: "Phoebe Waller-Bridge", pitch: "A woman breaks the fourth wall and your heart in 12 episodes.", moods: ["dark", "playful", "melancholic"], themes: ["identity", "family", "love"], engagement: 2, intensity: 3, duration: "12 × 25m", goodFor: ["binge"], rating: 8.7 },
    { id: "s2", title: "The Bear", type: "series", year: 2022, pitch: "A chef inherits his family's chaotic Chicago sandwich shop.", moods: ["tense", "energetic", "melancholic"], themes: ["family", "art"], engagement: 3, intensity: 4, duration: "30m episodes", goodFor: ["food lovers"], rating: 8.6 },
    { id: "s3", title: "Severance", type: "series", year: 2022, pitch: "Office workers split their consciousness between work and home.", moods: ["mysterious", "cerebral", "tense"], themes: ["tech", "identity"], engagement: 3, intensity: 3, duration: "1h episodes", goodFor: ["puzzle fans"], rating: 8.7 },
    { id: "s4", title: "Ted Lasso", type: "series", year: 2020, pitch: "An optimistic American coaches a British football team.", moods: ["wholesome", "uplifting", "playful"], themes: ["friendship", "family"], engagement: 2, intensity: 2, duration: "30m episodes", goodFor: ["bad weeks"], rating: 8.8 },
    { id: "s5", title: "Chernobyl", type: "series", year: 2019, pitch: "A meticulous, devastating reconstruction of the 1986 disaster.", moods: ["dark", "tense", "contemplative"], themes: ["history", "politics", "survival"], engagement: 2, intensity: 5, duration: "5 × 1h", goodFor: ["history buffs"], rating: 9.4 },
    { id: "s6", title: "Schitt's Creek", type: "series", year: 2015, pitch: "A wealthy family loses everything and lives in a motel.", moods: ["wholesome", "playful", "uplifting"], themes: ["family", "friendship"], engagement: 2, intensity: 1, duration: "22m episodes", goodFor: ["comfort"], rating: 8.5 },
    { id: "s7", title: "True Detective S1", type: "series", year: 2014, pitch: "Two Louisiana detectives, one case, seventeen years.", moods: ["dark", "mysterious", "contemplative"], themes: ["crime", "identity"], engagement: 3, intensity: 4, duration: "8 × 1h", goodFor: ["noir lovers"], rating: 8.9 },
    { id: "s8", title: "The Kingdom of Dreams", type: "series", year: 2013, pitch: "A quiet look inside Miyazaki's studio.", moods: ["contemplative", "nostalgic", "wholesome"], themes: ["art"], engagement: 1, intensity: 1, duration: "2h", goodFor: ["calm afternoons"], rating: 8 },
    { id: "s9", title: "Mr. Robot", type: "series", year: 2015, pitch: "A hacker with dissociative identity disorder takes on a megacorp.", moods: ["dark", "tense", "cerebral"], themes: ["tech", "politics", "identity"], engagement: 3, intensity: 4, duration: "45m episodes", goodFor: ["tech-curious"], rating: 8.5 },
    { id: "s10", title: "Heartstopper", type: "series", year: 2022, pitch: "Two boys at a British school fall in love. Soft and bright.", moods: ["wholesome", "romantic", "uplifting"], themes: ["love", "coming-of-age", "identity"], engagement: 1, intensity: 1, duration: "30m episodes", goodFor: ["gentle nights"], rating: 8.2 },
    { id: "mu1", title: "Nights", type: "music", year: 2016, creator: "Frank Ocean", pitch: "A two-part song that splits in the middle and changes everything.", moods: ["melancholic", "contemplative", "nostalgic"], themes: ["love", "identity"], engagement: 1, intensity: 2, duration: "5m 07s", goodFor: ["headphones"], rating: 9.4 },
    { id: "mu2", title: "Get Lucky", type: "music", year: 2013, creator: "Daft Punk feat. Pharrell", pitch: "Disco resurrected. Four-on-the-floor pure pleasure.", moods: ["uplifting", "playful", "energetic"], themes: ["art"], engagement: 2, intensity: 2, duration: "4m 09s", goodFor: ["good moods"], rating: 8.9 },
    { id: "mu3", title: "Alright", type: "music", year: 2015, creator: "Kendrick Lamar", pitch: "A defiant, gospel-tinged anthem of survival.", moods: ["cerebral", "epic", "uplifting"], themes: ["politics", "identity"], engagement: 2, intensity: 4, duration: "3m 39s", goodFor: ["deep listens"], rating: 9.2 },
    { id: "mu4", title: "Skinny Love", type: "music", year: 2008, creator: "Bon Iver", pitch: "A whispered, broken plea recorded in a cabin in winter.", moods: ["melancholic", "contemplative", "cozy"], themes: ["love", "nature"], engagement: 1, intensity: 3, duration: "3m 58s", goodFor: ["rainy days"], rating: 9 },
    { id: "mu5", title: "The Less I Know the Better", type: "music", year: 2015, creator: "Tame Impala", pitch: "A bassline that haunts you for years.", moods: ["nostalgic", "playful", "melancholic"], themes: ["love"], engagement: 2, intensity: 2, duration: "3m 36s", goodFor: ["driving"], rating: 8.8 },
    { id: "mu6", title: "Bags", type: "music", year: 2019, creator: "Clairo", pitch: "The shy butterflies of an almost-confession.", moods: ["cozy", "romantic", "nostalgic"], themes: ["love", "coming-of-age"], engagement: 1, intensity: 1, duration: "4m 27s", goodFor: ["mornings"], rating: 8.2 },
    { id: "mu7", title: "360", type: "music", year: 2024, creator: "Charli XCX", pitch: "Strobe-lit club-pop with a wink and a sneer.", moods: ["energetic", "playful", "tense"], themes: ["identity", "art"], engagement: 3, intensity: 3, duration: "2m 13s", goodFor: ["pre-game"], rating: 8.4 },
    { id: "mu8", title: "Weird Fishes / Arpeggi", type: "music", year: 2007, creator: "Radiohead", pitch: "Interlocking guitars that build like a tide.", moods: ["melancholic", "contemplative", "epic"], themes: ["love"], engagement: 2, intensity: 3, duration: "5m 18s", goodFor: ["headphones"], rating: 9.1 },
    { id: "mu9", title: "Dreams", type: "music", year: 1977, creator: "Fleetwood Mac", pitch: "Stevie Nicks, a heartbreak, and that perfect drum groove.", moods: ["nostalgic", "melancholic", "uplifting"], themes: ["love"], engagement: 1, intensity: 2, duration: "4m 17s", goodFor: ["everyone"], rating: 9.3 },
    { id: "mu10", title: "One More Time", type: "music", year: 2000, creator: "Daft Punk", pitch: "A vocoded shout to the dancefloor that never gets old.", moods: ["energetic", "playful", "uplifting"], themes: ["art"], engagement: 2, intensity: 2, duration: "5m 20s", goodFor: ["any mood"], rating: 9 },
    { id: "mu11", title: "Motion Sickness", type: "music", year: 2017, creator: "Phoebe Bridgers", pitch: "A breakup song that drives forward instead of dwelling.", moods: ["melancholic", "energetic", "tense"], themes: ["love", "identity"], engagement: 2, intensity: 3, duration: "4m 03s", goodFor: ["walking"], rating: 8.7 },
    { id: "mu12", title: "Redbone", type: "music", year: 2016, creator: "Childish Gambino", pitch: "Slow-burn funk in falsetto. Stay woke.", moods: ["romantic", "mysterious", "nostalgic"], themes: ["love"], engagement: 1, intensity: 2, duration: "5m 27s", goodFor: ["late nights"], rating: 8.9 },
    { id: "v1", title: "Stardew Valley", type: "videogame", year: 2016, pitch: "Inherit a farm. Plant. Befriend. Forget about time.", moods: ["cozy", "wholesome", "contemplative"], themes: ["nature", "friendship"], engagement: 4, intensity: 1, duration: "100+ hours", goodFor: ["unwinding"], rating: 8.9 },
    { id: "v2", title: "Hades", type: "videogame", year: 2020, pitch: "Escape hell, die, repeat — with sharp dialogue every run.", moods: ["energetic", "playful", "epic"], themes: ["family", "magic"], engagement: 4, intensity: 3, duration: "30h", goodFor: ["short sessions"], rating: 9.3 },
    { id: "v3", title: "Disco Elysium", type: "videogame", year: 2019, pitch: "A drunk amnesiac detective argues with himself across a strange city.", moods: ["cerebral", "dark", "absurd"], themes: ["politics", "identity", "crime"], engagement: 4, intensity: 4, duration: "40h", goodFor: ["readers"], rating: 9.4 },
    { id: "v4", title: "Outer Wilds", type: "videogame", year: 2019, pitch: "A 22-minute time loop. A solar system to understand.", moods: ["mysterious", "contemplative", "melancholic"], themes: ["discovery", "nature"], engagement: 4, intensity: 2, duration: "20h", goodFor: ["explorers"], rating: 9.5 },
    { id: "v5", title: "Elden Ring", type: "videogame", year: 2022, pitch: "An open world that wants you dead, beautifully.", moods: ["epic", "tense", "mysterious"], themes: ["survival", "magic", "war"], engagement: 5, intensity: 4, duration: "80h", goodFor: ["patient players"], rating: 9.5 },
    { id: "v6", title: "Animal Crossing: New Horizons", type: "videogame", year: 2020, pitch: "A deserted island that becomes a tiny, perfect village.", moods: ["cozy", "wholesome", "playful"], themes: ["nature", "friendship"], engagement: 4, intensity: 1, duration: "endless", goodFor: ["daily ritual"], rating: 8.4 },
    { id: "v7", title: "Celeste", type: "videogame", year: 2018, pitch: "Climb a mountain. Climb yourself. Tight, kind, hard.", moods: ["uplifting", "tense", "melancholic"], themes: ["identity", "coming-of-age"], engagement: 4, intensity: 3, duration: "10h", goodFor: ["a weekend"], rating: 9.1 },
    { id: "v8", title: "Red Dead Redemption 2", type: "videogame", year: 2018, pitch: "A slow, mournful western about a gang at the end of an era.", moods: ["melancholic", "epic", "contemplative"], themes: ["history", "friendship"], engagement: 4, intensity: 4, duration: "60h", goodFor: ["long evenings"], rating: 9.3 },
    { id: "v9", title: "Slay the Spire", type: "videogame", year: 2019, pitch: "Build a deck, climb a tower, lose, build a better one.", moods: ["cerebral", "playful"], themes: ["discovery"], engagement: 5, intensity: 2, duration: "endless", goodFor: ["commutes"], rating: 9 },
    { id: "v10", title: "Journey", type: "videogame", year: 2012, pitch: "Two hours of wordless beauty across desert and ruins.", moods: ["contemplative", "uplifting", "mysterious"], themes: ["discovery", "friendship"], engagement: 3, intensity: 2, duration: "2h", goodFor: ["non-gamers"], rating: 8.9 },
    { id: "b1", title: "Wingspan", type: "boardgame", year: 2019, pitch: "A serene engine-builder about attracting birds to your reserves.", moods: ["cozy", "contemplative", "wholesome"], themes: ["nature"], engagement: 4, intensity: 2, duration: "60-90m", goodFor: ["1-5 players"], rating: 8.1 },
    { id: "b2", title: "Codenames", type: "boardgame", year: 2015, pitch: "Give one-word clues to your team. Avoid the assassin.", moods: ["playful", "tense"], themes: ["friendship"], engagement: 5, intensity: 2, duration: "15m", goodFor: ["parties"], rating: 7.6 },
    { id: "b3", title: "Gloomhaven: Jaws of the Lion", type: "boardgame", year: 2020, pitch: "A tactical dungeon crawler with a real campaign.", moods: ["epic", "cerebral", "tense"], themes: ["magic", "war", "friendship"], engagement: 5, intensity: 4, duration: "90m", goodFor: ["1-4 players"], rating: 8.5 },
    { id: "b4", title: "Patchwork", type: "boardgame", year: 2014, pitch: "Two players quilt against each other. Quietly cutthroat.", moods: ["cozy", "cerebral"], themes: ["art"], engagement: 4, intensity: 2, duration: "30m", goodFor: ["couples"], rating: 7.7 },
    { id: "b5", title: "Spirit Island", type: "boardgame", year: 2017, pitch: "Cooperate as spirits defending an island from colonizers.", moods: ["epic", "cerebral", "tense"], themes: ["politics", "nature", "magic"], engagement: 5, intensity: 4, duration: "90-120m", goodFor: ["1-4 players"], rating: 8.4 },
    { id: "b6", title: "Just One", type: "boardgame", year: 2018, pitch: "Cooperative party game. Write one clue. No duplicates allowed.", moods: ["playful", "wholesome", "uplifting"], themes: ["friendship"], engagement: 5, intensity: 1, duration: "20m", goodFor: ["all ages"], rating: 7.7 },
    { id: "b7", title: "Brass: Birmingham", type: "boardgame", year: 2018, pitch: "Heavy economic strategy through the industrial revolution.", moods: ["cerebral", "tense"], themes: ["history", "politics"], engagement: 5, intensity: 5, duration: "2-3h", goodFor: ["serious gamers"], rating: 8.7 },
    { id: "b8", title: "Pandemic", type: "boardgame", year: 2008, pitch: "Cooperate to stop four diseases before they consume the world.", moods: ["tense", "cerebral"], themes: ["survival"], engagement: 5, intensity: 3, duration: "45m", goodFor: ["2-4 players"], rating: 7.6 },
    { id: "b9", title: "Azul", type: "boardgame", year: 2017, pitch: "Draft tiles to decorate a Portuguese palace. Beautiful pieces.", moods: ["cozy", "playful", "contemplative"], themes: ["art"], engagement: 4, intensity: 2, duration: "30-45m", goodFor: ["2-4 players"], rating: 7.8 },
    { id: "b10", title: "Dixit", type: "boardgame", year: 2008, pitch: "Storytelling with surreal illustrated cards.", moods: ["playful", "absurd", "contemplative"], themes: ["art"], engagement: 5, intensity: 1, duration: "30m", goodFor: ["3-8 players"], rating: 7.6 }
  ];
  var ALL_MOODS = ["cozy", "tense", "uplifting", "melancholic", "playful", "cerebral", "epic", "romantic", "dark", "wholesome", "mysterious", "absurd", "nostalgic", "energetic", "contemplative"];
  var ALL_THEMES = ["friendship", "survival", "love", "war", "discovery", "identity", "family", "nature", "tech", "crime", "magic", "history", "coming-of-age", "art", "politics"];
  var TYPE_LABEL = {
    movie: "Film",
    series: "Series",
    music: "Track",
    videogame: "Video game",
    boardgame: "Board game"
  };
  var TYPE_PLURAL = {
    movie: "Films",
    series: "Series",
    music: "Tracks",
    videogame: "Video games",
    boardgame: "Board games"
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
        reasons.push(`Matches your taste for ${shared.join(" & ")} experiences`);
      if (similarLiked.length)
        reasons.push(`Shares a vibe with ${similarLiked.map((l) => `"${l.title}"`).join(" and ")}`);
      if (Math.abs(item.intensity - profile.intensityPref) <= 1) {
        const lab = profile.intensityPref < 2.5 ? "lighter" : profile.intensityPref > 3.5 ? "more intense" : "balanced";
        reasons.push(`Fits the ${lab} intensity you've been enjoying`);
      }
      if (Math.abs(item.engagement - profile.engagementPref) <= 1) {
        const lab = profile.engagementPref < 2.5 ? "passive" : profile.engagementPref > 3.5 ? "active" : "moderate";
        reasons.push(`Right level of engagement (${lab})`);
      }
      if (reasons.length === 0)
        reasons.push("A high-quality pick to broaden your taste");
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
    const link = (r, label) => `<a href="#/${r === "home" ? "" : r}" class="${active === r ? "active" : ""}">${label}</a>`;
    return `
    <header class="header">
      <div class="header-inner">
        <a href="#/" class="brand"><span class="brand-dot"></span>Muse</a>
        <nav class="nav">
          ${link("home", "Home")}
          ${link("focus", "Discover")}
          ${link("favorites", "Favorites")}
        </nav>
      </div>
    </header>`;
  }
  function renderCardHTML(item) {
    const moods = item.moods.slice(0, 3).map((m) => `<span class="chip">${m}</span>`).join("");
    return `
    <span class="card-type">${TYPE_LABEL[item.type]}${item.year ? " · " + item.year : ""}</span>
    <h2 class="card-title serif">${esc(item.title)}</h2>
    ${item.creator ? `<div class="card-creator">${esc(item.creator)}</div>` : ""}
    <p class="card-pitch">${esc(item.pitch)}</p>
    <div class="card-bars">
      <div class="bar"><span>Intensity · ${item.intensity}/5</span><div class="bar-track"><span style="width:${item.intensity * 20}%"></span></div></div>
      <div class="bar"><span>Engagement · ${item.engagement}/5</span><div class="bar-track"><span style="width:${item.engagement * 20}%"></span></div></div>
    </div>
    <div class="card-meta">
      <span class="chip">⏱ ${esc(item.duration)}</span>
      ${moods}
    </div>
    <span class="stamp like">Interested</span>
    <span class="stamp pass">Pass</span>`;
  }
  function renderHome() {
    return `
    ${header("home")}
    <main>
      <section class="hero">
        <div class="hero-inner">
          <span class="tag"><span class="tag-dot"></span>A taste engine, not a catalog</span>
          <h1>Don't know what to <span class="grad serif">watch, play, or listen to</span> tonight?</h1>
          <p>Swipe through a few cards. Muse learns your mood in real time and ends with <em>three perfect picks</em> across films, series, music, video games and board games — with a clear reason for each.</p>
          <div class="hero-cta">
            <a href="#/focus" class="btn btn-primary">Start a discovery session →</a>
            <a href="#/favorites" class="btn btn-ghost">Your favorites</a>
          </div>
        </div>
      </section>
      <section class="features">
        <div class="feature">
          <div class="feature-head"><span class="feature-icon">✦</span><span class="feature-num">01</span></div>
          <h3>Swipe to teach it</h3>
          <p>Right for interested, left to pass, skip if neutral. Cards adapt instantly to your mood.</p>
        </div>
        <div class="feature">
          <div class="feature-head"><span class="feature-icon">◇</span><span class="feature-num">02</span></div>
          <h3>Hybrid recommender</h3>
          <p>Content vectors plus a taste profile, plus similarity to what you liked, minus what you didn't.</p>
        </div>
        <div class="feature">
          <div class="feature-head"><span class="feature-icon">⊞</span><span class="feature-num">03</span></div>
          <h3>Across all media</h3>
          <p>A great game can answer the same craving as a film. Muse crosses formats.</p>
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
        <h2 class="serif">What are you in the mood for?</h2>
        <p class="lead">Pick one or several formats. You can always change your mind in the next session.</p>
        <div class="focus-grid" id="focusGrid">
          ${ALL_TYPES.map(chip).join("")}
        </div>
        <div class="focus-actions">
          <button class="btn btn-primary" id="startBtn">Start swiping · ${selected.size} format${selected.size === 1 ? "" : "s"}</button>
          <button class="btn btn-ghost btn-sm" id="resetBtn">Reset previous session</button>
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
            <button class="btn btn-ghost btn-sm" id="surpriseBtn">✨ Surprise me</button>
            ${session.interactions.length >= 4 ? `<a href="#/results" class="btn btn-primary btn-sm">See picks →</a>` : ""}
            <button class="btn btn-ghost btn-sm" id="restartBtn">Restart</button>
          </div>
        </div>
        <aside class="sidebar">
          <h3>Your mood</h3>
          ${topMoods.length === 0 ? `<p class="empty">Swipe a few cards and your taste will appear here.</p>` : `<div class="mood-list">${topMoods.map(([m, v]) => `<div class="mood-row"><span class="mood-label">${m}</span><div class="mood-track"><span style="width:${v / max * 100}%"></span></div></div>`).join("")}</div>`}
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
          <h1>Three picks for your mood tonight</h1>
          <p>Based on ${session.interactions.filter((i) => i.reaction !== "skip").length} reactions across your selected formats.</p>
        </div>
        ${recs.map((r, i) => `
          <article class="rec">
            <div class="rec-rank">Pick ${String(i + 1).padStart(2, "0")} · ${TYPE_LABEL[r.item.type]}</div>
            <h2 class="rec-title">${esc(r.item.title)}</h2>
            ${r.item.creator ? `<div class="rec-creator">${esc(r.item.creator)}${r.item.year ? " · " + r.item.year : ""} · ${esc(r.item.duration)}</div>` : `<div class="rec-creator">${r.item.year ?? ""} · ${esc(r.item.duration)}</div>`}
            <p class="rec-pitch">${esc(r.item.pitch)}</p>
            <div class="rec-reasons">
              <h4>Why this</h4>
              <ul>${r.reasons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            </div>
            <div class="rec-actions">
              <button class="btn btn-ghost btn-sm fav-toggle" data-id="${r.item.id}">${isFavorite(r.item.id) ? "★ Saved" : "☆ Save"}</button>
            </div>
          </article>
        `).join("")}
        <div class="hero-cta" style="margin-top:2rem">
          <a href="#/focus" class="btn btn-primary">New session</a>
          <a href="#/favorites" class="btn btn-ghost">View favorites</a>
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
          <h1 class="serif">Your favorites</h1>
          <p>${items.length === 0 ? "Save picks from your sessions to find them here." : `${items.length} item${items.length === 1 ? "" : "s"} saved locally.`}</p>
        </div>
        ${items.length === 0 ? `<div class="empty-state"><span class="serif">Nothing yet</span>Start a session and save what you love.</div>` : `<div class="fav-list">${items.map((it) => `
            <article class="fav">
              <button class="remove fav-toggle" data-id="${it.id}">remove</button>
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
          <div class="serif" style="font-size:1.5rem;margin-bottom:0.5rem">You've seen everything!</div>
          <p style="color:var(--muted-foreground);margin-bottom:1rem">Time to look at your picks.</p>
          <a href="#/results" class="btn btn-primary btn-sm">See picks →</a>
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
      toast("Surprise pick!");
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
      toast("Session cleared");
      render();
    });
    updateBtn();
  }
  function attachFavToggles() {
    document.querySelectorAll(".fav-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const added = toggleFavorite(id);
        toast(added ? "Saved to favorites" : "Removed");
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
