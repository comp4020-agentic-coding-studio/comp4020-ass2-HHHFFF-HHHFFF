import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The brief requires assessment components that add up to 100%.
 *
 * The content schema in src/content.config.ts already enforces that the
 * marking criteria *within* one weighted assessment sum to 100. Nothing
 * enforces the total across assessments, so a course can ship four components
 * worth 90% and every other check stays green.
 *
 * Proven red by changing readback-drills from 15 to 10 and rebuilding: the
 * first assertion failed with "components sum to 95, not 100".
 */

interface ApiNode {
  id: string;
  type: string;
  meta?: Record<string, unknown>;
}

const api = JSON.parse(
  readFileSync(resolve("dist/api/index.json"), "utf8"),
) as { nodes: ApiNode[] };

const assessments = api.nodes.filter((node) => node.type === "assessments");

describe("assessment weights", () => {
  it("has assessments at all", () => {
    // Guards the assertion below: sum([]) === 0 would otherwise report a
    // course with no assessments as merely mis-weighted.
    expect(assessments.length).toBeGreaterThan(0);
  });

  it("sums the components to exactly 100", () => {
    const total = assessments.reduce((sum, node) => sum + Number(node.meta?.weight), 0);
    const breakdown = assessments
      .map((node) => `${node.id}=${node.meta?.weight}`)
      .join(", ");
    expect(total, `components sum to ${total}, not 100 — ${breakdown}`).toBe(100);
  });

  it("gives every component a positive weight", () => {
    for (const node of assessments) {
      const weight = Number(node.meta?.weight);
      expect(Number.isFinite(weight), `${node.id} has no numeric weight`).toBe(true);
      expect(weight, `${node.id} is worth ${weight}`).toBeGreaterThan(0);
    }
  });
});
