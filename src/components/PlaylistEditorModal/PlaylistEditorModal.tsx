import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { getPlaylistById } from "../../lib/playlists";
import { useNavigationStore } from "../../store/useNavigationStore";
import { usePlaylistStore } from "../../store/usePlaylistStore";
import { Button } from "../Button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../Modal/Modal";
import { TextInput } from "../TextInput/TextInput";

export function PlaylistEditorModal() {
  const editingPlaylistId = usePlaylistStore((s) => s.editingPlaylistId);
  const playlists = usePlaylistStore((s) => s.playlists);
  const closePlaylistEditor = usePlaylistStore((s) => s.closePlaylistEditor);
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const openPlaylist = useNavigationStore((s) => s.openPlaylist);

  const isNew = editingPlaylistId === "new";
  const existing = useMemo(
    () =>
      typeof editingPlaylistId === "number"
        ? getPlaylistById(playlists, editingPlaylistId)
        : undefined,
    [editingPlaylistId, playlists],
  );

  const isOpen =
    editingPlaylistId != null && (isNew || existing != null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    if (isNew) {
      setTitle("Untitled Playlist");
      setDescription("");
    } else if (existing) {
      setTitle(existing.title);
      setDescription(existing.description ?? "");
    }
  }, [isOpen, isNew, existing]);

  const handleClose = useCallback(() => {
    if (saving) return;
    closePlaylistEditor();
  }, [saving, closePlaylistEditor]);

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSaving(true);
    try {
      const desc = description.trim() || null;
      if (isNew) {
        const id = await createPlaylist(trimmedTitle, desc);
        openPlaylist(id);
      } else if (typeof editingPlaylistId === "number") {
        await updatePlaylist(editingPlaylistId, trimmedTitle, desc);
      }
      closePlaylistEditor();
    } finally {
      setSaving(false);
    }
  }, [
    title,
    description,
    isNew,
    editingPlaylistId,
    createPlaylist,
    updatePlaylist,
    openPlaylist,
    closePlaylistEditor,
  ]);

  const titleId = "playlist-editor-title";

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      size="sm"
      panelRef={panelRef}
      labelledBy={titleId}
    >
      <ModalHeader>
        <ModalTitle id={titleId}>
          {isNew ? "New Playlist" : "Edit Playlist"}
        </ModalTitle>
      </ModalHeader>

      <ModalBody>
        <label className="modal-field">
          <span className="modal-label">Title</span>
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSave();
            }}
            autoFocus
          />
        </label>
        <label className="modal-field">
          <span className="modal-label">Description</span>
          <textarea
            className="modal-textarea"
            value={description}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </label>
      </ModalBody>

      <ModalFooter onCancel={handleClose} cancelDisabled={saving}>
        <Button
          variant="primary"
          size="md"
          onClick={() => void handleSave()}
          disabled={saving || !title.trim()}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
