/**
 * HDRGG — Catalog Engine (app.js)
 * - Loads catalog from /games.json (with inline fallback for local file:// preview)
 * - Convention over Configuration:
 *     poster -> games/<id>/poster.webp
 *     page   -> games/<id>/
 * - Domain rule: 'ps5-calibration' ALWAYS includes 'hgig'
 * - Lazy image loading + batched pagination (PAGE_SIZE = 20)
 */

const PAGE_SIZE = 20;

const FALLBACK_CATALOG = [
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    platform: "PS5",
    statusTags: ["broken-hdr"]
  },
  {
    id: "spiderman-2",
    title: "Marvel's Spider-Man 2",
    platform: "PS5",
    statusTags: ["ps5-calibration", "hgig"]
  }
];

let allGames = [];
let filteredGames = [];
let visibleCount = PAGE_SIZE;

function normalizeGame(game) {
  const tags = Array.isArray(game.statusTags) ? [...game.statusTags] : [];
  // Domain rule: PS5 Calibration is ALWAYS HGiG
  if (tags.includes("ps5-calibration") && !tags.includes("hgig")) {
    tags.push("hgig");
  }

  const badges = [];
  if ((game.platform || "").toUpperCase() === "PS5") {
    badges.push({ type: "badge-ps5", label: "PS5" });
  }
  if (tags.includes("ps5-calibration")) {
    badges.push({ type: "badge-calibration", label: "PS5 Calibration" });
  }
  if (tags.includes("hgig")) {
    badges.push({ type: "badge-hgig", label: "HGIG" });
  }
  if (tags.includes("broken-hdr")) {
    badges.push({ type: "badge-broken", label: "Broken HDR" });
  }

  return {
    ...game,
    statusTags: tags,
    badges: game.badges || badges,
    posterUrl: game.poster || `games/${game.id}/poster.webp`,
    pageUrl: game.url || `games/${game.id}/`
  };
}

function renderCatalog() {
  const grid = document.getElementById("gamesGrid");
  const loadMoreWrap = document.getElementById("loadMoreWrap");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (!grid) return;

  if (filteredGames.length === 0) {
    grid.innerHTML = `<div class="empty-state">Игры по выбранному фильтру не найдены.</div>`;
    if (loadMoreWrap) loadMoreWrap.style.display = "none";
    return;
  }

  const slice = filteredGames.slice(0, visibleCount);

  grid.innerHTML = slice.map(game => {
    const isExternal = game.pageUrl.startsWith("http");
    const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : "";
    const badgesHTML = game.badges.map(b => `<span class="badge ${b.type}">${b.label}</span>`).join("");

    return `
      <article class="game-card" data-platform="${(game.platform || "").toLowerCase()}" data-tags="${game.statusTags.join(" ")}">
        <div class="poster-box">
          <img
            src="${game.posterUrl}"
            alt="${game.title}"
            class="game-poster"
            width="400"
            height="600"
            loading="lazy"
            decoding="async"
          >
        </div>
        <div class="game-header">
          <h2 class="game-title">${game.title}</h2>
          <div class="badges-row">
            ${badgesHTML}
          </div>
        </div>
        <div class="card-action">
          <a href="${game.pageUrl}" ${targetAttr} class="btn-game-open">Перейти к игре →</a>
        </div>
      </article>
    `;
  }).join("");

  if (loadMoreWrap && loadMoreBtn) {
    if (filteredGames.length > visibleCount) {
      const remaining = filteredGames.length - visibleCount;
      loadMoreBtn.textContent = `Показать ещё (${remaining})`;
      loadMoreWrap.style.display = "block";
    } else {
      loadMoreWrap.style.display = "none";
    }
  }
}

function applyFilters() {
  const searchInput = document.getElementById("gameSearch");
  const activePill = document.querySelector(".filter-pill.active");
  const query = (searchInput?.value || "").toLowerCase().trim();
  const filterVal = (activePill?.dataset.filter || "all").toLowerCase();

  filteredGames = allGames.filter(game => {
    const matchesQuery = game.title.toLowerCase().includes(query);
    let matchesFilter = false;

    if (filterVal === "all") {
      matchesFilter = true;
    } else if (filterVal === "ps5") {
      matchesFilter = (game.platform || "").toLowerCase() === "ps5";
    } else {
      matchesFilter = game.statusTags.includes(filterVal);
    }

    return matchesQuery && matchesFilter;
  });

  visibleCount = PAGE_SIZE;
  renderCatalog();
}

async function initCatalog() {
  try {
    const res = await fetch("games.json");
    if (!res.ok) throw new Error("Failed to load games.json");
    const data = await res.json();
    allGames = data.map(normalizeGame);
  } catch (err) {
    allGames = FALLBACK_CATALOG.map(normalizeGame);
  }

  filteredGames = [...allGames];
  renderCatalog();

  const searchInput = document.getElementById("gameSearch");
  const filterPills = document.querySelectorAll(".filter-pill");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      applyFilters();
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderCatalog();
    });
  }
}

document.addEventListener("DOMContentLoaded", initCatalog);
