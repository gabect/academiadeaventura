# Mountain Studio v0.47.0 – experimental, opt-in

Open `?mountain=studio` on GitHub Pages to evaluate the first material study. The normal URL remains the previous visual treatment. This is **not** a claim of matching the concept art.

## Changes
- New periodic 384px colored Voronoi-fracture stone and grass surfaces, 256px on coarse pointer devices, generated as DataTextures. World-space triplanar projection applies them to the existing continuous collision terrain, with no overlay wall or fake collider.
- Existing local foliage atlas is restored at fuller leaf coverage in studio mode. Its low-alpha matte is remapped using a single Canvas pass. If canvas access fails, the original atlas still renders. Grass scale increases modestly.
- Reuses the existing production ecology, roots, stones, quality selection and distance/frustum population budgets.
- No external assets, libraries, changes to traversal, camera or water; reversible by omitting `mountain=studio`.
- A later step must replace procedural trial tiles with authentic individually authored seamless illustrated source maps and properly extracted transparent plant sprites. The three infographic references are **not** game-ready individual files.

## Acceptance pending
Run on a real GPU and inspect spawn, steep stone close-up, grass edges, route, climbing, low/mobile quality and shader compilation. CPU source checks are not a substitute for those screenshots. Record mobile FPS with `?mountain=studio&metrics=1`. Keep experimental until visually accepted.
