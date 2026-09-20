/**
 * Encode the home page hero from its generated source.
 *
 *   node scripts/render-hero.ts        # or: pnpm hero
 *
 * Same contract as scripts/render-artwork.ts and scripts/tone-portraits.ts:
 * source committed, output committed, never runs in CI. This script is the
 * only writer of src/assets/images/hero-home.avif — the SVG target that used
 * to write that path was removed from render-artwork.ts in the same commit,
 * because two scripts writing one path is the trap render-artwork.ts already
 * documents for the portraits.
 *
 * ## Why the source is a PNG and not an SVG
 *
 * The hero it replaces was hand-authored SVG — a readback loop drawn as a
 * diagram. Rendered into the band the theme actually gives it, that read as
 * crude: the theme crops `heroImage` to roughly 2.83:1 at desktop, which took
 * a diagram built to be read and left a strip of it.
 *
 * The replacement came from the course image proxy
 * (`ideogram-v3-quality`; the exact request body is committed next to the PNG
 * as tower-arcs.prompt.json, so the source is reproducible-ish rather than an
 * orphan binary). The proxy returns PNG, so PNG is the source of record.
 *
 * ## The crop is the thing to check, and so is the scrim
 *
 * Candidates were judged by simulating both crops the hero undergoes rather
 * than by looking at the 1312x736 frame, which is not what any visitor sees.
 * Measured hero boxes: 1600x566 at a 1600px window (keeps the centre 63% of
 * this source's height, full width) and 390x360 at 390px (keeps the centre 46%
 * of its width). So the subject has to be centred and its incident detail has
 * to sit inside the middle 46% — anything near the left or right edge is gone
 * on mobile. Two candidates died on that alone: a dead-centre disc filled the
 * desktop band with flat gold and sliced its aircraft in half at the top edge,
 * and an earlier one carried bowtie-shaped artefacts inside its rings that
 * were invisible at frame size and obvious at band size.
 *
 * The crop was not the expensive mistake. **The theme lays
 * `linear-gradient(#00000026, #0009 50%, #000c)` over the hero** so the white
 * title stays legible — 15% black at the top, 60% at mid-height, 80% at the
 * foot. A candidate was picked, encoded and wired up on the strength of its
 * bare crop: a calm cream sky, centred tower, thin gold arcs, both crops
 * clean. Rendered, it was grey-brown sludge. Nothing was broken; the scrim was
 * simply never in the picture I was looking at, so the preview was answering
 * "what does this artwork look like" when the question was "what does it look
 * like under a 60-to-80% black gradient".
 *
 * So the artwork is dark-ground with generous gold, which is what the SVG hero
 * it replaces got right and the reason that one never looked muddy: the scrim
 * compresses contrast, and near-black plus strong gold has contrast to spare
 * where cream plus hairlines does not. If this is ever regenerated, composite
 * that gradient over the candidate before deciding.
 *
 * ## Two numbers the source needed
 *
 * The proxy does not honour the requested size: `1792x1024` came back as
 * 1312x736. The asset is written at 2560 wide, so this is a ~1.95x upscale.
 * Acceptable only because the artwork is flat fields and clean curves with no
 * texture or text for a resampler to invent — do not assume the same of a
 * photographic source.
 *
 * And the generation has a pale mat baked into all four edges, about 21px
 * wide: column means of 187/186 at left/right and row means of 185/185 at
 * top/bottom, against 52 twenty pixels further in. Left alone it renders as
 * two light vertical strips down the outer edges of the band. TRIM below cuts
 * it off. Measured with a control — the first reading used sharp's `.stats()`
 * after `.extract()` and returned an identical 68.3 for all six bands,
 * including ones that obviously differ, so it was reporting whole-image stats
 * and ignoring the crop entirely.
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const SOURCE = "src/assets/hero/tower-arcs.png";
const OUT = "src/assets/images/hero-home.avif";

// The starter's dimensions, unchanged: src/pages/404.md and src/pages/index.astro
// both reference the output path, and scripts/check-evidence.ts compares its
// SHA-256 against the starter's.
const WIDTH = 2560;
const HEIGHT = 1086;

/** Pixels of the generation's pale mat to cut off each edge. Measured at ~21. */
const TRIM = 24;

const source = resolve(SOURCE);
if (!existsSync(source)) {
  throw new Error(`missing hero source: ${SOURCE}`);
}

const { width: srcW, height: srcH } = await sharp(source).metadata();
if (srcW === undefined || srcH === undefined) {
  throw new Error(`could not read dimensions of ${SOURCE}`);
}
if (srcW <= 2 * TRIM || srcH <= 2 * TRIM) {
  throw new Error(`${SOURCE} is ${srcW}x${srcH}, too small to trim ${TRIM}px a side`);
}

await sharp(source)
  .extract({ left: TRIM, top: TRIM, width: srcW - 2 * TRIM, height: srcH - 2 * TRIM })
  .resize(WIDTH, HEIGHT, { fit: "cover" })
  .avif({ quality: 62 })
  .toFile(resolve(OUT));

const { width, height } = await sharp(resolve(OUT)).metadata();
const bytes = statSync(resolve(OUT)).size;
const ok = width === WIDTH && height === HEIGHT;
console.log(`${ok ? "✓" : "✗"} ${OUT}  ${width}x${height}  ${(bytes / 1024).toFixed(0)} kB`);
if (!ok) {
  throw new Error(`${OUT} came out ${width}x${height}, expected ${WIDTH}x${HEIGHT}`);
}

console.log("commit the output alongside the source — CI does not encode this.");
