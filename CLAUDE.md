# Your harness

Nothing about the starter is recorded here. The platform under you is fixed and
documented in `README.md`, and the
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec. Read both before you plan or build;
what the agent needs to carry from either is your call.

## Working practice

- To see what the page actually looks like rather than what you assume it looks
  like, render it. The rendered page is the truth; your mental model of it
  isn't, and neither is a green test suite.
- When a check fails, read its output before changing anything. Treat a red
  check as authoritative --- the page is wrong until the check is green, not
  until you decide it should be.
- Never reshape production code to satisfy a test environment: no downgrading
  a module script, no inline script added for JSDOM's benefit, no second copy
  of core logic just for tests. If a test needs to drive an interactive state,
  add a small seam on `window` that steps the same instance the visitor is
  watching, not a parallel implementation.
- If you write your own check, prove it would have failed on the commit before
  the bug it targets --- a check that has never been red isn't a check.
- Commit when the checks pass. Never commit a red state.

### Verify a check by breaking what it names

"Never been red isn't a check" has a second half. A past prototype's check on
endless-mode difficulty --- *throws more enemy fire late in a run than early*
--- stayed green 40 runs out of 40 with the difficulty ramp flattened to
`return 1`. It had never sensed the ramp: late runs are busier because
power-ups accumulate, so kills come faster and boss rounds come round more
often. It had been passing for weeks while measuring something else.

So before trusting a check, break the mechanism it claims to measure and
confirm it fails. If it stays green, either the assertion or the name is
wrong --- fix whichever it is, and make the check say which of the two it now
does.

### Ask what the reading measures before asking whether it is stable

The rules below and the sensor notes further down are all about sensors that
**lie**. There is a second, worse failure: a sensor that is working perfectly,
reporting truthfully, and answering a different question than the one asked.
It cannot be caught by repeating the measurement, because repetition is what
makes it convincing.

It happened three times in one session:

- **The expensive one.** Asked whether `SLOP1126` kept "the three digits your
  repo arrived with", I read the digits out of the repo's *template-import*
  commit, got `SLOP1000`, and concluded the spec was breached. Then I
  "confirmed" it across eleven cohort repos --- all eleven `SLOP1000`, perfectly
  consistent --- and wrote the conclusion into `src/course-config.ts` and a
  commit message. All of it was wrong. Provisioning is template import **plus**
  an assignment commit: `1b80b97`, authored by the convenor, seven seconds
  after the repo was created, setting `SLOP1126`. Eleven agreeing samples of
  the wrong quantity read exactly like certainty. The question that would have
  killed it in one step is *if an allocation were delivered, which commit would
  carry it and who would have authored it?* --- I asked who wrote the plugin
  skills instead. Retracted in `745d21e`.
- `gh run list --workflow=deploy` says "could not find any workflows named
  deploy", which is true and means nothing: `deploy` is a **job** inside
  `.github/workflows/checks.yml`, not a workflow file. Nearly recorded as "this
  repo has no deploy pipeline".
- Locating an element by sampling its colour does not work on this site,
  twice over. Every colour derives from three brand tokens, so the KLM jet's
  gold is also every `h2`'s gold, and the hatch's bronze is within tolerance of
  `--at-link`. Both searches found headings and links. Position comes from
  `getBoundingClientRect` through the iframe harness, or from scaling the whole
  column down and looking at it.

So: before trusting a reading, say out loud which quantity it is and which
quantity the question needs. If those two sentences are not the same sentence,
no amount of agreement between samples will help. Consistency is evidence of a
stable sensor, never of a relevant one.

Two traps from that failure, both relevant to a build with a search index and
a data-integrity check that runs against real content:

- **Don't sample something that varies at one instant.** Prefer counting or
  asserting over the whole relevant range rather than a single snapshot, and
  start from steady state so you aren't just measuring warm-up.
- **Quantify a flake before fixing it.** If a check is intermittent, run it
  enough times to read the actual failure rate. Whether a red is noise, and
  how much margin a fix buys, are both numbers; guessing at them costs more
  than measuring.
- **Run both directions before claiming both directions.** `figure-claims`
  earns its "broken a second time from the other side" because the drawing and
  the prose are two sources that can disagree. `people-roles` cannot: the label
  is *derived* from the frontmatter value, so editing the value moves both
  sides together and the assertion stays green no matter what it says. I had
  the docstring claiming that second red before running it. Where one side is
  computed from the other, only absence is detectable — write that limit down
  next to what the check does sense, rather than inheriting a sentence from a
  check with a different shape.

## This machine's environment

Carried forward from earlier prototypes, where these facts cost real time to
find.

- There is no `agent-browser` CLI on this machine. Ground truth comes from
  headless Chrome directly:

  ```bash
  pnpm build && pnpm preview --port 4173 --strictPort &
  "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
    --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=6000 \
    --screenshot="C:\Users\H-F\AppData\Local\Temp\shot.png" \
    "http://localhost:4173/<repo>/"
  ```

  Write the screenshot to the temp dir, not the repo --- Chrome gets
  access-denied writing into the working directory. Serve over HTTP, never
  `file://` --- a module script won't run from a `file://` origin, and the page
  will silently render with no JavaScript at all. `pnpm preview` is `astro
  preview`, not a bare `vite preview` --- this repo has no top-level Vite
  config for a bare `vite preview` to find, so that command fails silently
  against the wrong server or not at all.
- On Windows, `execFile("npx", ...)` without `shell: true` cannot launch
  `npx.cmd` --- Windows resolves `.cmd` files through the shell, the same way
  `npm run` scripts do internally. This bit `astro-theme-university`'s own
  pagefind build step (fixed here with a `pnpm patch`, see `patches/`); expect
  the same failure mode from any other integration or script on this machine
  that shells out to an `npx`-launched binary without `shell: true`.
- **Chrome clamps its window to a 500px minimum on this machine**, so
  `--window-size=390,844` does not produce a 390px viewport --- it's the left
  390px of a 500px layout, cropped, which looks exactly like horizontal
  overflow that isn't there. Measure 390px by rendering the page inside a
  390px `iframe` instead of resizing the window, and pass `--hide-scrollbars`
  on that render too, or the iframe's own scrollbar eats into the frame.
- Headless Chrome barely advances `requestAnimationFrame` --- a
  `--virtual-time-budget` of many seconds can still only advance animation by
  about one frame. Anything driven by rAF (a deck transition, an
  `astromotion` animation) needs a test-seam hook on `window` that steps the
  same state the visitor sees, rather than waiting on frames.
- JSDOM does not execute `<script type="module">`, has no
  `requestAnimationFrame`, and `canvas.getContext("2d")` returns `null`. It
  also doesn't model the user-agent/author CSS cascade correctly. Don't
  contort a test to make JSDOM happy about something it can't see --- keep
  interactive logic in a DOM-free module you can test directly, assert markup
  contracts in JSDOM, and check what actually renders in real Chrome at both
  marked viewports.
- The `hidden` attribute is only `[hidden] { display: none }` in the
  user-agent stylesheet, and an author rule at any specificity beats it. An
  element that sets its own `display` and gets toggled by `hidden` needs the
  override alongside it (`.thing[hidden] { display: none; }`), or it renders
  visible while every markup assertion still passes. And `hidden` is still the
  wrong tool when the box has to keep its space: it's `display: none`, so
  toggling it collapses the element and everything below it moves. To swap one
  line for another in place, stack both in one grid cell and hide the inactive
  one with `visibility` plus `aria-hidden`.
- An invalid CSS value drops the *entire* declaration, not just the invalid
  part, and the fallback can look plausible. `transform: scale(calc(100cqw /
  480))` is invalid --- dividing a `<length>` by a bare number gives a
  `<length>`, and `scale()` takes a `<number>` --- so the whole declaration was
  dropped and the element fell back to `transform: none`, which at any window
  size looks like "nothing scaled" rather than "the rule was rejected". A
  screenshot agreeing with a fix only shows that *some* layout happened, not
  that yours did; read the computed value back (`getComputedStyle(el)`) when a
  fix turns on one declaration.
- When measuring layout in a check, sum `offsetTop`/`offsetLeft` up the
  `offsetParent` chain rather than using `getBoundingClientRect()`, which
  includes CSS transforms and makes an animating element look like it moved.
  But a transformed element is also a containing block, so it re-parents its
  descendants' `offsetParent` --- drop elements with a transformed ancestor
  from the comparison rather than papering over the jump with a tolerance.
- A page with states can be correct in each state and still wrong in the
  transition between them (a layout that shifts 25px when content changes on
  first interaction, with both the before and after individually fine). Assert
  across the change, not just within each state, when a check needs to catch
  this shape of bug.
- The build's link checker resolves internal links, it doesn't just rewrite
  them for the base path --- `astro-broken-links-checker` fails
  `astro:build:done` on any link to a route that doesn't exist yet, and a
  `links:` entry in `src/site-config.ts` puts that link on *every* page at
  once, so one missing page reports as sixteen broken links. **A nav entry and
  the page it points at have to land in the same commit.** The failure also
  aborts the build mid-hook and trips a libuv assertion on this platform
  (`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`, exit code
  3221226505) --- that crash is the symptom, not the bug; scroll up to the
  `Broken link:` lines for the real message.
- **`gh api` with a leading-slash endpoint fails in Git Bash on this machine.**
  MSYS path conversion rewrites `/repos/owner/repo/pages` into
  `C:/Program Files/Git/repos/owner/repo/pages` and `gh` rejects it as an
  invalid endpoint. Drop the leading slash --- `gh api "repos/$R/pages"` ---
  which is what the error message itself advises. This bit the Pages
  `build_type=workflow` call during the ship; `gh repo edit` and
  `gh workflow run` take no path argument and are unaffected.
- **A width utility can be applied, built green, and render pixel-identical
  to no class at all.** `.bleed-wide` set `width: min(100%, 64rem)` inside a
  `.bleed` subgrid whose `> *` rule pins every child to `content`. The grid
  area was 864px, so `100%` was 864px, so `min()` returned 864px --- exactly
  the ordinary content width. Nothing was invalid, nothing was overridden,
  the build was green, and the screenshot showed a perfectly reasonable
  paragraph-width band. There is no way to see this by looking: you have to
  read the number, and the number needs a second element to compare against.
  The iframe harness reporting `.bleed` 1600, `.bleed-wide` 864, `main > p`
  864 settled it in one render. **When a fix turns on a width or a span,
  measure it against a sibling that was never supposed to move** --- the same
  rule as reading back `getComputedStyle` when a fix turns on one
  declaration, for the case where the declaration is valid and still does
  nothing.
- **Grid line names are only reachable where a subgrid re-exposes them.**
  `body` defines `full` / `inset` / `content`; `.at-main` is scoped to
  `inset-start / content-end`, so content inside a page cannot reach `full`
  without an unlayered `.at-main { grid-column: full }` override plus the
  theme's own `display: grid; grid-template-columns: subgrid` pattern. That
  override is **not** in the repo any more --- it went with the `.bleed`
  breakout it existed to serve, so `main` now measures 900px (350..1250)
  uniformly on home, listing and detail pages alike, and anything wanting
  `full` has to re-add it. While it was there it applied only on pages that
  imported the stylesheet carrying it, so the listing pages measured `main`
  at 1600px and the detail pages at 900px --- a difference invisible in both,
  because `main > p` is 864px either way.
- **A breakout out of the content column can only grow rightward here, so a
  wider band *is* a ragged right margin.** base.css draws a 1px accent rule
  down the page at the `inset-start` line (x=350 in a 1600px window), and a
  centred 60rem band would start at x=260, so centring puts the rule through
  the content. Running the band `content-start / full-end` instead was the
  only option, and it ended every widened element at x=1466 against x=1250
  for every paragraph --- 216px of overhang on five elements across four
  pages, which is what "the right side sticks out and looks awkward" turned
  out to mean. Measure a candidate band's right edge against `main > p` on
  the same page before building on it; if the two differ, that gap is the
  design, not a bug you can tune out.
- **`--at-content-inset` is `0px` below 640px and the gutter halves with
  it.** base.css does this in a `@media (width < 640px)` block, which makes
  any width expression built from the inset alone wrong at 390px:
  `100% - 2 * var(--at-content-inset)` gave a 390px band in a 390px window,
  text hard against both edges, while looking fine at 1600px. Subtract the
  gutter too, and check the band against `main > p` at *both* widths --- the
  expression that is right at one can be edge-to-edge at the other.
- **`pnpm build` wipes anything you put in `dist/`,** so a measuring harness
  copied in there is gone after the next build and the screenshot silently
  becomes Astro's 404 page. Keep the source in the temp dir and re-copy after
  every build. It also has to be requested **under the base path** ---
  `http://localhost:4173/comp4020-ass2-HHHFFF-HHHFFF/measure.html`, not
  `/measure.html`, which serves a 404 that looks like a broken harness rather
  than a wrong URL.
- **Checking a deck at 390px needs two workarounds, and skipping either one
  reads as "the deck is broken".** astromotion shows a first-visit
  `.astromotion-help-hint` card, dismissed by any key or click — which
  headless `--screenshot` cannot send. It sits exactly over the scaled slide
  band, so the screenshot comes back apparently blank. Inject
  `.astromotion-help-hint,
  .astromotion-whiteboard-hint { display: none !important }` into
  `contentDocument` on load instead — but **the harness has to be served from
  the same origin as the page for that to do anything.** A harness opened over
  `file://` around an iframe on `http://localhost` is cross-origin:
  `contentDocument` is `null`, the load handler throws, and the injection
  silently does not happen while the screenshot still comes out looking
  plausible. (This note previously asserted the iframe was same-origin, which
  was wrong; it went unnoticed because a screenshot does not need access and
  only reading the frame does.) Copy the harness into `dist/` and load it from
  `localhost` — which is also the only way to *measure* through the frame, and
  how the people card's 16:9 box was established. Second: in an iframe
  harness, put the
  `<script>` **after** a `<body>` element — a bare `<style>`+`<script>` at the
  top of the file is parsed into `<head>`, `document.body` is still null,
  `appendChild` throws, and you screenshot an empty page with no error
  anywhere. (`document.write` happens to work, which is why one harness worked
  and the next didn't.) Once both are handled, reveal renders fine at 390px:
  `.slides` scales to ~0.30 and letterboxes the 16:9 slide into a ~220px band,
  complete and unclipped. That is reveal preserving aspect, not a defect —
  confirm it by reading `.slides` `transform` and the section's
  `visibility`/`opacity` rather than trusting the image.
- **A grep over build output is itself a sensor, and it can lie.** Twice now a
  `grep -qiE "error|..."` over `pnpm build` reported "the build complains"
  when the build was in fact completely green, sending me to correct a
  docstring that was already right. When the answer decides whether a check is
  worth keeping, read the verbatim output rather than a boolean derived from
  it --- and prefer grepping for the *specific* string the failure would print
  (`Broken link:`, `page(s) built`) over a catch-all like `error`, which
  matches deprecation notices and stack frames.
- **`![bg](./assets/x.svg)` in a deck 404s, and the build logs it as a
  success.** astromotion's remark plugin emits `background-image:
  url('./assets/x.svg')` on a page served at `/decks/<name>/`, but its asset
  copier (`src/asset-collector.ts`) writes the file to
  `dist/src/decks/assets/x.svg` — it preserves the path relative to the
  *project root*, not to the deck's route. So the slide asks for
  `/<base>/decks/week-01/assets/x.svg` (404) while the file is served from
  `/<base>/src/decks/assets/x.svg` (200), and the build prints `Copied 3 deck
  asset(s) to build output.` on its way past. A slide missing its background
  is pixel-identical to a slide that was never given one, so the structural
  deck check, axe and the link checker all stay green. **Put deck artwork in
  a component and `import` it into the `.deck.mdx`** — astromotion's other
  supported route for slide content, and the better one anyway: an inline SVG
  gets `--at-light-grey`, `--at-dark-grey` and the brand golds from deck.css
  instead of hex values sampled off a screenshot. Also note `_class: impact`
  paints its own gold fill over the whole slide, so a background image on an
  impact slide is invisible even when the path is right.
- **A top-level `--screenshot` can silently drop the hero image, and the blank
  it leaves looks exactly like artwork that never rendered.** The home page's
  hero came back as a pure vertical gradient --- every pixel in a row identical
  left of the title, so not one mark of the drawing on the canvas --- at
  `--virtual-time-budget=6000` and again at `20000` with
  `--run-all-compositor-stages-before-draw`. The image was fine: the same page
  inside the same-origin iframe harness paints it (within-row spread 251 vs 17),
  `404.html` carries the identical `hero-home.avif` and paints it top-level
  (163), the people page's AVIF portraits paint top-level, and the hero file
  loaded standalone paints. Reading the element's own state from inside the page
  settled it --- `complete: true`, `naturalWidth` non-zero, `object-fit: cover`,
  `opacity: 1`, a 1885x571 rect. So: **a hero missing from a screenshot of a
  heavy page is a sensor reading, not a finding.** Confirm it in the iframe
  harness or by reading `img.complete`/`naturalWidth`/`currentSrc` before
  touching the artwork, and measure "did the art paint" as within-row spread in
  a band the title does not reach, not by eye --- the title and scrim alone give
  a whole-band stddev of 77, which reads as "something is there".
- **The theme renders `slides:` as a real anchor, so the link checker resolves
  it.** A dangling `slides: /decks/week-99/` therefore fails `pnpm build`
  (`Broken link: /<base>/decks/week-99/`), *not* only a spec test --- a check
  written to catch that duplicates the build. What the build genuinely cannot
  see is a lecture with **no** `slides:` at all: strip it from every lecture
  and the build is green at 41 pages with no broken links, while the brief's
  linked-deck requirement is silently unmet. Absence is the gap; a wrong value
  is already covered.
- **A colon-space inside a multi-line *plain* YAML scalar is a parse error**,
  and this bites constantly in frontmatter because good prose uses colons.
  `description:` followed by an indented `The method, stated plainly: how
  to...` fails with `can not read an implicit mapping pair; a colon is missed`
  (or `a multiline key may not be an implicit key`) --- YAML reads `plainly:`
  as a key. A single-line value can be quoted, but for a wrapped one use a
  folded block scalar: `description: >-`. Titles are the other hot spot and
  need quoting (`title: "Alfa to Zulu: the..."`). `astro check` catches these
  before the build, so the cheap loop is `pnpm typecheck` rather than a full
  `pnpm check`, and the error names the exact line and column.
- **Shiki rewrites `data-language` to the language it fell back to, so a
  custom fence tag does not survive into the HTML.** A ```` ```atc ```` block
  renders as `<pre ... data-language="plaintext">` and logs `[Shiki] The
  language "atc" doesn't exist, falling back to "plaintext"` --- the build
  still succeeds, and plaintext monospace is the right look for a transcript,
  but the built HTML carries no trace of which blocks were transmissions. Parse
  `dist/api/<collection>/<slug>.json`'s `body` instead: it is the raw markdown
  with the fence info string intact, and it is a build output rather than
  source. Note `dist/api/index.json` has neither `body` nor `links` --- only
  the per-node files do, so a prose or citation check has to read those.
  The fallback warning is expected and is left in place rather than silenced
  by editing the fixed `astro.config.ts`.
- **A bot-challenge host returns 200 for every path, so `curl -o /dev/null -w
  "%{http_code}"` cannot verify an external citation.** `skybrary.aero` serves
  a "SuperJS check" interstitial with status 200 to any URL under it ---
  including `/totally-bogus-path-xyzzy`. Six invented-but-plausible report
  URLs all "verified" green this way before a known-bad control path came back
  200 as well and gave the game away; every one of the six was in fact wrong.
  Verify an external URL with headless Chrome `--dump-dom` and read the
  `<title>` (the browser passes the challenge; an archived or missing SKYbrary
  page says so in its title), or for a PDF check `content_type` **and** the
  `%PDF` magic bytes. Either way, **put a deliberately bogus URL in the same
  batch** --- that control is the only thing that distinguishes a working
  sensor from one measuring the interstitial. Some hosts (`faa.gov`) deny
  headless outright, which is inconclusive rather than negative: cite a host
  that can be checked instead. `checkExternalLinks: false` in the theme means
  the build will never catch a dead citation for you.
- `sharp` rasterises SVG here, text included, despite `allowBuilds: sharp:
  false` in `pnpm-workspace.yaml` --- the prebuilt binary carries librsvg, so
  the skipped install script doesn't matter (verified: 0.35.3 / libvips 8.18.3,
  SVG to both PNG and AVIF, and a text render differs from the same SVG with
  the `<text>` removed rather than silently dropping the glyphs). Artwork can
  therefore be authored as SVG and rasterised locally to the paths the theme
  consumes. Keep that render a **local** step whose output is committed: CI
  never rasterises, so CI never needs the fonts.
- **`heroImage` is a crop, not a picture.** The theme renders it as a
  full-bleed band, so a square source is cropped to a horizontal strip through
  its middle and the rest is thrown away. Geometric artwork survives that (a
  strip through a gold disc still reads as an intentional band of colour) and
  `hero-home.avif` is 2560x1086 because it was drawn for the aspect. A
  **photograph does not**: a 900x900 portrait came out as a macro shot of one
  eye and half a moustache, under a scrim, with the page title over it. Nothing
  catches this --- `pnpm build` is green, axe is happy, the alt text is
  accurate --- so any new `heroImage` has to be looked at rather than wired up.
  When the source is square, put it in the page body at its own aspect instead.
  The measured boxes, which are **not** "roughly 350px tall": **1600x566** at a
  1600px window (aspect 2.83, keeping 83% of a 2560x1086 asset's height) and
  **390x360** at 390px (aspect 1.08, keeping only **46% of its width**). So the
  subject has to be centred and everything that matters has to sit inside the
  middle 46% --- detail at the left or right edge simply does not exist on
  mobile.
- **The hero's scrim is heavier than it looks, and it decides which artwork can
  work at all.** `.at-hero-content` lays
  `linear-gradient(#00000026, #0009 50%, #000c)` over the image so the white
  title stays legible: 15% black at the top, **60% at mid-height, 80% at the
  foot**. A cream-ground illustration --- calm sky, centred tower, thin gold
  hairline arcs, both crops verified clean --- went to grey-brown sludge the
  moment it rendered, and it was encoded, wired up and building green before
  that was visible. The crop preview was not broken; it was answering *what
  does this artwork look like* when the question was *what does it look like
  under a 60-to-80% black gradient*. Dark-ground with generous gold survives,
  because the scrim compresses contrast and near-black plus strong gold has
  contrast to spare where cream plus hairlines does not --- which is why the
  hand-drawn gold-on-black hero this replaced never looked muddy. **Composite
  that gradient over any hero candidate before choosing it**; the simulation
  agreed with the real render once it included the scrim.
- **Generations from the image proxy can carry a pale mat on all four edges.**
  `ideogram-v3-quality` returned a near-black poster with a ~21px light border:
  column means 187/186 at left/right, row means 185/185 at top/bottom, against
  52 twenty pixels further in. On a full-bleed band that renders as two light
  vertical strips down the outer edges. `scripts/render-hero.ts` trims 24px a
  side. Check for it rather than assuming the frame is the artwork --- and note
  the proxy does not honour the requested size either: `1792x1024` comes back
  **1312x736**, so writing a 2560-wide asset is a ~1.95x upscale (fine for flat
  vector fields, not for anything with texture).
- **`sharp`'s `.stats()` ignores a preceding `.extract()`.** Profiling those
  edge columns, `sharp(f).extract(...).greyscale().stats()` returned an
  identical mean of 68.3 for all six bands --- including ones that obviously
  differ --- because it reports whole-image statistics. A perfectly stable
  sensor measuring the wrong region. Reduce over `.raw().toBuffer()` instead,
  and put a band you *know* differs in the same batch: that control is what
  exposed it in one step.
- **In an Astro page, adding a `<style>` block re-writes the markup a spec
  test greps.** Astro stamps `data-astro-cid-*` onto the scoped elements, so
  `<dt>Role</dt>` becomes `<dt data-astro-cid-2xjjkmfy>Role</dt>` and a
  `<dt>Role</dt>` pattern silently stops matching. Match `<dt[^>]*>` in any
  assertion that reads built HTML.
- **The people collection's `role` is `z.string().trim().min(1)`, not an
  enum**, whatever the comments nearby say --- `src/content.config.ts` is the
  only authority on that. A free-string field that gets translated for display
  through a `Record<string, string>` lookup fails *silently* for any value not
  in the table: no label, and a `?? 99` sort fallback. Derive the display form
  from the value (capitalise it, name only the exceptions) so an unlisted value
  renders wrong at worst rather than vanishing.
- **`node` can't `require('sharp')` from a script outside the repo**, and
  can't `require` at all from a `.js` inside it (`package.json` has `"type":
  "module"`). A throwaway measuring script needs to be `*.cjs` **and** sit in
  the repo root for resolution to find `node_modules`.
- **`astro preview` takes 10--15s to accept connections and prints nothing
  until it does.** `curl` before then returns exit 7 / `000`, which reads
  exactly like a server that failed to start; the log file still only contains
  the echoed command line. Wait and retry before concluding anything, and read
  `astro preview status` rather than the absence of log output.

## The course image proxy

`POST https://strproxy.comp.anu.edu.au/api/images/generations`, OpenAI-shaped,
authenticated with the **same** credential as `ANTHROPIC_AUTH_TOKEN` (that env
var's `ANTHROPIC_BASE_URL` is this host; `OPENAI_API_KEY` is a different key
and gets `401 invalid bearer`). Body is `{model, prompt, size?, n?}`; the
response is `{created, data:[{url}]}` with temporary Replicate URLs, so
download immediately.

- **Read the constraints off a 400 rather than guessing — rejections are
  free.** Models: `flux-1.1-pro`, `flux-dev`, `flux-schnell`,
  `ideogram-v3-quality`, `recraft-v3`. Sizes: **only** `1024x1024`,
  `1024x1792`, `1792x1024`. `n` is 1--4, except `ideogram-v3-quality` **and
  `flux-1.1-pro`**, which both cap at 1 (`model 'flux-1.1-pro' returns at most
  1 image(s) per call`) --- so treat per-model caps as something to discover on
  a 400, not a property only one model has. And the size is a *request*, not a
  contract: `ideogram-v3-quality` answers `1792x1024` with **1312x736**, so
  read the dimensions back off the file before computing any crop from them.
- **`ideogram-v3-quality` follows a prompt that `flux-dev` overrides.**
  `flux-dev` returned a woman of about twenty on four separate attempts at a
  prompt asking for a woman of about fifty --- including one describing the
  face rather than naming an age --- while rendering an elderly man correctly
  from the same prompt shape. The identical prompt through
  `ideogram-v3-quality` came back right first time. When a generation keeps
  missing one stated attribute, **change the model before rewriting the
  prompt again**, and compare models on one unchanged prompt so the variable
  is the model.
- **None of these models do negation.** "Absolutely no text, no letters, no
  numbers, no logos, no signage anywhere in the frame" produced monitors full
  of garbled interface text. Describing the thing positively --- "a single
  smooth luminous waveform trace, like an oscilloscope on a plain dark
  screen" --- emptied them. Say what should be there, not what shouldn't.
- **Non-ASCII in a prompt fails the whole request.** An em-dash in the JSON
  body comes back `400 {"detail":"There was an error parsing the body"}` from
  this shell. Keep prompts ASCII.
- `GET api/me` returns two **separate** budgets, and reading the wrong one is
  what made this note wrong twice. `current_week_spend` / `max_budget` is a
  **model-usage** counter: image generation genuinely does not move it (it held
  still across nine images with a 25-second settle while climbing steadily from
  model calls), and an earlier note correctly observed that and then wrongly
  concluded per-image cost was unmeasurable. It is measurable --- in
  `image_spend` / `image_budget` / `image_budget_remaining`, which the same
  response carries. Images cost **\$0.10 each**, confirmed twice: 5.50 -> 5.60
  -> 5.80 over three calls, and 6.30 -> 6.60 over three more. The lesson is the
  general one: "the counter did not move" answers *does this counter track
  that* and says nothing about whether another field does. Enumerate the
  response before concluding a quantity is unavailable.

## Keeping PROCESS.md current

`PROCESS.md` is maintained as the work goes, not written at the end. After any
change that produced a real moment, consider whether it beats one of the ones
already there, and say so rather than silently growing the file.

**Three or four moments is a budget I set, not something the brief asks for.**
The brief names no number --- `moment` appears in it zero times --- so do not
cite it as the authority for this. The budget is arithmetic: 400--600 words,
minus the spine the brief *does* ask for (a position on what a good course is,
what that put in the harness, what was deliberately left out), leaves room for
about three. A further one means replacing a weaker one. This file is read
against the brief, so a rule of mine dressed up as a rule of theirs is a
liability in exactly the section that is being marked.

A moment earns its place only if it has all four jobs: what went wrong, what
was done **instead of the obvious thing**, how that was verified, and a
citation that resolves. The bar for "strong" is a correction that landed in the
harness --- a rule in this file, a check wired up, an attempt discarded --- not
another prompt. For this assignment, the moments worth keeping are as much
about course-design calls as technical ones.

Keep it inside 400--600 words (`pnpm check:evidence` verifies the citations
resolve, not the length), and re-run that check after editing.

## This file is yours

As you learn what this course-site needs --- a convention to hold the agent
to, a sensor that keeps catching you out, a fact about the stack the agent
keeps getting wrong --- write it down here.
