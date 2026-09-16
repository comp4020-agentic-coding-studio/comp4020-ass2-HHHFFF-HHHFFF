import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A third promise, of the same shape as the two in `phraseology.test.ts`: if
 * this site draws you a measurement, the drawing agrees with the number
 * printed beside it.
 *
 * The week 5 figure exists for one reason — the third exit at Los Rodeos
 * needed a turn of about 148 degrees and the fourth about 45, which is
 * obvious drawn and almost unsayable. That makes the drawing a *claim*, and
 * an unchecked one: nothing in the build looks at path geometry, axe treats
 * everything inside `role="img"` as presentational, and a screenshot of four
 * grey diagonals looks correct at any angle at all. The first version drew
 * every exit at a convenient 56 degrees while the caption said 148.
 *
 * So this reads the angles back out of the rendered SVG and compares them to
 * the degrees the key text states, rather than to a constant. A constant
 * would let the prose and the drawing drift apart in step with each other;
 * comparing them to each other is the promise.
 *
 * ## What it checks, and what it cannot
 *
 * It checks that the four stubs encode exactly two distinct turns, that the
 * odd one out is the number the "fourth exit" key claims, and that the other
 * three are the number the "third exit" key claims. It cannot check that 148
 * and 45 are the right numbers — that is what the page's `links:` are for,
 * and `phraseology.test.ts` is what holds the citation in place.
 *
 * ## Proven red
 *
 * Broken by flipping the sign in `exitRun`, which is the bug it was written
 * for — the component computed the run as `RISE / tan(turn)` instead of
 * `-RISE / tan(turn)`, so 148 degrees drew as 32 and 45 drew as 135, and the
 * two exits swapped. Verbatim:
 *
 *     AssertionError: the drawing disagrees with the key beside it
 *     - Expected  "45"
 *     + Received  "135"
 *
 * Broken a second time from the other side, by editing the key text from
 * "about 148 degrees" to "about 150 degrees" with the drawing untouched,
 * which failed on the 148/150 mismatch. Both directions matter: the check is
 * there to stop the two drifting apart, not to pin either one.
 */

const html = readFileSync(resolve("dist/lectures/week-05/index.html"), "utf8");

/** Turn, in whole degrees, that an aircraft heading in -x makes to follow a
 *  stub drawn from (x1,y1) to (x2,y2). Mirrors `exitRun` in the component,
 *  inverted: this is the measurement, that is the construction. */
const turnOf = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.round((Math.atan2(-(y2 - y1), -(x2 - x1)) * 180) / Math.PI);

/** Every two-point stub in the figure's `pavement-stroke` group, minus the
 *  apron connector, which is vertical and is not an exit. */
const drawnTurns = ((): number[] => {
  const group = html.match(/class="[^"]*pavement-stroke[^"]*"[^>]*>([\s\S]*?)<\/g>/);
  if (!group) return [];
  return [...group[1].matchAll(/d="M\s*(-?[\d.]+)\s+(-?[\d.]+)\s*L\s*(-?[\d.]+)\s+(-?[\d.]+)"/g)]
    .map((m) => [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])] as const)
    .filter(([x1, , x2]) => x1 !== x2)
    .map(([x1, y1, x2, y2]) => turnOf(x1, y1, x2, y2));
})();

/** The degrees a named key claims, read out of the rendered prose. */
const claimedBy = (keyTitle: string): string | undefined => {
  const item = html.match(
    new RegExp(`${keyTitle}<\\/strong>([\\s\\S]{0,400}?)<\\/span>`, "i"),
  );
  return item?.[1].match(/(\d+)\s*degrees/)?.[1];
};

const tally = (values: number[]): Map<number, number> => {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return counts;
};

describe("the week 5 runway figure", () => {
  it("is on the page at all", () => {
    // Without this, every assertion below passes vacuously the moment the
    // figure is renamed, restyled into different markup, or dropped.
    expect(html).toContain("geometry-desc");
    expect(drawnTurns).toHaveLength(4);
    expect(claimedBy("The third exit\\.")).toBeDefined();
    expect(claimedBy("The fourth exit\\.")).toBeDefined();
  });

  it("draws exactly two kinds of exit", () => {
    // Four exits so "the third one" is a thing you can count to, and two
    // angles because the difference between them is the whole point.
    expect([...tally(drawnTurns).keys()].sort((a, b) => a - b)).toHaveLength(2);
  });

  it("draws the turn the key beside it claims", () => {
    const counts = tally(drawnTurns);
    const odd = [...counts].find(([, n]) => n === 1)?.[0];
    const rest = [...counts].find(([, n]) => n === 3)?.[0];

    expect(
      { fourth: String(odd), third: String(rest) },
      "the drawing disagrees with the key beside it",
    ).toEqual({
      fourth: claimedBy("The fourth exit\\."),
      third: claimedBy("The third exit\\."),
    });
  });
});
