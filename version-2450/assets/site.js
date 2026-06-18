(function () {
  var header = document.querySelector('.js-header');
  var button = document.querySelector('.js-menu-button');
  var mobileNav = document.querySelector('.js-mobile-nav');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (button && mobileNav) {
    button.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('.js-hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      play();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    play();
  });

  document.querySelectorAll('.js-player').forEach(function (box) {
    var video = box.querySelector('video');
    var start = box.querySelector('.player-start');
    var hlsInstance = null;

    function begin() {
      if (!video) return;
      var url = video.getAttribute('data-play');
      if (!url) return;

      if (start) start.classList.add('is-hidden');

      if (!video.src) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    if (start) {
      start.addEventListener('click', begin);
    }

    box.addEventListener('click', function (event) {
      if (event.target === video && !video.src) {
        begin();
      }
    });
  });

  document.querySelectorAll('.js-search-page').forEach(function (wrap) {
    var input = wrap.querySelector('.js-search-input');
    var clear = wrap.querySelector('.js-search-clear');
    var cards = Array.prototype.slice.call(wrap.querySelectorAll('.search-card'));
    var state = wrap.querySelector('.js-search-state');

    function applySearch() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var matches = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var ok = keyword.length > 0 && text.indexOf(keyword) !== -1;
        card.style.display = ok ? '' : 'none';
        if (ok) matches += 1;
      });

      if (state) {
        if (!keyword) {
          state.textContent = '输入片名、类型、地区或标签开始搜索。';
        } else if (matches) {
          state.textContent = '已匹配相关剧集。';
        } else {
          state.textContent = '没有找到相关内容，请尝试其他关键词。';
        }
      }
    }

    if (input) {
      input.addEventListener('input', applySearch);
      applySearch();
    }

    if (clear && input) {
      clear.addEventListener('click', function () {
        input.value = '';
        input.focus();
        applySearch();
      });
    }
  });
})();
