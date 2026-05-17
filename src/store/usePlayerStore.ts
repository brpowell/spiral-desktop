import { create } from "zustand";
import * as audio from "../lib/audio";
import { importPaths } from "../lib/import";
import { getLibrary, pickAudioFiles, pickFolder } from "../lib/tauri";
import type { PlaybackState, Track } from "../types/track";

interface PlayerState {
  library: Track[];
  queue: number[];
  currentTrackId: number | null;
  playbackState: PlaybackState;
  positionSeconds: number;
  importError: string | null;

  loadLibrary: () => Promise<void>;
  importTracks: () => Promise<void>;
  importFolder: () => Promise<void>;
  playTrack: (id: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  seek: (ratio: number) => void;
  setQueue: (ids: number[]) => void;
  clearImportError: () => void;
}

let positionInterval: ReturnType<typeof setInterval> | null = null;

function stopPositionPoll(): void {
  if (positionInterval !== null) {
    clearInterval(positionInterval);
    positionInterval = null;
  }
}

function startPositionPoll(
  set: (partial: Partial<PlayerState>) => void,
): void {
  stopPositionPoll();
  positionInterval = setInterval(() => {
    set({ positionSeconds: audio.getPositionSeconds() });
  }, 500);
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  audio.onEnd(() => {
    stopPositionPoll();
    set({ playbackState: "stopped", positionSeconds: 0 });
  });

  return {
    library: [],
    queue: [],
    currentTrackId: null,
    playbackState: "stopped",
    positionSeconds: 0,
    importError: null,

    loadLibrary: async () => {
      try {
        const library = await getLibrary();
        set({ library });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("loadLibrary failed:", err);
        set({ importError: `Failed to load library: ${message}` });
      }
    },

    importTracks: async () => {
      set({ importError: null });
      try {
        const paths = await pickAudioFiles();
        if (paths.length === 0) return;
        const result = await importPaths(paths);
        await get().loadLibrary();
        if (result.failed > 0) {
          set({
            importError: `Imported ${result.imported}, failed ${result.failed}. ${result.errors[0] ?? ""}`,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        set({ importError: `Import failed: ${message}` });
      }
    },

    importFolder: async () => {
      set({ importError: null });
      try {
        const paths = await pickFolder();
        if (paths.length === 0) return;
        const result = await importPaths(paths);
        await get().loadLibrary();
        if (result.failed > 0) {
          set({
            importError: `Imported ${result.imported}, failed ${result.failed}. ${result.errors[0] ?? ""}`,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        set({ importError: `Import failed: ${message}` });
      }
    },

    playTrack: async (id) => {
      const track = get().library.find((t) => t.id === id);
      if (!track) return;

      set({ importError: null });
      try {
        await audio.load(track.filePath);
        audio.play();
        set({
          currentTrackId: id,
          playbackState: "playing",
          positionSeconds: 0,
        });
        startPositionPoll(set);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Playback failed:", err);
        set({
          playbackState: "stopped",
          importError: `Playback failed: ${message}`,
        });
      }
    },

    pause: () => {
      audio.pause();
      stopPositionPoll();
      set({ playbackState: "paused" });
    },

    resume: () => {
      audio.play();
      set({ playbackState: "playing" });
      startPositionPoll(set);
    },

    seek: (ratio) => {
      audio.seek(ratio);
      set({ positionSeconds: audio.getPositionSeconds() });
    },

    setQueue: (ids) => set({ queue: ids }),
    clearImportError: () => set({ importError: null }),
  };
});
