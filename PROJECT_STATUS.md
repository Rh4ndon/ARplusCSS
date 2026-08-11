# ARplusCSS — Project Status

Educational Android AR app for PC building and network cabling. Built with React Native (Expo) + ViroReact.

---

## Phase 1 — Foundation & AR Setup

### Capture-based image tracking (both lessons)
- [x] `MarkerCaptureScreen` — camera capture screen used by both lessons (`type: motherboard` | `rj45`)
- [x] Captured image becomes the AR tracking target (no printed markers)
- [x] Motherboard target registration (`registerMotherboardTrackingTarget`)
- [x] RJ45 target registration (`registerRj45TrackingTarget`)
- [x] Motherboard 3D model renders on marker detection
- [x] RJ45 3D ends render on marker detection (was plane-based; converted to `ViroARImageMarker`)
- [x] Marker found/lost handling with pop-in + ARHud status
- [x] **Stale-marker bug fix** — re-capturing a marker after Exit kept the old image cached. Fixed with **per-capture unique target names + unique filenames**, and marker files reset when returning to the Network Cabling screen. Confirmed working on device.

### Network (RJ45 Cabling)
- [x] Network cabling setup screen (straight-through / crossover choice) → routes through MarkerCapture
- [x] T568A/T568B wire-color challenge panel (gates Insert/Crimp steps)
- [x] Straight-through vs crossover wire order handling
- [x] RJ45 scene state bridge

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

- [x] Tap detection via `onClickState` on the motherboard model
- [x] Sequential install prerequisites ("Install CPU first" guard)
- [ ] Wire remaining component installs (CPU Block → RAM → ATX → EPS → GPU)

### Network — Cabling Steps

| Step | Guide Content | Tap → Animation |
|------|---------------|-----------------|
| Strip | ✅ | ⬜ |
| Untwist | ✅ | ⬜ |
| Order (T568B/A) | ✅ | ✅ (wire arrangement challenge) |
| Trim | ✅ | ⬜ |
| Insert | ✅ | ✅ (`Rj45InsertionAnimation`) |
| Crimp | ✅ | ⬜ |

- [ ] Wire remaining 5 cabling step animations

---

## Phase 3 — Guide Panel & Education Layer

### Motherboard
- [x] `InstallGuidePanel` (steps + safety tips, replay animation)
- [x] Descriptions in `componentGuides.js` for all 6 components
- [x] HUD status line + info toggle

### Network
- [x] `InstallGuidePanel` reused for cabling steps
- [x] `Rj45WireArrangementPanel` (wire colors challenge with completion gating)
- [ ] Educational descriptions per cabling step (uses guide panel already)
- [ ] ARHud still uses old `activeSlotLabel` on the network side — migrate to `description` + `showInfo`

---

## Phase 4 — Polish & Edge Cases

- [x] RJ45 capture → tracker flow verified on device
- [x] Stale-marker reset on Network Cabling entry / AR exit
- [ ] Remove debug `console.log` statements
- [ ] Loading states for 3D models
- [ ] Graceful handling when marker not detected for a long time

---

## Phase 5 — Distribution & Verification (active)

- [x] Web landing page (`web/index.html`) — APK download placeholder + user manual
- [x] User manual PDF (`docs/ARplusCSS_User_Manual.pdf`, copied to `web/`)
- [x] Release APK build pipeline (`cd android && ./gradlew assembleRelease -x lint -q`)
- [x] `references/` folder created for marker-verification photos (+ shot-plan README)
- [x] Reference photos collected: **motherboard (6)**, **RJ45 top (4)**, **RJ45 bottom (4)** — across Infinix GT 30 Pro + iPhone SE
- [ ] **Marker verification (pHash)** — visual similarity check + quality gate at capture confirm (hard-block / soft-warn), calibrated across device tiers
- [ ] `tools/generateMarkerHashes.js` — build-time hash generation from `references/`
- [ ] Persist installed state across sessions (AsyncStorage)
- [ ] Expo EAS build config (optional)

---

## Key Technical Notes

- **Tracking targets are per-capture:** `src/ar/trackingTargets.js` registers each captured marker under a unique name (e.g. `rj45-<timestamp>`) and deletes the previous RJ45 target when a new one is registered. Same-name + same-path registration does **not** reload the image in the native tracker — hence unique names + unique filenames.
- **Marker reset:** `NetworkCablingSetupScreen` and `ARNetworkScreen` call `deleteMarkerImages('rj45')` so a new capture is always fresh.
- **Marker storage:** `src/utils/markerStorage.js` saves to `markers/<type>-<id>.jpg`; config saved to `markers/config.json`.
- **RJ45 marker verification (plan):** pipeline = resize 128×128 → grayscale → histogram stretch → de-noise → center-crop to the port → dHash vs reference set (min Hamming distance); two tiers (soft-warn for motherboard, hard-block for RJ45); quality gate (blur/darkness/texture) reuses the same pass. References are build-time-only, shipped as hashes in `src/data/markerReferences.js` (NOT bundled as photos).
- **Motherboard tap detection:** `onClickState` on the motherboard model (ViroQuad `onClick` doesn't fire; ViroBox blocked by model bounds).
- **Motherboard position:** `[-0.01, 0.01, 0]`, scale `[0.25, 0.25, 0.25]`, rotation `[1, 181, 3]`.
- **Install order:** CPU → CPU Block → RAM; ATX/4-Pin EPS/GPU require only CPU.
- **Cabling wiring types:** Straight-through (T568B both ends) and crossover (T568A ↔ T568B).
- **Torch / flashlight:** **OPTIONAL** — Expo's built-in `Torch` module conflicts with the AR camera session. Skipping unless needed.
