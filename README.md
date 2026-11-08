# Adventure Academy

Educational browser-based 3D RPG prototype designed for Chromebooks and touchscreens. Built with HTML, CSS, JavaScript and Three.js, without sprites or a conventional game engine.

**Play:** https://gabect.github.io/academiadeaventura/

## Controls
- **Keyboard:** WASD moves; arrows orbit/tilt the camera; Ctrl+Z/Cmd+Z undoes the last camera adjustment. E interacts; near the north wall ladder, E starts **automatic ascent/descent**. W/S changes climbing direction, C heads for a safe landing. Elsewhere Shift runs, Space/B jumps, tap C crouches, and hold C ~0.52s crawls.
- **Touchscreen:** left joystick moves; drag to orbit camera, pinch or +/- to zoom, ↶ to undo camera adjustments. Near the north wall ladder, tap **A once** to climb or descend automatically; joystick up/down reverses direction, and C/Exit heads for a safe landing. Elsewhere A interacts, B runs/jumps and C crouches or crawls.
- **A** will be used to grab objects when pick-up mechanics are added, but objects are not yet pickable in this prototype.
- **Landscape:** the game requests landscape orientation when supported; browser restrictions can prevent orientation lock.
- **Third-person camera:** smooth camera follows behind after a 40° heading deviation. **+** approaches and **−** pulls back; mouse wheel/two-finger pinch zoom, one-finger/mouse drag orbits, arrow keys control manual camera, and Ctrl+Z/↶ undoes the last manual camera adjustment.
- **Stability:** there are **no falls** in normal or QA mode. The avatar makes a brief protective balance/catch-step motion after sustained overextension or hard impacts, then automatically recovers its upright stance. Collision boundaries, planted-feet motion and jumping remain active. The legacy ragdoll source is retained but disabled.
- **Agility (formerly Balance):** spend XP with **+ Agility** at top left. Agility levels 1–4 reduce protective recovery duration, reduce the visual wobble, reduce its frequency, and shorten recovery cooldown. Existing Balance XP/level data is reused without resetting progress. The guardian trial grants 25 XP once and 10 XP per repeat.

## Current version: 0.27.0 — November 8, 2026
- **Camera-only change:** elevated, diagonal, semi-isometric view inspired by the toy-diorama framing of *The Legend of Zelda: Link's Awakening* (Nintendo Switch), while retaining the Three.js perspective camera. Initial elevation is ~54° above the horizontal plane; starting camera heading is 225° and the field of view narrows from 58° to 48°.
- **Stable framing:** the camera follows the player position smoothly but does not automatically orbit with avatar turns or ladder use. Existing drag, arrow orbit, pinch/+/− zoom, camera undo and obstruction avoidance remain usable; elevation can still be adjusted manually (~27–70°).
- **Scope:** no changes to the game world, ladder geometry, climbing, locomotion, collision, interactions, XP or saved progress. This is a first camera framing pass; visual QA on Android remains necessary.

## Previous version: 0.26.0 — November 8, 2026
- **Natural top dismount:** the climb stops just below the stone lip, where the character braces on the short upper handholds and pushes upward before stepping a short distance onto the wall. The finish is positioned only 0.19 units inside the ledge (instead of 0.64 units), without passing through upper cross-rungs.
- **Back-first, foot-first descent:** at the wall edge, A/E begins a separate 1.18s mounting animation. The avatar faces the wall, bends forward, lowers one foot onto a rung, then the other while backing out through the open gap. Only after the body clears the stone wall does it descend and return to continuous automatic ladder climbing. Holding or tapping C while mounting returns safely to the upper landing.
- **No ladder above the exit path:** the highest rung is below platform height; short rail ends provide handholds but no crossbar blocks the transfer. Ladder geometry, rung-height IK, and collision all share the same height cutoff. The climb track is closer to the wall for feasible leg reach and the landing sits near the rim.
- **Preserved:** the vertical bracket-mounted ladder, solid wall/ladder collisions, front-only A grab, Agility XP, guardian challenges, stone stairs, balcony, camera and all original touchscreen input.
- **Verification:** JavaScript syntax passed. An extracted controller simulation passed 10 assertions for the upper push-off, height clearance when crossing the ladder plane, lower foot-first mount, wall-clearance before descending, continuous automatic descent and safe C reversal. Real touchscreen 3D animation and IK quality remain to be checked visually.

## Previous version: 0.25.0 — November 8, 2026
- **Permanent vertical north-wall ladder:** replaced the sloping rails/rungs with a truly vertical, single-plane ladder, using metal brackets anchored directly into the north wall. The ladder runs parallel to the masonry at a fixed 0.16-unit toe clearance; it is no longer a portable ladder leaning against the wall.
- **Straight climb track and wall-safe dismount:** the character's climb position has a constant Z relative to the fixed ladder and is kept in front of the masonry. A/E remains the only way to grab and climb automatically. At the top the avatar climbs nearly all the way to the lip, then rises before stepping onto the rampart; descent returns to a clear courtyard point.
- **Consistent physical obstacle:** replaced the former slope-dependent rail/rung collision with fixed vertical rail capsules and cross-rung checks. Standing, tactical crouch and crawling still respect body volumes; the narrow wall-to-ladder gap is not a shortcut through the masonry. The bottom interaction zone is restricted to the front of the ladder.
- **Preserved:** stone steps, raised timber balcony, wall opening, Agility/XP, guardian challenges, camera, A/B/C buttons, crawl/crouch, and no-fall mode.
- **Verification:** module JavaScript syntax parsed; checked that the old slope coordinates are gone, vertical Z is shared by geometry/climbing/physics, wall mounts are defined, the A/E interaction is unique, and posture and step checks remain present. In-browser visual, mobile IK and climb-transition checks still need device QA.

## Previous version: 0.24.0 — November 8, 2026
- **Posture-aware solid collisions:** standing, tactical crouch and chest-down crawl now have separate 3D clearance volumes, approximately 2.13, 1.72 and 0.62 units high. The prone body also checks three points along its length, rather than treating it as a standing circle. These are conservative procedural collision proxies, not mesh-perfect rigid-body physics.
- **Solid leaning ladder:** the existing single ladder has geometric collision against both sloping timber side rails and every cross-rung; normal movement cannot walk through the ladder or push through it by repeating input. The only authorized passage onto it is the A/E ladder-climbing state, which is still governed by the existing climb controller.
- **Solid masonry wall and timber platform:** a player on the courtyard floor cannot partly penetrate the stone training-wall mass. The raised wooden platform's underside also blocks too-tall postures; a low crawl may enter only where the body actually fits. Existing balcony stone steps remain climbable, and the wall is still accessible only through its ladder.
- **Clearance-required posture changes:** C cannot rise from prone to crouch or from crouch to standing if headroom is insufficient. The B run button can no longer force standing through an overhead obstacle. Collision height follows the actual interpolated crouch/crawl animation so the character cannot enter a narrow gap before fully lowering. Turns with an extended prone body also test the new footprint before changing orientation.
- **Climb geometry/dismount polish:** the ladder's rails stop inclining at the wall edge and continue vertically above it, leaving the upper landing usable. The climber's track stays in front of the rungs and exterior masonry, while the final ascent rises above the lip before stepping onto the wall. The courtyard exit was moved slightly outward for safe standing clearance.
- **Jump ceiling:** jumping stops rising when it would intersect ladder or wall geometry overhead.
- **Verification:** actual extracted JavaScript clearance/movement routines were exercised with standing, crouching, crawling, ladder and wall collisions, normal stone steps, safe upper/bottom landings and attempted stance changes. Repeating 500 forward pushes never entered the ladder/wall, and an unfinished crouch-to-crawl transition was refused access to an overhead gap until fully lowered. Source syntax and one-copy function checks passed; visual/animation validation on Android remains outstanding.
- **Preserved:** guardian challenges, Agility XP data, third-person camera and camera undo, four-step staircase, balcony, tactical crouch, lateral-knee prone crawl and disabled falls.

## Previous version: 0.23.1 — November 8, 2026
- **Ladder limb crossing fix:** when facing toward the north wall (world yaw PI), the left leg/arm targets must be on the world +X side and the right leg/arm targets on world -X. The previous global-space signs were reversed, making the limbs cross in front of the torso. Both handed and foot rung targets are corrected; the existing ladder IK/controller is reused.
- **No apparent automatic wall climbing without A:** the ordinary grounded body height now follows the walkable surface directly beneath the character center, rather than taking the *maximum* height below any foot. A separate sole-height guard permits normal 0.30-unit stone stair steps but refuses to plant a foot on the 2.00-unit wall when the center is still at courtyard level. Pressing A/E is still the only trigger to enter the ladder state.
- **Scope:** targeted replacements only; no new climbing controller, change to the north wall, or deletion of other locomotion modes. The 40-degree camera, Agility progress, military crouch/crawl and regular stairs remain intact.
- **Verification:** JavaScript module syntax, unique ladder-start call site, side assignment and grounded-height guards checked. Full mobile animation QA remains necessary.

## Previous version: 0.23.0 — November 8, 2026
- The **existing** leaning wooden ladder was relocated from the deck to a short stone training section of the **north courtyard wall** (X -4.75 to -2.25, Z -12.35 to -10.50). The wall top at Y 2.0 is walkable, with parapets and a central ladder gap. The balcony's missing east railing was restored.
- **Automatic climb and dismount:** approach the ladder foot and tap A / Action (E on keyboard) once. The avatar climbs and steps onto the stone wall automatically, without holding the joystick or requiring a final push. From the wall top, tap A/E to descend automatically. Manual W/S or joystick up/down can reverse direction.
- **C / Exit** sends the avatar toward a safe landing through the ladder; when close enough to the wall top it completes the ascent, otherwise it returns to the courtyard. Jump/sprint are still disabled while climbing. The existing skeletal IK, camera and collision systems are reused.
- **Validation:** JavaScript syntax, initialization order, distinct function definitions, landing coordinates, and step-height protection passed static checks. At 60 FPS a numerical progression test reached both auto-dismount thresholds in about 2.58s, before entry/exit transitions. Real Android animation and camera clearance still need visual QA.
- All other mechanics and saved progress remain unchanged.

## Previous version: 0.22.0 — November 8, 2026
- **Leaning wooden ladder** against the outer east side of the courtyard balcony, at Z -3.50; its rails lean inward from X 10.98 at ground to X 10.15 at deck height, continuing above the landing for handholds. Thirteen visible wooden rungs are built from the existing 3D geometry helpers. The balcony's east guardrail is split around a wide opening; the remaining sections retain collision.
- **Interact to climb:** approach either the ladder foot on the courtyard ground or the landing above and press **A / Action** on mobile, or **E** on a keyboard. The A button changes its subtitle to *Climb* when entry is available. No extra gameplay button is added.
- **Movement:** while attached, **W / joystick up** climbs and **S / joystick down** descends. The player follows the ladder's inclined path. The existing skeleton drives procedural alternating hands and feet toward actual 3D rung targets using the two-bone arm/leg solvers. Rung targets are interpolated to avoid harsh snapping.
- **Smooth entry and exit:** a short alignment transition precedes climbing. Reaching the deck or floor automatically animates the player onto the matching walkable surface, restores normal locomotion and reanchors the feet. Hold or tap **C / Exit** to return down the ladder safely if partway up; when almost at the top it completes a safe dismount onto the balcony. No midair drop.
- **Climb safety:** jump and sprint are disabled while attached; crawl/crouch are exited when grabbing the ladder. The player cannot walk through the unguarded balcony edge using normal movement because the existing step-height gate is retained. The third-person camera follows the climber's vertical position, tightens its chase distance, and excludes the ladder rods from architectural line-of-sight occlusion tests.
- **Validation:** JavaScript module syntax, feature integration, duplicate-function checks, camera initialisation order, entrance geometry and sample arm/leg reach calculations passed. Dynamic 3D visual QA on a real phone has not yet been completed.
- **Preserved:** original four stone steps, wooden balcony, guardian tasks, Agility XP/save data, crouch/kneel, prone military crawl, camera orbit and its Ctrl+Z undo, collision and disabled falls.

## Previous version: 0.21.0 — November 8, 2026
- Third-person camera now has a 40-degree heading dead zone. It follows the avatar's position without revolving during small direction changes. If the moving avatar turns more than 40 degrees away from the current camera heading, the camera gently accelerates into a catch-up turn and then decelerates behind the avatar. Camera position and aim are separately smoothed.
- Independent controls: **WASD** controls avatar movement, while **arrow left/right** orbits the camera and **arrow up/down** tilts it. Arrow keys no longer move the character. A manual orbit suppresses automatic recentering temporarily; while the avatar remains still, the camera view stays wherever the user leaves it.
- On touchscreen or with a mouse, **drag across the gameplay canvas** with one finger to orbit/tilt without touching the joystick or A/B/C. A **two-finger pinch** keeps its prior zoom function. Input surfaces remain independent, so walking with the left thumb and looking around on the canvas are possible simultaneously.
- Camera-only **undo**: **Ctrl+Z** (Cmd+Z on macOS) or the new **↶** button under +/- restores the previous manual camera orientation, tilt, or zoom. This is intentionally not an undo for player positions, XP or challenge actions. Camera history is bounded to 12 checkpoints.
- Camera ray collision and the zoom controls remain. The tactical crouch, prone crawl, stairs, guardian, XP and no-fall behavior are not replaced. Code changes reuse the existing follow camera rather than creating a second camera controller.
- Verified with JavaScript parse checks, camera turn easing samples and uniqueness checks for the principal camera/movement functions. The new mouse/touch interactions have not been visually QA-tested on the user's Android device.

## Previous version: 0.20.0 — November 8, 2026
- **Perspective third-person follow camera:** the fixed isometric/orthographic view has been replaced by a perspective camera trailing behind the avatar, slightly above the shoulders. The camera rotates smoothly to match the character's travel heading, follows the character across the new balcony/stairs, and raises/lowers its aim point for standing, kneeling, and prone crawling.
- **Camera-relative locomotion:** the joystick and WASD/arrows now move the character relative to the follow camera's view, not the old hard-coded isometric axes. The player starts facing the rear of the courtyard toward the guardian (Y rotation PI), with the camera behind the avatar.
- **Zoom now adjusts follow distance:** + and - buttons, mouse wheel and two-finger canvas pinch are preserved; they control camera follow distance instead of orthographic zoom. The perspective FOV is 58 degrees and the viewport aspect ratio updates on resize.
- **Architecture occlusion mitigation:** an architectural mesh cache is ray-tested between the camera's target and the desired trailing position. When a tower, balcony or railing blocks the line of sight, the camera pulls forward rather than staying behind that obstruction. Player and guardian skeletons, the base grass plane and pavement overlays are excluded from these camera rays.
- **Preserved:** tactical crouch, floor-hugging lateral-knee military crawl, level paving, balcony step-up/down, collision, A/B/C buttons, XP/Agility and the no-falls rule.
- **QA required:** this was validated by JavaScript syntax/structural assertions and target-height calculations, not a live Android device test. Test chasing a character around a tower, ascending the wooden balcony, diagonal joystick movement, quick 180-degree turns, crouching/crawling, and pinch/zoom.

## Previous version: 0.19.1 — November 8, 2026
- Repositioned the existing balcony and four-step staircase north/backward along the Z axis to improve visibility from the fixed isometric camera; no movement or physics subsystem was replaced.
- New balcony bounds: X 7.10–10.10, Z -5.80 to -1.20. The staircase remains on its west side, now Z -4.80 to -2.20. Height, risers, rails, geometry and all controls are unchanged.
- Static verification: module syntax valid; all four risers remain traversable at 0.30 rise; no overlap within player-radius clearance of existing trees, lamp, guardian or corner towers. Each key terrain/movement function occurs once. This is not live Android visual validation.
- Removed two outdated source comments while keeping edits limited to relocation and versioning.

## Previous version: 0.19.0 — November 8, 2026
- **New courtyard feature — wooden balcony and four stone steps.** A timber viewing deck is placed on the eastern/right side of the courtyard (X 7.10–10.10, Z 1.20–5.80). Four 2.6-unit-wide stone steps approach it along +X (X 4.70–7.10, Z 2.20–4.80), with a 0.30 rise each. Their tops are 0.25, 0.55, 0.85, 1.15 world Y; the deck shares the fourth riser's 1.15 elevation (1.20 above the grass and pavement). Wooden support pillars, individual deck planks, balcony guardrails and sloping stair handrails are visible 3D geometry.
- **Real step-up and step-down constraints.** The previously empty `WALKABLE_ELEVATIONS` is now populated by the deck and four stone treads. `groundTopAt(x,z)` samples their registered, walkable rectangular footprints rather than assuming a flat floor or treating visual objects as climbable. Movement collision resolves in small steps and permits up to 0.34 world-units of vertical change per step; direct ascent through a tall deck side and steep drop-offs are blocked. Prone crawling is restricted to a maximum 0.075 vertical change to avoid pushing the chest through a riser. Stand and tactical crouch use the regular step-up behavior.
- **Solid balcony and stair safety.** Guardrails and both staircase side rails use collision rectangles expanded by the player's radius. Only the west-side staircase opening connects the courtyard to the deck; the other edges have railings or vertical-change blocking. Existing circular obstacles, courtyard walls and guardian remain active.
- **Animated terrain-aware foot placement.** Swinging ankles continue to target the actual local `groundTopAt` height; a stair-specific swing lift clears higher stone risers. The torso/base elevation smoothly follows the supporting surfaces. The third-person camera now tracks the avatar's vertical position as well as X/Z, so elevated platform traversal stays in frame.
- **Onboarding.** The initial HUD message points players to the stone staircase leading to the balcony on the right. The main character begins at the same existing courtyard spawn point. No new button is needed: use the joystick or WASD to approach and walk up.
- **Preserved:** original level stone paving/grass at Y -0.05, guarded courtyard, action buttons A/B/C, tactical kneeling, side-to-side prone military crawl, the guardian trial, saved Agility XP and disabled falls.
- **Verification:** JavaScript module syntax, source consistency, a numerical ascending route across all four risers, rail/capsule clearance and the balcony endpoint were checked. Not yet visually tested in a live Android browser; watch foot/stone intersections, downward stepping, rail corners and camera tracking.

## Previous version: 0.18.2 — November 8, 2026
- **Sideways floor-hugging prone knees:** the previous up-and-down mirrored knee IK was replaced *for crawling only* by 3D two-segment leg IK with a horizontal **outward pole**. The left knee bends out to the left and the right knee out to the right, sliding close to the terrain as the legs tuck and push. It no longer raises each knee vertically toward the back.
- **Alternating diagonal push:** leg targets draw forward ~0.17 and slightly out to their respective side ~0.13 during each stroke, then retract/extend. Each knee alternates with the other and remains phase-matched to its opposite planted/pulling arm.
- **Near-surface knee clearance:** sample geometric calculations across the stroke found a ~0.225 lateral knee movement with kneecap bottoms approximately -0.036 to +0.010 against a floor top of -0.05 (about 1.4–6 cm of clearance), rather than large vertical knee lifts. These checks are static geometry; full motion still requires visual QA.
- **Preserved:** chest-to-ground posture, low toe lift, full flat grass/pavement, normal walking/running/jump, kneeling tactical crouch, Agility progression, three-button touch controls including hold-C crawl, obstacles/guardian challenges and disabled falls.
- **QA:** verify on Android that the knees move out on alternate sides without sinking into the terrain, the feet remain approximately behind the hips, and transitions between crawling and kneeling are smooth. Motion remains procedural and not force-driven physics.

## Previous version: 0.18.1 — November 8, 2026
- **Visible alternating military knee push-offs during prone crawl:** each leg now draws its foot forward toward the hip, raises the corresponding bent knee, then extends its leg backward to push the body along the ground. The other leg repeats half a cycle later.
- **Diagonal coordination:** each knee push phase is aligned with the opposite hand's plant/pull phase, so the crawl uses right knee + left arm and then left knee + right arm instead of leaving the legs almost motionless.
- **Prone posture preserved:** chest and pelvis retain the near-ground height from v0.18.0; feet skim the floor with very small lift while the knee rises visibly. The stride is distance-driven, and each leg's motion blends in and out smoothly when starting and stopping.
- **Knee IK:** the leg solver gained an optional mirrored-knee branch used only during the prone leg stroke. Other locomotion continues using the original IK by default. Geometric sampling of the crawling pose with 0–100% knee tuck placed the lowest kneecap bottom at about -0.045 against the level floor at -0.05 (roughly 5 mm clearance); modeled ankle centers stayed above ground.
- **Preserved:** flat grass/pavement, crouch/kneel, walking/running/jumping outside crawl, A/B/C (hold C ~0.52s), experience, guardian trial and no-fall gameplay.
- **Manual QA still needed:** verify raised-knee motion on Android, especially when alternating strokes, starting and stopping, changing direction, and ensuring the foot/leg geometry stays above the terrain. This remains approximate procedural IK, not real force-based human locomotion.

## Previous version: 0.18.0 — November 8, 2026
- **True prone/chest-to-ground military crawl instead of a high/bear crawl:** the pelvis descends much farther and the rigid but shared juvenile torso rotates to approximately horizontal, keeping ribcage/sternum close to the level grass/stone terrain. The head counter-rotates so the face remains raised toward travel, not buried in the floor.
- **Extended legs trailing the body:** both ankles target positions nearly a full leg length behind the low pelvis, creating a stretched-out silhouette. Toes point backward with a shallow downward pitch, and each leg performs a small opposite-phase dragging/pushing pulse rather than lifting its knees high in a quadruped gait. The foot targets follow the pelvis as it travels, avoiding impossible rooted-toe overextension.
- **Alternating palm/forearm propulsion:** hands remain planted during their support phase and advance through low, short swing arcs while the opposite leg provides the counter-pulse. Arm IK uses a low elbow pole to bend elbows beside/near the floor rather than supporting the torso in a high bear crawl.
- **Physical-height checks:** with grass and paving top at Y = -0.05, representative resting pose calculations place the sternum bottom at about -0.038 (roughly 1.2 cm above the floor), head bottom at +0.001, and rear knee bottoms about -0.045 to -0.014, with both ankles inside the rig's reach. These are geometric checks only, not a guarantee of no mesh clipping at every angle or in motion.
- **Controls and other states unchanged:** hold C for ~0.52s to crawl; tap C while crawling to return to the tactical crouch; another tap stands. A/B, walking, running, jumping outside crawl, Agility XP, guardian quiz, flat pavement and disabled falls remain as before. Crawl speed is further reduced to 20% of normal walking speed.
- **Device QA:** the new near-ground body posture must be examined on Android from multiple camera zoom levels; verify that ribs, palms, shins, shoes and head do not clip terrain, and that alternating pull/push motions are visible, especially at crawl start/stop and turns. This is procedural skeletal animation, not a fully physically simulated rigid-body crawl.

## Previous version: 0.17.0 — November 8, 2026
- **New unarmed low military crawl:** a distinct procedural crawl locomotion state, not a stretched crouch animation. The pelvis and chest descend toward the ground, the torso pitches forward, and the hands and bent knees/legs alternate in diagonally coordinated support/swing pairs.
- **Distance-driven contacts:** each hand and foot has a world-anchored planted position and a lifted, interpolated swing phase. Opposite arms and legs share a movement phase. The cycle advances with real courtyard distance traveled, rather than an in-place timer; idle limbs rest against the ground. This is a kinematic simulation, **not** force-driven rigid-body locomotion.
- **Control C:** short tap toggles crouch/stand, while holding **C** for about 0.52 seconds toggles low crawl. From crawl, either tap or hold C rises back to tactical crouch; another tap stands. Supported via Android pointer capture and keyboard C key holds (Escape still cancels dialogs). A/B are unchanged, but B run/jump is disabled while crawling.
- **Low crawl motion:** approximately 0.90 world units/s (28% of walking speed), grounded palms/hands, short knee/leg slides and reach steps, minimal bobbing and a lowered torso with head counter-rotation. The same teenager rig and ribcage are reused; no weapons or new assets.
- **Preserved:** level grass/pavement, all solid-object collisions, crouch/kneel transitions, guardian quiz, Agility XP saves, joystick, camera zoom, no-falling gameplay, and English UI.
- **QA priority:** on-device test hold vs tap C, side-view hand/knee/foot contacts, crossing grass/pavement, running B while crawling, stopping/reversing motion, and return to crouch and standing. Source syntax, structural and sample leg-reach checks passed; no claim of full live mobile validation.

## Previous version: 0.16.1 — November 8, 2026
- **Tactical crouch upper body:** a more pronounced forward lean from the pelvis in the low posture (roughly 25–31 degrees) and counter-rotated neck/head so the face remains oriented forward rather than looking down.
- **Anatomically controlled hands:** a lightweight two-segment arm IK solver places each wrist near a reachable 3D goal. In a stationary one-knee kneel, the **right wrist follows the forward right knee** and the hand settles close to it; the **left arm stays bent, forward of the chest for balance**. No props or firearms are added.
- **Moving tactical pose:** as the player shuffles crouched, both arms hold naturally bent guard/balance positions with small gait-linked motion. The right hand blends toward the actual knee only when the low kneeling pause settles, avoiding rigidly attaching it to the knee while walking.
- **Smooth transition back:** arm IK blends with the original standing/walking arm animation, preserving the existing skeleton, shoulder/elbow articulation, A/B/C controls, leap/run motions, collision, Agility XP and flat ground.
- **Verification:** JavaScript syntax and structural checks passed; manual Android visual QA remains needed, especially front and side camera views of the elbows, hand contact, torso lean and return to standing.

## Previous version: 0.16.0 — November 8, 2026
- **Authentic asymmetrical unarmed tactical crouch:** the character keeps the **right foot forward and left foot behind** during pauses. The front knee remains high in a supported lunge, while the rear knee lowers until its joint's bottom meets the ground. Torso leans farther forward (about 18–21 degrees) and the arms stay bent in an unarmed balance-ready posture.
- **Crouched movement:** short, deliberate, low steps with a slight forward/back foot offset; lower center of mass, smaller bounce and reduced speed. The pose transitions to a deeper one-knee kneel when movement stops.
- **Deliberate pause transitions:** feet re-position in sequence, lifting briefly during each shuffle step rather than snapping or sliding instantaneously to the resting split stance. Standing back up likewise brings both feet to their neutral positions.
- **Contact calculation:** rear-knee clearance was checked against actual joint length and terrain height. In the idle crouch the modeled rear knee touches the grass/flush pavement (within ~1 mm of the floor); the front knee remains above the terrain. The full visible result still needs actual device QA.
- **Preserved** the flat grass/pavement ground, ankle IK, no-fall mode, A/B/C controls, agility XP, camera and educational challenge. No weapons were added.
- **QA:** inspect on mobile from front/side, and test walking crouched, pausing into kneel, stopping beside trees and walls, and standing up. This remains procedural IK and is not full rigid-body physics.

## Previous version: 0.15.1 — November 8, 2026
- **Paving at ground level:** the main courtyard pavement is a flat horizontal surface on the same physical plane as the grass (both **Y = −0.05**). The previous elevated stone slab was removed. Stone paving markers are also flat visual decals, rather than raised blocks.
- **Visual layers versus physics:** ultra-thin rendering offsets avoid flickering where the paving and grass are drawn together; they are not steps or collision heights. Crouch, walk, run, jump and foot IK all reference one continuous ground height across the grass/pavement boundary.
- **Future elevated structures:** introduced an empty `WALKABLE_ELEVATIONS` registry for explicitly walkable stairs, stages and platforms. A future object only raises foot support when its surface is registered with `walkable: true` and bounds/top height. Decorative and non-walkable interactive objects remain separate obstacles; no stairs or stages are being added by this patch.
- **Preserved:** tactical crouch, A/B/C touchscreen controls, Agile XP progression, guardian trial, zoom, trees/walls collisions and disabled falls.
- **Device QA needed:** verify the level seam between grass and pavement from multiple zooms and foot placement when crossing that seam. Future elevated walkable assets require separate collision/step-up implementation before production use.

## Previous version: 0.15.0 — November 8, 2026
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
- **0.27.0 (2026-11-08):** semi-isometric elevated diagonal perspective with stable follow, manual orbit, existing zoom/undo and camera collision. Gameplay unchanged.
- **0.26.0 (2026-11-08):** short upper lip push-off, ledge handholds, first-foot backward descent with staggered IK, clear top rung transfer, no crossbar traversal and safe C cancellation.
- **0.25.0 (2026-11-08):** permanent vertical north-wall ladder with wall brackets, constant-Z climb/IK and solid rail/rung collisions; top/bottom safe dismounts and front-only A/E interaction.
- **0.24.0 (2026-11-08):** posture-dependent ladder/wall/deck collision with body headroom tests, prohibited stand-up in tight gaps, angled-rail and rung solids, guarded crawl turns and safe climb exits.
- **0.23.1 (2026-11-08):** fixed left/right hands and legs crossing on the north-facing ladder; prevented feet sampling an unreachable wall top and visually lifting the body without A.
- **0.23.0 (2026-11-08):** moved ladder to the north wall, repaired auto-dismount and simplified A/E single-tap interaction, restored balcony railing.
- **0.22.0 (2026-11-08):** leaning ladder beside balcony, opening in safety rail, E/A entry, W/S/joystick climb, procedural rung-contact animation, C safe exit and climb camera follow.
- **0.21.0 (2026-11-08):** 40° deferred smooth-follow camera, WASD movement/arrow-key manual camera, one-finger drag/two-finger pinch, bounded Ctrl+Z/↶ camera undo.
- **0.20.0 (2026-11-08):** perspective behind-the-avatar camera with smoothed rotation, camera-relative joystick/WASD movement, obstacle-aware follow distance and posture-aware framing.
- **0.19.1 (2026-11-08):** relocated balcony/steps away from the foreground tower; static checked collisions and kept existing stair system intact.
- **0.19.0 (2026-11-08):** wooden courtyard balcony, four walkable stone stairs, radius-checked railings, collision-aware 30-cm automatic step-up/down, elevated foot IK and camera tracking.
- **0.18.2 (2026-11-08):** changed prone leg IK to lateral, floor-hugging knee tuck/push; left and right knees open to their respective sides in phase with the opposite pulling hand.
- **0.18.1 (2026-11-08):** opposing knee-lift/push strokes synchronized with planted/pulling arms; near-ground foot motion and safer mirrored knee IK.
- **0.18.0 (2026-11-08):** prone chest-to-ground military crawl replaces the raised quadruped gait; ground-near sternum, low hips, extended trailing legs, low elbow IK and sliding toe push-offs.
- **0.17.0 (2026-11-08):** low military crawl with paired opposite arm/leg stepping, grounded hand/ankle targets and long-press C controls on touch and keyboard.
- **0.16.1 (2026-11-08):** forward-leaning tactical torso, horizon-oriented head, two-bone arm IK, right hand follows lead knee at crouch rest and left hand balances.
- **0.16.0 (2026-11-08):** deeper asymmetric unarmed tactical crouch: right foot forward, left knee touching ground when stopped, shuffled foot transitions and short low steps.
- **0.15.1 (2026-11-08):** flattened stone pavement and paving detail to grass ground level; separated rendered markings from physical walkable elevation.
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
2. Increment the semantic version (patch 0.19.1, feature 0.20.0, breaking 1.0.0).
3. Update `BUILD` and the `buildLabel` element in `index.html`.
4. Update this README with the release date and change summary.
5. Update `version.json` **last**, after committing the HTML, to let browsers detect the new build.
6. Verify the experience in an actual touchscreen browser and Chromebook. GitHub commits do not guarantee GitHub Pages has deployed immediately.

## Technical notes
The game checks `version.json` every 30 seconds and reloads when no quest or input is active. Reloading does not persist a quest in progress. Landscape orientation locking depends on the browser. Collision footprints approximate solid objects; foliage and overhead scenery remain non-collidable.

Do not place personal student information in this public repository.
