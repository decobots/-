/* Guqin Finger-Technique Reference — vanilla JS, no build step. */
(function () {
  "use strict";

  var DATA = null;       // techniques.json
  var RESOURCES = null;  // resources.json
  var GESTURES = null;   // gestures.json
  var GESTURE_BY_TECH = {}; // technique_id -> its poetic gesture-image
  var state = { cat: "all", query: "" };

  var el = {
    results: document.getElementById("results"),
    resources: document.getElementById("resources"),
    navCategories: document.getElementById("navCategories"),
    search: document.getElementById("search"),
    symbolIndex: document.getElementById("symbolIndex"),
    composer: document.getElementById("composer"),
    empty: document.getElementById("empty"),
    sidebar: document.getElementById("sidebar")
  };

  // The score symbol for a technique, best representation first:
  //  1. a real jianzipu glyph image (self-hosted SVG) where we have one,
  //  2. the font-composed tablature glyph,
  //  3. the reduced jianzipu character.
  function symbolHtml(t, extraClass) {
    var cls = extraClass || "";
    if (t.image) {
      return '<img class="glyph-img ' + cls + '" src="' + escapeHtml(t.image) +
        '" alt="' + escapeHtml(t.name_hanzi) + ' jianzipu glyph" loading="lazy" />';
    }
    if (t.font_input) return '<span class="jzp ' + cls + '">' + escapeHtml(t.font_input) + "</span>";
    return '<span class="cjk ' + cls + '">' + escapeHtml(t.jianzipu_glyph || t.name_hanzi) + "</span>";
  }

  // ---------- helpers ----------
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // strip tone marks + spaces so "naozhi" / "nao zhi" / "náo" all match
  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch (e) { return url; }
  }

  function catById(id) {
    return DATA.categories.filter(function (c) { return c.id === id; })[0];
  }

  // ---------- filtering ----------
  function matches(t) {
    if (state.cat !== "all" && t.category !== state.cat) return false;
    var q = normalize(state.query);
    if (!q) return true;
    var hay = normalize([
      t.id, t.name_hanzi, t.name_pinyin, t.instruction_text,
      t.poetic_image, t.poetic_verse, t.notes, t.jianzipu_glyph, t.direction
    ].join(" "));
    // also include the category title in the haystack
    var c = catById(t.category);
    if (c) hay += " " + normalize(c.title);
    return q.split(" ").every(function (tok) { return hay.indexOf(tok) !== -1; });
  }

  // ---------- rendering ----------
  function handTag(hand) {
    var label = hand === "left" ? "left hand" : hand === "right" ? "right hand" : "either hand";
    return '<span class="tag hand-' + hand + '">' + label + "</span>";
  }

  function sourceLinks(urls) {
    return (urls || []).map(function (u) {
      var host = hostOf(u);
      var label = host.indexOf("silkqin.com") !== -1 ? "silkqin reference"
        : host.indexOf("peiyouqin.com") !== -1 ? "peiyouqin" : host;
      return '<a class="src-link" href="' + escapeHtml(u) + '" target="_blank" rel="noopener">' +
        '<span class="src-dot"></span>' + escapeHtml(label) + "</a>";
    }).join("");
  }

  // A demo video: YouTube plays inline on the page (click to load — no redirect);
  // a peiyouqin page (which embeds its own clip) opens in a new tab.
  function videoHtml(t) {
    if (t.video_kind === "youtube" && t.video_id) {
      var label = "▶ Watch demo" + (t.video_shared ? " · the 8 basic strokes" : "");
      return '<div class="video" data-yt="' + escapeHtml(t.video_id) + '">' +
        '<button class="video-btn" type="button">' + escapeHtml(label) + "</button></div>";
    }
    if (t.video_kind === "page" && t.video_url) {
      return '<div class="video"><a class="video-btn as-link" href="' + escapeHtml(t.video_url) +
        '" target="_blank" rel="noopener">▶ Demo video (opens peiyouqin.com)</a></div>';
    }
    return "";
  }

  // The poetic gesture-image for a card: prefer the Taiyin Daquanji woodblock
  // (手勢圖) where one maps to this technique; otherwise fall back to any
  // poetic image/verse text already on the technique.
  function poeticHtml(t) {
    var g = GESTURE_BY_TECH[t.id];
    if (g) {
      var html = '<div class="poetic poetic-gesture">';
      html += '<img class="poetic-img" src="' + escapeHtml(g.photo) +
        '" alt="' + escapeHtml(g.title) + ' — gesture woodblock" loading="lazy" />';
      html += '<div class="poetic-body">';
      html += '<span class="poetic-label">Poetic gesture · 手勢圖</span>';
      html += '<div class="poetic-title">' + escapeHtml(g.title) + "</div>";
      if (g.verse_hanzi) {
        html += '<div class="poetic-verse">「' + escapeHtml(g.verse_hanzi) + "」" +
          (g.verse_pinyin ? ' <i>' + escapeHtml(g.verse_pinyin) + "</i>" : "") + "</div>";
      }
      html += '<a href="' + escapeHtml(g.source) + '" target="_blank" rel="noopener">Woodblock &amp; full verse →</a>';
      html += "</div></div>";
      return html;
    }
    if (t.poetic_image || t.poetic_verse) {
      return '<div class="poetic"><span class="poetic-label">Poetic gesture-image</span>' +
        escapeHtml(t.poetic_image || t.poetic_verse) + "</div>";
    }
    return "";
  }

  function card(t) {
    var multi = (t.jianzipu_glyph || "").replace(/\s/g, "").length > 1 && !t.font_input;
    var html = "";
    html += '<article class="card" id="t-' + t.id + '">';
    html += '  <div class="card-top">';
    var boxCls = t.image ? "is-img" : (t.font_input ? "is-jzp" : (multi ? "multi" : ""));
    html += '    <div class="glyph-box ' + boxCls + '" title="jianzipu score symbol">' + symbolHtml(t) + "</div>";
    html += '    <div>';
    html += '      <div class="card-id">' + escapeHtml(t.id) + "</div>";
    html += '      <div class="card-pinyin">' + escapeHtml(t.name_pinyin) + "</div>";
    html += "    </div>";
    html += "  </div>";

    html += '  <div class="card-meta">';
    html += handTag(t.hand);
    if (t.direction) html += '<span class="tag dir">' + escapeHtml(t.direction) + "</span>";
    html += "  </div>";

    html += '  <p class="card-instruction">' + escapeHtml(t.instruction_text) + "</p>";

    if (t.photo) {
      html += '  <figure class="card-photo"><img src="' + escapeHtml(t.photo) +
        '" alt="' + escapeHtml(t.name_pinyin) + ' hand position" loading="lazy" />' +
        '<figcaption>Hand position · peiyouqin.com</figcaption></figure>';
    }

    html += poeticHtml(t);
    if (t.notes) html += '  <p class="card-notes">' + escapeHtml(t.notes) + "</p>";

    html += videoHtml(t);
    html += '  <div class="card-sources">' + sourceLinks(t.source_url) + "</div>";
    html += "</article>";
    return html;
  }

  function categoryBlock(cat, techniques) {
    var html = '<section class="cat-block" id="cat-' + cat.id + '">';
    html += '  <div class="cat-head">';
    html += '    <h2><span class="cat-badge">' + escapeHtml(cat.section) + "</span>" +
            escapeHtml(cat.title) +
            ' <span class="cat-sub">' + escapeHtml(cat.subtitle) + "</span></h2>";
    if (cat.description) html += '    <p class="cat-desc">' + escapeHtml(cat.description) + "</p>";
    html += "  </div>";
    html += '  <div class="grid">' + techniques.map(card).join("") + "</div>";
    html += "</section>";
    return html;
  }

  function render() {
    var visible = DATA.techniques.filter(matches);

    // group by category, preserving category order
    var html = "";
    DATA.categories.forEach(function (cat) {
      if (state.cat !== "all" && cat.id !== state.cat) return;
      var items = visible.filter(function (t) { return t.category === cat.id; });
      if (!items.length) return;
      html += categoryBlock(cat, items);
    });

    el.results.innerHTML = html;
    el.empty.hidden = visible.length !== 0;
    bindVideoPlay();

    // update active nav
    Array.prototype.forEach.call(el.sidebar.querySelectorAll(".nav-item[data-cat]"), function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-cat") === state.cat);
    });
  }

  // Click-to-play: swap the button for an inline YouTube iframe (privacy-enhanced,
  // no autoplay redirect — the video plays right inside the card).
  var videoBound = false;
  function bindVideoPlay() {
    if (videoBound) return;
    videoBound = true;
    el.results.addEventListener("click", function (e) {
      var btn = e.target.closest(".video-btn");
      if (!btn || btn.classList.contains("as-link")) return;
      var box = btn.closest(".video[data-yt]");
      if (!box) return;
      var id = box.getAttribute("data-yt");
      box.innerHTML = '<div class="video-frame"><iframe ' +
        'src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0" ' +
        'title="Technique demonstration" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" ' +
        'allowfullscreen loading="lazy"></iframe></div>';
    });
  }

  // ---------- nav ----------
  function buildNav() {
    var counts = {};
    DATA.techniques.forEach(function (t) { counts[t.category] = (counts[t.category] || 0) + 1; });

    document.querySelector('[data-count="all"]').textContent = DATA.techniques.length;

    var html = "";
    DATA.categories.forEach(function (cat) {
      html += '<button class="nav-item" data-cat="' + cat.id + '">';
      html += '  <span class="nav-label"><span class="nav-section">SECTION ' + escapeHtml(cat.section) + "</span>" +
              escapeHtml(cat.title) + "</span>";
      html += '  <span class="nav-count">' + (counts[cat.id] || 0) + "</span>";
      html += "</button>";
    });
    el.navCategories.innerHTML = html;

    el.sidebar.addEventListener("click", function (e) {
      var btn = e.target.closest(".nav-item[data-cat]");
      if (!btn) return;
      state.cat = btn.getAttribute("data-cat");
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- resources section ----------
  function buildResources() {
    var r = RESOURCES;
    var html = "<h2>Resources &amp; Sources</h2>";

    // Poetic gestures
    if (r.poeticGestures) {
      var pg = r.poeticGestures;
      html += "<h3>" + escapeHtml(pg.title) + "</h3>";
      html += '<div class="res-panel">';
      html += "<p>" + escapeHtml(pg.intro) + "</p>";
      html += '<table class="gesture-table"><thead><tr><th>Technique</th><th>Gesture image (poetic)</th><th>Verse theme</th></tr></thead><tbody>';
      pg.examples.forEach(function (ex) {
        html += "<tr><td class=\"g-tech\">" + escapeHtml(ex.technique) + "</td><td>" +
          escapeHtml(ex.image) + "</td><td>" + escapeHtml(ex.verse_theme) + "</td></tr>";
      });
      html += "</tbody></table>";
      html += '<p style="margin-top:.8rem">Full set of 33 illustrations + verses + translations: ' +
        '<a href="' + escapeHtml(pg.source) + '" target="_blank" rel="noopener">silkqin.com Taiyin Daquanji</a>' +
        ' · <a href="' + escapeHtml(pg.historyContext) + '" target="_blank" rel="noopener">history &amp; dating</a></p>';
      html += "</div>";
    }

    // Glyph / font resources
    if (r.glyphFontResources) {
      html += "<h3>Glyph &amp; font resources (rendering the reduced characters)</h3>";
      html += '<div class="res-panel"><ul class="res-list">';
      r.glyphFontResources.forEach(function (g) {
        html += "<li><a href=\"" + escapeHtml(g.url) + "\" target=\"_blank\" rel=\"noopener\">" +
          escapeHtml(g.name) + "</a> — " + escapeHtml(g.note) + "</li>";
      });
      html += "</ul></div>";
    }

    // Source groups
    if (r.sources) {
      html += "<h3>Consolidated source list</h3>";
      r.sources.forEach(function (grp) {
        html += '<div class="res-panel"><strong>' + escapeHtml(grp.group) + "</strong><ul class=\"res-list\">";
        grp.links.forEach(function (link) {
          html += "<li><a href=\"" + escapeHtml(link.url) + "\" target=\"_blank\" rel=\"noopener\">" +
            escapeHtml(link.label) + "</a></li>";
        });
        html += "</ul></div>";
      });
    }

    // Licensing
    if (r.licensing) {
      html += "<h3>Licensing &amp; attribution</h3>";
      html += '<div class="res-panel"><ul class="res-list license-note">';
      r.licensing.forEach(function (l) { html += "<li>" + escapeHtml(l) + "</li>"; });
      html += "</ul>";
      if (r.coverageNote) html += '<p class="license-note">' + escapeHtml(r.coverageNote) + "</p>";
      html += "</div>";
    }

    el.resources.innerHTML = html;
  }

  // Index the Taiyin Daquanji gesture-images by the technique they illustrate,
  // so each card can render its own poetic gesture inline (no separate section).
  function indexGestures() {
    GESTURE_BY_TECH = {};
    if (!GESTURES) return;
    GESTURES.gestures.forEach(function (g) {
      if (g.technique_id) GESTURE_BY_TECH[g.technique_id] = g;
    });
  }

  // ---------- jianzipu composer ----------
  var COMPOSER_PRESETS = [
    { label: "勾 hook", input: "\\g" },
    { label: "抹 mo", input: "\\m" },
    { label: "挑 tiao", input: "\\t" },
    { label: "撮 cuo", input: "||" },
    { label: "吟 yin", input: "\\yin" },
    { label: "猱 nao", input: "\\nao" },
    { label: "Full note: 大 + hook, str 7, hui 7.6", input: "/da\\g\\7-z7-6" }
  ];
  var COMPOSER_TOKENS = [
    ["Right-hand technique", "<code>\\m</code>抹 <code>\\t</code>挑 <code>\\g</code>勾 <code>\\i</code>剔 <code>\\d</code>打 <code>\\z</code>摘 <code>\\b</code>擘 <code>\\u</code>托 <code>||</code>撮"],
    ["Left-hand technique", "<code>\\yin</code>吟 <code>\\nao</code>猱 <code>\\dou</code>逗 <code>\\dai</code>帶 <code>\\jin</code>進 <code>\\tui</code>退 <code>\\fu</code>扶 <code>\\qia</code>掐"],
    ["Left finger (presses)", "<code>/da</code>大 <code>/sh</code>食 <code>/zh</code>中 <code>/mi</code>名"],
    ["String number", "<code>\\1</code> … <code>\\7</code>"],
    ["Hui position", "<code>-z1</code> … <code>-z13</code>"],
    ["Hui tenths (fraction)", "<code>-1</code> … <code>-9</code>"]
  ];

  function renderComposerPreview(value) {
    var node = document.getElementById("composerPreview");
    if (node) node.textContent = value || "\\g";
  }

  function buildComposer() {
    var html = "<h2>Jianzipu Composer</h2>";
    html += '<div class="res-panel">';
    html += "<p>The bundled <strong>Qin Jianzipu</strong> font (SIL OFL) composes a true stacked tablature glyph from a command string via OpenType ligatures. " +
      "Type a sequence below — the base technique first, then finger / string / hui modifiers in any order, no spaces. " +
      "(Requires a browser with ligatures enabled, which all modern browsers do by default.)</p>";
    html += '<div class="composer">';
    html += '  <div class="composer-preview"><span id="composerPreview" class="jzp">\\g</span></div>';
    html += '  <div class="composer-controls">';
    html += '    <input id="composerInput" type="text" value="/da\\g\\7-z7-6" spellcheck="false" autocomplete="off" aria-label="Jianzipu command string" />';
    html += '    <div class="preset-row">';
    COMPOSER_PRESETS.forEach(function (p, i) {
      html += '<button class="preset" data-input="' + escapeHtml(p.input) + '">' + escapeHtml(p.label) + "</button>";
    });
    html += "    </div>";
    html += '    <table class="token-table"><tbody>';
    COMPOSER_TOKENS.forEach(function (row) {
      html += "<tr><th>" + escapeHtml(row[0]) + "</th><td>" + row[1] + "</td></tr>";
    });
    html += "    </tbody></table>";
    html += '    <p class="license-note">Token map extracted directly from qinfont 3.0.1 ligature tables. Syntax &amp; font: ' +
      '<a href="https://github.com/Adrakaris/guqin-jianzipu-font" target="_blank" rel="noopener">Adrakaris/guqin-jianzipu-font</a> ' +
      '(designs by <a href="https://yijun.hu/blog-misc/guqin/" target="_blank" rel="noopener">Yijun Hu</a>).</p>';
    html += "  </div></div></div>";
    el.composer.innerHTML = html;

    var input = document.getElementById("composerInput");
    renderComposerPreview(input.value);
    input.addEventListener("input", function () { renderComposerPreview(input.value); });
    el.composer.addEventListener("click", function (e) {
      var btn = e.target.closest(".preset");
      if (!btn) return;
      input.value = btn.getAttribute("data-input");
      renderComposerPreview(input.value);
      input.focus();
    });
  }

  // ---------- symbol index (quick lookup palette) ----------
  function buildSymbolIndex() {
    var html = '<div class="si-head">';
    html += '<strong>Quick symbol index</strong> <span>— tap a symbol to jump to its meaning</span>';
    html += "</div>";
    DATA.categories.forEach(function (cat) {
      var items = DATA.techniques.filter(function (t) { return t.category === cat.id; });
      if (!items.length) return;
      html += '<div class="si-group">';
      html += '<span class="si-cat" title="' + escapeHtml(cat.title) + '">' + escapeHtml(cat.section) + "</span>";
      html += '<div class="si-chips">';
      items.forEach(function (t) {
        var tip = t.name_hanzi + " · " + t.name_pinyin;
        html += '<button class="si-chip' + (t.image ? " has-img" : "") + '" data-id="' + t.id +
          '" title="' + escapeHtml(tip) + '" aria-label="' + escapeHtml(tip) + '">' +
          symbolHtml(t, "si-glyph") + "</button>";
      });
      html += "</div></div>";
    });
    el.symbolIndex.innerHTML = html;

    el.symbolIndex.addEventListener("click", function (e) {
      var chip = e.target.closest(".si-chip");
      if (!chip) return;
      jumpToTechnique(chip.getAttribute("data-id"));
    });
  }

  function jumpToTechnique(id) {
    // make sure the target is visible (clear any category filter / search)
    if (state.cat !== "all" || state.query) {
      state.cat = "all";
      state.query = "";
      el.search.value = "";
      render();
    }
    var node = document.getElementById("t-" + id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.classList.remove("flash");
    // restart the highlight animation
    void node.offsetWidth;
    node.classList.add("flash");
  }

  // ---------- events ----------
  function bindControls() {
    var debounce;
    el.search.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { state.query = el.search.value; render(); }, 120);
    });
  }

  // ---------- boot ----------
  function load(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + url + " (" + res.status + ")");
      return res.json();
    });
  }

  Promise.all([load("data/techniques.json"), load("data/resources.json"), load("data/gestures.json")])
    .then(function (results) {
      DATA = results[0];
      RESOURCES = results[1];
      GESTURES = results[2];
      indexGestures();
      buildNav();
      buildSymbolIndex();
      buildComposer();
      buildResources();
      bindControls();
      render();
    })
    .catch(function (err) {
      el.results.innerHTML = '<div class="empty">Could not load data: ' + escapeHtml(err.message) +
        '<br><br>If you opened this file directly, run a local server instead ' +
        '(e.g. <code>python3 -m http.server</code>) so the browser can fetch the JSON.</div>';
      console.error(err);
    });
})();
