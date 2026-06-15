import { MARKER_META, WAYMARK_KEYS } from "./constants";
import { gameToCanvas } from "./geometry";
import type { ArenaGeometry, Preset, WaymarkKey } from "./types";

export interface DrawOptions {
  size: number;
  preset: Preset;
  dragging: WaymarkKey | null;
  square: boolean;
  geo: ArenaGeometry;
  ghost: { gx: number; gz: number; key: WaymarkKey } | null;
}

interface ArenaTheme {
  floorInner: string;
  floorOuter: string;
  grid: string;
  crosshair: string;
  boundary: string;
  cardinals: string;
}

function resolveTheme(): ArenaTheme {
  const style = getComputedStyle(document.documentElement);
  const get = (v: string) => style.getPropertyValue(v).trim();

  return {
    floorInner: get("--surface-bg"),
    floorOuter: get("--bg"),
    grid: hexWithAlpha(get("--text"), 0.55),
    crosshair: hexWithAlpha(get("--text-h"), 0.9),
    boundary: hexWithAlpha(get("--accent"), 0.7),
    cardinals: hexWithAlpha(get("--callout-warning-border"), 0.9),
  };
}

// converts a 3 or 6-char hex color + alpha to rgba().
// falls back gracefully if the value is already rgba or a named color.
function hexWithAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const [r, g, b] = clean.split("").map((c) => parseInt(c + c, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  // already rgba / named color — return as-is and ignore alpha
  return hex;
}

export function drawMarker(
  ctx: CanvasRenderingContext2D,
  mx: number,
  my: number,
  key: WaymarkKey,
  size: number,
  alpha: number = 1,
  glow: boolean = false,
): void {
  const meta = MARKER_META[key];
  const markerRadius = Math.max(14, Math.round(size * 0.034));

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = glow ? 20 : 10;

  if (meta.shape === "circle") {
    ctx.beginPath();
    ctx.arc(mx, my, markerRadius, 0, Math.PI * 2);
    ctx.fillStyle = `${meta.color}cc`;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    const sSize = markerRadius * 1.75;
    ctx.fillStyle = `${meta.color}cc`;
    ctx.fillRect(mx - sSize / 2, my - sSize / 2, sSize, sSize);
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx - sSize / 2, my - sSize / 2, sSize, sSize);
  }

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(size * 0.03)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(meta.label, mx, my);
  ctx.restore();
}

export function drawArena(
  opts: DrawOptions,
): (ctx: CanvasRenderingContext2D) => void {
  const { size, preset, dragging, square, geo, ghost } = opts;

  return (ctx: CanvasRenderingContext2D) => {
    const theme = resolveTheme();

    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 18;

    // floor
    ctx.save();
    ctx.beginPath();
    if (square) ctx.rect(cx - r, cy - r, r * 2, r * 2);
    else ctx.arc(cx, cy, r, 0, Math.PI * 2);
    const floor = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    floor.addColorStop(0, theme.floorInner);
    floor.addColorStop(1, theme.floorOuter);
    ctx.fillStyle = floor;
    ctx.fill();
    ctx.restore();

    // clipped grid
    ctx.save();
    ctx.beginPath();
    if (square) ctx.rect(cx - r, cy - r, r * 2, r * 2);
    else ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;

    if (square) {
      for (let i = -5; i <= 5; i++) {
        if (i === 0) continue;
        const offset = (r * i) / 6;
        ctx.beginPath();
        ctx.moveTo(cx + offset, cy - r);
        ctx.lineTo(cx + offset, cy + r);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r, cy + offset);
        ctx.lineTo(cx + r, cy + offset);
        ctx.stroke();
      }
    } else {
      for (let angle = 0; angle < 360; angle += 22.5) {
        if (angle % 90 === 0) continue;
        const rad = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
        ctx.stroke();
      }
      for (let ring = 1; ring <= 5; ring++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r * ring) / 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // crosshair
    ctx.strokeStyle = theme.crosshair;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();
    ctx.restore();

    // boundary ring
    ctx.save();
    ctx.beginPath();
    if (square) ctx.rect(cx - r, cy - r, r * 2, r * 2);
    else ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = theme.boundary;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // cardinal labels
    const cardinals = [
      { label: "N", angle: -Math.PI / 2 },
      { label: "S", angle: Math.PI / 2 },
      { label: "E", angle: 0 },
      { label: "W", angle: Math.PI },
    ];
    ctx.font = `bold ${Math.round(size * 0.026)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme.cardinals;
    for (const c of cardinals) {
      ctx.fillText(
        c.label,
        cx + Math.cos(c.angle) * (r - 12),
        cy + Math.sin(c.angle) * (r - 12),
      );
    }

    // ghost
    if (ghost) {
      const { cx: gx, cy: gy } = gameToCanvas(ghost.gx, ghost.gz, size, geo);
      drawMarker(ctx, gx, gy, ghost.key, size, 0.45, false);
    }

    // active markers
    for (const key of WAYMARK_KEYS) {
      const data = preset[key];
      if (!data.Active) continue;
      const { cx: mx, cy: my } = gameToCanvas(data.X, data.Z, size, geo);
      const isDragging = dragging === key;
      drawMarker(ctx, mx, my, key, size, isDragging ? 0.75 : 1, isDragging);
    }
  };
}
