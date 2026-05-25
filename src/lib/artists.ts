import { pickArtPath } from "./albums";
import type { Album } from "../types/album";
import type { Artist } from "../types/artist";
import type { Track } from "../types/track";

const UNKNOWN_ARTIST = "Unknown Artist";

export function artistKey(track: Track): string {
  return track.albumArtist?.trim() || track.artist?.trim() || UNKNOWN_ARTIST;
}

function displayNameForKey(key: string, tracks: Track[]): string {
  if (key === UNKNOWN_ARTIST) return UNKNOWN_ARTIST;
  for (const track of tracks) {
    const albumArtist = track.albumArtist?.trim();
    if (albumArtist && artistKey(track) === key) return albumArtist;
  }
  for (const track of tracks) {
    const artist = track.artist?.trim();
    if (artist && artistKey(track) === key) return artist;
  }
  return key;
}

export function groupTracksIntoArtists(tracks: Track[]): Artist[] {
  const groups = new Map<string, Track[]>();

  for (const track of tracks) {
    const key = artistKey(track);
    const list = groups.get(key);
    if (list) list.push(track);
    else groups.set(key, [track]);
  }

  const artists: Artist[] = [];

  for (const [key, artistTracks] of groups) {
    const sorted = [...artistTracks].sort((a, b) => {
      const albumCmp = (a.album ?? "").localeCompare(b.album ?? "", undefined, {
        sensitivity: "base",
      });
      if (albumCmp !== 0) return albumCmp;
      const discA = a.discNumber ?? 1;
      const discB = b.discNumber ?? 1;
      if (discA !== discB) return discA - discB;
      const numA = a.trackNumber ?? Number.MAX_SAFE_INTEGER;
      const numB = b.trackNumber ?? Number.MAX_SAFE_INTEGER;
      if (numA !== numB) return numA - numB;
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    });

    artists.push({
      key,
      name: displayNameForKey(key, sorted),
      artPath: pickArtPath(sorted),
      tracks: sorted,
    });
  }

  return artists.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function getArtistByKey(
  artists: Artist[],
  key: string,
): Artist | undefined {
  return artists.find((a) => a.key === key);
}

export function albumsForArtist(albums: Album[], artist: Artist): Album[] {
  return albums.filter((a) => a.artist === artist.name);
}

export function artistTotalDurationSeconds(tracks: Track[]): number {
  return tracks.reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0);
}
