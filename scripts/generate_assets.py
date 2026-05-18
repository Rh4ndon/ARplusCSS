#!/usr/bin/env python3
"""Generate AR tracking marker and placeholder Expo assets."""

from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
IMAGES = ASSETS / "images"


def draw_motherboard_marker() -> None:
    """AR-friendly marker: high contrast, asymmetric layout, no glossy blank areas."""
    w, h = 1024, 768
    img = Image.new("RGB", (w, h), "#e8eef5")
    draw = ImageDraw.Draw(img)

    # PCB base
    draw.rounded_rectangle((80, 120, 944, 648), radius=24, fill="#1a4d2e", outline="#0f172a", width=6)

    # CPU socket
    draw.rectangle((380, 220, 520, 360), fill="#334155", outline="#f8fafc", width=4)
    draw.polygon([(450, 240), (470, 280), (430, 280)], fill="#fbbf24")

    # RAM slots (asymmetric count helps tracking)
    for i, x in enumerate((560, 610, 700, 750)):
        draw.rectangle((x, 210, x + 28, 390), fill="#0ea5e9" if i % 2 == 0 else "#0284c7")

    # 24-pin ATX block
    draw.rectangle((120, 180, 200, 420), fill="#facc15", outline="#0f172a", width=3)

    # 8-pin EPS
    draw.rectangle((240, 150, 310, 210), fill="#a78bfa", outline="#0f172a", width=3)

    # PCIe GPU slot
    draw.rectangle((300, 500, 700, 560), fill="#f97316", outline="#0f172a", width=4)

    # Branding corner (asymmetry)
    draw.ellipse((860, 140, 930, 210), fill="#ef4444")
    draw.rectangle((100, 560, 220, 620), fill="#22c55e")

    draw.text((120, 60), "ARplusCSS Motherboard Marker", fill="#0f172a")
    draw.text((120, 90), "Print at A5 (~21 cm width) for best tracking", fill="#475569")

    IMAGES.mkdir(parents=True, exist_ok=True)
    out = IMAGES / "motherboard-marker.jpg"
    img.save(out, "JPEG", quality=92)
    print(f"Wrote {out}")


def solid_icon(path: Path, size: int, fg: str, bg: str, label: str) -> None:
    img = Image.new("RGB", (size, size), bg)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((size * 0.15, size * 0.15, size * 0.85, size * 0.85), 28, fill=fg)
    draw.text((size * 0.22, size * 0.38), label, fill=bg)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    print(f"Wrote {path}")


def main() -> None:
    draw_motherboard_marker()
    solid_icon(ASSETS / "icon.png", 1024, "#3b82f6", "#0a0e17", "AR+")
    solid_icon(ASSETS / "adaptive-icon.png", 1024, "#3b82f6", "#0a0e17", "AR+")
    splash = Image.new("RGB", (1284, 2778), "#0a0e17")
    d = ImageDraw.Draw(splash)
    d.text((420, 1300), "ARplusCSS", fill="#f1f5f9")
    splash.save(ASSETS / "splash.png")
    print(f"Wrote {ASSETS / 'splash.png'}")


if __name__ == "__main__":
    main()
