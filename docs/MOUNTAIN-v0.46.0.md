# Mountain foliage v0.46.0

Adds 469 alpha-tested foliage instances using a new local four-plant atlas:
meadow grass, fern, broadleaf rosette, and hanging crest grass. Two crossed
cards per plant retain volume as the camera rotates. Spatial batches use
the existing distance, frustum, and quality limits. Subtle vertex wind keeps
roots stationary and composes with the rolling-horizon shader.

Plants use rendered terrain anchors. Grass cards avoid steep faces, water,
and routes. Fern/leaf islands replace their geometric counterparts only after
the atlas loads. Loading errors preserve the geometric fallback. Existing
fine blades, mossy stones, and roots remain. Stones now use the existing
rock surface texture for color and bump detail.

The generated atlas has a faint semitransparent matte. A .78 alpha cutoff
rejects that matte instead of displaying translucent rectangular backgrounds.
Its high cutoff may reduce fine leaf coverage at distance; visual review on
a WebGL-capable device is still required. No extra engine/library is needed.

## Checks

Run `THREE_MODULE=/path/to/three.module.mjs node tests/environment-smoke.mjs`
with official Three.js r170. Tests cover full CPU scene construction, finite
vertices/transforms, terrain contacts, quality scaling, atlas path, UV bounds,
load/failure visibility, and composition of wind and horizon shader sources.
Shader source checks are not GPU compilation tests.

The cloud browser reports WebGL unavailable, and the connected local browser
is unavailable in this session. No rendered screenshots, gameplay acceptance,
mobile performance results, or reference-quality equivalence are claimed.

## Asset provenance

`assets/mountain_hd/foliage-atlas-v2.png` was generated for this project with
the built-in image tool. Brief: four isolated plants in a transparent 2x2 grid,
grass/fern/broadleaf/hanging grass, detailed hand-painted 3D adventure style,
neutral lighting, green palette, no text, ground, pots, or background.
The original PNG alpha is preserved; no external image host is required.

Rollback: restore index.html, version.json, src/mountain-environment.mjs,
and tests/environment-smoke.mjs from commit 518fdcc.
