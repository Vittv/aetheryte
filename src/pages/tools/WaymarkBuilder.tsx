import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dutiesIndex from "../../../data/duties.json";
import { s } from "./WaymarkBuilder.styles";

// types
type WaymarkKey = "A" | "B" | "C" | "D" | "One" | "Two" | "Three" | "Four";

interface WaymarkData {
  X: number;
  Y: number;
  Z: number;
  ID: number;
  Active: boolean;
}

interface Preset {
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

interface DutyEntry {
  slug: string;
  name: string;
  type: string;
  radius: number;
  order: number;
  shape?: "circle" | "square";
}

interface ArenaGeometry {
  center: { x: number; z: number };
  radius: number;
}

// constants
const SNAP_GRID = 0.5;
const SNAP_PULL = 0.35;
const DEFAULT_RADIUS = 24; // fallback radius if no explicit duty is active or loaded

const MARKER_META: Record<
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

const WAYMARK_KEYS: WaymarkKey[] = [
  "A",
  "B",
  "C",
  "D",
  "One",
  "Two",
  "Three",
  "Four",
];

const TYPE_LABELS: Record<string, string> = {
  ultimate: "Ultimate",
  savage: "Savage",
  extreme: "Extreme",
  criterion: "Criterion",
};

const TYPE_ORDER = ["ultimate", "savage", "extreme", "criterion"];

// helpers
function makeDefault(key: WaymarkKey): WaymarkData {
  return { X: 100, Y: 0, Z: 100, ID: MARKER_META[key].id, Active: false };
}

function makeDefaultPreset(): Preset {
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

function parsePreset(text: string): Preset | null {
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

function presetToJson(preset: Preset): string {
  return JSON.stringify(preset, null, 2);
}

/**
 * Pure math engine: Tracks map center coordinates and sets static geometry 
 * based on the selected duty's precise design boundaries.
 */
function getArenaGeometry(
  preset: Preset | null,
  selectedSlug: string | null,
): ArenaGeometry {
  const defaultGeo = { center: { x: 100, z: 100 }, radius: DEFAULT_RADIUS };
  if (!preset) return defaultGeo;

  // Pull explicit architectural radius mapped directly inside duties.json
  const activeDuty = (dutiesIndex as DutyEntry[]).find((d) => d.slug === selectedSlug);
  const targetRadius = activeDuty ? activeDuty.radius : DEFAULT_RADIUS;

  const active = WAYMARK_KEYS.map((k) => preset[k]).filter((d) => d.Active);

  // detect if the fight is centered at (0,0) or (100,100)
  let center = { x: 100, z: 100 };
  if (active.length > 0) {
    const sumX = active.reduce((acc, d) => acc + d.X, 0);
    const avgX = sumX / active.length;
    if (Math.abs(avgX) < 30) center = { x: 0, z: 0 };
  }

  return {
    center,
    radius: targetRadius,
  };
}

function snapVal(val: number): number {
  const snapped = Math.round(val / SNAP_GRID) * SNAP_GRID;
  return Math.abs(val - snapped) < SNAP_PULL ? snapped : val;
}

// coordinate helpers
function gameToCanvas(
  gx: number,
  gz: number,
  canvasSize: number,
  geo: ArenaGeometry,
) {
  const r = canvasSize / 2 - 18;
  const scale = r / geo.radius;

  return {
    cx: (gx - geo.center.x) * scale + canvasSize / 2,
    cy: (gz - geo.center.z) * scale + canvasSize / 2,
  };
}

function canvasToGame(
  cx: number,
  cy: number,
  canvasSize: number,
  geo: ArenaGeometry,
) {
  const r = canvasSize / 2 - 18;
  const scale = r / geo.radius;

  return {
    gx: (cx - canvasSize / 2) / scale + geo.center.x,
    gz: (cy - canvasSize / 2) / scale + geo.center.z,
  };
}

function clampToArena(
  gx: number,
  gz: number,
  geo: ArenaGeometry,
  square: boolean,
  canvasSize: number,
) {
  const dx = gx - geo.center.x;
  const dz = gz - geo.center.z;

  const visualRadiusPx = canvasSize / 2 - 18;
  const totalRadiusPx = canvasSize / 2;
  const usableScale = visualRadiusPx / totalRadiusPx;
  const maxGameRadius = geo.radius * usableScale;

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

// canvas draw engine
interface DrawOptions {
  size: number;
  preset: Preset;
  dragging: WaymarkKey | null;
  square: boolean;
  geo: ArenaGeometry;
  ghost: { gx: number; gz: number; key: WaymarkKey } | null;
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  mx: number,
  my: number,
  key: WaymarkKey,
  size: number,
  alpha: number = 1,
  glow: boolean = false,
) {
  const meta = MARKER_META[key];
  const markerRadius = Math.max(14, Math.round(size * 0.034));

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = glow ? 20 : 10;

  if (meta.shape === "circle") {
    ctx.beginPath();
    ctx.arc(mx, my, markerRadius, 0, Math.PI * 2);
    ctx.fillStyle = meta.color + "cc";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    const sSize = markerRadius * 1.75;
    ctx.fillStyle = meta.color + "cc";
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

function drawArena(opts: DrawOptions) {
  const { size, preset, dragging, square, geo, ghost } = opts;

  return (ctx: CanvasRenderingContext2D) => {
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
    floor.addColorStop(0, "#252220");
    floor.addColorStop(1, "#181513");
    ctx.fillStyle = floor;
    ctx.fill();
    ctx.restore();

    // clip grid bounds
    ctx.save();
    ctx.beginPath();
    if (square) ctx.rect(cx - r, cy - r, r * 2, r * 2);
    else ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // ── High-Visibility Grid Lines ──
    ctx.strokeStyle = "rgba(180,160,130,0.22)";
    ctx.lineWidth = 1;

    if (square) {
      // clean intersecting cross-grid matrix for squares
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
      // classic radial layout for circles
      for (let angle = 0; angle < 360; angle += 22.5) {
        if (angle % 90 === 0) continue;
        const rad = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
        ctx.stroke();
      }

      for (let ring = 1; ring <= 5; ring++) {
        const rr = (r * ring) / 6;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // bolder central crosshair
    ctx.strokeStyle = "rgba(180,160,130,0.45)";
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

    // high contrast boundary ring
    ctx.beginPath();
    if (square) ctx.rect(cx - r, cy - r, r * 2, r * 2);
    else ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(200,80,60,0.8)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // cardinal orientations
    const cardinals = [
      { label: "N", angle: -Math.PI / 2 },
      { label: "S", angle: Math.PI / 2 },
      { label: "E", angle: 0 },
      { label: "W", angle: Math.PI },
    ];
    ctx.font = `bold ${Math.round(size * 0.026)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const c of cardinals) {
      ctx.fillStyle = "rgba(180,160,130,0.55)";
      ctx.fillText(
        c.label,
        cx + Math.cos(c.angle) * (r - 12),
        cy + Math.sin(c.angle) * (r - 12),
      );
    }

    // ghost tool replacement reference
    if (ghost) {
      const { cx: gx, cy: gy } = gameToCanvas(ghost.gx, ghost.gz, size, geo);
      drawMarker(ctx, gx, gy, ghost.key, size, 0.45, false);
    }

    // active rendering layer
    for (const key of WAYMARK_KEYS) {
      const data = preset[key];
      if (!data.Active) continue;
      const { cx: mx, cy: my } = gameToCanvas(data.X, data.Z, size, geo);
      const isDragging = dragging === key;
      drawMarker(ctx, mx, my, key, size, isDragging ? 0.75 : 1, isDragging);
    }
  };
}

// component
export default function WaymarkBuilder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef(560);

  const [jsonText, setJsonText] = useState(() =>
    presetToJson(makeDefaultPreset()),
  );
  const [jsonError, setJsonError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [square, setSquare] = useState(false);
  const [dragging, setDragging] = useState<WaymarkKey | null>(null);
  const [activeTool, setActiveTool] = useState<WaymarkKey | null>(null);

  // track the currently selected duty configuration profile slug
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const [availablePresets, setAvailablePresets] = useState<any[]>([]);
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);

  const ghostRef = useRef<{ gx: number; gz: number; key: WaymarkKey } | null>(
    null,
  );

  const [copied, setCopied] = useState(false);
  const [loadingFight, setLoadingFight] = useState(false);

  const preset = useMemo<Preset | null>(
    () => parsePreset(jsonText),
    [jsonText],
  );

  // math engine handles canvas scale and center translations using the explicit duty slug context
  const geo = useMemo<ArenaGeometry>(
    () => getArenaGeometry(preset, selectedSlug),
    [preset, selectedSlug],
  );

  const groupedDuties = useMemo(() => {
    const groups: Record<string, DutyEntry[]> = {};
    for (const duty of dutiesIndex as DutyEntry[]) {
      if (!groups[duty.type]) groups[duty.type] = [];
      groups[duty.type].push(duty);
    }
    for (const type of Object.keys(groups)) {
      groups[type].sort((a, b) => a.order - b.order);
    }
    return groups;
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !preset) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawArena({
      size: sizeRef.current,
      preset,
      dragging,
      square,
      geo,
      ghost: ghostRef.current,
    })(ctx);
  }, [preset, dragging, square, geo]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const targetSize = Math.floor(Math.min(width, height));

        if (sizeRef.current !== targetSize && targetSize > 0) {
          sizeRef.current = targetSize;
          canvas.width = targetSize;
          canvas.height = targetSize;
          redraw();
        }
      }
    });

    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [redraw]);

  const updatePreset = useCallback((updater: (p: Preset) => Preset) => {
    setJsonText((prev) => {
      const parsed = parsePreset(prev);
      if (!parsed) return prev;
      return presetToJson(updater(parsed));
    });
  }, []);

  const hitTest = useCallback(
    (cx: number, cy: number): WaymarkKey | null => {
      if (!preset) return null;
      const size = sizeRef.current;
      const threshold = Math.max(18, size * 0.05);
      for (const key of WAYMARK_KEYS) {
        const data = preset[key];
        if (!data.Active) continue;
        const { cx: mx, cy: my } = gameToCanvas(data.X, data.Z, size, geo);
        if (Math.hypot(cx - mx, cy - my) < threshold) return key;
      }
      return null;
    },
    [preset, geo],
  );

  const getCanvasPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      cx: (e.clientX - rect.left) * scaleX,
      cy: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!preset) return;
    const { cx, cy } = getCanvasPos(e);
    const hit = hitTest(cx, cy);

    if (hit) {
      setDragging(hit);
      ghostRef.current = null;
      canvasRef.current!.setPointerCapture(e.pointerId);
      return;
    }

    if (activeTool) {
      const { gx, gz } = canvasToGame(cx, cy, sizeRef.current, geo);
      const clamped = clampToArena(
        snapVal(gx),
        snapVal(gz),
        geo,
        square,
        sizeRef.current,
      );
      updatePreset((p) => ({
        ...p,
        [activeTool]: {
          ...p[activeTool],
          X: +clamped.gx.toFixed(3),
          Z: +clamped.gz.toFixed(3),
          Active: true,
        },
      }));
      ghostRef.current = null;
      setActiveTool(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { cx, cy } = getCanvasPos(e);

    if (dragging && preset) {
      const { gx, gz } = canvasToGame(cx, cy, sizeRef.current, geo);
      const clamped = clampToArena(
        snapVal(gx),
        snapVal(gz),
        geo,
        square,
        sizeRef.current,
      );
      updatePreset((p) => ({
        ...p,
        [dragging]: {
          ...p[dragging],
          X: +clamped.gx.toFixed(3),
          Z: +clamped.gz.toFixed(3),
        },
      }));
      return;
    }

    if (activeTool) {
      const { gx, gz } = canvasToGame(cx, cy, sizeRef.current, geo);
      const clamped = clampToArena(
        snapVal(gx),
        snapVal(gz),
        geo,
        square,
        sizeRef.current,
      );
      ghostRef.current = { gx: clamped.gx, gz: clamped.gz, key: activeTool };
      redraw();
    }
  };

  const handlePointerUp = () => setDragging(null);
  const handlePointerLeave = () => {
    if (!dragging && ghostRef.current) {
      ghostRef.current = null;
      redraw();
    }
  };

  const toggleActive = (key: WaymarkKey) =>
    updatePreset((p) => ({
      ...p,
      [key]: { ...p[key], Active: !p[key].Active },
    }));

  const handleFightPick = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    const duty = (dutiesIndex as DutyEntry[]).find((d) => d.slug === value);
    if (!duty) return;

    setLoadingFight(true);
    try {
      const res = await fetch(`/data/duty/${duty.type}/${duty.slug}.json`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();

      const presetsList = Array.isArray(data.markers)
        ? data.markers
        : data.Name
          ? [data]
          : [];

      if (presetsList.length === 0) throw new Error("no markers");

      setSelectedSlug(duty.slug);
      setSquare(duty.shape === "square");
      setAvailablePresets(presetsList);
      setActivePresetIdx(0);

      setJsonText(
        presetToJson({
          ...presetsList[0],
          Name: presetsList[0].Name || "Preset 1",
        }),
      );
      setJsonError(false);
      setActiveTool(null);
      ghostRef.current = null;
    } catch {
      // block errors safely
    } finally {
      setLoadingFight(false);
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);

    const parsed = parsePreset(val);
    if (parsed === null) {
      setJsonError(true);
      return;
    }

    setJsonError(false);

    const matchedDuty = (dutiesIndex as DutyEntry[]).find(
      (d) =>
        d.slug.includes(String(parsed.MapID)) ||
        d.slug === parsed.Name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    );

    if (matchedDuty) {
      setSelectedSlug(matchedDuty.slug);
      if (matchedDuty.shape) {
        setSquare(matchedDuty.shape === "square");
      }
    } else {
      setSelectedSlug(null);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <p style={s.sidebarTitle}>Waymark Builder</p>

        <label style={s.fieldLabel}>Load fight</label>
        <select
          style={s.select}
          value={selectedSlug ?? ""}
          onChange={handleFightPick}
          disabled={loadingFight}
        >
          <option value="" disabled>
            {loadingFight ? "Loading..." : "Select a duty..."}
          </option>
          {TYPE_ORDER.filter((t) => groupedDuties[t]).map((type) => (
            <optgroup key={type} label={TYPE_LABELS[type] ?? type}>
              {groupedDuties[type].map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {availablePresets.length > 1 && (
          <>
            <label style={s.fieldLabel}>Select Preset Layout</label>
            <select
              style={s.select}
              value={activePresetIdx}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setActivePresetIdx(idx);
                const chosen = availablePresets[idx];
                if (chosen) {
                  setJsonText(
                    presetToJson({
                      ...chosen,
                      Name: chosen.Name || `Preset ${idx + 1}`,
                    }),
                  );
                  setJsonError(false);
                  setActiveTool(null);
                  ghostRef.current = null;
                }
              }}
            >
              {availablePresets.map((p, index) => (
                <option key={index} value={index}>
                  {p.Name || `Layout Variation ${index + 1}`}
                </option>
              ))}
            </select>
          </>
        )}

        <label style={s.fieldLabel}>Map ID</label>
        <div style={s.mapId}>{preset?.MapID ?? "—"}</div>

        <label style={s.fieldLabel}>Arena shape</label>
        <div style={s.shapeToggle}>
          <button
            style={{ ...s.shapeBtn, ...(square ? {} : s.shapeBtnActive) }}
            onClick={() => setSquare(false)}
          >
            Circle
          </button>
          <button
            style={{ ...s.shapeBtn, ...(square ? s.shapeBtnActive : {}) }}
            onClick={() => setSquare(true)}
          >
            Square
          </button>
        </div>

        <p style={s.sectionLabel}>
          Click a marker to select it, then click the arena to place it
        </p>

        <div style={s.markerGrid}>
          {WAYMARK_KEYS.map((key) => {
            const meta = MARKER_META[key];
            const data = preset?.[key];
            const isActive = data?.Active ?? false;
            const isTool = activeTool === key;

            return (
              <div key={key} style={s.markerRow}>
                <button
                  title={`Select ${key} tool`}
                  onClick={() => {
                    setActiveTool(isTool ? null : key);
                    ghostRef.current = null;
                    redraw();
                  }}
                  style={{
                    ...s.badge,
                    background: isTool ? meta.color : meta.color + "33",
                    border: `2px solid ${isTool ? "#fff" : meta.color + "88"}`,
                    borderRadius: meta.shape === "circle" ? "50%" : "3px",
                    color: isTool ? "#fff" : meta.color,
                  }}
                >
                  {meta.label}
                </button>

                <span style={{ ...s.coords, opacity: isActive ? 1 : 0.28 }}>
                  {isActive && data
                    ? `${data.X.toFixed(1)}, ${data.Z.toFixed(1)}`
                    : "—"}
                </span>

                <button
                  onClick={() => toggleActive(key)}
                  disabled={!preset}
                  style={{
                    ...s.toggleBtn,
                    background: isActive ? "#2e2b28" : "transparent",
                    color: isActive ? meta.color : "#444",
                  }}
                >
                  {isActive ? "on" : "off"}
                </button>
              </div>
            );
          })}
        </div>

        <button
          style={s.resetBtn}
          onClick={() => {
            const currentMapId = preset?.MapID ?? 0;
            const currentName = preset?.Name ?? "New Preset";

            const clearedPreset: Preset = {
              Name: currentName,
              MapID: currentMapId,
              A: makeDefault("A"),
              B: makeDefault("B"),
              C: makeDefault("C"),
              D: makeDefault("D"),
              One: makeDefault("One"),
              Two: makeDefault("Two"),
              Three: makeDefault("Three"),
              Four: makeDefault("Four"),
            };

            setJsonText(presetToJson(clearedPreset));
            setJsonError(false);
            setActiveTool(null);
            ghostRef.current = null;

            setActivePresetIdx(0);
            redraw();
          }}
        >
          Reset all
        </button>
      </aside>

      <div style={s.main}>
        <div style={s.arenaWrap}>
          <canvas
            ref={canvasRef}
            style={{
              ...s.canvas,
              borderRadius: square ? "6px" : "50%",
              cursor: dragging ? "grabbing" : activeTool ? "none" : "default",
              opacity: preset ? 1 : 0.4,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          />
        </div>

        <div style={s.jsonPane}>
          <div style={s.jsonHeader}>
            <div style={s.jsonHeaderLeft}>
              <span style={s.jsonLabel}>json</span>
              {jsonError && <span style={s.errorBadge}>invalid JSON</span>}
            </div>
            <button style={s.copyBtn} onClick={copyJson}>
              {copied ? "copied" : "copy"}
            </button>
          </div>

          {isEditing ? (
            <textarea
              style={s.jsonTextarea}
              value={jsonText}
              onChange={handleJsonChange}
              onBlur={() => setIsEditing(false)}
              autoFocus
              spellCheck={false}
            />
          ) : (
            <pre
              style={{
                ...s.jsonPre,
                borderColor: jsonError ? "rgba(200,80,60,0.4)" : "transparent",
              }}
              onClick={() => setIsEditing(true)}
              title="Click to edit"
            >
              <code style={s.jsonCode}>{jsonText}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
