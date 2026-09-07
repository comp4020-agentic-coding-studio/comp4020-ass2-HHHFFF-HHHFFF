/**
 * Rasterise the hand-authored SVGs in src/assets/artwork/ to the exact paths
 * the theme already consumes.
 *
 *   node scripts/render-artwork.ts        # or: pnpm artwork
 *
 * ## Why a local step with committed output
 *
 * The alternative — pointing the theme at the SVGs directly — does not work
 * and would not be better if it did. Astro's asset pipeline does not
 * transform SVG, and the README is explicit that the og:image has to be a
 * raster because scrapers will not decode what the site serves browsers.
 *
 * So the SVGs are the source of truth (text, reviewable in a diff, and the
 * only thing worth editing) and their raster output is committed alongside
 * them. This script never runs in CI. That is deliberate: rasterising SVG
 * text depends on the fonts installed on the machine doing it, and pinning
 * the bytes in git means the site cannot change appearance because a runner
 * had a different font stack.
 *
 * `sharp` is already a dependency, and its prebuilt binary carries librsvg
 * even though pnpm-workspace.yaml sets `allowBuilds: sharp: false` — the
 * skipped install script does not matter here. Verified against libvips
 * 8.18.3 by diffing a text render against the same SVG with the <text>
 * removed, so glyphs are genuinely on the canvas rather than silently
 * dropped.
 *
 * Output paths are the starter's, unchanged, because src/pages/404.md
 * references the hero by path and src/site-config.ts references the card by
 * path. Replacing the bytes in place keeps the wiring untouched and also
 * satisfies the SHA-256 comparison in scripts/check-evidence.ts.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

interface Target {
  /** File in src/assets/artwork/ */
  svg: string;
  /** Where the theme expects to find it */
  out: string;
  width: number;
  height: number;
  format: "avif" | "png";
}

const ARTWORK = "src/assets/artwork";

const targets: Target[] = [
  {
    svg: "hero-readback-loop.svg",
    out: "src/assets/images/hero-home.avif",
    width: 2560,
    height: 1086,
    format: "avif",
  },
  {
    // 1200x630 is the link-preview convention; the theme re-encodes to JPEG.
    svg: "card.svg",
    out: "src/assets/images/card.png",
    width: 1200,
    height: 630,
    format: "png",
  },
  {
    svg: "portrait-noor-abadi.svg",
    out: "src/content/people/noor-abadi.avif",
    width: 900,
    height: 900,
    format: "avif",
  },
  {
    svg: "portrait-halvard-sunde.svg",
    out: "src/content/people/halvard-sunde.avif",
    width: 900,
    height: 900,
    format: "avif",
  },
  {
    svg: "portrait-priya-raghunathan.svg",
    out: "src/content/people/priya-raghunathan.avif",
    width: 900,
    height: 900,
    format: "avif",
  },
];

async function render(target: Target): Promise<void> {
  const source = resolve(ARTWORK, target.svg);
  if (!existsSync(source)) {
    throw new Error(`missing artwork source: ${target.svg}`);
  }

  // density scales librsvg's rasterisation. Rendering at the SVG's declared
  // size and then resizing would resample text; this rasterises at the target
  // size directly.
  const declared = readFileSync(source, "utf8").match(/width="(\d+)"/);
  const density = declared ? Math.round((96 * target.width) / Number(declared[1])) : 96;

  const pipeline = sharp(source, { density }).resize(target.width, target.height, {
    fit: "cover",
  });

  const encoded =
    target.format === "avif"
      ? pipeline.avif({ quality: 62 })
      : pipeline.png({ compressionLevel: 9 });

  await encoded.toFile(resolve(target.out));

  const { width, height } = await sharp(resolve(target.out)).metadata();
  const bytes = statSync(resolve(target.out)).size;
  const ok = width === target.width && height === target.height;
  console.log(
    `${ok ? "✓" : "✗"} ${target.out}  ${width}x${height}  ${(bytes / 1024).toFixed(0)} kB`,
  );
  if (!ok) {
    throw new Error(
      `${target.out} came out ${width}x${height}, expected ${target.width}x${target.height}`,
    );
  }
}

for (const target of targets) {
  await render(target);
}

console.log(`\nrendered ${targets.length} file(s) from ${ARTWORK}/`);
console.log("commit the output alongside the sources — CI does not rasterise.");
