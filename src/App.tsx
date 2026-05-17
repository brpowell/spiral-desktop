import { useEffect } from "react";
import * as audio from "./lib/audio";
import { usePlayerStore } from "./store/usePlayerStore";
import "./App.css";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function App() {
  const library = usePlayerStore((s) => s.library);
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const playbackState = usePlayerStore((s) => s.playbackState);
  const positionSeconds = usePlayerStore((s) => s.positionSeconds);
  const loadLibrary = usePlayerStore((s) => s.loadLibrary);
  const importTracks = usePlayerStore((s) => s.importTracks);
  const importFolder = usePlayerStore((s) => s.importFolder);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);
  const seek = usePlayerStore((s) => s.seek);
  const importError = usePlayerStore((s) => s.importError);
  const clearImportError = usePlayerStore((s) => s.clearImportError);

  const currentTrack = library.find((t) => t.id === currentTrackId);
  const durationSeconds =
    currentTrack?.durationSeconds ?? audio.getDurationSeconds();
  const progress =
    durationSeconds > 0 ? positionSeconds / durationSeconds : 0;

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
          <p className="empty">No tracks yet. Import some music to get started.</p>
        ) : (
          <ul className="track-list">
            {library.map((track) => (
              <li
                key={track.id}
                className={
                  track.id === currentTrackId ? "track-item active" : "track-item"
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

      <footer className="player">
        <p className="now-playing">
          {currentTrack
            ? `${currentTrack.title} — ${currentTrack.artist ?? "Unknown artist"}`
            : "No track selected"}
        </p>
        <div className="player-controls">
          {playbackState === "playing" ? (
            <button type="button" onClick={pause}>
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                currentTrackId && playbackState === "paused"
                  ? resume()
                  : currentTrackId
                    ? playTrack(currentTrackId)
                    : undefined
              }
              disabled={!currentTrackId}
            >
              Play
            </button>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          disabled={!currentTrackId}
          onChange={(e) => seek(Number(e.currentTarget.value))}
        />
        <span className="time">
          {formatTime(positionSeconds)} / {formatTime(durationSeconds)}
        </span>
      </footer>
    </div>
  );
}

export default App;
