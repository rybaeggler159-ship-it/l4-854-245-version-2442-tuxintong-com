(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalizeText(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".nav-links");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }
        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                play();
            });
        });
        show(0);
        play();
    }

    function setupFilters() {
        var areas = document.querySelectorAll("[data-filter-area]");
        areas.forEach(function (area) {
            var input = area.querySelector("[data-filter-input]");
            var year = area.querySelector("[data-filter-year]");
            var type = area.querySelector("[data-filter-type]");
            var reset = area.querySelector("[data-filter-reset]");
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
            var empty = area.querySelector("[data-empty]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");
            if (input && initialQuery) {
                input.value = initialQuery;
            }
            function apply() {
                var q = normalizeText(input ? input.value : "");
                var y = year ? year.value : "";
                var t = type ? type.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalizeText(card.getAttribute("data-search"));
                    var matchText = !q || haystack.indexOf(q) !== -1;
                    var matchYear = !y || card.getAttribute("data-year") === y;
                    var matchType = !t || card.getAttribute("data-type") === t;
                    var show = matchText && matchYear && matchType;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }
            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }

    window.initMoviePlayer = function (source) {
        ready(function () {
            var video = document.getElementById("movie-video");
            var cover = document.querySelector(".play-cover");
            var button = cover ? cover.querySelector("button") : null;
            var attached = false;
            if (!video || !source) {
                return;
            }
            function attachSource() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            function start() {
                attachSource();
                video.controls = true;
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener("click", start);
            }
            if (button) {
                button.addEventListener("click", function (event) {
                    event.stopPropagation();
                    start();
                });
            }
            video.addEventListener("click", function () {
                if (!attached) {
                    start();
                    return;
                }
                if (video.paused) {
                    video.play().catch(function () {});
                }
            });
        });
    };

    ready(function () {
        setupNavigation();
        setupSearchForms();
        setupHero();
        setupFilters();
    });
})();
