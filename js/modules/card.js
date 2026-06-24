/* Renders one self-contained technique card: glyph, instruction, demo
 * photo, any number of embeds (videos + illustrations), the poetic
 * gesture-image, cross-links to related techniques, and sources. */
import { escapeHtml, hostOf } from "./util.js";
import { store } from "./store.js";
import { symbolHtml, hasTileGlyph } from "./symbol.js";

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

// Any number of embeds. YouTube plays inline (click-to-play, no redirect);
// illustrations are shown inline with a caption.
function mediaHtml(t) {
  if (!t.media || !t.media.length) return "";
  var html = '<div class="media">';
  t.media.forEach(function (m) {
    if (m.type === "youtube" && m.id) {
      html += '<div class="video" data-yt="' + escapeHtml(m.id) + '">' +
        '<button class="video-btn" type="button">▶ ' + escapeHtml(m.label || "Watch demo") + "</button></div>";
    } else if (m.type === "image" && m.src) {
      html += '<figure class="media-img"><img src="' + escapeHtml(m.src) +
        '" alt="' + escapeHtml(m.caption || "") + '" loading="lazy" />' +
        (m.caption ? '<figcaption>' + escapeHtml(m.caption) + "</figcaption>" : "") + "</figure>";
    }
  });
  html += "</div>";
  return html;
}

// Clickable chips to compare/contrast related techniques (keeps each card
// self-contained while linking the motions a learner should see together).
function relatedHtml(t) {
  if (!t.related || !t.related.length) return "";
  var chips = t.related.map(function (r) {
    var rt = store.byId[r.id];
    if (!rt) return "";
    return '<button class="rel-chip" data-jump="' + escapeHtml(r.id) + '" ' +
      'title="' + escapeHtml(rt.name_pinyin) + ' — ' + escapeHtml(r.label) + '">' +
      '<span class="rel-rel">' + escapeHtml(r.label) + "</span>" +
      '<span class="rel-name">' + escapeHtml(rt.name_hanzi) + " " +
      '<i>' + escapeHtml(rt.name_pinyin) + "</i></span></button>";
  }).join("");
  if (!chips) return "";
  return '<div class="related"><span class="related-label">Related</span>' +
    '<div class="related-chips">' + chips + "</div></div>";
}

// The poetic gesture-image (手勢圖 woodblock) folded onto the card.
function poeticHtml(t) {
  var g = store.gestureByTech[t.id];
  if (g) {
    var html = '<div class="poetic poetic-gesture">';
    html += '<img class="poetic-img" src="' + escapeHtml(g.photo) +
      '" alt="' + escapeHtml(g.title) + ' — gesture woodblock" loading="lazy" />';
    html += '<div class="poetic-body">';
    html += '<span class="poetic-label">Poetic gesture · 手勢圖</span>';
    html += '<div class="poetic-title">' + escapeHtml(g.title) + "</div>";
    if (g.verse_hanzi) {
      html += '<div class="poetic-verse">「' + escapeHtml(g.verse_hanzi) + "」</div>";
    }
    if (g.verse_en) {
      html += '<div class="poetic-gloss">' + escapeHtml(g.verse_en) + "</div>";
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

export function card(t) {
  var multi = (t.jianzipu_glyph || "").replace(/\s/g, "").length > 1 && !t.font_input && !hasTileGlyph(t);
  var html = "";
  html += '<article class="card" id="t-' + t.id + '">';

  html += '  <div class="card-meta">';
  html += handTag(t.hand);
  if (t.direction) html += '<span class="tag dir">' + escapeHtml(t.direction) + "</span>";
  html += "  </div>";

  html += '  <div class="card-top">';
  var boxCls = hasTileGlyph(t) ? "is-img" : (t.font_input ? "is-jzp" : (multi ? "multi" : ""));
  html += '    <div class="glyph-box ' + boxCls + '" title="jianzipu score symbol">' + symbolHtml(t) + "</div>";
  html += '    <div class="card-head">';
  html += '      <div class="card-id">' + escapeHtml(t.id) + "</div>";
  html += '      <div class="card-hanzi">' + escapeHtml(t.name_hanzi) + "</div>";
  html += '      <div class="card-pinyin">' + escapeHtml(t.name_pinyin) + "</div>";
  html += "    </div>";
  html += "  </div>";

  html += '  <p class="card-instruction">' + escapeHtml(t.instruction_text) + "</p>";

  if (t.photo) {
    html += '  <figure class="card-photo"><img src="' + escapeHtml(t.photo) +
      '" alt="' + escapeHtml(t.name_pinyin) + ' hand position" loading="lazy" /></figure>';
  }

  html += mediaHtml(t);
  html += relatedHtml(t);
  html += poeticHtml(t);
  if (t.notes) html += '  <p class="card-notes">' + escapeHtml(t.notes) + "</p>";
  html += '  <div class="card-sources">' + sourceLinks(t.source_url) + "</div>";
  html += "</article>";
  return html;
}

export function categoryBlock(cat, techniques) {
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
