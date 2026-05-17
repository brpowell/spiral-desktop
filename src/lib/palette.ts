import { Vibrant } from "node-vibrant/browser";

const FALLBACK_PALETTE = [
  "#7c6af7",
  "#5a4fd4",
  "#9b8fff",
  "#3d3566",
  "#c4baff",
] as const;

const SWATCH_KEYS = [
  "Vibrant",
  "LightVibrant",
  "Muted",
  "DarkVibrant",
  "LightMuted",
] as const;

type SwatchLike = { hex: string } | null;

function paletteToColors(palette: Record<string, SwatchLike>): string[] {
  const colors: string[] = [];
  for (const key of SWATCH_KEYS) {
    const swatch = palette[key];
    if (swatch) {
      colors.push(swatch.hex);
    }
  }
  return colors.length > 0 ? colors : [...FALLBACK_PALETTE];
}

export async function extractPaletteFromImageUrl(
  imageUrl: string,
): Promise<string[]> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    return paletteToColors(palette);
  } catch (err) {
    console.warn("Failed to extract palette from album art:", err);
    return [...FALLBACK_PALETTE];
  }
}

export function getDefaultPalette(): string[] {
  return [...FALLBACK_PALETTE];
}
