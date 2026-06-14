export type WaymarkKey =
  | "A"
  | "B"
  | "C"
  | "D"
  | "One"
  | "Two"
  | "Three"
  | "Four";

export interface WaymarkData {
  X: number;
  Y: number;
  Z: number;
  ID: number;
  Active: boolean;
}

export interface Preset {
  Name: string;
  MapID: number;
  A: WaymarkData;
  B: WaymarkData;
  C: WaymarkData;
  D: WaymarkData;
  One: WaymarkData;
  Two: WaymarkData;
  Three: WaymarkData;
  Four: WaymarkData;
}

export interface DutyEntry {
  slug: string;
  name: string;
  type: string;
  radius: number;
  order: number;
  shape?: "circle" | "square";
}

export interface ArenaGeometry {
  center: { x: number; z: number };
  radius: number;
}
