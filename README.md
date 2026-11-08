# Adventure Academy

Educational browser-based 3D RPG prototype designed for Chromebooks and touchscreens. Built with HTML, CSS, JavaScript and Three.js, without sprites or a conventional game engine.

**Play:** https://gabect.github.io/academiadeaventura/

## Controls
- **Keyboard:** WASD or arrow keys to move; E to interact; hold Shift to run; Space / B to jump; C to crouch/cancel. **R no longer serves a stand-up action**.
- **Touchscreen:** left analog joystick for movement, and compact lower-right A/B/C controls: **A** = interact/talk; **B** = hold to run or tap to jump; **C** = close a dialog, otherwise toggle crouch. No fall/stand-up mode. B's tap and hold controls are mutually exclusive.
- **A** will be used to grab objects when pick-up mechanics are added, but objects are not yet pickable in this prototype.
- **Landscape:** the game requests landscape orientation when supported; browser restrictions can prevent orientation lock.
- **Camera zoom:** tap **+** to inspect the skeleton closely or **−** to see more of the courtyard; use the mouse wheel on desktop or pinch with two fingers on the game canvas.
- **Stability:** there are **no falls** in normal or QA mode. The avatar makes a brief protective balance/catch-step motion after sustained overextension or hard impacts, then automatically recovers its upright stance. Collision boundaries, planted-feet motion and jumping remain active. The legacy ragdoll source is retained but disabled.
- **Agility (formerly Balance):** spend XP with **+ Agility** at top left. Agility levels 1–4 reduce protective recovery duration, reduce the visual wobble, reduce its frequency, and shorten recovery cooldown. Existing Balance XP/level data is reused without resetting progress. The guardian trial grants 25 XP once and 10 XP per repeat.

## Current version: 0.15.0 — November 8, 2026
- **True multi-surface ground sampling:** ground contact is now taken from the exact top faces of the scene's grass (-0.05), central stone slab (+0.08), and raised stone tiles (+0.125) rather than a universal ground height. Ankles target the sampled surface plus a sole-clearance offset; a smoothed terrain lift adjusts pelvis/root height.
- **Tactical crouch replaces fake sinking:** pressing C transitions into a coordinated low stance with the pelvis lowered through the same grounded inverse-kinematics leg solver. The old post-animation `player.position.y -= .13` and ad-hoc knee angle offsets were removed.
- **Stable foot placement on grass and stone:** crouching while still uses leg IK even when walking blend is zero. Supporting feet preserve their world x/z anchor and continually resample the height below them. Swing feet interpolate between measured ground heights, improving stone-edge and tile transitions.
- **Unarmed tactical movement:** lowered center of mass, bent knees/ankles from ankle IK, a modest forward torso lean, elbows flexed with hands ahead for balance, controlled short steps and lower foot lift. Crouched movement is approximately 47% of normal walk speed; running and jumping remain disabled while crouched.
- **Consistent recovery:** the non-falling balance reflex uses terrain lift instead of resetting the character to the grass elevation. Existing XP/Agility, joystick, A/B/C controls, educational trial, wall/tree collisions, juvenile skeleton and disabled ragdoll remain intact.
- **Validation:** structural checks, JavaScript syntax parsing, and representative leg-reach calculations passed. **Live mobile/Chromebook QA is still required** for exact visible sole contact, transitions over tiles, turning, crouch gait and jumping; the simple IK is not a full rigid-body biomechanics engine.

## Previous version: 0.14.0 — November 8, 2026
- **Falls disabled throughout the playable RPG:** the legacy ragdoll solver is retained as dormant source for possible future use, but has a hard `ENABLE_RAGDOLL=false` guard, no fall-triggering recovery branch and no active physics update.
- **Removed the QA Fall button** even when loading `?debug=1`; the main game and debugging URL behave consistently.
- **Automatic protective recovery for everyone:** a catch-step, arm counterbalance and knee flexion resolve back to a standing/walking pose, without transitioning to a falling state.
- **Agility XP progression:** replaces Balance labels, preserving existing purchased skill levels and XP in browser local storage. Higher levels reduce overreach wobble frequency, recovery animation duration and amplitude, and post-recovery cooldown. The upgrade prices (20, 30, 40 XP) and repeatable guardian challenges are unchanged.
- **Input compatibility:** A still interacts, B still holds to run / taps to jump, C cancels / crouches, Shift runs and Space jumps; stand-up controls are removed.
- **Kept grounded foot placement, leap/gravity, object and courtyard collisions, teen skeleton and ribcage, joystick, zoom, education and XP.**
- **Requires device QA:** exercise straight running, stopping against trees/walls, hopping, couching, dialog A/C, and repeatable Agility upgrades on Android/Chromebook. No full real-time browser QA is asserted by source-code checks.

## Previous version: 0.13.0 — November 8, 2026
- **Real A/B/C control implementation** in the main GitHub Pages project; no image-only UI mockup. The lower-right cluster has smaller touch buttons (roughly 43–72px, even more compact in landscape).
- **A: interact** with NPCs and initiate educational dialogs; future contextual item grabbing remains unimplemented until pick-up objects exist.
- **B: context-sensitive movement.** Hold it to sprint, release to stop sprinting; quick tap on B triggers a simple gravity-based hop. When the avatar is fallen, press B to stand after the normal 1.35-second fall delay. Shift on keyboard also runs; Space/B jumps.
- **C: cancel or crouch.** If a quiz/dialog is open, C or Escape closes it. Otherwise C toggles a short crouch posture with reduced movement speed; pressing again returns upright. The on-screen label updates with context.
- **Safety and touch behavior:** B uses pointer capture to avoid stuck sprint if a finger slides off it. Window blur or visibility loss clears active movement inputs. The old dedicated Run, Talk and Stand Up buttons have been replaced.
- **QA still required:** check click/touch gestures on actual Android/Chromebook, especially short tap B vs held B, A interaction, C cancel, crouch, jump elevation/landing and stand-up after ragdoll. Jump/crouch are lightweight prototype motion, not full rigid-body motor simulation.

## Previous version: 0.12.0 — November 8, 2026
- **Protective balance reflex for every player:** dangerous foot overreach/joint angles and hard sprint impacts first trigger an automatic counterbalance animation (arms extend, knees bend and a catch step attempts to regain footing). The reflex succeeds only when severity is within the current skill threshold; otherwise it transitions to a ragdoll fall. It is an approximated gameplay reflex, not full active-body physics.
- **Optional Motor Control / Balance progression:** the top-left status panel shows available XP and Balance level (1–4). The **+ Balance** button costs **20, 30, then 40 XP** for successive levels; upgrades increase the threshold for successful recovery attempts. No character sex or height selection is required; the basic reflex belongs to everyone.
- **Earnable progression:** the guardian's first three-question trial grants **25 XP**, and completing subsequent rounds grants **10 XP per round**, making all Balance upgrades attainable. XP, quest completion and skill level are stored locally in the browser, not in a server-side account.
- **Softer ragdoll limb settling:** gravity pulls elbows, wrists, hands, knees, ankles and toes downward while maintaining connected bone lengths and simple joint safety constraints. Physics sleeping now requires a low torso/head position and reasonably settled limbs; this reduces frozen raised limbs, but does not guarantee exact real-world biomechanics.
- **Shared anatomy retained:** one juvenile ribcage with three pairs of ribs, sternum, spine and pelvis remains consistent across walking, sprinting, attempted balance recovery and falling. Existing collisions, camera zoom, joystick, education and **Stand Up** remain available.
- **QA still needed:** test reflexes at different levels, each XP upgrade and persistence after a reload, falls next to walls/trees, loose arm/leg resting, and mobile/Chromebook framerate. A syntax check alone cannot establish visual or collision correctness.

## Previous version: 0.11.0 — November 7, 2026
- **Juvenile anatomy (ages 10–15):** introduced a neutral **12–13-year-old** reference profile with a slightly smaller head, narrower shoulders and shorter upper torso, while retaining the existing leg lengths, IK foot planting and run/walk speeds. This is a stylized, not clinical, anatomical proportion target.
- **Shared 3D rib cage:** added three pairs of gently curved low-poly ribs and a sternum in front of the spine; pelvis, split spine, clavicles and neck remain visible as thin bones. The rib cage is an identifiable lightweight skeleton structure rather than a solid chest mesh or clothing.
- **One visual mesh across states:** the actual rib-cage object re-parents from the standing humanoid to the ragdoll on falling, follows a chest-oriented frame estimated from the falling chest, lower spine and shoulders, and returns to the upright rig on **Stand Up**. No ribs appear or disappear during state transitions.
- **Fall collision clearance:** the chest receives a slightly larger invisible collision radius so the torso can rest on the floor and against solid walls/trunks with less mesh penetration.
- **Future avatar selection:** a neutral age-reference configuration supports future height/proportion options for ages 10–15. Selecting boy/girl should not require different skeleton topology or sex-specific gait / game advantages; **the chooser itself is not yet implemented**.
- Preserves zoom, touchscreen controls, speed settings, guardian challenge and existing fall/collision features.
- **Testing required:** inspect rib alignment from front, side and while falling against walls and trees on mobile. Syntax validation and GitHub publishing do not establish visual or performance perfection.

## Previous version: 0.10.0 — November 7, 2026
- Unified the standing, walking, running, and falling torso visual topology. The spine now has **pelvis → lower spine → chest → neck → head**, with clavicle-to-shoulder and pelvis-to-hip connections, rather than one long torso stick.
- Both rendered modes reuse the exact same `TORSO_BONES` definition. The ragdoll retains invisible stabilizing shoulder/hip braces so physics constraints no longer appear as extra bones or diagonal torso sticks.
- Matched the ragdoll's skin, body and leg materials to the standing avatar. Visible arm, leg, hand and foot segments follow the same anatomy.
- Preserved the v0.9.2 gravity/collapse behavior, wall/tree collision system, standing recovery, zoom, joystick, controls and English educational activities.
- **Validation:** JavaScript syntax passed. Please test the *Fall* debug button in open space and next to trees/walls to check torso consistency and ragdoll stability.

## Previous version: 0.9.2 — November 7, 2026
- **Fall completion fix:** prevents the ragdoll from settling in a half-standing crouch. A decaying, contact-aware loss-of-balance torque tips the upper body, the knees can buckle, and the solver stays awake until both head and pelvis reach the ground.
- Picks a clear initial fall direction when a nearby wall or tree would block the character's forward tumble. Solid-object collision projection and bounded contact momentum are retained to avoid the old wall-launch bug.
- **Needs touchscreen QA:** verify falls against walls, near lantern posts/trees, in the open courtyard, and that the body ends fully down and can stand up again.

## Previous version: 0.9.1 — November 7, 2026
- **Wall-collision hotfix:** fixes artificial horizontal launches when activating Fall beside courtyard walls. Positional overlap corrections no longer feed unlimited ragdoll momentum, and boundary contact cancels motion into the wall while leaving gravity free to bring the character down.
- Reduced the injected startup tilt and removed the old upward kickoff. Existing tree/post collisions, Stand Up and debug Fall remain available.
- **Needs visual QA:** test near each wall, especially corners and adjacent towers, and verify the body comes to rest against the surface without bouncing or clipping.

- Added a **lightweight procedural ragdoll** for the main character. After sustained unsafe knee, hip or ankle angles / overextended foot targets, the character loses balance and falls.
- High-speed, direct impacts with solid obstacles can also cause a fall.
- The fall is calculated using **Verlet integration + positional constraints (PBD)** for gravity, limb lengths, friction and connected joints. This is a simplified, deterministic game approximation, **not** a certified biomechanical or full rigid-body physics engine.
- The fallen skeleton interacts with **ground, courtyard limits/walls, tree trunks, lantern posts, towers and the guardian**; segment collision checks reduce arms/legs cutting through narrow trunks.
- Additional minimum-separation constraints help prevent elbows and knees from folding into implausibly sharp angles.
- A touch-friendly **Stand Up** button appears after the body falls; press **R** on the keyboard to stand up. Recovery finds a clear nearby position, restores upright locomotion and includes a short cooldown.
- The fall temporarily disables movement, Run and Talk; camera follow, English UI, zoom, educational quest and current map are otherwise preserved.
- **QA fall test:** open `https://gabect.github.io/academiadeaventura/?v=0.13.0&debug=1` to show a temporary **Fall** test button. This additional control is hidden for regular players.
- **Testing needed:** verify live-device animation, body stability, proximity to corners/trunks, performance on Chromebooks and realistic foot-placement triggers. Performance and complete avoidance of penetration are not yet guaranteed.

## Version history
- **0.15.0 (2026-11-08):** terrain-aware feet on grass, stone and raised tiles; IK-grounded unarmed tactical crouch, shorter crouched strides, no fake sinking.
- **0.14.0 (2026-11-08):** fall feature disabled; permanent reflex recovery; Agility XP progression preserving legacy Balance levels; removed debug Fall and stand-up actions.
- **0.13.0 (2026-11-08):** compact working contextual A/B/C touch controls, B sprint hold and tap jump/fall recovery, C cancel/crouch, Shift sprint and Space jump.
- **0.12.0 (2026-11-08):** automatic protective balance/catch-step animation; upgradeable motor skill (Balance levels 1–4) using XP; repeatable quiz XP; softer ragdoll limb settling and safer sleep gating.
- **0.11.0 (2026-11-07):** lightweight anatomical rib cage + sternum reused across standing and fallen characters; neutral 12–13-year-old proportions, additional torso clearance.
- **0.10.0 (2026-11-07):** shared anatomical torso skeleton across live and ragdoll states, hidden physics-only braces and consistent materials.
- **0.9.2 (2026-11-07):** fixed half-standing ragdoll by sustaining a bounded tipping moment until ground contact, and only permitting physics sleep once the body is down.
- **0.9.1 (2026-11-07):** corrected wall-induced ragdoll launches, neutralized artificial collision momentum, added wall contact damping and downward startup.
- **0.9.0 (2026-11-07):** dangerous-joint fall detection, obstacle-impact falls, lightweight ragdoll, solid-object collisions, and stand-up recovery.
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
2. Increment the semantic version (patch 0.15.1, feature 0.16.0, breaking 1.0.0).
3. Update `BUILD` and the `buildLabel` element in `index.html`.
4. Update this README with the release date and change summary.
5. Update `version.json` **last**, after committing the HTML, to let browsers detect the new build.
6. Verify the experience in an actual touchscreen browser and Chromebook. GitHub commits do not guarantee GitHub Pages has deployed immediately.

## Technical notes
The game checks `version.json` every 30 seconds and reloads when no quest or input is active. Reloading does not persist a quest in progress. Landscape orientation locking depends on the browser. Collision footprints approximate solid objects; foliage and overhead scenery remain non-collidable.

Do not place personal student information in this public repository.
