import { IconEditInfo } from "../icons";
import { useTrackEditMenu } from "../../hooks/useTrackEditMenu";
import type { Track } from "../../types/track";
import "./TrackRowMenu.css";

interface TrackRowMenuProps {
  track: Track;
  children: React.ReactNode;
  className?: string;
}

export function TrackRowMenu({ track, children, className = "" }: TrackRowMenuProps) {
  const { onContextMenu, openEditor, contextMenu } = useTrackEditMenu(track);

  return (
    <div
      className={`track-row-menu ${className}`.trim()}
      onContextMenu={onContextMenu}
    >
      {children}
      <button
        type="button"
        className="track-row-menu__edit"
        aria-label="Edit track info"
        onClick={(e) => {
          e.stopPropagation();
          openEditor();
        }}
      >
        <IconEditInfo />
      </button>
      {contextMenu}
    </div>
  );
}
