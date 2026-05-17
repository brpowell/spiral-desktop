import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../components/TrackRowMenu/TrackRowMenu.css";
import { usePlayerStore } from "../store/usePlayerStore";
import type { Track } from "../types/track";

export function useTrackEditMenu(track: Track) {
  const openTrackEditor = usePlayerStore((s) => s.openTrackEditor);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
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
          </div>,
          document.body,
        )
      : null;

  return { onContextMenu, openEditor, contextMenu };
}
