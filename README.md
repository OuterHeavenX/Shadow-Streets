# Shadow Streets

Browser RPG brawler inspired by classic side-scrolling beat-'em-ups.

## Play Now
Launch by opening `index.html` in any modern web browser or via GitHub Pages.

## Controls
| Action | Keyboard | Touch |
|--------|----------|---------|
| Move | WASD / Arrows | Left Joystick |
| Light Attack | Z | B Button |
| Heavy Attack | X | X Button |
| Jump | Space | A Button |
| Interact | Enter | Tap |

## Architecture
- **Pure ES Modules**: No build tools, Webpack, or npm needed.
- **PixiJS 8**: Used for fast WebGL/WebGPU rendering, fetched via CDN.
- **Procedural Graphics**: All sprites and environments are generated in code via `PIXI.Graphics` for a cohesive chunky pixel aesthetic.
- **Web Audio API**: Procedural sound generation for punches, jumps, and UI. No audio files to load.
- **Responsive**: Mobile-first touch controls that seamlessly adapt to desktop keyboards.

## Directory Structure
- `css/` - Stylesheets
- `js/` - Source code
  - `core/` - Engine, loop, input, rendering
  - `entities/` - Player, enemies, NPCs, boss
  - `world/` - District generation, parallax scrolling
  - `combat/` - Hit detection, combos
  - `ui/` - Touch controls, HUD, dialogue
- `data/` - Static configurations for enemies, districts