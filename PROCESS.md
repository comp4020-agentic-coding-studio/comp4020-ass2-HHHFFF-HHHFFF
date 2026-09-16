# Process overview

## What I decided a good course is

I am not a pilot. I lost many evenings to Microsoft Flight Simulator
and came out convinced an airliner is among the finest things people have
built — and that wanting to be up there is a romance most of us keep. What I
did not expect is that the part I came to care about most is the least romantic
thing in aviation: the rulebook for what you may say on a frequency. It is made
of the same stuff as the aeroplane: designed out of alternatives, against
evidence, so one kind of misunderstanding became impossible. The same
ingenuity, pointed at language instead of metal.

Hence the position: **a good course makes you feel why something is interesting
rather than asserting that it is important.** Phraseology is normally taught
dry — memorise the list, reach ICAO Level 4, pass. Real universities teach it;
Embry-Riddle has a department. None teach what made me care: *why* each phrase
is the shape it is. So SLOP1126 asks four questions of every phrase — what
problem, what alternative, what evidence decided it, does it still hold — and
three teachers disagree in print
([`c5e1f64`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/c5e1f64)),
because a settled view deletes the fourth.

The price: delight only survives if the material is true. An invented
accident is worth nothing. Hence the harness.

## What I encoded

Transmissions came first. The obvious thing is to print them for texture.
Instead each is labelled for the work it does — `atc` a model,
`atc-nonstandard` a counter-example, `atc-verbatim` a cited quote — and a
counter-example must *contain* a known deviation, so the label can never be an
exemption
([`22c85de`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/22c85de)).
It caught its author: week 9's Air Canada 759 exchange was tagged a model, and
is neither.

Then the breakthrough, which was a failure. I had the agent produce six
SKYbrary citations and checked them with `curl -w "%{http_code}"`. All 200. The
obvious move was to accept. Instead I dropped a deliberately bogus path into
the same batch; it came back 200 too — the host answers every URL with a
bot-challenge page. **All six were invented.** What changed was not the URLs but
what I accept as a sensor: the rule went into `CLAUDE.md`, and the check
asserts *provenance*, not liveness — a network check here
is worse than none
([`01eb9cf`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/01eb9cf)).

After that I asked the agent for artefacts and the harness whether to keep
them. It ran both ways. Week 5's figure came back drawing all four runway exits
at 56° while its caption said 148°; it now derives the angles from those
numbers, and a check compares them to **the degrees the prose states** rather
than a constant, which would let the two drift together and stay green
([`a2069c0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/a2069c0)).
Then the reverse: the agent told me, on eleven consistent samples, that my
course code breached the spec. I refused it: the digits are assigned in the
template repo, and that commit was there seven seconds after provisioning —
eleven agreeing samples of the wrong quantity
([`745d21e`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/745d21e)).

## What I left out

No check on prose or voice, the thing I care about most. A green light on "not
dry, not mechanical" would be the most expensive lie in the repo, so the
quality this course lives or dies on is unguarded.

No check that every lecture carries a deck: one is required, twelve would
manufacture ten thin ones. No visual regression either — pinning pixels
freezes a design I am still arguing with, so where layout had to hold I
measured it instead
([`4759ae9`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-HHHFFF-HHHFFF/commit/4759ae9)).
