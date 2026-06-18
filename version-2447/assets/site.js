(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setActive(items, index, className) {
    items.forEach(function (item, position) {
      item.classList.toggle(className, position === index);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero-slider]");
    if (hero) {
      var slides = selectAll("[data-hero-slide]", hero);
      var dots = selectAll("[data-hero-dot]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        setActive(slides, current, "is-active");
        setActive(dots, current, "is-active");
      }

      function start() {
        if (timer || slides.length < 2) {
          return;
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          if (timer) {
            window.clearInterval(timer);
            timer = null;
          }
          start();
        });
      });

      start();
    }

    selectAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var buttons = selectAll("[data-filter-button]", scope);
      var cards = selectAll("[data-movie-card]", scope);
      var active = "all";

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" "));
          var matchesKeyword = keyword === "" || haystack.indexOf(keyword) !== -1;
          var matchesChip = active === "all" || haystack.indexOf(normalize(active)) !== -1;
          card.classList.toggle("card-hidden", !(matchesKeyword && matchesChip));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter-button") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilter();
        });
      });
    });

    selectAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var startButton = player.querySelector("[data-player-start]");
      var overlay = player.querySelector("[data-player-overlay]");
      var stream = player.getAttribute("data-stream");
      var ready = false;
      var hls = null;

      function attach() {
        if (!video || !stream || ready) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        ready = true;
      }

      function play() {
        attach();
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (startButton) {
        startButton.addEventListener("click", play);
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!ready || video.paused) {
            play();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
