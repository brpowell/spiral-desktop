import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ContextMenu,
  ContextMenuHeading,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSubmenu,
} from "../components/ContextMenu/ContextMenu";
import { RemoveTrackDialog } from "../components/RemoveTrackDialog/RemoveTrackDialog";
import {
  IconAddToQueue,
  IconDelete,
  IconEditInfo,
  IconPlaylistAdd,
  IconPlaylists,
  IconRemoveFromQueue,
} from "../components/icons";
import { recentPlaylists, sortedPlaylists } from "../lib/playlists";
import { tracksForContextAction } from "../lib/trackSelection";
import { usePlayerStore } from "../store/usePlayerStore";
import { usePlaylistStore } from "../store/usePlaylistStore";
import type { Track } from "../types/track";
import { useContextMenu } from "./useContextMenu";

export function useTrackEditMenu(track: Track) {
  const library = usePlayerStore((s) => s.library);
  const selectedTrackIds = usePlayerStore((s) => s.selectedTrackIds);
  const manualQueueIds = usePlayerStore((s) => s.manualQueueIds);
  const openTrackEditor = usePlayerStore((s) => s.openTrackEditor);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const removeTracksFromLibrary = usePlayerStore((s) => s.removeTracksFromLibrary);
  const selectTracksInList = usePlayerStore((s) => s.selectTracksInList);

  const playlists = usePlaylistStore((s) => s.playlists);
  const addTracksToPlaylist = usePlaylistStore((s) => s.addTracksToPlaylist);
  const openPlaylistEditor = usePlaylistStore((s) => s.openPlaylistEditor);

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const submenuPanelRef = useRef<HTMLDivElement>(null);

  const recent = useMemo(() => recentPlaylists(playlists), [playlists]);
  const allSorted = useMemo(() => sortedPlaylists(playlists), [playlists]);

  const libraryIdSet = useMemo(
    () => new Set(library.map((t) => t.id)),
    [library],
  );

  const contextTrackIds = useMemo(
    () => tracksForContextAction(track.id, selectedTrackIds, libraryIdSet),
    [track.id, selectedTrackIds, libraryIdSet],
  );

  const contextTracks = useMemo(
    () =>
      contextTrackIds
        .map((id) => library.find((t) => t.id === id))
        .filter((t): t is Track => t != null),
    [contextTrackIds, library],
  );

  const anyInQueue = contextTrackIds.some((id) => manualQueueIds.includes(id));
  const bulkRemove = contextTracks.length > 1;

  const onBeforeOpen = useCallback(() => {
    if (!selectedTrackIds.includes(track.id)) {
      selectTracksInList(track.id, [track.id], {
        shiftKey: false,
        metaKey: false,
      });
    }
  }, [selectTracksInList, selectedTrackIds, track.id]);

  const { onContextMenu, closeMenu, open, anchor, position, menuRef } =
    useContextMenu({
      layoutDeps: [
        anyInQueue,
        bulkRemove,
        contextTracks.length,
        playlists.length,
        recent.length,
        allSorted.length,
      ],
      onBeforeOpen,
      dismissExcludeRefs: [submenuPanelRef],
    });

  const openEditor = useCallback(() => {
    closeMenu();
    openTrackEditor(contextTrackIds);
  }, [closeMenu, openTrackEditor, contextTrackIds]);

  const handleAddToPlaylist = useCallback(
    (playlistId: number) => {
      closeMenu();
      void addTracksToPlaylist(playlistId, contextTrackIds);
    },
    [closeMenu, addTracksToPlaylist, contextTrackIds],
  );

  const handleNewPlaylist = useCallback(() => {
    closeMenu();
    openPlaylistEditor("new", contextTrackIds);
  }, [closeMenu, openPlaylistEditor, contextTrackIds]);

  const contextMenu = (
    <ContextMenu
      open={open}
      anchor={anchor}
      position={position}
      menuRef={menuRef}
    >
      <ContextMenuItem
        icon={<IconEditInfo />}
        label={
          bulkRemove ? `Edit Info (${contextTracks.length})` : "Edit Info"
        }
        onClick={openEditor}
      />
      <ContextMenuItem
        icon={<IconAddToQueue />}
        label={
          bulkRemove
            ? `Add ${contextTracks.length} to Queue`
            : "Add to Queue"
        }
        onClick={() => {
          closeMenu();
          addToQueue(contextTrackIds);
        }}
      />
      {anyInQueue ? (
        <ContextMenuItem
          icon={<IconRemoveFromQueue />}
          label={
            bulkRemove
              ? `Remove ${contextTracks.length} from Queue`
              : "Remove from Queue"
          }
          onClick={() => {
            closeMenu();
            for (const id of contextTrackIds) {
              if (manualQueueIds.includes(id)) removeFromQueue(id);
            }
          }}
        />
      ) : null}
      <ContextMenuSubmenu
        label="Add to Playlist"
        icon={<IconPlaylists />}
        panelRef={submenuPanelRef}
      >
        <ContextMenuItem
          icon={<IconPlaylistAdd />}
          label="New Playlist…"
          onClick={handleNewPlaylist}
        />
        {recent.length > 0 ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuHeading>Recent playlists</ContextMenuHeading>
            {recent.map((p) => (
              <ContextMenuItem
                key={p.id}
                icon={null}
                label={p.title}
                onClick={() => handleAddToPlaylist(p.id)}
              />
            ))}
          </>
        ) : null}
        {allSorted.length > 0 ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuHeading>All playlists</ContextMenuHeading>
            {allSorted.map((p) => (
              <ContextMenuItem
                key={p.id}
                icon={null}
                label={p.title}
                onClick={() => handleAddToPlaylist(p.id)}
              />
            ))}
          </>
        ) : null}
      </ContextMenuSubmenu>
      <ContextMenuSeparator />
      <ContextMenuItem
        icon={<IconDelete />}
        label={
          bulkRemove
            ? `Remove ${contextTracks.length} from Library`
            : "Remove from Library"
        }
        className="context-menu__danger"
        onClick={() => {
          closeMenu();
          setRemoveDialogOpen(true);
        }}
      />
    </ContextMenu>
  );

  const removeDialog = createPortal(
    <RemoveTrackDialog
      open={removeDialogOpen}
      tracks={contextTracks}
      onClose={() => setRemoveDialogOpen(false)}
      onRemove={(deleteFromDisk) =>
        removeTracksFromLibrary(
          contextTracks.map((t) => t.id),
          deleteFromDisk,
        )
      }
    />,
    document.body,
  );

  return { onContextMenu, contextMenu, removeDialog };
}
