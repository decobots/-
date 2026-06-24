Fonts bundled in this directory
================================

Both fonts are licensed under the SIL Open Font License, Version 1.1 (see OFL.txt).

1. qinfont.woff2  —  "Noto Qin Jianzipu"
   Renders true composed jianzipu (减字谱) tablature glyphs via OpenType
   ligatures. See js/app.js / the in-app "Jianzipu composer" for the input
   syntax (e.g. \g = hook 勾, /da = thumb 大, -z7 = hui 7, \7 = string 7).
   Jianzipu designs by Yijun Hu (https://yijun.hu).
   Based on Noto Sans SC. © Yijun Hu; © 2014–2020 Adobe; Noto is a trademark
   of Google Inc.
   Upstream: https://github.com/Adrakaris/guqin-jianzipu-font (release 3.0.1)
   Converted from the upstream OTF to WOFF2 (lossless table repackaging only).

2. noto-serif-sc-subset.woff2  —  "Noto Serif SC" (weight 500), subset
   A character-subset of Noto Serif SC limited to the ~117 CJK characters
   used by this reference, for consistent rendering of the reduced-character
   forms across platforms.
   © The Noto Project Authors (https://github.com/notofonts/noto-cjk).
   Subset produced via the Google Fonts css2 API `text=` parameter.

No font is sold or distributed on its own; both ship only as part of this
reference library, with attribution preserved as required by the OFL.
