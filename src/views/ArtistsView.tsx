import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { AlbumArt } from "../components/AlbumArt/AlbumArt";
import { SearchField } from "../components/SearchField/SearchField";
import { albumsForArtist } from "../lib/artists";
import { useNavigationStore } from "../store/useNavigationStore";
import type { Album } from "../types/album";
import type { Artist } from "../types/artist";
import "./ArtistsView.css";

interface ArtistsViewProps {
  artists: Artist[];
  albums: Album[];
}

function matchesArtistSearch(artist: Artist, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return artist.name.toLowerCase().includes(q);
}

function ArtistCard({
  artist,
  albumCount,
}: {
  artist: Artist;
  albumCount: number;
}) {
  const openArtist = useNavigationStore((s) => s.openArtist);
  const albumLabel = albumCount === 1 ? "1 album" : `${albumCount} albums`;

  return (
    <motion.button
      type="button"
      className="artist-card"
      role="listitem"
      onClick={() => openArtist(artist.key)}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="artist-card__art-wrap">
        <AlbumArt
          artPath={artist.artPath}
          alt={artist.name}
          className="album-art--round"
        />
      </div>
      <span className="artist-card__name">{artist.name}</span>
      <span className="artist-card__meta">{albumLabel}</span>
    </motion.button>
  );
}

export function ArtistsView({ artists, albums }: ArtistsViewProps) {
  const [search, setSearch] = useState("");

  const filteredArtists = useMemo(
    () => artists.filter((a) => matchesArtistSearch(a, search)),
    [artists, search],
  );

  if (artists.length === 0) {
    return (
      <div className="artists-view artists-view--empty">
        <p>No artists yet. Import some music to get started.</p>
      </div>
    );
  }

  return (
    <div className="artists-view">
      <header className="artists-view__header">
        <div className="artists-view__heading">
          <h1 className="artists-view__title">Artists</h1>
          <span className="artists-view__count">({artists.length})</span>
        </div>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search artists…"
          aria-label="Search artists"
        />
      </header>

      {filteredArtists.length === 0 ? (
        <p className="artists-view__empty">No artists match your search.</p>
      ) : (
        <div className="artists-grid" role="list">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.key}
              artist={artist}
              albumCount={albumsForArtist(albums, artist).length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
