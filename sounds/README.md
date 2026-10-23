# Optional game sound effects

Drop your MP3 files into this folder using these exact filenames. The game loads them automatically; files are optional, so missing audio does not stop the game.

| Filename | Used for |
|---|---|
| `ambience.mp3` | General Backrooms ambience; loops while playing |
| `monster-ambience.mp3` | Monster nearby; fades with distance and loops |
| `chase.mp3` | Chase tension when the monster is close; loops |
| `jumpscare.mp3` | Plays when the monster gets very close (with a cooldown) |
| `monster-growl.mp3` | Extra growl layered with the close-range scare |
| `footsteps.mp3` | Footstep sounds while moving on the ground |
| `jump.mp3` | Jump / floor push-off |
| `landing.mp3` | Landing back on the floor |
| `wall-hit.mp3` | Contact / push against a wall in VR |

## Notes
- Use short MP3s for one-shot effects (footsteps, jump, landing, wall-hit, jumpscare, growl).
- Use seamless or slowly changing loops for ambience and chase.
- Keep ambience files reasonably compressed for Quest; mono is fine for non-spatial loops.
- The browser may only begin playback after the player presses Start or Enter VR.
- No audio files are included by default; add your own MP3s with the names above.
