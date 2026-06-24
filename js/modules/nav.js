/* Sidebar category navigation. */
import { escapeHtml } from "./util.js";
import { state, store, el } from "./store.js";
import { render } from "./render.js";

export function buildNav() {
  var counts = {};
  store.data.techniques.forEach(function (t) { counts[t.category] = (counts[t.category] || 0) + 1; });

  document.querySelector('[data-count="all"]').textContent = store.data.techniques.length;

  var html = "";
  store.data.categories.forEach(function (cat) {
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
