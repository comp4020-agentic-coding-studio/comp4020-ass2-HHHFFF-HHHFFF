# Process overview

## What I decided a good course is

I am not a pilot. Many evenings in Microsoft Flight Simulator left me
convinced an airliner is among the finest things we have built. What I did not
expect is caring most about the least romantic thing in it: the rulebook for
what you may say on a frequency. It is made of the same stuff as the aeroplane
— designed out of alternatives, against evidence, so one misunderstanding
became impossible. Ingenuity pointed at language, not metal.

The exemplars gave the sharper half: none argues for its own importance.
*Calling Bullshit* just hands you a bad chart. So — **a good course makes you
feel why something is interesting rather than asserting that it is
important.** Phraseology is normally taught dry — memorise the list, reach
ICAO Level 4, pass. None of it teaches what made me care: *why* each phrase is
the shape it is. So SLOP1126 asks four questions of every phrase — what
problem, what alternative, what evidence decided it, does it still hold — and
three teachers disagree in print
([`c5e1f64`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/c5e1f64)),
because a settled view deletes the fourth.

The price: delight only survives if the material is true — an invented
accident is worth nothing. Hence the harness.

## What I encoded

Transmissions came first. The obvious thing is to print them for texture.
Instead each is labelled for the work it does — `atc` a model,
`atc-nonstandard` a counter-example, `atc-verbatim` a cited quote — and a
counter-example must *contain* a known deviation, so the label can never be an
exemption
([`22c85de`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/22c85de)).
It caught its author: week 9's Air Canada 759 exchange was tagged a model and
is neither.

Then the breakthrough, which was a failure. I had the agent produce six
SKYbrary citations and checked them with `curl -w "%{http_code}"`. All 200.
The obvious move was to accept; instead I added a deliberately bogus path, and
it came back 200 too — the host answers every URL with a bot-challenge page.
**All six were invented.** What changed was not the URLs but what I accept as
a sensor: the rule went into `CLAUDE.md`, and the check asserts *provenance*,
not liveness — a network check here is worse than none
([`01eb9cf`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/01eb9cf)).

Then artefacts, with the harness deciding whether to keep them. Week 5's
figure drew four runway exits at 56° under a caption saying 148°. It now
derives the angles from those numbers, and a check compares them to **the
degrees the prose states** — not a constant, which would let both drift and
stay green
([`a2069c0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/a2069c0)).

Then volunteers read it. The index gave a weight and a date; the rule whose
price is a whole component — rebook free, before your slot — sat at the foot
of a brief. Every fact was already on the page, so the two levels became the
design (plan a semester from the index, open a brief to start work) and the
check asserts **position**: cut booking from the summary, leave the body
section untouched, and the build prints 41 pages, green on axe and links,
failing only on where the words are
([`d4c61cf`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/d4c61cf)).

## What I left out

No check on prose or voice, the thing I care about most: a green light on "not
dry, not mechanical" would be the most expensive lie in the repo, so the
quality it lives or dies on is unguarded.

No deck-per-lecture check: one is required, twelve would manufacture ten thin
ones. No visual regression — pinning pixels freezes a design I am still
arguing with, so where layout had to hold I measured it
([`4759ae9`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/4759ae9)).
