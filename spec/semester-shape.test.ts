import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The brief requires twelve dated teaching weeks, and this course promises on
 * its home page that there is an hour on frequency every week.
 *
 * The schema caps `week` at 1..12 but requires neither coverage nor
 * uniqueness: eleven weeks passes, and so does two lectures in week 3 and
 * none in week 7. This asserts over the whole range rather than counting,
 * because a count of 12 is also satisfied by a duplicate plus a gap.
 *
 * Proven red by changing week-07.md's `week: 7` to `week: 8` and rebuilding:
 * failed with "lectures has 0 entries for week 7".
 *
 * Note the demonstration is a re-numbering rather than a deletion. Deleting
 * the file would have failed the *build* instead — sessions/07-transcript-triage
 * declares `related: lectures/week-07`, and a dangling content reference
 * aborts the build before any test runs. A break has to isolate the mechanism
 * under test, or it proves something else went wrong first.
 */

const TEACHING_WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);
const ONE_PER_WEEK = ["lectures", "sessions"] as const;

interface ApiNode {
  id: string;
  type: string;
  meta?: Record<string, unknown>;
}

const api = JSON.parse(
  readFileSync(resolve("dist/api/index.json"), "utf8"),
) as { nodes: ApiNode[]; course: { startDate: string; endDate: string } };

const byWeek = (type: string): Map<number, string[]> => {
  const map = new Map<number, string[]>();
  for (const node of api.nodes.filter((n) => n.type === type)) {
    const week = Number(node.meta?.week);
    map.set(week, [...(map.get(week) ?? []), node.id]);
  }
  return map;
};

describe("semester shape", () => {
  for (const type of ONE_PER_WEEK) {
    it(`has exactly one ${type} entry for each of the twelve weeks`, () => {
      const map = byWeek(type);
      for (const week of TEACHING_WEEKS) {
        const entries = map.get(week) ?? [];
        expect(entries.length, `${type} has ${entries.length} entries for week ${week}`).toBe(1);
      }
    });

    it(`puts no ${type} entry outside weeks 1 to 12`, () => {
      const stray = [...byWeek(type).entries()].filter(
        ([week]) => !TEACHING_WEEKS.includes(week),
      );
      expect(stray.map(([w, ids]) => `week ${w}: ${ids.join(", ")}`)).toEqual([]);
    });
  }

  it("orders each week's session on or after its lecture", () => {
    // The course teaches doctrine first and drills it afterwards; several
    // session pages tell students to arrive having read that week's lecture.
    const lectures = byWeek("lectures");
    const sessions = byWeek("sessions");
    const dateOf = (id: string): string =>
      String(api.nodes.find((n) => n.id === id)?.meta?.date).slice(0, 10);

    for (const week of TEACHING_WEEKS) {
      const lecture = lectures.get(week)?.[0];
      const session = sessions.get(week)?.[0];
      if (!lecture || !session) continue;
      const [lectureDate, sessionDate] = [dateOf(lecture), dateOf(session)];
      expect(
        sessionDate >= lectureDate,
        `week ${week}: session ${sessionDate} falls before lecture ${lectureDate}`,
      ).toBe(true);
    }
  });
});
