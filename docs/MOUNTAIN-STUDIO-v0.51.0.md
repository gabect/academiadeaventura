# Mountain Studio 0.51.0 – actual mobile screenshot repair

## Reported visual problems
Mobile screenshot v0.50.0: giant flat canopy fronds obscuring camera, suspended dark boulders on cliff, hard-sided beige path, isolated pale green angular shrubs, and flat dark rock.

## Repair in reversible Studio mode
- Replaced thick connected conifer whorls with multiple narrow irregular 3D needle blades per radial branch. Still deliberately stylized; evaluated for finite normals and triangles in official Three.js mesh tests.
- Disabled old standalone rock-island objects and their orbiting microplants in Studio. Retained embedded cliff facets, ledge rocks and rooted foliage. Normal mode unaffected.
- Suppressed pale solid shrubs when illustrated vegetation is active. Increased the near-camera threshold to hide crowns that would block the player.
- Dirt trail uses studio-only wavy alpha feathering with world-space grain; same existing quad geometry and collision/path coordinates.
- World-space moss is weighted toward rock-foot and fissure bands without a second facade mesh.

## Validation requirements
Run source/CPU invariants, real SwiftShader WebGL on desktop/mobile and scenic views, inspect screenshots, and only then merge to GitHub Pages. Visual acceptance and phone FPS are still separate; do not claim equivalence with the illustrated concept.
