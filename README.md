# Adventure Academy

Educational browser-based 3D RPG prototype designed for Chromebooks and touchscreens. Built with HTML, CSS, JavaScript and Three.js, without sprites or a conventional game engine.

**Play:** https://gabect.github.io/academiadeaventura/

## Controls
- **Keyboard:** WASD or arrow keys to move; E to talk to the guardian.
- **Touchscreen:** use the circular left joystick to move; tap **Talk** to interact.
- **Run:** tap **Run** to enable faster movement and **Walk** to return to walking; running also applies to keyboard movement.
- **Landscape:** the game requests landscape orientation when supported; browser restrictions can prevent orientation lock.
- **Camera zoom:** tap **+** to inspect the skeleton closely or **−** to see more of the courtyard; use the mouse wheel on desktop or pinch with two fingers on the game canvas.

## Current version: 0.8.0 — November 7, 2026
- Reworked movement into a lightweight **ground-contact locomotion controller** with acceleration, deceleration, horizontal momentum, collision response, and reduced mid-air steering.
- **Foot planting:** each foot has a fixed world-space contact position during its stance interval. The body travels over that foot instead of continually moving both feet along with the player.
- **Swing and landing:** the opposite foot lifts, moves toward the predicted landing area, then plants. Stance and swing timings differ for walking and sprinting.
- **Inverse kinematics:** hips, knees, and ankles follow the grounded foot targets while retaining the thin anatomical skeleton.
- **Support geometry:** adjusted pelvis height and landing distance so typical walking/sprint support targets fit within the avatar's leg length; the first step begins halfway through support to avoid unnatural leg overextension.
- **Sprint flight:** momentum continues during the airborne interval following push-off, rather than requiring foot contact every frame. Input-driven acceleration is supplied only while at least one foot supports the body.
- **Cadence:** footsteps advance based on actual travel distance, not a timer, and collision-blocked movement no longer cycles legs in place.
- **Speed rebalanced for anatomically feasible strides:** brisk walk **3.2 units/s**, sprint **6.0 units/s**, with ramp-up and braking instead of instant changes. Previous values (4.8 / 8.0) exceeded practical planted-foot reach for this skeleton.
- Preserved the English interface, touchscreen joystick, Run / Talk controls, zoom, camera angle, guardian, questions, scenery and obstacle collision rules.
- **Limitations:** This is procedural / kinematic locomotion with simplified ground forces, not a full rigid-body, inverse-dynamics, terrain-aware or motion-capture simulation. Foot contact and turning behavior require live-device visual testing.

## Version history
- **0.8.0 (2026-11-07):** world-anchored foot plants, contact-aware acceleration and inertia, inverse-kinematics stepping, feasible stride lengths.
- **0.7.2 (2026-11-07):** stronger scissor-stride sprint, alternating bent-arm drive, faster run speed and sprint cadence.
- **0.7.1 (2026-11-07):** straight standing posture, longer run stride and distinct walk/run animation.
- **0.7.0 (2026-11-07):** camera zoom buttons, wheel zoom and touchscreen pinch-to-zoom for skeleton inspection.
- **0.6.0 (2026-11-07):** temporary shared stick-skeleton visualization for player/guardian, visible hands and foot joints, debug-friendly gait.
- **0.5.0 (2026-11-07):** articulated humanoid rigs and two-bone IK gait, feet and elbows, collision-aware animation.
- **0.4.0 (2026-11-07):** English localization and collision handling.
- **0.3.0 (2026-11-07):** faster walking, toggle-to-run touch button, animated limbs and version documentation.
- **0.2 (2026-11-07):** 3D courtyard, isometric camera, guardian, educational trial, and XP.
- **2026-11-07-joystick-1:** analog joystick, hidden instruction overlay, and periodic version checking.

## Release process
1. Change only the components approved for the release.
2. Increment the semantic version (patch 0.8.1, feature 0.9.0, breaking 1.0.0).
3. Update `BUILD` and the `buildLabel` element in `index.html`.
4. Update this README with the release date and change summary.
5. Update `version.json` **last**, after committing the HTML, to let browsers detect the new build.
6. Verify the experience in an actual touchscreen browser and Chromebook. GitHub commits do not guarantee GitHub Pages has deployed immediately.

## Technical notes
The game checks `version.json` every 30 seconds and reloads when no quest or input is active. Reloading does not persist a quest in progress. Landscape orientation locking depends on the browser. Collision footprints approximate solid objects; foliage and overhead scenery remain non-collidable.

Do not place personal student information in this public repository.
