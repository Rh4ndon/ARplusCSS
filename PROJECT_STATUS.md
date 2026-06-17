# ARplusCSS — Project Status

Educational Android AR app for PC building and network cabling. Built with React Native (Expo) + ViroReact.

---

## Phase 1 — Foundation & AR Setup

### Motherboard (PC Build)
- [x] Expo + ViroReact project scaffold
- [x] Image target registration (`registerMotherboardTrackingTarget`)
- [x] Motherboard 3D model renders on marker detection
- [x] Marker found/lost handling with pop-in animation
- [x] ARHud with detection status text
- [x] ~~Torch / flashlight~~ — **OPTIONAL** (requires native module; Expo's built-in torch conflicts with AR camera. Custom `ar-torch` module created but hard to integrate — skipping for now)

### Network (RJ45 Cabling)
- [x] Network cabling setup screen (straight-through / crossover choice)
- [x] RJ45 image target registration (`registerRj45TrackingTarget`)
- [x] RJ45 marker detection with pop-in animation
- [x] RJ45 scene state bridge
- [ ] Verify RJ45 marker detection works (needs physical marker print)

---

## Phase 2 — Component / Step Tapping

### Motherboard — Component Installation

| Component | Hotspot | Guide Content | Tap → Install |
|-----------|---------|---------------|---------------|
| CPU | ✅ | ✅ | ✅ |
| CPU Block | ✅ | ✅ | ⬜ |
| RAM | ✅ | ✅ | ⬜ |
| 24-Pin ATX | ✅ | ✅ | ⬜ |
| 4-Pin EPS | ✅ | ✅ | ⬜ |
| GPU (PCIe) | ✅ | ✅ | ⬜ |

- [x] Tap detection via Viro3DObject `onClickState` on motherboard model
- [x] Sequential install prerequisites in bridge
- [x] 3D model popup animation on install
- [x] "Install CPU first" error toast for out-of-order taps
- [ ] Wire CPU Block install (CPU → Block → RAM chain)
- [ ] Wire RAM install
- [ ] Wire 24-Pin ATX install
- [ ] Wire 4-Pin EPS install
- [ ] Wire GPU install
- [ ] Hotspot pulse/breathing visual animation

### Network — Cabling Steps

| Step | Hotspot | Guide Content | Tap → Animation |
|------|---------|---------------|-----------------|
| Strip | ✅ | ✅ | ⬜ |
| Untwist | ✅ | ✅ | ⬜ |
| Order (T568B/A) | ✅ | ✅ | ⬜ |
| Trim | ✅ | ✅ | ⬜ |
| Insert | ✅ | ✅ | ⬜ |
| Crimp | ✅ | ✅ | ⬜ |

- [x] ViroQuad hotspots rendered at step positions with labels
- [x] Wire animation scaffold (`Rj45WireAnimation`)
- [ ] Fix ViroQuad `onClick` (likely broken — same issue as motherboard side)
- [ ] Workaround: switch to Viro3DObject `onClickState` or ViroBox
- [ ] Animate all 6 cabling steps
- [ ] Straight-through vs crossover wire order visualization

---

## Phase 3 — Guide Panel & Education Layer

### Motherboard
- [x] InstallGuidePanel Modal (steps + safety tips)
- [x] "Back to board" / "Replay AR animation" buttons
- [x] HUD status line: "Motherboard detected — tap a slot" / "CPU slot pressed"
- [x] `i` button toggles component description banner
- [x] Descriptions in `componentGuides.js` for all 6 components
- [x] Description auto-opens on slot tap

### Network
- [x] InstallGuidePanel reuses same component for cabling steps
- [ ] Update ARHud to use `description` + `showInfo`/`onToggleInfo` (still uses old `activeSlotLabel`)
- [ ] Add educational descriptions for each cabling step

---

## Phase 4 — Polish & Edge Cases

- [ ] Verify CPU 3D model appears (was corrupt — user fixed cpu.glb)
- [ ] Verify RJ45 marker detection with physical print
- [ ] Component pop-in scale animation on install
- [ ] Hotspot color change / checkmark when installed
- [ ] Handle marker loss during guide session (close gracefully)
- [ ] Remove debug `console.log` statements
- [ ] Loading states for 3D models
- [ ] Graceful error when marker not detected

---

## Phase 5 — Completion & Asset Pipeline

- [ ] Persist installed state across sessions (AsyncStorage)
- [ ] Asset generation script (`scripts/generate_assets.py`)
- [ ] Expo EAS build config (Android)
- [ ] App icon, splash screen
- [ ] Marker replacement guide for classroom use

---

## Key Technical Notes

- **Motherboard tap detection:** Viro3DObject `onClickState` on motherboard model (ViroQuad `onClick` doesn't fire; ViroBox blocked by model bounding box)
- **Motherboard position:** `[-0.01, 0.01, 0]`, scale `[0.25, 0.25, 0.25]`, rotation `[1, 181, 3]`
- **Install order:** CPU → CPU Block → RAM; ATX/4-Pin EPS/GPU require only CPU
- **RJ45 tap detection:** Currently uses ViroQuad `onClick` — likely needs same workaround
- **Cabling wiring types:** Straight-through (T568B both ends) and crossover (T568A ↔ T568B)
- **Torch / flashlight:** **OPTIONAL** — Expo's built-in `Torch` module conflicts with AR camera session (`E_CAMERA_IN_USE`). A custom `ar-torch` native module was created in `modules/ar-torch/` but requires autolinking and dev build. Implementation is difficult — skipping unless needed.
