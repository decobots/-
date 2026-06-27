/* Filtering, the main results render, and in-page navigation
 * (click-to-play videos + jump-to-related-card). */
import { escapeHtml, normalize } from "./util.js";
import { state, store, el, catById } from "./store.js";
import { categoryBlock, card } from "./card.js";

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
  if (state.set) { renderSet(); return; }
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

// A song set: only the listed book numbers, in the listed order (flat).
function renderSet() {
  var nums = state.set.nums;
  var items = nums.map(function (n) { return store.byId[String(n)]; });
  var found = items.filter(Boolean);
  var missing = nums.filter(function (n) { return !store.byId[String(n)]; });
  var html = '<section class="cat-block"><div class="cat-head">';
  html += '<h2><span class="cat-badge">SET</span>' + escapeHtml(state.set.name || "Set") +
    ' <span class="cat-sub">' + found.length + " technique" + (found.length === 1 ? "" : "s") +
    " · in sequence</span></h2>";
  if (missing.length) html += '<p class="cat-desc">Not in the set data: №' + missing.join(", №") + "</p>";
  html += "</div>";
  html += '<div class="grid">' + found.map(card).join("") + "</div></section>";
  el.results.innerHTML = html;
  el.empty.hidden = found.length !== 0;
  Array.prototype.forEach.call(el.sidebar.querySelectorAll(".nav-item[data-cat]"), function (b) {
    b.classList.remove("is-active");
  });
}

// Bring a technique into view and flash it (clearing any active filter first).
export function jumpToTechnique(id) {
  if (state.set) { state.set = null; document.dispatchEvent(new Event("setschange")); }
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

// Full-screen image viewer (lightbox). Built once, reused for every image.
function lightbox() {
  var ov = document.getElementById("lightbox");
  if (ov) return ov;
  ov = document.createElement("div");
  ov.id = "lightbox";
  ov.className = "lightbox";
  ov.innerHTML = '<button class="lb-close" aria-label="Close">×</button><img alt="" />';
  document.body.appendChild(ov);
  ov.addEventListener("click", function () { ov.classList.remove("open"); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") ov.classList.remove("open");
  });
  return ov;
}
function openLightbox(src, alt) {
  var ov = lightbox();
  var img = ov.querySelector("img");
  img.src = src;
  img.alt = alt || "";
  ov.classList.add("open");
}

// One delegated handler on the results container: open an image full-screen,
// click-to-play a video, or jump to a related technique.
export function bindResultsClicks() {
  el.results.addEventListener("click", function (e) {
    var zoom = e.target.closest(".zoomable");
    if (zoom) { openLightbox(zoom.getAttribute("src"), zoom.getAttribute("alt")); return; }

    var jump = e.target.closest(".rel-chip");
    if (jump) { jumpToTechnique(jump.getAttribute("data-jump")); return; }

    var btn = e.target.closest(".video-btn");
    if (!btn) return;
    var box = btn.closest(".video[data-yt]");
    if (!box) return;
    openVideo(box.getAttribute("data-yt"));
  });
}

// Full-screen video overlay: fills the viewport and autoplays, and also asks for
// native fullscreen on top (where the browser allows it). Click backdrop / × / Esc to close.
function videoOverlay() {
  var ov = document.getElementById("videobox");
  if (ov) return ov;
  ov = document.createElement("div");
  ov.id = "videobox";
  ov.className = "videobox";
  ov.innerHTML = '<button class="lb-close" aria-label="Close">×</button>' +
    '<div class="vb-frame"><iframe title="Technique demonstration" frameborder="0" ' +
    'allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>';
  document.body.appendChild(ov);
  function close() {
    ov.classList.remove("open");
    ov.querySelector("iframe").src = ""; // stop playback
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
  }
  ov.addEventListener("click", function (e) {
    if (e.target === ov || e.target.closest(".lb-close")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
  return ov;
}
function openVideo(id) {
  var ov = videoOverlay();
  ov.querySelector("iframe").src =
    "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&playsinline=1";
  ov.classList.add("open");
  var req = ov.requestFullscreen || ov.webkitRequestFullscreen || ov.msRequestFullscreen;
  if (req) { try { var r = req.call(ov); if (r && r.catch) r.catch(function () {}); } catch (e) {} }
}
