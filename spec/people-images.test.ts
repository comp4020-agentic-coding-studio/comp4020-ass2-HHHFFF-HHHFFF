import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Each person has two images, and each one is described by its own alt text.
 *
 * The people index shows an illustration of that person at work; their own
 * page shows their portrait. That is two sources, two treatments in
 * `scripts/tone-portraits.ts`, and two alt strings in the frontmatter — and
 * the failure this guards is not the image going missing, it is **the image
 * changing while its description stays behind**.
 *
 * That failure is invisible to everything else in the build. `pnpm build` is
 * green because both files exist. The link checker is green because neither
 * is a link. axe is green because an `alt` attribute is present and non-empty
 * — axe checks that alt text *exists*, never that it is true of the picture
 * it is attached to. So a card could show a woman in a flight deck while
 * announcing "a head against a gold disc with a spectrogram's formant
 * stripes" to a screen reader, and nothing would say a word. A sighted
 * reviewer would not catch it either, because the only way to see alt text is
 * to go looking for it.
 *
 * So this reads the alt out of the built HTML and compares it to the
 * frontmatter field that belongs to *that* image: the index card against
 * `cardImageAlt`, the person's page against `photoAlt`.
 *
 * ## Proven red
 *
 * Twice, both by breaking the wiring rather than the content, and both times
 * `pnpm build` stayed green at 41 pages with no accessibility violations.
 *
 * Pointing the index's `imageAlt` back at `photoAlt` while leaving `image` on
 * the illustration — the exact slip this exists for, and one that leaves the
 * page looking perfect:
 *
 *     AssertionError: noor-abadi: the index card shows the illustration but
 *     describes something else: expected 'A staff portrait, toned in the
 *     site\'…' to be 'An illustration of her at work. A wom…'
 *
 * And pointing `image` back at `photo`, which is how the page looked before
 * the illustrations existed:
 *
 *     AssertionError: noor-abadi: no card illustration on the index:
 *     expected undefined to be defined
 *
 * That second message is not the one this file was first written to print. It
 * had a third assertion, that the card and the portrait are different images,
 * and a docstring quoting its failure. Running it showed the card lookup
 * fails one assertion earlier, so the "different images" assertion could
 * never report anything the first two had not already caught — coverage in
 * appearance only. It was deleted rather than left in with a nicer name,
 * which is the same reasoning as not keeping a check that has never been red.
 *
 * ## What it cannot do
 *
 * It cannot tell whether either alt string is a good description — that needs
 * eyes on the picture, and it is why the illustrations were looked at one
 * contact sheet at a time rather than wired up on trust. What it can do is
 * guarantee the description travels with its image.
 */

const PEOPLE = "src/content/people";
const DIST = "dist/people";

interface Person {
  slug: string;
  cardImageAlt?: string;
  photoAlt?: string;
}

/** Collapse a folded block scalar (`key: >-`) into one line. */
function foldedScalar(source: string, key: string): string | undefined {
  const start = source.match(new RegExp(`^${key}:\\s*>-\\s*$`, "m"));
  if (!start?.index) return undefined;
  const rest = source.slice(start.index + start[0].length).split("\n").slice(1);
  const lines: string[] = [];
  for (const line of rest) {
    if (!/^\s{2,}\S/.test(line)) break;
    lines.push(line.trim());
  }
  return lines.length ? lines.join(" ") : undefined;
}

function people(): Person[] {
  return readdirSync(resolve(PEOPLE))
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => {
      const source = readFileSync(resolve(PEOPLE, f), "utf8");
      return {
        slug: f.replace(/\.mdx?$/, ""),
        cardImageAlt: foldedScalar(source, "cardImageAlt"),
        photoAlt: foldedScalar(source, "photoAlt"),
      };
    });
}

/** The handful of entities Astro emits inside an attribute. */
function decode(value: string): string {
  return value
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

interface Img {
  src: string;
  alt: string;
}

/** Every <img> in the document, with src and alt read independently of order. */
function images(html: string): Img[] {
  return [...html.matchAll(/<img\b[^>]*>/g)].map((tag) => ({
    src: tag[0].match(/\bsrc="([^"]*)"/)?.[1] ?? "",
    alt: decode(tag[0].match(/\balt="([^"]*)"/)?.[1] ?? "").replace(/\s+/g, " ").trim(),
  }));
}

describe("each of a person's two images is described by its own alt text", () => {
  const roster = people();
  const index = images(readFileSync(resolve(DIST, "index.html"), "utf8"));

  it("finds a roster and an index with images on it", () => {
    expect(roster.length).toBeGreaterThanOrEqual(3);
    expect(index.length).toBeGreaterThanOrEqual(3);
  });

  for (const person of roster.filter((p) => p.cardImageAlt)) {
    const { slug, cardImageAlt, photoAlt } = person;

    it(`${slug}: the index card is described as the illustration`, () => {
      const card = index.find((img) => img.src.includes(`${slug}-card`));
      expect(card, `${slug}: no card illustration on the index`).toBeDefined();
      expect(
        card?.alt,
        `${slug}: the index card shows the illustration but describes something else`,
      ).toBe(cardImageAlt?.replace(/\s+/g, " ").trim());
    });

    it(`${slug}: the portrait on their own page is described as the portrait`, () => {
      const html = readFileSync(resolve(DIST, slug, "index.html"), "utf8");
      // By name, not by processing path: the site logo is served out of
      // /_astro/ too, and picking the first one there finds the masthead.
      const portrait = images(html).find(
        (img) => img.src.includes(slug) && !img.src.includes(`${slug}-card`),
      );
      expect(portrait, `${slug}: no portrait on their own page`).toBeDefined();
      expect(
        portrait?.alt,
        `${slug}: the portrait is described by the wrong alt`,
      ).toBe(photoAlt?.replace(/\s+/g, " ").trim());
    });

  }
});
