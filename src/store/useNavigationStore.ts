import { create } from "zustand";

export type NavView = "albums" | "library" | "artists" | "playlists";

interface NavigationState {
  view: NavView;
  albumKey: string | null;
  artistKey: string | null;
  playlistId: number | null;
  setView: (view: NavView) => void;
  openAlbum: (key: string) => void;
  closeAlbum: () => void;
  openArtist: (key: string) => void;
  closeArtist: () => void;
  openPlaylist: (id: number) => void;
  closePlaylist: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  view: "library",
  albumKey: null,
  artistKey: null,
  playlistId: null,

  setView: (view) =>
    set({ view, albumKey: null, artistKey: null, playlistId: null }),

  openAlbum: (albumKey) => set({ albumKey, playlistId: null }),

  closeAlbum: () => set({ albumKey: null }),

  openArtist: (artistKey) =>
    set({
      view: "artists",
      artistKey,
      albumKey: null,
      playlistId: null,
    }),

  closeArtist: () => set({ artistKey: null }),

  openPlaylist: (playlistId) =>
    set({ playlistId, albumKey: null, artistKey: null }),

  closePlaylist: () => set({ playlistId: null }),
}));
