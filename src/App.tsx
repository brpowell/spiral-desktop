import { useEffect } from "react";
import { PlayerDock } from "./components/PlayerDock/PlayerDock";
import { usePlayerStore } from "./store/usePlayerStore";
import "./App.css";

function App() {
  const library = usePlayerStore((s) => s.library);
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const loadLibrary = usePlayerStore((s) => s.loadLibrary);
  const importTracks = usePlayerStore((s) => s.importTracks);
  const importFolder = usePlayerStore((s) => s.importFolder);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const importError = usePlayerStore((s) => s.importError);
  const clearImportError = usePlayerStore((s) => s.clearImportError);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  return (
    <div className="app">
      <header className="header">
        <h1>Spiral</h1>
        <div className="import-actions">
          <button type="button" onClick={() => importTracks()}>
            Import files
          </button>
          <button type="button" onClick={() => importFolder()}>
            Import folder
          </button>
        </div>
      </header>

      {importError && (
        <div className="error-banner" role="alert">
          <span>{importError}</span>
          <button type="button" onClick={clearImportError} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <section className="library">
        <h2>Library ({library.length})</h2>
        {library.length === 0 ? (
          <p className="empty">
            No tracks yet. Import some music to get started.
          </p>
        ) : (
          <ul className="track-list">
            {library.map((track) => (
              <li
                key={track.id}
                className={
                  track.id === currentTrackId
                    ? "track-item active"
                    : "track-item"
                }
              >
                <button
                  type="button"
                  className="track-button"
                  onClick={() => playTrack(track.id)}
                >
                  <span className="track-title">{track.title}</span>
                  <span className="track-meta">
                    {[track.artist, track.album].filter(Boolean).join(" — ") ||
                      "Unknown artist"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PlayerDock />
    </div>
  );
}

export default App;
