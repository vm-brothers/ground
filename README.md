# VM Brothers Cricket Ground — Website

Marketing website for **VM Brothers Cricket Ground**, Narthan, Dandi Road (Opposite Radiant School), Surat, Gujarat 395005.

Plain HTML, CSS and JavaScript — no build step, no dependencies. It runs directly on GitHub Pages.

---

## 1. Put it live on GitHub Pages

### First time

```bash
cd "D:\Projects\VM BROTHERS"

git init
git add .
git commit -m "VM Brothers Cricket Ground website"
git branch -M main

# Create an empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then on GitHub:

1. Open your repository → **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main`, folder: `/ (root)` → **Save**
4. Wait about a minute. Your site is live at:
   `https://<your-username>.github.io/<your-repo>/`

### Updating it later

```bash
git add .
git commit -m "Update ground photos"
git push
```

GitHub Pages redeploys automatically within a minute or two.

> **Tip:** if you name the repository `<your-username>.github.io`, the site lives at
> `https://<your-username>.github.io/` with no sub-folder.

---

## 2. Photos and videos

All the imagery on the site came out of your own three videos — no stock photos, nothing borrowed.

### What was made

| Original | Became |
|---|---|
| `1.mp4` (848×478 drone, 2:04, 23 MB) | Hero background loop (18 s, 0.7 MB), full aerial tour (3.1 MB), 3 gallery stills |
| `2.mp4` (478×850 tournament, 1:03, 15 MB) | Tournament video, **rotated upright** (4.2 MB), 3 gallery stills |
| `3.mp4` (360×640 promo, 0:17, 3 MB) | Quick reel (0.8 MB) |

**42 MB of source became 8.9 MB of web video**, and none of it downloads unless a visitor
presses play. `2.mp4` was recorded in landscape but saved without a rotation flag, so it played
sideways — it is rotated 90° counter-clockwise during encoding.

### Page weight

| | |
|---|---|
| First load (everyone) | **~148 KB** — HTML, CSS, JS, logo |
| As you scroll | 288 KB of gallery stills, loaded lazily |
| Only on tap | the three showcase videos |

### The hero background

The hero uses the **illustrated night-stadium graphic**, not footage — it loads instantly and
weighs nothing. The aerial still is still used as the WhatsApp/Facebook link preview image.

`hero-loop.mp4` and `hero-poster.jpg` are kept in the project even though the hero does not
play video right now. To switch the hero over to the real drone footage, follow the comment
inside `index.html` in the hero section — it names the two lines to add back and the heavier
scrim to restore in `style.css`. Everything else (CSS, JS, both files) is already in place.

### Swapping a photo

Drop a replacement at the same path in `assets/img/gallery/` (`ground-1.jpg` … `ground-6.jpg`).
Landscape 16:9, at least 1200px wide, under ~200 KB. Update the `alt` text in `index.html` to
describe the new picture.

### Re-cutting a video

ffmpeg is installed. From the folder holding your source files:

```bash
# a different 18-second hero loop (change -ss to the start second you want)
ffmpeg -ss 26 -t 18 -i 1.mp4 -an -c:v libx264 -preset slow -crf 31 \
  -pix_fmt yuv420p -movflags +faststart hero-loop.mp4

# a still from any moment
ffmpeg -ss 46 -i 1.mp4 -frames:v 1 -q:v 3 ground-2.jpg
```

---

## 3. Things you may want to change

Everything below is in `index.html` — search for the text and replace it.

| What | Where to look |
|---|---|
| Phone numbers | `+919824942790` and `+919601701819` (appear in `tel:` links, `wa.me/` links and the footer) |
| WhatsApp number | `wa.me/919824942790` |
| Address | Search for `Narthan, Dandi Road` |
| Google Maps directions link | Search for `maps.app.goo.gl` |
| Page title / description | The `<title>` and `<meta name="description">` tags at the top |

### Making the embedded map pin exact

The embedded map currently centres on the Narthan / Dandi Road area. To pin it exactly on the ground:

1. Open your ground on Google Maps
2. Right-click the exact spot → click the latitude/longitude numbers to copy them
3. In `index.html`, find the `<iframe ... src="https://maps.google.com/maps?q=...">` in the
   **LOCATION** section and replace the `q=` value with those coordinates, e.g.
   `src="https://maps.google.com/maps?q=21.2270,72.7430&z=17&output=embed"`

The **Get Directions** button already uses your own Google Maps link, so it is always correct.

### Adding rates later

Pricing is deliberately kept off the site — every enquiry goes to your phone. If you later want a
rate card on the page, the **Booking** section is the right place for it.

---

## 4. Files

```
index.html              The whole page
assets/css/style.css    Core styling (colours, layout, responsive rules)
assets/css/effects.css  The 3D + scroll-reactive layer (see below)
assets/js/main.js       Menu, scroll engine, tilt, reveal animations, video
assets/img/logo.png     Your logo at 256px (browser icon + on-page use)
assets/img/logo-original.png  Full 1536px original, kept for print/signage
assets/img/gallery/     The six gallery stills
assets/img/*-poster.jpg Video thumbnails
assets/video/           The four web-encoded videos
.nojekyll               Tells GitHub Pages to serve the files as-is
404.html                Friendly page if someone hits a wrong URL
```

### The 3D / scroll layer

All of it is plain CSS 3D transforms — no three.js, no GSAP, no libraries at all.
`main.js` only writes CSS custom properties on scroll; the browser does the rest on the
GPU. Total cost is about 23 KB, so the site still loads fast on mobile data.

| Effect | Where |
|---|---|
| Gold reading-progress rail | Top of every screen |
| Hero parallax — stadium drifts, copy lifts and fades, scene follows the cursor | Hero |
| **Day → night stage**: scrolling sets the sun, raises the moon, brings out the stars and fires up your floodlights | Between Facilities and Formats |
| Cards tilt in 3D toward the cursor with a sheen that follows it | Facilities, Formats, Steps, Stats |
| Spinning 3D cricket balls (red season, yellow tennis) — they speed up on hover | Formats |
| Cards rotate up into place as they enter the screen | Throughout |
| Large buttons pull gently toward the cursor | Call-to-action buttons |

**Tuning it:** every value lives in `assets/css/effects.css`.
- Day→night section feels too long or short → change `height: 300vh` on `.daynight`
  (and `240vh` in the mobile block at the bottom)
- Tilt too strong or too weak → the `* 6.5` figures in the `bindTilt` function in `main.js`
- Ball spin speed → `animation: ballSpin 11s` on `.ball3d__core`
- When the lights switch on → the `--lights` line in `main.js` (`(p - 0.42) / 0.34`)

**Accessibility and fallbacks** are handled: visitors who have "reduce motion" switched on
get the scene settled on the lit night view with no animation, and if JavaScript fails the
section unpins and still shows the floodlit ground.

---

## 5. Previewing on your computer

Just double-click `index.html` — it opens in your browser and works straight away.

---

## What's on the page

- Night-stadium hero with the ground name and call-to-action
- About the ground
- Facilities: floodlights, season ball pitch, tennis ball cricket, pavilion & changing rooms,
  spectator seating, on-site parking
- The two formats — season ball and tennis ball
- Photo gallery
- How booking works, in three steps
- Google Map, address and both phone numbers
- Sticky Call / WhatsApp / Directions bar on mobile
- Search-engine data (`SportsActivityLocation`) so the ground can appear in Google results
