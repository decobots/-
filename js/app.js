/* Guqin Finger-Technique Reference — vanilla JS, no build step. */
(function () {
  "use strict";

  var DATA = null;       // techniques.json
  var RESOURCES = null;  // resources.json
  var state = { cat: "all", query: "", poeticOnly: false };

  var el = {
    results: document.getElementById("results"),
    resources: document.getElementById("resources"),
    navCategories: document.getElementById("navCategories"),
    search: document.getElementById("search"),
    poeticOnly: document.getElementById("poeticOnly"),
    empty: document.getElementById("empty"),
    sidebar: document.getElementById("sidebar")
  };

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
    if (state.poeticOnly && !t.poetic_image && !t.poetic_verse) return false;
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
      return '<a href="' + escapeHtml(u) + '" target="_blank" rel="noopener">' +
        '<span class="src-dot"></span>' + escapeHtml(hostOf(u)) + "</a>";
    }).join("");
  }

  function card(t) {
    var glyph = t.jianzipu_glyph || t.name_hanzi;
    var multi = glyph && glyph.replace(/\s/g, "").length > 1 ? " multi" : "";
    var html = "";
    html += '<article class="card" id="t-' + t.id + '">';
    html += '  <div class="card-top">';
    html += '    <div class="glyph-box' + multi + '" title="reduced jianzipu form">' + escapeHtml(glyph) + "</div>";
    html += '    <div>';
    html += '      <div class="card-id">' + escapeHtml(t.id) + "</div>";
    html += '      <div class="card-name">' + escapeHtml(t.name_hanzi) + "</div>";
    html += '      <div class="card-pinyin">' + escapeHtml(t.name_pinyin) + "</div>";
    html += "    </div>";
    html += "  </div>";

    html += '  <div class="card-meta">';
    html += handTag(t.hand);
    html += '<span class="tag reduced">reduced&nbsp;<b>' + escapeHtml(glyph) + "</b></span>";
    if (t.direction) html += '<span class="tag dir">' + escapeHtml(t.direction) + "</span>";
    html += "  </div>";

    html += '  <p class="card-instruction">' + escapeHtml(t.instruction_text) + "</p>";

    if (t.poetic_image || t.poetic_verse) {
      html += '  <div class="poetic"><span class="poetic-label">Poetic gesture-image</span>' +
        escapeHtml(t.poetic_image || t.poetic_verse) + "</div>";
    }
    if (t.notes) html += '  <p class="card-notes">' + escapeHtml(t.notes) + "</p>";

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

    // update active nav
    Array.prototype.forEach.call(el.sidebar.querySelectorAll(".nav-item[data-cat]"), function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-cat") === state.cat);
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

  // ---------- events ----------
  function bindControls() {
    var debounce;
    el.search.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { state.query = el.search.value; render(); }, 120);
    });
    el.poeticOnly.addEventListener("change", function () {
      state.poeticOnly = el.poeticOnly.checked; render();
    });
  }

  // ---------- boot ----------
  function load(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + url + " (" + res.status + ")");
      return res.json();
    });
  }

  Promise.all([load("data/techniques.json"), load("data/resources.json")])
    .then(function (results) {
      DATA = results[0];
      RESOURCES = results[1];
      buildNav();
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
