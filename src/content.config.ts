import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { courseNodeSchema } from "astro-course-university/schemas";

const weekSchema = z.coerce.number().int().min(1).max(12);
const courseNodeLoader = (dir: string) =>
  glob({ pattern: ["**/*.{md,mdx}", "!**/CLAUDE.md"], base: `src/content/${dir}` });
const teacherRefs = z.array(reference("people")).min(1);

const weightedMarking = z
  .object({
    mode: z.literal("weighted"),
    criteria: z
      .array(z.object({ name: z.string().trim().min(1), weight: z.number().positive() }))
      .min(1),
  })
  .superRefine((marking, ctx) => {
    const total = marking.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        path: ["criteria"],
        message: `criterion weights sum to ${total}, not 100`,
      });
    }
  });

const holisticMarking = z.object({
  mode: z.literal("holistic"),
  description: z.string().trim().min(40),
});

/**
 * What you hand in, in what form, and where it goes.
 *
 * This was prose halfway down each brief. Students said they want it on the
 * index — they decide *whether* to open a brief from the weight, the deadline
 * and the shape of the deliverable, and only read the brief itself when they
 * start the work. Frontmatter rather than a paragraph is what lets the
 * listing page render it, and required rather than optional is what stops a
 * fifth assessment shipping without it.
 */
const submissionSchema = z.object({
  what: z.string().trim().min(1),
  format: z.string().trim().min(1),
  where: z.string().trim().min(1),
});

/**
 * The step before the deadline that is not the submission itself: collecting
 * an allocation, clearing a domain, booking a slot.
 *
 * All four assessments have one and all four used to bury it in a body
 * section — the frequency check's booking and rebooking rule worst of all,
 * reachable only by reading to the bottom of the brief or by following a
 * related link. Missing one of these costs a student the component, so it is
 * a field that renders near the top rather than a paragraph that renders in
 * reading order.
 */
const actionSchema = z.object({
  label: z.string().trim().min(1),
  when: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  href: z.string().startsWith("/").optional(),
});

/**
 * What work at each grade looks like, one description per band.
 *
 * A weight says what a component is worth and nothing about what it has to
 * be, which is the gap students named. The 40-character floor is there so a
 * band cannot be filled with "good work" to satisfy the schema; that a band
 * says something *different* from its neighbours is not expressible here and
 * is asserted in spec/assessment-summary.test.ts instead.
 */
const bandsSchema = z.object({
  P: z.string().trim().min(40),
  CR: z.string().trim().min(40),
  D: z.string().trim().min(40),
  HD: z.string().trim().min(40),
});

export const collections = {
  sessions: defineCollection({
    loader: courseNodeLoader("sessions"),
    schema: courseNodeSchema
      .extend({
        week: weekSchema,
        date: z.coerce.date(),
        teachers: teacherRefs.optional(),
      })
      .loose(),
  }),

  assessments: defineCollection({
    loader: courseNodeLoader("assessments"),
    schema: courseNodeSchema
      .extend({
        week: weekSchema,
        due: z.coerce.date(),
        weight: z.coerce.number().positive().max(100),
        submission: submissionSchema,
        action: actionSchema,
        bands: bandsSchema,
        marking: z.discriminatedUnion("mode", [weightedMarking, holisticMarking]).optional(),
      })
      .loose(),
  }),

  lectures: defineCollection({
    loader: courseNodeLoader("lectures"),
    schema: courseNodeSchema
      .extend({
        week: weekSchema,
        date: z.coerce.date(),
        teachers: teacherRefs.optional(),
        slides: z
          .string()
          .regex(/^\/decks\/[a-z0-9-]+\/$/)
          .optional(),
      })
      .loose(),
  }),

  people: defineCollection({
    loader: courseNodeLoader("people"),
    schema: ({ image }) =>
      z
        .object({
          title: z.string().trim().min(1),
          description: z.string().trim().min(40),
          role: z.string().trim().min(1),
          contact: z.string().trim().min(1).optional(),
          affiliation: z.string().trim().min(1).optional(),
          email: z.email().optional(),
          url: z.url().optional(),
          photo: image().optional(),
          photoAlt: z.string().trim().optional(),
          // The index card and the person's own page show different images on
          // purpose: the card an illustration of them at work, their page the
          // portrait. See scripts/tone-portraits.ts for why there are two.
          cardImage: image().optional(),
          cardImageAlt: z.string().trim().optional(),
          published: z.coerce.boolean().default(true),
        })
        .superRefine((person, ctx) => {
          if (person.photo && !person.photoAlt) {
            ctx.addIssue({
              code: "custom",
              path: ["photoAlt"],
              message: "describe the photo when one is supplied",
            });
          }
          if (person.cardImage && !person.cardImageAlt) {
            ctx.addIssue({
              code: "custom",
              path: ["cardImageAlt"],
              message: "describe the card illustration when one is supplied",
            });
          }
        }),
  }),
};
