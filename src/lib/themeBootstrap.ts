import { applyTheme, DEFAULT_THEME_ID, findThemeByName } from "./theme";
import {
  getActiveThemeId,
  getBuiltinThemes,
  loadUserThemes,
} from "./tauri";
import { useThemeStore } from "../store/useThemeStore";
import type { Theme } from "../types/theme";

export async function bootstrapTheme(): Promise<void> {
  let builtin: Theme[] = [];
  let user: Theme[] = [];
  let activeThemeId = DEFAULT_THEME_ID;

  try {
    [builtin, user, activeThemeId] = await Promise.all([
      getBuiltinThemes(),
      loadUserThemes(),
      getActiveThemeId(),
    ]);
  } catch {
    useThemeStore.getState().initializeFromBootstrap([], DEFAULT_THEME_ID);
    return;
  }

  const themes: Theme[] = [...builtin, ...user];
  const resolvedId =
    findThemeByName(themes, activeThemeId) !== undefined
      ? activeThemeId
      : DEFAULT_THEME_ID;

  const theme =
    findThemeByName(themes, resolvedId) ??
    findThemeByName(themes, DEFAULT_THEME_ID) ??
    themes[0];

  if (theme) {
    applyTheme(theme);
  }

  useThemeStore.getState().initializeFromBootstrap(themes, resolvedId);
}
