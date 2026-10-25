"""Remove the pale border-connected backdrop from Yum WebP assets.

Run from apps/web: python3 scripts/remove-yum-background.py
"""

from collections import deque
import argparse
from pathlib import Path
from statistics import median

from PIL import Image


IMAGE_DIR = Path(__file__).resolve().parents[1] / "public/images/yum"


def remove_background(path: Path) -> tuple[int, int]:
    with Image.open(path) as source:
        image = source.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    assert pixels is not None

    # The wave pose already has a true alpha cutout. Leave its hand-finished edge intact.
    if all(pixels[x, y][3] == 0 for x, y in ((0, 0), (width - 1, 0),
                                               (0, height - 1), (width - 1, height - 1))):
        return 0, width * height

    corners = []
    for x0, y0 in ((0, 0), (width - 8, 0), (0, height - 8), (width - 8, height - 8)):
        for y in range(y0, y0 + 8):
            for x in range(x0, x0 + 8):
                if pixels[x, y][3] > 200:
                    corners.append(pixels[x, y][:3])
    background = tuple(int(median(channel)) for channel in zip(*corners))

    def is_background(x: int, y: int) -> bool:
        red, green, blue, alpha = pixels[x, y]
        delta = (abs(red - background[0]), abs(green - background[1]), abs(blue - background[2]))
        return alpha > 0 and max(delta) <= 10 and sum(delta) <= 22

    outside = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        index = y * width + x
        if not outside[index] and is_background(x, y):
            outside[index] = 1
            queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            add(x - 1, y)
        if x + 1 < width:
            add(x + 1, y)
        if y > 0:
            add(x, y - 1)
        if y + 1 < height:
            add(x, y + 1)

    removed = 0
    for y in range(height):
        for x in range(width):
            if outside[y * width + x]:
                pixels[x, y] = (0, 0, 0, 0)
                removed += 1

    # Remove the pale antialias fringe adjoining the erased backdrop.
    for _ in range(2):
        fringe = []
        for y in range(height):
            for x in range(width):
                red, green, blue, alpha = pixels[x, y]
                if not alpha:
                    continue
                delta = (abs(red - background[0]), abs(green - background[1]), abs(blue - background[2]))
                if max(delta) > 27 or sum(delta) > 59:
                    continue
                if any(
                    pixels[nx, ny][3] == 0
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
                    if 0 <= nx < width and 0 <= ny < height
                ):
                    fringe.append((x, y))
        for x, y in fringe:
            pixels[x, y] = (0, 0, 0, 0)
        removed += len(fringe)

    # Discard detached backdrop marks, including labels baked into some originals.
    seen = bytearray(width * height)
    components: list[list[tuple[int, int]]] = []
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or pixels[x, y][3] == 0:
                continue
            seen[index] = 1
            component = []
            queue.append((x, y))
            while queue:
                cx, cy = queue.popleft()
                component.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1),
                               (cx - 1, cy - 1), (cx + 1, cy - 1), (cx - 1, cy + 1), (cx + 1, cy + 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        next_index = ny * width + nx
                        if not seen[next_index] and pixels[nx, ny][3] > 0:
                            seen[next_index] = 1
                            queue.append((nx, ny))
            components.append(component)
    if components:
        largest = max(components, key=len)
        for component in components:
            if component is largest:
                continue
            for x, y in component:
                pixels[x, y] = (0, 0, 0, 0)
            removed += len(component)

    image.save(path, "WEBP", lossless=True, exact=True, method=6)
    return removed, width * height


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", type=Path, default=IMAGE_DIR)
    args = parser.parse_args()
    for asset in sorted(args.directory.glob("*.webp")):
        removed, total = remove_background(asset)
        print(f"{asset.name}: {removed}/{total} background pixels made transparent")
