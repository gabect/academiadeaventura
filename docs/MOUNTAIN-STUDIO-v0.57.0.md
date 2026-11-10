# Mountain Studio v0.57.0 — branch hierarchy
Implements the user's botanical requirement that trunks divide (sometimes into a Y), primary branches give rise to secondary and tertiary branchlets, and foliage attaches mainly to their terminal tips.

- **Broadleaf:** tapered trunk with two woody leaders; 5–7 spreading primaries; 2–3 secondaries per primary; two tertiary twigs per secondary. Painted leaf sprays generated at twig tips, not arbitrarily around the trunk.
- **Pines:** existing uneven primary branches grow lateral secondary/tertiary needle-bearing twigs with needles at the branch ends. Tiny twig wood is optimized as two tapering sections for mobile GPU.
- Retains seeded 5 broadleaf / 6 pine variants, wood and leaf painterly maps, two material groups, existing normal-mode geometry, waterfall/terrain/controls, and **exact lush ground vegetation**.
- Adds CPU invariants asserting branch orders and Y leader counts. Nine-scene SwiftShader WebGL screenshots remain the publication gate.

Visual art parity and phone FPS remain unverified until device review.