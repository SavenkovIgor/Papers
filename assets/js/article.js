'use strict';

document.addEventListener('DOMContentLoaded', function () {
  setupReadingProgress();
  setupTOC();
  setupCopyButtons();
  setupBackToTop();
  setupExternalLinks();
  setupTableWrappers();
  setupCheckmarks();
  setupHeadingAnchors();
});

/* ── Reading progress bar ───────────────────────────────────────────── */

function setupReadingProgress() {
  var bar = document.getElementById('reading-progress');
  if (!bar) return;

  window.addEventListener('scroll', function () {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

/* ── Table of contents ──────────────────────────────────────────────── */

function setupTOC() {
  var tocList = document.getElementById('toc-list');
  var article = document.getElementById('article-body');
  if (!tocList || !article) return;

  var headings = article.querySelectorAll('h2, h3, h4');
  if (headings.length < 2) {
    var sidebar = document.getElementById('toc-sidebar');
    if (sidebar) sidebar.style.display = 'none';
    return;
  }

  var fragment = document.createDocumentFragment();

  headings.forEach(function (h) {
    var id = h.id;
    if (!id) return;

    var li = document.createElement('li');
    li.className = 'toc-' + h.tagName.toLowerCase();

    var a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = h.textContent.replace(/\s*¶\s*$/, '').trim();
    li.appendChild(a);
    fragment.appendChild(li);
  });

  tocList.appendChild(fragment);

  // Highlight active section via IntersectionObserver
  if (!('IntersectionObserver' in window)) return;

  var links = tocList.querySelectorAll('a');
  var headingEls = Array.from(headings);
  var activeId = null;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        activeId = entry.target.id;
      }
    });

    // If nothing is intersecting (scrolled past), keep last active
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
    });
  }, {
    rootMargin: '0px 0px -65% 0px',
    threshold: 0
  });

  headingEls.forEach(function (h) { observer.observe(h); });
}

/* ── Copy buttons on code blocks ────────────────────────────────────── */

function setupCopyButtons() {
  var codeBlocks = document.querySelectorAll('.article-body pre');

  codeBlocks.forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code');

    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;

      if (!navigator.clipboard) {
        fallbackCopy(text);
        showCopied(btn);
        return;
      }

      navigator.clipboard.writeText(text).then(function () {
        showCopied(btn);
      }).catch(function () {
        fallbackCopy(text);
        showCopied(btn);
      });
    });

    pre.appendChild(btn);
  });
}

function showCopied(btn) {
  btn.textContent = 'Copied!';
  btn.classList.add('copied');
  setTimeout(function () {
    btn.textContent = 'Copy';
    btn.classList.remove('copied');
  }, 2000);
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

/* ── Back to top ─────────────────────────────────────────────────────── */

function setupBackToTop() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── External links ──────────────────────────────────────────────────── */

function setupExternalLinks() {
  var links = document.querySelectorAll('.article-body a[href]');
  links.forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/* ── Wrap tables for horizontal scroll ──────────────────────────────── */

function setupTableWrappers() {
  var tables = document.querySelectorAll('.article-body table');
  tables.forEach(function (table) {
    if (table.parentElement.classList.contains('table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
}

/* ── Color ✓ and ✗ in table cells ──────────────────────────────────── */

function setupCheckmarks() {
  var cells = document.querySelectorAll('.article-body td');
  cells.forEach(function (td) {
    var text = td.textContent.trim();
    if (text === '✓') {
      td.classList.add('mark-yes');
    } else if (text === '✗') {
      td.classList.add('mark-no');
    }
  });
}

/* ── Heading anchor links ────────────────────────────────────────────── */

function setupHeadingAnchors() {
  var headings = document.querySelectorAll('.article-body h2, .article-body h3, .article-body h4');
  headings.forEach(function (h) {
    if (!h.id) return;
    var a = document.createElement('a');
    a.className = 'anchor';
    a.href = '#' + h.id;
    a.setAttribute('aria-hidden', 'true');
    a.textContent = '¶';
    h.appendChild(a);
  });
}
