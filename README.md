# Adventure Academy

Educational browser-based 3D RPG prototype designed for Chromebooks and touchscreens. Built with HTML, CSS, JavaScript and Three.js, without sprites or a conventional game engine.

**Play:** https://gabect.github.io/academiadeaventura/

## Controls
- **Keyboard:** WASD or arrow keys to move; E to talk to the guardian.
- **Touchscreen:** use the circular left joystick to move; tap **Talk** to interact.
- **Run:** tap **Run** to enable faster movement and **Walk** to return to walking; running also applies to keyboard movement.
- **Landscape:** the game requests landscape orientation when supported; browser restrictions can prevent orientation lock.

## Current version: 0.4.0 — November 7, 2026
- Translated the visible interface, controls, instructions, guardian dialog and educational questions into English.
- Added lightweight, geometry-independent 2D collision footprints for tree trunks, lamp posts, the guardian and courtyard towers.
- Added boundaries against crossing the courtyard walls.
- Movement resolves X and Z separately, allowing the player to slide along obstacles instead of stopping abruptly.
- Substepped movement prevents passing through small obstacles during running.
- Kept character shapes, colors, animation, camera, joystick, and movement speeds unchanged.

## Version history
- **0.4.0 (2026-11-07):** English localization and collision handling.
- **0.3.0 (2026-11-07):** faster walking, toggle-to-run touch button, animated limbs and version documentation.
- **0.2 (2026-11-07):** 3D courtyard, isometric camera, guardian, educational trial, and XP.
- **2026-11-07-joystick-1:** analog joystick, hidden instruction overlay, and periodic version checking.

## Release process
1. Change only the components approved for the release.
2. Increment the semantic version (patch 0.4.1, feature 0.5.0, breaking 1.0.0).
3. Update `BUILD` and the `buildLabel` element in `index.html`.
4. Update this README with the release date and change summary.
5. Update `version.json` **last**, after committing the HTML, to let browsers detect the new build.
6. Verify the experience in an actual touchscreen browser and Chromebook. GitHub commits do not guarantee GitHub Pages has deployed immediately.

## Technical notes
The game checks `version.json` every 30 seconds and reloads when no quest or input is active. Reloading does not persist a quest in progress. Landscape orientation locking depends on the browser. Collision footprints approximate solid objects; foliage and overhead scenery remain non-collidable.

Do not place personal student information in this public repository.
