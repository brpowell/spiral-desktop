export interface ThemeTokens {
  "color-bg": string;
  "color-surface": string;
  "color-surface-raised"?: string;
  "color-text-primary": string;
  "color-text-secondary": string;
  "color-accent": string;
  "color-accent-muted": string;
  "color-border": string;
  "color-danger": string;
  "color-danger-bg"?: string;
  "radius-card": string;
  "radius-button": string;
  "font-ui": string;
  [key: string]: string | undefined;
}

export interface Theme {
  name: string;
  author: string;
  description: string;
  tokens: ThemeTokens;
}

export const THEME_SCHEMA_EXAMPLE = `{
  "name": "My Theme",
  "author": "You",
  "description": "Optional description",
  "tokens": {
    "color-bg": "#0e0e10",
    "color-surface": "#1a1a1e",
    "color-text-primary": "#f0f0f0",
    "color-text-secondary": "#888899",
    "color-accent": "#7b8cde",
    "color-accent-muted": "#3a4170",
    "color-border": "#2a2a32",
    "color-danger": "#e06c75",
    "radius-card": "10px",
    "radius-button": "6px",
    "font-ui": "'Inter', sans-serif"
  }
}`;
