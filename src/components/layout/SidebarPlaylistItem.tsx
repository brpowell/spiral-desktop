import { usePlaylistSidebarMenu } from "../../hooks/usePlaylistSidebarMenu";
import { useNavigationStore } from "../../store/useNavigationStore";
import type { Playlist } from "../../types/playlist";

interface SidebarPlaylistItemProps {
  playlist: Playlist;
}

export function SidebarPlaylistItem({ playlist }: SidebarPlaylistItemProps) {
  const playlistId = useNavigationStore((s) => s.playlistId);
  const openPlaylist = useNavigationStore((s) => s.openPlaylist);
  const { onContextMenu, contextMenu, deleteDialog } =
    usePlaylistSidebarMenu(playlist);

  const isActive = playlistId === playlist.id;

  return (
    <li>
      <button
        type="button"
        className={
          isActive
            ? "sidebar__playlist-link sidebar__playlist-link--active"
            : "sidebar__playlist-link"
        }
        aria-current={isActive ? "page" : undefined}
        onClick={() => openPlaylist(playlist.id)}
        onContextMenu={onContextMenu}
      >
        {playlist.title}
      </button>
      {contextMenu}
      {deleteDialog}
    </li>
  );
}
