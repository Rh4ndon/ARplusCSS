# ARplusCSS

Educational Android AR app built with **React Native (Expo)** and **ViroReact** (`@reactvision/react-viro`), written in **JavaScript (.js / .jsx)**. Instead of printed markers, the app uses **image tracking of a device you already own**: point the camera at your **motherboard** or an **RJ45 port**, capture it, and that image becomes the AR tracking target.

## Lessons

- **Hardware — Motherboard assembly:** capture your motherboard, then place **CPU**, **RAM**, **24-pin ATX**, **8-pin EPS**, and **GPU (PCIe)** on hotspots overlaid on your real board. Each hotspot has an install guide.
- **Network — RJ45 crimping:** capture an RJ45 port, choose **straight-through** or **crossover**, then practice **strip → untwist → wire order → trim → insert → crimp** on both ends. Includes a T568A/T568B wire-color challenge.

## Features

- Capture-based image tracking (ARCore) for both lessons — no printed markers
- Per-capture tracking targets (each capture gets a unique target name so re-capturing a new marker always loads the new image)
- Marker reset when returning to the Network Cabling screen
- Tappable AR hotspots with install guides and safety tips
- 3D insertion / wire-layout animations
- User manual (PDF) + web landing page for APK distribution

## Requirements

- Node.js **20.19+** and npm (Expo SDK 54)
- Android device with **Google Play Services for AR (ARCore)**
- USB debugging enabled for `expo run:android`

> AR does **not** work in Expo Go. You must use a **development build** or the release APK.

## Quick start (dev)

```bash
cd /home/rhandon/Projects/ARplusCSS
rm -rf node_modules package-lock.json
npm install
npx expo prebuild --platform android
npx expo run:android
```

## Build the release APK

```bash
cd android
./gradlew assembleRelease -x lint -q
adb install -r app/build/outputs/apk/release/app-release.apk
```

The release APK lives at `android/app/build/outputs/apk/release/app-release.apk`.

## Using the app

1. **Hardware lesson:** Home → Hardware → capture your motherboard (fill the frame) → track it, then tap hotspots: **CPU**, **RAM**, **24-Pin**, **8-Pin EPS**, **GPU**.
2. **Network lesson:** Home → Network Cabling → choose **Straight-Through** or **Crossover** → capture an RJ45 port (centered in the small frame) → track it, then follow the six cabling steps.

Capture tips are shown in-app: keep the marker well lit, centered, and stable for reliable tracking.

## Project structure

```
src/
  ar/                    # Viro AR scenes, tracking, animations
    rj45/                # RJ45 lesson (scene, bridge, insertion/wire animations)
    ARMotherboardScene.jsx
    MotherboardARSceneInner.jsx
    trackingTargets.js   # per-name image target registration
  components/            # ARHud, InstallGuidePanel, etc.
  data/                  # Educational copy (cabling + component guides)
  navigation/
  screens/               # Home, Option, MarkerCapture, AR, Network setup, etc.
  utils/
    markerStorage.js     # saves captured marker images + config
references/              # BUILD-TIME reference photos for marker verification (see references/README.md)
web/                     # static landing page + user manual (APK download)
docs/                    # user manual source (PDF)
assets/images/           # bundled fallback marker images
scripts/                 # asset + user-manual generation
```

## Marker verification (planned)

Users could capture anything as a tracking marker. To enforce content, a **visual similarity check** (perceptual hash + quality gate) will run at capture confirm time, comparing the shot against the reference photos in `references/`. See `references/README.md` for the collection plan and `PROJECT_STATUS.md` for status.

## License

MIT — for educational use.
