# Mountain Studio v0.47.1 — screenshot feedback iteration

## Source evidence
The screenshot submitted November 9, 2026 shows low-poly triangular ground grass, low vegetation quality and a flat-looking green cliff. The label `Valle · v0.46.0` was found hardcoded in the **already updated** v0.47.0 index; this label alone did not prove stale caching.

## Changes
- Version and studio status now follow BUILD, instead of a hard-coded stale label. A visible toggle switches preview mode using the query parameter `mountain=studio`.
- The Studio variant increases rock coverage and scales its triplanar rock fracturing from ~13 meter tiles to ~5 meter tiles; same physical mesh, collision and climbing rules.
- The old giant angular tall-grass geometry on the near meadow is replaced by crossed-card local sprite PNG `grass_tuft_dense.png` only after alpha is inspected on load. If no transparency is present, canvas is blocked, or the image fails to load, preserve old geometry rather than rendering opaque rectangular cards.
- Studio vegetation starts at Medium on mobile (quality remains user-controlled, saved separately from normal mode). No changes to Normal mode quality or old styling.

## Acceptance not yet complete
This release addresses identified screenshot issues, not final concept-art equivalence. Check screenshots in real Chrome/WebGL with both Studio and Normal at mobile dimensions. Monitor FPS and texturing/alpha artifacts on actual hardware. Do not claim visual similarity until images are reviewed.

## URLs
Normal: https://gabect.github.io/academiadeaventura/
Studio: https://gabect.github.io/academiadeaventura/?mountain=studio
