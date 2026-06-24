/* The score symbol for a technique, best representation first — preferring
 * crisp vector forms over the low-resolution hand-drawn scan:
 *   1. a vector SVG glyph (self-hosted) where we have one,
 *   2. the font-composed tablature glyph (bundled Qin Jianzipu font, vector),
 *   3. a hand-drawn reduced-character notation scan (peiyouqin, raster),
 *   4. the plain reduced jianzipu character.
 */
import { escapeHtml } from "./util.js";

export function glyphKind(t) {
  if (t.image) return "svg";
  if (t.font_input) return "font";
  if (t.glyph_image) return "raster";
  return "char";
}

export function symbolHtml(t, extraClass) {
  var cls = extraClass || "";
  switch (glyphKind(t)) {
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
// (SVG and the raster scan do; the font and bare character do not.)
export function hasTileGlyph(t) {
  var k = glyphKind(t);
  return k === "svg" || k === "raster";
}
