import type { ReactNode } from "react";
import {
  IconAlbums,
  IconArtists,
  IconLibrary,
  IconPlaylists,
} from "../icons";
import {
  type NavView,
  useNavigationStore,
} from "../../store/useNavigationStore";
import "./Sidebar.css";

const NAV_ITEMS: {
  view: NavView;
  label: string;
  icon: ReactNode;
  enabled: boolean;
}[] = [
  { view: "library", label: "Library", icon: <IconLibrary />, enabled: true },
  { view: "albums", label: "Albums", icon: <IconAlbums />, enabled: true },
  { view: "artists", label: "Artists", icon: <IconArtists />, enabled: false },
  {
    view: "playlists",
    label: "Playlists",
    icon: <IconPlaylists />,
    enabled: false,
  },
];

export function Sidebar() {
  const view = useNavigationStore((s) => s.view);
  const setView = useNavigationStore((s) => s.setView);

  return (
    <nav className="sidebar" aria-label="Main navigation">
      <ul className="sidebar__list">
        {NAV_ITEMS.map((item) => {
          const isActive = item.view === view;
          return (
            <li key={item.view}>
              <button
                type="button"
                className={
                  isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                }
                disabled={!item.enabled}
                aria-current={isActive ? "page" : undefined}
                onClick={() => item.enabled && setView(item.view)}
              >
                <span className="sidebar__icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
