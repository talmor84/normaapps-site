"""Resize real app screenshots into web-ready WebP files.

Usage:
  python scripts/optimize_screens.py <source-folder> <product-slug>

The source folder holds the original PNG screenshots captured from the app
(for Norma Health: the six 1320 x 2868 App Store screenshots). Each file is
only scaled and re-encoded. Nothing is drawn, cropped or retouched.

Output: src/assets/products/<slug>/<name>-<width>.webp for each width below.
"""

import sys
from pathlib import Path

from PIL import Image

WIDTHS = (480, 960)
QUALITY = 82


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    source = Path(sys.argv[1])
    out = Path(__file__).resolve().parent.parent / "src" / "assets" / "products" / sys.argv[2]
    out.mkdir(parents=True, exist_ok=True)
    for png in sorted(source.glob("*.png")):
        name = png.stem.split("-", 1)[-1] if png.stem[:2].isdigit() else png.stem
        with Image.open(png) as img:
            img = img.convert("RGB")
            for width in WIDTHS:
                height = round(img.height * width / img.width)
                target = out / f"{name}-{width}.webp"
                img.resize((width, height), Image.LANCZOS).save(target, "WEBP", quality=QUALITY, method=6)
                print(f"{target.name}: {width}x{height}, {target.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
