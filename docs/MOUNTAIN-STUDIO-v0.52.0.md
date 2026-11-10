# Mountain Studio v0.52.0 — six screenshot-directed art and visibility fixes

Observed v0.51.0 screenshots from a real desktop browser: grass clumps comparable in height to the player, impenetrable dense foliage, a cartoon-like faceted broadleaf cloud, low-poly repetitive route-edge blocks, floating shrubs and occlusion across the third-person camera.

## Studio-only changes
- Cut the scale of painted ground tuft assets and reduce field density, while preserving meadow, wall and crest ecosystems and the existing low/medium/high quality control.
- World-space shader dither culls ground plant fragments near the player and behind the chase camera. Uses instanced matrices and shared positions; no individual updates of thousands of instances. Never modify the original player collision or motion systems.
- Replace giant polygon-sphere broadleaf canopy with independently tapered leaf clusters, using vertex colors and two-sided instanced leaf geometry.
- Replace the long rank of uniform grey flat flagstones along the 30-degree path with fewer, tiny, partially embedded rounded pebbles. The dirt trail, collisions and marked path remain unchanged.
- Existing stone cliffs, roots, water, route markers, ladders, and Normal mode unchanged.
- Add automated summit and route30 view screenshots and revised threshold assertions, testing the actual imagery/problem locations on Chromium/SwiftShader.

## Limits
These illustrative assets are prototype cutouts derived from a concept image; they do not yet reach the painted reference concept in overall model art direction, tree trunk detail or cliff geology. SwiftShader tests are smoke tests, not phone FPS measurements.
