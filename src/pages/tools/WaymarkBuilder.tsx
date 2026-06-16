import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dutiesIndex from "../../../data/duties.json";
import {
  MARKER_META,
  TYPE_LABELS,
  TYPE_ORDER,
  WAYMARK_KEYS,
} from "./WaymarkBuilder/constants";
import { drawArena } from "./WaymarkBuilder/draw";
import {
  canvasToGame,
  clampToArena,
  gameToCanvas,
  getArenaGeometry,
} from "./WaymarkBuilder/geometry";
import {
  findDutyByPreset,
  makeDefault,
  makeDefaultPreset,
  parsePreset,
  presetToJson,
} from "./WaymarkBuilder/preset";
import type {
  ArenaGeometry,
  DutyEntry,
  Preset,
  WaymarkKey,
} from "./WaymarkBuilder/types";
import "./WaymarkBuilder.css";

const DEFAULT_SLUG = "ucob";
const dutyModules = import.meta.glob("../../../data/duty/**/*.json");

async function loadDuty(slug: string) {
  const duty = (dutiesIndex as DutyEntry[]).find((d) => d.slug === slug);
  if (!duty) throw new Error("duty not found");
  const key = `../../../data/duty/${duty.type}/${duty.slug}.json`;
  const importer = dutyModules[key];
  if (!importer) throw new Error("not found");
  const module = (await importer()) as { default: unknown };
  const data = module.default;
  const presetsList: Preset[] = Array.isArray((data as any).markers)
    ? (data as any).markers
    : (data as any).Name
      ? [data as Preset]
      : [];
  if (presetsList.length === 0) throw new Error("no markers");
  return { duty, presetsList };
}

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
  const [selectedSlug, setSelectedSlug] = useState<string>(DEFAULT_SLUG);
  const [availablePresets, setAvailablePresets] = useState<Preset[]>([]);
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [loadingFight, setLoadingFight] = useState(false);

  const ghostRef = useRef<{ gx: number; gz: number; key: WaymarkKey } | null>(
    null,
  );

  const preset = useMemo<Preset | null>(
    () => parsePreset(jsonText),
    [jsonText],
  );

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

  const applyDutyLoad = useCallback(
    (slug: string, duty: DutyEntry, presetsList: Preset[]) => {
      setSelectedSlug(slug);
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
    },
    [],
  );

  // load UCOB on mount
  useEffect(() => {
    setLoadingFight(true);
    loadDuty(DEFAULT_SLUG)
      .then(({ duty, presetsList }) =>
        applyDutyLoad(DEFAULT_SLUG, duty, presetsList),
      )
      .catch(() => {})
      .finally(() => setLoadingFight(false));
  }, [applyDutyLoad]);

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

  useEffect(() => {
    const observer = new MutationObserver(() => redraw());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [redraw]);

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

  const getCanvasPos = (
    e: React.PointerEvent,
  ): { cx: number; cy: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      cx: (e.clientX - rect.left) * (canvas.width / rect.width),
      cy: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!preset) return;
    const pos = getCanvasPos(e);
    if (!pos) return;
    const { cx, cy } = pos;
    const hit = hitTest(cx, cy);
    if (hit) {
      setDragging(hit);
      ghostRef.current = null;
      canvasRef.current?.setPointerCapture(e.pointerId);
      return;
    }
    if (activeTool) {
      const { gx, gz } = canvasToGame(cx, cy, sizeRef.current, geo);
      const clamped = clampToArena(gx, gz, geo, square, sizeRef.current);
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
    const pos = getCanvasPos(e);
    if (!pos) return;
    const { cx, cy } = pos;
    if (dragging && preset) {
      const { gx, gz } = canvasToGame(cx, cy, sizeRef.current, geo);
      const clamped = clampToArena(gx, gz, geo, square, sizeRef.current);
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
      const clamped = clampToArena(gx, gz, geo, square, sizeRef.current);
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
    const slug = e.target.value;
    if (!slug) return;
    setLoadingFight(true);
    try {
      const { duty, presetsList } = await loadDuty(slug);
      applyDutyLoad(slug, duty, presetsList);
    } catch {
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
    const matched = findDutyByPreset(parsed);
    if (matched) {
      setSelectedSlug(matched.slug);
      if (matched.shape) setSquare(matched.shape === "square");
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const activateEditing = () => setIsEditing(true);
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") setIsEditing(true);
  };

  return (
    <div className="wb-root">
      <aside className="wb-sidebar">
        <label htmlFor="wb-fight" className="wb-field-label">
          Duty
        </label>
        <select
          id="wb-fight"
          className="wb-select"
          value={selectedSlug}
          onChange={handleFightPick}
          disabled={loadingFight}
        >
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

        <label htmlFor="wb-preset-name" className="wb-field-label">
          Name
        </label>
        <input
          id="wb-preset-name"
          className="wb-input"
          type="text"
          value={preset?.Name ?? ""}
          disabled={!preset}
          onChange={(e) =>
            updatePreset((p) => ({ ...p, Name: e.target.value }))
          }
          spellCheck={false}
        />

        {availablePresets.length > 1 && (
          <>
            <label htmlFor="wb-preset-layout" className="wb-field-label">
              Preset layout
            </label>
            <select
              id="wb-preset-layout"
              className="wb-select"
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
                  {p.Name || `Layout ${index + 1}`}
                </option>
              ))}
            </select>
          </>
        )}

        <span className="wb-field-label">Map ID</span>
        <div className="wb-map-id">{preset?.MapID ?? "—"}</div>

        <span className="wb-field-label">Arena shape</span>
        <div className="wb-shape-toggle">
          <button
            type="button"
            className={`wb-shape-btn${square ? "" : " active"}`}
            onClick={() => setSquare(false)}
          >
            Circle
          </button>
          <button
            type="button"
            className={`wb-shape-btn${square ? " active" : ""}`}
            onClick={() => setSquare(true)}
          >
            Square
          </button>
        </div>

        <div className="wb-marker-grid">
          {WAYMARK_KEYS.map((key) => {
            const meta = MARKER_META[key];
            const data = preset?.[key];
            const isActive = data?.Active ?? false;
            const isTool = activeTool === key;
            return (
              <div key={key} className="wb-marker-row">
                <button
                  type="button"
                  title={`Select ${key} tool`}
                  onClick={() => {
                    setActiveTool(isTool ? null : key);
                    ghostRef.current = null;
                    redraw();
                  }}
                  className="wb-badge"
                  style={{
                    background: isTool ? meta.color : `${meta.color}33`,
                    border: `2px solid ${isTool ? "#fff" : `${meta.color}88`}`,
                    borderRadius: meta.shape === "circle" ? "50%" : "3px",
                    color: isTool ? "#fff" : meta.color,
                  }}
                >
                  {meta.label}
                </button>
                <span
                  className="wb-coords"
                  style={{ opacity: isActive ? 1 : 0.28 }}
                >
                  {isActive && data
                    ? `${data.X.toFixed(1)}, ${data.Z.toFixed(1)}`
                    : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleActive(key)}
                  disabled={!preset}
                  className="wb-toggle-btn"
                  style={{
                    color: isActive ? meta.color : "var(--text-d)",
                  }}
                >
                  {isActive ? "on" : "off"}
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="wb-reset-btn"
          onClick={() => {
            const clearedPreset: Preset = {
              Name: preset?.Name ?? "New Preset",
              MapID: preset?.MapID ?? 0,
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

        <button type="button" className="wb-reset-btn" onClick={copyJson}>
          {copied ? "copied" : "copy json"}
        </button>

        <div className="wb-json-pane">
          <div className="wb-json-header">
            <div className="wb-json-header-left">
              <span className="wb-json-label">json</span>
              {jsonError && (
                <span className="wb-error-badge">invalid JSON</span>
              )}
            </div>
          </div>
          {isEditing ? (
            <textarea
              className="wb-json-textarea"
              value={jsonText}
              onChange={handleJsonChange}
              onBlur={() => setIsEditing(false)}
              // biome-ignore lint/a11y/noAutofocus: intentional — user clicked to edit
              autoFocus
              spellCheck={false}
            />
          ) : (
            <pre
              className="wb-json-pre"
              style={{
                borderColor: jsonError
                  ? "var(--callout-caution-border)"
                  : "transparent",
              }}
              onClick={activateEditing}
              onKeyDown={handleEditKeyDown}
              // biome-ignore lint/a11y/useSemanticElements: <pre> is intentional for monospace JSON display
              role="button"
              tabIndex={0}
              title="Click to edit"
            >
              <code className="wb-json-code">{jsonText}</code>
            </pre>
          )}
        </div>
      </aside>

      <div className="wb-main">
        <div className="wb-arena-wrap">
          <canvas
            ref={canvasRef}
            className="wb-canvas"
            style={{
              cursor: dragging ? "grabbing" : activeTool ? "none" : "default",
              opacity: preset ? 1 : 0.4,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          />
        </div>
      </div>
    </div>
  );
}
