/**
 * HDRGG — Shared Game Subpage Script (game.js)
 * Handles:
 * 1. Interactive '?' explanation panels (.btn-why)
 * 2. Platform selector tabs (.platform-tab)
 * 3. Scroll-to-top button (#backToTop)
 * 4. Dynamic rendering when opened on /game.html?id=<game-id>
 */

function bindGamePageInteractions() {
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const whyButtons = document.querySelectorAll(".btn-why");
  whyButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const row = btn.closest(".setting-row");
      const panel = row?.querySelector(".setting-why-panel");
      if (!panel) return;
      const isOpen = panel.classList.contains("open");
      panel.classList.toggle("open", !isOpen);
      btn.classList.toggle("active", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  const platformTabs = document.querySelectorAll(".platform-tab");
  platformTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      platformTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });
}

async function initDynamicGameTemplate() {
  const container = document.getElementById("dynamicGameRoot");
  if (!container) {
    bindGamePageInteractions();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const gameId = params.get("id") || "cyberpunk-2077";

  try {
    const res = await fetch("games.json");
    const games = await res.json();
    const game = games.find(g => g.id === gameId) || games[0];
    if (!game) return;

    document.title = `${game.title} — Настройки HDR и графики на PS5 | HDRGG`;

    const sectionsHTML = (game.sections || []).map((sec, idx) => {
      const verdictHTML = (idx === 0 && game.verdict)
        ? `<span class="verdict-tag ${game.verdict.type}">${game.verdict.label}</span>`
        : "";

      const rowsHTML = (sec.settings || []).map(s => `
        <div class="setting-row">
          <div class="setting-main">
            <span class="setting-name">${s.name}</span>
            <div class="setting-action">
              <span class="setting-value ${s.valueType || ""}">${s.value}</span>
              <button class="btn-why" title="Подробное пояснение" aria-label="Пояснение к параметру">?</button>
            </div>
          </div>
          <div class="setting-why-panel">${s.why}</div>
        </div>
      `).join("");

      return `
        <section>
          <div class="section-head">
            <h2 class="section-title">${sec.title}</h2>
            ${verdictHTML}
          </div>
          <div class="settings-box">${rowsHTML}</div>
        </section>
      `;
    }).join("");

    const sourceHTML = game.source ? `
      <div class="source-banner">
        <div class="source-info">
          <span class="source-label">${game.source.label}</span>
          <span class="source-title">${game.source.title}</span>
        </div>
        <a href="${game.source.url}" target="_blank" rel="noopener noreferrer" class="source-btn">
          Смотреть разбор ↗
        </a>
      </div>
    ` : "";

    const altHTML = game.altSection ? `
      <details class="alt-details">
        <summary class="alt-summary">${game.altSection.summary}</summary>
        <div class="alt-content">
          <div class="settings-box" style="margin-bottom: 0;">
            ${game.altSection.settings.map(s => `
              <div class="setting-row">
                <div class="setting-main">
                  <span class="setting-name">${s.name}</span>
                  <div class="setting-action">
                    <span class="setting-value">${s.value}</span>
                    <button class="btn-why" title="Подробное пояснение">?</button>
                  </div>
                </div>
                <div class="setting-why-panel">${s.why}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </details>
    ` : "";

    container.innerHTML = `
      <nav class="breadcrumbs">
        <a href="./">Каталог игр</a> / <span>${game.title}</span>
      </nav>
      <section class="game-hero">
        <div class="game-hero-poster">
          <img src="games/${game.id}/poster.webp" alt="${game.title}" width="400" height="600" decoding="async">
        </div>
        <div class="game-info">
          <h1 class="game-title">${game.title}</h1>
          <p class="game-subtitle">${game.subtitle || ""}</p>
          <div class="platform-tabs" role="tablist">
            <button class="platform-tab active" data-platform="ps5">PS5</button>
          </div>
        </div>
      </section>
      ${sectionsHTML}
      ${sourceHTML}
      ${altHTML}
    `;

    bindGamePageInteractions();
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Не удалось загрузить данные игры.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", initDynamicGameTemplate);
