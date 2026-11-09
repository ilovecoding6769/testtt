// Downloads live TCGplayer market prices for the Pokémon Base Set (base1)
// from the Pokémon TCG API (https://pokemontcg.io) and writes data/pokemon-prices.json.
// Runs in GitHub Actions before each deploy. Only prices are used, no card images.
//
// Optional: add a free API key as the repo secret POKEMONTCG_API_KEY for higher rate limits.

import { mkdir, writeFile } from "node:fs/promises";

const SET_ID = "base1";
const PAGE_SIZE = 25;
const headers = process.env.POKEMONTCG_API_KEY ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY } : {};

// Prefer the unlimited printing; ignore 1st Edition prices
const PRICE_KEYS = ["holofoil", "normal", "unlimitedHolofoil", "unlimited", "reverseHolofoil"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPage(page) {
  const url =
    `https://api.pokemontcg.io/v2/cards?q=set.id:${SET_ID}` +
    `&pageSize=${PAGE_SIZE}&page=${page}&orderBy=number&select=number,name,tcgplayer`;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const text = await res.text();
        if (text) return JSON.parse(text);
      }
      console.warn(`Page ${page}, attempt ${attempt}: HTTP ${res.status}`);
    } catch (err) {
      console.warn(`Page ${page}, attempt ${attempt}: ${err.message}`);
    }
    await sleep(3000 * attempt);
  }
  throw new Error(`Could not fetch page ${page}`);
}

function pickPrice(prices = {}) {
  for (const key of PRICE_KEYS) {
    const p = prices[key];
    if (p && (p.market || p.mid)) return p.market || p.mid;
  }
  return null;
}

const cards = [];
for (let page = 1; ; page++) {
  const json = await getPage(page);
  cards.push(...json.data);
  if (cards.length >= json.totalCount || json.data.length === 0) break;
}

const prices = {};
let latest = "";
for (const card of cards) {
  const price = pickPrice(card.tcgplayer?.prices);
  if (price) prices[card.number] = Math.round(price * 100) / 100;
  if (card.tcgplayer?.updatedAt > latest) latest = card.tcgplayer.updatedAt;
}

const count = Object.keys(prices).length;
if (count < 20) throw new Error(`Only got prices for ${count} cards, not writing file`);

await mkdir("data", { recursive: true });
await writeFile(
  "data/pokemon-prices.json",
  JSON.stringify(
    {
      source: "TCGplayer market price via pokemontcg.io",
      set: SET_ID,
      pricesUpdated: latest.replaceAll("/", "-"),
      fetchedAt: new Date().toISOString(),
      prices,
    },
    null,
    2
  )
);
console.log(`Saved prices for ${count} cards (TCGplayer data from ${latest}).`);
