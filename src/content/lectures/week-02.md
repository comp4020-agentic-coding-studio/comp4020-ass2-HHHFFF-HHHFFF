---
title: "Alfa to Zulu: the spelling alphabet as an engineering artefact"
description:
  Twenty-six words chosen by experiment, two of them deliberately misspelled,
  and the numbers that had to be redesigned too
week: 2
date: 2027-03-01
teachers:
  - noor-abadi
related:
  - lectures/week-01
  - sessions/02-alphabet-under-noise
---

Everybody knows the alphabet. Almost nobody knows it was **tested**.

The version in use today was adopted by ICAO in the mid-1950s after several
earlier alphabets were found to fail in exactly the conditions they existed
for. That is the interesting part: not the list, but the fact that a list can
be wrong, and that somebody went and measured which words survived a noisy
channel and a speaker who had learned them phonetically rather than as English
words.

## What the words have to do

A spelling alphabet has one job: make each letter maximally distinct from
every other letter **after** the channel has degraded it. That is a harder
constraint than being distinct on paper.

Design pressures, all in tension:

- **Acoustic distance.** No two words should collapse into each other when
  band-limited and buried in noise. The problem letters in plain English are
  the ones sharing a vowel: B, C, D, E, G, P, T, V, Z. Notice how far apart
  `BRAVO`, `CHARLIE`, `DELTA`, `ECHO`, `GOLF`, `PAPA`, `TANGO`, `VICTOR` and
  `ZULU` are pushed.
- **Robustness to partial loss.** Lose the first syllable of `NOVEMBER` and
  `-VEMBER` is still nothing else.
- **Pronounceability across languages.** The users are not English speakers.
  A word that only works in an English mouth is a word that fails.
- **Not already meaningful.** A code word that is also an ordinary instruction
  is a code word that will be obeyed one day.

## The two misspellings

`ALFA` and `JULIETT`. Both are wrong in English, on purpose.

*Alpha* invites a French or Spanish speaker to read the "ph" as /p/. Spelling
it `ALFA` removes the choice. *Juliet* invites a French speaker to drop the
final t; `JULIETT` makes the t survive.

This is the whole course in two words. Somebody noticed that the written form
of a code word affects how a non-native speaker will say it aloud, decided
that mattered more than orthographic correctness, and changed the spelling.
Then that decision got written into an annex, and now every chart in the world
prints a misspelling on purpose. Design decisions leave fossils.

## Numbers had the same problem, and a worse one

Digits are spoken individually — `two seven left`, not *twenty-seven left* —
because place value is exactly the redundancy the channel eats. But two digits
needed changing outright:

- **`NINER`** for 9, because *nine* and the German *nein* collide, and because
  a clipped *nine* is close to *five*.
- **`TREE`** for 3 and **`FOWER`** for 4, respelled to survive speakers whose
  first language does not have the English /θ/ or a reliable final /r/.

Week 6 comes back to numbers, where the problem stops being phonetic and
becomes arithmetic: a level read back correctly and understood as something
else entirely.

## What a well-designed word buys you

```atc
TWR      Cessna golf bravo alfa mike echo, taxi holding point alfa two.
GBAME    Taxi holding point alfa two, golf bravo alfa mike echo.
```

Say that aloud badly, at speed, with a fan running. Most of it still gets
through, and the parts that don't are recoverable from the parts that do. That
is not luck. That is 1956 doing its job.
