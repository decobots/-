/* The interactive Jianzipu composer (bundled Qin font, OpenType ligatures). */
import { escapeHtml } from "./util.js";
import { el } from "./store.js";

var COMPOSER_PRESETS = [
  { label: "勾 hook", input: "\\g" },
  { label: "抹 mo", input: "\\m" },
  { label: "挑 tiao", input: "\\t" },
  { label: "撮 cuo", input: "||" },
  { label: "吟 yin", input: "\\yin" },
  { label: "猱 nao", input: "\\nao" },
  { label: "Full note: 大 + hook, str 7, hui 7.6", input: "/da\\g\\7-z7-6" }
];
var COMPOSER_TOKENS = [
  ["Right-hand technique", "<code>\\m</code>抹 <code>\\t</code>挑 <code>\\g</code>勾 <code>\\i</code>剔 <code>\\d</code>打 <code>\\z</code>摘 <code>\\b</code>擘 <code>\\u</code>托 <code>||</code>撮"],
  ["Left-hand technique", "<code>\\yin</code>吟 <code>\\nao</code>猱 <code>\\dou</code>逗 <code>\\dai</code>帶 <code>\\jin</code>進 <code>\\tui</code>退 <code>\\fu</code>扶 <code>\\qia</code>掐"],
  ["Left finger (presses)", "<code>/da</code>大 <code>/sh</code>食 <code>/zh</code>中 <code>/mi</code>名"],
  ["String number", "<code>\\1</code> … <code>\\7</code>"],
  ["Hui position", "<code>-z1</code> … <code>-z13</code>"],
  ["Hui tenths (fraction)", "<code>-1</code> … <code>-9</code>"]
];

function renderComposerPreview(value) {
  var node = document.getElementById("composerPreview");
  if (node) node.textContent = value || "\\g";
}

export function buildComposer() {
  var html = "<h2>Jianzipu Composer</h2>";
  html += '<div class="res-panel">';
  html += "<p>The bundled <strong>Qin Jianzipu</strong> font (SIL OFL) composes a true stacked tablature glyph from a command string via OpenType ligatures. " +
    "Type a sequence below — the base technique first, then finger / string / hui modifiers in any order, no spaces. " +
    "(Requires a browser with ligatures enabled, which all modern browsers do by default.)</p>";
  html += '<div class="composer">';
  html += '  <div class="composer-preview"><span id="composerPreview" class="jzp">\\g</span></div>';
  html += '  <div class="composer-controls">';
  html += '    <input id="composerInput" type="text" value="/da\\g\\7-z7-6" spellcheck="false" autocomplete="off" aria-label="Jianzipu command string" />';
  html += '    <div class="preset-row">';
  COMPOSER_PRESETS.forEach(function (p) {
    html += '<button class="preset" data-input="' + escapeHtml(p.input) + '">' + escapeHtml(p.label) + "</button>";
  });
  html += "    </div>";
  html += '    <table class="token-table"><tbody>';
  COMPOSER_TOKENS.forEach(function (row) {
    html += "<tr><th>" + escapeHtml(row[0]) + "</th><td>" + row[1] + "</td></tr>";
  });
  html += "    </tbody></table>";
  html += '    <p class="license-note">Token map extracted directly from qinfont 3.0.1 ligature tables. Syntax &amp; font: ' +
    '<a href="https://github.com/Adrakaris/guqin-jianzipu-font" target="_blank" rel="noopener">Adrakaris/guqin-jianzipu-font</a> ' +
    '(designs by <a href="https://yijun.hu/blog-misc/guqin/" target="_blank" rel="noopener">Yijun Hu</a>).</p>';
  html += "  </div></div></div>";
  el.composer.innerHTML = html;

  var input = document.getElementById("composerInput");
  renderComposerPreview(input.value);
  input.addEventListener("input", function () { renderComposerPreview(input.value); });
  el.composer.addEventListener("click", function (e) {
    var btn = e.target.closest(".preset");
    if (!btn) return;
    input.value = btn.getAttribute("data-input");
    renderComposerPreview(input.value);
    input.focus();
  });
}
