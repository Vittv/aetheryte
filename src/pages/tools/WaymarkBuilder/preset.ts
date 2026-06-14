import dutiesIndex from "../../../../data/duties.json";
import { MARKER_META, WAYMARK_KEYS } from "./constants";
import type { DutyEntry, Preset, WaymarkData, WaymarkKey } from "./types";

export function makeDefault(key: WaymarkKey): WaymarkData {
  return { X: 100, Y: 0, Z: 100, ID: MARKER_META[key].id, Active: false };
}

export function makeDefaultPreset(): Preset {
  return {
    Name: "New Preset",
    MapID: 0,
    A: makeDefault("A"),
    B: makeDefault("B"),
    C: makeDefault("C"),
    D: makeDefault("D"),
    One: makeDefault("One"),
    Two: makeDefault("Two"),
    Three: makeDefault("Three"),
    Four: makeDefault("Four"),
  };
}

export function parsePreset(text: string): Preset | null {
  try {
    const obj = JSON.parse(text);
    if (typeof obj !== "object" || obj === null) return null;
    if (typeof obj.MapID !== "number") return null;
    for (const key of WAYMARK_KEYS) {
      if (!obj[key] || typeof obj[key].X !== "number") return null;
    }
    return obj as Preset;
  } catch {
    return null;
  }
}

export function presetToJson(preset: Preset): string {
  return JSON.stringify(preset, null, 2);
}

/**
 * tries to match a parsed preset back to a known duty entry.
 * used when the user manually edits the JSON pane.
 */
export function findDutyByPreset(preset: Preset): DutyEntry | null {
  const duties = dutiesIndex as DutyEntry[];
  const nameSlug = preset.Name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    duties.find(
      (d) => d.slug.includes(String(preset.MapID)) || d.slug === nameSlug,
    ) ?? null
  );
}
