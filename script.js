document.addEventListener('DOMContentLoaded', () => {
  // Back to top button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Question mark (?) buttons toggle
  const whyButtons = document.querySelectorAll('.btn-why');
  whyButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const row = btn.closest('.setting-row');
      const panel = row.querySelector('.setting-why-panel');

      const isOpen = panel.classList.contains('open');

      // Close other panels if needed, or allow multiple
      panel.classList.toggle('open', !isOpen);
      btn.classList.toggle('active', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });

  // Platform tab switcher
  const platformTabs = document.querySelectorAll('.platform-tab');
  platformTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      platformTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const targetPlatform = tab.dataset.platform;
      // If other platforms don't have dedicated data yet, show quick toast or state
      if (targetPlatform !== 'ps5') {
        alert(`Настройки для ${tab.textContent} в разработке. Сейчас отображается сетап для PS5.`);
      }
    });
  });

  // Catalog search & filter (for index.html)
  const searchInput = document.getElementById('gameSearch');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const gameCards = document.querySelectorAll('.game-card');

  if (searchInput && gameCards.length > 0) {
    let activeFilter = 'all';

    const filterGames = () => {
      const query = searchInput.value.toLowerCase().trim();

      gameCards.forEach((card) => {
        const title = card.querySelector('.game-title')?.textContent.toLowerCase() || '';
        const platform = (card.dataset.platform || '').toLowerCase().split(/\s+/);
        const status = (card.dataset.status || '').toLowerCase().split(/\s+/);
        const filterVal = activeFilter.toLowerCase();

        const matchesQuery = title.includes(query);
        const matchesFilter =
          filterVal === 'all' ||
          platform.includes(filterVal) ||
          status.includes(filterVal);

        card.style.display = matchesQuery && matchesFilter ? 'flex' : 'none';
      });
    };

    searchInput.addEventListener('input', filterGames);

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        filterGames();
      });
    });
  }
});
