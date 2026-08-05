import {
  initialize,
  DataModelObject,
  MidiTrack,
  AudioTrack,
  TakeLane,
  type ActivationContext,
  type ArrangementSelection,
} from "@ableton-extensions/sdk";

const COMMAND_ID = "clearClipNames.run";

export function activate(activation: ActivationContext) {
  const api = initialize(activation, "1.0.0");

  // Appears when you right-click a time selection on a MIDI or audio track
  // in the Arrangement view.
  api.ui.registerContextMenuAction(
    "MidiTrack.ArrangementSelection",
    "Clear Clip Names",
    COMMAND_ID,
  );
  api.ui.registerContextMenuAction(
    "AudioTrack.ArrangementSelection",
    "Clear Clip Names",
    COMMAND_ID,
  );

  api.commands.registerCommand(COMMAND_ID, async (arg: unknown) => {
    const selection = arg as ArrangementSelection;

    // selected_lanes gives handles to every track/take-lane that was
    // selected when the user made the time selection. Resolve them to
    // real objects.
    const selectedObjects = selection.selected_lanes.map((handle) =>
      api.getObjectFromHandle(handle, DataModelObject),
    );

    // Keep only tracks (or take lanes that belong to a track) - either
    // MIDI or audio, since clip names live on both.
    const tracks = selectedObjects.filter(
      (obj): obj is MidiTrack<"1.0.0"> | AudioTrack<"1.0.0"> =>
        obj instanceof MidiTrack ||
        obj instanceof AudioTrack ||
        (obj instanceof TakeLane &&
          (obj.parent instanceof MidiTrack || obj.parent instanceof AudioTrack)),
    );

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
}
