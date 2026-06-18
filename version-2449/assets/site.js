(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        restart();
      });
    });
    restart();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var root = panel.parentElement || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var input = panel.querySelector('[data-filter-search]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var category = panel.querySelector('[data-filter-category]');
    var empty = root.querySelector('[data-empty-state]');

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      var seen = {};
      values.forEach(function (value) {
        if (!value || seen[value]) {
          return;
        }
        seen[value] = true;
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(region, cards.map(function (card) { return card.getAttribute('data-region'); }).sort());
    fillSelect(year, cards.map(function (card) { return card.getAttribute('data-year'); }).sort().reverse());

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var categoryValue = category ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || (card.getAttribute('data-keywords') || '').indexOf(query) !== -1;
        var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchesCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var show = matchesQuery && matchesRegion && matchesYear && matchesCategory;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, region, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var layer = player.querySelector('[data-play-layer]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-src');
    var attached = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (!video || !source || attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setStatus('播放加载中');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪');
      } else {
        video.src = source;
        setStatus('正在尝试播放');
      }
    }

    function startPlay() {
      attachSource();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && promise.then) {
        promise.then(function () {
          if (layer) {
            layer.classList.add('hidden');
          }
          setStatus('正在播放');
        }).catch(function () {
          setStatus('点击视频继续播放');
        });
      } else if (layer) {
        layer.classList.add('hidden');
      }
    }

    if (layer) {
      layer.addEventListener('click', startPlay);
    }
    if (video) {
      video.addEventListener('click', startPlay);
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('hidden');
        }
        setStatus('正在播放');
      });
      video.addEventListener('pause', function () {
        if (layer) {
          layer.classList.remove('hidden');
        }
      });
    }
  });
})();
