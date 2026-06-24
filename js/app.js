/* Guqin Finger-Technique Reference — entry point.
 * Vanilla ES modules, no build step (served over http for fetch + modules). */
import { state, store, el, bindEls, load } from "./modules/store.js";
import { indexGestures } from "./modules/gestures.js";
import { render, bindResultsClicks } from "./modules/render.js";
import { buildNav } from "./modules/nav.js";
import { buildSymbolIndex } from "./modules/symbolindex.js";
import { buildComposer } from "./modules/composer.js";
import { buildResources } from "./modules/resources.js";
import { escapeHtml } from "./modules/util.js";

bindEls();

function bindControls() {
  var debounce;
  el.search.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () { state.query = el.search.value; render(); }, 120);
  });
}

Promise.all([
  load("data/techniques.json"),
  load("data/resources.json"),
  load("data/gestures.json")
]).then(function (results) {
  store.data = results[0];
  store.resources = results[1];
  store.gestures = results[2];
  store.byId = {};
  store.data.techniques.forEach(function (t) { store.byId[t.id] = t; });

  indexGestures();
  buildNav();
  buildSymbolIndex();
  buildComposer();
  buildResources();
  bindControls();
  bindResultsClicks();
  render();
}).catch(function (err) {
  el.results.innerHTML = '<div class="empty">Could not load data: ' + escapeHtml(err.message) +
    '<br><br>If you opened this file directly, run a local server instead ' +
    '(e.g. <code>python3 -m http.server</code>) so the browser can fetch the JSON.</div>';
  console.error(err);
});
