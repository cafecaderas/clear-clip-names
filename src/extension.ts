import {
  initialize,
  DataModelObject,
  MidiTrack,
  AudioTrack,
  TakeLane,
  type ActivationContext,
  type ArrangementSelection,
  type ExtensionContext,
} from "@ableton-extensions/sdk";

// Import the HTML interface for the "Rename Clips..." modal dialog. esbuild
// inlines this as a string (see build.ts's ".html" loader).
import renameClipsInterface from "./interface.html";

const CLEAR_NAMES_COMMAND_ID = "clearClipNames.run";
const RENAME_CLIPS_COMMAND_ID = "clearClipNames.renameClips";

// Resolves an ArrangementSelection down to the MIDI/audio tracks it covers,
// the same way for both commands registered below.
function resolveSelectedTracks(
  api: ExtensionContext<"1.0.0">,
  selection: ArrangementSelection,
) {
  const selectedObjects = selection.selected_lanes.map((handle) =>
    api.getObjectFromHandle(handle, DataModelObject),
  );

  return selectedObjects.filter(
    (obj): obj is MidiTrack<"1.0.0"> | AudioTrack<"1.0.0"> =>
      obj instanceof MidiTrack ||
      obj instanceof AudioTrack ||
      (obj instanceof TakeLane &&
        (obj.parent instanceof MidiTrack || obj.parent instanceof AudioTrack)),
  );
}

export function activate(activation: ActivationContext) {
  const api = initialize(activation, "1.0.0");

  // Appears when you right-click a time selection on a MIDI or audio track
  // in the Arrangement view.
  api.ui.registerContextMenuAction(
    "MidiTrack.ArrangementSelection",
    "Clear Clip Names",
    CLEAR_NAMES_COMMAND_ID,
  );
  api.ui.registerContextMenuAction(
    "AudioTrack.ArrangementSelection",
    "Clear Clip Names",
    CLEAR_NAMES_COMMAND_ID,
  );
  api.ui.registerContextMenuAction(
    "MidiTrack.ArrangementSelection",
    "Rename Clips...",
    RENAME_CLIPS_COMMAND_ID,
  );
  api.ui.registerContextMenuAction(
    "AudioTrack.ArrangementSelection",
    "Rename Clips...",
    RENAME_CLIPS_COMMAND_ID,
  );

  api.commands.registerCommand(CLEAR_NAMES_COMMAND_ID, async (arg: unknown) => {
    const selection = arg as ArrangementSelection;
    const tracks = resolveSelectedTracks(api, selection);

    if (tracks.length === 0) {
      console.log("Clear Clip Names: no track selected, nothing to do.");
      return;
    }

    const start = selection.time_selection_start;
    const end = selection.time_selection_end;
    let clearedCount = 0;

    // One undo step for the whole operation.
    api.withinTransaction(() => {
      for (const track of tracks) {
        // Track has no built-in "clips in range" accessor — arrangementClips
        // returns every clip on the track, so we filter to the ones that
        // overlap the user's time selection ourselves. (Confirmed against
        // the SDK 1.0.0-beta.0 docs: Clip exposes startTime/endTime/duration.)
        const clips = track.arrangementClips.filter(
          (clip) => clip.startTime < end && clip.endTime > start,
        );

        for (const clip of clips) {
          if (clip.name !== "") {
            clip.name = "";
            clearedCount++;
          }
        }
      }
    });

    console.log(`Clear Clip Names: cleared ${clearedCount} clip name(s).`);
  });

  api.commands.registerCommand(RENAME_CLIPS_COMMAND_ID, async (arg: unknown) => {
    const selection = arg as ArrangementSelection;
    const tracks = resolveSelectedTracks(api, selection);

    if (tracks.length === 0) {
      console.log("Rename Clips: no track selected, nothing to do.");
      return;
    }

    // Pass the HTML content as a data URL to avoid needing to host it
    // anywhere. The resolved value is the JSON string the dialog passes to
    // closeWithResult(); we expect a "prefix" property that's null on
    // cancel.
    const result = await api.ui.showModalDialog(
      `data:text/html,${encodeURIComponent(renameClipsInterface)}`,
      360,
      240,
    );
    const prefix = (JSON.parse(result) as { prefix: string | null }).prefix;

    if (prefix === null) {
      console.log("Rename Clips: cancelled.");
      return;
    }

    const start = selection.time_selection_start;
    const end = selection.time_selection_end;
    let renamedCount = 0;

    // One undo step for the whole operation.
    api.withinTransaction(() => {
      for (const track of tracks) {
        const clips = track.arrangementClips
          .filter((clip) => clip.startTime < end && clip.endTime > start)
          .sort((a, b) => a.startTime - b.startTime);

        const padWidth = Math.max(2, String(clips.length).length);

        clips.forEach((clip, index) => {
          const n = String(index + 1).padStart(padWidth, "0");
          clip.name = `${prefix} ${n}`;
          renamedCount++;
        });
      }
    });

    console.log(`Rename Clips: renamed ${renamedCount} clip(s).`);
  });
}
