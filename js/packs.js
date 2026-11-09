// Pack opener: buying, ripping, revealing, keeping/selling cards.
(async function () {
  const { RARITIES, TIER_LABEL, TIER_RANGE, CARDS, SETS, PACKS, tierFor } = window.CardData;

  // Live Pokémon prices: data/pokemon-prices.json is written by the deploy workflow.
  // If it is missing or slow, the built-in estimates are used instead.
  async function loadLivePrices() {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const hour = new Date().toISOString().slice(0, 13);
      const res = await fetch("data/pokemon-prices.json?h=" + hour, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      let count = 0;
      CARDS.forEach((c) => {
        if (c.set !== "pokemon") return;
        const p = data.prices[c.detail.split("/")[0]];
        if (p > 0) {
          c.price = Math.round(p * 100) / 100;
          c.rarity = tierFor(c.price);
          count++;
        }
      });
      return count ? { updated: data.pricesUpdated, count } : null;
    } catch {
      return null;
    }
  }

  const live = await loadLivePrices();
  const note = document.getElementById("price-note");
  if (note) {
    note.textContent = live
      ? `Pokémon values: live TCGplayer market prices (updated ${live.updated}). Sports values: estimates.`
      : "Pokémon and sports values: estimates (live Pokémon prices unavailable right now).";
    note.classList.toggle("live", !!live);
  }

  const START_BALANCE = 10000;
  const SELL_RATE = 0.85; // sell back for 85% of card value
  const HOUSE_EDGE = 1.1; // pack price = expected value + 10%
  const STORAGE_KEY = "packRipState.v2";

  // Every pulled card comes back graded. `w` = chance weight, `m` = value multiplier
  // versus the raw (ungraded) price. Multipliers are rough hobby averages, not live data.
  const GRADES = [
    { g: 10, name: "Gem Mint", w: 6, m: 5 },
    { g: 9, name: "Mint", w: 22, m: 2.2 },
    { g: 8, name: "NM-MT", w: 27, m: 1.4 },
    { g: 7, name: "Near Mint", w: 18, m: 1.05 },
    { g: 6, name: "EX-MT", w: 11, m: 0.85 },
    { g: 5, name: "Excellent", w: 7, m: 0.7 },
    { g: 4, name: "VG-EX", w: 4.5, m: 0.55 },
    { g: 3, name: "Very Good", w: 2.5, m: 0.45 },
    { g: 2, name: "Good", w: 1.5, m: 0.35 },
    { g: 1, name: "Poor", w: 0.5, m: 0.25 },
  ];
  const GRADE_BY_NUM = Object.fromEntries(GRADES.map((x) => [x.g, x]));
  const GRADE_TOTAL = GRADES.reduce((s, x) => s + x.w, 0);
  const GRADE_EV = GRADES.reduce((s, x) => s + (x.w / GRADE_TOTAL) * x.m, 0);

  function rollGrade() {
    let r = Math.random() * GRADE_TOTAL;
    for (const x of GRADES) if ((r -= x.w) <= 0) return x.g;
    return 8;
  }

  const BY_ID = {};
  const POOL = {};
  CARDS.forEach((c) => {
    BY_ID[c.id] = c;
    POOL[c.set] = POOL[c.set] || {};
    (POOL[c.set][c.rarity] = POOL[c.set][c.rarity] || []).push(c);
  });

  // Drop tiers a set has no cards in, then price each pack from its expected value
  function usable(set, weights) {
    const out = {};
    for (const [r, w] of Object.entries(weights)) if (POOL[set][r]) out[r] = w;
    return out;
  }
  function slotEV(set, weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    return Object.entries(weights).reduce((sum, [r, w]) => {
      const list = POOL[set][r];
      return sum + (w / total) * (list.reduce((s, c) => s + c.price, 0) / list.length);
    }, 0);
  }
  function nicePrice(n) {
    if (n < 100) return Math.max(5, Math.round(n));
    if (n < 1000) return Math.round(n / 5) * 5;
    return Math.round(n / 25) * 25;
  }
  PACKS.forEach((p) => {
    p.weights = usable(p.set, p.weights);
    p.hit = usable(p.set, p.hit);
    p.ev = ((p.cards - 1) * slotEV(p.set, p.weights) + slotEV(p.set, p.hit)) * GRADE_EV;
    p.price = nicePrice(p.ev * HOUSE_EDGE);
  });

  // ---------- State ----------
  function freshState() {
    return { balance: START_BALANCE, collection: [], stats: { opened: 0, spent: 0, best: null } };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        s.collection = (s.collection || []).filter((p) => BY_ID[p.cardId]);
        return s;
      }
    } catch {}
    return freshState();
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  let state = load();
  let current = null; // the pack being opened

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const round2 = (n) => Math.round(n * 100) / 100;
  const rarityRank = (r) => RARITIES.indexOf(r);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function pickRarity(weights) {
    const entries = Object.entries(weights);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [rarity, w] of entries) {
      if ((r -= w) <= 0) return rarity;
    }
    return entries[entries.length - 1][0];
  }

  function makePull(set, rarity) {
    const list = POOL[set][rarity];
    const card = list[Math.floor(Math.random() * list.length)];
    return { uid: uid(), cardId: card.id, grade: rollGrade(), at: Date.now() };
  }

  // Value of a pulled card = raw price × grade multiplier (older ungraded pulls count as raw)
  function pullValue(p) {
    const g = GRADE_BY_NUM[p.grade];
    return round2(BY_ID[p.cardId].price * (g ? g.m : 1));
  }

  function generatePack(pack) {
    const pulls = [];
    for (let i = 0; i < pack.cards - 1; i++) pulls.push(makePull(pack.set, pickRarity(pack.weights)));
    pulls.push(makePull(pack.set, pickRarity(pack.hit)));
    // Reveal order: lowest value first, best last
    return pulls.sort((a, b) => pullValue(a) - pullValue(b));
  }

  function collectionValue() {
    return round2(state.collection.reduce((s, p) => s + pullValue(p), 0));
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // ---------- Templates ----------
  function cardHTML(pull) {
    const c = BY_ID[pull.cardId];
    const card = `
      <div class="tcard r-${c.rarity}" style="--c1:${c.c1};--c2:${c.c2}">
        <div class="tcard-head"><span class="tcard-name">${c.name}</span><span class="tcard-detail">${c.detail}</span></div>
        <div class="tcard-art"><span class="tcard-icon">${c.icon}</span></div>
        <div class="tcard-sub"><span class="sub-text">${c.sub}</span></div>
        <div class="tcard-foot"><span class="rarity-tag">${c.label || TIER_LABEL[c.rarity]}</span><span class="tcard-price">${money(pullValue(pull))}</span></div>
      </div>`;
    const g = GRADE_BY_NUM[pull.grade];
    if (!g) return card; // older ungraded pulls
    const setLine = c.sub.split(" · ")[0];
    return `
      <div class="slab g${g.g}">
        <div class="slab-label">
          <div class="slab-info">
            <span class="slab-set">${setLine} ${c.detail}</span>
            <span class="slab-name">${c.name}</span>
            <span class="slab-raw">Raw ${money(c.price)}</span>
          </div>
          <div class="slab-grade"><b>${g.g}</b><span>${g.name}</span></div>
        </div>
        <div class="slab-window">${card}</div>
      </div>`;
  }

  function packArtHTML(pack, extra = "") {
    return `
      <div class="pack ${extra}" style="--p1:${pack.c1};--p2:${pack.c2}">
        <div class="pack-crimp pack-top"></div>
        <div class="pack-body">
          <div class="pack-set">${SETS[pack.set].name}</div>
          <div class="pack-icon">${pack.icon}</div>
          <div class="pack-name">${pack.name}</div>
          <div class="pack-count">${pack.cards} cards · 1 guaranteed hit</div>
        </div>
        <div class="pack-crimp pack-bottom"></div>
      </div>`;
  }

  function oddsHTML(pack) {
    const pct = (weights) => {
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      return RARITIES.filter((r) => weights[r])
        .map((r) => `<li><span class="dot d-${r}"></span>${TIER_LABEL[r]} <small>(${TIER_RANGE[r]})</small> <b>${((weights[r] / total) * 100).toFixed(2).replace(/\.?0+$/, "")}%</b></li>`)
        .join("");
    };
    return `
      <details class="odds">
        <summary>View odds</summary>
        <p>Cards 1–${pack.cards - 1}</p><ul>${pct(pack.weights)}</ul>
        <p>Hit card</p><ul>${pct(pack.hit)}</ul>
        <p>Grade (every card)</p><ul>${GRADES.map(
          (x) => `<li>${x.g} ${x.name} <small>(×${x.m} raw)</small> <b>${((x.w / GRADE_TOTAL) * 100).toFixed(1).replace(/\.0$/, "")}%</b></li>`
        ).join("")}</ul>
      </details>`;
  }

  // ---------- Render ----------
  function renderWallet() {
    const value = collectionValue();
    const pl = round2(state.balance + value - START_BALANCE);
    $("#w-balance").textContent = money(state.balance);
    $("#w-value").textContent = money(value);
    $("#w-opened").textContent = state.stats.opened;
    const plEl = $("#w-pl");
    plEl.textContent = (pl >= 0 ? "+" : "−") + money(Math.abs(pl));
    plEl.className = pl >= 0 ? "pos" : "neg";
    const best = state.stats.best && BY_ID[state.stats.best.cardId] && state.stats.best;
    $("#w-best").textContent = best
      ? `${BY_ID[best.cardId].name}${best.grade ? " (" + best.grade + ")" : ""} ${money(pullValue(best))}`
      : "—";
  }

  function renderShop() {
    $("#pack-grid").innerHTML = PACKS.map(
      (p) => `
      <div class="pack-tile">
        ${packArtHTML(p)}
        <div class="pack-info">
          <h3>${SETS[p.set].name}: ${p.name}</h3>
          <div class="pack-price">${money(p.price)}</div>
          <div class="pack-ev">Expected value ${money(p.ev)}</div>
          <button class="btn buy" data-pack="${p.id}">Rip pack</button>
          ${oddsHTML(p)}
        </div>
      </div>`
    ).join("");
  }

  function renderCollection() {
    const filter = $("#c-filter").value;
    const sort = $("#c-sort").value;
    let items = state.collection.filter((p) => filter === "all" || BY_ID[p.cardId].set === filter);
    items.sort((a, b) => {
      const ca = BY_ID[a.cardId], cb = BY_ID[b.cardId];
      if (sort === "value") return pullValue(b) - pullValue(a);
      if (sort === "rarity") return rarityRank(cb.rarity) - rarityRank(ca.rarity) || pullValue(b) - pullValue(a);
      if (sort === "grade") return (b.grade || 0) - (a.grade || 0) || pullValue(b) - pullValue(a);
      return b.at - a.at;
    });

    $("#c-count").textContent = `${items.length} card${items.length === 1 ? "" : "s"}`;
    $("#collection-grid").innerHTML = items.length
      ? items
          .map(
            (p) => `
        <div class="coll-item">
          ${cardHTML(p)}
          <button class="btn-small sell" data-uid="${p.uid}">Sell ${money(round2(pullValue(p) * SELL_RATE))}</button>
        </div>`
          )
          .join("")
      : `<p class="empty">No cards yet. Rip a pack to start your collection.</p>`;
  }

  function renderAll() {
    renderWallet();
    renderCollection();
  }

  // ---------- Opening flow ----------
  const overlay = $("#overlay");
  const stage = $("#stage");
  const controls = $("#controls");

  function startOpening(packId) {
    const pack = PACKS.find((p) => p.id === packId);
    if (state.balance < pack.price) {
      toast("Not enough play money. Sell some cards or reset.");
      return;
    }
    state.balance = round2(state.balance - pack.price);
    state.stats.opened++;
    state.stats.spent = round2(state.stats.spent + pack.price);
    save();
    renderWallet();

    current = { pack, pulls: generatePack(pack), revealed: 0, settled: false };
    stage.innerHTML = `<p class="rip-hint">Tap the pack to rip it open</p>${packArtHTML(pack, "big shake")}`;
    controls.innerHTML = "";
    overlay.hidden = false;
    document.body.classList.add("no-scroll");

    stage.querySelector(".pack").addEventListener(
      "click",
      (e) => {
        e.currentTarget.classList.remove("shake");
        e.currentTarget.classList.add("torn");
        setTimeout(showCards, 600);
      },
      { once: true }
    );
  }

  function showCards() {
    stage.innerHTML = `
      <p class="rip-hint">Tap each card to flip it</p>
      <div class="reveal-row">
        ${current.pulls
          .map(
            (p, i) => `
          <div class="flip" data-i="${i}" style="--d:${i * 90}ms">
            <div class="flip-inner">
              <div class="flip-back"><span>★</span></div>
              <div class="flip-front">${cardHTML(p)}</div>
            </div>
          </div>`
          )
          .join("")}
      </div>`;
    controls.innerHTML = `<button class="btn" id="reveal-all">Reveal all</button>`;
  }

  // Dramatic reveal thresholds (graded value)
  const BIG_HIT = 500;
  const GRAIL_HIT = 5000;

  function reveal(el) {
    if (!el || el.classList.contains("flipped") || el.classList.contains("suspense")) return;
    const pull = current.pulls[+el.dataset.i];
    const value = pullValue(pull);
    const level = value >= GRAIL_HIT ? "grail" : value >= BIG_HIT ? "big" : null;
    if (!level) return flip(el, pull);

    // Build suspense: rumble + glow while the rest of the pack dims, then the big reveal
    el.classList.add("suspense", "suspense-" + level);
    overlay.classList.add("dim");
    setTimeout(() => {
      el.classList.remove("suspense", "suspense-" + level);
      overlay.classList.remove("dim");
      flip(el, pull);
      celebrate(level, pull, value);
    }, level === "grail" ? 2000 : 1300);
  }

  function celebrate(level, pull, value) {
    const card = BY_ID[pull.cardId];
    const colors = level === "grail"
      ? ["#fbbf24", "#fde68a", "#f59e0b", "#ffffff", "#facc15"]
      : ["#60a5fa", "#e879f9", "#4ade80", "#facc15", "#ffffff"];
    const count = level === "grail" ? 140 : 70;
    let bits = "";
    for (let i = 0; i < count; i++) {
      bits += `<i style="--x:${(Math.random() * 2 - 1) * 48}vw;--y:${-(25 + Math.random() * 55)}vh;--r:${Math.round(Math.random() * 1080 - 540)}deg;--c:${colors[i % colors.length]};--t:${(1.6 + Math.random() * 1.4).toFixed(2)}s;--dl:${(Math.random() * 0.25).toFixed(2)}s"></i>`;
    }
    const fx = document.createElement("div");
    fx.className = "fx fx-" + level;
    fx.innerHTML = `
      <div class="fx-flash"></div>
      <div class="fx-ring"></div><div class="fx-ring r2"></div>
      <div class="fx-confetti">${bits}</div>
      <div class="fx-banner">
        <span>${level === "grail" ? "GRAIL PULL!" : "BIG HIT!"}</span>
        <b>${card.name}${pull.grade ? " · Grade " + pull.grade : ""}</b>
        <em>${money(value)}</em>
      </div>`;
    overlay.appendChild(fx);
    stage.classList.add(level === "grail" ? "quake-big" : "quake");
    setTimeout(() => stage.classList.remove("quake", "quake-big"), 800);
    try { if (navigator.vibrate) navigator.vibrate(level === "grail" ? [120, 60, 240] : 90); } catch {}
    setTimeout(() => fx.remove(), level === "grail" ? 4200 : 3200);
  }

  function flip(el, pull) {
    const card = BY_ID[pull.cardId];
    el.classList.add("flipped");
    if (rarityRank(card.rarity) >= 2) el.classList.add("hit", "hit-" + card.rarity);
    if (pull.grade === 10) el.classList.add("hit", "hit-gem");
    current.revealed++;
    if (current.revealed === current.pulls.length) setTimeout(showSummary, 700);
  }

  function packTotal() {
    return round2(current.pulls.reduce((s, p) => s + pullValue(p), 0));
  }

  function showSummary() {
    const total = packTotal();
    const diff = round2(total - current.pack.price);
    controls.innerHTML = `
      <div class="summary">
        <div>Pack value <b>${money(total)}</b> · cost ${money(current.pack.price)}
          <span class="${diff >= 0 ? "pos" : "neg"}">(${diff >= 0 ? "+" : "−"}${money(Math.abs(diff))})</span></div>
        <div class="summary-actions">
          <button class="btn" id="keep-all">Keep all</button>
          <button class="btn btn-ghost" id="sell-all">Sell all for ${money(round2(total * SELL_RATE))}</button>
        </div>
      </div>`;
  }

  function settle(mode) {
    if (!current || current.settled) return;
    current.settled = true;
    if (mode === "sell") {
      state.balance = round2(state.balance + packTotal() * SELL_RATE);
    } else {
      state.collection.push(...current.pulls);
    }
    const top = current.pulls.reduce((a, b) => (pullValue(b) > pullValue(a) ? b : a));
    const best = state.stats.best;
    if (!best || !BY_ID[best.cardId] || pullValue(top) > pullValue(best)) {
      state.stats.best = { cardId: top.cardId, grade: top.grade };
    }
    save();
    renderAll();
  }

  function afterSettle(mode) {
    settle(mode);
    controls.innerHTML = `
      <div class="summary">
        <div>${mode === "sell" ? "Sold! Play money added to your balance." : "Added to your collection."}</div>
        <div class="summary-actions">
          <button class="btn" id="again">Rip another (${money(current.pack.price)})</button>
          <button class="btn btn-ghost" id="close-overlay">Done</button>
        </div>
      </div>`;
  }

  function closeOverlay() {
    if (current && !current.settled) settle("keep"); // closing early keeps the cards
    overlay.hidden = true;
    document.body.classList.remove("no-scroll");
    current = null;
  }

  // ---------- Events ----------
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest(".buy")) return startOpening(t.closest(".buy").dataset.pack);
    if (t.closest(".flip")) return reveal(t.closest(".flip"));
    if (t.id === "reveal-all") {
      // Flip cards one by one; wait out the suspense on big hits before moving on
      const rest = [...document.querySelectorAll(".flip:not(.flipped)")];
      let delay = 0;
      rest.forEach((el) => {
        setTimeout(() => reveal(el), delay);
        const v = pullValue(current.pulls[+el.dataset.i]);
        delay += v >= GRAIL_HIT ? 3200 : v >= BIG_HIT ? 2300 : 250;
      });
      t.remove();
      return;
    }
    if (t.id === "keep-all") return afterSettle("keep");
    if (t.id === "sell-all") return afterSettle("sell");
    if (t.id === "again") {
      const id = current.pack.id;
      closeOverlay();
      return startOpening(id);
    }
    if (t.id === "close-overlay" || t.closest(".overlay-close")) return closeOverlay();
    if (t.closest(".sell")) {
      const id = t.closest(".sell").dataset.uid;
      const idx = state.collection.findIndex((p) => p.uid === id);
      if (idx > -1) {
        const card = BY_ID[state.collection[idx].cardId];
        const gain = round2(pullValue(state.collection[idx]) * SELL_RATE);
        state.balance = round2(state.balance + gain);
        state.collection.splice(idx, 1);
        save();
        renderAll();
        toast(`Sold ${card.name} for ${money(gain)}`);
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeOverlay();
  });

  $("#c-filter").addEventListener("change", renderCollection);
  $("#c-sort").addEventListener("change", renderCollection);

  $("#sell-bulk").addEventListener("click", () => {
    const bulk = state.collection.filter((p) => rarityRank(BY_ID[p.cardId].rarity) <= 1);
    if (!bulk.length) return toast("No commons or uncommons to sell.");
    const gain = round2(bulk.reduce((s, p) => s + pullValue(p) * SELL_RATE, 0));
    state.collection = state.collection.filter((p) => rarityRank(BY_ID[p.cardId].rarity) > 1);
    state.balance = round2(state.balance + gain);
    save();
    renderAll();
    toast(`Sold ${bulk.length} bulk cards for ${money(gain)}`);
  });

  $("#reset").addEventListener("click", () => {
    if (!confirm("Reset your balance and delete your whole collection?")) return;
    state = freshState();
    save();
    renderAll();
    toast("Reset to " + money(START_BALANCE));
  });

  renderShop();
  renderAll();
})();
