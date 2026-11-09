// Card data for the pack opener. All players, teams and creatures are fictional.
// To use your own cards, edit the lists below (or replace CARDS entirely).
// Prices are fake "market values" in play money.

window.CardData = (function () {
  const RARITIES = ["common", "uncommon", "rare", "ultra", "secret"];
  const RARITY_LABEL = {
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    ultra: "Ultra Rare",
    secret: "Secret Rare",
  };

  // Fake price range per rarity (USD play money)
  const PRICE_RANGE = {
    common: [0.25, 2],
    uncommon: [2, 9],
    rare: [12, 65],
    ultra: [90, 450],
    secret: [600, 4800],
  };

  // Deterministic 0..1 number from a string, so prices stay the same every visit
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  function priceFor(name, rarity) {
    const [min, max] = PRICE_RANGE[rarity];
    const t = hash(name + rarity);
    return Math.round((min + (max - min) * t * t) * 100) / 100;
  }

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  // ---------- Sports set ----------
  const TEAMS = [
    { name: "Harbor City Hawks", c1: "#1e3a8a", c2: "#f59e0b" },
    { name: "Desert Vipers", c1: "#9a3412", c2: "#fcd34d" },
    { name: "Northside Wolves", c1: "#1f2937", c2: "#60a5fa" },
    { name: "Bay Mariners", c1: "#115e59", c2: "#5eead4" },
    { name: "Iron Valley Titans", c1: "#7f1d1d", c2: "#f87171" },
    { name: "Summit Peaks", c1: "#4c1d95", c2: "#c4b5fd" },
  ];

  const SPORT_ICON = { basketball: "🏀", football: "🏈", baseball: "⚾", soccer: "⚽", hockey: "🏒" };

  // [name, team index, sport, position, rarity]
  const SPORTS = [
    ["Corbin Ashwell", 0, "basketball", "G", "common"],
    ["Teo Valdane", 1, "baseball", "SS", "common"],
    ["Rhett Kosinski", 2, "football", "LB", "common"],
    ["Milo Brandvold", 3, "soccer", "MF", "common"],
    ["Daxton Pryor", 4, "hockey", "D", "common"],
    ["Quincy Okafor-Lane", 5, "basketball", "F", "common"],
    ["Jory Fenwick", 0, "football", "WR", "common"],
    ["Silas Marchetti", 1, "soccer", "DF", "common"],
    ["Bram Holloway", 2, "baseball", "C", "common"],
    ["Ezra Quillon", 3, "hockey", "LW", "common"],
    ["Nico Dunmore", 4, "basketball", "C", "common"],
    ["Trace Albury", 5, "football", "TE", "common"],
    ["Kellan Strade", 0, "baseball", "RF", "common"],
    ["Ollie Penhart", 1, "hockey", "G", "common"],
    ["Ravi Castellan", 2, "soccer", "FW", "uncommon"],
    ["Lucan Merriwether", 3, "basketball", "G", "uncommon"],
    ["Boone Halvorsen", 4, "football", "RB", "uncommon"],
    ["Ansel Wickham", 5, "baseball", "P", "uncommon"],
    ["Torin Blackwood", 0, "hockey", "C", "uncommon"],
    ["Cassius Rendell", 1, "basketball", "F", "uncommon"],
    ["Emrys Talbot", 2, "soccer", "GK", "uncommon"],
    ["Jaxon Verhoeven", 3, "football", "S", "uncommon"],
    ["Marek Solberg", 4, "baseball", "1B", "rare"],
    ["Darius Kingsley", 5, "football", "QB", "rare"],
    ["Idris Montclair", 0, "soccer", "FW", "rare"],
    ["Royce Tennant", 1, "hockey", "RW", "rare"],
    ["Zeke Abernathy", 2, "basketball", "G", "rare"],
    ["August Vireo", 3, "baseball", "CF", "ultra"],
    ["Kaius Moreland", 4, "basketball", "F", "ultra"],
    ["Lennox Hart", 5, "football", "QB", "ultra"],
    ["Orion Castellano", 0, "basketball", "G", "secret"],
    ["Thaddeus Rook", 3, "football", "QB", "secret"],
  ];

  // ---------- Creature set ----------
  const TYPES = {
    Fire: { c1: "#991b1b", c2: "#fb923c" },
    Water: { c1: "#1e3a8a", c2: "#38bdf8" },
    Grass: { c1: "#14532d", c2: "#4ade80" },
    Electric: { c1: "#854d0e", c2: "#facc15" },
    Psychic: { c1: "#701a75", c2: "#f0abfc" },
    Shadow: { c1: "#111827", c2: "#8b5cf6" },
    Dragon: { c1: "#312e81", c2: "#f59e0b" },
    Frost: { c1: "#155e75", c2: "#cffafe" },
  };

  // [name, type, emoji, HP, rarity]
  const CREATURES = [
    ["Cindertail", "Fire", "🦊", 60, "common"],
    ["Puddlequack", "Water", "🦆", 50, "common"],
    ["Sproutling", "Grass", "🌱", 40, "common"],
    ["Zapbug", "Electric", "🐞", 40, "common"],
    ["Mothmist", "Psychic", "🦋", 50, "common"],
    ["Gloomrat", "Shadow", "🐀", 50, "common"],
    ["Snowpip", "Frost", "🐧", 60, "common"],
    ["Emberhog", "Fire", "🐗", 70, "common"],
    ["Ripplefin", "Water", "🐟", 50, "common"],
    ["Thornback", "Grass", "🦔", 60, "common"],
    ["Staticat", "Electric", "🐱", 50, "common"],
    ["Owlbright", "Psychic", "🦉", 60, "common"],
    ["Duskbat", "Shadow", "🦇", 50, "common"],
    ["Frostkit", "Frost", "🐇", 40, "common"],
    ["Blazemane", "Fire", "🦁", 90, "uncommon"],
    ["Tidecrab", "Water", "🦀", 80, "uncommon"],
    ["Mosswarden", "Grass", "🐢", 100, "uncommon"],
    ["Voltwing", "Electric", "🦅", 80, "uncommon"],
    ["Mindcoil", "Psychic", "🐙", 80, "uncommon"],
    ["Nightprowl", "Shadow", "🐺", 90, "uncommon"],
    ["Glacierhorn", "Frost", "🦌", 100, "uncommon"],
    ["Scalewyrm", "Dragon", "🦎", 90, "uncommon"],
    ["Infernox", "Fire", "🐉", 140, "rare"],
    ["Abyssal Ray", "Water", "🐋", 130, "rare"],
    ["Elder Oakheart", "Grass", "🌳", 150, "rare"],
    ["Stormhowler", "Electric", "⚡", 130, "rare"],
    ["Hexmirror", "Psychic", "🔮", 120, "rare"],
    ["Voidmaw", "Shadow", "🦂", 160, "ultra"],
    ["Aurora Drake", "Frost", "❄️", 170, "ultra"],
    ["Sunscale Titan", "Dragon", "🐲", 180, "ultra"],
    ["Celestix", "Psychic", "🌟", 200, "secret"],
    ["Primordial Flame", "Dragon", "🔥", 220, "secret"],
  ];

  const CARDS = [];

  SPORTS.forEach(([name, teamIdx, sport, pos, rarity]) => {
    const team = TEAMS[teamIdx];
    CARDS.push({
      id: "sports-" + slug(name),
      set: "sports",
      name,
      rarity,
      price: priceFor(name, rarity),
      icon: SPORT_ICON[sport],
      sub: team.name,
      detail: pos,
      c1: team.c1,
      c2: team.c2,
    });
  });

  CREATURES.forEach(([name, type, emoji, hp, rarity]) => {
    const t = TYPES[type];
    CARDS.push({
      id: "creatures-" + slug(name),
      set: "creatures",
      name,
      rarity,
      price: priceFor(name, rarity),
      icon: emoji,
      sub: type + " type",
      detail: "HP " + hp,
      c1: t.c1,
      c2: t.c2,
    });
  });

  const SETS = {
    sports: { name: "Grand Slam Series" },
    creatures: { name: "Elemental Wilds" },
  };

  // Packs: `weights` = odds for normal slots, `hit` = odds for the last (guaranteed hit) slot
  const PACKS = [
    {
      id: "sports-hobby",
      set: "sports",
      name: "Hobby Pack",
      price: 59,
      cards: 5,
      icon: "🏆",
      c1: "#1e3a8a",
      c2: "#0ea5e9",
      weights: { common: 72, uncommon: 24, rare: 3.6, ultra: 0.36, secret: 0.04 },
      hit: { uncommon: 55, rare: 40, ultra: 4.5, secret: 0.5 },
    },
    {
      id: "sports-elite",
      set: "sports",
      name: "Elite Box Pack",
      price: 249,
      cards: 5,
      icon: "💎",
      c1: "#111827",
      c2: "#d4a017",
      weights: { common: 45, uncommon: 40, rare: 12, ultra: 2.7, secret: 0.3 },
      hit: { rare: 70, ultra: 26, secret: 4 },
    },
    {
      id: "creatures-booster",
      set: "creatures",
      name: "Booster Pack",
      price: 59,
      cards: 5,
      icon: "🌿",
      c1: "#166534",
      c2: "#f97316",
      weights: { common: 72, uncommon: 24, rare: 3.6, ultra: 0.36, secret: 0.04 },
      hit: { uncommon: 55, rare: 40, ultra: 4.5, secret: 0.5 },
    },
    {
      id: "creatures-premium",
      set: "creatures",
      name: "Premium Pack",
      price: 249,
      cards: 5,
      icon: "🐲",
      c1: "#3b0764",
      c2: "#ec4899",
      weights: { common: 45, uncommon: 40, rare: 12, ultra: 2.7, secret: 0.3 },
      hit: { rare: 70, ultra: 26, secret: 4 },
    },
  ];

  return { RARITIES, RARITY_LABEL, CARDS, SETS, PACKS };
})();
