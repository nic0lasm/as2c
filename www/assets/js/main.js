/* AS2C Patrimoine — main.js v2 */
(function () {
  'use strict';

  // -----------------------------------------------------------------
  // MOBILE NAV TOGGLE
  // -----------------------------------------------------------------
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close mobile nav on link click
    nav.addEventListener('click', function (e) {
      var t = e.target;
      if (t.tagName === 'A' && !t.closest('.has-submenu > a')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // -----------------------------------------------------------------
  // SUBMENU TOGGLE (mobile)
  // -----------------------------------------------------------------
  document.querySelectorAll('.has-submenu > button, .has-submenu > a').forEach(function (trigger) {
    var parent = trigger.parentElement;
    trigger.addEventListener('click', function (e) {
      // On mobile, toggle expanded state
      if (window.matchMedia('(max-width: 768px)').matches) {
        e.preventDefault();
        var expanded = parent.getAttribute('aria-expanded') === 'true';
        // Close other submenus
        document.querySelectorAll('.has-submenu').forEach(function (other) {
          if (other !== parent) other.setAttribute('aria-expanded', 'false');
        });
        parent.setAttribute('aria-expanded', !expanded);
      }
    });
  });

  // -----------------------------------------------------------------
  // ACTIVE LINK IN NAV
  // -----------------------------------------------------------------
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html'))) {
      a.closest('li').classList.add('is-active');
    }
  });

  // -----------------------------------------------------------------
  // SEARCH OVERLAY
  // -----------------------------------------------------------------
  var searchTriggers = document.querySelectorAll('.search-trigger');
  var searchOverlay = document.querySelector('.search-overlay');
  var searchInput = document.querySelector('.search-input');
  var searchResults = document.querySelector('.search-results');
  var searchIndex = null;
  var loadingIndex = false;

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { if (searchInput) searchInput.focus(); }, 50);
    loadIndex();
  }
  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }

  searchTriggers.forEach(function (b) {
    b.addEventListener('click', openSearch);
  });
  document.querySelector('.search-close') && document.querySelector('.search-close').addEventListener('click', closeSearch);
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('is-open')) closeSearch();
    // Cmd+K / Ctrl+K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (searchOverlay && searchOverlay.classList.contains('is-open')) closeSearch();
      else openSearch();
    }
  });

  function loadIndex() {
    if (searchIndex || loadingIndex) return;
    loadingIndex = true;
    if (searchResults) searchResults.innerHTML = '<div class="search-status">Chargement…</div>';
    fetch('search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        searchIndex = data;
        loadingIndex = false;
        runSearch(searchInput ? searchInput.value : '');
      })
      .catch(function () {
        if (searchResults) searchResults.innerHTML = '<div class="search-status">Impossible de charger l\'index.</div>';
      });
  }

  function normalize(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function runSearch(q) {
    if (!searchResults) return;
    if (!searchIndex) { return; }
    q = normalize(q);
    if (q.length < 2) {
      searchResults.innerHTML = '<div class="search-status">Tapez au moins 2 caractères pour rechercher.</div>';
      return;
    }
    var terms = q.split(' ').filter(Boolean);
    var scored = [];
    for (var i = 0; i < searchIndex.length; i++) {
      var doc = searchIndex[i];
      var score = 0;
      for (var t = 0; t < terms.length; t++) {
        if (doc._t.indexOf(terms[t]) !== -1) score += 3;
        if (doc._c.indexOf(terms[t]) !== -1) score += 2;
        if (doc._e.indexOf(terms[t]) !== -1) score += 1;
      }
      if (score > 0) scored.push({ doc: doc, score: score });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    scored = scored.slice(0, 12);

    if (scored.length === 0) {
      searchResults.innerHTML = '<div class="search-status">Aucun résultat pour <strong>' + escapeHtml(q) + '</strong>.</div>';
      return;
    }

    searchResults.innerHTML = scored.map(function (r) {
      return '<a class="search-result" href="' + escapeHtml(r.doc.u) + '">' +
             '<span class="search-result-cat">' + escapeHtml(r.doc.c) + '</span>' +
             '<span class="search-result-title">' + escapeHtml(r.doc.t) + '</span>' +
             '</a>';
    }).join('');
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  if (searchInput) {
    var debounce;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { runSearch(searchInput.value); }, 80);
    });
  }

  // -----------------------------------------------------------------
  // LAZY-LOADING IMAGES
  // -----------------------------------------------------------------
  document.querySelectorAll('img:not([loading])').forEach(function (img) {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  // -----------------------------------------------------------------
  // ANIMATE-ON-SCROLL
  // -----------------------------------------------------------------
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.card, .article-card, .stat, .testimonial').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      io.observe(el);
    });
  }

  // -----------------------------------------------------------------
  // CONTACT FORM
  // -----------------------------------------------------------------
  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.innerHTML = 'Envoi en cours…'; }
    });
    if (window.location.hash === '#sent') {
      var success = document.createElement('div');
      success.style.cssText = 'background:#e6f4ec;color:#1b5e3a;padding:14px 18px;border-radius:8px;margin-bottom:24px;font-weight:500;';
      success.textContent = '✓ Merci ! Votre message a bien été envoyé. Sébastien vous recontactera sous 48h.';
      form.parentNode.insertBefore(success, form);
      form.reset();
    }
  }

  // -----------------------------------------------------------------
  // TOC ACTIVE SECTION (scroll spy)
  // -----------------------------------------------------------------
  var toc = document.querySelector('.article-toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = toc.querySelectorAll('a');
    var headings = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').replace('#', '');
      var h = document.getElementById(id);
      if (h) headings.push({ id: id, el: h, link: a.parentElement });
    });
    if (headings.length > 0) {
      var spyIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var id = e.target.id;
            headings.forEach(function (h) { h.link.classList.toggle('is-active', h.id === id); });
          }
        });
      }, { rootMargin: '-100px 0px -60% 0px' });
      headings.forEach(function (h) { spyIO.observe(h.el); });
    }
  }

})();
