# Clear Clip Names

An Ableton Live Extension (built with the `@ableton-extensions/sdk` public
beta) for cleaning up messy Arrangement views. Right-click a time
selection on one or more tracks to either wipe clip names back to
Live's defaults, or rename every clip in the selection to a name you
type — no more manually clicking through dozens of clips one at a time.

Current version: **0.3.0**. See [CHANGELOG.md](./CHANGELOG.md) for what
changed in each version.

## Commands

### Clear Clip Names

Right-click a time selection on a MIDI or Audio track in Arrangement
view → **Clear Clip Names**. Blanks out the name of every clip inside
that range, on the selected track(s) — resets them to Live's default
(auto/file-based) labels. One undo step for the whole batch.

### Rename Clips

Right-click a time selection → **Rename Clips...**. A dialog asks for a
name; every clip in the selection (across however many tracks you had
selected) gets renamed to exactly that text — e.g. type
`Intro 128bpm Emin` and every matching clip reads exactly that. One undo
step for the whole batch. Cancel (Escape or the Cancel button) does
nothing.

## Requirements

- Ableton **Live 12 Suite**, beta version **12.4.5** or later (Extensions
  aren't available in Standard, Intro, or Lite).
- You'll need to be in Ableton's Beta Program to get that build.
- **Node.js v24.16.0** (LTS) or compatible.

## Setup

See [GETTING_STARTED.md](./GETTING_STARTED.md) for the full first-run
walkthrough (vendoring the SDK tarballs, installing dependencies,
building, and installing into Live).

Quick version, once `vendor/` has the SDK tarballs in place:

```bash
npm install
npm run build      # type-check + bundle to dist/extension.js
npm run package     # produces a .ablx you can drag onto Live's
                     # Settings → Extensions page
```

## Project structure

- `src/extension.ts` — both commands: context menu registration, track/
  clip resolution, the transactions that do the actual renaming.
- `src/interface.html` — the modal dialog UI for Rename Clips.
- `build.ts` — esbuild bundling script (includes an HTML-as-text loader
  for the dialog).
- `manifest.json` — extension metadata Live reads (name, version, entry
  point).
- `vendor/` — local SDK/CLI tarballs (not committed — see
  `.gitignore`; anyone cloning this repo needs to get their own copies
  from Ableton's beta program).

## License

Not yet specified — add one before treating this as reusable by others.
