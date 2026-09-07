# Process overview

## What I built

**SLOP1126 · Say Again** — a first-year course on aviation radio phraseology,
taught as a designed artefact rather than a list to memorise. Twelve dated
weeks, four assessment components, two decks, a glossary, and a cast of three
who disagree with each other in print.

I started from "aviation" and had to narrow it: dozens of real universities run
aeronautics, so it fails the brief's *no real university would run it* test.
The phraseology alone passes, and has a semester in it — a language engineered
so that misunderstanding would be structurally impossible, and an accident
record that is the evidence of where the engineering gives way.

## How I got here

### A notation that made me admit something

The obvious way to show radio transmissions is to print them. Instead I gave
the site three fence notations — `atc` is a model, `atc-nonstandard` is a
counter-example, `atc-verbatim` is quoted from the record — and made
`spec/phraseology.test.ts` enforce them
([`22c85de`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/22c85de)).
Counter-examples must *contain* a known deviation, so the label cannot become a
blanket exemption; verbatim quotes must sit on a page that cites an
investigator.

Writing that forced an admission. Week 9's Air Canada 759 exchange was tagged
`atc` — a model. It is neither standard nor a model; it is quoted from an NTSB
report and its whole point is that a true answer was useless. Relabelling it
was the notation doing its job on its author.

### A sensor that returned 200 for everything

I wrote six plausible SKYbrary citation URLs and checked them with `curl -o
/dev/null -w "%{http_code}"`. All 200. Green.

The obvious move was to ship. Instead I put a deliberately bogus path in the
same batch — `/totally-bogus-path-xyzzy` — and it returned 200 too. The host
serves a JS bot-challenge with status 200 for any path, so the check had been
measuring the interstitial. **All six URLs were wrong.** I re-verified every
citation in headless Chrome against a known-bad control, and the rule is now in
`CLAUDE.md`
([`01eb9cf`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/01eb9cf)).
It also shaped the check: it asserts a citation's *provenance*, not its
liveness, because a network check here would be worse than none.

### Breaking a check disproved its reason for existing

`spec/deck-links.test.ts` was written to catch a dangling `slides:` path, on
the reasoning that the schema only shape-validates it. Making it red showed
that a bogus path *also* fails `pnpm build` — the theme renders `slides:` as an
anchor and the link checker resolves it. The gap did not exist.

I rewrote it rather than keeping a check that duplicated the build. The real
gap is absence: strip `slides:` from every lecture and the build is green at 41
pages with no broken links while the brief's requirement is silently unmet
([`22c85de`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/22c85de)).

### What only rendering and measuring could tell me

The hero was a standalone diagram with its own `CLEARANCE`/`READBACK` labels.
On the page, the theme lays the title across it under a scrim — the labels sat
under the headline, unreadable. Redrawn as a background with its middle band
kept clear.

Then I read computed values instead of trusting screenshots. `data-tone={i % 3}`
with four components made segments 1 and 4 the same gold — *distinct colours =
3 of 4* — and white-on-gold segment text was ~3:1, which axe passed only
because everything inside `role="img"` is presentational to it. Both fixed, and
the spine's lecture column measures one offsetLeft across all twelve rows at
both viewports, so a week gaining a due badge shifts nothing
([`4759ae9`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/4759ae9)).
