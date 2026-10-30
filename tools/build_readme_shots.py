"""Build compact README screenshots from the running-game captures."""
from pathlib import Path
from PIL import Image

src = Path("deliverables")
out = Path("screenshots")
out.mkdir(exist_ok=True)

shots = [
    ("00-title", src / "story-checks" / "00-title.png", "01-title.jpg"),
    ("kitchen", src / "art-checks" / "kitchen.png", "02-kitchen.jpg"),
    ("memory", src / "art-checks" / "ink-letter.png", "03-memory-text.jpg"),
    ("bedroom", src / "art-checks" / "bedroom.png", "04-bedroom.jpg"),
    ("phone", src / "story-checks" / "06-phone-mara.png", "05-phone.jpg"),
    ("garden", src / "art-checks" / "garden.png", "06-garden.jpg"),
    ("ending", src / "story-checks" / "07-ending.png", "07-ending.jpg"),
]
for name, path, target in shots:
    if not path.exists():
        print("skip", name, "missing")
        continue
    im = Image.open(path).convert("RGB")
    if im.width > 1400:
        im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    im.save(out / target, "JPEG", quality=82, optimize=True, progressive=True)
    print(target, im.size, f"{(out / target).stat().st_size // 1024} KB")
