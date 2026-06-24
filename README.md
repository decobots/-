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
index.html            # app shell
css/styles.css        # styling
js/app.js             # rendering, category nav, search/filter
data/techniques.json  # the technique dataset (Sections A–H of the spec)
data/resources.json   # poetic gestures, glyph/font resources, sources, licensing
```

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
