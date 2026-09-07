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
