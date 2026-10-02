"""Builds build/icon.ico from the generic ping render. Requires Pillow."""
from pathlib import Path

from PIL import Image

repo = Path(__file__).resolve().parents[1]
src = Image.open(repo / 'assets' / 'textures' / 'pingwheel_basicpingrender.png').convert('RGBA')
out = repo / 'build' / 'icon.ico'
out.parent.mkdir(exist_ok=True)
src.save(out, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print(out)
