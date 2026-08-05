# Getting Started (first run, step by step)

You have: this unzipped folder, Live 12.4.5 beta, and the Extensions SDK
kit downloaded. Here's the path from here to a working right-click menu
item, confirmed against the SDK's own `strip-silence` example.

## 1. Open the folder in an editor

Open this whole `clear-clip-names/` folder in VS Code (or any editor —
you mainly need its integrated terminal). Don't open just the `.ts` file by
itself; you need the terminal to be rooted in this folder so `npm` can see
`package.json`.

## 2. Vendor the SDK tarballs (already done)

You've already copied `ableton-extensions-sdk-1.0.0-beta.0.tgz` and
`ableton-extensions-cli-1.0.0-beta.0.tgz` into `vendor/`. `package.json`
points at those exact filenames — nothing to redo here.

## 3. Install dependencies

```bash
npm install
```

This pulls in the two local tarballs plus `typescript`, `tsx`, `esbuild`,
and `@types/node` into `node_modules/`. Re-run this any time
`package.json`'s dependencies change (like just now).

## 4. Compile

```bash
npm run build
```

This runs two steps:
1. `tsc --noEmit` — type-checks `src/extension.ts` against the real SDK
   types. Catches mistakes but doesn't produce any output file.
2. `tsx build.ts` — actually bundles `src/extension.ts` into
   `dist/extension.js` using esbuild, which is what `manifest.json`'s
   `"entry"` field points Live at.

Re-run `npm run build` any time you edit `src/extension.ts`.

## 5. Package it as a .ablx

Live's Extensions settings page installs by having a file **dragged onto
it** — not by browsing into a project folder. So we need to produce that
file first:

```bash
npm run package
```

Per the SDK docs, this runs a production build then bundles everything
into a `.ablx` file (probably landing in `dist/`). Check what filename it
actually produced — the terminal output or `ls dist/` will show it.

## 6. Install it into Live

Open Ableton Live 12.4.5 beta → **Settings → Extensions**, and **drag the
`.ablx` file** from step 5 onto that page. Restart Live if it asks you to.

## 7. Test it

1. Put a few named clips on a MIDI or audio track in the Arrangement view.
2. Drag a time selection over them.
3. Right-click the track → **Clear Clip Names**.
4. Clip names should go blank. Cmd/Ctrl+Z should undo the whole batch in
   one step.

## If it doesn't show up in the right-click menu

- Double check you're right-clicking *with an active time selection* — the
  menu item is registered on `MidiTrack.ArrangementSelection` /
  `AudioTrack.ArrangementSelection`, which only appears when a range is
  selected, not on a bare track click.
- Check Live's log/console for load errors in the extension (Developer
  Mode for Extensions, per the SDK docs, is where this typically shows up).
- Confirm `dist/extension.js` actually exists (i.e. step 4 ran cleanly,
  ending with esbuild's "done" output rather than an error).
