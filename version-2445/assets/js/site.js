(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var backgrounds = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-bg]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === current);
      });
      backgrounds.forEach(function(background, itemIndex) {
        background.classList.toggle('active', itemIndex === current);
      });
      dots.forEach(function(dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var index = Number(dot.getAttribute('data-hero-dot'));
        showSlide(index);
      });
    });

    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  document.querySelectorAll('[data-filter-section]').forEach(function(section) {
    var input = section.querySelector('[data-search-input]');
    var year = section.querySelector('[data-year-filter]');
    var region = section.querySelector('[data-region-filter]');
    var clearButton = section.querySelector('[data-clear-filter]');
    var emptyState = section.querySelector('[data-empty-state]');
    var cardsRoot = section.parentElement;
    var cards = Array.prototype.slice.call(cardsRoot.querySelectorAll('[data-card]'));

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchesRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var matches = matchesKeyword && matchesYear && matchesRegion;
        card.classList.toggle('hidden-by-filter', !matches);
        if (matches) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [input, year, region].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function() {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        applyFilter();
      });
    }
  });
})();
