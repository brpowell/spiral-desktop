import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RemoveTrackDialog } from "../components/RemoveTrackDialog/RemoveTrackDialog";
import "../components/TrackRowMenu/TrackRowMenu.css";
import { usePlayerStore } from "../store/usePlayerStore";
import type { Track } from "../types/track";

export function useTrackEditMenu(track: Track) {
  const openTrackEditor = usePlayerStore((s) => s.openTrackEditor);
  const removeTrackFromLibrary = usePlayerStore((s) => s.removeTrackFromLibrary);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const openEditor = useCallback(() => {
    setMenu(null);
    openTrackEditor(track.id);
  }, [openTrackEditor, track.id]);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      close();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", close, true);
    };
  }, [menu]);

  const contextMenu =
    menu != null
      ? createPortal(
          <div
            ref={menuRef}
            className="track-row-menu__popup"
            style={{ left: menu.x, top: menu.y }}
            role="menu"
          >
            <button type="button" role="menuitem" onClick={openEditor}>
              Edit Info
            </button>
            <button
              type="button"
              role="menuitem"
              className="track-row-menu__danger"
              onClick={() => {
                setMenu(null);
                setRemoveDialogOpen(true);
              }}
            >
              Remove from Library
            </button>
          </div>,
          document.body,
        )
      : null;

  const removeDialog = createPortal(
    <RemoveTrackDialog
      open={removeDialogOpen}
      track={track}
      onClose={() => setRemoveDialogOpen(false)}
      onRemove={(deleteFromDisk) =>
        removeTrackFromLibrary(track.id, deleteFromDisk)
      }
    />,
    document.body,
  );

  return { onContextMenu, openEditor, contextMenu, removeDialog };
}
