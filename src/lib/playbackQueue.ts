import type { RepeatMode } from "../types/track";

export function getAutoplayNextId(
  queue: number[],
  currentId: number,
  mode: RepeatMode,
): number | null {
  if (queue.length === 0) return null;
  const idx = queue.indexOf(currentId);
  if (idx < 0) return queue[0] ?? null;
  if (mode === "one") return currentId;
  if (idx < queue.length - 1) return queue[idx + 1] ?? null;
  if (mode === "all") return queue[0] ?? null;
  return null;
}

export function getManualNextId(
  queue: number[],
  currentId: number,
  mode: RepeatMode,
): number | null {
  if (queue.length === 0) return null;
  const idx = queue.indexOf(currentId);
  if (idx < 0) return queue[0] ?? null;
  if (idx < queue.length - 1) return queue[idx + 1] ?? null;
  if (mode === "all") return queue[0] ?? null;
  return null;
}

export function getManualPreviousId(
  queue: number[],
  currentId: number,
  mode: RepeatMode,
): number | null {
  if (queue.length === 0) return null;
  const idx = queue.indexOf(currentId);
  if (idx < 0) return queue[queue.length - 1] ?? null;
  if (idx > 0) return queue[idx - 1] ?? null;
  if (mode === "all") return queue[queue.length - 1] ?? null;
  return null;
}

export function cycleRepeatMode(mode: RepeatMode): RepeatMode {
  if (mode === "off") return "all";
  if (mode === "all") return "one";
  return "off";
}
