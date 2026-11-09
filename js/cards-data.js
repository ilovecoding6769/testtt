// Card data for the pack opener.
// Card names, years, sets and numbers refer to real cards.
// Values are APPROXIMATE ungraded (raw) market prices, estimated from typical recent sales.
// They are not live and real prices vary a lot with condition and grading.
// All buying and selling on the site uses play money only.
// No official card images are used. Not affiliated with any league, team, card maker,
// or The Pokémon Company / Nintendo.
//
// To add a card, append a row to one of the lists below. Its tier (Common…Grail)
// is worked out from its value, and pack prices update automatically.

window.CardData = (function () {
  const RARITIES = ["common", "uncommon", "rare", "ultra", "secret"];

  // Tier is decided by card value
  const TIER_MAX = { common: 10, uncommon: 50, rare: 300, ultra: 5000, secret: Infinity };
  const TIER_LABEL = { common: "Common", uncommon: "Uncommon", rare: "Rare", ultra: "Ultra Rare", secret: "Grail" };
  const TIER_RANGE = { common: "under $10", uncommon: "$10–49", rare: "$50–299", ultra: "$300–4,999", secret: "$5,000+" };

  function tierFor(price) {
    return RARITIES.find((r) => price < TIER_MAX[r]);
  }

  function slug(s) {
    return s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-");
  }

  // ---------- Team colors ----------
  const TEAMS = {
    // Baseball
    Yankees: ["#0c2340", "#c4ced4"], "NY Giants": ["#fd5a1e", "#27251f"], Angels: ["#ba0021", "#003263"],
    Braves: ["#13274f", "#ce1141"], Mariners: ["#0c2c56", "#005c5c"], Mets: ["#002d72", "#ff5910"],
    Reds: ["#c6011f", "#1f1f1f"], Athletics: ["#003831", "#efb21e"], Orioles: ["#df4601", "#1f1f1f"],
    "Team USA": ["#0a3161", "#b31942"], "Red Sox": ["#bd3039", "#0c2340"], Nationals: ["#ab0003", "#14225a"],
    Pirates: ["#27251f", "#fdb827"], Cubs: ["#0e3386", "#cc3433"], "White Sox": ["#27251f", "#c4ced4"],
    // Football
    Patriots: ["#002244", "#c60c30"], Browns: ["#311d00", "#ff3c00"], Chiefs: ["#e31837", "#ffb81c"],
    Jets: ["#125740", "#0b2e22"], Colts: ["#002c5f", "#a2aaad"], "49ers": ["#aa0000", "#b3995d"],
    Bears: ["#0b162a", "#c83803"], Dolphins: ["#008e97", "#fc4c02"], Broncos: ["#fb4f14", "#002244"],
    Lions: ["#0076b6", "#b0b7bc"], Cowboys: ["#041e42", "#869397"], Packers: ["#203731", "#ffb612"],
    Bills: ["#00338d", "#c60c30"], Bengals: ["#fb4f14", "#1f1f1f"], Falcons: ["#a71930", "#1f1f1f"],
    Raiders: ["#1f1f1f", "#a5acaf"], Ravens: ["#241773", "#9e7c0c"], Chargers: ["#0080c6", "#ffc20e"],
    // Basketball
    Bulls: ["#ce1141", "#1f1f1f"], Cavaliers: ["#860038", "#fdbb30"], Bucks: ["#00471b", "#c9b98f"],
    Celtics: ["#007a33", "#ba9653"], Lakers: ["#552583", "#fdb927"], Warriors: ["#1d428a", "#ffc72c"],
    Mavericks: ["#00538c", "#b8c4ca"], SuperSonics: ["#00653a", "#ffc200"], Heat: ["#98002e", "#f9a01b"],
    Nuggets: ["#0e2240", "#fec524"], Pelicans: ["#0c2340", "#c8102e"], Grizzlies: ["#5d76a9", "#12173f"],
    Magic: ["#0077c0", "#c4ced4"], Raptors: ["#ce1141", "#1f1f1f"],
  };

  // ---------- Sports cards: [player, year + set, card #, team, approx. raw value $] ----------
  const BASEBALL = [
    ["Mickey Mantle", "1952 Topps", "311", "Yankees", 75000],
    ["Willie Mays", "1951 Bowman", "305", "NY Giants", 6000],
    ["Hank Aaron", "1954 Topps", "128", "Braves", 2500],
    ["Pete Rose", "1963 Topps", "537", "Reds", 500],
    ["Nolan Ryan", "1968 Topps", "177", "Mets", 400],
    ["Mike Trout", "2011 Topps Update", "US175", "Angels", 250],
    ["Derek Jeter", "1993 SP", "279", "Yankees", 150],
    ["Cal Ripken Jr.", "1982 Topps Traded", "98T", "Orioles", 60],
    ["Ken Griffey Jr.", "1989 Upper Deck", "1", "Mariners", 40],
    ["Rickey Henderson", "1980 Topps", "482", "Athletics", 40],
    ["Roger Clemens", "1984 Fleer Update", "U-27", "Red Sox", 40],
    ["Mariano Rivera", "1992 Bowman", "302", "Yankees", 40],
    ["Shohei Ohtani", "2018 Topps Update", "US1", "Angels", 30],
    ["Juan Soto", "2018 Topps Update", "US300", "Nationals", 15],
    ["Frank Thomas", "1990 Leaf", "300", "White Sox", 15],
    ["Derek Jeter", "1993 Topps", "98", "Yankees", 15],
    ["Mark McGwire", "1985 Topps", "401", "Team USA", 10],
    ["Ronald Acuña Jr.", "2018 Topps Update", "US250", "Braves", 10],
    ["Barry Bonds", "1987 Fleer", "604", "Pirates", 8],
    ["Ken Griffey Jr.", "1989 Topps Traded", "41T", "Mariners", 8],
    ["Greg Maddux", "1987 Donruss", "36", "Cubs", 5],
    ["Billy Ripken", "1989 Fleer", "616", "Orioles", 5],
    ["Jose Canseco", "1986 Donruss", "39", "Athletics", 3],
    ["Chipper Jones", "1991 Topps", "333", "Braves", 3],
    ["Frank Thomas", "1990 Topps", "414", "White Sox", 2],
  ];

  const FOOTBALL = [
    ["Tom Brady", "2000 Playoff Contenders Auto", "144", "Patriots", 45000],
    ["Jim Brown", "1958 Topps", "62", "Browns", 1200],
    ["Joe Namath", "1965 Topps", "122", "Jets", 800],
    ["Johnny Unitas", "1957 Topps", "138", "Colts", 400],
    ["Patrick Mahomes", "2017 Panini Prizm", "269", "Chiefs", 150],
    ["Walter Payton", "1976 Topps", "148", "Bears", 60],
    ["Joe Montana", "1981 Topps", "216", "49ers", 50],
    ["Josh Allen", "2018 Panini Prizm", "205", "Bills", 50],
    ["Jerry Rice", "1986 Topps", "161", "49ers", 40],
    ["Lamar Jackson", "2018 Panini Prizm", "212", "Ravens", 30],
    ["Dan Marino", "1984 Topps", "123", "Dolphins", 25],
    ["John Elway", "1984 Topps", "63", "Broncos", 25],
    ["Aaron Rodgers", "2005 Topps", "431", "Packers", 25],
    ["Joe Burrow", "2020 Panini Prizm", "307", "Bengals", 25],
    ["Justin Herbert", "2020 Panini Prizm", "325", "Chargers", 20],
    ["Barry Sanders", "1989 Score", "257", "Lions", 15],
    ["Brett Favre", "1991 Stadium Club", "94", "Falcons", 10],
    ["Troy Aikman", "1989 Score", "270", "Cowboys", 8],
    ["Emmitt Smith", "1990 Fleer Update", "U-40", "Cowboys", 5],
    ["Deion Sanders", "1989 Score", "246", "Falcons", 5],
    ["Bo Jackson", "1988 Topps", "327", "Raiders", 5],
  ];

  const BASKETBALL = [
    ["Wilt Chamberlain", "1961-62 Fleer", "8", "Warriors", 6000],
    ["Michael Jordan", "1984-85 Star", "101", "Bulls", 4000],
    ["Michael Jordan", "1986-87 Fleer", "57", "Bulls", 3000],
    ["Bill Russell", "1957-58 Topps", "77", "Celtics", 2000],
    ["Lew Alcindor", "1969-70 Topps", "25", "Bucks", 1500],
    ["Michael Jordan", "1986-87 Fleer Sticker", "8", "Bulls", 800],
    ["LeBron James", "2003-04 Topps Chrome", "111", "Cavaliers", 400],
    ["Kobe Bryant", "1996-97 Topps Chrome", "138", "Lakers", 400],
    ["Stephen Curry", "2009-10 Topps Chrome", "101", "Warriors", 250],
    ["Giannis Antetokounmpo", "2013-14 Panini Prizm", "290", "Bucks", 150],
    ["Luka Dončić", "2018-19 Panini Prizm", "280", "Mavericks", 100],
    ["Kevin Durant", "2007-08 Topps Chrome", "131", "SuperSonics", 100],
    ["Dwyane Wade", "2003-04 Topps Chrome", "115", "Heat", 60],
    ["Kobe Bryant", "1996-97 Topps", "138", "Lakers", 40],
    ["Carmelo Anthony", "2003-04 Topps Chrome", "113", "Nuggets", 20],
    ["Zion Williamson", "2019-20 Panini Prizm", "248", "Pelicans", 15],
    ["Ja Morant", "2019-20 Panini Prizm", "249", "Grizzlies", 10],
    ["Chris Bosh", "2003-04 Topps Chrome", "114", "Raptors", 10],
    ["Michael Jordan", "1990-91 Fleer", "26", "Bulls", 8],
    ["Michael Jordan", "1989-90 Hoops", "200", "Bulls", 8],
    ["Michael Jordan", "1990-91 Hoops", "65", "Bulls", 5],
    ["Shaquille O'Neal", "1992-93 Upper Deck", "1", "Magic", 5],
  ];

  // ---------- Pokémon: 1999 Base Set (unlimited) [name, number, type, printed rarity, approx. raw value $] ----------
  const POKE_TYPES = {
    Fire: { icon: "🔥", c1: "#991b1b", c2: "#fb923c" },
    Water: { icon: "💧", c1: "#1e3a8a", c2: "#38bdf8" },
    Grass: { icon: "🍃", c1: "#14532d", c2: "#4ade80" },
    Lightning: { icon: "⚡", c1: "#854d0e", c2: "#facc15" },
    Psychic: { icon: "🔮", c1: "#701a75", c2: "#f0abfc" },
    Fighting: { icon: "👊", c1: "#7c2d12", c2: "#d97706" },
    Colorless: { icon: "⭐", c1: "#44403c", c2: "#d6d3d1" },
  };

  const H = "Holo Rare", R = "Rare", U = "Uncommon", C = "Common";
  const POKEMON = [
    ["Alakazam", 1, "Psychic", H, 40], ["Blastoise", 2, "Water", H, 100], ["Chansey", 3, "Colorless", H, 35],
    ["Charizard", 4, "Fire", H, 350], ["Clefairy", 5, "Colorless", H, 30], ["Gyarados", 6, "Water", H, 40],
    ["Hitmonchan", 7, "Fighting", H, 30], ["Machamp", 8, "Fighting", H, 15], ["Magneton", 9, "Lightning", H, 30],
    ["Mewtwo", 10, "Psychic", H, 40], ["Nidoking", 11, "Grass", H, 35], ["Ninetales", 12, "Fire", H, 40],
    ["Poliwrath", 13, "Water", H, 30], ["Raichu", 14, "Lightning", H, 45], ["Venusaur", 15, "Grass", H, 85],
    ["Zapdos", 16, "Lightning", H, 45],
    ["Beedrill", 17, "Grass", R, 6], ["Dragonair", 18, "Colorless", R, 10], ["Dugtrio", 19, "Fighting", R, 5],
    ["Electabuzz", 20, "Lightning", R, 6], ["Electrode", 21, "Lightning", R, 5], ["Pidgeotto", 22, "Colorless", R, 5],
    ["Arcanine", 23, "Fire", U, 4], ["Charmeleon", 24, "Fire", U, 6], ["Dewgong", 25, "Water", U, 2],
    ["Dratini", 26, "Colorless", U, 2], ["Farfetch'd", 27, "Colorless", U, 2], ["Growlithe", 28, "Fire", U, 2],
    ["Haunter", 29, "Psychic", U, 2], ["Ivysaur", 30, "Grass", U, 5], ["Jynx", 31, "Psychic", U, 2],
    ["Kadabra", 32, "Psychic", U, 2], ["Kakuna", 33, "Grass", U, 1.5], ["Machoke", 34, "Fighting", U, 2],
    ["Magikarp", 35, "Water", U, 3], ["Magmar", 36, "Fire", U, 2], ["Nidorino", 37, "Grass", U, 2],
    ["Poliwhirl", 38, "Water", U, 1.5], ["Porygon", 39, "Colorless", U, 2], ["Raticate", 40, "Colorless", U, 1.5],
    ["Seel", 41, "Water", U, 1.5], ["Wartortle", 42, "Water", U, 5],
    ["Abra", 43, "Psychic", C, 1.5], ["Bulbasaur", 44, "Grass", C, 6], ["Caterpie", 45, "Grass", C, 1.5],
    ["Charmander", 46, "Fire", C, 8], ["Diglett", 47, "Fighting", C, 1.5], ["Doduo", 48, "Colorless", C, 1],
    ["Drowzee", 49, "Psychic", C, 1], ["Gastly", 50, "Psychic", C, 1.5], ["Koffing", 51, "Grass", C, 1],
    ["Machop", 52, "Fighting", C, 1], ["Magnemite", 53, "Lightning", C, 1], ["Metapod", 54, "Grass", C, 1],
    ["Nidoran ♂", 55, "Grass", C, 1], ["Onix", 56, "Fighting", C, 1.5], ["Pidgey", 57, "Colorless", C, 1.5],
    ["Pikachu", 58, "Lightning", C, 5], ["Poliwag", 59, "Water", C, 1], ["Ponyta", 60, "Fire", C, 1.5],
    ["Rattata", 61, "Colorless", C, 1], ["Sandshrew", 62, "Fighting", C, 1], ["Squirtle", 63, "Water", C, 6],
    ["Starmie", 64, "Water", C, 1.5], ["Staryu", 65, "Water", C, 1], ["Tangela", 66, "Grass", C, 1],
    ["Voltorb", 67, "Lightning", C, 1], ["Vulpix", 68, "Fire", C, 2], ["Weedle", 69, "Grass", C, 1],
  ];

  const SPORT_ICON = { baseball: "⚾", football: "🏈", basketball: "🏀" };

  const CARDS = [];

  function addSports(set, rows) {
    rows.forEach(([player, setName, num, team, price]) => {
      const [c1, c2] = TEAMS[team];
      CARDS.push({
        id: `${set}-${slug(`${player} ${setName} ${num}`)}`,
        set,
        name: player,
        rarity: tierFor(price),
        price,
        icon: SPORT_ICON[set],
        sub: `${setName} · ${team}`,
        detail: "#" + num,
        c1,
        c2,
      });
    });
  }

  addSports("baseball", BASEBALL);
  addSports("football", FOOTBALL);
  addSports("basketball", BASKETBALL);

  POKEMON.forEach(([name, num, type, printed, price]) => {
    const t = POKE_TYPES[type];
    CARDS.push({
      id: "pokemon-" + slug(`${name} base ${num}`),
      set: "pokemon",
      name,
      rarity: tierFor(price),
      label: printed, // show the card's printed rarity instead of the value tier
      price,
      icon: t.icon,
      sub: `Base Set · ${type}`,
      detail: `${num}/102`,
      c1: t.c1,
      c2: t.c2,
    });
  });

  const SETS = {
    baseball: { name: "Baseball" },
    football: { name: "Football" },
    basketball: { name: "Basketball" },
    pokemon: { name: "Pokémon Base Set" },
  };

  // Odds by value tier. `weights` = normal slots, `hit` = the last (guaranteed hit) slot.
  // Tiers a set has no cards in are skipped. Pack prices are calculated from expected value.
  const STANDARD = {
    weights: { common: 80, uncommon: 18, rare: 2 },
    hit: { uncommon: 64.9, rare: 30, ultra: 5, secret: 0.1 },
  };
  const ELITE = {
    weights: { common: 50, uncommon: 40, rare: 9, ultra: 1 },
    hit: { rare: 74, ultra: 25, secret: 1 },
  };

  const PACKS = [
    { id: "baseball-hobby", set: "baseball", name: "Hobby Pack", icon: "⚾", c1: "#0c2340", c2: "#2563eb", ...STANDARD },
    { id: "baseball-elite", set: "baseball", name: "Elite Pack", icon: "💎", c1: "#111827", c2: "#d4a017", ...ELITE },
    { id: "football-hobby", set: "football", name: "Hobby Pack", icon: "🏈", c1: "#3f1d0b", c2: "#16a34a", ...STANDARD },
    { id: "football-elite", set: "football", name: "Elite Pack", icon: "🏆", c1: "#111827", c2: "#b91c1c", ...ELITE },
    { id: "basketball-hobby", set: "basketball", name: "Hobby Pack", icon: "🏀", c1: "#7c2d12", c2: "#f97316", ...STANDARD },
    { id: "basketball-elite", set: "basketball", name: "Elite Pack", icon: "👑", c1: "#1e1b4b", c2: "#a855f7", ...ELITE },
    { id: "pokemon-booster", set: "pokemon", name: "Booster Pack", icon: "⚡", c1: "#1d4ed8", c2: "#facc15", ...STANDARD },
    { id: "pokemon-premium", set: "pokemon", name: "Premium Pack", icon: "🔥", c1: "#7f1d1d", c2: "#f59e0b", ...ELITE },
  ].map((p) => ({ cards: 5, ...p }));

  return { RARITIES, TIER_LABEL, TIER_RANGE, CARDS, SETS, PACKS, tierFor };
})();
