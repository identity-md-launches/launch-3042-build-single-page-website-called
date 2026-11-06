# Hamster Chronicles

A living story powered by Squeektoshi’s real wheel on Squeekchain. Read a chapter, join the village, and choose what your character does next.

**The entire website runtime is in `index.html`: HTML, CSS, JavaScript, fonts, favicon, and pixel illustrations.** `dist/index.html` is its byte-for-byte production export. The only accompanying asset is `dist/social-card.png`, used by link previews. No backend, wallet, transactions, keys, remote scripts, or runtime packages.

## Install, build, and preview

Use Node.js 22 or newer:

```sh
npm ci
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/preview/`. Stop the preview with Ctrl+C. A different port can be supplied with `npm run preview -- 8080`.

The build itself uses only Node’s standard library and works without installing development packages. It copies `index.html` and `assets/social-card.png` into `dist/`. Serve the complete `dist/` directory with any static HTTP server, including at a gateway subpath. Links use fragments and the social image uses `./social-card.png`. The local preview server is a development tool, not part of the website.

## How the story works

- `/v1/status` is fetched immediately and every **20 seconds**. Each positive change in `measurement.cumulativeWorkUnits` is one observed story round. The delta chooses Nap (0), Journey (1–499), or Storm (500+).
- The first successful reading establishes a baseline and an opening Nap Chapter with **0 newly observed work**. After an active chapter, an unchanged reading with `coreStatus: IDLE` produces one Nap; repeated idle readings do not fill the archive. These are this browser’s story rounds, not Squeekchain consensus rounds. Work that occurred while this browser was closed becomes one observed delta on return.
- A decreasing counter or changed counter epoch rebases the reading without counting negative work. The next increase uses the new baseline.
- FNV-1a hashes cumulative work and block height; Mulberry32 selects from 30 openings, 16 settings, 16 NPCs, 24 events, 12 endings, and 24 choice labels. The same immutable round snapshot and previous local vote produce the same chapter. RPM, new work, block height, and progress are quoted from that snapshot. Displayed chapters do not change when only live metrics update.
- Each chapter has three distinct choices. One character may cast **one vote per chapter**, earning one point. This browser’s vote is its winning choice; there is no global tally. The next chapter references the choice and the voter’s name and role as they were when voting. Editing the character preserves points and previous votes.
- Selecting a choice before joining opens the character form and saves that choice after joining. If a new round arrives during the form, the visitor must choose again in the new chapter.
- Up to **50 chapters total**, including the latest, are saved newest first. The archive shows the preceding 49 when full. Lifetime contribution points survive pruning.

## Public data and recovery

The browser directly reads only these public GET endpoints:

| Endpoint | Use | Refresh |
| --- | --- | --- |
| `https://api.squeekchain.com/v1/status` | Wheel status/RPM/speed, cumulative work, block height and progress | 20 seconds |
| `https://api.squeekchain.com/v1/settlements?range=24h` | Inline SVG chart, exact data table, work/settlement/completed-block sums | 2 minutes |
| `https://api.squeekchain.com/v1/economy/state` | Minted SQK, divided by 10¹⁸ with BigInt; displayed to two decimal places | 2 minutes |

Requests omit credentials, have a 10-second timeout, and cannot overlap for the same endpoint. Each failed endpoint retains its own last good data and contributes to the small reconnecting indicator. Requests resume automatically and also refresh when the tab becomes visible or the browser comes online. Initial failures never generate a fabricated chapter. Empty settlement windows and zero-work windows have separate states.

The wheel rotates once every `60 / RPM` seconds only while the last reading says `SPINNING` and RPM is positive. Pause stops the illustration while readings continue. Reduced-motion preferences stop wheel and chapter animations.

## Local memory and privacy

The single localStorage key is `hamster-chronicles-v1`. It contains the character, votes, retained chapters, baseline reading, and last good API data. Every storage read/write is guarded. If storage is unavailable or full, the page continues in memory and explains that new data may not survive reload. Invalid saved data starts a fresh village with a visible notice.

Names have a 20-character limit, HTML tags and invisible control characters are removed, and all dynamic text uses `textContent`. No visitor data is sent to the APIs. Clearing this site’s browser storage removes its village. Different browsers have independent histories; simultaneous tabs are not synchronized and their last successful save wins.

## Check the implementation

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run test:live
```

`typecheck` extracts the actual inline script into temporary scratch space and runs TypeScript with `--allowJs --checkJs --strict --noEmit`. The unit suite loads that same script; it does not test a duplicate engine. Browser checks serve the actual production export under `/preview/` and inject explicitly controlled API responses for progression and error cases. `test:live` makes real public API requests, so it requires network/service availability.

To attempt the additional Safari-engine check, install WebKit with `npx playwright install webkit`; its OS libraries must also be available. `test:browser` reports a missing WebKit runtime separately rather than counting it as a pass.

To recreate the social image from the embedded font and SVG scene:

```sh
npm run social-card
npm run build
```

### Actual validation on 2026-11-06

- Production build: passed. Strict JavaScript typecheck: passed.
- Unit tests: **10 passed**, including **10,000 reproducible chapters**, all 133–156 words in the tested inputs.
- Chromium interaction groups: **12 passed**, including form validation, local voting/reload, a choice-to-join flow, a new round during joining, work thresholds, 20-second polling, pause/reduced motion, per-endpoint failure/recovery, storage failures, malicious saved text, and archive retention.
- No horizontal page overflow at 320, 390, 600, 768, 940, or 1440 pixels; 200% text enlargement also passed. Both theme variants and the character dialog had zero axe violations in the tested WCAG A/AA rule sets.
- Real browser requests: all three APIs returned HTTP 200; a real Nap Chapter, 24-hour work, and SQK supply rendered successfully.
- Pinned `taste@1` probe: **15/16 passed with live data**. Its remaining desktop copy-budget flag is intentional: the brief requests a visible 120–200-word chapter. The phone’s first screen met the probe’s 60-word budget and includes the product and Join action. No layout, contrast, target, motion, or missing-asset failures remain.
- The supplied browser connector could not launch due to its temporary socket path. Local Playwright supplied the rendered checks instead. **WebKit could not launch because host libraries were missing.** Physical-device, native 200% browser zoom, and screen-reader sessions were not performed.

See [VALIDATION.md](VALIDATION.md) for six-domain review coverage, fixes, and evidence. [DESIGN.md](DESIGN.md) documents the implemented design system. Screenshots in `docs/screenshots/` distinguish live API readings from controlled test data. These are worker-run checks, not independent certification.

## Files and attribution

- `index.html`: complete editable site source; edit here, then rebuild.
- `dist/`: finished static export, ready to serve.
- `assets/social-card.png`: source social preview, copied by the build.
- `scripts/`: build, preview, strict typecheck, social preview generation, and optional review tooling.
- `tests/`: reproducible engine, browser, and live API checks.
- `licenses/`: embedded font licenses and design-guidance notices.

Pixelify Sans is by the Pixelify Sans Project Authors; the two emoji glyphs use Noto Emoji by Google, both under SIL OFL 1.1. The SVG artwork and story templates were made for this site. Better Interface design guidance is by Jakub Krehel (MIT); the documentation method is adapted from Paul Bakaus’s Impeccable (Apache-2.0). The preserved notices are in `licenses/design-guidance.txt`.

No ignore files were changed. Development packages and browser downloads used during this assignment were isolated in the excluded `test/scratch/` directory. The submission contains source, lockfile, export, documentation, licenses, and selected evidence only.
