# BackroomsGTAG

A lightweight WebXR horror-game prototype inspired by Gorilla Tag locomotion.

## Play
1. Enable GitHub Pages in **Settings → Pages** using the `main` branch and `/(root)`.
2. Open the Pages URL in Meta Quest Browser.
3. Choose **Enter VR**. If VR is unavailable, use **Play Without VR** to test the desktop preview.

## Implemented so far
- WebXR immersive-VR entry using Three.js
- Procedurally generated 13×13 maze with yellow walls, ceiling, floor, basic fog, and simple fluorescent-style light panels
- Basic controller contact/hand-anchor movement prototype
- Fixed virtual head height intended to prevent physical crouching/standing from changing in-game height
- Desktop WASD movement and drag-to-look preview (no mobile joystick yet)
- Basic wall and outer-boundary checks, plus a reset button

## Known limitations
- This is a foundation prototype, not a finished game.
- No monster AI, objectives, multiplayer, jump/launch system, or actual sound/ambient hum is implemented yet.
- Locomotion and collision are approximate and still need hands-on Quest testing; floor/wall contact detection is intentionally simple.
- No custom hand models or hand-tracking gesture controls yet; the current movement uses controller poses.
- Three.js is loaded from jsDelivr, so the page needs an internet connection.
- GitHub Pages must be enabled before the play URL will work.

## Controls
- **VR:** move your tracked controllers against surfaces to push away; either controller can contribute.
- **Desktop:** WASD to move, drag the mouse on the game view to look around. Touchscreen-only movement controls are not implemented yet.
- **Reset:** returns to the starting position.

This project uses Three.js and WebXR. WebXR requires HTTPS and a compatible browser/headset.
