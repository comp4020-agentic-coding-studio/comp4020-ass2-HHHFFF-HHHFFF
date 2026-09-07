---
title: Readback, hearback, and the loop
description:
  Readback is the half everybody teaches. Hearback is the half that fails, and
  it fails under a workload a transcript cannot show you
week: 3
date: 2027-03-08
teachers:
  - halvard-sunde
incident:
  - linate-2001
links:
  - label: "ANSV final report 20A-1-04: Milan Linate runway incursion, 8 October 2001"
    url: https://skybrary.aero/sites/default/files/bookshelf/480.pdf
related:
  - lectures/week-02
  - sessions/03-running-the-loop
---

A simplex channel gives you no acknowledgement. Nothing comes back to say the
message arrived, and the sender cannot even hear whether they were stepped on.

So aviation built an acknowledgement out of the message itself. The receiving
station says the instruction back, and the sending station listens to the
readback and confirms it. That is the loop, and it has two halves that are not
equally well taught.

## The half everybody teaches

**Readback.** You repeat the clearance. Not "roger", not "copied" — the actual
content, in the actual order, so that the specific thing that could have been
misheard is exposed.

```atc
ACC      Speedbird one two three, descend flight level two four zero.
BAW123   Descend flight level two four zero, Speedbird one two three.
```

The readback is a **test**, and like any test it only works if it can fail. A
readback that paraphrases has thrown the test away, because the paraphrase can
be right while the understanding is wrong.

## The half that fails

**Hearback.** The controller has to notice that the readback was wrong.

This is where the loop actually breaks. The literature is full of readback
errors that were read back wrongly *and confirmed* — because the controller
was working eleven other aircraft, because the readback was fluent and
confident, and because the human ear supplies what it expects to hear. The
readback said `two four zero` in the controller's head before the pilot said
`three four zero`.

Two things make hearback structurally harder than readback:

1. **Asymmetric load.** One pilot is parsing one clearance. One controller is
   parsing every readback on the frequency, against the clearance they issued
   some seconds ago, from memory.
2. **Expectation bias runs the wrong way.** The pilot is listening for
   something new. The controller is listening for confirmation of something
   they already believe.

Halvard's version of this, from twenty-two years of it: you do not hear a
wrong readback and think *that is wrong*. You hear a small wrongness at the
edge of attention and have about a second to decide whether to spend attention
on it, while three other aircraft want something.

## Linate, 8 October 2001

In fog at Milan Linate, a Cessna Citation taxiing for departure read back a
route it had not been cleared for, using a taxiway designator that did not
correspond to the route ATC believed it was on. The readback was not caught.
The Citation crossed a lit red stop bar onto the active runway as an SAS MD-87
was rotating. Both aircraft were destroyed; 118 people died, including four on
the ground.

The ANSV report describes an airport system with defects at many levels — no
ground movement radar, inadequate signage, unclear markings. Read it for
those. But read the communications sequence for this course's question:
**every element of the loop was present, and the loop still did not close.**
There was a clearance. There was a readback. There was a controller listening.
The readback contained a designator that should have been an alarm, and it was
not heard as one.

That is why week 3 exists as its own week. "Always read back" is a rule
students learn in an afternoon. Why an intact loop fails anyway is the actual
subject, and it is not a rule — it is a property of attention under load.

## What this means for the drills

The sim sessions from here on plant errors deliberately, and some weeks you
will be the controller. Being on the hearback side, tired, with too many
aircraft, is the only way to find out that you also supply what you expect.
