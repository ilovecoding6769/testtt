// Pack opener: buying, ripping, revealing, keeping/selling cards.
(function () {
  const { RARITIES, RARITY_LABEL, CARDS, SETS, PACKS } = window.CardData;

  const START_BALANCE = 1000;
  const SELL_RATE = 0.85; // sell back for 85% of card value
  const SERIAL_RUN = { rare: 199, ultra: 25, secret: 1 };
  const STORAGE_KEY = "packRipState.v1";

  const BY_ID = {};
  const POOL = {};
  CARDS.forEach((c) => {
    BY_ID[c.id] = c;
    POOL[c.set] = POOL[c.set] || {};
    (POOL[c.set][c.rarity] = POOL[c.set][c.rarity] || []).push(c);
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
    let serial = null;
    if (set === "sports" && SERIAL_RUN[rarity]) {
      const run = SERIAL_RUN[rarity];
      serial = run === 1 ? "1/1" : String(1 + Math.floor(Math.random() * run)).padStart(3, "0") + "/" + run;
    }
    return { uid: uid(), cardId: card.id, serial, at: Date.now() };
  }

  function generatePack(pack) {
    const pulls = [];
    for (let i = 0; i < pack.cards - 1; i++) pulls.push(makePull(pack.set, pickRarity(pack.weights)));
    pulls.push(makePull(pack.set, pickRarity(pack.hit)));
    // Reveal order: worst first, best last
    return pulls.sort((a, b) => {
      const ca = BY_ID[a.cardId], cb = BY_ID[b.cardId];
      return rarityRank(ca.rarity) - rarityRank(cb.rarity) || ca.price - cb.price;
    });
  }

  function collectionValue() {
    return round2(state.collection.reduce((s, p) => s + BY_ID[p.cardId].price, 0));
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
    return `
      <div class="tcard r-${c.rarity}" style="--c1:${c.c1};--c2:${c.c2}">
        <div class="tcard-head"><span class="tcard-name">${c.name}</span><span class="tcard-detail">${c.detail}</span></div>
        <div class="tcard-art"><span class="tcard-icon">${c.icon}</span></div>
        <div class="tcard-sub">${c.sub}${pull.serial ? `<span class="serial">${pull.serial}</span>` : ""}</div>
        <div class="tcard-foot"><span class="rarity-tag">${RARITY_LABEL[c.rarity]}</span><span class="tcard-price">${money(c.price)}</span></div>
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
        .map((r) => `<li><span class="dot d-${r}"></span>${RARITY_LABEL[r]} <b>${((weights[r] / total) * 100).toFixed(2).replace(/\.?0+$/, "")}%</b></li>`)
        .join("");
    };
    return `
      <details class="odds">
        <summary>View odds</summary>
        <p>Cards 1–${pack.cards - 1}</p><ul>${pct(pack.weights)}</ul>
        <p>Hit card</p><ul>${pct(pack.hit)}</ul>
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
    const best = state.stats.best && BY_ID[state.stats.best.cardId];
    $("#w-best").textContent = best ? `${best.name} (${money(best.price)})` : "—";
  }

  function renderShop() {
    $("#pack-grid").innerHTML = PACKS.map(
      (p) => `
      <div class="pack-tile">
        ${packArtHTML(p)}
        <div class="pack-info">
          <h3>${SETS[p.set].name}: ${p.name}</h3>
          <div class="pack-price">${money(p.price)}</div>
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
      if (sort === "value") return cb.price - ca.price;
      if (sort === "rarity") return rarityRank(cb.rarity) - rarityRank(ca.rarity) || cb.price - ca.price;
      return b.at - a.at;
    });

    $("#c-count").textContent = `${items.length} card${items.length === 1 ? "" : "s"}`;
    $("#collection-grid").innerHTML = items.length
      ? items
          .map(
            (p) => `
        <div class="coll-item">
          ${cardHTML(p)}
          <button class="btn-small sell" data-uid="${p.uid}">Sell ${money(round2(BY_ID[p.cardId].price * SELL_RATE))}</button>
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

  function reveal(el) {
    if (!el || el.classList.contains("flipped")) return;
    const card = BY_ID[current.pulls[+el.dataset.i].cardId];
    el.classList.add("flipped");
    if (rarityRank(card.rarity) >= 2) el.classList.add("hit", "hit-" + card.rarity);
    current.revealed++;
    if (current.revealed === current.pulls.length) setTimeout(showSummary, 500);
  }

  function packTotal() {
    return round2(current.pulls.reduce((s, p) => s + BY_ID[p.cardId].price, 0));
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
    const top = current.pulls.reduce((a, b) => (BY_ID[b.cardId].price > BY_ID[a.cardId].price ? b : a));
    if (!state.stats.best || BY_ID[top.cardId].price > BY_ID[state.stats.best.cardId].price) {
      state.stats.best = { cardId: top.cardId };
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
      document.querySelectorAll(".flip:not(.flipped)").forEach((el, i) => setTimeout(() => reveal(el), i * 250));
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
        const gain = round2(card.price * SELL_RATE);
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
    const gain = round2(bulk.reduce((s, p) => s + BY_ID[p.cardId].price * SELL_RATE, 0));
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
