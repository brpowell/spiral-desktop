export type PlaybackState = "playing" | "paused" | "stopped";

export interface Track {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  albumArtist: string | null;
  trackNumber: number | null;
  discNumber: number | null;
  year: number | null;
  genre: string | null;
  durationSeconds: number | null;
  filePath: string;
  artPath: string | null;
  dateAdded: string;
}

export interface TrackInput {
  title: string;
  artist: string | null;
  album: string | null;
  albumArtist: string | null;
  trackNumber: number | null;
  discNumber: number | null;
  year: number | null;
  genre: string | null;
  durationSeconds: number | null;
  filePath: string;
  artPath: string | null;
}
