# `/mind`: "A deep dive into Ali's mind"

> **Status: on hold until Phase 5** (the user's decision, 4 Oct 2026). Don't work on it unless asked. It's left in a clean, working state.

## What it is

A first-person walk through Ali's retro, well-kept house on a rainy night. The rooms hold his work and story:
- His projects are on the laptop.
- His journal is on the bookshelf.
- His milestones are on plaques.
- His contact details are by the phone.

You never see Ali directly. He appears in mirrors, and waves at you.

**Controls (desktop):**
- **Move:** W/A/S/D (or the arrow keys); hold Shift to run.
- **Look:** the mouse, through pointer lock.
- **Interact:** E or click.
- **While inspecting:** A/D flips through items; E, Esc, S or Backspace goes back.
- **Sound:** M turns it on or off.
- **Pause menu:** Esc opens it, with Resume, Sound, Mouse sensitivity and Back to the site.

**Controls (touch):**
- **Move:** the left-thumb joystick.
- **Look:** swipe on the right side of the screen.
- **Interact:** tap the prompts.
- **Stand up:** tap the "Comfortable…" pill.

## How it got here (so you don't repeat rejected ideas)

1. **A cute dollhouse:** rejected.
2. **A vintage hotel reception with drag-to-look:** rejected. Dragging caused bugs, so use pointer lock.
3. **A retro home in third person:** criticised for stutter, flicker, see-through sleeves and a "very very bad" character.
4. **First person, with Ali only in mirrors:** the current approach.
5. **Sound** was "annoying", so it's now **opt-in and soft**.
6. **An AI-generated realistic Ali** (Higgsfield → Meshy, 46 credits) was tried, then **dropped**: the user wanted stylized. The model file was deleted. The original GLB is still on the user's Higgsfield account (job `847df6dd-cb91-4ee4-9563-c7890bbee1fc`).
7. **The stylized Ali is hand-built in code** (the free option the user chose).
8. **"fps is low and very stuttery":** a performance pass made rendering 3–4× cheaper (numbers below).
9. **"Not a fan, lacks character and buggy":** a plan for lighting, exploration and character was drafted, then the user paused `/mind` and put the website first.

## Files (`src/components/mind/`)

| File | Role |
|---|---|
| `MindExperience.tsx` | The page shell: welcome screen, HUD (room name, crosshair and prompt, toasts, inspect cards, joystick), pause menu, keyboard and pointer-lock handling, `interact()` for every spot, `inspectCard()` (card text), mode state. Loads `Scene` with `next/dynamic` (`ssr: false`) |
| `Scene.tsx` | `<Canvas>`: lights (hemisphere and Environment lightformers), `PerformanceMonitor` (resolution 1.25, rising to 1.5 or dropping to 1; falls back to a low mode without AO or MSAA), post-processing (N8AO "performance", selection Outline, Bloom, ACES tone mapping, Vignette, Noise; MSAA 2), `BakeShadows`, `Preload all` |
| `Home.tsx` | `HomeShell`: walls (per-room wallpaper), floors (parquet or tiles), ceiling and moulding, door casings, `Window` (night sky and rain), `Pendant`, `Rug`, `ClockHands`, front door. Holds the **hall**: phone, round mirror, diploma, prints, coat stand, umbrella stand, shoe bench, grandfather clock |
| `Rooms.tsx` | The other four rooms. **Study:** desk and laptop, banker lamp, chair, bookshelves, plaques, globe, reading nook, cheval mirror, plants. **Living room:** fireplace with flames, sofa, coffee table, armchair, CRT TV, sideboard with record player, lamps. **Kitchen:** counter, stove, sink, fridge notes, table, kettle with steam. **Bedroom:** bed, nightstands, wardrobe, full-length mirror, corkboard, sleeping cat. Also exports the `RoomSignals` type |
| `Player.tsx` | First-person controller:<br>• Speed and feel: walk 2.2, run 4.4, acceleration 11, friction 13, head bob and roll, a field-of-view kick when sprinting.<br>• Frame time is capped at 1/12 s, with collision sub-steps.<br>• Camera moves for seated and inspect views.<br>• Targeting by view angle (which spot is under the crosshair).<br>• Poses Ali's body each frame: walk, sit, head follow, the **wave**.<br>• Footsteps and audio levels. |
| `Ali.tsx` | The **stylized Ali**: soft lathe and capsule shapes hung on named `<bone>`s: `Hips`, `Spine`, `Chest`, `UpperChest`, `Neck`, `Head`, `Left/RightShoulder`, `Arm`, `ForeArm`, `Hand`, `UpLeg`, `Leg`, `Foot`. Round gold glasses, a full beard and grin, a faded haircut, a white polo, light jeans, a watch on the left wrist. He blinks every few seconds. Every part is on `BODY_LAYER` |
| `rig.ts` | `Rig`: finds joints by name (works for Mixamo, Meshy or our own names), stores the rest pose on `bone.userData`, and applies **model-space** rotations. Model space: X is his left, Y is up, Z is forward. It also relaxes an A-pose or T-pose and offsets the hips |
| `Mirror.tsx` | A real mirror: a three.js `Reflector` whose reflection camera also renders `BODY_LAYER`, so Ali shows up. The texture is 512 px wide and the reflection is **only live within 5 m**; beyond that a glossy glass stand-in shows. `BODY_LAYER = 1`, which the main camera doesn't render |
| `world.ts` | The single source of layout data:<br>• House size (`HOUSE`), `EYE` height 1.64, `START`.<br>• `ROOMS` and `roomAt()`, `WALLS` and `DOORWAYS`.<br>• Furniture anchors: `HALL`, `STUDY`, `LIVING`, `KITCHEN`, `BEDROOM`.<br>• Colliders (`BOXES` and `resolve()`).<br>• The interactions: `SpotId` and `SPOTS`.<br>• `PLAQUES` text, `MIRRORS`.<br>• Groundwork: `IDEAS` and `WINDOWS`. |
| `store.ts` | Tiny external stores read with `useSyncExternalStore`: `targetStore` (what's under the crosshair), `focusStore` (what's being inspected), and `questStore` (groundwork, unused) |
| `input.ts` | The shared `input` object: keys, joystick, yaw/pitch, sensitivity, `enabled`. Also `bindKeyboard()`, `moveIntent()`, and `look()`, which ignores mouse spikes over 300 px |
| `audio.ts` | `houseAudio`: synthesised Web Audio, no files. Rain, a fire that gets louder as you near it, a clock tick, footsteps that change by floor type, record music, the kettle ding. **Muted by default**; the choice is remembered in `localStorage["mind-sound"]` |
| `textures.ts` | Procedural canvas textures: parquet, tiles, wallpaper (`wall(style)`), wood, rugs, book spines, plaques, paper notes, night sky, TV screen, clock face, `screenshot(src)` (through `/_next/image`, w=1080, q=75) |
| `kit.tsx` | Shared materials (`mats()`), mesh helpers (`Mesh`, `Box`, `Cyl`, `Ball`), `Hi` (outlines what's under the crosshair), `Plant` (instanced curved leaves), `ShadeLamp`, `Candle` |

## The house layout (`world.ts`)

- **Size:** the house spans x −9…9 and z −7…7 (metres), with ceilings 3 m high.
- **The hall** runs down the middle (x −2…2, full depth). The front door is at z = +7, and you start at `(0, 4.6)` looking toward −z.
- **Doorways** sit at x = ±2, z = ±3.5.

| Room | x | z | Floor |
|---|---|---|---|
| Study | −9…−2 | −7…0 | wood |
| Living room | −9…−2 | 0…7 | wood |
| Kitchen | 2…9 | 0…7 | tile |
| Bedroom | 2…9 | −7…0 | wood |

## Interactions (`SPOTS`)

| Spot | Room | Kind | What happens |
|---|---|---|---|
| `phone` | Hall | inspect | Contact card (Meet, email, WhatsApp, LinkedIn) |
| `hallMirror` | Hall | inspect | "That's him." card. Ali waves |
| `diploma` | Hall | inspect | The journey (translator → builder → PM) |
| `clock` | Hall | inspect | The live time, and his working hours |
| `desk` | Study | seat | You sit at the desk (toast). You can look left into the cheval mirror |
| `laptop` | Study (only while sitting at the desk) | inspect | Browse the 7 projects with A/D (real screenshots), with a case-study link. Closing it leaves you seated |
| `shelves` | Study | inspect | The latest journal posts, as links |
| `plaques` | Study | inspect | An overview, then each of the 6 milestone plaques up close |
| `globe` | Study | action | Spins the globe (toast) |
| `fire` | Living | action | Toast with Ali's principles |
| `sofa`, `armchair` | Living | seat | Sit down |
| `tv` | Living | inspect | "Messy in. Clear out." card, linking to `/#process` |
| `record` | Living | action | Toggles the record player's music |
| `kettle` | Kitchen | action | Ding and steam (toast) |
| `fridge` | Kitchen | inspect | The working-style notes |
| `bed` | Bedroom | seat | "Offline at night." toast |
| `board` | Bedroom | inspect | Corkboard goals, linking to contact |
| `bedMirror` | Bedroom | inspect | "That's him." card. Ali waves |

**Modes** (`Player.Mode`):
- **`walk`**
- **`seat`** (`spot`)
- **`inspect`** (`spot`, `view`): the camera eases to a preset view, the cursor unlocks, and the card shows.

A spot with `seatedAt` (the laptop) can only be targeted while you're sitting on that seat.

**The wave:** Ali waves the first time you look square-on into each mirror (within 4.5 m), and every time you inspect the hall or bedroom mirror. It lasts about 2.7 s, with the right arm and a small head tilt.

## Rendering and performance rules

Every pixel pays for every light, so these rules matter:

- **Lights:**
  - There are 11 point lights, and 5 cast shadows: the hall pendant, the study's green pendant, the fire, the kitchen pendant and the bedroom pendant.
  - Pendants reach only **6.5 m**, so a light only costs in its own room.
  - Shadows are **baked once** (`BakeShadows`).
  - **Don't add lights for glow.** Use emissive materials and let bloom do it.
- **No `transmission` materials.** One transmissive object on screen makes three.js render the whole scene a second time.
- **No clearcoat or sheen** on big surfaces (walls, floors, wood, rugs); use `MeshStandardMaterial`. Small velvet or ceramic pieces are fine.
- **Mirrors** are 512 px and only live within 5 m. A reflection is a full extra render of the house.
- **Plants** are instanced (2 draw calls per plant). Avoid z-fighting: never put two surfaces at the same height (the old soil-and-pot flicker).
- **Resolution:** the device pixel ratio starts at 1.25 and moves between 1 and 1.5 with `PerformanceMonitor`. MSAA is ×2 and AO runs at half resolution on the "performance" setting.

**Performance pass, 4 Oct.** Scene-only render time per frame at the same resolution (pixel ratio 1.75):

| Room | Before | After |
|---|---|---|
| Hall | 17.3 ms | 4.0 ms |
| Study | 11.9 ms | 2.3 ms |
| Living room | 6.5 ms | 2.8 ms |
| Kitchen | 5.7 ms | 2.3 ms |

**Benchmark** (in development, in the page console, once the scene has loaded):

```js
window.__bench = async () => { const gl=__gl, ctx=gl.getContext(), cam=__cam, px=new Uint8Array(4);
  const views={ hall:[[0.4,1.64,5.6],[0,1.6,0]], study:[[-3.2,1.64,-1.2],[-6.5,1,-6]], living:[[-3.2,1.64,6.2],[-6.5,0.8,1]],
                kitchen:[[3,1.64,6.3],[7.5,1,2]], bedroom:[[3,1.64,-0.8],[7,1,-5.5]] }; const res={};
  for (const [k,[p,l]] of Object.entries(views)) { cam.position.set(...p); cam.lookAt(...l); cam.updateMatrixWorld();
    for (let i=0;i<3;i++){ gl.render(__scene,cam); ctx.readPixels(0,0,1,1,ctx.RGBA,ctx.UNSIGNED_BYTE,px); }
    const t0=performance.now(); for (let i=0;i<8;i++){ gl.render(__scene,cam); ctx.readPixels(0,0,1,1,ctx.RGBA,ctx.UNSIGNED_BYTE,px); }
    res[k]=+((performance.now()-t0)/8).toFixed(1); } return res; };
await __bench()
```

## Testing it

- **Skip pointer lock:** open **`/mind?nolock`** in development. Automated browsers can't pointer-lock, so this stops the pause menu taking over.
- **Development hooks on `window`:**

  | Hook | What it is |
  |---|---|
  | `__ali` | Player state: `pos`, `vel`, `heading`, `sit`, `room`, `waveAt`, `waved` … |
  | `__input` | `keys` (a Set), `yaw`, `pitch`, `joy`, `sensitivity`, `enabled` |
  | `__rig` | The `Rig`: `j` joints, `hipsY`, `thighDrop` |
  | `__gl`, `__scene`, `__cam` | The renderer, scene and camera |

- **Teleport and look:** `__ali.pos.set(x,0,z); __input.yaw = …; __input.pitch = …`. Yaw 0 looks toward −z, and +π/2 looks toward −x.
- **Press a key:** `dispatchEvent(new KeyboardEvent('keydown',{key:'e'}))`.
- **Hidden preview pane:** it runs at about 3 fps. Allow seconds, not frames, before reading state or taking a screenshot.
- **Mirror views to check Ali:**
  - Bedroom mirror: stand at `(2.75, -1.35)` with yaw π/2.
  - Hall mirror: inspect it (`(-0.95, 1.2)`, yaw π/2, then E).
  - Study mirror: sit at the desk, then set yaw to about 1.25.

## Groundwork for Phase 5

| Piece | Where | Status |
|---|---|---|
| **The scattered-ideas hunt.** Six crumpled notes are hidden around the house; each is a messy client idea (`IDEAS[i].messy`). Sorting them pins each onto the plaque of the real project it became (`IDEAS[i].plaque`), ending on a call to action. This is the "character" and purpose the user found missing | `IDEAS` in `world.ts` (positions, stand points, text); `questStore` in `store.ts` | Data only. Note meshes, pickup spots, the "Sort the ideas" flow and the ending still need building |
| **Moonlight:** window light patches on the floor, soft light shafts, dust in the air, haze, an occasional lightning flash with a thunder rumble | `WINDOWS` in `world.ts` | Data only |
| **Character:** Ali narrates a line when you enter each room; you can pet the cat (purr, toast) | — | Not started |
| **A polish pass on the stylized Ali** | `Ali.tsx` | The base is done |
| **A playtest pass and touch QA** | — | The user called it "buggy" without saying how. Ask them for details |
| **The game-engine skill** | `~/.claude/skills/game-engine` | Vetted and installed for this phase |

## Known issues

- The console warns "Outline requires `<EffectComposer autoClear={false}>`". It's harmless, but tidy it up.
- Touch controls haven't been tested on a real phone. Mobile performance is unknown.
- The home page's Mind teaser still says "Soon / on its way".
- Old file versions are in `%TEMP%\mind-backup\` (temporary): `Ali.procedural.tsx` (the old realistic try), `Ali.meshy.tsx` (the AI-model loader), `Player.procedural.tsx` and earlier copies.
