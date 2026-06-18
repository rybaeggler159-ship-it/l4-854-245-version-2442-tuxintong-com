(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function activateSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('is-active', position === current);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('is-active', position === current);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      activateSlide(index);
    });
  });
  if (slides.length > 1) {
    activateSlide(0);
    setInterval(function () {
      activateSlide(current + 1);
    }, 5600);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (panel) {
    var parent = panel.parentElement || document;
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var category = panel.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(parent.querySelectorAll('.movie-card'));
    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : 'all';
      var selectedType = type ? type.value : 'all';
      var selectedCategory = category ? category.value : 'all';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var yearMatched = selectedYear === 'all' || card.getAttribute('data-year') === selectedYear;
        var typeMatched = selectedType === 'all' || card.getAttribute('data-type') === selectedType;
        var categoryMatched = selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory;
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-card', !(yearMatched && typeMatched && categoryMatched && keywordMatched));
      });
    }
    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
