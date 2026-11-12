"""Prepare images for the site. Run from the repo root: python3 tools/media.py
- makes a 720px-wide copy (name-720.webp) of every wide screenshot in media/, used on small screens
- makes a 1200x630 social preview (media/og/<product>.jpg) from the first listed image of each folder
Needs Pillow (pip install pillow). Safe to run again; it only rewrites its own outputs."""
from PIL import Image
import glob, os

for f in glob.glob('media/**/*.webp', recursive=True):
    if f.endswith('-720.webp') or '/og/' in f:
        continue
    im = Image.open(f)
    if im.width >= 1200:
        small = im.convert('RGB').resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
        small.save(f[:-5] + '-720.webp', 'WEBP', quality=78, method=6)

COVERS = {
    'home': 'netmerge/overview-cover.webp', 'netmerge': 'netmerge/overview-cover.webp',
    'pullwell': 'pullwell/main-dark.webp', 'clearwrite': 'clearwrite/home-dark.webp',
    'vox': 'vox/talk.webp', 'ai-cv-studio': 'ai-cv-studio/home.webp',
    'netmerge-android': ['netmerge-android/home-merging.webp', 'netmerge-android/home-networks-dark.webp', 'netmerge-android/speed-test.webp'],
}
os.makedirs('media/og', exist_ok=True)
for name, src in COVERS.items():
    canvas = Image.new('RGB', (1200, 630), '#0d0c0a')
    if isinstance(src, list):
        x = 240
        for s in src:
            im = Image.open('media/' + s).convert('RGB'); im.thumbnail((260, 560))
            canvas.paste(im, (x, 35)); x += 290
    else:
        im = Image.open('media/' + src).convert('RGB')
        scale = max(1100 / im.width, 0)
        im = im.resize((1100, round(im.height * scale)), Image.LANCZOS)
        canvas.paste(im.crop((0, 0, 1100, min(im.height, 580))), (50, 50))
    canvas.save(f'media/og/{name}.jpg', quality=84)
print('media ready')
