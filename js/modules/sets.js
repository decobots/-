/* Technique "sets" — a song's sequence of book numbers (e.g. 55,57,94,122).
 * Applying a set filters to those techniques and shows them in that order.
 * Sets are saved by name in localStorage. */
import { state, el } from "./store.js";
import { render } from "./render.js";

var KEY = "techSets";
function getSets() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
function putSets(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function parseNums(str) { return (String(str).match(/\d+/g) || []).map(Number); }
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildSets() {
  var host = document.getElementById("setsPanel");
  if (!host) return;

  function draw() {
    var sets = getSets();
    var h = '<div class="sets-head">Technique sets <span>— a song’s characters</span></div>';
    h += '<input id="setNums" class="sets-input" type="text" inputmode="numeric" placeholder="e.g. 55, 57, 94, 122" />';
    h += '<input id="setName" class="sets-input" type="text" placeholder="Set name (optional)" />';
    h += '<div class="sets-btns"><button id="setApply" class="sets-btn">Apply</button>' +
         '<button id="setSave" class="sets-btn primary">Save</button></div>';
    if (state.set) {
      h += '<button id="setReset" class="sets-btn reset">↺ Reset · showing “' + esc(state.set.name || "set") + "”</button>";
    }
    if (sets.length) {
      h += '<div class="sets-saved">';
      sets.forEach(function (s, i) {
        var on = state.set && state.set.name === s.name;
        h += '<span class="set-chip' + (on ? " is-on" : "") + '">' +
          '<button class="set-apply" data-i="' + i + '" title="' + esc(s.nums.join(", ")) + '">' +
          esc(s.name) + " <small>(" + s.nums.length + ")</small></button>" +
          '<button class="set-del" data-del="' + i + '" title="Delete set" aria-label="Delete set">×</button></span>';
      });
      h += "</div>";
    }
    host.innerHTML = h;
  }

  function apply(nums, name) {
    if (!nums.length) return;
    state.set = { name: name || "Custom set", nums: nums };
    state.cat = "all"; state.query = "";
    if (el.search) el.search.value = "";
    render(); draw();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  host.addEventListener("click", function (e) {
    if (e.target.closest("#setApply")) {
      apply(parseNums(document.getElementById("setNums").value),
            document.getElementById("setName").value.trim());
      return;
    }
    if (e.target.closest("#setSave")) {
      var nums = parseNums(document.getElementById("setNums").value);
      if (!nums.length) return;
      var name = document.getElementById("setName").value.trim() || ("Set " + (getSets().length + 1));
      var sets = getSets();
      var idx = sets.findIndex(function (x) { return x.name === name; });
      if (idx >= 0) sets[idx] = { name: name, nums: nums }; else sets.push({ name: name, nums: nums });
      putSets(sets); apply(nums, name);
      return;
    }
    if (e.target.closest("#setReset")) { state.set = null; render(); draw(); return; }
    var del = e.target.closest("[data-del]");
    if (del) {
      var sets2 = getSets(); var d = +del.getAttribute("data-del"); var was = sets2[d];
      sets2.splice(d, 1); putSets(sets2);
      if (state.set && was && state.set.name === was.name) { state.set = null; render(); }
      draw(); return;
    }
    var sa = e.target.closest(".set-apply");
    if (sa) { var s = getSets()[+sa.getAttribute("data-i")]; if (s) apply(s.nums, s.name); return; }
  });

  // keep the panel's Reset/active state in sync when the set is cleared elsewhere
  document.addEventListener("setschange", draw);
  draw();
}
