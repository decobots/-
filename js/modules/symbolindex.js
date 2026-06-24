/* The quick symbol index (tap a glyph to jump to its card). */
import { escapeHtml } from "./util.js";
import { store, el } from "./store.js";
import { symbolHtml, hasTileGlyph } from "./symbol.js";
import { jumpToTechnique } from "./render.js";

export function buildSymbolIndex() {
  var html = '<div class="si-head">';
  html += '<strong>Quick symbol index</strong> <span>— tap a symbol to jump to its meaning</span>';
  html += "</div>";
  store.data.categories.forEach(function (cat) {
    var items = store.data.techniques.filter(function (t) { return t.category === cat.id; });
    if (!items.length) return;
    html += '<div class="si-group">';
    html += '<span class="si-cat" title="' + escapeHtml(cat.title) + '">' + escapeHtml(cat.section) + "</span>";
    html += '<div class="si-chips">';
    items.forEach(function (t) {
      var tip = t.name_hanzi + " · " + t.name_pinyin;
      html += '<button class="si-chip' + (hasTileGlyph(t) ? " has-img" : "") + '" data-id="' + t.id +
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
