"""Generate assets/images/og-image.jpg — branded OG card."""
from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images" / "og-image.jpg"

W, H = 1200, 630
PRIMARY = "#5c564e"
MUTED = "#6e665c"
ACCENT = "#c4a876"
BG = "#f9eed8"
BEIGE = "#d9c9b0"

# Same paths as assets/js/main.js SOCIAL_ICONS
SOCIAL_SVG = {
    "Instagram": (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
        f'<path fill="{PRIMARY}" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.75A3.75 3.75 0 0 0 3.75 7.5v9A3.75 3.75 0 0 0 7.5 20.25h9A3.75 3.75 0 0 0 20.25 16.5v-9A3.75 3.75 0 0 0 16.5 3.75h-9Zm9.75 1.5a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25ZM12 7.25A4.75 4.75 0 1 1 12 16.75 4.75 4.75 0 0 1 12 7.25Zm0 1.75a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>'
        "</svg>"
    ),
    "TikTok": (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
        f'<path fill="{PRIMARY}" d="M14.5 3c.4 2.2 1.8 3.9 4 4.4v2.3c-1.4-.1-2.7-.6-3.8-1.4v6.4c0 3.2-2.5 5.7-5.7 5.7S3.3 17.9 3.3 14.7c0-3.1 2.4-5.6 5.5-5.7v2.4c-1.8.1-3.2 1.6-3.2 3.3 0 1.8 1.5 3.3 3.3 3.3s3.3-1.5 3.3-3.3V3h2.3Z"/>'
        "</svg>"
    ),
    "YouTube": (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
        f'<path fill="{PRIMARY}" d="M22.5 7.2a3.1 3.1 0 0 0-2.2-2.2C18.5 4.5 12 4.5 12 4.5s-6.5 0-8.3.5A3.1 3.1 0 0 0 1.5 7.2 32.6 32.6 0 0 0 1 12a32.6 32.6 0 0 0 .5 4.8 3.1 3.1 0 0 0 2.2 2.2c1.8.5 8.3.5 8.3.5s6.5 0 8.3-.5a3.1 3.1 0 0 0 2.2-2.2A32.6 32.6 0 0 0 23 12a32.6 32.6 0 0 0-.5-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/>'
        "</svg>"
    ),
}


def load_fonts():
    display = r"C:\Windows\Fonts\georgia.ttf"
    body = r"C:\Windows\Fonts\segoeui.ttf"
    if not Path(display).exists():
        display = body
    return {
        "name": ImageFont.truetype(display, 92),
        "sub": ImageFont.truetype(body, 36),
        "pill": ImageFont.truetype(body, 26),
        "eyebrow": ImageFont.truetype(body, 22),
    }


def draw_background() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse((-200, -180, 620, 420), fill=(255, 255, 255, 90))
    od.ellipse((700, 200, 1400, 820), fill=(232, 220, 202, 120))
    od.ellipse((400, -100, 1100, 300), fill=(245, 230, 184, 100))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, W, 8), fill=BEIGE)
    draw.rectangle((0, H - 8, W, H), fill=BEIGE)
    return img


def rasterize_svg(svg: str, px: int) -> Image.Image:
    with tempfile.TemporaryDirectory() as tmp:
        svg_path = Path(tmp) / "icon.svg"
        png_path = Path(tmp) / "icon.png"
        svg_path.write_text(svg, encoding="utf-8")
        subprocess.run(
            [
                "npx",
                "--yes",
                "@resvg/resvg-js-cli",
                "--fit-width",
                str(px),
                "--fit-height",
                str(px),
                str(svg_path),
                str(png_path),
            ],
            check=True,
            cwd=ROOT,
            shell=True,
        )
        return Image.open(png_path).convert("RGBA")


def alpha_bbox(img: Image.Image) -> tuple[int, int, int, int] | None:
    return img.split()[3].getbbox()


def center_paste(canvas: Image.Image, icon: Image.Image) -> None:
    bbox = alpha_bbox(icon)
    if not bbox:
        return
    cropped = icon.crop(bbox)
    cw, ch = cropped.size
    size = canvas.size[0]
    canvas.paste(cropped, ((size - cw) // 2, (size - ch) // 2), cropped)


def draw_social_circle(
    base: Image.Image,
    cx: int,
    cy: int,
    diameter: int,
    label: str,
    fonts,
) -> None:
    r = diameter // 2
    circle = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    cd = ImageDraw.Draw(circle)
    cd.ellipse((1, 1, diameter - 2, diameter - 2), fill=(255, 255, 255, 255), outline=BEIGE, width=3)

    icon_px = int(diameter * 0.48)
    icon = rasterize_svg(SOCIAL_SVG[label], icon_px)
    icon_layer = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    center_paste(icon_layer, icon)
    circle = Image.alpha_composite(circle, icon_layer)
    base.paste(circle, (cx - r, cy - r), circle)

    draw = ImageDraw.Draw(base)
    draw.text((cx, cy + r + 22), label, font=fonts["pill"], fill=PRIMARY, anchor="mt")


def main() -> None:
    fonts = load_fonts()
    img = draw_background()
    draw = ImageDraw.Draw(img)

    for text, font, y, color in (
        ("PORTFOLIO", fonts["eyebrow"], 118, ACCENT),
        ("Desi Perea", fonts["name"], 220, PRIMARY),
        ("Creadora de contenido", fonts["sub"], 305, MUTED),
    ):
        draw.text((W // 2, y), text, font=font, fill=color, anchor="mm")

    rule_w = 120
    draw.rectangle(((W - rule_w) // 2, 252, (W + rule_w) // 2, 256), fill=ACCENT)

    platforms = ("Instagram", "TikTok", "YouTube")
    diameter = 96
    gap = 56
    row_w = len(platforms) * diameter + (len(platforms) - 1) * gap
    start_x = (W - row_w) // 2 + diameter // 2
    circle_cy = 400

    for i, label in enumerate(platforms):
        cx = start_x + i * (diameter + gap)
        draw_social_circle(img, cx, circle_cy, diameter, label, fonts)

    draw.text((W // 2, 520), "Lifestyle · Belleza · Colaboraciones", font=fonts["eyebrow"], fill=MUTED, anchor="mm")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "JPEG", quality=92, optimize=True)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
