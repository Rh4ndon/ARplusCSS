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
  motherboard/         6 photos (single arrangement — ASUS P5G41T-M LX3)
  rj45/top/            4 photos (RJ45 connector, top / contacts-up view)
  rj45/bottom/         4 photos (RJ45 connector, bottom view)
```

## Naming convention

`<view>-<lighting>-<angle>-<device><n>.jpg` — lowercase, no spaces.

| part     | values                                        |
|----------|-----------------------------------------------|
| view     | `front`, `top`, `bottom`, `angled`            |
| lighting | `bright`, `normal`, `dim`                     |
| angle    | `straight`, `left`, `right`                   |
| device   | `infinix` or `iphone`                         |
| n        | `a`, `b`, `c` when multiple shots share tags  |

Examples:

- `references/motherboard/front-bright-straight-infinix.jpg`
- `references/motherboard/angled-left-b-iphone.jpg`
- `references/rj45/top/front-normal-straight-infinix.jpg`
- `references/rj45/top/angled-right-a-iphone.jpg`
- `references/rj45/bottom/front-dim-straight-infinix.jpg`

## Shot plan

**motherboard (6):** 3 with Infinix, 3 with iPhone —
- 1 front-on bright
- 1 front-on dim
- 1 angled (~20–30°) — pick left *or* right and vary the device

**rj45/top (4):** 2 with Infinix, 2 with iPhone —
- 1 front-on bright
- 1 front-on dim (or angled if lighting is hard)

**rj45/bottom (4):** 2 with Infinix, 2 with iPhone —
- 1 front-on bright
- 1 front-on dim (or angled if lighting is hard)

## Checklist

- [ ] motherboard: 6 photos (3 Infinix + 3 iPhone: bright, dim, angled)
- [ ] rj45/top: 4 photos (2 Infinix + 2 iPhone)
- [ ] rj45/bottom: 4 photos (2 Infinix + 2 iPhone)
- [ ] All shots: object centered, same scale, well lit, 4:3 frame
