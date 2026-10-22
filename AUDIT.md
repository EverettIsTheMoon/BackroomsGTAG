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
6. **Height handling:** VR eye height is normalized against the XR frame's viewer pose in the animation callback. The target is 1.52 m, slightly lower than the previous 1.58 m. This makes vertical head movements intentionally invisible in-game; it cannot be judged conclusively without testing on the target headset.
7. **Silent runtime failures:** added an on-screen message for script errors and unhandled promise rejections so failures are easier to report rather than leaving the game apparently stuck.
8. **Documentation drift:** README previously claimed the monster, ambience and related features did not exist. It now describes actual current features and explicitly lists prototype limitations.

## Checks run

- Parsed the full module script with a JavaScript syntax check after stripping its single top-level Three.js import: **PASS**.
- Verified in the latest committed source that the old 220-mesh floor-speck loop and misoriented random patch code are gone: **PASS**.
- Verified that the source contains procedural wallpaper/carpet/ceiling textures, instanced wall and light meshes, corrected outlet orientation, the XR viewer-pose height correction, the ambient hum and the roaming creature: **PASS**.
- Confirmed the GitHub Pages workflow succeeded for the earlier game/monster commit. The newest visual and error-overlay commits still need their own workflow runs to finish.
- **Not testable here:** actual Quest 1/Quest 2 frame rate, controller contact behavior, perceived floor alignment, headset audio volume/spatialization, and visual appearance inside the headset. Static source checks do not substitute for runtime testing.

## Performance and design decisions

- No remote texture downloads were introduced.
- No real-time shadow maps, physics engine, post-processing or large external 3D assets were added.
- Monster movement follows the generated maze's open cell connections; it roams rather than actively pursuing the player.
- Ambient hum and monster noises are synthesized with Web Audio and start after a user gesture to respect browser audio restrictions.
