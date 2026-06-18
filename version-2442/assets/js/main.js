(function () {
  const toggle = document.querySelector(".mobile-toggle");
  const menu = document.querySelector(".nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const searchPage = document.querySelector("[data-search-page]");
  if (!searchPage || typeof MOVIES === "undefined") {
    return;
  }

  const input = document.getElementById("searchInput");
  const genre = document.getElementById("genreFilter");
  const type = document.getElementById("typeFilter");
  const region = document.getElementById("regionFilter");
  const summary = document.getElementById("searchSummary");
  const results = document.getElementById("searchResults");
  const loadMore = document.getElementById("loadMore");
  const params = new URLSearchParams(location.search);
  let visibleCount = 24;
  let filtered = [];

  if (params.get("q")) {
    input.value = params.get("q");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function movieText(movie) {
    return normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.genreRaw,
      movie.oneLine,
      movie.tags.join(" ")
    ].join(" "));
  }

  function card(movie) {
    const tags = movie.tags.slice(0, 3).map(function (tag) {
      return `<span>${escapeHtml(tag)}</span>`;
    }).join("");

    return `<article class="movie-card">
      <a class="poster-wrap" href="./${movie.url}" title="${escapeHtml(movie.title)}">
        <img src="./${movie.cover}.jpg" alt="${escapeHtml(movie.title)}封面" loading="lazy">
        <span class="poster-gradient"></span>
        <span class="rating-pill">${movie.rating}</span>
      </a>
      <div class="movie-card-body">
        <a class="movie-title" href="./${movie.url}">${escapeHtml(movie.title)}</a>
        <div class="movie-meta">
          <span>${movie.year}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <p>${escapeHtml(shorten(movie.oneLine, 58))}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function shorten(value, length) {
    const text = String(value || "").trim();
    return text.length > length ? text.slice(0, length) + "…" : text;
  }

  function applyFilters(reset) {
    if (reset) {
      visibleCount = 24;
    }

    const keyword = normalize(input.value);
    const selectedGenre = genre.value;
    const selectedType = type.value;
    const selectedRegion = region.value;

    filtered = MOVIES.filter(function (movie) {
      const keywordMatch = !keyword || movieText(movie).includes(keyword);
      const genreMatch = !selectedGenre || movie.genre === selectedGenre;
      const typeMatch = !selectedType || movie.type === selectedType;
      const regionMatch = !selectedRegion || movie.region === selectedRegion;
      return keywordMatch && genreMatch && typeMatch && regionMatch;
    });

    filtered.sort(function (a, b) {
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      return b.heat - a.heat;
    });

    render();
  }

  function render() {
    const shown = filtered.slice(0, visibleCount);
    results.innerHTML = shown.map(card).join("");
    summary.textContent = `找到 ${filtered.length} 条内容，当前显示 ${shown.length} 条`;
    loadMore.style.display = visibleCount < filtered.length ? "inline-flex" : "none";
  }

  [input, genre, type, region].forEach(function (element) {
    element.addEventListener("input", function () {
      applyFilters(true);
    });
    element.addEventListener("change", function () {
      applyFilters(true);
    });
  });

  loadMore.addEventListener("click", function () {
    visibleCount += 24;
    render();
  });

  applyFilters(true);
})();
