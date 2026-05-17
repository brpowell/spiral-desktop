import { useState } from "react";
import { AudioVisualizer } from "../AudioVisualizer/AudioVisualizer";
import { NowPlayingBar } from "../NowPlayingBar/NowPlayingBar";
import "./PlayerDock.css";

export function PlayerDock() {
  const [visualizerExpanded, setVisualizerExpanded] = useState(false);

  return (
    <div className="player-dock">
      <AudioVisualizer
        expanded={visualizerExpanded}
        onToggleExpand={() => setVisualizerExpanded((v) => !v)}
      />
      <NowPlayingBar />
    </div>
  );
}
