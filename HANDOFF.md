# Handoff — Guqin Finger-Technique Reference

Paste the **"Prompt for the next session"** block below into a fresh Claude Code
session (after you've allowlisted `peiyouqin.com`). Everything above it is context.

## What this project is
A zero-dependency static reference site for guqin (古琴) finger techniques written in
jianzipu (减字谱). Lives in repo `decobots/-`, deployed via GitHub Pages at
**https://decobots.github.io/-/**. Default branch `main`. Dev branch used so far:
`claude/guqin-technique-library-3hykuu` (all work merged to `main` via PRs #1–#5).

## Current state (all merged to main)
- **143 techniques** in `data/techniques.json`. **IDs, grouping and order now follow the
  Wu Family Qin Repertoire (虞山吳氏琴譜) index**: `id` is the book number (string, e.g. "55");
  the 6 techniques not in that book keep their old letter-ids and sit in the "Not in this
  book" group. Categories: `notation` (弦徽散按泛), `rh` (right-hand №55–114), `lh`
  (left-hand №115–186), `extra`. Techniques are sorted by book number. `book_no` field still
  holds the number; `hand_glyph` is the hand-drawn scan shown on every card that has one.
- (history) earlier the set used A–G sections and B30-style ids; those were replaced.
- Per-entry fields:
  id, name_hanzi, name_pinyin, hand, category, jianzipu_glyph, instruction_text, source_url;
  plus optional `glyph_image` (hand-drawn notation scan), `image` (SVG), `font_input` (composer
  glyph), `photo` (demo hand-photo), `media[]` (any number of embeds), `related[]` (cross-links),
  `video_*` (legacy, mirrored into media[]), poetic_image/verse, notes, direction.
- **App is modular zero-build ES modules.** `index.html` loads `js/app.js` as
  `<script type="module">`; `js/app.js` is the entry/boot, everything else lives in
  `js/modules/`: `store.js` (state + loaded data + DOM handles + fetch), `util.js`,
  `symbol.js` (glyph priority), `card.js` (card markup: instruction, photo, media, related,
  poetic), `render.js` (filter + render + click-to-play + jump-to-related), `nav.js`,
  `symbolindex.js`, `composer.js`, `resources.js`, `gestures.js`. Still no build step / deps.
- **Self-contained, cross-linked cards.** Each card explains itself; `related[]` renders
  clickable chips (compare / opposite / builds-on / same-motion / slower-form-of …) that scroll
  to and flash the referenced card. `media[]` renders any number of embeds — YouTube
  click-to-play iframes plus inline illustrations (e.g. the 5 yin-vs-nao distinction images on
  吟/猱). The standalone gesture gallery is gone (folded onto cards earlier).
- **Glyph display priority** (`symbol.js`): (1) crisp SVG `image`, (2) hand-drawn notation
  scan `glyph_image` on a parchment tile (peiyouqin — covers ~71/90), (3) Qin font `font_input`,
  (4) reduced char. So nearly every card now shows a hand-drawn glyph.
- **Demo photos + hand-drawn notation glyphs** under `assets/photos/peiyou/` and
  `assets/glyphs/peiyou/` (≈51 photos + ≈78 glyphs, from peiyouqin notation1–4 pages).
  Gesture woodblocks `assets/photos/gestures/hand01–33.jpg` (silkqin). Attribution in
  `assets/photos/README.txt`.
- **Content** synthesized from peiyouqin.com (Pei-You Chang), silkqin.com (John Thompson) and
  Chinese-language qin sources; clarified explanations for the trickier contrasts (吟/猱,
  撞/逗, 進復/退復, 全扶/半扶, 撥剌, 滾拂…). New techniques added incl. 抹挑 勾剔 抹勾 疊蠲 背鎖 短鎖
  如一 雙彈 撥剌 伏 大撮 反撮 打圓 歷 滾拂 撮三聲 掐撮三聲 應合 同聲 放合.
- **Poetic gesture-images** (`data/gestures.json`): full 33-print Taiyin Daquanji set, each
  with the original Chinese 興曰 verse (Li Meiyan transcription) + pinyin + English; 22 map to
  a technique card and render inline.
- **Bundled fonts** (`assets/fonts/`, SIL OFL): `qinfont.woff2` (in-app composer),
  `noto-serif-sc-subset.woff2`. SVG glyph art in `assets/glyphs/` (neuralfirings, MIT).
- Mobile: sidebar hidden < 820px. Cache-bust on assets is `?v=7`.
- `.nojekyll` present for GitHub Pages.

## Conventions
- Bump the `?v=N` query on the css/js `<link>`/`<script>` in `index.html` whenever you change
  css/js, so phones don't serve stale assets.
- Commit messages end with the Co-Authored-By / Claude-Session trailer.
- Work on a dev branch, PR to `main`, merge. Don't push to `main` directly.
- After JS edits, syntax-check the ES modules (`node --input-type=module --check < js/modules/x.js`)
  and run `python3 -m http.server` to smoke-test (modules + fetch need http, not file://).

## The pending task (DONE — kept for history)
The user wanted the **peiyouqin.com demonstration media inlined** to reduce redirects.
Completed: 16 peiyouqin pages embedded YouTube clips (now inline), 5 embedded hand photos
(downloaded), 11 pointed at a shared notation reference (dead link dropped). Also pulled the
full 33-image silkqin gesture set and moved card tags to a top-right column. This was once
blocked because the egress policy denied peiyouqin.com (403); the allowlist is now live.

Reachability check (run first): `curl -sS -A "Mozilla/5.0" -o /dev/null -w "%{http_code}\n"
https://peiyouqin.com/yin.html` — expect **200**, not 403. If still 403, the allowlist
hasn't taken effect (needs a fresh session / env edit; do NOT route around the denial — report it).

---

## Prompt for the next session

> Continue the guqin reference project in repo `decobots/-` (see `HANDOFF.md` at the repo
> root for full context). The egress policy should now allow `peiyouqin.com`.
>
> 1. Verify reachability: `curl -sS -A "Mozilla/5.0" -o /dev/null -w "%{http_code}\n"
>    https://peiyouqin.com/yin.html` returns 200. If it's still 403, stop and tell me the
>    allowlist didn't take effect.
> 2. For every technique in `data/techniques.json` with `video_kind:"page"` (the ~32
>    left-hand entries; their `video_url` is a peiyouqin.com page), fetch the page and
>    extract the embedded demonstration media: the `<video>`/`<source>` src, any
>    `<iframe>` (YouTube/Vimeo) src, and the demonstration `<img>`/poster URL. Also grab the
>    per-technique still image if present.
> 3. Decide per media type: self-hosted `.mp4` → download into `assets/videos/` and embed as
>    inline `<video controls preload="none" poster=...>` (zero redirect); YouTube/Vimeo embed
>    → reuse the existing inline click-to-play iframe pattern (set `video_kind:"youtube"` +
>    `video_id`); demonstration images → download into `assets/photos/` and show on the card.
> 4. Update `data/techniques.json` with the new fields (e.g. `video_file`, `photo`,
>    `video_kind`, `video_id`) and update `js/app.js` `videoHtml()` / `card()` to render them.
>    Keep the glyph-display priority intact.
> 5. Respect licensing only loosely — it's a personal page (user said so), but keep an
>    attribution note in `assets/.../README.txt`.
> 6. Bump the asset cache version (`?v=5`) in `index.html`. Smoke-test with
>    `node --check js/app.js` + a local server. Commit on a new dev branch, open a PR to
>    `main`, and merge it.
>
> Goal restated: minimize redirects — media should play/show INLINE on the page, not link out.
