/**
 * Tone the three staff portraits into the site's palette.
 *
 *   node scripts/tone-portraits.ts        # or: pnpm portraits
 *
 * Reads the photographs in src/assets/portraits/ and writes the duotone AVIFs
 * the people collection points at. Same contract as scripts/render-artwork.ts:
 * source committed, output committed, never runs in CI.
 *
 * ## Why the colour is applied here and not asked for
 *
 * The first attempt asked the image model for the palette directly — "flat
 * gold #b97d1c and near-black on warm cream". It does not hold a hex value.
 * Across a dozen generations the gold drifted from mustard to orange to a
 * brown that read as sepia, and no two of the three people landed in the same
 * family, which on a page that shows all three side by side is the one thing
 * that had to be true.
 *
 * So the division of labour is: the model is asked only for things it is
 * actually good at — a plausible person, lit, facing the right way, no text
 * anywhere in the frame — and the colour is applied here, by a lookup table,
 * where it is exact and identical for all three.
 *
 * ## How
 *
 * Reduce to luminance, then map luminance through a four-stop ramp. Every stop
 * is a token already in src/styles: the shadow is the ink behind
 * `--at-text`, the two midtones are `--at-secondary` (bronze) and
 * `--at-primary` (gold), and the highlight is the warm cream the page
 * background is mixed from. A photograph put through this cannot introduce a
 * colour the rest of the site does not already use.
 *
 * Interpolating *between* the stops rather than snapping to the nearest one is
 * what keeps a face readable: posterising to four flat tones loses the modelling
 * around the eyes and mouth, and at card size that reads as a smudge.
 *
 * ## What the numbers said, and what they did not settle
 *
 * Mean luminance over the toned set: Priya 111–119, Noor 61–75, Halvard
 * 53–73 — her set is close to twice as light as the other two. The cause is
 * her shirt, which is white and fills a third of the frame, so it lands in the
 * cream stop (8–11% of pixels above 192, against 0–1% for the others).
 *
 * The tempting fix is to normalise each image to a target mean. That is the
 * wrong correction: a whole-frame mean is dominated by clothing and
 * background, not by the face, so lifting Halvard's 73 to Priya's 116 would
 * have blown out the only part of the frame anybody looks at. The measurement
 * was worth making — it turned "one of these looks brighter" into a number,
 * and it identified the cause — but the number it produced is not the number
 * to flatten. The frames were chosen instead: the lightest of Halvard's four
 * (73.3) next to the lightest of Noor's (75.0) puts two of the three within
 * two points, and Priya's remaining brightness is a white uniform shirt on a
 * serving first officer, which is the correct thing for her to be wearing.
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

/** Luminance stop -> RGB. Every colour here is a token the site already uses. */
const RAMP: ReadonlyArray<readonly [number, readonly [number, number, number]]> = [
  [0.0, [0x14, 0x11, 0x0d]], // the ink behind --at-text
  [0.42, [0x8a, 0x5c, 0x13]], // --at-secondary, bronze
  [0.72, [0xb9, 0x7d, 0x1c]], // --at-primary, gold
  [1.0, [0xef, 0xe7, 0xd8]], // the warm cream --at-bg is mixed from
];

const SIZE = 900; // matches the starter's portraits, so the wiring is untouched
const SOURCES = "src/assets/portraits";
const OUT = "src/content/people";

const people = ["noor-abadi", "halvard-sunde", "priya-raghunathan"] as const;

/** 256-entry lookup table, linearly interpolated between the ramp's stops. */
function buildLut(): Uint8Array {
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let upper = 1;
    while (upper < RAMP.length - 1 && RAMP[upper][0] < t) upper++;
    const [t0, c0] = RAMP[upper - 1];
    const [t1, c1] = RAMP[upper];
    const k = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
    for (let c = 0; c < 3; c++) {
      lut[i * 3 + c] = Math.round(c0[c] + (c1[c] - c0[c]) * k);
    }
  }
  return lut;
}

const LUT = buildLut();

async function tone(slug: string): Promise<void> {
  const source = resolve(SOURCES, `${slug}.webp`);
  if (!existsSync(source)) {
    throw new Error(`missing portrait source: ${SOURCES}/${slug}.webp`);
  }

  // `position: "top"` rather than centre: these are head-and-shoulders frames,
  // and a centre crop of one takes the chin off.
  const { data, info } = await sharp(source)
    .resize(SIZE, SIZE, { fit: "cover", position: "top" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgb = Buffer.allocUnsafe(data.length * 3);
  for (let i = 0; i < data.length; i++) {
    const l = data[i] * 3;
    rgb[i * 3] = LUT[l];
    rgb[i * 3 + 1] = LUT[l + 1];
    rgb[i * 3 + 2] = LUT[l + 2];
  }

  const out = resolve(OUT, `${slug}.avif`);
  await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
    .avif({ quality: 70 })
    .toFile(out);

  const { width, height } = await sharp(out).metadata();
  const bytes = statSync(out).size;
  if (width !== SIZE || height !== SIZE) {
    throw new Error(`${out} came out ${width}x${height}, expected ${SIZE}x${SIZE}`);
  }
  console.log(`✓ ${OUT}/${slug}.avif  ${width}x${height}  ${(bytes / 1024).toFixed(0)} kB`);
}

for (const slug of people) {
  await tone(slug);
}

console.log(`\ntoned ${people.length} portrait(s) from ${SOURCES}/`);
console.log("commit the output alongside the sources — CI does not run this.");
