import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { deviations, findDeviations } from "../src/data/phraseology";

/**
 * The two promises this course makes that the build cannot check.
 *
 * 1. If this site shows you a transmission, it is either correct, or it is
 *    labelled as wrong, or it is quoted from the record and cited.
 * 2. If a page names an accident, it cites that accident's official report.
 *
 * Both are course-design commitments rather than platform facts, which is why
 * they live here. Neither is enforced anywhere else: the theme sets
 * `checkExternalLinks: false`, so a dead or invented citation ships silently,
 * and nothing at all inspects prose.
 *
 * ## What this check can and cannot tell you
 *
 * `deviations` in src/data/phraseology.ts is a **blocklist**. A transmission
 * contains callsigns, place names, levels and squawks that no glossary could
 * enumerate, so this can prove a known error is present and can never prove a
 * transmission is fully standard. The `it(...)` names say "contains no known
 * deviation", not "is standard", because the difference is the whole point —
 * a check whose name overstates what it measures is worse than no check.
 *
 * Likewise, part 2 checks a citation's **provenance**, not its liveness: that
 * the URL belongs to an official investigator. Fetching it would make the
 * suite depend on the network and on hosts that serve bot challenges — during
 * this build, six invented SKYbrary URLs all returned HTTP 200 from a
 * challenge page, so a liveness check of that kind would have been worse than
 * useless. Citations were verified once, by hand, in a real browser against a
 * known-bad control path.
 *
 * ## Notation
 *
 * ```atc              a model transmission — must contain no known deviation
 * ```atc-nonstandard  a counter-example  — must contain at least one
 * ```atc-verbatim     quoted from the record — its page must carry a citation
 *
 * `atc-nonstandard` requiring a deviation is what stops the label being a
 * blanket exemption: relabelling a bad model as a counter-example to silence
 * the check makes a different assertion fail. `atc-verbatim` is constrained
 * the same way, by requiring the page to cite a source.
 *
 * ## Proven red
 *
 * Each assertion was made to fail by breaking the thing it names, then
 * restored. Verbatim outcomes:
 *
 * - **Model containing a deviation.** Relabelled week 4's position-and-hold
 *   `atc-nonstandard` block as `atc`. Failed with `lectures/week-04 shows a
 *   model transmission containing "position and hold"`.
 * - **Toothless counter-example.** Relabelled week 1's clean cleared-to-land
 *   `atc` block as `atc-nonstandard`. Failed with "labels a transmission
 *   non-standard but it contains none of the 12 forms in the glossary". This
 *   is the assertion that stops the label being used as an exemption, so it
 *   mattered most that it could fail.
 * - **Uncited verbatim quote.** Relabelled the same week 1 block as
 *   `atc-verbatim`; week 1 carries no `links:`. Failed listing
 *   `lectures/week-01`.
 * - **Citation provenance.** Repointed week 3's Linate citation from
 *   skybrary.aero to a plausible-looking blog host. Failed with
 *   "lectures/week-03 names incident linate-2001 with no citation on an
 *   investigator's host (has: some-aviation-blog.example.com)".
 */

const INVESTIGATOR_HOSTS = [
  "skybrary.aero", // EUROCONTROL — hosts primary reports on its bookshelf
  "ntsb.gov",
  "faa.gov",
  "icao.int",
  "bea.aero",
  "atsb.gov.au",
  "ansv.it",
  "bfu-web.de",
  "tsb.gc.ca",
  "taic.org.nz",
  "gov.uk", // AAIB
];

const FENCE = /```(atc(?:-[a-z]+)?)[^\n]*\r?\n([\s\S]*?)```/g;

interface Transmission {
  /** Where it came from, for failure messages. */
  source: string;
  /** `atc`, `atc-nonstandard`, `atc-verbatim`, or something misspelled. */
  kind: string;
  text: string;
}

const transmissionsIn = (source: string, body: string): Transmission[] =>
  [...body.matchAll(FENCE)].map((m) => ({ source, kind: m[1], text: m[2] }));

const isInvestigator = (url: string): boolean => {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return INVESTIGATOR_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
};

// --- the built API: one JSON per content node, carrying body, links and meta.
// dist/api/index.json carries neither body nor links, so it is only the index.
interface NodeJson {
  id: string;
  type: string;
  links?: { label: string; url: string }[];
  meta?: Record<string, unknown>;
  body?: string;
}

const index = JSON.parse(
  readFileSync(resolve("dist/api/index.json"), "utf8"),
) as { nodes: { id: string; type: string }[] };

const nodes: NodeJson[] = index.nodes.map(
  (n) => JSON.parse(readFileSync(resolve(`dist/api/${n.id}.json`), "utf8")) as NodeJson,
);

// --- decks are not content-collection entries, so they appear nowhere in the
// API. Their source is read directly; there is no build artefact that
// preserves the fence tag (shiki rewrites data-language to "plaintext").
const deckDir = resolve("src/decks");
const deckTransmissions = readdirSync(deckDir)
  .filter((f) => f.endsWith(".deck.mdx"))
  .flatMap((f) => transmissionsIn(`decks/${f}`, readFileSync(resolve(deckDir, f), "utf8")));

const nodeTransmissions = nodes.flatMap((n) => transmissionsIn(n.id, n.body ?? ""));
const allTransmissions = [...nodeTransmissions, ...deckTransmissions];

const KNOWN_KINDS = ["atc", "atc-nonstandard", "atc-verbatim"];

describe("transmissions shown on the site", () => {
  it("finds transmissions to check at all", () => {
    // Without this, every assertion below passes vacuously if the fence
    // regex stops matching — which it would if the notation were renamed.
    expect(allTransmissions.length).toBeGreaterThan(10);
    expect(deckTransmissions.length).toBeGreaterThan(0);
  });

  it("uses only the three notations the course defines", () => {
    const unknown = allTransmissions
      .filter((t) => !KNOWN_KINDS.includes(t.kind))
      .map((t) => `${t.source}: \`\`\`${t.kind}`);
    expect(unknown).toEqual([]);
  });

  it("shows no model transmission containing a known deviation", () => {
    const offences = allTransmissions
      .filter((t) => t.kind === "atc")
      .flatMap((t) =>
        findDeviations(t.text).map(
          (d) => `${t.source} shows a model transmission containing "${d.form}"`,
        ),
      );
    expect(offences).toEqual([]);
  });

  it("makes every counter-example actually contain a deviation", () => {
    const toothless = allTransmissions
      .filter((t) => t.kind === "atc-nonstandard")
      .filter((t) => findDeviations(t.text).length === 0)
      .map(
        (t) =>
          `${t.source} labels a transmission non-standard but it contains none of the ` +
          `${deviations.length} forms in the glossary — either fix the example or ` +
          `stop using the label as an exemption`,
      );
    expect(toothless).toEqual([]);
  });

  it("only quotes the record verbatim on a page that cites it", () => {
    const verbatimSources = new Set(
      allTransmissions.filter((t) => t.kind === "atc-verbatim").map((t) => t.source),
    );
    const uncited = [...verbatimSources].filter((source) => {
      const node = nodes.find((n) => n.id === source);
      // A deck cannot carry `links:`, so a verbatim quote does not belong in
      // one — label it as a counter-example, or quote it in the lecture.
      if (!node) return true;
      return !(node.links ?? []).some((l) => isInvestigator(l.url));
    });
    expect(uncited).toEqual([]);
  });
});

describe("accident citations", () => {
  const naming = nodes.filter((n) => n.meta?.incident !== undefined);

  it("has pages that name incidents", () => {
    expect(naming.length).toBeGreaterThan(0);
  });

  it("cites an official investigator wherever an incident is named", () => {
    const uncited = naming
      .filter((n) => !(n.links ?? []).some((l) => isInvestigator(l.url)))
      .map((n) => {
        const incidents = [n.meta?.incident].flat().join(", ");
        const hosts = (n.links ?? []).map((l) => new URL(l.url).hostname).join(", ");
        return (
          `${n.id} names incident ${incidents} with no citation on an ` +
          `investigator's host${hosts ? ` (has: ${hosts})` : " (has no links at all)"}`
        );
      });
    expect(uncited).toEqual([]);
  });

  it("gives every citation a label a reader can act on", () => {
    const unlabelled = nodes
      .flatMap((n) => (n.links ?? []).map((l) => ({ id: n.id, ...l })))
      .filter((l) => l.label.trim().length < 15)
      .map((l) => `${l.id}: "${l.label}" does not say what the reader is opening`);
    expect(unlabelled).toEqual([]);
  });
});
