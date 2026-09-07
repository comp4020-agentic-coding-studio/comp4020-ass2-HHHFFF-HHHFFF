---
title: "CPDLC: text replaces voice"
description:
  Datalink solves mishearing completely, and removes four things nobody was
  counting — the strongest test of whether you have the course's argument
week: 10
date: 2027-05-10
teachers:
  - halvard-sunde
related:
  - lectures/week-09
  - sessions/10-datalink-only
---

Everything so far has been about a voice channel that loses things. There is a
channel that does not.

**CPDLC** — Controller–Pilot Data Link Communications — sends clearances as
text. They appear on a display. The crew presses ACCEPT or REJECT. Widely used
in oceanic and remote airspace, increasingly in busy continental airspace.

## What it fixes, completely

- **Mishearing: gone.** There is no acoustic channel to degrade. A level is
  the digits that were sent.
- **Simultaneous transmission: gone.** Messages queue. Nobody is stepped on,
  and Tenerife's second failure cannot happen.
- **Accent and proficiency: gone**, for the routine case. Week 8's rating scale
  is irrelevant to a text clearance.
- **Readback: unnecessary.** The loop is closed by the protocol, not by a
  human repeating themselves. And unlike hearback, the protocol does not get
  tired at 4am with eleven aircraft.
- **A written record**, automatically, with no transcription argument.

Read that list again. It is every failure mode of weeks 1 through 9, removed
at a stroke. If this course were only about mishearing, it would end here and
the answer would be *use text*.

## What it costs

**The party line, entirely.** This is the big one, and week 9 measured it for
you. A datalink clearance is point-to-point. You do not hear what anybody else
was told. The traffic picture you were building for free is gone, the similar
callsign is gone, and the pilot who saved Air Canada 759 by listening to
traffic that was none of their business is not on the frequency.

**Prosody.** A voice carries urgency, hesitation, and saturation. Text carries
none. A controller who is drowning sounds like a controller who is fine, and
week 7's argument that non-standard delivery carries real information becomes
an argument for keeping voice.

**Latency.** Not instant. Message construction, uplink, display,
acknowledgement. Seconds to tens of seconds. Fine for an oceanic reroute;
useless for anything time-critical, which is why voice is retained for it and
the two systems run side by side.

**Head-down time.** Reading and accepting a clearance takes eyes and hands
inside the cockpit. Voice does not.

**Mode confusion, and a new class of error.** The old error was mishearing.
The new one is accepting the wrong message, or accepting a message meant for a
different aircraft, or acting on a stale uplink. The errors did not go away;
they changed shape into something a readback would never have caught.

## The honest position

CPDLC is not a mistake and this lecture is not a lament. It removed a genuine
class of accident. It is also the clearest available case of a **safety
property that nobody had written down being removed by an improvement**,
because the party line was never in a requirements document. It was a side
effect of using one radio channel, and you do not defend what you have not
named.

That is the transferable lesson, and it is why this lecture sits at week 10
rather than as a footnote. Anything you build that replaces a lossy shared
channel with a clean point-to-point one will do this. The question to ask is
not *is the new channel better* — it plainly is, at the thing it was designed
for. It is **what was the old channel doing that nobody specified.**

Hold that question for the audit. Every past submission that proposed
replacing a messy spoken handover with a form or a checklist has run into it,
and the good ones say so in their limits section.
