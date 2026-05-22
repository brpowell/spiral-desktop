import { useCallback, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { Playlist } from "../../types/playlist";
import { Button } from "../common/Button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../common/Modal/Modal";

interface DeletePlaylistDialogProps {
  open: boolean;
  playlist: Playlist;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeletePlaylistDialog({
  open,
  playlist,
  onClose,
  onConfirm,
}: DeletePlaylistDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const deletingRef = useRef(false);

  useFocusTrap(dialogRef, open);

  const handleDelete = useCallback(async () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("deletePlaylist failed:", err);
      deletingRef.current = false;
    }
  }, [onClose, onConfirm]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      panelRef={dialogRef}
      labelledBy="delete-playlist-title"
    >
      <ModalHeader>
        <ModalTitle id="delete-playlist-title">Delete playlist?</ModalTitle>
      </ModalHeader>

      <ModalBody>
        <p>
          <strong>{playlist.title}</strong> will be removed. Tracks in this
          playlist stay in your library.
        </p>
      </ModalBody>

      <ModalFooter onCancel={onClose}>
        <Button variant="danger" onClick={() => void handleDelete()}>
          Delete playlist
        </Button>
      </ModalFooter>
    </Modal>
  );
}
