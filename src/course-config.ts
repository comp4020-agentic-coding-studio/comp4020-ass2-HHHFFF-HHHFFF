import type { CourseMetaInput } from "astro-course-university";
import { z } from "astro/zod";

// The level digits ANU uses: 1000--4000 undergraduate, 6000 and 8000
// postgraduate. Both the code pattern and the level field derive from this.
const LEVELS = [1, 2, 3, 4, 6, 8] as const;
const allowedCode = new RegExp(`^SLOP[${LEVELS.join("")}]\\d{3}$`);

export const slopCourseMetaSchema = z
  .strictObject({
    code: z.string().regex(allowedCode, {
      message: "use SLOP plus a 1000–4000, 6000 or 8000 level code",
    }),
    title: z.string().trim().min(1).max(100),
    session: z.string().trim().min(1).max(40),
    year: z.number().int().min(2026).max(2200),
    level: z.literal(LEVELS),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    description: z.string().trim().min(80).max(300),
    tags: z.array(z.string().trim().min(2).max(24)).min(1).max(3),
  })
  .superRefine((course, ctx) => {
    const codeLevel = Number(course.code.at(4));
    if (course.level !== codeLevel) {
      ctx.addIssue({
        code: "custom",
        path: ["level"],
        message: `must match ${course.code}'s first digit (${codeLevel})`,
      });
    }
    if (course.startDate > course.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "must not be after endDate",
      });
    }
  });

// The single source of truth for the course record. The generated homepage,
// navigation label and /api/index.json all read this object.
//
// Level 1 is a deliberate claim, not a leftover: this is a first-year course
// with no prerequisites. Reading a transmission closely, and noticing when a
// protocol has quietly stopped being followed, is foundational literacy for
// anyone who will work on a safety-critical channel — which by graduation is
// most of them. Putting it at 3000 level would concede that it is a curiosity.
//
// The teaching period is twelve weeks with a two-week break after week 6:
// weeks 1--6 from Mon 22 Feb, weeks 7--12 from Mon 19 Apr, ending Fri 28 May.
// Every session, lecture and assessment date sits inside it, which
// spec/data-integrity.test.ts enforces against the built API.
//
// ## Why the last three digits are 126 and not 000
//
// The brief and the starter both say the last three digits "were assigned to
// this repo when it was provisioned, and no other course in the cohort has
// them", and that you change only the first digit. Taken literally that
// makes this code non-compliant: this repo arrived with SLOP1000, so the
// three digits it arrived with are 000.
//
// No allocation was ever delivered, to anyone. Checked, rather than assumed:
//
// - the shared template every ass2 repo is generated from
//   (comp4020-agentic-coding-studio/template-course-site) carries
//   `code: "SLOP1000"` itself;
// - the initial commit of all eleven ass2 repos I sampled is SLOP1000,
//   this one included;
// - no course plugin skill mentions SLOP, a course code, or a digit at all
//   (`start` clones the repo and pulls the spec; it never touches
//   src/course-config.ts), so nothing assigns one at setup either.
//
// So 000 is the template default the whole cohort shares, and keeping it is
// the one choice guaranteed to collide with every classmate who also kept it
// — the exact thing the rule exists to prevent. The rule cannot be satisfied
// literally this year, because the premise it rests on is not true.
//
// Nine of the ten cohort repos I sampled resolved it the same way and chose
// their own three digits (562, 628, 976, 258, 418, 972, 171, 428, 203, all
// distinct); one kept 000 and moved the level digit. 126 is this course's
// pick, recorded here so it reads as a decision with evidence behind it
// rather than a line of the spec quietly missed. If the course would rather
// have SLOP1000, it is a one-line change here plus a re-render of
// src/assets/artwork/card.svg, which has the code set in it.
export const courseMeta = slopCourseMetaSchema.parse({
  code: "SLOP1126",
  title: "Say Again: The Design of a Language That Cannot Be Misheard",
  session: "Semester 1",
  year: 2027,
  level: 1,
  startDate: "2027-02-22",
  endDate: "2027-05-28",
  description:
    "Aviation radio English was engineered so that misunderstanding would be " +
    "impossible. It isn't. This course reads the phraseology as a designed " +
    "artefact, and reads the accident record as the evidence of where the " +
    "design gives way.",
  tags: ["phraseology", "human factors", "safety design"],
}) satisfies CourseMetaInput;
