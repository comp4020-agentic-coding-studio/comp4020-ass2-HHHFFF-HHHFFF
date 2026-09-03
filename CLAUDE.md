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
- Commit when the checks pass. Never commit a red state.

## This machine's environment

Carried forward from Assignment 1, where these facts cost real time to find.

- There is no `agent-browser` CLI on this machine. Ground truth comes from
  headless Chrome directly:

  ```bash
  pnpm build && npx vite preview --port 4173 --strictPort &
  "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
    --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=6000 \
    --screenshot="C:\Users\H-F\AppData\Local\Temp\shot.png" \
    "http://localhost:4173/<repo>/"
  ```

  Write the screenshot to the temp dir, not the repo --- Chrome gets
  access-denied writing into the working directory. Serve over HTTP, never
  `file://` --- a module script won't run from a `file://` origin, and the page
  will silently render with no JavaScript at all.
- **Chrome clamps its window to a 500px minimum on this machine**, so
  `--window-size=390,844` does not produce a 390px viewport --- it's the left
  390px of a 500px layout, cropped, which looks exactly like horizontal
  overflow that isn't there. Measure 390px by rendering the page inside a
  390px `iframe` instead of resizing the window, and pass `--hide-scrollbars`
  on that render too, or the iframe's own scrollbar eats into the frame.
- Headless Chrome barely advances `requestAnimationFrame` --- a `--virtual-time-budget`
  of many seconds can still only advance animation by about one frame. Anything
  driven by rAF needs a test-seam hook on `window` that steps the same state
  the visitor sees, rather than waiting on frames.
- JSDOM does not execute `<script type="module">`, has no `requestAnimationFrame`,
  and `canvas.getContext("2d")` returns `null`. It also doesn't model the
  user-agent/author CSS cascade correctly. Don't contort a test to make JSDOM
  happy about something it can't see --- keep interactive logic in a DOM-free
  module you can test directly, assert markup contracts in JSDOM, and check
  what actually renders in real Chrome at both marked viewports.
- The `hidden` attribute is only `[hidden] { display: none }` in the user-agent
  stylesheet, and an author rule at any specificity beats it. An element that
  sets its own `display` and gets toggled by `hidden` needs the override
  alongside it (`.thing[hidden] { display: none; }`), or it renders visible
  while every markup assertion still passes.

## Keeping PROCESS.md current

`PROCESS.md` is maintained as the work goes, not written at the end. After any
change that produced a real moment, consider whether it beats one of the ones
already there, and say so rather than silently growing the file --- the brief
asks for **three or four**, so a further one means replacing a weaker one.

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
