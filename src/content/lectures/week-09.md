---
title: Accent, fatigue, and the party line
description:
  Intelligibility is a property of the channel, not of the speaker — and the
  shared frequency is a safety device nobody designed
week: 9
date: 2027-05-03
teachers:
  - halvard-sunde
  - noor-abadi
incident:
  - air-canada-759-2017
links:
  - label: "NTSB AIR-18/01: Taxiway Overflight, Air Canada Flight 759, San Francisco, 7 July 2017"
    url: https://www.ntsb.gov/investigations/accidentreports/reports/air1801.pdf
related:
  - lectures/week-08
  - sessions/09-degraded-audio
---

Two ideas this week, and they pull against each other.

## Intelligibility belongs to the channel

The instinct is to locate intelligibility in the speaker: *that person is hard
to understand*. It is more useful, and more accurate, to locate it in the
whole path — speaker, encoding, medium, noise, listener, and the listener's
expectations.

The same speaker is perfectly clear to a colleague on the same sector and
opaque to a crew arriving from another region. Nothing about the speaker
changed. What changed was the shared context the listener brought.

Three things degrade the path, and none of them is accent:

- **Band limiting.** VHF voice is roughly 300 Hz to 3 kHz. That removes much
  of what distinguishes consonants, which is why the alphabet from week 2 is
  built out of vowel-and-stress contrasts.
- **Fatigue.** On both ends. A tired listener's comprehension degrades before
  their speech does, so the person least able to understand you sounds fine.
- **Expectation bias.** The strongest of the three. You hear the clearance you
  expected, and you hear it clearly.

That last one is week 3's hearback failure, generalised. It is not a lapse of
attention. It is what perception *does*: it fills gaps with priors, and it
does not tell you it has.

## The party line

Aviation VHF is a **shared** frequency. Everybody on it hears everybody else.

From a pure information-design standpoint this is a defect. It is
inefficient, it makes simultaneous transmission possible, it means a busy
sector wastes most of its bandwidth on messages irrelevant to most listeners.

And it is also, accidentally, one of the most effective safety devices in the
system. Because everybody hears everything:

- You build a picture of the traffic around you that nobody transmitted to you.
- You catch a clearance issued to a callsign similar to yours.
- You notice the controller is saturated from the *rate*, not from any words.
- And you can hear that somebody else is about to do something wrong.

Nobody designed the party line for those. It falls out of using one radio
channel, and it turns out to matter enormously. Hold onto that — week 10 is
about a technology that removes the problem the party line causes and takes
the party line with it.

## Air Canada 759, 7 July 2017

At just before midnight at San Francisco, Air Canada 759 was cleared to land
on runway 28R and lined up instead with taxiway C, on which four loaded
airliners were waiting for departure. It descended to about 100 ft and
overflew the first of them, then went around at a minimum of about 60 ft over
the second.

Nobody was hurt. This is the closest thing in the modern record to a second
Tenerife.

The communications sequence is the reason it is in this course.

The crew, uneasy, asked the tower to confirm the runway was clear. The
controller — correctly, and uselessly — replied that there was nobody on
runway 28R but them:

```atc
ACA759   Tower, just want to confirm, this is Air Canada seven five nine,
         we see some lights on the runway there, can you confirm we're
         cleared to land?
TWR      There's no one on runway two eight right but you.
```

Every word of that is true. It is also an answer to a question the crew were
not really asking. They were not on 28R.

**What stopped it was the party line.** A pilot waiting on the taxiway — not
in the loop, not addressed, simply listening — transmitted that the aircraft
was lined up on the taxiway. The tower then instructed the go-around.

The NTSB found the probable cause to be the crew's misidentification of
taxiway C as the runway, from a lack of awareness that the parallel runway was
closed, with expectation bias and fatigue as contributing factors. Read the
report for those findings. Read the transcript for this course's finding:
**the loop between the two parties whose job it was closed correctly and
produced the wrong answer, and a bystander broke it open.**

## The tension

Week 7 wanted the frequency disciplined and standard. This week points out
that the frequency's value here came from somebody who was not part of the
exchange at all, listening to traffic that was none of their business.

Both are true. A designed channel and an overheard one are doing different
jobs, and a design that optimises one can quietly remove the other.
