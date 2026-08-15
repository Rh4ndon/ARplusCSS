# ARplusCSS — Marker verification reference photos

Source photos used **at build time** to precompute the perceptual hashes
(`tools/generateMarkerHashes.js` → `src/data/markerReferences.js`).
These files are NOT bundled into the app and never load at runtime.

## Cameras to use

Shoot each object with **both** phones to cover camera variance:

| device      | role                                  |
|-------------|---------------------------------------|
| Infinix GT 30 Pro | main Android test device — mid/budget tier |
| iPhone SE   | different sensor/color science — adds robustness for users with other phones |

Keep framing consistent with the app's capture screen on **every** shot:
object centered, same rough scale in the frame, well lit. A consistent frame
matters more than the phone brand.

## Layout

```
references/
  motherboard/         6 photos (single arrangement — ASUS P5G41T-M LX3, all front-on)
  rj45/top/            3–4 photos (RJ45 connector, top / contacts-up view, front-on)
  rj45/bottom/         3–4 photos (RJ45 connector, bottom view, front-on)
```

## Naming convention

`<view>-<angle>-<device><n>.jpg` — lowercase, no spaces.

| part     | values                                        |
|----------|-----------------------------------------------|
| view     | `front`, `top`, `bottom`                      |
| angle    | `straight` (only accepted view)               |
| device   | `infinix` or `iphone` (optional)              |
| n        | `a`, `b`, `c` when multiple shots share tags  |

Examples:

- `references/motherboard/front-straight-a.jpg`
- `references/rj45/top/front-straight-iphone.jpg`

> **Straight-only by design.** The app guides users to capture front-on, so
> angled captures are *rejected* and no angled references are needed. The
> brightness/contrast note: brightness isn't a required variant either — the
> verification normalizes it, and overly dark shots are rejected by the quality
> gate.

## Shot plan

**motherboard (6):** all front-on straight —
- 6 shots (vary the device / framing if easy)

**rj45/top (3–4):** all front-on straight —
- 3–4 shots

**rj45/bottom (3–4):** all front-on straight —
- 3–4 shots

## Checklist

- [x] motherboard: 6 photos (all front-on straight) — done
- [ ] rj45/top: 3–4 photos (front-on straight)
- [ ] rj45/bottom: 3–4 photos (front-on straight)
- [ ] All shots: object centered, same scale, well lit, 4:3 frame
- [ ] All shots: object centered, same scale, well lit, 4:3 frame
