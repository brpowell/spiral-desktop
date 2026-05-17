import { parseTrackMetadata } from "./metadata";
import { saveTrack } from "./tauri";

export interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

export async function importPaths(paths: string[]): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, failed: 0, errors: [] };

  for (const path of paths) {
    try {
      const track = await parseTrackMetadata(path);
      await saveTrack(track);
      result.imported += 1;
    } catch (err) {
      result.failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`${path}: ${message}`);
      console.error(`Failed to import ${path}:`, err);
    }
  }

  return result;
}
