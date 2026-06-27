/* The score symbol for a technique, best representation first:
 *   1. the hand-drawn glyph (scanned from the Wu-family handwriting), where we have one,
 *   2. a vector SVG glyph (self-hosted),
 *   3. the font-composed tablature glyph (bundled Qin Jianzipu font, vector),
 *   4. a hand-drawn reduced-character notation scan (peiyouqin, raster),
 *   5. the plain reduced jianzipu character.
 */
import { escapeHtml } from "./util.js";

export function glyphKind(t) {
  if (t.hand_glyph) return "hand";
  if (t.image) return "svg";
  if (t.font_input) return "font";
  if (t.glyph_image) return "raster";
  return "char";
}

export function symbolHtml(t, extraClass) {
  var cls = extraClass || "";
  switch (glyphKind(t)) {
    case "hand":
      // black ink on white → shown black-on-cream via mix-blend on the tile
      return '<img class="glyph-img glyph-ink ' + cls + '" src="' + escapeHtml(t.hand_glyph) +
        '" alt="' + escapeHtml(t.name_hanzi) + ' jianzipu glyph" loading="lazy" />';
    case "svg":
      return '<img class="glyph-img ' + cls + '" src="' + escapeHtml(t.image) +
        '" alt="' + escapeHtml(t.name_hanzi) + ' jianzipu glyph" loading="lazy" />';
    case "font":
      return '<span class="jzp ' + cls + '">' + escapeHtml(t.font_input) + "</span>";
    case "raster":
      return '<img class="glyph-img glyph-hand ' + cls + '" src="' + escapeHtml(t.glyph_image) +
        '" alt="' + escapeHtml(t.name_hanzi) + ' notation glyph" loading="lazy" />';
    default:
      return '<span class="cjk ' + cls + '">' + escapeHtml(t.jianzipu_glyph || t.name_hanzi) + "</span>";
  }
}

// Does this technique render its glyph on a light "parchment" tile?
// (hand-drawn ink, SVG and the raster scan do; the font and bare character do not.)
export function hasTileGlyph(t) {
  var k = glyphKind(t);
  return k === "hand" || k === "svg" || k === "raster";
}
