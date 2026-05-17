/** Editable track metadata — shared by the Track Editor UI and Tauri write command. */
export interface TrackMetadataUpdate {
  title: string;
  artist: string | null;
  album: string | null;
  albumArtist: string | null;
  trackNumber: number | null;
  discNumber: number | null;
  year: number | null;
  genre: string | null;
  /** Cached art file path to persist (null = no change to art). */
  artPath: string | null;
}
