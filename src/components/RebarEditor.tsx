import { useModelStore } from '../store/modelStore'
import NumInput from './NumInput'
import type { RebarGroup, RebarShape, RebarArray } from '../types'

export default function RebarEditor() {
  const { model, selectedId, updateRebarGroup, removeRebarGroup, duplicateRebarGroup, setSelectedId } = useModelStore()
  const g = model.rebarGroups.find((r) => r.id === selectedId)
  if (!g) return null

  const update = (patch: Partial<RebarGroup>) => updateRebarGroup(g.id, patch)
  const updateShape = (patch: Partial<RebarShape>) => update({ shape: { ...g.shape, ...patch } })
  const updateArray = (patch: Partial<RebarArray>) => update({ array: { ...g.array, ...patch } as RebarArray })

  // ── Path helpers ────────────────────────────────────────────────────────────
  const setPoint = (i: number, uv: [number, number]) => {
    const path = g.shape.path.map((p, idx) => (idx === i ? uv : p))
    updateShape({ path })
  }
  const addPoint = () => {
    const last = g.shape.path[g.shape.path.length - 1] ?? [0, 0]
    updateShape({ path: [...g.shape.path, [last[0], last[1]]] })
  }
  const removePoint = (i: number) => {
    if (g.shape.path.length <= 2) return
    const path = g.shape.path.filter((_, idx) => idx !== i)
    const anchor = g.shape.anchorIndex >= path.length ? path.length - 1 : g.shape.anchorIndex
    updateShape({ path, anchorIndex: anchor })
  }

  // ── Linear array dir helpers ─────────────────────────────────────────────
  const linearDirs = g.array.type === 'linear' ? g.array.dirs : []
  const setDir = (i: number, patch: Partial<(typeof linearDirs)[0]>) => {
    if (g.array.type !== 'linear') return
    const dirs = g.array.dirs.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
    updateArray({ type: 'linear', dirs })
  }
  const addDir = () => {
    if (g.array.type !== 'linear') return
    updateArray({ type: 'linear', dirs: [...g.array.dirs, { axis: 'X' as const, spacing: 200, count: 2 }] })
  }
  const removeDir = (i: number) => {
    if (g.array.type !== 'linear') return
    if (g.array.dirs.length <= 1) return
    updateArray({ type: 'linear', dirs: g.array.dirs.filter((_, idx) => idx !== i) })
  }

  const planeLabels: Record<RebarShape['plane'], [string, string]> = {
    XY: ['X', 'Y'], XZ: ['X', 'Z'], YZ: ['Y', 'Z'],
  }
  const [uLabel, vLabel] = planeLabels[g.shape.plane]

  return (
    <div className="border-t border-neutral-700 bg-neutral-900 p-3 flex flex-col gap-3 text-xs">

      {/* ── Header ── */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={g.name}
          onChange={(e) => update({ name: e.target.value })}
          className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 focus:outline-none focus:border-neutral-500"
        />
        <button
          onClick={() => update({ visible: !g.visible })}
          title={g.visible ? 'Hide' : 'Show'}
          className={`w-7 h-7 flex items-center justify-center rounded border ${
            g.visible ? 'border-neutral-700 text-neutral-400 hover:text-neutral-200'
                      : 'border-neutral-700 text-neutral-600 hover:text-neutral-400'
          }`}
        >
          {g.visible ? '◉' : '○'}
        </button>
        <button
          onClick={() => duplicateRebarGroup(g.id)}
          title="Duplicate"
          className="w-7 h-7 flex items-center justify-center rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200"
        >
          ⧉
        </button>
        <button
          onClick={() => { removeRebarGroup(g.id); setSelectedId(null) }}
          title="Delete"
          className="w-7 h-7 flex items-center justify-center rounded border border-neutral-700 text-neutral-500 hover:text-red-400 hover:border-red-800"
        >
          ✕
        </button>
      </div>

      {/* ── Color ── */}
      <label className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Color</span>
        <input
          type="color"
          value={g.color}
          onChange={(e) => update({ color: e.target.value })}
          className="w-9 h-7 rounded cursor-pointer border border-neutral-700 bg-neutral-800 p-0.5"
        />
      </label>

      {/* ── Origin ── */}
      <div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Origin (mm)</p>
        <div className="grid grid-cols-3 gap-1.5">
          <NumInput label="X" value={g.origin[0]} onChange={(v) => update({ origin: [v, g.origin[1], g.origin[2]] })} />
          <NumInput label="Y" value={g.origin[1]} onChange={(v) => update({ origin: [g.origin[0], v, g.origin[2]] })} />
          <NumInput label="Z" value={g.origin[2]} onChange={(v) => update({ origin: [g.origin[0], g.origin[1], v] })} />
        </div>
      </div>

      {/* ══ Shape ══ */}
      <div className="border-t border-neutral-800 pt-2 flex flex-col gap-2">
        <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Shape</p>

        {/* Plane + Anchor */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-neutral-500 shrink-0">Plane</span>
          {(['XY', 'XZ', 'YZ'] as const).map((pl) => (
            <button
              key={pl}
              onClick={() => updateShape({ plane: pl })}
              className={`px-2 py-0.5 rounded border text-[10px] ${
                g.shape.plane === pl
                  ? 'border-blue-600 text-blue-400 bg-blue-950'
                  : 'border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {pl}
            </button>
          ))}
          <span className="ml-auto text-neutral-500 shrink-0">Anchor</span>
          <select
            value={g.shape.anchorCustom ? 'custom' : String(g.shape.anchorIndex)}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                // default custom to first path point
                const p = g.shape.path[g.shape.anchorIndex] ?? [0, 0]
                updateShape({ anchorCustom: [p[0], p[1]] })
              } else {
                updateShape({ anchorIndex: Number(e.target.value), anchorCustom: undefined })
              }
            }}
            className="bg-neutral-800 border border-neutral-700 rounded px-1 py-0.5 text-neutral-200 text-[10px]"
          >
            {g.shape.path.map((_, i) => (
              <option key={i} value={i}>#{i}</option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Custom anchor coords */}
        {g.shape.anchorCustom && (
          <div className="flex gap-1.5 items-center">
            <span className="text-[10px] text-neutral-500 shrink-0">Custom ({uLabel}/{vLabel})</span>
            <NumInput
              label={uLabel}
              value={g.shape.anchorCustom[0]}
              onChange={(v) => updateShape({ anchorCustom: [v, g.shape.anchorCustom![1]] })}
            />
            <NumInput
              label={vLabel}
              value={g.shape.anchorCustom[1]}
              onChange={(v) => updateShape({ anchorCustom: [g.shape.anchorCustom![0], v] })}
            />
          </div>
        )}

        {/* Path points */}
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-1 items-center text-[10px] text-neutral-500 px-1">
            <span />
            <span>{uLabel}</span>
            <span>{vLabel}</span>
            <span />
          </div>
          {g.shape.path.map((pt, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-1 items-center">
              <span className="text-[10px] text-neutral-600 w-5 text-right">#{i}</span>
              <NumInput
                label=""
                value={pt[0]}
                onChange={(v) => setPoint(i, [v, pt[1]])}
              />
              <NumInput
                label=""
                value={pt[1]}
                onChange={(v) => setPoint(i, [pt[0], v])}
              />
              <button
                onClick={() => removePoint(i)}
                disabled={g.shape.path.length <= 2}
                className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-red-400 disabled:opacity-30"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addPoint}
            className="text-[10px] text-neutral-500 hover:text-neutral-200 text-left px-1 mt-0.5"
          >
            + Add point
          </button>
        </div>
      </div>

      {/* ══ Array ══ */}
      <div className="border-t border-neutral-800 pt-2 flex flex-col gap-2">
        <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Array</p>

        {/* Type selector */}
        <div className="flex gap-1 flex-wrap">
          {(['single', 'linear', 'circular', 'spiral'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === g.array.type) return
                if (t === 'single') update({ array: { type: 'single' } })
                else if (t === 'linear') update({ array: { type: 'linear', dirs: [{ axis: 'X', spacing: 200, count: 2 }] } })
                else if (t === 'circular') update({ array: { type: 'circular', axis: 'Z', center: [0, 0], count: 6, totalAngle: 360 } })
                else update({ array: { type: 'spiral', axis: 'Z', center: [0, 0], radius: 200, pitch: 200, turns: 5, startZ: 0 } })
              }}
              className={`px-2 py-0.5 rounded border text-[10px] capitalize ${
                g.array.type === t
                  ? 'border-blue-600 text-blue-400 bg-blue-950'
                  : 'border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Linear params */}
        {g.array.type === 'linear' && (
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-[2rem_1fr_1fr_auto] gap-1 text-[10px] text-neutral-500 px-1">
              <span>Axis</span><span>Spacing</span><span>Count</span><span />
            </div>
            {g.array.dirs.map((d, i) => (
              <div key={i} className="grid grid-cols-[2rem_1fr_1fr_auto] gap-1 items-center">
                <select
                  value={d.axis}
                  onChange={(e) => setDir(i, { axis: e.target.value as 'X' | 'Y' | 'Z' })}
                  className="bg-neutral-800 border border-neutral-700 rounded px-1 py-0.5 text-neutral-200 text-[10px]"
                >
                  <option>X</option><option>Y</option><option>Z</option>
                </select>
                <NumInput label="" value={d.spacing} onChange={(v) => setDir(i, { spacing: v })} />
                <NumInput label="" value={d.count} onChange={(v) => setDir(i, { count: Math.max(1, Math.round(v)) })} />
                <button
                  onClick={() => removeDir(i)}
                  disabled={g.array.type === 'linear' && g.array.dirs.length <= 1}
                  className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-red-400 disabled:opacity-30"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addDir}
              className="text-[10px] text-neutral-500 hover:text-neutral-200 text-left px-1"
            >
              + Add direction
            </button>
          </div>
        )}

        {/* Circular params */}
        {g.array.type === 'circular' && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 shrink-0">Axis</span>
              {(['X', 'Y', 'Z'] as const).map((ax) => (
                <button
                  key={ax}
                  onClick={() => updateArray({ axis: ax })}
                  className={`px-2 py-0.5 rounded border text-[10px] ${
                    g.array.type === 'circular' && g.array.axis === ax
                      ? 'border-blue-600 text-blue-400 bg-blue-950'
                      : 'border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {ax}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <NumInput label="Center U" value={g.array.center[0]} onChange={(v) => g.array.type === 'circular' && updateArray({ center: [v, g.array.center[1]] })} />
              <NumInput label="Center V" value={g.array.center[1]} onChange={(v) => g.array.type === 'circular' && updateArray({ center: [g.array.center[0], v] })} />
              <NumInput label="Count" value={g.array.count} onChange={(v) => updateArray({ count: Math.max(2, Math.round(v)) })} />
              <NumInput label="Angle °" value={g.array.totalAngle} onChange={(v) => updateArray({ totalAngle: v })} />
            </div>
          </div>
        )}

        {/* Spiral params */}
        {g.array.type === 'spiral' && (
          <div className="grid grid-cols-2 gap-1.5">
            <NumInput label="Center X" value={g.array.center[0]} onChange={(v) => g.array.type === 'spiral' && updateArray({ center: [v, g.array.center[1]] })} />
            <NumInput label="Center Y" value={g.array.center[1]} onChange={(v) => g.array.type === 'spiral' && updateArray({ center: [g.array.center[0], v] })} />
            <NumInput label="Radius" value={g.array.radius} onChange={(v) => updateArray({ radius: v })} />
            <NumInput label="Pitch" value={g.array.pitch} onChange={(v) => updateArray({ pitch: v })} />
            <NumInput label="Turns" value={g.array.turns} onChange={(v) => updateArray({ turns: Math.max(0.1, v) })} />
            <NumInput label="Start Z" value={g.array.startZ} onChange={(v) => updateArray({ startZ: v })} />
          </div>
        )}
      </div>
    </div>
  )
}
