# BackroomsGTAG code and visual audit

Audit date: 2026-10-22

## Visual reference findings

Level 0 is commonly represented with faded monochrome yellow wallpaper, damp or stained brown carpet, a dropped ceiling made from acoustic tiles, inconsistent fluorescent panels, and occasional wall outlets. The current environment has been brought closer to that visual language using generated materials rather than copying third-party image assets.

References consulted:
- [Backrooms Wiki — Level 0](https://backrooms.fandom.com/wiki/Level_0): description notes yellowed wallpaper, worn/moist carpet, outlets and inconsistent fluorescent lighting.
- [The Official Backrooms Wiki — Level 0](https://the-official-backrooms.fandom.com/wiki/Level_0): yellowish wallpaper, damp carpet and fluorescent lighting/hum.
- [Wired — What Are the Backrooms?](https://www.wired.com/story/what-are-the-backrooms/): visual reference for low drop ceilings, rectangular fluorescent panels and repetitive empty yellow corridors.
- [Three.js WebXRManager documentation](https://threejs.org/docs/pages/WebXRManager.html): reference-space configuration is set before opening the XR session.
- [MDN — XRReferenceSpace](https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace): local-floor uses floor level as the Y origin.
- [MDN — XRFrame.getViewerPose](https://developer.mozilla.org/en-US/docs/Web/API/XRFrame/getViewerPose): viewer pose is queried from the XR animation frame and is relative to the supplied reference space.

The pictures were used as visual references only; their pixels are not bundled into this game.

## Issues found and fixes

1. **Flat materials:** the previous floor, walls and ceiling were mostly solid colors. Added lightweight procedural CanvasTextures for faded patterned wallpaper, dense carpet fibers, acoustic ceiling tiles, carpet moisture marks and wall grime.
2. **Excessive draw calls:** the prior scene had separate meshes for every wall, every ceiling panel, 220 floor specks, many wall seams/patches and individual outlet components. Replaced repeating geometry with InstancedMesh batches and texture details to reduce per-frame CPU overhead.
3. **Incorrect outlet placement:** orientation was inferred from box dimensions in a way that left some outlet plates facing the wrong direction or hidden in the wall. Outlets now use each wall's stored orientation and rotate to face the surface.
4. **One-sided baseboards:** the previous baseboard loop only decorated one outer edge. Baseboards are now instanced along both faces of the wall segments.
5. **Lighting was only decorative:** ceiling panels were visible but did not illuminate the surroundings. Added a small number of unshadowed point lights and mild, occasional fixture flicker rather than adding expensive real-time shadows.
6. **Height handling:** the initial compensation moved the whole player rig, so it also shifted virtual controller positions and could affect floor contact. The headset camera now has a dedicated parent offset: the XR frame's viewer pose is normalized to 1.52 m through that camera-only group while the controller groups remain attached to the floor-based player rig. Physical crouching is intentionally normalized out of the virtual view. This requires headset validation, but the transform hierarchy now avoids moving the hands just to adjust eye height.
7. **Silent runtime failures:** added an on-screen message for script errors and unhandled promise rejections so failures are easier to report rather than leaving the game apparently stuck.
8. **Documentation drift:** README previously claimed the monster, ambience and related features did not exist. It now describes actual current features and explicitly lists prototype limitations.
9. **Desktop camera began at floor level:** desktop startup set the camera to Y=0, which would show the scene from the floor. It now starts at 1.52 m, matching the virtual VR eye-height target.
10. **Unused avatar geometry:** an entire player avatar was constructed but always hidden and did not contribute to first-person play. Removed the meshes to save memory and startup work.
11. **Controller pose choice:** movement was reading the controller target-ray pose, which is designed for pointing, rather than the physical grip pose. Switched movement/hand markers to grip-space objects and track connected/disconnected state, preventing a missing controller from being treated as a hand touching the floor. The official Three.js docs distinguish these spaces explicitly.
12. **VR session feature consistency:** floor-height normalization depends on a floor-relative reference space, but the session requested that feature only as optional. It is now requested as required; VR startup fails with an error message instead of proceeding without the floor-space assumption. Removed the unused hand-tracking feature request because the game uses controller grip poses.
13. **VR session lifecycle:** ending the headset session now resets movement, hides the roaming entity, suspends synthesized ambience, and restores the menu. If `renderer.xr.setSession()` fails after a browser session was created, the catch path now ends that partial session and suspends audio.
14. **Warning placard was invisible:** the textured "NO EXIT" face was initially behind its board, and the board floated away from the wall. The board is now mounted on the inside face of the maze boundary with text just in front of it. Boundary-wall outlets are also oriented inward so they do not disappear on the inaccessible outside face.
15. **Ghost hands:** the mobile test hand was created for every mode and could be visible while testing VR/desktop. It is now hidden by default and only shown for the mobile test; proxy controller hands appear on connection and disappear on disconnect.
16. **Input and battery cleanup:** browser focus loss can otherwise leave a movement key held, so blur now clears keys and drift; hidden tabs suspend the synthesized hum and restore it only when active gameplay resumes.
17. **Ceiling scale:** the old 3.2 m wall height made the main rooms too tall for the classic low drop-ceiling look. It is now 2.65 m and the wall-mounted sign was lowered to sit below it; the mobile test's head-clearance clamp uses the same ceiling constant.
18. **Dependency age:** the project still pins Three.js 0.161.0, while npm lists 0.186.1 as the current release (checked 2026-10-22). It was not blindly upgraded: the official migration guide recommends migrating in increments of ten releases, and a multi-release upgrade without a real Quest run would add a new source of runtime risk. The pin is now documented as a follow-up task for a staged, headset-tested update.

19. **Room variation:** a strict grid of corridors lacked the broad, column-supported rooms visible in the source reference imagery. Some 2×2-cell blocks now open into 8 m × 8 m rooms. Each widened room gets a locally textured square support column and plinth, with collision shapes included for locomotion and hand contact.
20. **Static checks expanded:** the deploy-time smoke test now also checks for room widening, support-column collision and the camera-only head-height correction.

21. **Ceiling relief:** the ceiling was previously represented by one textured plane, so its tile grid had no geometric relief. It is now a grid of 7,569 individually instanced 0.598 m acoustic ceiling tiles above a backing plane. The shared mesh keeps the entire grid to one draw call, and fluorescent panels sit slightly below the tile underside so the bright faces stay visible from the room.

22. **Lighting coverage:** the former nine point lights over the 52 m × 52 m scene left much of the environment outside their 10 m radius, while the glowing panels themselves were decorative. Replaced that with a 4 × 4 grid of lower-intensity point lights with a 16 m range. This improves overall coverage without adding dynamic shadows or making every one of the 49 panels a separate light.

23. **Ceiling repetition:** every ceiling tile had previously shared identical pixel noise and tone. Per-instance tinting now adds small, restrained variations across the 7,569 tile instances while retaining the single batched mesh.
24. **Monster sound range:** the original monster spawn was in the diagonally opposite corner, roughly 67 m from the player start and beyond the growl panner's 55 m maximum distance. Its initial corner is now on the far side of the same edge, roughly 47 m away, so the player can hear the low growls faintly before the creature wanders closer.
25. **Spawn orientation:** the player spawn was near two boundary walls but always faced north, which could leave the first view pointed straight into a wall. Reset now checks the guaranteed interior opening and faces north when it is open, otherwise east. A follow-up condition check showed the ternary test was inverted; the yaw condition now matches the wall flag correctly, and CI checks the corrected expression.
26. **Monster movement looked too static:** the creature translated through the maze while its arms and legs held fixed poses. Added restrained counter-swinging limb motion, parented hands to arms and simple feet to legs, so the silhouette reads as a walking creature instead of a sliding prop.
27. **Guaranteed room variation:** room widening used to be entirely random, so a rare layout could contain no widened rooms and therefore no support-column instances. The central 2×2 block is now always widened, and CI asserts every generated maze includes at least one widened room.
28. **Repeated wallpaper seam:** the wallpaper used a diagonal color gradient whose opposite tile edges differed, causing a visible color jump at every repeat. Switched to a uniform aged-paper base so the repeating chevrons do not inherit a large gradient seam.
29. **Carpet microtile repetition:** the carpet texture repeated once every half-metre across the whole floor, making its random pixel/loop pattern too easy to spot. It now repeats every 2 m, preserving the small carpet-grain pattern while reducing the frequency of visible pattern resets.
30. **Floor detail:** reference renders sometimes show a loose wire on the carpet. Added a few thin, locally generated black cable runs inside widened rooms; they are visual-only and intentionally do not snag the approximate locomotion collision.

## Checks run

- Parsed the full module script with a JavaScript syntax check after stripping its single top-level Three.js import: **PASS**.
- Rechecked the complete source after controller-grip, session-failure, sign/outlet, monster gait, room-guarantee and floor-cable changes. The module syntax check passed.
- Verified in the latest committed source that the old 220-mesh floor-speck loop and misoriented random patch code are gone: **PASS**.
- Verified that the source contains procedural wallpaper/carpet/ceiling textures, instanced walls and ceiling tiles, collision-aware wider rooms and support columns, subtle loose floor cables, seam-conscious texture repetition, corrected outlet orientation and spawn yaw, a visible wall-mounted warning sign, the camera-only XR viewer-height correction, grip-space controller locomotion with connection-state guards, session-end and failed-session cleanup, the ambient hum and the animated roaming creature: **PASS**.
- Added a Node-based static smoke check to the Pages workflow. It checks UI/core feature markers and JavaScript syntax, executes 50 randomized maze generations to verify all 169 cells remain connected, and checks that widened rooms stay open and at least one room exists per run. It also checks the monster gait, ceiling tile tinting, lighting and the camera-only height correction. These checks are static/logic tests, not headset simulation.
- **Not testable here:** actual Quest 1/Quest 2 frame rate, controller contact behavior, perceived floor alignment, headset audio volume/spatialization, and visual appearance inside the headset. Static source checks do not substitute for runtime testing.

## Performance and design decisions

- No remote texture downloads were introduced.
- No real-time shadow maps, physics engine, post-processing or large external 3D assets were added.
- Monster movement follows the generated maze's open cell connections; it roams rather than actively pursuing the player.
- Ambient hum and monster noises are synthesized with Web Audio and start after a user gesture to respect browser audio restrictions.
