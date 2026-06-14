import dutiesIndex from "../../../../data/duties.json";
import {
  DEFAULT_RADIUS,
  SNAP_GRID,
  SNAP_PULL,
  WAYMARK_KEYS,
} from "./constants";
import type { ArenaGeometry, DutyEntry, Preset } from "./types";

export function getArenaGeometry(
  preset: Preset | null,
  selectedSlug: string | null,
): ArenaGeometry {
  const defaultGeo: ArenaGeometry = {
    center: { x: 100, z: 100 },
    radius: DEFAULT_RADIUS,
  };
  if (!preset) return defaultGeo;

  const activeDuty = (dutiesIndex as DutyEntry[]).find(
    (d) => d.slug === selectedSlug,
  );
  const targetRadius = activeDuty ? activeDuty.radius : DEFAULT_RADIUS;

  const active = WAYMARK_KEYS.map((k) => preset[k]).filter((d) => d.Active);

  let center = { x: 100, z: 100 };
  if (active.length > 0) {
    const avgX = active.reduce((acc, d) => acc + d.X, 0) / active.length;
    if (Math.abs(avgX) < 30) center = { x: 0, z: 0 };
  }

  return { center, radius: targetRadius };
}

export function snapVal(val: number): number {
  const snapped = Math.round(val / SNAP_GRID) * SNAP_GRID;
  return Math.abs(val - snapped) < SNAP_PULL ? snapped : val;
}

export function gameToCanvas(
  gx: number,
  gz: number,
  canvasSize: number,
  geo: ArenaGeometry,
): { cx: number; cy: number } {
  const r = canvasSize / 2 - 18;
  const scale = r / geo.radius;
  return {
    cx: (gx - geo.center.x) * scale + canvasSize / 2,
    cy: (gz - geo.center.z) * scale + canvasSize / 2,
  };
}

export function canvasToGame(
  cx: number,
  cy: number,
  canvasSize: number,
  geo: ArenaGeometry,
): { gx: number; gz: number } {
  const r = canvasSize / 2 - 18;
  const scale = r / geo.radius;
  return {
    gx: (cx - canvasSize / 2) / scale + geo.center.x,
    gz: (cy - canvasSize / 2) / scale + geo.center.z,
  };
}

export function clampToArena(
  gx: number,
  gz: number,
  geo: ArenaGeometry,
  square: boolean,
  canvasSize: number,
): { gx: number; gz: number } {
  const dx = gx - geo.center.x;
  const dz = gz - geo.center.z;

  const visualRadiusPx = canvasSize / 2 - 18;
  const totalRadiusPx = canvasSize / 2;
  const maxGameRadius = geo.radius * (visualRadiusPx / totalRadiusPx);

  if (square) {
    return {
      gx: geo.center.x + Math.max(-maxGameRadius, Math.min(maxGameRadius, dx)),
      gz: geo.center.z + Math.max(-maxGameRadius, Math.min(maxGameRadius, dz)),
    };
  }

  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist <= maxGameRadius) return { gx, gz };
  return {
    gx: geo.center.x + (dx / dist) * maxGameRadius,
    gz: geo.center.z + (dz / dist) * maxGameRadius,
  };
}
