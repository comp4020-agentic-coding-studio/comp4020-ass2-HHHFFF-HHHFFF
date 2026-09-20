import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { gradeBands } from "../src/lib/grades";

/**
 * A promise about *where* information is, not about whether it exists.
 *
 * Volunteer students reading this site said the assessment pages answered the
 * wrong questions in the wrong order. Three specific complaints, and this file
 * is one assertion per complaint:
 *
 * 1. The index page listed a weight and a deadline and nothing about the work
 *    — so deciding whether today was the day to start meant opening four
 *    briefs and reading to the "What you submit" heading in each.
 * 2. Booking and rebooking the frequency check — the one rule in the course
 *    whose price for missing it is the whole component — was an `h2` near the
 *    foot of that brief, plus a sentence on the policies page, plus a related
 *    link. Every route to it went through something else first.
 * 3. A weight says what a component is worth and never what it has to be. No
 *    page said what the difference between a Credit and a Distinction was.
 *
 * ## What this checks, and what it cannot
 *
 * It checks placement: that each fact is rendered on the page a student would
 * look at, and — for the summary block — that it precedes the brief rather
 * than following it. Placement is exactly what nothing else here can see. The
 * build compiles the page, axe reads its contrast and landmarks, the link
 * checker resolves its hrefs, and all three are equally happy with a brief
 * that answers "what do I hand in" in its eleventh paragraph.
 *
 * It cannot check that a band description is *true*, or that the four bands
 * describe a real progression. It asserts they are four distinct strings, and
 * distinctness is where mechanical judgement stops; whether P is genuinely
 * below CR is a marker's call and a crit's.
 *
 * The content schema in src/content.config.ts carries the other half: these
 * fields are required, so a fifth assessment cannot ship without them and
 * this file never has to assert their existence, only their position.
 *
 * ## Proven red
 *
 * Every assertion here was run against the mechanism it names, broken, and
 * the messages below are the verbatim output:
 *
 * - Stripping the summary lines and the action line back out of
 *   `AssessmentsGrid.astro`, leaving the row as it was before this change:
 *
 *       AssertionError: frequency-check: the index page does not say what
 *       you submit
 *       AssertionError: frequency-check: the index does not name the prior
 *       step
 *
 * - Moving `<AssessmentSummary />` in `assessments/[slug].astro` from above
 *   `<Content />` to below it, which took three assertions down at once:
 *
 *       AssertionError: frequency-check: the summary is at 4396, the first
 *       heading at 349: expected 4396 to be less than 349
 *
 * - Deleting the `<GradeBands />` call: `frequency-check: no band table`.
 *   And editing readback-drills so its CR band repeated its D band verbatim,
 *   which the schema's 40-character floor cannot see:
 *
 *       AssertionError: readback-drills: 3 distinct band descriptions, not 4
 *
 * - Cutting booking and rebooking out of `frequency-check.md`'s `action`,
 *   and leaving the "## Booking and rebooking" section in the body exactly
 *   where students found it:
 *
 *       AssertionError: rebooking is first mentioned at 4426, after the
 *       first heading at 1894: expected 4426 to be less than 1894
 *
 *   That last one is the complaint encoded. `pnpm build` printed `41 page(s)
 *   built`, axe found nothing, the link checker found nothing, and every
 *   word of the rule was still on the page. The only thing wrong with it was
 *   where it was.
 */

interface ApiNode {
  id: string;
  type: string;
  meta?: Record<string, any>;
}

const api = JSON.parse(readFileSync(resolve("dist/api/index.json"), "utf8")) as {
  nodes: ApiNode[];
};

const assessments = api.nodes.filter((node) => node.type === "assessments");

const slugOf = (node: ApiNode) => node.id.replace(/^assessments\//, "");

/** The built HTML carries `&#39;` and friends; the frontmatter does not. */
const decode = (html: string) =>
  html
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/**
 * Everything is asserted inside `<main>`. The header, the search index and
 * the footer are on every page and would make a missing block look present.
 */
const mainOf = (path: string) => {
  const html = decode(readFileSync(resolve(path), "utf8"));
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>");
  expect(start, `${path} has no <main>`).toBeGreaterThan(-1);
  expect(end, `${path} has no </main>`).toBeGreaterThan(start);
  return html.slice(start, end);
};

const indexMain = mainOf("dist/assessments/index.html");

/**
 * The index is one `<li class="chrono-row">` per component.
 *
 * Both ends of the slice matter and the first version had neither. Dropping
 * the head of the split is not tidiness: the weight bar above the list links
 * every component, so a naive `find` returns the *prelude* for all four
 * slugs, and then "the index says what you submit" is really asking whether
 * the weight bar happens to quote the submission — which it never does, so
 * the check reports a true finding about the wrong region. Trimming at
 * `</li>` matters for the same reason at the other end: everything after the
 * last row, including the two sections below the list, would otherwise count
 * as the week 12 row's content.
 */
const rowFor = (slug: string) => {
  const rows = indexMain.split('<li class="chrono-row"').slice(1);
  const row = rows.find((candidate) => candidate.includes(`/assessments/${slug}/`));
  expect(row, `${slug} has no row on the index page`).toBeDefined();
  const end = (row as string).indexOf("</li>");
  expect(end, `${slug}: its row is never closed`).toBeGreaterThan(-1);
  return (row as string).slice(0, end);
};

const dateOnScreen = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(iso),
  );

describe("the assessment index answers the questions students ask it", () => {
  it("has assessments to check", () => {
    // Without this, every `for` below passes vacuously on an empty course.
    expect(assessments.length).toBeGreaterThan(0);
  });

  it("gives every component its own row", () => {
    for (const node of assessments) {
      expect(rowFor(slugOf(node)).length).toBeGreaterThan(0);
    }
  });

  it("says what you hand in and in what format, without opening the brief", () => {
    for (const node of assessments) {
      const slug = slugOf(node);
      const row = rowFor(slug);
      const submission = node.meta?.submission;
      expect(submission, `${slug} has no submission in the API`).toBeTruthy();
      expect(row, `${slug}: the index page does not say what you submit`).toContain(
        submission.what,
      );
      expect(row, `${slug}: the index page does not say the format`).toContain(
        submission.format,
      );
      expect(row, `${slug}: the index page does not say where it goes`).toContain(
        submission.where,
      );
    }
  });

  it("keeps the weight and the deadline in the same row", () => {
    for (const node of assessments) {
      const slug = slugOf(node);
      const row = rowFor(slug);
      expect(row, `${slug}: no weight in its row`).toContain(`${node.meta?.weight}%`);
      expect(row, `${slug}: no due date in its row`).toContain(
        dateOnScreen(String(node.meta?.due)),
      );
    }
  });

  it("names the step that has to happen before the deadline", () => {
    for (const node of assessments) {
      const slug = slugOf(node);
      const row = rowFor(slug);
      const action = node.meta?.action;
      expect(action, `${slug} has no action in the API`).toBeTruthy();
      expect(row, `${slug}: the index does not name the prior step`).toContain(
        action.label,
      );
      expect(row, `${slug}: the index does not say when that step happens`).toContain(
        action.when,
      );
    }
  });
});

describe("each brief leads with its summary", () => {
  it("puts the summary above the brief, not after it", () => {
    for (const node of assessments) {
      const slug = slugOf(node);
      const main = mainOf(`dist/assessments/${slug}/index.html`);
      const summary = main.indexOf('class="glance"');
      // The first heading inside `main` is the brief's own first section —
      // the page title is an `h1` outside it. Anything the summary is for
      // has to be readable before a student reaches that.
      const firstHeading = main.search(/<h2[^>]*>/);
      expect(summary, `${slug}: no summary block`).toBeGreaterThan(-1);
      expect(firstHeading, `${slug}: the brief has no headings`).toBeGreaterThan(-1);
      expect(
        summary,
        `${slug}: the summary is at ${summary}, the first heading at ${firstHeading}`,
      ).toBeLessThan(firstHeading);
    }
  });

  it("carries the deadline, the weight and the submission in that summary", () => {
    for (const node of assessments) {
      const slug = slugOf(node);
      const main = mainOf(`dist/assessments/${slug}/index.html`);
      const summary = main.slice(
        main.indexOf('class="glance"'),
        main.search(/<h2[^>]*>/),
      );
      expect(summary, `${slug}: no due date in the summary`).toContain(
        dateOnScreen(String(node.meta?.due)),
      );
      expect(summary, `${slug}: no weight in the summary`).toContain(
        `${node.meta?.weight}%`,
      );
      expect(summary, `${slug}: no submission format in the summary`).toContain(
        node.meta?.submission.format,
      );
      expect(summary, `${slug}: the prior step is not in the summary`).toContain(
        node.meta?.action.label,
      );
    }
  });

  it("puts booking and rebooking above the brief on the frequency check", () => {
    // The complaint that started this file. The words were always on the
    // page; what was wrong was that every route to them ran through
    // something else — the bottom of the brief, the policies page, or a
    // related link. So this asserts position, not presence.
    const main = mainOf("dist/assessments/frequency-check/index.html");
    const firstHeading = main.search(/<h2[^>]*>/);
    const booking = main.toLowerCase().indexOf("rebook");
    expect(booking, "the frequency check never mentions rebooking").toBeGreaterThan(-1);
    expect(
      booking,
      `rebooking is first mentioned at ${booking}, after the first heading at ${firstHeading}`,
    ).toBeLessThan(firstHeading);
  });
});

describe("every brief says what each grade looks like", () => {
  it("publishes all four grade bands on every brief", () => {
    for (const node of assessments) {
      const slug = slugOf(node);
      const main = mainOf(`dist/assessments/${slug}/index.html`);
      expect(main, `${slug}: no band table`).toContain('id="grade-bands"');
      for (const band of gradeBands) {
        const description = node.meta?.bands?.[band.key];
        expect(description, `${slug}: no ${band.key} band in the API`).toBeTruthy();
        expect(main, `${slug}: the ${band.key} band is not on the page`).toContain(
          description,
        );
        expect(main, `${slug}: the ${band.key} mark range is not on the page`).toContain(
          band.range,
        );
      }
    }
  });

  it("gives each band a description of its own", () => {
    // A four-row table whose rows say the same thing is a weight with extra
    // steps, which is the thing students said was not enough. Distinctness is
    // as far as a machine can take this; whether the progression is the right
    // one is a marker's judgement.
    for (const node of assessments) {
      const slug = slugOf(node);
      const descriptions = gradeBands.map((band) => node.meta?.bands?.[band.key]);
      const distinct = new Set(descriptions);
      expect(
        distinct.size,
        `${slug}: ${distinct.size} distinct band descriptions, not ${gradeBands.length}`,
      ).toBe(gradeBands.length);
    }
  });
});
