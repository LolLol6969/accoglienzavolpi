(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header, progress bar, parallax */
  var header = $('header'), bar = $('#progress'), heroImg = $('#heroimg'), big = $('#big'), ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('solid', y > 60 && !$('#nav').classList.contains('open'));
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (!reduce) {
      if (heroImg && y < innerHeight) heroImg.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      if (big) {
        var r = big.parentNode.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) big.style.transform = 'translateY(' + (-r.top * 0.12) + 'px)';
      }
    }
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* mobile menu */
  var nav = $('#nav'), burger = $('#burger');
  function menu(open) {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu', open);
    burger.setAttribute('aria-expanded', open);
    burger.textContent = open ? 'Chiudi' : 'Menu';
    onScroll();
  }
  burger.addEventListener('click', function () { menu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') menu(false); });

  /* reveal on scroll */
  var targets = $$('.rv, .hotel, .gal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    targets.forEach(function (t) { io.observe(t); });
  } else { targets.forEach(function (t) { t.classList.add('in'); }); }

  /* active nav link */
  var links = $$('nav a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['collezione', 'esperienza', 'galleria', 'contatti'].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* hotel details: one open at a time */
  var more = $$('.more');
  more.forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      more.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); o.textContent = 'Dettagli'; });
      b.setAttribute('aria-expanded', open);
      b.textContent = open ? 'Chiudi' : 'Dettagli';
    });
  });

  /* lightbox */
  var figs = $$('.gal figure'), lb = $('#lb'), img = $('#lbimg'), cap = $('#lbcap'), cur = 0, lastFocus = null;
  function show(i, instant) {
    cur = (i + figs.length) % figs.length;
    var f = figs[cur], src = $('img', f);
    function set() {
      img.src = src.currentSrc ? src.src.replace(/w=\d+/, 'w=1600') : src.src;
      img.alt = src.alt; cap.textContent = $('figcaption', f).textContent;
      img.classList.remove('swap');
    }
    if (instant || reduce) set(); else { img.classList.add('swap'); setTimeout(set, 220); }
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    lb.hidden = false; show(i, true);
    requestAnimationFrame(function () { lb.classList.add('show'); });
    document.body.style.overflow = 'hidden'; $('#lbx').focus();
  }
  function closeLb() {
    lb.classList.remove('show');
    setTimeout(function () { lb.hidden = true; }, reduce ? 0 : 350);
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  figs.forEach(function (f, i) { $('.open', f).addEventListener('click', function () { openLb(i); }); });
  $('#lbx').addEventListener('click', closeLb);
  $('#lbp').addEventListener('click', function () { show(cur - 1); });
  $('#lbn').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) { if (e.key === 'Escape' && nav.classList.contains('open')) menu(false); return; }
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  /* chat con copione (testi in copione.js) */
  var C = window.COPIONE;
  if (C && $('#chatbtn')) {
    var cbtn = $('#chatbtn'), cbox = $('#chat'), clog = $('#chatlog'), copts = $('#chatopts'), started = false, busy = false, done = {};
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };
    var down = function () { clog.scrollTo({ top: clog.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }); };
    var bubble = function (cls) { var d = document.createElement('div'); d.className = 'msg ' + cls; clog.appendChild(d); return d; };
    var setOpts = function (list) {
      copts.innerHTML = '';
      list.forEach(function (o) { var b = document.createElement('button'); b.type = 'button'; b.textContent = o.label; b.addEventListener('click', o.fn); copts.appendChild(b); });
    };
    var botSay = async function (text) {
      var m = bubble('bot typing'); m.innerHTML = '<i></i><i></i><i></i>'; down();
      await wait(Math.min(1800, 600 + text.length * 12));
      var words = text.split(' ');
      m.className = 'msg bot'; m.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span'); s.className = 'w'; s.textContent = w + ' ';
        s.style.transitionDelay = (reduce ? 0 : i * 70) + 'ms'; m.appendChild(s);
      });
      requestAnimationFrame(function () { requestAnimationFrame(function () { m.classList.add('go'); }); });
      down();
      await wait(words.length * 70 + 600);
    };
    var menu2 = async function () {
      var rest = C.argomenti.filter(function (a) { return !done[a.id]; });
      if (!rest.length) { await botSay(C.chiusura); setOpts([{ label: 'Ricomincia', fn: restart }]); return; }
      setOpts(rest.map(function (a) { return { label: a.etichetta, fn: function () { topic(a); } }; }));
    };
    var topic = async function (a) {
      if (busy) return; busy = true; copts.innerHTML = '';
      bubble('me').textContent = a.etichetta; down();
      for (var i = 0; i < a.messaggi.length; i++) await botSay(a.messaggi[i]);
      done[a.id] = 1; await menu2(); busy = false;
    };
    var start = async function () {
      busy = true; copts.innerHTML = '';
      for (var i = 0; i < C.avvio.length; i++) await botSay(C.avvio[i]);
      await menu2(); busy = false;
    };
    var restart = function () { clog.innerHTML = ''; done = {}; start(); };
    var openChat = function () {
      cbox.hidden = false; cbtn.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () { cbox.classList.add('show'); });
      if (!started) { started = true; start(); }
    };
    var closeChat = function () {
      cbox.classList.remove('show'); cbtn.setAttribute('aria-expanded', 'false');
      setTimeout(function () { cbox.hidden = true; }, reduce ? 0 : 600); cbtn.focus();
    };
    cbtn.addEventListener('click', function () { cbox.hidden ? openChat() : closeChat(); });
    $('#chatx').addEventListener('click', closeChat);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cbox.hidden && lb.hidden) closeChat(); });
  } else { var cb = $('#chatbtn'); if (cb) cb.hidden = true; }
})();
