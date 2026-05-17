import { invoke } from "@tauri-apps/api/core";
import type { TrackMetadataUpdate } from "../types/metadata";
import type { Track, TrackInput } from "../types/track";

/** Normalize track JSON in case serde casing differs at the IPC boundary. */
function normalizeTrack(raw: Record<string, unknown>): Track {
  return {
    id: raw.id as number,
    title: raw.title as string,
    artist: (raw.artist as string | null) ?? null,
    album: (raw.album as string | null) ?? null,
    albumArtist:
      (raw.albumArtist as string | null) ??
      (raw.album_artist as string | null) ??
      null,
    trackNumber:
      (raw.trackNumber as number | null) ??
      (raw.track_number as number | null) ??
      null,
    discNumber:
      (raw.discNumber as number | null) ??
      (raw.disc_number as number | null) ??
      null,
    year: (raw.year as number | null) ?? null,
    genre: (raw.genre as string | null) ?? null,
    durationSeconds:
      (raw.durationSeconds as number | null) ??
      (raw.duration_seconds as number | null) ??
      null,
    filePath: (raw.filePath ?? raw.file_path) as string,
    artPath:
      (raw.artPath as string | null) ?? (raw.art_path as string | null) ?? null,
    dateAdded: (raw.dateAdded ?? raw.date_added) as string,
  };
}

export async function pickAudioFiles(): Promise<string[]> {
  return invoke<string[]>("pick_audio_files");
}

export async function pickFolder(): Promise<string[]> {
  return invoke<string[]>("pick_folder");
}

export async function scanFolder(folderPath: string): Promise<string[]> {
  return invoke<string[]>("scan_folder", { folderPath });
}

export async function saveTrack(track: TrackInput): Promise<number> {
  return invoke<number>("save_track", { track });
}

export async function getLibrary(): Promise<Track[]> {
  const rows = await invoke<Record<string, unknown>[]>("get_library");
  return rows.map(normalizeTrack);
}

export async function pickImageFile(): Promise<string | null> {
  return invoke<string | null>("pick_image_file");
}

export async function cacheArtFromFile(
  sourcePath: string,
  filePath: string,
): Promise<string> {
  return invoke<string>("cache_art_from_file", { sourcePath, filePath });
}

export async function cacheArtFromUrl(
  url: string,
  filePath: string,
): Promise<string> {
  return invoke<string>("cache_art_from_url", { url, filePath });
}

export async function fetchCoverArt(
  artist: string,
  album: string,
): Promise<string[]> {
  return invoke<string[]>("fetch_cover_art", { artist, album });
}

export async function writeTrackMetadata(
  trackId: number,
  filePath: string,
  metadata: TrackMetadataUpdate,
): Promise<Track> {
  const raw = await invoke<Record<string, unknown>>("write_track_metadata", {
    trackId,
    filePath,
    metadata,
  });
  return normalizeTrack(raw);
}
