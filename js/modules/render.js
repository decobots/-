/* Filtering, the main results render, and in-page navigation
 * (click-to-play videos + jump-to-related-card). */
import { escapeHtml, normalize } from "./util.js";
import { state, store, el, catById } from "./store.js";
import { categoryBlock } from "./card.js";

function matches(t) {
  if (state.cat !== "all" && t.category !== state.cat) return false;
  var q = normalize(state.query);
  if (!q) return true;
  var hay = normalize([
    t.id, t.name_hanzi, t.name_pinyin, t.instruction_text,
    t.poetic_image, t.poetic_verse, t.notes, t.jianzipu_glyph, t.direction
  ].join(" "));
  var c = catById(t.category);
  if (c) hay += " " + normalize(c.title);
  return q.split(" ").every(function (tok) { return hay.indexOf(tok) !== -1; });
}

export function render() {
  var visible = store.data.techniques.filter(matches);

  var html = "";
  store.data.categories.forEach(function (cat) {
    if (state.cat !== "all" && cat.id !== state.cat) return;
    var items = visible.filter(function (t) { return t.category === cat.id; });
    if (!items.length) return;
    html += categoryBlock(cat, items);
  });

  el.results.innerHTML = html;
  el.empty.hidden = visible.length !== 0;

  Array.prototype.forEach.call(el.sidebar.querySelectorAll(".nav-item[data-cat]"), function (b) {
    b.classList.toggle("is-active", b.getAttribute("data-cat") === state.cat);
  });
}

// Bring a technique into view and flash it (clearing any active filter first).
export function jumpToTechnique(id) {
  if (state.cat !== "all" || state.query) {
    state.cat = "all";
    state.query = "";
    if (el.search) el.search.value = "";
    render();
  }
  var node = document.getElementById("t-" + id);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node.classList.remove("flash");
  void node.offsetWidth; // restart the highlight animation
  node.classList.add("flash");
}

// One delegated handler on the results container: click-to-play a video,
// or jump to a related technique.
export function bindResultsClicks() {
  el.results.addEventListener("click", function (e) {
    var jump = e.target.closest(".rel-chip");
    if (jump) { jumpToTechnique(jump.getAttribute("data-jump")); return; }

    var btn = e.target.closest(".video-btn");
    if (!btn) return;
    var box = btn.closest(".video[data-yt]");
    if (!box) return;
    var id = box.getAttribute("data-yt");
    box.innerHTML = '<div class="video-frame"><iframe ' +
      'src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&playsinline=1" ' +
      'title="Technique demonstration" frameborder="0" ' +
      'allow="autoplay; fullscreen; encrypted-media; picture-in-picture" ' +
      'allowfullscreen loading="lazy"></iframe></div>';

    // Go fullscreen immediately (still inside the click's user-gesture). The
    // iframe keeps autoplaying inline if fullscreen is unavailable (e.g. iOS).
    var frame = box.querySelector("iframe");
    var req = frame.requestFullscreen || frame.webkitRequestFullscreen ||
      frame.webkitEnterFullscreen || frame.mozRequestFullScreen || frame.msRequestFullscreen;
    if (req) {
      try {
        var ret = req.call(frame);
        if (ret && ret.catch) ret.catch(function () {});
      } catch (err) { /* fall back to inline playback */ }
    }
  });
}
