# Nisarworks

The website at nisarworks.com: a home for the software Nisar Ahmad builds.

## How it is put together

- `content/products.mjs` holds every product: name, tagline, status, links, screenshots and the sections of its page.
- `content/site.mjs` holds the site-wide words and links.
- `media/<product>/` holds the images. Screenshots are `.webp`.
- `src/` holds the page templates (`build.mjs`), the styles and a small script.
- `public/` is the built site. It is generated; do not edit it by hand.

## Add or change a product

1. Edit its entry in `content/products.mjs`, or copy an entry to add a new one.
2. Put its images in `media/<slug>/` and name them in the entry.
3. Optional: run `python3 tools/media.py` to make small-screen copies and social preview images (needs Pillow).
4. Optional: run `node src/update-versions.mjs` to pick up new release numbers from GitHub.
5. Run `node src/build.mjs`. It needs Node 18 or newer and nothing else.

## Publish

```
node src/build.mjs
firebase deploy --only hosting
```
