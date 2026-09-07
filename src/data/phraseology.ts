/**
 * The course glossary, and the single source of truth for it.
 *
 * Two consumers read this module and nothing else:
 *
 *   - src/pages/glossary.astro renders it as the site's reference page
 *   - spec/phraseology.test.ts checks the site's own transmissions against it
 *
 * That is the point of it being a module rather than a page with a table in
 * it. If the glossary and the check came from two places they would disagree
 * within a fortnight, and the check would then be enforcing a standard the
 * course no longer taught.
 *
 * Meanings follow ICAO standard phraseology. Where this course simplifies a
 * definition for a first-year audience it says so in the note.
 */

export interface StandardPhrase {
  /** Canonical form, upper case, as it appears in the phraseology. */
  phrase: string;
  /** What it means. Single meaning — that is the whole design. */
  meaning: string;
  /** A caution, or what students most often get wrong about it. */
  note?: string;
  /** The teaching week that introduces it, where one does. */
  week?: number;
}

/**
 * A form this course teaches students to hear as wrong.
 *
 * `pattern` is what spec/phraseology.test.ts matches against a transmission.
 * It is deliberately a blocklist rather than an allowlist: a transmission
 * contains callsigns, place names and numbers that no glossary could
 * enumerate, so the check can prove a known error is *present* and can never
 * prove a transmission is fully standard. The test name says so.
 */
export interface Deviation {
  /** How the form is written when we talk about it. */
  form: string;
  /** Detects the form in a transmission. */
  pattern: RegExp;
  /** What should have been said. */
  standard: string;
  /** Why it matters — the failure it invites. */
  why: string;
  /** The teaching week that deals with it. */
  week: number;
}

export const standardPhrases: StandardPhrase[] = [
  {
    phrase: "ACKNOWLEDGE",
    meaning: "Let me know that you have received and understood this message.",
    week: 3,
  },
  {
    phrase: "AFFIRM",
    meaning: "Yes.",
    note: "Not `AFFIRMATIVE`, which was shortened precisely because a clipped version has been heard as its own opposite.",
    week: 3,
  },
  { phrase: "APPROVED", meaning: "Permission for the proposed action is granted." },
  {
    phrase: "BREAK",
    meaning: "I hereby indicate the separation between portions of the message.",
  },
  {
    phrase: "BREAK BREAK",
    meaning:
      "I hereby indicate the separation between messages transmitted to different aircraft in a busy environment.",
  },
  { phrase: "CANCEL", meaning: "Annul the previously transmitted clearance.", week: 4 },
  {
    phrase: "CHECK",
    meaning: "Examine a system or procedure.",
    note: "No answer is normally expected.",
  },
  {
    phrase: "CLEARED",
    meaning: "Authorised to proceed under the conditions specified.",
    note: "A clearance, not an instruction. Week 6 is about what happens when the difference does not survive the channel.",
    week: 6,
  },
  {
    phrase: "CONFIRM",
    meaning: "Is this your understanding? — or — confirm you have received this message.",
  },
  { phrase: "CONTACT", meaning: "Establish radio contact with the named station." },
  { phrase: "CORRECT", meaning: "True, or accurate." },
  {
    phrase: "CORRECTION",
    meaning:
      "An error has been made in this transmission. The correct version is the following.",
    note: "Stopping a readback partway to correct it counts in your favour in the frequency check.",
    week: 12,
  },
  {
    phrase: "DISREGARD",
    meaning: "Consider that transmission as not sent.",
  },
  {
    phrase: "HOW DO YOU READ",
    meaning: "What is the readability of my transmission?",
    week: 9,
  },
  {
    phrase: "I SAY AGAIN",
    meaning: "I repeat, for clarity or emphasis.",
    note: "Distinct from `SAY AGAIN`, which is a request to the other station.",
    week: 4,
  },
  {
    phrase: "LINE UP AND WAIT",
    meaning: "Enter the runway and hold, awaiting take-off clearance.",
    note: "The ICAO form. Not `POSITION AND HOLD`.",
    week: 4,
  },
  { phrase: "MAINTAIN", meaning: "Continue in accordance with the condition specified." },
  {
    phrase: "MAYDAY",
    meaning:
      "Distress. Grave and imminent danger, immediate assistance required. Spoken three times.",
    note: "Week 7's accident turns on a crew who had this available and did not use it.",
    week: 7,
  },
  { phrase: "MONITOR", meaning: "Listen out on the specified frequency." },
  {
    phrase: "NEGATIVE",
    meaning:
      "No — or — permission is not granted — or — that is not correct — or — not capable.",
  },
  {
    phrase: "OUT",
    meaning: "This exchange is ended and no response is expected.",
    note: "Mutually exclusive with `OVER`. See `OVER AND OUT` in the deviations below.",
    week: 7,
  },
  {
    phrase: "OVER",
    meaning: "My transmission is ended and I expect a response from you.",
    week: 7,
  },
  {
    phrase: "PAN-PAN",
    meaning:
      "Urgency. A situation concerning safety that does not require immediate assistance. Spoken three times.",
    week: 8,
  },
  {
    phrase: "READ BACK",
    meaning:
      "Repeat all, or the specified part, of this message back to me exactly as received.",
    note: "The readback is a test, and a test only works if it can fail. Paraphrasing throws the test away.",
    week: 3,
  },
  { phrase: "RECLEARED", meaning: "A change has been made to your last clearance." },
  { phrase: "REPORT", meaning: "Pass me the following information." },
  { phrase: "REQUEST", meaning: "I should like to know, or I wish to obtain." },
  {
    phrase: "ROGER",
    meaning: "I have received all of your last transmission.",
    note: "It means *received*. It does not mean yes, and it is not a readback. This is the single most common error in the course.",
    week: 3,
  },
  {
    phrase: "SAY AGAIN",
    meaning: "Repeat all, or the following part, of your last transmission.",
    note: "The most useful two words in the language, because they are cheap. Week 12 argues that this is the transferable design principle.",
    week: 1,
  },
  { phrase: "SPEAK SLOWER", meaning: "Reduce your rate of speech.", week: 9 },
  { phrase: "STANDBY", meaning: "Wait and I will call you." },
  {
    phrase: "UNABLE",
    meaning: "I cannot comply with your request, instruction or clearance.",
    note: "Using it when it is true counts in your favour. Accepting something you cannot do does not.",
    week: 12,
  },
  {
    phrase: "WILCO",
    meaning: "I understand your message and will comply with it.",
    week: 3,
  },
  {
    phrase: "WORDS TWICE",
    meaning:
      "As a request: communication is difficult, send every word twice. As information: every word in this message will be sent twice.",
    week: 9,
  },
];

export const deviations: Deviation[] = [
  {
    form: "OK / OKAY",
    pattern: /\bok(ay)?\b/i,
    standard: "AFFIRM, ROGER, or a readback — whichever was actually owed",
    why: "It has no defined meaning, so it is heard as agreement to whatever the other station believed it had said. At Tenerife it arrived first and did exactly that.",
    week: 5,
  },
  {
    form: "at takeoff",
    pattern: /\bat\s+take-?off\b/i,
    standard: "a standard position report, with DEPARTURE if the phase must be named",
    why: "Ambiguous between *positioned at the takeoff point* and *commencing takeoff*. Both readings are grammatical and both are things an aircraft can be.",
    week: 4,
  },
  {
    form: "stand by for takeoff",
    pattern: /\bstand\s?by\s+for\s+take-?off\b/i,
    standard: "STANDBY, with no mention of the reserved word",
    why: "Puts the reserved word into a transmission that is neither a clearance nor a prohibition. Partly stepped on, in fog, this reached a crew already committed to going.",
    week: 5,
  },
  {
    form: "position and hold",
    pattern: /\bposition and hold\b/i,
    standard: "LINE UP AND WAIT",
    why: "A legacy North American form. *Hold* is doing too many jobs, and a clearance to enter a runway should not share vocabulary with an instruction to stop.",
    week: 4,
  },
  {
    form: "affirmative",
    pattern: /\baffirmative\b/i,
    standard: "AFFIRM",
    why: "Shortened deliberately: a clipped *affirmative* has been heard as its own opposite through a degraded channel.",
    week: 7,
  },
  {
    form: "over and out",
    pattern: /\bover and out\b/i,
    standard: "OUT",
    why: "A contradiction. OVER hands the frequency back; OUT ends the exchange. The phrase survives from film, not from aviation.",
    week: 7,
  },
  {
    form: "roger that",
    pattern: /\broger that\b/i,
    standard: "ROGER",
    why: "Padding on a channel where seconds are the scarce resource, and it encourages ROGER to be heard as an answer rather than a receipt.",
    week: 7,
  },
  {
    form: "with you",
    pattern: /\bwith you\b/i,
    standard: "a full check-in: callsign, level, and what you want",
    why: "Not a check-in. It tells the controller nothing they need and occupies the frequency while doing it.",
    week: 7,
  },
  {
    form: "any traffic please advise",
    pattern: /\bany traffic please advise\b/i,
    standard: "nothing — the phrase has no standard equivalent because it should not be said",
    why: "It invites simultaneous transmissions from every station on frequency, which is week 1's failure mode requested on purpose.",
    week: 7,
  },
  {
    form: "compound numbers",
    pattern: /\b(thir|four|fif|six|seven|eigh|nine)teen\s+(hundred|thousand)\b/i,
    standard: "digit by digit — ONE THREE THOUSAND",
    why: "Place value is exactly the redundancy the channel eats. *Thirteen* and *thirty* survive noise far less well than *one three*.",
    week: 6,
  },
  {
    form: "descend to / climb to",
    pattern: /\b(descend|climb)\s+to\s+\w/i,
    standard: "DESCEND or CLIMB with no preposition",
    why: "*To* is homophonous with *two*. `descend to four thousand` has been heard as `descend two four thousand`.",
    week: 6,
  },
  {
    form: "ROGER in place of a readback",
    pattern: /\broger,?\s+(descend|climb|cleared|taxi|line up|hold|maintain)\b/i,
    standard: "read the clearance back in full",
    why: "ROGER acknowledges receipt. It does not expose what was understood, so it throws away the only test the loop has.",
    week: 3,
  },
];

/** Every deviation in `text`, in glossary order. Used by the page and the check. */
export function findDeviations(text: string): Deviation[] {
  return deviations.filter((d) => d.pattern.test(text));
}
