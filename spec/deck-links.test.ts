import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The brief requires at least one lecture with an actual, linked slide deck.
 *
 * ## What this file originally claimed, and why that was wrong
 *
 * It was written to catch a dangling `slides:` path, on the reasoning that
 * `slides` is only shape-validated in src/content.config.ts
 * (/^\/decks\/[a-z0-9-]+\/$/) and never resolved.
 *
 * Breaking the mechanism disproved the reasoning. Pointing week-01 at
 * `/decks/week-99/` does fail this file — but it also fails `pnpm build`,
 * because src/pages/lectures/[slug].astro renders the value as an anchor and
 * astro-broken-links-checker resolves it ("Broken link:
 * /comp4020-ass2-HHHFFF-HHHFFF/decks/week-99/", build aborted). The gap I
 * wrote the check for did not exist, and I only found that out by trying to
 * make it red.
 *
 * ## The gap that is real
 *
 * The build cannot know the brief requires a deck at all. Remove `slides:`
 * from every lecture and the site builds completely green: the decks are
 * still emitted as pages, nothing links to them, no link is broken, and the
 * requirement is silently unmet. That is what this file now asserts, and it
 * is the assertion that would actually have caught a real mistake.
 *
 * Proven red by deleting the `slides:` line from week-01 and week-05: `pnpm
 * build` stayed green (41 pages, no violations, no broken links) and this
 * file failed with "no lecture declares slides".
 *
 * The resolution assertion is kept below as defence in depth, and is
 * deliberately labelled as redundant with the build rather than presented as
 * the point of the file. If the theme ever stops rendering that anchor, the
 * link checker stops seeing it and this becomes load-bearing again.
 */

interface ApiNode {
  id: string;
  type: string;
  meta?: Record<string, unknown>;
}

const api = JSON.parse(
  readFileSync(resolve("dist/api/index.json"), "utf8"),
) as { nodes: ApiNode[] };

const lectures = api.nodes.filter((node) => node.type === "lectures");
const withSlides = lectures.filter((node) => typeof node.meta?.slides === "string");

/** `/decks/week-05/` -> `dist/decks/week-05/index.html` */
const builtPath = (slides: string): string =>
  resolve("dist", slides.replace(/^\/+|\/+$/g, ""), "index.html");

describe("the brief's linked-deck requirement", () => {
  it("has lectures at all", () => {
    expect(lectures.length).toBeGreaterThan(0);
  });

  it("links at least one lecture to a deck", () => {
    // The real gap. `pnpm build` is green with zero decks linked.
    expect(
      withSlides.map((n) => n.id),
      "no lecture declares slides, so the brief's linked-deck requirement is unmet " +
        "and the build cannot tell you — it only checks links that exist",
    ).not.toEqual([]);
  });

  it("serves something substantial at each declared deck path", () => {
    // astromotion's own build step reports "no structural violations", but a
    // deck of one nearly empty slide passes that. This asserts there is a
    // deck's worth of content behind the link.
    for (const node of withSlides) {
      const path = builtPath(String(node.meta?.slides));
      expect(existsSync(path), `${node.meta?.slides} was not built`).toBe(true);
      const html = readFileSync(path, "utf8");
      expect(
        html.includes("reveal"),
        `${node.meta?.slides} built but does not look like a deck`,
      ).toBe(true);
      expect(
        html.length,
        `${node.meta?.slides} is only ${html.length} bytes — too small to be a real deck`,
      ).toBeGreaterThan(4000);
    }
  });

  it("resolves every declared deck path (redundant with the build's link checker)", () => {
    // Kept for defence in depth only. astro-broken-links-checker already
    // fails the build on a dangling slides path, because the theme renders it
    // as an anchor. Documented as redundant so nobody mistakes this for the
    // reason the file exists.
    const missing = withSlides
      .filter((node) => !existsSync(builtPath(String(node.meta?.slides))))
      .map((node) => `${node.id} claims ${node.meta?.slides}, which was not built`);
    expect(missing).toEqual([]);
  });
});
