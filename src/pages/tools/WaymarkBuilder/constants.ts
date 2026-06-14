import type { WaymarkKey } from "./types";

export const SNAP_GRID = 0.5;
export const SNAP_PULL = 0.35;
export const DEFAULT_RADIUS = 24;

export const MARKER_META: Record<
  WaymarkKey,
  { id: number; label: string; color: string; shape: "circle" | "square" }
> = {
  A: { id: 0, label: "A", color: "#e05555", shape: "circle" },
  B: { id: 1, label: "B", color: "#d4a82a", shape: "circle" },
  C: { id: 2, label: "C", color: "#4a8fd4", shape: "circle" },
  D: { id: 3, label: "D", color: "#9b59b6", shape: "circle" },
  One: { id: 4, label: "1", color: "#e05555", shape: "square" },
  Two: { id: 5, label: "2", color: "#d4a82a", shape: "square" },
  Three: { id: 6, label: "3", color: "#4a8fd4", shape: "square" },
  Four: { id: 7, label: "4", color: "#9b59b6", shape: "square" },
};

export const WAYMARK_KEYS: WaymarkKey[] = [
  "A",
  "B",
  "C",
  "D",
  "One",
  "Two",
  "Three",
  "Four",
];

export const TYPE_LABELS: Record<string, string> = {
  ultimate: "Ultimate",
  savage: "Savage",
  extreme: "Extreme",
  criterion: "Criterion",
};

export const TYPE_ORDER = ["ultimate", "savage", "extreme", "criterion"];
