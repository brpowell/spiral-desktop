import { useEffect } from "react";
import { PlayerDock } from "./components/PlayerDock/PlayerDock";
import { TrackEditor } from "./components/TrackEditor/TrackEditor";
import { MainContent } from "./components/layout/MainContent";
import { Sidebar } from "./components/layout/Sidebar";
import { usePlayerStore } from "./store/usePlayerStore";
import "./App.css";

function App() {
  const loadLibrary = usePlayerStore((s) => s.loadLibrary);
  const importTracks = usePlayerStore((s) => s.importTracks);
  const importFolder = usePlayerStore((s) => s.importFolder);
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

      <div className="app-body">
        <Sidebar />
        <MainContent />
      </div>

      <PlayerDock />
      <TrackEditor />
    </div>
  );
}

export default App;
