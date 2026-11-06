# Hamster Chronicles design system

## Overview

A reading room for a living hamster-powered village story. The visual idea is a warm parchment page inside a small pixel-art world: dark navy dotted sky, a gold wheel, readable book text, and a character who belongs to the tale.

The implementation lives in `index.html`. The source and `dist/index.html` are identical after `npm run build`. The app is plain HTML, CSS, and checked JavaScript; the class names below are reusable patterns, not a component-library API.

The first action is **Join the village** beside **Read the story**. The latest chapter is the main surface. Character and wheel facts support it, followed by the archive, daily work chart, and three explanatory steps. The desktop composition does not dictate mobile order: the chapter and archive precede the sidebar there.

## Colors

The canonical notation is hexadecimal. Semantic custom properties are declared in `:root` near the top of `index.html`; the `prefers-color-scheme: light` block changes only the page and UI palette. The parchment reading surface stays consistent in both themes.

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--page` | `#111522` | `#eee7d8` | Page background |
| `--surface` | `#1a2030` | `#e5dbc7` | Character/facts panels, dialog |
| `--text` | `#eee9dd` | `#302d28` | Main interface text |
| `--muted` | `#adb3c4` | `#655c50` | Supporting interface text |
| `--line` | `#353d50` | `#bdb19c` | Structure and control boundaries |
| `--accent` | `#edc778` | `#765318` | Primary action, heading, work bars |
| `--accent-ink` | `#34260e` | `#fff4dc` | Text on primary fill |
| `--grid` | `#262c3c` | `#d7cdbb` | Dots on a 20px grid |
| `--success` | `#a9c7ad` | `#3d6246` | Wheel status text |
| `--danger` | `#ffc2b4` | `#8b3023` | Form/storage error text |
| `--focus` | `#efca81` | `#765318` | Interface focus ring |
| `--paper` | `#f3e9d2` | same | Story surface |
| `--paper-ink` | `#342d24` | same | Story and choice text |
| `--paper-muted` | `#6f604d` | same | Chapter metadata and hints |
| `--paper-line` | `#c8b89a` | same | Story dividers and choice borders |
| `--paper-focus` | `#69501d` | same | Focus on parchment |

Chapter badges additionally use `#67522c` (Nap), `#405e45` (Journey), and `#893b2f` (Storm). Their words communicate the category independently of color. Selected choices use `#ded4b5` with a `#6f603d` border and a check mark. Hovered paper buttons use `#e5d7b9`. The original pixel scene has its own fixed illustration colors, not semantic UI states.

Measured from browser-computed solid surfaces: story text 11.25:1, chapter metadata 5.03:1, primary action 9.12:1 dark / 6.36:1 light, and muted panel text 7.75:1 dark / 4.78:1 light. These are specific pairs, not a blanket claim for all artwork or states. See `docs/contrast.json` and `VALIDATION.md`.

## Typography

Three text roles:

- **Pixelify Sans, regular 400**, embedded as a data URI: product/section headings, small counter displays, choice letters. Fallback: Courier New, monospace. This deliberately satisfies the pixel-heading brief without using pixel text for story paragraphs.
- **Georgia, Times New Roman, serif**: chapter title, story paragraphs, character name, and italic tagline. Normal weight 400; no remote serif dependency.
- **System sans** (`ui-sans-serif`, `system-ui`, Apple/BlinkMac/Segoe UI fallbacks): controls, descriptions, labels, metadata, chart labels. Weights 400 and 600.

A small embedded Noto Emoji subset supplies only 🔥 and 💤 in the status SVG, independently of installed emoji fonts. It is an icon font, not a fourth prose face. Both font licenses are in `licenses/` and embedded in an HTML comment so the single-file export carries its notices.

| Token | Size at default root | Use |
| --- | --- | --- |
| `--small` | 14px | Labels, controls, metadata, supporting copy |
| `--base` | 16px | Interface body, form fields, small headings |
| `--story` | 18px | Story text, tagline, character name |
| `--section` | 24px | Pixel section headings, mobile chapter title |
| `--chapter` | 32px | Mobile product title, desktop chapter title |
| `--display` | 48px | Desktop product title, story drop cap |

Sizes use rem. Root size is 16px. Interface line-height is 1.6, headings 1.15, chapter titles 1.3, story paragraphs 1.8, and buttons 1.5. Story measure is capped at 66ch. Headings balance; interface paragraphs use pretty wrapping; story paragraphs use normal wrapping. Names and large counters can wrap rather than truncate. Changing numeric values use tabular digits. No tracked uppercase kickers or synthetic pixel-font weights.

The chart’s bars scale in SVG, while its labels are HTML at 14px. This keeps axis/date labels readable on narrow screens rather than shrinking with the SVG viewBox.

## Layout

`.wrap` has a maximum width of 1184px, with 20px mobile and 32px wider-screen inline padding. Common spacings are 8, 12, 16, 20, 24, 28, 32, and 36px. Related content is closer than distinct sections.

- **Below 600px:** one column; a compact 112px-tall pixel scene; only the archive navigation utility remains visible. At 390px both hero actions fit side by side. At narrower widths they wrap without clipping. The secondary connection-row slogan is omitted because the same behavior is explained below.
- **600px and above:** hero text/art become two columns; product type rises to 48px; chapter titles rise to 32px; three steps share a row; full navigation appears.
- **940px and above:** main content and a 300px sidebar form two columns with a 28px gap. The sidebar sticks 24px from the viewport top. Chapter padding becomes 32px × 36px.

The archive has a 540px maximum height with its own vertical scrolling. Charts have a 560px minimum frame inside a horizontally scrollable region. The exact data table has its own scroll container and a 320px height cap. Both regions are keyboard focusable and named. The page itself never uses horizontal clipping to hide defects.

The dialog is at most 440px wide, at least 16px from the viewport edges, and limited to `100dvh - 40px` in height so its content can scroll.

Rendered reflow checks passed at 320, 390, 600, 768, 940, and 1440px in Chromium. A 200% root-font enlargement passed at 390px. Native browser zoom and physical-device behavior were not tested.

## Elevation & depth

Surfaces are flat. The parchment and sidebar use background contrast, not shadows. A small gold mark at the top of the chapter suggests a page marker. Borders define buttons, selected choices, dividers, and the status pill. There are no card shadows, gradient text, or card stacks.

The page dots are a fixed, noninteractive background layer. The dialog uses the native top layer with a `#090d18bb` backdrop; it does not rely on a hand-built z-index stack. The visible skip link sits above page content when focused.

## Shapes

Most controls use a 5px radius; fields and badges use 4px, reading/support panels 6px, and the dialog 8px. The live status uses a 999px pill radius. Pixel artwork stays angular with `shape-rendering="crispEdges"`. SVG decorations do not intercept interactions.

## Components

| Pattern | Source selectors/functions | Behavior |
| --- | --- | --- |
| Primary/secondary actions | `.primary`, `.button`, `.hero-actions` | Minimum 44px height; hover only for hover-capable devices; browser links stay native |
| Wheel scene/status | `.landscape`, `#wheel-rotor`, `.live-pill`, `renderWheel` | True `60 / RPM` period; stops for idle, zero RPM, manual pause, or reduced motion; text and emoji duplicate the state |
| Latest chapter | `.paper`, `.chapter-card`, `.story-text`, `renderLatest` | Immutable snapshot text; Nap/Journey/Storm badge; round/work/block facts; brief opacity entrance only on a subsequent chapter |
| Choices | `.choice`, `renderChoices`, `castVote` | Three paths; pressed and locked state after voting; visible receipt; result receives focus after a keyboard vote |
| Character | `.side-section`, `renderCharacter`, `#join-dialog` | Sanitized name, native role select, lifetime counts; edit keeps points and prior vote identity |
| Form | `.form-field`, `#join-form` | Bound labels, 16px inputs, inline announced error, visible focus, native modal containment, Escape/close and focus return |
| Archive | `.archive-list`, `.archive-entry`, `renderArchive` | Native details/summary; full previous story and saved choice; newest first |
| Work chart | `.chart-scroll`, `.chart-frame`, `.chart-labels`, `renderActivity` | Real bucket bars, independent readable labels, accessible title/description and exact table; distinct empty/zero states |
| Recovery | `#connection`, `.storage-note`, `renderConnection` | Small reconnecting badge, retained last-good values, in-memory continuation when saving fails |

Custom focus rings are 3px with 4px offset; paper controls use the darker paper focus token. Forced-colors mode uses `Highlight`. Controls are native buttons, links, selects, details, and dialog; no custom keyboard widget is introduced. Routine updates use a stable polite status region. Polling does not move focus from unrelated content; if a focused old chapter is replaced, focus moves to its enclosing article without scrolling.

The only animations are the linear wheel rotation and a 350ms ease-out chapter opacity entrance. Both are removed by `prefers-reduced-motion: reduce`. The visible Pause/Resume control affects animation only.

## Do’s and don’ts

- Start related sections inside `.wrap`; reuse the reading/sidebar surface roles and existing scale.
- Keep long-form text serif and metadata in the system face. Use pixel type for short headings and counters.
- Keep the Join action prominent and the latest chapter on the first phone screen.
- Preserve full names, readings, and choices. Use a local scroll container for wide data.
- Use explicit text for live, saved, delayed, and failed states. Never substitute sample readings into the production UI.
- Keep story variants deterministic and previous local choice context explicit. Do not imply shared votes or a globally identical personalized history.
- Do not add a runtime library, remote artwork, wallet, account, or color-only state to extend this one-page design.

If another explanatory section is needed, reuse `.section-heading`, the 24px pixel heading, 14px supporting text, existing spacing, and the semantic colors. Keep its controls native and check both themes and the 390px first screen again.

## Guidance attribution

The implementation applied the supplied Better Interface workflow and the accessibility, layout, writing, typography, colors, and UI domain guidance. Better Interface: Jakub Krehel, MIT, pinned commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`. Documentation method: Paul Bakaus’s Impeccable, Apache-2.0, pinned commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`. Notices are retained in `licenses/design-guidance.txt`. Coverage and limitations are reported separately rather than implied by this design description.
