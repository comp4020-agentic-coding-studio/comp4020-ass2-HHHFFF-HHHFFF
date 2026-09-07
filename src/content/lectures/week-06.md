---
title: Numbers, levels, and the QNH
description:
  Where the problem stops being phonetic and becomes arithmetic — a level read
  back correctly and understood as something else
week: 6
date: 2027-03-29
teachers:
  - halvard-sunde
incident:
  - charkhi-dadri-1996
links:
  - label: "Court of Inquiry (Lahoti): mid-air collision near Delhi, 12 November 1996"
    url: https://skybrary.aero/sites/default/files/bookshelf/32383.pdf
related:
  - lectures/week-02
  - sessions/06-levels-and-pressure
---

Week 2 dealt with numbers as sounds. This week they are quantities, and a new
class of failure appears: the digits arrive intact and the **meaning** is
still wrong.

## Three separate systems in one sentence

A vertical position can be expressed three ways, and which one applies depends
on where you are and what pressure setting is in the altimeter.

- **Altitude** — feet above mean sea level, with the local QNH set. Used below
  the transition altitude.
- **Height** — feet above a specified datum, usually the aerodrome, with QFE
  set. Increasingly rare, and its rarity is itself a hazard.
- **Flight level** — hundreds of feet on the standard setting, 1013.25 hPa.
  `FLIGHT LEVEL THREE FIVE ZERO`, not *thirty-five thousand feet*.

Between the transition altitude and the transition level sits the transition
layer, where nobody cruises, because it is the seam between two coordinate
systems.

Two aircraft can both be flying correctly, both reading their instruments
correctly, and be at different actual heights, if one of them has the wrong
pressure set. The phraseology carries the pressure setting for exactly this
reason:

```atc
APP      Speedbird one two three, descend altitude four thousand feet,
         QNH one zero zero eight.
BAW123   Descend altitude four thousand feet, QNH one zero zero eight,
         Speedbird one two three.
```

Note `ALTITUDE` is spoken. It is not decoration — it names which of the three
systems the number belongs to.

## Hectopascals, inches, and metres

The pressure unit differs by region: hectopascals in most of the world, inches
of mercury in North America. A bare "two niner niner two" is inches; "one zero
one three" is hectopascals. The numbers do not overlap, which is a design
choice doing quiet work.

Metric levels are worse. Parts of the world assign levels in metres, and a
crew converting in the cockpit is a crew doing arithmetic on the frequency.
The mitigation is a table on the chart, not a phrase.

## The forms that are wrong

```atc-nonstandard
APP      Speedbird one two three, descend to thirteen thousand.
BAW123   Roger, descend to thirteen thousand.
```

Three defects. *Thirteen thousand* instead of `ONE THREE THOUSAND`, so place
value is carrying meaning the channel can eat. `ROGER` as an acknowledgement
in place of a readback. And no statement of which system the number belongs
to.

There is a fourth, subtler one. *Descend to* — the word "to" is homophonous
with "two", and "descend to four thousand" has been heard as "descend two
four thousand". Standard phraseology drops the preposition.

## Charkhi Dadri, 12 November 1996

Head-on, at the same level, in controlled airspace west of Delhi. An Ilyushin
Il-76 and a Saudia Boeing 747. Both aircraft destroyed; 349 people died. The
worst air disaster in India, and at the time the third worst anywhere.

The Il-76 had been cleared to maintain FL150. Approach passed traffic
information: opposite-direction traffic, one thousand feet below. The Il-76
crew interpreted that advisory — **information about somebody else's level** —
as a re-clearance to descend to it, and descended 1,000 ft into the 747.

Read what that failure is and is not. It is not mishearing. The digits were
received correctly. It is a **sentence-type** failure: the crew could not tell
an advisory from an instruction, so a number that described another aircraft
became a number describing theirs.

This is why phraseology distinguishes clearance, instruction, information and
request with different constructions, and why traffic information has a form
of its own. When the grammar that marks the difference is degraded — by noise,
by workload, or by a crew working in a second language under both — the
difference is what goes.

The inquiry made fifteen recommendations. Several concerned English language
proficiency, which is week 8, and it is the same accident seen from the other
end.

## The point to carry forward

A correct readback proves the digits arrived. It does not prove the sentence
type arrived. Nothing in the loop tests that, and week 3's error-planting
drill cannot plant it.
