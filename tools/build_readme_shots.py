"""Build compact README screenshots from the running-game captures."""
from pathlib import Path
from PIL import Image

src = Path("deliverables")
out = Path("screenshots")
out.mkdir(exist_ok=True)

# name, source, pixels to trim from the bottom, output
shots = [
    ("title", src / "story-checks" / "00-title.png", 0, "01-title.jpg"),
    ("kitchen", src / "art-checks" / "kitchen.png", 0, "02-kitchen.jpg"),
    ("memory", src / "art-checks" / "ink-letter.png", 0, "03-memory-text.jpg"),
    ("bedroom", src / "art-checks" / "bedroom.png", 0, "04-bedroom.jpg"),
    ("miniature", src / "story-checks" / "5-model-action-1.png", 70, "05-miniature.jpg"),
    ("garden", src / "art-checks" / "garden.png", 0, "06-garden.jpg"),
    ("phone", src / "story-checks" / "06-phone-mara.png", 70, "07-phone.jpg"),
    ("ending", src / "story-checks" / "07-ending.png", 80, "08-ending.jpg"),
]
for name, path, trim, target in shots:
    if not path.exists():
        print("skip", name, "missing")
        continue
    im = Image.open(path).convert("RGB")
    if trim:
        im = im.crop((0, 0, im.width, im.height - trim))
    if im.width > 1400:
        im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    im.save(out / target, "JPEG", quality=84, optimize=True, progressive=True)
    print(target, im.size, f"{(out / target).stat().st_size // 1024} KB")
