# Adventure Academy — Semi-illustrated Forest v0.54.0

## Art direction
Bring the already irregular v0.53 tree silhouettes closer to a painterly / semi-illustrated game aesthetic with detailed bark grain, leaf veins, cool/warm shading and richer color variation. **Keep the user-approved lush v0.51 ground-vegetation density and scale.**

## Applied
- Shared deterministic 256×256 canvas texture tiles, created once for bark, pine needles, and broadleaf lamina.
- New Studio-only MeshStandardMaterial shader samples these textures using *explicit mesh-local paint UVs*, distinguishing bark, pine needles and broadleaf leaves with a per-vertex surface type.
- Bark uses layered longitudinal fissure strokes, cool muted highlights and occasional moss tint; foliage includes a hand-painted midrib, secondary veins and speckled shading.
- Existing procedural tree triangles are folded along a raised midrib with tapered irregular edges. Existing six pine and five spreading broadleaf silhouettes remain distinct; bark branches are textured, not flat-color tubes.
- Main field and distant mountain trunks now share the small bark tile.
- Retain **exactly the same ground-cover runtime, rock terrain art, mountain routes, collisions, camera controls, character and normal-mode visuals**.
- Tests check painted UV/surface attributes, syntax and 9 headless SwiftShader/Chromium scenes, including broadleaf close view.

## Performance / limitations
Textures are ~256px each, built once and reused across instanced trees. No per-tree downloads. CPU triangle count rises moderately due to folded leaves; requires a real phone performance check. This improves richness, but is not a claim of parity with original illustrated concept art.
