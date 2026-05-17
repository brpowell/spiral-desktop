import { invoke } from "@tauri-apps/api/core";
import { parseBuffer } from "music-metadata";
import type { TrackInput } from "../types/track";

const MIME_BY_EXT: Record<string, string> = {
  mp3: "audio/mpeg",
  flac: "audio/flac",
  aac: "audio/aac",
  wav: "audio/wav",
  m4a: "audio/mp4",
};

function extension(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? path.slice(dot + 1).toLowerCase() : "";
}

function filenameTitle(path: string): string {
  const name = path.split(/[/\\]/).pop() ?? path;
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function firstString(value: string | string[] | undefined): string | null {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function firstNumber(value: number | undefined): number | null {
  return value ?? null;
}

export async function parseTrackMetadata(filePath: string): Promise<TrackInput> {
  const ext = extension(filePath);
  const mimeType = MIME_BY_EXT[ext] ?? "application/octet-stream";
  const data = await invoke<number[]>("read_file_bytes", { path: filePath });
  const buffer = new Uint8Array(data);
  const metadata = await parseBuffer(buffer, { mimeType });

  const trackNo = metadata.common.track?.no;
  const discNo = metadata.common.disk?.no;

  return {
    title: firstString(metadata.common.title) ?? filenameTitle(filePath),
    artist: firstString(metadata.common.artist),
    album: firstString(metadata.common.album),
    albumArtist: firstString(metadata.common.albumartist),
    trackNumber: trackNo != null ? Math.trunc(trackNo) : null,
    discNumber: discNo != null ? Math.trunc(discNo) : null,
    year: metadata.common.year ?? null,
    genre: firstString(metadata.common.genre),
    durationSeconds: firstNumber(metadata.format.duration),
    filePath,
    artPath: null,
  };
}
