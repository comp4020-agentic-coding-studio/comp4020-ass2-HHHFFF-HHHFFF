/**
 * How a person's role is labelled and ordered.
 *
 * ## Why this is a module and not two lookup tables
 *
 * It was two lookup tables — one copied into PeopleGrid.astro and one into
 * people/[slug].astro — and both carried the same comment: "map the role enum
 * (convenor|tutor|guest|other) to display labels". The schema has no such
 * enum. `src/content.config.ts` declares `role: z.string().trim().min(1)`, a
 * free string, so `role: co-lecturer` validates happily and then falls through
 * both tables at once: no label, so the line is omitted entirely, and no rank,
 * so the fallback sorts that person last.
 *
 * That shipped for a while and was invisible, because a missing line between a
 * heading and a paragraph looks like a design choice. Replacing the geometric
 * portraits with photographs is what surfaced it — with an image above every
 * card, the two cards with a role line and the one without stopped looking
 * like a rhythm and started looking like a hole.
 *
 * So the label is now *derived* rather than looked up. An unknown role renders
 * as itself, capitalised, which is wrong-looking at worst and can never again
 * be silently absent. Only the two cases where the derivation is not what we
 * want are named explicitly.
 */

/** Roles whose label is not just the value capitalised. */
const EXPLICIT_LABELS: Record<string, string> = {
  // The bare value reads as a category; the job has a name.
  guest: "Guest lecturer",
  // `other` is the schema's escape hatch. Printing "Other" under somebody's
  // name says less than printing nothing.
  other: "",
};

/** Teaching seniority, for grouping the grid. Unknown roles sort last. */
const RANK: Record<string, number> = {
  convenor: 0,
  "co-lecturer": 1,
  tutor: 2,
  guest: 3,
  other: 4,
};

export function roleLabel(role: string | undefined): string {
  if (!role) return "";
  const explicit = EXPLICIT_LABELS[role];
  if (explicit !== undefined) return explicit;
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function roleRank(role: string | undefined): number {
  return RANK[role ?? "other"] ?? 99;
}
