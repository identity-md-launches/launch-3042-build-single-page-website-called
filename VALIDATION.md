# Validation and design review

Completed on 2026-11-06 against the production export in `dist/`. These are the worker’s own checks, not independent certification.

| Area | Result |
| --- | --- |
| Brief requirements | 22 grouped requirements implemented; 0 fabricated data/participation features |
| Production build / strict typecheck | Passed |
| Engine tests | 10 passed, including 10,000 chapter samples |
| Chromium interaction groups | 12 passed, 0 failed |
| Product and Join action on first 390px screen | Yes, observed in screenshots and bounding-box checks |
| Pinned taste@1, live data | 15/16 passed; desktop story length exceeds the generic copy budget by design |
| Automated accessibility | 0 axe violations in tested light, dark, and dialog states |
| Share metadata | Title, description, favicon, og:title, local 1200×630 og:image |
| Browser limits | Supplied connector launch failed; local Chromium used. WebKit host dependencies unavailable |

The visual idea: a readable parchment chronicle inside a navy-and-gold pixel village, animated by the real wheel reading.

## Scope and consequential assumptions

One read-only, single-page app. Plain HTML/CSS/JavaScript was chosen because the brief explicitly requires a self-contained file; adding a framework would not help this product. The application has no backend, wallet connector, keys, signing, transactions, shared voting, or server-side state. The supplied wallet-connector reference is therefore **not applicable**.

A “round” is an observed positive cumulative-work delta. The initial reading is a zero-delta Nap baseline; a subsequent active-to-idle story transition receives one Nap, then unchanged polls are deduplicated. This resolves the brief’s zero-work chapter requirement without creating a chapter every 20 seconds indefinitely. The interface explains browser-observed rounds. Counter resets rebase and do not create negative work. There is no attempt to reconstruct unseen intermediate rounds.

Each browser has one character and one locked vote per chapter, so the local vote is the winning choice. The following chapter references its exact voter identity and path. The seeded template selections are reproducible for a given round snapshot; the personalized continuation also depends on the explicit previous vote. The archive retains 50 chapters total, including the latest. These choices are documented in the README and UI rather than hidden behind claims of global state.

The single-file runtime embeds fonts, art, CSS, script, and favicon. The separate social PNG is metadata for link unfurls. It does not supply visible page content. Source asset, font notices, and build inputs remain in the submission.

## Requirement coverage

| Brief requirement | Status and implementation |
| --- | --- |
| “single-page website called Hamster Chronicles” | Met: title, hero, one main landmark and fragment navigation |
| “Pure front-end… no backend… no wallet… no transactions… no API keys” | Met: static HTML and credential-free GET requests only |
| Read status fields | Met: validated RPM, speed, cumulative work, height and progress |
| Settlements buckets and supply / 1e18 | Met: chart, data table, all three bucket sums, BigInt SQK conversion |
| “Poll /status every 20 seconds” | Met: fixed 20,000ms interval, request timeout and overlap guard; synthetic-clock browser check |
| Failure keeps last good data and reconnecting badge | Met: independent per-source state, cached snapshots, initial loading/error recovery |
| New work drives rounds and 0/1–499/500+ chapter types | Met: state reducer and exact boundary tests |
| “120 to 200 words” | Met: 10,000 sampled chapters are 133–156 words; tests exercise all types and vote/no-vote context |
| Deterministic large-pool templates seeded by work and height | Met: FNV-1a/Mulberry32 with 30 openings, 16 settings, 16 NPCs, 24 events, 12 endings |
| Real numbers inside the story | Met: snapshotted RPM, work, block height and progress; no random live readings |
| “2 to 3 choices” | Met: three distinct choices sampled without replacement |
| Name max 20, strip HTML, five roles | Met: form limits, sanitization, bound native controls, fixed role list |
| Next chapter references winning choice and character | Met: previous vote snapshot includes name/role/label; verified in generated text and browser |
| Character card, choices, +1 contribution | Met: locked one-vote semantics and lifetime count survive reload/pruning |
| localStorage try/catch and empty state | Met: read/write/corrupt-data checks; memory fallback with visible notice |
| Hero, tagline and live running/sleeping pill | Met: supplied wording, fire/zzz glyph and real RPM |
| Pixel wheel spins at real RPM and stops on idle | Met: `60 / RPM`; real animation duration and pause state checked; reduced-motion support |
| Parchment chapter, round badge, scrollable newest-first archive | Met: readable serif article, type badge, native details archive |
| Inline SVG last-24h chart and three-step explanation | Met: scaled bars, readable HTML labels, accessible table; all three steps present |
| Footer Squeekchain link and local/read-only/community honesty | Met: explicit footer text, no shared-vote implication |
| Cozy dark/light responsive design, self-contained runtime | Met: CSS tokens/themes, embedded font/SVG, mobile and overflow checks |
| Build/export/lockfile, metadata, DESIGN.md, README, review results | Met: complete source/export, reproducible commands, design record and this report |

Hosting/publication is outside this implementation. No deployment was attempted. The brief leaves no missing owner, recipient, contract, key, or ID.

## Six-domain Better Interface review

The supplied workflow and core principles for all six domains were reviewed during construction. Additional sections used: focus/keyboard, forms, motion/zoom, grouping/adaptivity, wrapping/numbers, color roles/contrast, surfaces, icons, and documentation. All six domains received source and rendered review; limitations are explicit below.

| Domain | Checked coverage | Evidence and limits |
| --- | --- | --- |
| Accessibility | Native controls and landmarks; labels; modal name/description; invalid field focus; keyboard join/vote/Escape; focus return; live announcements; reduced motion; named scroll regions; data-table alternative; forced colors | Chromium interactions and zero axe findings in both themes/dialog. Focused field screenshot inspected. No screen-reader or physical-device session; no claim of full WCAG conformance |
| Layout | Main action/product on 390px first screen; shared alignment; sidebar collapse; 320–1440px reflow; chart/table contained scrolling; archive height and disclosure | 320, 390, 600, 768, 940, 1440px checked. No page overflow. 200% root-font enlargement passed; native browser zoom and RTL/localization were not tested |
| Writing | Plain control/error labels; local-only vote wording; no fabricated live data or global consensus; explicit empty/loading/recovery states; story voice kept in the chronicle | Source/copy review plus primary flow. The required 120–200-word story deliberately exceeds a generic desktop landing-page copy budget |
| Typography | Six-token scale, three prose faces, two weights, 18px serif story/66ch measure, 16px inputs, tabular numbers, no clipped names, embedded font load | Loaded Pixelify Sans checked in Chromium; screenshots inspected. The font is embedded TTF rather than WOFF2, keeping the provided Google Fonts face self-contained at a small total page size. Chart labels moved outside SVG scaling to retain 14px text |
| Colors | Both palettes, semantic variables, category words, actual computed solid text/background pairs, focus and error treatments | `docs/contrast.json`; story 11.25:1, metadata 5.03:1, primary 9.12:1 dark / 6.36:1 light, muted panel 7.75:1 dark / 4.78:1 light. Artwork and individual dotted-background pixels were not contrast-certified |
| UI | Native modal, choices’ pressed/disabled/receipt states, preserved API data, storage notices, chapter fade, actual wheel rate/pause, empty archive/chart, HTML-only text insertion | Full interaction suite and screenshots. No animation-devtools 10%-speed session; animation timing and reduced-motion behavior checked programmatically |

## Findings, fixes, and rechecks

Source locations refer to the final `index.html`, not the generated export. No high-impact behavior or layout defects remain from the inspected states.

1. **High, story requirement: short template combinations.** `index.html:472`, `generateChapter`. The initial sample test found a 119-word chapter. Added a fitting closing sentence, keeping the text deterministic. Recheck: 10,000 samples, now 133–156 words. No filler or sample readings are used as runtime fallbacks.
2. **Medium, first-screen layout: actions consumed two rows at 390px.** `index.html:204`, mobile `.hero-actions`. The first screenshot showed a redundant second hero sentence and wrapped secondary action pushing story content down. Shortened the description and secondary label, reduced the mobile action gap to 8px, and compacted the scene. Recheck: both actions, wheel, chapter title, and opening story appear on the first 390×844 screen; 320px safely wraps.
3. **Medium, accessibility: choice rerender could remove the focused button.** `index.html:663`, `hadFocus`; `index.html:672`, focusable receipt; vote handler in `boot`. Preserve focus on the article when a focused old chapter changes, and send a completed vote to its receipt without scrolling. Recheck: keyboard vote and joining-through-choice tests pass.
4. **Medium, interaction: joining through a choice lost that choice.** `index.html:571`, `pendingChoice`; `index.html:804`, round check. Store the selected choice while joining; apply it only if the same chapter is still current. Recheck: a normal join earns one point; an intervening new chapter requires a fresh vote and earns no accidental point.
5. **Low, rendering: host had no usable emoji fallback.** `index.html:609`, `renderWheel`. The initial screenshot showed missing-glyph boxes. Embed a licensed two-glyph Noto Emoji subset and render the required fire/zzz glyph in an SVG icon. Recheck: both icons visibly render; the text independently names running/sleeping. No remote font request is needed.
6. **Low, probe false positive: native progress fallback looked like low-contrast text to the probe.** `index.html:266`, `#block-progress`. The initial probe counted the native element’s unused fallback text as 3.29:1 even though the bar rendered. Removed the redundant fallback; the real progress value, bound label, and visible percentage remain. Recheck: final probe and axe contrast checks pass.
7. **Medium, typography: chart labels shrank with the SVG viewport.** `index.html:168`, `.chart-frame`; `index.html:705`, `renderActivity`. Scaling the 1000-unit SVG to its 560px mobile minimum also scaled its 14-unit labels. Move the scale/date labels into HTML at the existing 14px token, keep the bars in SVG, and retain internal scrolling. Recheck: browser chart/table/overflow and final probe pass.
8. **Packaging correction: a build input was in an ignored artifact directory.** `scripts/build.mjs:7`. A Git inventory showed the initial social image source would not be bundled. Moved it to `assets/social-card.png`, notices to `licenses/`, and kept reports at the repository root / `docs/`. Recheck: all build inputs and both export files appear in the submission inventory; no ignore file was changed.

The first frozen-clock accessibility run stalled because axe needs advancing browser timers. The test harness now resumes its clock before auditing and has a 90-second watchdog. The full suite then passed. An early hostile-storage fixture also used an entirely stripped name and correctly triggered the fresh-data fallback; the fixture was corrected to retain a valid name while testing hostile text. Neither was concealed as a successful run.

## Commands and actual results

Development tools and downloaded browsers were installed in excluded scratch space because this assignment prohibits touching repository `node_modules/`. The lockfile at the root describes a normal reproducible `npm ci` installation.

```sh
npm install --package-lock-only --ignore-scripts --cache test/scratch/npm-cache
npm install --prefix test/scratch/tooling --ignore-scripts --cache test/scratch/npm-cache typescript@5.9.3 playwright@1.61.1 @axe-core/playwright@4.11.1
PLAYWRIGHT_BROWSERS_PATH=test/scratch/browsers node test/scratch/tooling/node_modules/playwright/cli.js install chromium webkit
npm run build
npm run typecheck
npm test
PLAYWRIGHT_BROWSERS_PATH=test/scratch/browsers npm run test:browser
PLAYWRIGHT_BROWSERS_PATH=test/scratch/browsers npm run test:live
```

- Build: exit 0; copies the complete single-file app and the social PNG. Source/export identity is checked in the submission audit.
- Typecheck: exit 0; TypeScript strict `checkJs` on the actual shipped inline script, ES2022 and DOM types, no emitted bundle.
- Engine: exit 0, 10 tests. Boundaries, reproducibility/word counts, work deduplication, idle transitions, resets, vote points/identity/continuation, persistence, retention, precision, and sanitization.
- Browser: exit 0, 12 Chromium groups. Controlled responses are test fixtures only; none ship as production defaults. Includes initial failures, all three endpoint failures/recovery, blocked/full/corrupt storage, chart empty/zero, 50-chapter archive, escaping malicious saved content, and real DOM keyboard interactions. Timers are advanced synthetically, not waited out in real time.
- Live API: exit 0. All three named endpoints returned HTTP 200 with no failed browser resources. Observed 0 RPM / IDLE, block 1,140 at 66.28%, 7,231 work over 24h, and 214,189,010.59 minted SQK. These are dated observations, not values hard-coded in the site.
- Browser script errors: zero across the interaction suite. The live smoke check saw no failed requests. Expected 503s in failure fixtures are intentional.
- Shared image resolves at `/preview/social-card.png` with HTTP 200. Embedded font loading is checked. A no-network first load retains a functional character form and honest waiting/reconnecting content.

### Pinned taste@1

The prescribed command was run from the repository root:

```sh
PLAYWRIGHT_BROWSERS_PATH=test/scratch/browsers \
IMD_PLAYWRIGHT="$PWD/test/scratch/tooling/node_modules/playwright/index.mjs" \
node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste
```

The first run found the native-progress fallback issue; after its correction, this direct-browser run passed 16/16 in a waiting/reconnecting state because Chromium did not inherit the machine network proxy. It does **not** establish full populated-state coverage.

The final, populated-state run used the same pinned probe with the proxy-aware browser adapter, making real API calls without changing or mocking the export:

```sh
PLAYWRIGHT_BROWSERS_PATH=test/scratch/browsers \
IMD_PLAYWRIGHT="$PWD/scripts/probe-browser.mjs" \
node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste-final
```

Final result: **15/16**. Render, layout, targets, contrast, casing, tracking, eyebrow labels, type sizes/faces, glyphs, slogans, repetition, surfaces, motion, and share metadata passed. The measured copy budget was 60 prose words on the first 390px screen and 130 at 1440px (generic desktop bar: 90). The brief’s “chapter text (120 to 200 words)” and “large, readable serif font” take priority: the full story remains visible and is not truncated to satisfy a landing-page heuristic. This is the one retained, explained probe flag. Two small inline/footer link targets are below the comfortable 44px size but pass the probe’s 24px/spacing rule.

The live wheel was idle during the probe. Separate injected SPINNING tests verified `60/42` seconds per turn and zero running infinite animations under reduced motion. The probe excludes SVG artwork; required emoji and scene art were inspected separately.

### Evidence

- `docs/taste-checks.json`: final pinned probe checks (machine-local paths omitted).
- `docs/check-results.json`: final browser group outcomes; WebKit is a limitation, not a pass.
- `docs/contrast.json`: computed solid foreground/background pairs in both themes.
- `docs/screenshots/live-mobile.png`: real API state, dark, 390×844; product and main action visible.
- `docs/screenshots/live-desktop.png`: real API state, dark, 1440px full page.
- `docs/screenshots/mobile-light.png`: controlled SPINNING fixture, light, 390×844.
- `docs/screenshots/character-dialog.png`: focused character-name field in dark theme, controlled fixture.

Screenshots were viewed, not merely generated. Scratch screenshots/reports are excluded from submission; selected evidence above is retained. The pinned reference files themselves are supplied task inputs and are not copied into the application.

## Remaining limitations and completion

**Complete for the requested implementation scope, with the browser coverage limits below.** Build, typecheck, primary interactions, live data, both palettes, mobile layouts, and the six-domain review were performed. Publication and cross-browser certification are not claimed.

- The supplied browser connector failed at initialization with **“Socket path too long.”** Local Playwright Chromium provided the rendered checks instead.
- WebKit was downloaded but could not launch because required host shared libraries were missing, including GTK 4, Graphene, and several multimedia/text libraries. Safari/WebKit behavior remains unverified; this is not a requester configuration question.
- No physical phone, screen-reader session, native browser 200% zoom, RTL translation, actual social-platform unfurl, or exhaustive visual contrast test over pixel artwork. The OG image is relative because the final hosting origin is assigned later; some crawlers require an absolute image URL after hosting.
- Live availability depends on the public APIs, network access, and their CORS policy. Browser timers may be throttled in background tabs; returning to the tab refreshes data. The offline page retains only data already saved in that browser and needs a successful first status reading to generate a chapter.
- Browser storage is local and user-controlled; concurrent tabs are last-write-wins. There is no synchronization, tally across visitors, cloud backup, or reconstruction of unseen intermediate rounds.
- The remaining taste flag is the intentional desktop story-length exception above.

No `.git/`, `.github/`, `.env`, ignore file, submodule, or repository dependency directory was created or modified. The final size/inventory check is recorded in `docs/submission-audit.json` and stays below the 8 MiB addition limit. The static export contains only `index.html` and its social preview image.
