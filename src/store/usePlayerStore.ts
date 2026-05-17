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
  volume: number;
  muted: boolean;
  importError: string | null;

  loadLibrary: () => Promise<void>;
  importTracks: () => Promise<void>;
  importFolder: () => Promise<void>;
  playTrack: (id: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  seek: (ratio: number) => void;
  previousTrack: () => void;
  nextTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setQueue: (ids: number[]) => void;
  clearImportError: () => void;
}

function ensureQueue(set: (partial: Partial<PlayerState>) => void, get: () => PlayerState): number[] {
  const { queue, library } = get();
  if (queue.length > 0) return queue;
  const ids = library.map((t) => t.id);
  if (ids.length > 0) {
    set({ queue: ids });
  }
  return ids;
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
    volume: 1,
    muted: false,
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

      ensureQueue(set, get);
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

    previousTrack: () => {
      const { currentTrackId } = get();
      const queue = ensureQueue(set, get);
      if (!currentTrackId || queue.length === 0) return;
      const idx = queue.indexOf(currentTrackId);
      const prevIdx = idx <= 0 ? queue.length - 1 : idx - 1;
      void get().playTrack(queue[prevIdx]!);
    },

    nextTrack: () => {
      const { currentTrackId } = get();
      const queue = ensureQueue(set, get);
      if (!currentTrackId || queue.length === 0) return;
      const idx = queue.indexOf(currentTrackId);
      const nextIdx = idx < 0 ? 0 : (idx + 1) % queue.length;
      void get().playTrack(queue[nextIdx]!);
    },

    setVolume: (volume) => {
      const clamped = Math.max(0, Math.min(1, volume));
      const muted = get().muted;
      if (!muted) {
        audio.setVolume(clamped);
      }
      if (clamped > 0 && muted) {
        audio.setMuted(false);
        audio.setVolume(clamped);
        set({ volume: clamped, muted: false });
        return;
      }
      set({ volume: clamped });
    },

    toggleMute: () => {
      const muted = !get().muted;
      audio.setMuted(muted);
      if (!muted) {
        audio.setVolume(get().volume);
      }
      set({ muted });
    },

    setQueue: (ids) => set({ queue: ids }),
    clearImportError: () => set({ importError: null }),
  };
});
