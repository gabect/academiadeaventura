# Studio organic landscape pass v0.48.0
Photographic feedback baseline: v0.47.2 mobile screenshot, November 9, 2026.

## Implemented changes (Studio only)
- Removed tiny/brown atlas cross-card meadow (wrong appearance) and replaced ground tufts with deterministic instanced bent-leaf rosettes. Same existing terrain-rooted sites, smaller population, 100% local vertex-colored geometry and no image transparency artifacts.
- Replace two rigid cone layers of pines with a multi-layer, serrated-branch crown; broadleaf canopies now use overlapping uneven lobes. Dwarf ledge pines share the organic crown.
- Reduce and scale oversized foreground rocks and round the geometry, no collider edits.
- Stop instancing tall cliff blades on near-vertical normals, reduce random stone islands, embed wall stones more deeply.
- Studio stone base fraction increased on steep faces; world-space triplanar rock shader now uses rock color directly instead of multiplying its color through green vertex tint.
- Add `ci-smoke=1` mode to stop animation after three frames to let Chromium SwiftShader screenshots complete. This affects only explicitly requested CI test URLs.

Normal mode and collision/movement/trails/water remain unmodified; this is an incremental visual study, not final HD concept-quality art. GPU acceptance awaits screenshot inspection.
