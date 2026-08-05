# Clear Clip Names

An Ableton Live Extension (built with the `@ableton-extensions/sdk` public
beta). Right-click a time selection on one or more tracks in the Arrangement
view and choose **Clear Clip Names** to blank out the name of every clip
inside that selection, on those tracks. It's a quick way to reset a messy
project back to Live's default (auto/file-based) clip labels.

## What it does

- Triggers from: right-click on a MIDI or Audio track **while you have a
  time range selected** in the Arrangement view (this is how the SDK exposes
  "which tracks + which range" together).
- For every clip inside that range, on the selected track(s), sets
  `clip.name = ""`.
- Wraps the whole thing in a single transaction, so it's one undo (Cmd/Ctrl+Z)
  step no matter how many clips it touches.

## Requirements

- Ableton **Live 12 Suite**, beta version **12.4.5** or later (Extensions
  aren't available in Standard, Intro, or Lite).
- You'll need to be in Ableton's Beta Program to get that build.
- **Node.js v24.16.0** (LTS) or compatible.

## Setup

```bash
npm install
npm run build      # compiles src/extension.ts -> dist/extension.js
```

Then in Live: **Settings → Extensions → Install Extension**, and point it at
this folder (or however your build of the SDK packages it — beta tooling has
been adding a `npm run package` step that produces a `.ablx` archive; if your
SDK install has that script, use it instead).

## One thing to double check first

This SDK is a fresh public beta, and the exact method name for "give me the
clips that overlap this time range on a track" has shown small differences
across early builds. In `src/extension.ts` that call is:

```ts
const clips = track.getClipsInRange(start, end);
```

Before your first build, open `node_modules/@ableton-extensions/sdk` and
search the type definitions for `Clip` on `Track` / `MidiTrack` / `AudioTrack`
to confirm that's the real name in your installed version — TypeScript will
also just tell you loudly if it's wrong. Everything else in this file
(`registerContextMenuAction`, `registerCommand`, `getObjectFromHandle`,
`withinTransaction`) is confirmed against the SDK's own examples.

## Next step (not built yet, on purpose)

You mentioned wanting an actual **rename** option later — e.g. renaming
clips to a pattern like `Track Name - 01`, `Track Name - 02`. When you're
ready for that:

- Swap `clip.name = ""` for a naming function, and pass an index as you loop.
- Consider adding a small input dialog (`context.ui.withinModalDialog` or
  similar) so the user can type a prefix/pattern before it runs, rather than
  hardcoding one.

Good next milestone once "clear" is working end-to-end in Live.
