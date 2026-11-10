# Mountain Studio v0.54.0 — painterly foliage and bark

## User-directed visual brief
Richer semi-illustrated leaves, pine needles, organic branches, and detailed bark rather than photorealistic PBR. Preserve the dense v0.51-style Studio HD ground layer (same runtime and planted site counts). Keep normal mode and physical collision unchanged.

## Implementation
- CanvasTexture-based **painted colour maps**: 256×512 bark (curved fissures, warm highlights, grooves), 256×256 needle pigment, and 256×256 broadleaf pigment (mottled pigment/leaf veins), generated once per load. No external CDN or runtime API.
- UVs are authored for every leaf and branch mesh. Pine blades and broadleaf leaves now have raised midribs, curved outline, and shaded multi-tone vertices rather than three flat, single-colour triangles.
- Two explicit material groups per tree: leaf paint and bark paint. Wood is no longer incorrectly tinted green by the canopy material.
- Field tree trunks and cliffside dwarf pine trunks receive the bark material; every conifer and broadleaf uses the appropriate foliage pigment. The existing six irregular pine and five broadleaf silhouettes are retained.
- GPU-instanced mountain crowns and deterministic per-site variants remain. Normal mode uses the original primitives without the new painting materials.
- Real browser WebGL smoke checks all nine scenes; CPU geometry checks UV finiteness and material groups.

## Known limitations
These are deterministic, canvas-painted microtextures, not hand-painted commissioned PBR assets. Actual mobile-device FPS and visual acceptance remain separate from the headless browser tests. Further improvements may include artist-authored canopy atlases and richer trunk meshes.
