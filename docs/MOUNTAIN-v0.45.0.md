# Mountain environment v0.45.0 — implementation, visual acceptance pending

Baseline: v0.44.2, commit 9161b9cf60cd8586da2d9362dd22c846c526e395.
Recovery branch: backup/pre-mountain-overhaul-v0.44.2.

## Implementation

The old ECO vegetation and optional HD billboard trial are replaced by
src/mountain-environment.mjs. Small illustrated PNG assets remain in the repository
for recovery, but the new scene does not load them. No external art URLs are used.

Vegetation roots are barycentric samples of final terrain triangles, including
visual erosion displacement. Sampling uses actual triangle area, so steep faces
receive comparable density. A deterministic, authored rock/understory composition
occupies the starting-facing cliff. Other mountain faces receive lighter detail.
Routes and water are excluded; collision and route functions are unchanged.

Individual tapered, bent grass blades use opaque instanced geometry and root-to-tip
vertex shading. Spatial batches have distance-based population reduction and
conservative frustum tests adjusted for the rolling horizon. Low/medium/high quality
is persistent; coarse-pointer devices default to low. No alpha overdraw or texture
loading is needed for the replacement vegetation. Ferns have pinnate geometric
leaflets; broadleaf rosettes have curved leaves. Rock meshes have irregular silhouettes
and integrated moss vertex colors. Roots have taper, surface-following cross sections,
bark ridges, and branches. Major roots and bedrock cast shadows using the existing
curved depth-material pass; individual blades do not cast shadows.

Terrain shading retains the original material framework with improved three-axis
rock projection, normalized projection weights, periodic ground-cover detail, and
moss tint on steep exposed stone. Physics and underlying collision are unchanged.

## Verification completed

- JavaScript syntax checks and git diff whitespace check.
- Actual full scene construction using Three.js r170 math/geometry, with a mocked
  renderer and minimal DOM. This is NOT a WebGL test.
- Finite mesh vertices/instance transforms; independent downward raycasts verify
  119 grass roots against the actual ground mesh.
- Increasing quality levels increase drawn blade populations.
- Exact source comparison of 11 core terrain/collision/movement/camera/climbing/water
  functions with the v0.44.2 baseline.
- Observed generated content: 48,846 blades, 23 rock outcrops, 56 ferns, 10 roots,
  55 environment batches. Generation in the CPU test was approximately 4.1–4.8 seconds
  after optimization (initial pass 7.6 seconds). These are host measurements, not
  a mobile-device benchmark. Full scene contains additional pre-existing geometry.

Run CPU checks with a local official Three.js r170 module:

    THREE_MODULE=/absolute/path/three.module.mjs node tests/environment-smoke.mjs

## Required verification still blocked

The available browser could not render even unmodified v0.44.2. Its console reports
GL_VENDOR=Disabled, GL_RENDERER=Disabled and Error creating WebGL context. The
connected local-browser extension was unavailable. Reload confirmed the same error.

Consequently there are no valid rendered before/after screenshots, no GPU FPS
measurements, no shader compilation validation, no gameplay interaction validation,
and no mobile viewport visual acceptance. This release must not be represented as
meeting the reference or being production-ready. It is a deployed implementation
requiring visual review and likely artistic refinement.

Open the game with ?metrics=1 for measured median FPS, p95 frame interval, draw calls
and triangles. Measurements include frame scheduling and are not pure GPU timings.
Inspect spawn, close, medium, elevated, and mobile views, with both horizon modes.
Use the vegetation selector to compare low/medium/high. Measure startup and warm
frame times on actual devices. Existing trees and older structural ledges outside
the replacement system still have a simpler art style. Ground mesh relief and the
continuous terrain texture still limit resemblance to the much richer reference.

Rollback: restore index.html and version.json from the recovery branch and publish
through normal GitHub Pages deployment; the new module can remain unused.

## v0.45.1 refinement

Moved quality/metrics controls clear of short-screen action buttons and below
modal overlays; keyboard input in the selector no longer reaches movement/camera
handlers. Versioned the module import for publication cache invalidation.
