import { useModelStore } from '../store/modelStore'
import NumInput from './NumInput'
import type { ConcreteElement } from '../types'

export default function ConcreteEditor() {
  const { model, selectedId, updateConcrete, removeConcrete, setSelectedId,
          alignMode, alignElementId, startAlign, cancelAlign } = useModelStore()
  const el = model.concrete.find((c) => c.id === selectedId)
  if (!el) return null

  const update = (patch: Partial<ConcreteElement>) => updateConcrete(el.id, patch)

  return (
    <div className="border-t border-neutral-700 bg-neutral-900 p-3 flex flex-col gap-3 text-xs">
      {/* ── Header: name + visibility + delete ── */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={el.name}
          onChange={(e) => update({ name: e.target.value })}
          className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 focus:outline-none focus:border-neutral-500"
        />
        <button
          onClick={() => update({ visible: !el.visible })}
          title={el.visible ? 'Hide' : 'Show'}
          className={`w-7 h-7 flex items-center justify-center rounded border ${
            el.visible
              ? 'border-neutral-700 text-neutral-400 hover:text-neutral-200'
              : 'border-neutral-700 text-neutral-600 hover:text-neutral-400'
          }`}
        >
          {el.visible ? '◉' : '○'}
        </button>
        <button
          onClick={() => { removeConcrete(el.id); setSelectedId(null) }}
          title="Delete"
          className="w-7 h-7 flex items-center justify-center rounded border border-neutral-700 text-neutral-500 hover:text-red-400 hover:border-red-800"
        >
          ✕
        </button>
      </div>

      {/* ── Origin ── */}
      <div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Origin (mm)</p>
        <div className="grid grid-cols-3 gap-1.5">
          <NumInput label="X" value={el.origin[0]} onChange={(v) => update({ origin: [v, el.origin[1], el.origin[2]] })} />
          <NumInput label="Y" value={el.origin[1]} onChange={(v) => update({ origin: [el.origin[0], v, el.origin[2]] })} />
          <NumInput label="Z" value={el.origin[2]} onChange={(v) => update({ origin: [el.origin[0], el.origin[1], v] })} />
        </div>
      </div>

      {/* ── Dimensions ── */}
      <div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">
          {el.type === 'cylinder' ? 'Dimensions — ⌀=X  H=Z' : 'Dimensions (mm)'}
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <NumInput label="X" value={el.dimensions.x} onChange={(v) => update({ dimensions: { ...el.dimensions, x: v } })} />
          {el.type === 'box' && (
            <NumInput label="Y" value={el.dimensions.y} onChange={(v) => update({ dimensions: { ...el.dimensions, y: v } })} />
          )}
          <NumInput label="Z" value={el.dimensions.z} onChange={(v) => update({ dimensions: { ...el.dimensions, z: v } })} />
        </div>
      </div>

      {/* ── Rotation ── */}
      <div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Rotation (°)</p>
        <div className="grid grid-cols-3 gap-1.5">
          <NumInput label="X" value={el.rotation[0]} onChange={(v) => update({ rotation: [v, el.rotation[1], el.rotation[2]] })} />
          <NumInput label="Y" value={el.rotation[1]} onChange={(v) => update({ rotation: [el.rotation[0], v, el.rotation[2]] })} />
          <NumInput label="Z" value={el.rotation[2]} onChange={(v) => update({ rotation: [el.rotation[0], el.rotation[1], v] })} />
        </div>
      </div>

      {/* ── Color + Opacity ── */}
      <div className="flex gap-3 items-end">
        <label className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Color</span>
          <input
            type="color"
            value={el.color}
            onChange={(e) => update({ color: e.target.value })}
            className="w-9 h-7 rounded cursor-pointer border border-neutral-700 bg-neutral-800 p-0.5"
          />
        </label>
        <label className="flex-1 flex flex-col gap-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
            Opacity — {el.opacity.toFixed(2)}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={el.opacity}
            onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </label>
      </div>

      {/* ── Snap Align ── */}
      <div className="border-t border-neutral-800 pt-2">
        {alignMode === null ? (
          <button
            onClick={() => startAlign(el.id)}
            className="w-full py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300"
          >
            Snap Align…
          </button>
        ) : alignElementId === el.id ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400">
              {alignMode === 'source' ? 'Click source point in viewport…' : 'Click target point…'}
            </span>
            <button
              onClick={cancelAlign}
              className="text-xs text-neutral-500 hover:text-neutral-200 ml-2"
            >
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
