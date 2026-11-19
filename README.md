# AdKraft web — Brand onboarding

Pixel-matched implementation of Figma **Adkraft-tool-revamp → onboarding flow → "Onboarding 1"** (node `66:2225`),
built on **Untitled UI React** components + `@untitledui/icons`.

## Run
```bash
npm install
npm run dev               # local dev server — add ?step=<id> to open a step directly
npm run build             # production build (dist/)
npm run build:prototype   # single self-contained HTML (dist-prototype/index.html) for sharing
```

## Structure
```
src/
  components/            Untitled UI React source (pinned commit 1d410cb, Oct 9 2026) — Button, Input, InputGroup, Modal, Tooltip, Avatar
  styles/
    globals.css, theme.css, typography.css   Untitled UI theme (unchanged)
    adkraft.css          AdKraft overrides: Figma gray ramp, black primary button, blue focus, status colors
  assets/                Exported from Figma: glow.svg, logo.png, credits.png, avatar.png
  layout/app-shell.tsx   V5/Rail, Brands sidebar, Brands empty state
  features/brand-onboarding/
    flow.ts                  Step order, draft data, StepDefinition
    onboarding-modal.tsx     Shared modal shell (glow, back, progress, save button)
    onboarding-progress.tsx  3-phase progress bar
    option-card.tsx          Option cards (radio / checkbox groups)
    krafty-pill.tsx          "Kraftly …" research status pill + sparkle
    trends-ready-wave.tsx    Distortion wave carrying the trends screen into the final screen
    steps/                   One file per step: website, category, audience, assets,
                             research, review, competitors, trends, ready
    intake/ research/ review/ market/   Per-step building blocks
  app.tsx                Prototype harness
```

## How it maps to Figma
| Figma | Code |
|---|---|
| Buttons/Button (primary, lg) | `<Button size="lg">` (bg overridden to black via `--color-bg-brand-solid`) |
| Buttons/Button (secondary, sm) | `<Button color="secondary" size="sm">` |
| Input field with "https://" add-on (lg) | `<InputGroup size="lg" leadingAddon={<InputPrefix>https://</InputPrefix>}><InputBase/></InputGroup>` |
| Input dropdown (search, ⌘K) | `<Input icon={SearchLg} shortcut="⌘K" size="md">` |
| Background overlay + Modal | `<ModalOverlay>` (blur 8px) + `<Modal>` + `<Dialog>` |
| All icons | `@untitledui/icons` — same icon set the Figma kit uses |

**Why `adkraft.css` overrides the gray ramp:** this Untitled UI React version maps its semantic tokens to Tailwind's
`neutral` palette (`#171717`…), while the Figma kit uses Untitled UI's gray ramp (`#181d27`…). The override makes every
component use the exact Figma colors.

## Verified against Figma
Element bounds measured in Chrome at 1440×898 vs Figma node bounds: all layout positions match exactly; text widths
differ by ≤2.4px (font rasterizer differences). Pixel diff vs Figma's own render: mean error 4.3/255.

## Copy note
Text matches Figma verbatim, including "…and setup the brand identity." Grammatically it should be "sets up" —
change it in Figma and code together if you agree.

## Supply-chain note
All npm packages are pinned to exact versions. All but one were published at least 2 weeks before this build.

The exception is `distortion-waves@0.1.0` (the wave between the trends and final screens). It was published on the day it was added (2026-11-18), by a single maintainer. It was added at the project owner's request after reading its source (no install scripts, no runtime dependencies, no storage or cookie access; its only network calls fetch the page's own images, fonts and CSS to picture the view). Re-check it, and consider a newer version, once it is two weeks old.
# Brand---Onboarding-flow
