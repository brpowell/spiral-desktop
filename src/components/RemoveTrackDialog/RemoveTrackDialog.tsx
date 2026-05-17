import { useCallback, useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { Track } from "../../types/track";
import "./RemoveTrackDialog.css";

interface RemoveTrackDialogProps {
  track: Track;
  onClose: () => void;
  onRemove: (deleteFromDisk: boolean) => Promise<void>;
}

export function RemoveTrackDialog({
  track,
  onClose,
  onRemove,
}: RemoveTrackDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const removingRef = useRef(false);

  useFocusTrap(dialogRef, true);

  const handleRemove = useCallback(
    async (deleteFromDisk: boolean) => {
      if (removingRef.current) return;
      removingRef.current = true;
      try {
        await onRemove(deleteFromDisk);
        onClose();
      } catch (err) {
        console.error("removeTrack failed:", err);
        removingRef.current = false;
      }
    },
    [onClose, onRemove],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const subtitle = [track.artist, track.album].filter(Boolean).join(" · ");

  return (
    <div className="remove-track-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="remove-track-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-track-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="remove-track-title" className="remove-track-dialog__heading">
          Remove from library?
        </h2>
        <p className="remove-track-dialog__track">
          <strong>{track.title}</strong>
          {subtitle ? <span>{subtitle}</span> : null}
        </p>
        <div className="remove-track-dialog__actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={() => void handleRemove(false)}>
            Remove from library
          </button>
          <button
            type="button"
            className="remove-track-dialog__delete"
            onClick={() => void handleRemove(true)}
          >
            Remove and delete file
          </button>
        </div>
      </div>
    </div>
  );
}