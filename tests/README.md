# Demo browser tests (seed for Step 0)

Browser tests for `demos/bnseguros.html`, the Best National Insurance quote
demo. They drive the page in Chromium with iPhone 13 emulation and check what
a customer sees and what gets sent to WhatsApp.

**Status: seed, not golden.** These tests are the starting point for the
funnel-engine plan's Step 0 ("behavior-lock fixtures"). They are not those
fixtures yet. See "Known gaps" below.

## Run

```sh
cd tests
npm install        # installs Playwright
npx playwright install chromium   # first time only
npm test           # or: node run.js auto utm  (only some suites)
```

If Playwright is already installed elsewhere, point to it instead of
installing: `PLAYWRIGHT_PATH=/path/to/playwright node tests/run.js`.
`TEST_PORT` changes the local server port (default 8765). Screenshots go to
`tests/.out/` (git-ignored).

## Suites (159 checks)

| Suite | Checks | Covers |
|---|---|---|
| `auto.test.js` | 82 | Full auto quote: required-field errors, vehicle pickers, VIN and mileage, every step's title and "Paso X de 9", back button step by step, editing from the review screen and returning to it, the full WhatsApp message (key lines), home bundle, confirmation screen |
| `casa.test.js` | 34 | Home quote: address errors, owner/renter/condo branching (renters skip building questions, condos skip the roof), hurricane protection, current insurer and renewal month, review edits that add a newly required question, message lines |
| `resume.test.js` | 21 | Reload mid-quote picks up where it left off; "Empezar de nuevo"; closing the quiz; the mid-quiz "prefer WhatsApp" message ("No terminé el formulario…") and the intro escape ("Prefiero hacer la cotización por aquí.") |
| `layout.test.js` | 17 | Smallest phone (320 px wide): no sideways scroll and the main button visible on every step, no errors. Desktop: content capped at 576 px, Escape closes. Reduced motion: no slide/fade animations. Opened as a local file: the flow, Back and close still work |
| `utm.test.js` | 5 | The "Vía:" source line from `utm_*` links, and that odd characters are stripped and length is capped |

## Known gaps (why this is seed, not golden)

- **Messages are checked in pieces, not word for word.** Most WhatsApp
  assertions use `includes(...)` on key lines. Step 0 needs full-message
  fixtures compared character by character, across the answer set in the plan.
- **Fixtures are embedded in the test flow.** Answers are typed by the test
  script rather than loaded from reusable fixture files the rewritten engine
  can also be checked against.
- **No screenshot baseline or contrast assertion.** Screenshots are saved
  for a person to look at; nothing compares them automatically yet.
- **Wait-based timing.** Suites use short fixed waits (`settle`, 350 ms) and
  may be slow or flaky on a loaded machine.
- **The logo 404 is ignored on purpose:** `bnseguros-logo.png` is referenced
  by the demo but has not been committed.
