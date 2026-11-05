/* ==========================================================================
   VM Brothers Cricket Ground — site behaviour
   Vanilla JS, no dependencies. Runs fine as a static file on GitHub Pages.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------------
     Header: solid background once the user scrolls off the hero
     ---------------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ----------------------------------------------------------------------
     Mobile navigation drawer
     ---------------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var nav       = document.getElementById('primaryNav');
  var scrim     = document.getElementById('navScrim');

  function setNav(open) {
    if (!navToggle || !nav) return;

    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);

    if (scrim) {
      if (open) {
        scrim.hidden = false;
        // next frame so the opacity transition actually runs
        requestAnimationFrame(function () { scrim.classList.add('is-open'); });
      } else {
        scrim.classList.remove('is-open');
        window.setTimeout(function () { scrim.hidden = true; }, 320);
      }
    }
  }

  function closeNav() { setNav(false); }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      setNav(!open);
    });
  }

  if (scrim) scrim.addEventListener('click', closeNav);

  // Close when a nav link or CTA inside the drawer is tapped
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNav();
      navToggle.focus();
    }
  });

  // Leaving mobile width with the drawer open would otherwise lock scrolling
  var desktop = window.matchMedia('(min-width: 1024px)');
  function handleBreakpoint(e) { if (e.matches) closeNav(); }
  if (desktop.addEventListener) desktop.addEventListener('change', handleBreakpoint);
  else if (desktop.addListener) desktop.addListener(handleBreakpoint);

  /* ----------------------------------------------------------------------
     Reveal-on-scroll
     ---------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  revealEls.forEach(function (el) {
    var delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Highlight the nav link for the section in view
     ---------------------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ----------------------------------------------------------------------
     Gallery: hide the caption gradient only matters once real photos exist.
     Keeps placeholders from looking broken if an <img> fails to load.
     ---------------------------------------------------------------------- */
  document.querySelectorAll('.gallery-item img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
    });
  });

  /* ======================================================================
     3D / SCROLL-REACTIVE LAYER

     One rAF-throttled loop drives every scroll-linked effect. It only ever
     writes CSS custom properties, so the browser composites the result on
     the GPU and the main thread stays free.
     ====================================================================== */

  function clamp01(n) { return n < 0 ? 0 : (n > 1 ? 1 : n); }

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  var progressBar = document.getElementById('scrollBar');
  var dnSection   = document.getElementById('daynight');
  var dnStage     = document.getElementById('dnStage');
  var heroEl      = document.querySelector('.hero');

  var scrollQueued = false;

  function renderScroll() {
    scrollQueued = false;

    var y  = window.scrollY || window.pageYOffset || 0;
    var vh = window.innerHeight;

    /* reading-progress rail */
    if (progressBar) {
      var max = document.documentElement.scrollHeight - vh;
      progressBar.style.setProperty('--sp', max > 0 ? clamp01(y / max).toFixed(4) : '0');
    }

    /* hero: stadium drifts down, copy lifts away and fades */
    if (heroEl) {
      var hp = clamp01(y / (heroEl.offsetHeight || vh));
      heroEl.style.setProperty('--hero-sy', (hp * 90).toFixed(1) + 'px');
      heroEl.style.setProperty('--hero-cy', (hp * -70).toFixed(1) + 'px');
      heroEl.style.setProperty('--hero-op', Math.max(0, 1 - hp * 1.15).toFixed(3));
    }

    /* day -> night stage */
    if (dnSection && dnStage) {
      var total = dnSection.offsetHeight - vh;
      var p = total > 0 ? clamp01(-dnSection.getBoundingClientRect().top / total) : 0;

      dnStage.style.setProperty('--p', p.toFixed(4));
      // staggered so the sky darkens first, then stars, then the lights fire up
      dnStage.style.setProperty('--night',  clamp01((p - 0.12) / 0.46).toFixed(4));
      dnStage.style.setProperty('--stars',  clamp01((p - 0.34) / 0.40).toFixed(4));
      dnStage.style.setProperty('--lights', clamp01((p - 0.42) / 0.34).toFixed(4));
    }
  }

  function queueScroll() {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(renderScroll); }
  }

  if (!prefersReducedMotion) {
    renderScroll();
    window.addEventListener('scroll', queueScroll, { passive: true });
    window.addEventListener('resize', queueScroll);
  }

  /* ----------------------------------------------------------------------
     Pointer-tracked 3D card tilt (desktop pointers only)
     ---------------------------------------------------------------------- */
  function bindTilt(card) {
    var queued = false;
    var nx = 0, ny = 0;

    function apply() {
      queued = false;
      card.style.setProperty('--rx', (-ny * 6.5).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ( nx * 6.5).toFixed(2) + 'deg');
      card.style.setProperty('--mx-pct', ((nx + 0.5) * 100).toFixed(1) + '%');
      card.style.setProperty('--my-pct', ((ny + 0.5) * 100).toFixed(1) + '%');
    }

    card.addEventListener('pointerenter', function () {
      card.classList.add('is-tilting');
      card.style.setProperty('--glare', '1');
    });

    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      nx = (e.clientX - r.left) / r.width  - 0.5;
      ny = (e.clientY - r.top)  / r.height - 0.5;
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    });

    card.addEventListener('pointerleave', function () {
      card.classList.remove('is-tilting');
      card.style.setProperty('--glare', '0');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  /* ----------------------------------------------------------------------
     Magnetic pull on the large call-to-action buttons
     ---------------------------------------------------------------------- */
  function bindMagnet(btn) {
    var queued = false;
    var dx = 0, dy = 0;

    function apply() {
      queued = false;
      btn.style.setProperty('--mx', dx.toFixed(1) + 'px');
      btn.style.setProperty('--my', dy.toFixed(1) + 'px');
    }

    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      dx = (e.clientX - r.left - r.width  / 2) * 0.18;
      dy = (e.clientY - r.top  - r.height / 2) * 0.26;
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    });

    btn.addEventListener('pointerleave', function () {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  }

  /* ----------------------------------------------------------------------
     Hero scene drifts with the cursor
     ---------------------------------------------------------------------- */
  function bindHeroParallax() {
    var queued = false;
    var mx = 0;

    heroEl.addEventListener('pointermove', function (e) {
      mx = ((e.clientX / window.innerWidth) - 0.5) * 20;
      if (!queued) {
        queued = true;
        requestAnimationFrame(function () {
          queued = false;
          heroEl.style.setProperty('--hero-mx', mx.toFixed(1) + 'px');
        });
      }
    });

    heroEl.addEventListener('pointerleave', function () {
      heroEl.style.setProperty('--hero-mx', '0px');
    });
  }

  if (!prefersReducedMotion && finePointer.matches) {
    document.querySelectorAll('.tilt').forEach(bindTilt);
    document.querySelectorAll('.btn--lg').forEach(bindMagnet);
    if (heroEl) bindHeroParallax();
  }

  /* ======================================================================
     VIDEO
     ====================================================================== */

  /* ----------------------------------------------------------------------
     Hero drone loop.

     The aerial still is already on screen and costs ~33KB. The loop is only
     worth its ~700KB on a screen big enough to show it off, so we attach the
     source by hand rather than letting the markup download it for everyone.
     ---------------------------------------------------------------------- */
  (function initHeroVideo() {
    var video = document.getElementById('heroVideo');
    if (!video) return;

    var conn = navigator.connection || navigator.webkitConnection;
    var saveData = !!(conn && conn.saveData);
    var slowLink = !!(conn && /^(slow-2g|2g|3g)$/.test(conn.effectiveType || ''));
    var bigEnough = window.matchMedia('(min-width: 768px)').matches;

    if (prefersReducedMotion || saveData || slowLink || !bigEnough) return;

    var src = video.getAttribute('data-src');
    if (!src) return;

    video.addEventListener('playing', function () {
      video.classList.add('is-ready');
    }, { once: true });

    // if it can't load, nothing happens — the still underneath stays put
    video.addEventListener('error', function () {
      video.classList.remove('is-ready');
    });

    video.src = src;
    video.load();

    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      // autoplay refused (some mobile browsers); the still is a fine fallback
      attempt.catch(function () {});
    }
  })();

  /* ----------------------------------------------------------------------
     Showcase videos.

     The markup ships with native `controls` so the section still works
     without JS. Here we take those over and show the gold play button
     instead, restoring the controls once playback starts.
     ---------------------------------------------------------------------- */
  document.querySelectorAll('.video-card__frame').forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.video-play');
    if (!video || !button) return;

    video.removeAttribute('controls');
    button.hidden = false;

    function start() {
      video.setAttribute('controls', '');
      button.hidden = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          // playback refused — hand the user back the native controls
          button.hidden = false;
        });
      }
    }

    button.addEventListener('click', start);

    // bring the button back when the clip finishes, ready to replay
    video.addEventListener('ended', function () {
      video.removeAttribute('controls');
      button.hidden = false;
    });

    // only one clip at a time
    video.addEventListener('play', function () {
      document.querySelectorAll('.video-card__frame video').forEach(function (other) {
        if (other !== video && !other.paused) other.pause();
      });
    });
  });
})();
