# BackroomsGTAG

A lightweight WebXR liminal-horror prototype built with Three.js, designed with standalone VR performance in mind.

## Play

- **Meta Quest:** Open the GitHub Pages link in Quest Browser and select **Enter VR**.
- **Desktop:** Select **Play / Mobile Test** on a desktop browser, then use **WASD** and drag the mouse to look around.
- **Mobile test:** Touch and swipe to move the test hand; a fast downward swipe at floor level tests the launch mechanic.

The site deploys through GitHub Actions from the main branch; that workflow runs a static HTML/JavaScript smoke check before deployment. The page needs an internet connection to load Three.js from jsDelivr.

## Current features

- Procedurally generated 13×13 connected maze with occasional wider 8 m × 8 m rooms and collision-aware wallpapered support columns.
- Procedural, locally generated wallpaper, carpet, ceiling-tile and damp-stain textures; no external texture-image downloads.
- Instanced walls, baseboards, ceiling fixtures, grime decals, carpet marks, room-support columns and outlet parts to reduce draw calls.
- Subtle ceiling lights with occasional flicker and synthesized low electrical hum.
- A roaming low-poly creature that follows open maze connections, with occasional spatialized growls that get quieter with distance.
- WebXR controller push locomotion using the physical controller grip pose (disconnected controllers are ignored), desktop WASD/mouse preview, mobile hand-swipe test, and a reset button.
- VR and desktop eye-height targets are **1.52 metres**; VR uses the XR frame's viewer pose in the required `local-floor` reference space. The VR height offset is applied to the headset camera only, leaving hand/controller positions at their tracked height. Ending a VR session returns to the menu and pauses ambience.
- Runtime errors and unhandled promise rejections are surfaced in the on-screen hint area.

## Known limitations

- This remains a prototype, not a finished horror game. The creature wanders but does not yet chase, damage, or catch the player.
- The monster and ambient sounds are synthesized in Web Audio; they are not recorded sound assets.
- Hand-contact locomotion and wall collision are approximate, and need a real Quest headset test. There is no multiplayer yet.
- Height normalization intentionally compensates for physical crouching/standing, so natural vertical crouching is not represented in the virtual world.
- The project uses Three.js from jsDelivr, so it requires a network connection on first load and for refreshes.

## Controls

- **VR:** Push tracked controllers against a wall or the floor to move; either controller can contribute.
- **Desktop:** WASD to move and drag the mouse over the game view to look around.
- **Reset:** Return to the starting position.

This project uses Three.js and WebXR. WebXR requires HTTPS and a compatible browser/headset.
