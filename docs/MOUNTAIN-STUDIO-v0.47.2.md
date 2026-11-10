# Mountain Studio v0.47.2 — remove black-card trial sprite

## User screenshot
On actual mobile screenshot of v0.47.1, the scene contained many repeated light-colored tufts and black horizontal strokes. The label was correctly updated. The specific small `grass_tuft_dense.png` was added in v0.47.1 with a weak alpha test that only counted transparent pixels: it did not prove RGB integrity. This deployment removes **that asset from foreground runtime**, not just its visual artifacts.

## Changes
- Share the existing high-resolution studio mountain foliage material with the foreground meadow; no duplicated 2048px atlas texture is loaded.
- Two crossed cards per foreground clump use top-left atlas UVs and are only shown when atlas state is `ready`. On failed texture load, old meadow geometry remains visible at reduced height; the normal mode is untouched. Quality selector reduces the new meadow instance count.
- Studio grass material tint is reduced from pure white; alpha cutoff raised from .39 to .58.
- Studio rock instances use irregular smoothed Icosahedron geometry (detail 1) and the local rock surface texture. Studio angular polygonal shrub blobs shrink and become rounded.
- Existing collision physics, terrain mesh, water, trails, camera and normal mode are unchanged.

## Status
Source syntax and CPU invariants checked. Still requires actual rendered visual review, device FPS measurements and comparison with reference art. Older low-poly conifer trees are outside this incremental fix.
