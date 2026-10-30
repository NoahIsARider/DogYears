"""Crop the text band out of each in-scene font screenshot and upscale for comparison."""
from pathlib import Path
from PIL import Image

out = Path("deliverables/font-options")
keys = [
    "00-current", "01-kleeone", "02-mansalva", "03-justanotherhand",
    "04-cedarville", "05-homemadeapple", "06-neucha", "07-yomogi", "08-waitingsunrise",
]
BOX = (250, 96, 1210, 350)   # x0, y0, x1, y1 in the 1440x960 in-game shot
SCALE = 1.5
for k in keys:
    src = out / f"scene-{k}.png"
    im = Image.open(src).convert("RGB")
    im.crop(BOX).resize((int((BOX[2]-BOX[0])*SCALE), int((BOX[3]-BOX[1])*SCALE)), Image.LANCZOS).save(out / f"crop-{k}.png")
    print(k, Image.open(out / f"crop-{k}.png").size)
