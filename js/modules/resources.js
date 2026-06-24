/* The "Resources & Sources" section (glyph/font credits, source list,
 * licensing). The poetic gesture-images now live on the cards, so the old
 * standalone gesture table is no longer rendered here. */
import { escapeHtml } from "./util.js";
import { store, el } from "./store.js";

export function buildResources() {
  var r = store.resources;
  var html = "<h2>Resources &amp; Sources</h2>";

  if (r.glyphFontResources) {
    html += "<h3>Glyph &amp; font resources (rendering the reduced characters)</h3>";
    html += '<div class="res-panel"><ul class="res-list">';
    r.glyphFontResources.forEach(function (g) {
      html += "<li><a href=\"" + escapeHtml(g.url) + "\" target=\"_blank\" rel=\"noopener\">" +
        escapeHtml(g.name) + "</a> — " + escapeHtml(g.note) + "</li>";
    });
    html += "</ul></div>";
  }

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
