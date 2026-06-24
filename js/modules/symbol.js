/* The score symbol for a technique, best representation first:
 *   1. a crisp hand-drawn SVG glyph (self-hosted) where we have one,
 *   2. a hand-drawn reduced-character notation glyph (peiyouqin scan),
 *   3. the font-composed tablature glyph (bundled Qin Jianzipu font),
 *   4. the plain reduced jianzipu character.
 */
import { escapeHtml } from "./util.js";

export function symbolHtml(t, extraClass) {
  var cls = extraClass || "";
  if (t.image) {
    return '<img class="glyph-img ' + cls + '" src="' + escapeHtml(t.image) +
      '" alt="' + escapeHtml(t.name_hanzi) + ' jianzipu glyph" loading="lazy" />';
  }
  if (t.glyph_image) {
    return '<img class="glyph-img glyph-hand ' + cls + '" src="' + escapeHtml(t.glyph_image) +
      '" alt="' + escapeHtml(t.name_hanzi) + ' notation glyph" loading="lazy" />';
  }
  if (t.font_input) return '<span class="jzp ' + cls + '">' + escapeHtml(t.font_input) + "</span>";
  return '<span class="cjk ' + cls + '">' + escapeHtml(t.jianzipu_glyph || t.name_hanzi) + "</span>";
}

// Does this technique render its glyph on a light "parchment" tile?
export function hasTileGlyph(t) {
  return !!(t.image || t.glyph_image);
}
