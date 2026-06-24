# Handoff — Guqin Finger-Technique Reference

Paste the **"Prompt for the next session"** block below into a fresh Claude Code
session (after you've allowlisted `peiyouqin.com`). Everything above it is context.

## What this project is
A zero-dependency static reference site for guqin (古琴) finger techniques written in
jianzipu (减字谱). Lives in repo `decobots/-`, deployed via GitHub Pages at
**https://decobots.github.io/-/**. Default branch `main`. Dev branch used so far:
`claude/guqin-technique-library-3hykuu` (all work merged to `main` via PRs #1–#5).

## Current state (all merged to main)
- **70 techniques** in `data/techniques.json`, 8 categories (Sections A–G), full Section K
  data model (id, name_hanzi, name_pinyin, hand, category, jianzipu_glyph, instruction_text,
  poetic_image/verse, source_url, notes). Some entries also have: `font_input` (composer
  glyph), `image` (local SVG), `video_url`/`video_kind`/`video_id`/`video_shared`.
- **App**: `index.html` + `css/styles.css` + `js/app.js` (vanilla JS, no build). Loads
  `data/techniques.json`, `data/resources.json`, `data/gestures.json` via fetch().
- **Quick symbol index** at top: symbol-only chips, tap → scroll+highlight the card.
- **Glyph display priority** (`symbolHtml()` in app.js): (1) local SVG `t.image`
  on a parchment tile, (2) bundled Qin Jianzipu font via `t.font_input`, (3) reduced char.
- **Bundled fonts** (`assets/fonts/`, SIL OFL, `OFL.txt`): `qinfont.woff2` (composes real
  tablature glyphs via ligatures — see in-app "Jianzipu composer"), `noto-serif-sc-subset.woff2`.
- **Glyph art** (`assets/glyphs/`, 18 SVGs, MIT, from neuralfirings/JianZiPu).
- **Videos**: 22 right-hand techniques play **inline** via youtube-nocookie iframe
  (click-to-play, no redirect). 32 left-hand techniques currently link OUT to their
  peiyouqin.com page (`video_kind:"page"`). Data came from a user-uploaded
  `guqingesturelibrary.json`.
- Mobile: sidebar hidden < 820px (it was a huge stack). Cache-bust on assets is `?v=4`.
- `.nojekyll` present for GitHub Pages.

## Conventions
- Bump the `?v=N` query on the css/js `<link>`/`<script>` in `index.html` whenever you change
  css/js, so phones don't serve stale assets.
- Commit messages end with the Co-Authored-By / Claude-Session trailer.
- Work on a dev branch, PR to `main`, merge. Don't push to `main` directly.
- After CSS/JS edits, run `node --check js/app.js` and `python3 -m http.server` to smoke-test.

## The pending task (why this handoff exists)
The user wants the **peiyouqin.com demonstration media inlined** into the page to reduce
redirects (the 32 left-hand techniques currently link out). This was blocked because the
build environment's **egress policy denied peiyouqin.com (403)**. The user is allowlisting
`peiyouqin.com`. Once that's live, do the extraction.

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
