(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dotsWrap = hero.querySelector('[data-hero-dots]');
    let active = 0;
    let timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === active);
        });
      }
    }

    if (dotsWrap && slides.length > 1) {
      slides.forEach(function (_, i) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换推荐 ' + (i + 1));
        dot.addEventListener('click', function () {
          showSlide(i);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }
    }

    showSlide(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  const searchInput = document.querySelector('.search-input');
  const filterSelect = document.querySelector('.filter-select');
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  function applyFilters() {
    const query = normalize(searchInput && searchInput.value);
    const category = normalize(filterSelect && filterSelect.value);

    cards.forEach(function (card) {
      const text = normalize([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.category,
        card.dataset.region,
        card.dataset.year,
        card.textContent
      ].join(' '));
      const cardCategory = normalize(card.dataset.category);
      const matchedQuery = !query || text.indexOf(query) !== -1;
      const matchedCategory = !category || cardCategory === category;
      card.classList.toggle('is-hidden-card', !(matchedQuery && matchedCategory));
    });
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', applyFilters);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilters);
  }

  if (cards.length && (searchInput || filterSelect)) {
    applyFilters();
  }
})();
