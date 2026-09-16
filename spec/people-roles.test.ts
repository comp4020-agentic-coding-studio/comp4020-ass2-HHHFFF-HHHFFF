import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * If a person's content file states a role, the built pages say it.
 *
 * This is written for a bug that shipped and stayed invisible.
 * `src/content.config.ts` declares `role: z.string().trim().min(1)` — a free
 * string — but two copies of a lookup table, one in `PeopleGrid.astro` and one
 * in `people/[slug].astro`, both claimed in a comment to be mapping "the role
 * enum (convenor|tutor|guest|other)". `role: co-lecturer` validated fine and
 * then missed both tables: no label, so the whole row was omitted, and no
 * rank, so the fallback sorted that person last. The build was green — a
 * missing line between a heading and a paragraph is not an error, it is a
 * design choice, right up until you notice only two of three cards have one.
 *
 * ## Why it reads the <dd>, not the page
 *
 * A page-wide search for "co-lecturer" passes *with the bug present*: his
 * description opens "Co-lecturer. Twenty-two years on one en-route sector",
 * and the card prints that description. So does the meta description, and the
 * search index, and `llms-full.txt`. Grepping the page would have been a check
 * that could never go red — measuring the prose while claiming to measure the
 * markup.
 *
 * So the detail page is read as the `<dd>` belonging to the `<dt>Role</dt>`,
 * and the index page as the set of `<small>` labels the cards carry. Both are
 * the specific element the bug removed.
 *
 * ## Why it compares to the frontmatter, not to roleLabel()
 *
 * Importing `roleLabel` and asserting the page matches it would assert only
 * that the renderer called the function — true even if the function returned
 * "" for everything. The comparison is against the value the *content file*
 * states, case-insensitively, which is the promise a reader cares about: the
 * site says what the data says.
 *
 * ## Proven red
 *
 * Restored the pre-fix lookup table in `roleLabel` (`{convenor, tutor, guest,
 * other}`, unknown roles to `""`) and rebuilt. The build stayed green — 41
 * pages, no broken links, no axe violations — which is the whole reason this
 * file exists. Verbatim:
 *
 *     AssertionError: halvard-sunde: the page states no role, but the
 *     content file says "co-lecturer": expected '' to be 'co-lecturer'
 *     - Expected
 *     + Received
 *     - co-lecturer
 *
 *     AssertionError: the people index is missing a role label: expected
 *     [ 'convenor', 'tutor' ] to deeply equal
 *     [ 'co-lecturer', 'convenor', 'tutor' ]
 *
 * The ordering assertion was proven separately, by restoring the pre-fix
 * `roleOrder` (no `co-lecturer` key, so the `?? 99` fallback applied):
 *
 *     AssertionError: the cards are not in seniority order
 *     - Expected  [ "convenor", "co-lecturer", "tutor" ]
 *     + Received  [ "convenor", "tutor", "co-lecturer" ]
 *
 * ## What it detects, and what it provably does not
 *
 * It detects an *absent* label. It cannot detect a *wrong* one, and this was
 * checked rather than assumed: changing Halvard's frontmatter to `role:
 * co-teacher` with the renderer untouched leaves every assertion green,
 * because `roleLabel` derives the label from the value, so the two agree no
 * matter what the value is. That is a real limit and it is the right one to
 * have — the free-string schema means the content file *is* the authority on
 * what somebody's role is called, so there is no second source to disagree
 * with. The failure mode worth guarding is the one that actually happened:
 * the value being dropped on the floor between the schema and the page.
 */

const PEOPLE = "src/content/people";
const DIST = "dist/people";

/** The schema's escape hatch: deliberately renders no label. */
const SILENT = "other";

interface Person {
  slug: string;
  role: string;
}

function people(): Person[] {
  return readdirSync(resolve(PEOPLE))
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => {
      const source = readFileSync(resolve(PEOPLE, f), "utf8");
      const role = source.match(/^role:\s*(\S+)\s*$/m);
      return { slug: f.replace(/\.mdx?$/, ""), role: role ? role[1] : "" };
    })
    .filter((p) => p.role !== "");
}

describe("a person's stated role reaches the page", () => {
  const roster = people();

  it("finds a roster to check", () => {
    // Guards against the glob silently matching nothing, which would make
    // every assertion below vacuous.
    expect(roster.length).toBeGreaterThanOrEqual(3);
  });

  for (const { slug, role } of roster) {
    it(`${slug} states "${role}" in the Role row`, () => {
      const html = readFileSync(resolve(DIST, slug, "index.html"), "utf8");
      // Scoped to the <dd> that belongs to <dt>Role</dt>. Astro adds
      // data-astro-cid-* to both once the page carries a <style>.
      const row = html.match(/<dt[^>]*>Role<\/dt>\s*<dd[^>]*>([^<]*)<\/dd>/);
      const stated = row ? row[1].trim().toLowerCase() : "";

      if (role === SILENT) {
        expect(stated, `${slug}: "${SILENT}" should print no label`).toBe("");
        return;
      }

      expect(
        stated,
        `${slug}: the page states no role, but the content file says "${role}"`,
      ).toBe(role.toLowerCase());
    });
  }

  it("the index cards carry every role in the roster", () => {
    const html = readFileSync(resolve(DIST, "index.html"), "utf8");
    const labels = [...html.matchAll(/<small[^>]*>([^<]*)<\/small>/g)].map((m) =>
      m[1].trim().toLowerCase(),
    );
    const expected = roster
      .filter((p) => p.role !== SILENT)
      .map((p) => p.role.toLowerCase())
      .sort();

    expect(
      expected.filter((role) => labels.includes(role)).sort(),
      "the people index is missing a role label",
    ).toEqual(expected);
  });

  it("the cards are ordered by teaching seniority", () => {
    // The other half of the same bug: an unranked role fell to `?? 99` and
    // sorted last, so the co-lecturer appeared below the tutor. Read the
    // labels in document order and compare to the roster sorted by the rank
    // the module declares.
    const html = readFileSync(resolve(DIST, "index.html"), "utf8");
    const rendered = [...html.matchAll(/<small[^>]*>([^<]*)<\/small>/g)].map((m) =>
      m[1].trim().toLowerCase(),
    );
    const seniority = ["convenor", "co-lecturer", "tutor", "guest"];
    const expected = roster
      .filter((p) => p.role !== SILENT && seniority.includes(p.role.toLowerCase()))
      .map((p) => p.role.toLowerCase())
      .sort((a, b) => seniority.indexOf(a) - seniority.indexOf(b));

    expect(
      rendered.filter((r) => expected.includes(r)),
      "the cards are not in seniority order",
    ).toEqual(expected);
  });
});
