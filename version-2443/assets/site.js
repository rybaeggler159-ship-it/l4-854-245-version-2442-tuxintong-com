(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var button = $("[data-menu-toggle]");
    var nav = $("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all("[data-hero-slide]", hero);
    var dots = $all("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilter() {
    var input = $("[data-filter-input]");
    var list = $("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var type = $("[data-filter-type]");
    var empty = $("[data-filter-empty]");
    var items = Array.prototype.slice.call(list.children);

    function apply() {
      var query = normalize(input.value);
      var selectedType = normalize(type && type.value);
      var visible = 0;
      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-year"),
          item.getAttribute("data-type"),
          item.getAttribute("data-tags")
        ].join(" "));
        var itemType = normalize(item.getAttribute("data-type"));
        var ok = (!query || haystack.indexOf(query) !== -1) && (!selectedType || itemType.indexOf(selectedType) !== -1);
        item.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener("input", apply);
    if (type) {
      type.addEventListener("change", apply);
    }
    apply();
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"poster-type\">" + escapeHtml(item.type) + "</span>",
      "<span class=\"poster-play\">▶</span>",
      "</a>",
      "<div class=\"movie-body\">",
      "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<p class=\"movie-line\">" + escapeHtml(item.line) + "</p>",
      "<div class=\"movie-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span></div>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initSearchPage() {
    var root = $("[data-search-page]");
    if (!root || !window.siteSearchItems) {
      return;
    }
    var input = $("[data-site-search]", root);
    var type = $("[data-site-search-type]", root);
    var results = $("[data-site-search-results]", root);
    var empty = $("[data-site-search-empty]", root);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render() {
      var query = normalize(input && input.value);
      var selectedType = normalize(type && type.value);
      var matches = window.siteSearchItems.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.year,
          item.type,
          item.category,
          (item.tags || []).join(" ")
        ].join(" "));
        var itemType = normalize(item.type);
        return (!query || haystack.indexOf(query) !== -1) && (!selectedType || itemType.indexOf(selectedType) !== -1);
      }).slice(0, 120);
      results.innerHTML = matches.map(cardTemplate).join("");
      if (empty) {
        empty.hidden = matches.length !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }
    if (type) {
      type.addEventListener("change", render);
    }
    render();
  }

  window.setupMoviePlayer = function (videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !source) {
      return;
    }
    var hls = null;
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      video.controls = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else {
        video.src = source;
      }
    }

    function play() {
      cover.hidden = true;
      attach();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.hidden = false;
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      cover.hidden = true;
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        cover.hidden = false;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
  });
})();
