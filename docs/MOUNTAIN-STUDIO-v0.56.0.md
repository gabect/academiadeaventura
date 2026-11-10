# Mountain Studio v0.56.0 — no more detached trunks

Source: user's real mobile screenshots of v0.55.0 at the western summit and lowland.
Problem: tall pale cut-off trunk cylinders; crowns apparently sitting on top; upward barren stem spikes in pines; irregular leaf groups disconnected from supporting wood.

## Studio-specific architecture repair
- Each Studio pine and broadleaf tree now contains **a full painted bark trunk inside the same BufferGeometry as branches and leaves**. The trunk begins locally at y=-2.40 and extends through the branch forks.
- The previously independent cylinder trunks are **disabled in Studio** for field, mountain and cliff pines. They remain intact in Normal mode. No geometry for locomotion/collisions is touched.
- Actual continuous trunk tapers into main branches; the pine's central woody leader stops before the needle-bearing tip, avoiding a bare spike above the crown.
- New small leaf/needle clusters cover lower fork junctions and are anchored to wood nodes, without filling in the entire silhouette as a geometric blob.
- Broadleaf crown origins are lowered slightly so the integrated stems reliably touch the terrain in all existing size variants.
- The v0.51-style lush Studio ground vegetation, waterfall, terrain, path, camera, controls and Normal mode remain unchanged.

## Validation
Existing nine-view browser WebGL smoke test plus real Three.js geometry root-height, valid UV, leaf/bark material groups and CPU source regression tests. The team must still review real phone screenshots for art quality and measure mobile frame rate independently.
