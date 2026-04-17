# Phase 2 — Concrete Element Management

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users add, edit, and delete concrete elements from the side panel, with all changes reflected live in the 3D viewport.

**Architecture:** Three new components are added. `NumInput` is a reusable styled number field. `ConcreteEditor` reads the selected concrete element from the Zustand store and writes patches back via `updateConcrete`. `ConcreteList` gains an "+ Add" dropdown; `SidePanel` gains awareness of which section is selected so it can show the editor below the list.

**Tech Stack:** React 18, Zustand 4, Tailwind CSS 3 — no new dependencies.

---

## File Map

| Path | Change |
|---|---|
| Create `src/components/NumInput.tsx` | Reusable labelled number `<input>` used throughout the editor |
| Create `src/components/ConcreteEditor.tsx` | Full property editor for one ConcreteElement (reads/writes store) |
| Modify `src/components/ConcreteList.tsx` | Add "+ Add" button with Box / Cylinder dropdown |
| Modify `src/components/SidePanel.tsx` | Render `<ConcreteEditor>` when a concrete item is selected |

The store (`src/store/modelStore.ts`) already has all needed actions (`updateConcrete`, `addConcrete`, `removeConcrete`). No store changes needed.

---

## Task 1 — NumInput Component

**Files:**
- Create: `src/components/NumInput.tsx`

- [ ] **Step 1.1 — Write `src/components/NumInput.tsx`**

```tsx
interface NumInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
}

/** Compact labelled number field used in property editors. */
export default function NumInput({ label, value, onChange, step = 1, min, max }: NumInputProps) {
  return (
    <label className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] text-neutral-500 uppercase tracking-wide">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v)) onChange(v)
        }}
        className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  )
}
```

- [ ] **Step 1.2 — Commit**

```bash
git add src/components/NumInput.tsx
git commit -m "feat: add NumInput reusable component"
```

---

## Task 2 — ConcreteEditor Component

**Files:**
- Create: `src/components/ConcreteEditor.tsx`

Depends on: Task 1 (NumInput), existing store actions.

The editor renders only when `selectedId` matches a concrete element. It shows:
- Header row: editable name, eye-toggle visibility button, delete button
- Origin X/Y/Z (always at top per spec)
- Dimensions X/Y/Z (for cylinder, label clarifies ⌀=X H=Z and Y field is hidden)
- Rotation X/Y/Z in degrees
- Color picker + Opacity slider on the same row

- [ ] **Step 2.1 — Write `src/components/ConcreteEditor.tsx`**

```tsx
import { useModelStore } from '../store/modelStore'
import NumInput from './NumInput'
import type { ConcreteElement } from '../types'

export default function ConcreteEditor() {
  const { model, selectedId, updateConcrete, removeConcrete, setSelectedId } = useModelStore()
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
    </div>
  )
}
```

- [ ] **Step 2.2 — Commit**

```bash
git add src/components/ConcreteEditor.tsx
git commit -m "feat: add ConcreteEditor property panel"
```

---

## Task 3 — Add "+ Add" Button to ConcreteList

**Files:**
- Modify: `src/components/ConcreteList.tsx`

Add a "+ Add" button in the section header that opens a two-item dropdown (Box / Cylinder). When an item is clicked, a new `ConcreteElement` with sensible defaults is created via `addConcrete`, and it's immediately selected so the editor opens.

The complete replacement for `src/components/ConcreteList.tsx`:

- [ ] **Step 3.1 — Overwrite `src/components/ConcreteList.tsx`**

Read the file first, then replace entirely with:

```tsx
import { useState } from 'react'
import { useModelStore } from '../store/modelStore'
import type { ConcreteElement } from '../types'

export default function ConcreteList() {
  const { model, selectedId, setSelectedId, addConcrete } = useModelStore()
  const [open, setOpen] = useState(true)
  const [adding, setAdding] = useState(false)

  const handleAdd = (type: 'box' | 'cylinder') => {
    const id = `concrete_${Date.now()}`
    const el: ConcreteElement = {
      id,
      name: type === 'box' ? 'New Box' : 'New Cylinder',
      type,
      origin: [0, 0, 0],
      dimensions: type === 'box'
        ? { x: 400, y: 400, z: 1000 }
        : { x: 400, y: 400, z: 1000 },
      rotation: [0, 0, 0],
      color: '#6b7280',
      opacity: 0.3,
      visible: true,
    }
    addConcrete(el)
    setSelectedId(id)
    setAdding(false)
  }

  return (
    <section className="relative">
      {/* Section header */}
      <div className="flex items-center">
        <button
          className="flex-1 flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-200"
          onClick={() => setOpen((o) => !o)}
        >
          <span>Concrete</span>
          <span>{open ? '▾' : '▸'}</span>
        </button>
        {/* "+ Add" button */}
        <div className="relative">
          <button
            onClick={() => setAdding((a) => !a)}
            className="px-2 py-2 text-neutral-500 hover:text-neutral-200 text-sm leading-none"
            title="Add concrete element"
          >
            +
          </button>
          {adding && (
            <>
              {/* Click-outside overlay */}
              <div className="fixed inset-0 z-10" onClick={() => setAdding(false)} />
              <div className="absolute right-0 top-full z-20 bg-neutral-800 border border-neutral-700 rounded shadow-lg overflow-hidden min-w-[120px]">
                <button
                  onClick={() => handleAdd('box')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700"
                >
                  Box
                </button>
                <button
                  onClick={() => handleAdd('cylinder')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700"
                >
                  Cylinder
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {open && (
        <ul>
          {model.concrete.length === 0 && (
            <li className="px-4 py-1 text-xs text-neutral-600 italic">— empty —</li>
          )}
          {model.concrete.map((el) => (
            <li
              key={el.id}
              onClick={() => setSelectedId(selectedId === el.id ? null : el.id)}
              className={`px-4 py-1.5 text-xs cursor-pointer flex items-center gap-2 ${
                selectedId === el.id
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: el.color }}
              />
              {el.name}
              {!el.visible && <span className="ml-auto text-neutral-600">hidden</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
```

- [ ] **Step 3.2 — Commit**

```bash
git add src/components/ConcreteList.tsx
git commit -m "feat: add '+ Add' dropdown to ConcreteList"
```

---

## Task 4 — Wire ConcreteEditor into SidePanel

**Files:**
- Modify: `src/components/SidePanel.tsx`

`SidePanel` needs to:
1. Read `selectedId` and `model.concrete` from the store
2. Determine if the selected item is a concrete element
3. Render `<ConcreteEditor />` just below `<ConcreteList />` when a concrete element is selected

The complete replacement for `src/components/SidePanel.tsx`:

- [ ] **Step 4.1 — Overwrite `src/components/SidePanel.tsx`**

Read the file first, then replace entirely with:

```tsx
import { useModelStore } from '../store/modelStore'
import ConcreteList from './ConcreteList'
import ConcreteEditor from './ConcreteEditor'
import RebarGroupList from './RebarGroupList'

export default function SidePanel() {
  const { model, selectedId } = useModelStore()
  const isConcreteSelected = model.concrete.some((el) => el.id === selectedId)

  return (
    <aside className="w-72 shrink-0 bg-neutral-950 border-l border-neutral-800 flex flex-col overflow-y-auto">
      <ConcreteList />
      {isConcreteSelected && <ConcreteEditor />}
      <div className="border-t border-neutral-800" />
      <RebarGroupList />
    </aside>
  )
}
```

- [ ] **Step 4.2 — TypeScript check**

```bash
cd "C:/Local Files/0_Github/3D_Rebar_Detail" && npx tsc --noEmit 2>&1
```

Expected: no output (zero errors).

- [ ] **Step 4.3 — Commit**

```bash
git add src/components/SidePanel.tsx
git commit -m "feat: show ConcreteEditor in SidePanel when concrete item selected"
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|---|---|
| "+ Add Concrete" button, dropdown Box/Cylinder | Task 3 |
| Click object tree item → open property panel | Task 4 (SidePanel wires it) |
| Name field (text) | Task 2 |
| Origin X/Y/Z in card header (always visible) | Task 2 |
| Dimensions X/Y/Z | Task 2 |
| Rotation X/Y/Z | Task 2 |
| Color (color picker) | Task 2 |
| Opacity (slider 0–1) | Task 2 |
| Visible (eye icon toggle) | Task 2 |
| Delete button | Task 2 |
| Changes reflected live in 3D | Already wired — Zustand → Viewport useEffect |

### Placeholder Scan
No TBDs or incomplete steps.

### Type Consistency
- `ConcreteElement` imported in both ConcreteEditor and ConcreteList from `../types` — matches store type.
- `updateConcrete(id, patch: Partial<ConcreteElement>)` — used consistently.
- `addConcrete(el: ConcreteElement)` — full object provided in Task 3.
- `NumInput` props: `label: string`, `value: number`, `onChange: (v: number) => void` — used correctly everywhere in ConcreteEditor.
