# ARplusCSS

Educational Android AR app built with **React Native (Expo)** and **ViroReact** (`@reactvision/react-viro`), written in **JavaScript (.js / .jsx)**. Point your camera at a printed motherboard marker; the board appears in AR with tappable hotspots for **CPU**, **RAM**, **24-pin ATX**, **8-pin EPS**, and **GPU (PCIe)** slots. Each hotspot plays an install animation and opens a step-by-step guide.

## Features

- Image tracking (ARCore) using a dedicated motherboard marker image
- Motherboard overlay “pop-in” when the marker is detected
- Clickable AR hotspots with pulse animation when selected
- Per-component install animation in 3D space
- Educational install steps and safety tips

## Requirements

- Node.js **20.19+** and npm (required for Expo SDK 54)
- Android device with **Google Play Services for AR (ARCore)**
- USB debugging enabled for `expo run:android`

> AR does **not** work in Expo Go. You must use a **development build** (`expo run:android`).

## Quick start

```bash
cd /home/rhandon/Projects/ARplusCSS
rm -rf node_modules package-lock.json
npm install
python3 scripts/generate_assets.py   # creates marker + icons if missing
npx expo prebuild --platform android
npx expo run:android
```

## Using the AR lesson

1. Open the app and tap **Start AR lesson**.
2. Print `assets/images/motherboard-marker.jpg` at about **A5 width (21 cm)**.
3. Point the camera at the marker in good lighting.
4. When tracking locks, tap colored hotspots: **CPU**, **RAM**, **24-Pin**, **8-Pin EPS**, **GPU**.
5. Watch the install animation and read the guide sheet. Use **Replay AR animation** to see it again.

## Tuning hotspot alignment

Hotspot positions are defined in `src/ar/hotspots.ts` in meters relative to the marker center. After printing your marker:

1. Update `MOTHERBOARD_MARKER_PHYSICAL_WIDTH_M` in `src/ar/trackingTargets.ts` to your print width in meters.
2. Adjust `position` and `size` in `src/ar/hotspots.ts` so taps line up with the photo.

Validate marker quality with Google’s [Augmented Images evaluator](https://developers.google.com/ar/develop/augmented-images/arcoreimg).

## Project structure

```
src/
  ar/                 # Viro AR scene, tracking, animations
  components/       # HUD and install guide panel
  data/             # Educational copy per slot
  navigation/
  screens/
assets/images/      # motherboard-marker.jpg (AR target)
```

## Replacing the marker

For a real classroom setup, use a high-resolution photo of your **actual** teaching motherboard (flat, even lighting, rich detail). Replace `assets/images/motherboard-marker.jpg` and remeasure `physicalWidth`.

## License

MIT — for educational use.
