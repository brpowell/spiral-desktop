import { useCallback } from "react";
import {
  ContextMenu,
  ContextMenuItem,
} from "../components/ContextMenu/ContextMenu";
import { IconEditInfo } from "../components/icons";
import { usePlaylistStore } from "../store/usePlaylistStore";
import type { Playlist } from "../types/playlist";
import { useContextMenu } from "./useContextMenu";

export function usePlaylistSidebarMenu(playlist: Playlist) {
  const openPlaylistEditor = usePlaylistStore((s) => s.openPlaylistEditor);

  const { onContextMenu, closeMenu, open, anchor, position, menuRef } =
    useContextMenu();

  const openEditor = useCallback(() => {
    closeMenu();
    openPlaylistEditor(playlist.id);
  }, [closeMenu, openPlaylistEditor, playlist.id]);

  const contextMenu = (
    <ContextMenu
      open={open}
      anchor={anchor}
      position={position}
      menuRef={menuRef}
    >
      <ContextMenuItem
        icon={<IconEditInfo />}
        label="Edit"
        onClick={openEditor}
      />
    </ContextMenu>
  );

  return { onContextMenu, contextMenu };
}
