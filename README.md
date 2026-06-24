# Guqin Finger-Technique Reference · 古琴指法

A categorized, browsable reference of guqin (古琴) finger techniques as written in
**jianzipu (减字谱)** — the "reduced-character" tablature. Each technique entry carries its
full character (the lookup key), pinyin, the reduced glyph used in tablature, a plain-language
instruction, the traditional poetic gesture-image where one exists, and links to source
material.

The library is organized the way the jianzipu font projects categorize their glyphs — by
**function and hand**: finger designations, right-hand strokes, left-hand basics, vibrato
variations, slides/strikes, left-hand plucks, and tone/position markers.

## Quick start

It's a zero-dependency static site — no build step. Because it fetches JSON, open it through a
local web server rather than `file://`:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

It also deploys as-is to GitHub Pages or any static host.

## What's inside

```
index.html                              # app shell
css/styles.css                          # styling + @font-face
js/app.js                               # rendering, nav, search, gallery, composer
data/techniques.json                    # the technique dataset (Sections A–H)
data/gestures.json                      # poetic hand-gesture (手勢圖) gallery data
data/resources.json                     # glyph/font resources, sources, licensing
assets/fonts/qinfont.woff2              # Qin Jianzipu — composes real tablature glyphs (OFL)
assets/fonts/noto-serif-sc-subset.woff2 # subset CJK serif for the reduced forms (OFL)
assets/fonts/OFL.txt                    # SIL Open Font License + copyright notices
```

## Composed jianzipu glyphs (bundled font)

Two OFL fonts are self-hosted in `assets/fonts/`:

- **Qin Jianzipu** (`qinfont.woff2`, from [Adrakaris/guqin-jianzipu-font](https://github.com/Adrakaris/guqin-jianzipu-font), designs by [Yijun Hu](https://yijun.hu)) renders *true composed* tablature glyphs via OpenType ligatures: you type a command string like `\g` (hook 勾), `/da` (thumb 大), `-z7` (hui 7), `\7` (string 7) and the font stacks them into one block. The **"Composed glyphs"** toggle in the header switches technique cards between the composed glyph and the plain reduced character, and the in-app **Jianzipu composer** lets you build any glyph live with a documented token table (extracted directly from the font's ligature tables).
- **Noto Serif SC** (subset to the ~117 CJK characters this reference uses) guarantees the reduced-character forms render identically across platforms.

18 techniques are mapped to a verified composed glyph (the eight basic strokes plus cuo, quanfu/banfu, yin, nao, dou, qiaqi, daiqi, jin, tui); the rest fall back to the reduced character. Mappings were derived by matching each ligature's output glyph name to the technique's pinyin, so they are correct by construction.

## Categories (how techniques are separated)

| Section | Category | Hand | Count |
|---------|----------|------|-------|
| A | Finger & hand designations | left | 5 |
| B | Right-hand basic strokes (八法) | right | 8 |
| B | Right-hand compound strokes | right | 14 |
| C | Left-hand six basics | left | 6 |
| D | Vibrato variations (吟 / 猱) | left | 11 |
| E | Slides, strikes & ornaments | left | 10 |
| F | Left-hand plucking & percussive | left | 11 |
| G | Tone-type & position designations | either | 5 |

**70 techniques** in total — the working vocabulary of modern practice.

## Data model

Each entry in `data/techniques.json` follows the spec's suggested shape:

```jsonc
{
  "id": "C3",                 // stable id, matches the source spec
  "name_hanzi": "綽",         // full character — the lookup key
  "name_pinyin": "chuò",
  "hand": "left",             // left | right | either
  "category": "left-basic",   // joins to categories[]
  "jianzipu_glyph": "卓",     // the reduced form shown in tablature
  "instruction_text": "Slide UP into the note…",
  "direction": "outward",     // right-hand strokes only
  "poetic_image": null,       // Section H gesture-image, where one exists
  "poetic_verse": null,
  "source_url": ["https://peiyouqin.com/chuo.html"],
  "notes": "Reduced from 卓."
}
```

### A note on the reduced glyphs

Guqin tablature uses a *reduced* component, not the full character (e.g. 挑 *tiāo* → `㇂`,
勾 *gōu* → `勹`, 抹 *mǒ* → `木`). Where that reduced form is itself a real Unicode character it is
rendered directly with a CJK serif font. For pixel-accurate composed jianzipu glyphs (multiple
components stacked into one block), see the font projects listed in `data/resources.json`
(Adrakaris/guqin-jianzipu-font, alephpi/jianzipu, neuralfirings/JianZiPu) and the croppable
historical glyph images on silkqin.com.

## Sources & licensing

Instruction text is **paraphrased/summarized** and free to reuse. The original
demonstration videos and images are **not** bundled and must be sourced and cleared separately:

- **Pei-You (Judy) Chang** — peiyouqin.com — written instructions + demonstration videos (© Judy Chang).
- **John Thompson** — silkqin.com — Taiyin Daquanji translations and gesture-image scans.

Link out to these pages or request licensing rather than redistributing their assets. Full
attribution notes and the complete source list live in `data/resources.json` and the in-app
**Resources & sources** section.

The two bundled fonts are under the **SIL Open Font License 1.1** (`assets/fonts/OFL.txt`);
the gesture gallery shows the composed glyph from the bundled font and **links out** to the
silkqin.com woodblock scans rather than copying them.
