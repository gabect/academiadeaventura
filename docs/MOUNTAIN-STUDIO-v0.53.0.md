# Mountain Studio v0.53.0 — truly irregular tree branching

## User-directed scope
Preserve the **v0.51.0 lush ground cover**, specifically the broad grassy/fern patches shown in the reference screenshot. Replace the geometric, aligned tree crowns. Avoid any changes to physics, terrain collision, controls, ladders, paths, rock materials, waterfalls or quality settings.

## Implementation
- Restore the exact Studio HD art runtime from v0.51.0 (no proximity-dither grass removal and original full-sized clumps), plus v0.51.0's mountain-foot cluster count.
- Replace identical pine geometry with six seeded shapes with individual branch positions, lengths and asymmetric dense vs. open sides, thin bark stem/branches and needle sprays.
- Replace globe crowns with five tree families carrying trunk and main/secondary woody branches rising UP and extending laterally; irregular leaf groups sit at branch endpoints rather than in a centered sphere.
- Select variants deterministically from tree coordinates for field, summit, mountain and cliff trees; mountain crowns remain GPU-instanced, grouped by variant, with low-angle leans and independent aspect ratios.
- Maintain Studio-only behavior and original Normal shaders/trees without changing any physical collider.

## Test criteria
Real Three.js CPU geometry test confirms 6 distinct pine and 5 distinct wide/broadleaf silhouettes with finite vertices. Playwright/SwiftShader WebGL suite includes a broadleaf-specific visual fixture and original routes/normal scene. Visual similarity to illustrated reference and real mobile performance must still be reviewed on device.
