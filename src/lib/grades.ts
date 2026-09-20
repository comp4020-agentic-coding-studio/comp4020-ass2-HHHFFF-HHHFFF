/**
 * The grade bands, in one place, because three things have to agree about
 * them: the content schema (which keys an assessment must supply), the table
 * that renders them, and the check that reads the built page.
 *
 * Ascending on purpose. A student reading this table is looking for the next
 * band up, not admiring the top one, and writing the descriptions cumulatively
 * ("everything in Distinction, and...") only reads correctly downwards if the
 * band below is the row above.
 */
export const gradeBands = [
  { key: "P", name: "Pass", range: "50–59" },
  { key: "CR", name: "Credit", range: "60–69" },
  { key: "D", name: "Distinction", range: "70–79" },
  { key: "HD", name: "High Distinction", range: "80–100" },
] as const;

export type GradeBandKey = (typeof gradeBands)[number]["key"];

export type GradeBandDescriptions = Record<GradeBandKey, string>;
