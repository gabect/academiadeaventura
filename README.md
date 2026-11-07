# Adventure Academy

Educational browser-based 3D RPG prototype designed for Chromebooks and touchscreens. Built with HTML, CSS, JavaScript and Three.js, without sprites or a conventional game engine.

**Play:** https://gabect.github.io/academiadeaventura/

## Controls
- **Keyboard:** WASD or arrow keys to move; E to talk to the guardian.
- **Touchscreen:** use the circular left joystick to move; tap **Talk** to interact.
- **Run:** tap **Run** to enable faster movement and **Walk** to return to walking; running also applies to keyboard movement.
- **Landscape:** the game requests landscape orientation when supported; browser restrictions can prevent orientation lock.
- **Camera zoom:** tap **+** to inspect the skeleton closely or **−** to see more of the courtyard; use the mouse wheel on desktop or pinch with two fingers on the game canvas.

## Current version: 0.7.2 — November 7, 2026
- Turned **Run** into a distinct, exaggerated short-distance sprint instead of a faster walk.
- Sprint-only scissor-leg gait: hips swing in opposite directions; the forward knee rises, while the trailing leg reaches backward and extends before recovering.
- Strong alternating arm drive with visibly bent elbows, increased forward torso lean, and subtle vertical movement.
- Increased movement speed while sprinting from **6.2 to 8.0 world units/second**; walking stays at **4.8**.
- Tuned sprint animation cadence to match faster travel without excessively quick leg cycling.
- Kept the straight idle posture, walking gait, collision handling, isometric camera, touch joystick, zoom, guardian and educational mission.
- **Validation:** JavaScript syntax checked; actual foot contact, sprint motion, and Chromebook performance still need visual/device testing.

## Version history
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
2. Increment the semantic version (patch 0.7.3, feature 0.8.0, breaking 1.0.0).
3. Update `BUILD` and the `buildLabel` element in `index.html`.
4. Update this README with the release date and change summary.
5. Update `version.json` **last**, after committing the HTML, to let browsers detect the new build.
6. Verify the experience in an actual touchscreen browser and Chromebook. GitHub commits do not guarantee GitHub Pages has deployed immediately.

## Technical notes
The game checks `version.json` every 30 seconds and reloads when no quest or input is active. Reloading does not persist a quest in progress. Landscape orientation locking depends on the browser. Collision footprints approximate solid objects; foliage and overhead scenery remain non-collidable.

Do not place personal student information in this public repository.
