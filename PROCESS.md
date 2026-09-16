# Process overview

## What I built

**SLOP1126 · Say Again** — a first-year course on aviation radio phraseology,
taught as a designed artefact rather than a list to memorise. Twelve dated
weeks, four assessments, two decks, a glossary, and a cast of three who
disagree in print.

Aviation English is taught at real universities — Embry-Riddle has a whole
department of it — but always as proficiency training: get someone who will
work a frequency to ICAO Level 4. Nobody teaches it to first-years who will
never fly, as the design history of a language built so misunderstanding would
be impossible. The niche is the angle, not the subject.

## How I got here

### A notation that made me admit something

The obvious way to show transmissions is to print them. Instead the site has
three fence notations — `atc` is a model, `atc-nonstandard` a
counter-example, `atc-verbatim` a quote from the record — enforced by
`spec/phraseology.test.ts`
([`22c85de`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/22c85de)).
A counter-example must *contain* a known deviation, so the label cannot become
a blanket exemption; a verbatim quote must sit on a page citing an
investigator.

That forced an admission. Week 9's Air Canada 759 exchange was tagged `atc`. It
is neither standard nor a model: it is quoted from an NTSB report, and its
point is that a true answer was useless. Relabelling it was the notation doing
its job on its author.

### A sensor that returned 200 for everything

I wrote six plausible SKYbrary citation URLs and checked them with `curl -o
/dev/null -w "%{http_code}"`. All 200. Green.

The obvious move was to ship. Instead I put a deliberately bogus path in the
same batch — `/totally-bogus-path-xyzzy` — and it returned 200 too. The host
serves a JS bot-challenge with status 200 for any path: the check had been
measuring the interstitial. **All six URLs were wrong.** I re-verified every
citation in headless Chrome against a known-bad control; the rule is in
`CLAUDE.md`
([`01eb9cf`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/01eb9cf)).
It also shaped the check, which asserts a citation's *provenance* rather than
its liveness: a network check here would be worse than none.

### Breaking a check disproved its reason for existing

`spec/deck-links.test.ts` was written to catch a dangling `slides:` path, since
the schema only shape-validates it. Making it red showed a bogus path *also*
fails `pnpm build`: the theme renders `slides:` as an anchor and the link
checker resolves it. The gap did not exist.

I rewrote it rather than keep a check duplicating the build. The real gap is
absence: strip `slides:` from every lecture and the build is green at 41 pages,
no broken links, the brief's linked-deck requirement unmet
([`22c85de`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/22c85de)).

### A drawing that contradicted its own caption

Week 5's figure exists for one fact: the third exit at Los Rodeos needed a turn
of about 148°, the fourth about 45° — obvious drawn, unsayable. The first
version drew all four at a convenient 56° while the caption said 148, and grey
diagonals look correct at any angle. Nothing sees it: no build reads path
geometry, axe treats `role="img"` as presentational.

The obvious fix was the angle. Instead the drawing computes its stubs *from*
the two numbers, and a check reads the angles back out of the rendered SVG and
compares them to **the degrees the prose states** — not a constant, which would
let figure and caption drift apart in step and stay green
([`a2069c0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/a2069c0)).
Proven red both ways: flipping the sign reported `{ fourth: '135', third: '32'
}`; editing the prose to 150 failed the other way.

A course teaching close-reading cannot hand students a diagram that lies.
