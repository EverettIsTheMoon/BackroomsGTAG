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
16. **Dependency age:** the project still pins Three.js 0.161.0, while npm lists 0.186.1 as the current release (checked 2026-10-22). It was not blindly upgraded: the official migration guide recommends migrating in increments of ten releases, and a multi-release upgrade without a real Quest run would add a new source of runtime risk. The pin is now documented as a follow-up task for a staged, headset-tested update.

## Checks run

- Parsed the full module script with a JavaScript syntax check after stripping its single top-level Three.js import: **PASS**.
- Rechecked the complete final source after controller-grip, session-failure, sign and outlet changes. The module syntax check passed.
- Verified in the latest committed source that the old 220-mesh floor-speck loop and misoriented random patch code are gone: **PASS**.
- Verified that the source contains procedural wallpaper/carpet/ceiling textures, instanced wall and light meshes, corrected outlet orientation, a visible wall-mounted warning sign, the XR viewer-pose height correction, grip-space controller locomotion with connection-state guards, session-end and failed-session cleanup, the ambient hum and the roaming creature: **PASS**.
- Added a Node-based static smoke check to the Pages workflow. Every deployment checks for the required UI, core feature markers and valid module syntax before uploading the site. The latest run status should be checked in the repository Actions tab; these checks do not simulate a headset.
- **Not testable here:** actual Quest 1/Quest 2 frame rate, controller contact behavior, perceived floor alignment, headset audio volume/spatialization, and visual appearance inside the headset. Static source checks do not substitute for runtime testing.

## Performance and design decisions

- No remote texture downloads were introduced.
- No real-time shadow maps, physics engine, post-processing or large external 3D assets were added.
- Monster movement follows the generated maze's open cell connections; it roams rather than actively pursuing the player.
- Ambient hum and monster noises are synthesized with Web Audio and start after a user gesture to respect browser audio restrictions.
