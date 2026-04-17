# 3D Rebar Detail Tool — Phase 1 Skeleton

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a running Vite+React+TS+Three.js app with a 3D viewport, a dark sidebar object tree, sample model rendering (concrete box + rebar), and JSON import/export plus base64 shortcode copy/load.

**Architecture:** Single-page app, no backend. Zustand holds the Model JSON in memory; a Three.js scene manager subscribes to store changes and re-renders imperatively. The sidebar is pure React reading the same store. IO utilities (serialize / shortcode) are pure functions with no side effects.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, Three.js r165, Zustand 4, pako 2

---

## File Map

| Path | Responsibility |
|---|---|
| `package.json` | deps: three, @types/three, react, react-dom, zustand, pako, @types/pako, tailwindcss, postcss, autoprefixer, vite, @vitejs/plugin-react |
| `vite.config.ts` | Vite config with React plugin |
| `tsconfig.json` | strict TS, paths |
| `tailwind.config.js` | dark mode class, content paths |
| `postcss.config.js` | tailwind + autoprefixer |
| `index.html` | root mount point |
| `src/main.tsx` | ReactDOM.createRoot |
| `src/App.tsx` | Layout shell: TopBar + Viewport + SidePanel |
| `src/types.ts` | All TS interfaces (Model, ConcreteElement, RebarGroup, RebarShape, RebarArray) |
| `src/examples/sampleModel.ts` | Hard-coded Model with 1 box column + 4 main bars (linear) |
| `src/store/modelStore.ts` | Zustand store: model state, setModel, updateConcrete, updateRebarGroup, selectedId, setSelectedId |
| `src/io/serialize.ts` | exportJSON(model), importJSON(text): Model |
| `src/io/shortcode.ts` | encode(model): string, decode(s): Model — pako deflate/inflate + base64 |
| `src/three/scene.ts` | SceneManager class: init, dispose, setModel, setSelected — owns renderer/camera/controls/animLoop |
| `src/three/helpers.ts` | buildGrid(), buildAxisGizmo() — returns Three.js objects |
| `src/three/concreteRenderer.ts` | buildConcreteMeshes(elements): THREE.Group — box/cylinder + EdgesGeometry |
| `src/three/rebarRenderer.ts` | buildRebarMeshes(groups): THREE.Group — expands arrays, TubeGeometry |
| `src/components/Viewport.tsx` | `<canvas>` host; creates SceneManager on mount; subscribes to store |
| `src/components/TopBar.tsx` | New / Open / Save / Copy Code / Load Code buttons |
| `src/components/SidePanel.tsx` | Scrollable right panel; renders ConcreteList + RebarGroupList |
| `src/components/ConcreteList.tsx` | Collapsible section listing concrete elements |
| `src/components/RebarGroupList.tsx` | Collapsible section listing rebar groups |

---

## Task 1 — Project Scaffold

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx` (stub)

- [ ] **Step 1.1 — Write `package.json`**

```json
{
  "name": "3d-rebar-detail",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pako": "^2.1.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.165.0",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@types/pako": "^2.0.3",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.165.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.5.3",
    "vite": "^5.3.4"
  }
}
```

- [ ] **Step 1.2 — Write `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 1.3 — Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 1.4 — Write `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 1.5 — Write `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 1.6 — Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>3D Rebar Detail</title>
  </head>
  <body class="bg-neutral-950 text-neutral-100 h-screen overflow-hidden">
    <div id="root" class="h-full"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 1.7 — Write `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 1.8 — Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 1.9 — Write stub `src/App.tsx`**

```tsx
export default function App() {
  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100">
      <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 text-sm">
        Top Bar (stub)
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-neutral-900">Viewport (stub)</div>
        <div className="w-72 bg-neutral-950 border-l border-neutral-800">Side Panel (stub)</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 1.10 — Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 1.11 — Verify dev server starts**

```bash
npm run dev
```

Expected: Vite prints local URL, browser shows dark layout with stubs.

- [ ] **Step 1.12 — Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite+React+TS+Tailwind project"
```

---

## Task 2 — Type Definitions

**Files:** Create `src/types.ts`

- [ ] **Step 2.1 — Write `src/types.ts`**

```typescript
// Core domain types for the 3D Rebar Detail tool.
// All spatial values are in millimetres (mm).

export interface Model {
  version: '1.0';
  units: 'mm';
  concrete: ConcreteElement[];
  rebarGroups: RebarGroup[];
}

export interface ConcreteElement {
  id: string;
  name: string;
  type: 'box' | 'cylinder';
  /** Base-point in world space [x, y, z] */
  origin: [number, number, number];
  /** box: x/y/z are three edge lengths; cylinder: x=diameter, z=height, y ignored */
  dimensions: { x: number; y: number; z: number };
  /** Euler angles in degrees */
  rotation: [number, number, number];
  color: string;
  opacity: number;
  visible: boolean;
}

export interface RebarGroup {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  /** World-space reference origin for this group */
  origin: [number, number, number];
  shape: RebarShape;
  array: RebarArray;
}

export interface RebarShape {
  plane: 'XY' | 'XZ' | 'YZ';
  /** 2-D path points in the chosen plane, connected as a polyline */
  path: [number, number][];
  /** Index into path[] that maps to the group origin */
  anchorIndex: number;
}

export type RebarArray =
  | { type: 'single' }
  | {
      type: 'linear';
      dirs: {
        axis: 'X' | 'Y' | 'Z';
        spacing: number;
        count: number;
      }[];
    }
  | {
      type: 'circular';
      axis: 'X' | 'Y' | 'Z';
      center: [number, number];
      count: number;
      totalAngle: number;
    }
  | {
      type: 'spiral';
      axis: 'Z';
      center: [number, number];
      radius: number;
      pitch: number;
      turns: number;
      startZ: number;
    };
```

- [ ] **Step 2.2 — Commit**

```bash
git add src/types.ts
git commit -m "feat: add core type definitions"
```

---

## Task 3 — Sample Model

**Files:** Create `src/examples/sampleModel.ts`

- [ ] **Step 3.1 — Write `src/examples/sampleModel.ts`**

This represents a 400×400×3000 mm concrete column with 4 main bars (Ø25) arranged in a 2×2 linear grid at the column corners, plus a single closed stirrup.

```typescript
import type { Model } from '../types'

export const sampleModel: Model = {
  version: '1.0',
  units: 'mm',
  concrete: [
    {
      id: 'concrete_1',
      name: 'Column C1',
      type: 'box',
      origin: [0, 0, 0],
      dimensions: { x: 400, y: 400, z: 3000 },
      rotation: [0, 0, 0],
      color: '#9ca3af',
      opacity: 0.25,
      visible: true,
    },
  ],
  rebarGroups: [
    {
      // 4 corner main bars: single bar shape + 2-direction linear array
      id: 'rebar_1',
      name: 'Main Bars T1',
      visible: true,
      color: '#f59e0b',
      origin: [-150, -150, 50],   // bottom-left corner, 50 mm cover
      shape: {
        plane: 'XZ',
        // vertical straight bar: from z=0 to z=2900 (50 mm top cover)
        path: [[0, 0], [0, 2900]],
        anchorIndex: 0,
      },
      array: {
        type: 'linear',
        dirs: [
          { axis: 'X', spacing: 300, count: 2 },
          { axis: 'Y', spacing: 300, count: 2 },
        ],
      },
    },
    {
      // Rectangular stirrup at mid-height (illustrative single instance)
      id: 'rebar_2',
      name: 'Stirrups',
      visible: true,
      color: '#34d399',
      origin: [-150, -150, 100],
      shape: {
        plane: 'XY',
        // Closed rectangle 300×300 mm
        path: [[0, 0], [300, 0], [300, 300], [0, 300], [0, 0]],
        anchorIndex: 0,
      },
      array: {
        type: 'linear',
        dirs: [
          { axis: 'Z', spacing: 200, count: 14 },
        ],
      },
    },
  ],
}
```

- [ ] **Step 3.2 — Commit**

```bash
git add src/examples/sampleModel.ts
git commit -m "feat: add sample model (column + main bars + stirrups)"
```

---

## Task 4 — Zustand Store

**Files:** Create `src/store/modelStore.ts`

- [ ] **Step 4.1 — Write `src/store/modelStore.ts`**

```typescript
import { create } from 'zustand'
import type { Model, ConcreteElement, RebarGroup } from '../types'
import { sampleModel } from '../examples/sampleModel'

interface ModelStore {
  model: Model
  selectedId: string | null

  setModel: (m: Model) => void
  setSelectedId: (id: string | null) => void

  updateConcrete: (id: string, patch: Partial<ConcreteElement>) => void
  addConcrete: (el: ConcreteElement) => void
  removeConcrete: (id: string) => void

  updateRebarGroup: (id: string, patch: Partial<RebarGroup>) => void
  addRebarGroup: (g: RebarGroup) => void
  removeRebarGroup: (id: string) => void
}

export const useModelStore = create<ModelStore>((set) => ({
  model: sampleModel,
  selectedId: null,

  setModel: (m) => set({ model: m }),
  setSelectedId: (id) => set({ selectedId: id }),

  updateConcrete: (id, patch) =>
    set((s) => ({
      model: {
        ...s.model,
        concrete: s.model.concrete.map((el) =>
          el.id === id ? { ...el, ...patch } : el
        ),
      },
    })),

  addConcrete: (el) =>
    set((s) => ({
      model: { ...s.model, concrete: [...s.model.concrete, el] },
    })),

  removeConcrete: (id) =>
    set((s) => ({
      model: {
        ...s.model,
        concrete: s.model.concrete.filter((el) => el.id !== id),
      },
    })),

  updateRebarGroup: (id, patch) =>
    set((s) => ({
      model: {
        ...s.model,
        rebarGroups: s.model.rebarGroups.map((g) =>
          g.id === id ? { ...g, ...patch } : g
        ),
      },
    })),

  addRebarGroup: (g) =>
    set((s) => ({
      model: { ...s.model, rebarGroups: [...s.model.rebarGroups, g] },
    })),

  removeRebarGroup: (id) =>
    set((s) => ({
      model: {
        ...s.model,
        rebarGroups: s.model.rebarGroups.filter((g) => g.id !== id),
      },
    })),
}))
```

- [ ] **Step 4.2 — Commit**

```bash
git add src/store/modelStore.ts
git commit -m "feat: add Zustand model store"
```

---

## Task 5 — IO Utilities

**Files:** Create `src/io/serialize.ts`, `src/io/shortcode.ts`

- [ ] **Step 5.1 — Write `src/io/serialize.ts`**

```typescript
import type { Model } from '../types'

/** Trigger a JSON file download in the browser. */
export function exportJSON(model: Model): void {
  const json = JSON.stringify(model, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rebar-model.json'
  a.click()
  URL.revokeObjectURL(url)
}

/** Parse a JSON string into a Model. Throws on invalid input. */
export function importJSON(text: string): Model {
  const parsed = JSON.parse(text) as Model
  if (parsed.version !== '1.0') throw new Error('Unsupported model version')
  return parsed
}
```

- [ ] **Step 5.2 — Write `src/io/shortcode.ts`**

```typescript
import pako from 'pako'
import type { Model } from '../types'

/** Compress model to a URL-safe base64 shortcode string. */
export function encode(model: Model): string {
  const json = JSON.stringify(model)
  const compressed = pako.deflate(json)
  // Convert Uint8Array to base64
  let binary = ''
  compressed.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

/** Decompress a shortcode string back into a Model. Throws on failure. */
export function decode(code: string): Model {
  const binary = atob(code)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  const json = pako.inflate(bytes, { to: 'string' })
  const parsed = JSON.parse(json) as Model
  if (parsed.version !== '1.0') throw new Error('Unsupported model version')
  return parsed
}
```

- [ ] **Step 5.3 — Commit**

```bash
git add src/io/serialize.ts src/io/shortcode.ts
git commit -m "feat: add JSON and shortcode IO utilities"
```

---

## Task 6 — Three.js Helpers (Grid + Gizmo)

**Files:** Create `src/three/helpers.ts`

- [ ] **Step 6.1 — Write `src/three/helpers.ts`**

```typescript
import * as THREE from 'three'

/**
 * Build a world-space floor grid (grey lines, 10 m × 10 m, 500 mm cells).
 * The grid lies in the XY plane; Z is up.
 */
export function buildGrid(): THREE.GridHelper {
  // GridHelper lies in the XZ plane by default; rotate so it lies in XY
  const grid = new THREE.GridHelper(10000, 20, 0x374151, 0x1f2937)
  grid.rotation.x = Math.PI / 2
  return grid
}

/**
 * Build a small axis-indicator group (X=red, Y=green, Z=blue arrows).
 * Place this in a separate fixed-size overlay camera or simply in the
 * bottom-left corner of the scene.
 */
export function buildAxisGizmo(): THREE.Group {
  const group = new THREE.Group()
  const length = 100 // mm — visual only, kept small

  const axes: [THREE.Vector3, number][] = [
    [new THREE.Vector3(length, 0, 0), 0xff3333], // X red
    [new THREE.Vector3(0, length, 0), 0x22cc55], // Y green
    [new THREE.Vector3(0, 0, length), 0x3388ff], // Z blue
  ]

  axes.forEach(([dir, color]) => {
    const mat = new THREE.LineBasicMaterial({ color })
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      dir,
    ])
    group.add(new THREE.Line(geo, mat))

    // Arrowhead cone
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(6, 20, 8),
      new THREE.MeshBasicMaterial({ color })
    )
    cone.position.copy(dir)
    // Orient cone along the axis direction
    cone.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    )
    group.add(cone)
  })

  return group
}
```

- [ ] **Step 6.2 — Commit**

```bash
git add src/three/helpers.ts
git commit -m "feat: add Three.js grid and axis gizmo helpers"
```

---

## Task 7 — Concrete Renderer

**Files:** Create `src/three/concreteRenderer.ts`

- [ ] **Step 7.1 — Write `src/three/concreteRenderer.ts`**

```typescript
import * as THREE from 'three'
import type { ConcreteElement } from '../types'

const DEG2RAD = Math.PI / 180

/** Build a Three.js Group containing meshes for all concrete elements. */
export function buildConcreteMeshes(elements: ConcreteElement[]): THREE.Group {
  const group = new THREE.Group()
  group.name = 'concrete'

  elements.forEach((el) => {
    if (!el.visible) return
    const mesh = buildSingleConcrete(el)
    mesh.userData.id = el.id
    group.add(mesh)
  })

  return group
}

function buildSingleConcrete(el: ConcreteElement): THREE.Group {
  const g = new THREE.Group()
  g.name = el.id

  let geometry: THREE.BufferGeometry

  if (el.type === 'box') {
    geometry = new THREE.BoxGeometry(el.dimensions.x, el.dimensions.y, el.dimensions.z)
  } else {
    // cylinder: x=diameter, z=height
    const r = el.dimensions.x / 2
    geometry = new THREE.CylinderGeometry(r, r, el.dimensions.z, 32)
    // CylinderGeometry is Y-up; rotate to Z-up
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  }

  // Semi-transparent fill
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(el.color),
    transparent: true,
    opacity: el.opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  g.add(mesh)

  // Wireframe edges for legibility
  const edgesMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(el.color).multiplyScalar(1.5),
    transparent: true,
    opacity: Math.min(el.opacity * 3, 0.9),
  })
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgesMat)
  g.add(edges)

  // Place at origin; box pivot is at centre → shift by half-z so origin is at base
  const halfZ = el.dimensions.z / 2
  g.position.set(el.origin[0], el.origin[1], el.origin[2] + halfZ)
  g.rotation.set(
    el.rotation[0] * DEG2RAD,
    el.rotation[1] * DEG2RAD,
    el.rotation[2] * DEG2RAD
  )

  return g
}
```

- [ ] **Step 7.2 — Commit**

```bash
git add src/three/concreteRenderer.ts
git commit -m "feat: add concrete renderer (box/cylinder + edges)"
```

---

## Task 8 — Rebar Renderer

**Files:** Create `src/three/rebarRenderer.ts`

This is the most complex renderer. It must:
1. Convert a `RebarShape` path (2D in a plane) into 3D world points relative to the group origin.
2. Expand that shape via `RebarArray` into N instances.
3. Render each instance as a `TubeGeometry`.

- [ ] **Step 8.1 — Write `src/three/rebarRenderer.ts`**

```typescript
import * as THREE from 'three'
import type { RebarGroup, RebarShape, RebarArray } from '../types'

const TUBE_RADIUS = 8 // mm — visual display radius

/** Build a Three.js Group containing tube meshes for all rebar groups. */
export function buildRebarMeshes(groups: RebarGroup[]): THREE.Group {
  const group = new THREE.Group()
  group.name = 'rebar'

  groups.forEach((rg) => {
    if (!rg.visible) return
    const rgGroup = buildRebarGroupMeshes(rg)
    rgGroup.userData.id = rg.id
    group.add(rgGroup)
  })

  return group
}

// ─── shape → 3D points ────────────────────────────────────────────────────────

/**
 * Convert a 2D path in one of the three cardinal planes into an array of 3D
 * world-space Vector3, relative to the group origin.
 */
function shapeTo3D(shape: RebarShape, origin: [number, number, number]): THREE.Vector3[] {
  const anchor = shape.path[shape.anchorIndex]
  const ox = origin[0] - anchor[0]  // will be adjusted per plane
  const oy = origin[1]
  const oz = origin[2]

  return shape.path.map(([a, b]) => {
    switch (shape.plane) {
      case 'XY': return new THREE.Vector3(origin[0] + (a - anchor[0]), origin[1] + (b - anchor[1]), origin[2])
      case 'XZ': return new THREE.Vector3(origin[0] + (a - anchor[0]), origin[1], origin[2] + (b - anchor[1]))
      case 'YZ': return new THREE.Vector3(origin[0], origin[1] + (a - anchor[0]), origin[2] + (b - anchor[1]))
    }
  })
}

// ─── array expansion ──────────────────────────────────────────────────────────

/** Returns a list of [dx, dy, dz] offsets for each instance in the array. */
function arrayOffsets(array: RebarArray): THREE.Vector3[] {
  if (array.type === 'single') {
    return [new THREE.Vector3(0, 0, 0)]
  }

  if (array.type === 'linear') {
    // Combine up to two directions with nested loops
    const offsets: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
    for (const dir of array.dirs) {
      const current = [...offsets]
      const newOffsets: THREE.Vector3[] = []
      for (const base of current) {
        for (let i = 0; i < dir.count; i++) {
          const delta = new THREE.Vector3(
            dir.axis === 'X' ? i * dir.spacing : 0,
            dir.axis === 'Y' ? i * dir.spacing : 0,
            dir.axis === 'Z' ? i * dir.spacing : 0,
          )
          newOffsets.push(base.clone().add(delta))
        }
      }
      offsets.length = 0
      offsets.push(...newOffsets)
    }
    return offsets
  }

  if (array.type === 'circular') {
    const offsets: THREE.Vector3[] = []
    const angleStep = (array.totalAngle / array.count) * (Math.PI / 180)
    for (let i = 0; i < array.count; i++) {
      const angle = i * angleStep
      const cx = array.center[0]
      const cy = array.center[1]
      // Rotate origin around the center in the plane perpendicular to axis
      const dx = Math.cos(angle) * cx - Math.sin(angle) * cy - cx
      const dy = Math.sin(angle) * cx + Math.cos(angle) * cy - cy
      switch (array.axis) {
        case 'Z': offsets.push(new THREE.Vector3(dx, dy, 0)); break
        case 'X': offsets.push(new THREE.Vector3(0, dx, dy)); break
        case 'Y': offsets.push(new THREE.Vector3(dx, 0, dy)); break
      }
    }
    return offsets
  }

  if (array.type === 'spiral') {
    // Spiral is handled separately — return a sentinel
    return []
  }

  return [new THREE.Vector3(0, 0, 0)]
}

// ─── tube mesh builders ───────────────────────────────────────────────────────

function makeTube(points: THREE.Vector3[], color: string): THREE.Mesh | null {
  if (points.length < 2) return null
  // Deduplicate consecutive identical points to avoid CatmullRomCurve3 issues
  const unique: THREE.Vector3[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    if (points[i].distanceTo(unique[unique.length - 1]) > 0.01) {
      unique.push(points[i])
    }
  }
  if (unique.length < 2) return null

  const curve = new THREE.CatmullRomCurve3(unique)
  const segments = Math.max(unique.length * 4, 8)
  const geo = new THREE.TubeGeometry(curve, segments, TUBE_RADIUS, 6, false)
  const mat = new THREE.MeshPhongMaterial({ color: new THREE.Color(color) })
  return new THREE.Mesh(geo, mat)
}

function makeSpiralTube(rg: RebarGroup & { array: { type: 'spiral' } }): THREE.Mesh | null {
  const arr = rg.array
  const points: THREE.Vector3[] = []
  const totalAngle = arr.turns * 2 * Math.PI
  const steps = Math.ceil(arr.turns * 64)

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = t * totalAngle
    const x = rg.origin[0] + arr.center[0] + Math.cos(angle) * arr.radius
    const y = rg.origin[1] + arr.center[1] + Math.sin(angle) * arr.radius
    const z = arr.startZ + t * arr.turns * arr.pitch
    points.push(new THREE.Vector3(x, y, z))
  }

  return makeTube(points, rg.color)
}

// ─── group builder ────────────────────────────────────────────────────────────

function buildRebarGroupMeshes(rg: RebarGroup): THREE.Group {
  const g = new THREE.Group()
  g.name = rg.id

  if (rg.array.type === 'spiral') {
    const mesh = makeSpiralTube(rg as RebarGroup & { array: { type: 'spiral' } })
    if (mesh) g.add(mesh)
    return g
  }

  const basePoints = shapeTo3D(rg.shape, rg.origin)
  const offsets = arrayOffsets(rg.array)

  for (const offset of offsets) {
    const pts = basePoints.map((p) => p.clone().add(offset))
    const mesh = makeTube(pts, rg.color)
    if (mesh) g.add(mesh)
  }

  return g
}
```

- [ ] **Step 8.2 — Commit**

```bash
git add src/three/rebarRenderer.ts
git commit -m "feat: add rebar renderer (linear/circular/spiral arrays, TubeGeometry)"
```

---

## Task 9 — Scene Manager

**Files:** Create `src/three/scene.ts`

The SceneManager owns the Three.js renderer, camera, controls, and animation loop. It receives updated model data from React and re-renders.

- [ ] **Step 9.1 — Write `src/three/scene.ts`**

```typescript
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Model } from '../types'
import { buildGrid, buildAxisGizmo } from './helpers'
import { buildConcreteMeshes } from './concreteRenderer'
import { buildRebarMeshes } from './rebarRenderer'

export type ViewPreset = 'iso' | 'top' | 'front' | 'side'

export class SceneManager {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private animId = 0

  // Named groups for easy replacement
  private concreteGroup: THREE.Group | null = null
  private rebarGroup: THREE.Group | null = null
  private gizmo: THREE.Group | null = null

  constructor(canvas: HTMLCanvasElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x111827) // bg dark

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x111827)

    // Camera — perspective, Z-up world
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1_000_000)
    this.camera.up.set(0, 0, 1)
    this.camera.position.set(3000, -4000, 3000)
    this.camera.lookAt(0, 0, 1000)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5000, 5000, 8000)
    this.scene.add(ambient, dir)

    // Grid
    this.scene.add(buildGrid())

    // Gizmo (corner axis indicator — positioned at a fixed spot in scene)
    this.gizmo = buildAxisGizmo()
    this.gizmo.position.set(-1800, -1800, 0)
    this.scene.add(this.gizmo)

    // OrbitControls
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.target.set(0, 0, 1000)
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }

    this.animate()
  }

  /** Replace model geometry. Called whenever the Zustand model changes. */
  setModel(model: Model): void {
    // Remove old groups
    if (this.concreteGroup) {
      this.scene.remove(this.concreteGroup)
      this.concreteGroup.traverse((o) => {
        if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose()
      })
    }
    if (this.rebarGroup) {
      this.scene.remove(this.rebarGroup)
      this.rebarGroup.traverse((o) => {
        if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose()
      })
    }

    this.concreteGroup = buildConcreteMeshes(model.concrete)
    this.rebarGroup = buildRebarMeshes(model.rebarGroups)
    this.scene.add(this.concreteGroup, this.rebarGroup)
  }

  /** Snap camera to a view preset. */
  setView(preset: ViewPreset): void {
    const target = this.controls.target.clone()
    const dist = 6000

    const positions: Record<ViewPreset, THREE.Vector3> = {
      iso: new THREE.Vector3(target.x + dist, target.y - dist, target.z + dist),
      top: new THREE.Vector3(target.x, target.y, target.z + dist * 1.5),
      front: new THREE.Vector3(target.x, target.y - dist * 1.5, target.z),
      side: new THREE.Vector3(target.x + dist * 1.5, target.y, target.z),
    }

    this.camera.position.copy(positions[preset])
    this.camera.lookAt(target)
    this.controls.update()
  }

  /** Must be called when the container resizes. */
  resize(width: number, height: number): void {
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  dispose(): void {
    cancelAnimationFrame(this.animId)
    this.controls.dispose()
    this.renderer.dispose()
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}
```

- [ ] **Step 9.2 — Commit**

```bash
git add src/three/scene.ts
git commit -m "feat: add SceneManager (renderer, camera, OrbitControls, view presets)"
```

---

## Task 10 — Viewport Component

**Files:** Create `src/components/Viewport.tsx`

This React component owns the `<canvas>` element and manages the `SceneManager` lifecycle.

- [ ] **Step 10.1 — Write `src/components/Viewport.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { useModelStore } from '../store/modelStore'
import { SceneManager, type ViewPreset } from '../three/scene'

const VIEW_BUTTONS: { label: string; preset: ViewPreset }[] = [
  { label: 'Iso', preset: 'iso' },
  { label: 'Top', preset: 'top' },
  { label: 'Front', preset: 'front' },
  { label: 'Side', preset: 'side' },
]

export default function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneManager | null>(null)
  const model = useModelStore((s) => s.model)

  // Create scene on mount
  useEffect(() => {
    const canvas = canvasRef.current!
    const container = containerRef.current!
    const sm = new SceneManager(canvas)
    sceneRef.current = sm

    // Initial size
    sm.resize(container.clientWidth, container.clientHeight)

    // ResizeObserver keeps the canvas filling its container
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      sm.resize(width, height)
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      sm.dispose()
    }
  }, [])

  // Re-render whenever model changes
  useEffect(() => {
    sceneRef.current?.setModel(model)
  }, [model])

  const handleView = (preset: ViewPreset) => {
    sceneRef.current?.setView(preset)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#111827]">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* View preset buttons — bottom left */}
      <div className="absolute bottom-3 left-3 flex gap-1">
        {VIEW_BUTTONS.map(({ label, preset }) => (
          <button
            key={preset}
            onClick={() => handleView(preset)}
            className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 10.2 — Commit**

```bash
git add src/components/Viewport.tsx
git commit -m "feat: add Viewport component with SceneManager lifecycle"
```

---

## Task 11 — Top Bar

**Files:** Create `src/components/TopBar.tsx`

- [ ] **Step 11.1 — Write `src/components/TopBar.tsx`**

```tsx
import { useRef, useState } from 'react'
import { useModelStore } from '../store/modelStore'
import { exportJSON, importJSON } from '../io/serialize'
import { encode, decode } from '../io/shortcode'
import { sampleModel } from '../examples/sampleModel'

export default function TopBar() {
  const { model, setModel } = useModelStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleNew = () => {
    if (confirm('Start a new empty model? Unsaved changes will be lost.')) {
      setModel({ version: '1.0', units: 'mm', concrete: [], rebarGroups: [] })
    }
  }

  const handleSave = () => exportJSON(model)

  const handleOpen = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const m = importJSON(ev.target!.result as string)
        setModel(m)
      } catch (err) {
        alert(`Failed to load file: ${(err as Error).message}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCopyCode = async () => {
    const code = encode(model)
    await navigator.clipboard.writeText(code)
    // Brief visual feedback via window title flicker
    const prev = document.title
    document.title = 'Copied!'
    setTimeout(() => (document.title = prev), 1000)
  }

  const handleLoadCode = () => {
    setCodeInput('')
    setError(null)
    setShowLoadDialog(true)
  }

  const handleApplyCode = () => {
    try {
      const m = decode(codeInput.trim())
      setModel(m)
      setShowLoadDialog(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleLoadExample = () => {
    setModel(sampleModel)
  }

  return (
    <>
      <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-3 gap-2 text-xs shrink-0">
        <span className="text-neutral-400 font-medium mr-2">3D Rebar Detail</span>

        {[
          { label: 'New', onClick: handleNew },
          { label: 'Open', onClick: handleOpen },
          { label: 'Save', onClick: handleSave },
          { label: 'Copy Code', onClick: handleCopyCode },
          { label: 'Load Code', onClick: handleLoadCode },
          { label: 'Example', onClick: handleLoadExample },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300 hover:text-neutral-100"
          >
            {label}
          </button>
        ))}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Load Code dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-5 w-[480px] flex flex-col gap-3">
            <div className="text-sm font-medium text-neutral-200">Load from Code</div>
            <textarea
              className="bg-neutral-800 border border-neutral-700 rounded p-2 text-xs font-mono text-neutral-300 resize-none h-28 focus:outline-none focus:border-neutral-500"
              placeholder="Paste shortcode here…"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />
            {error && <div className="text-xs text-red-400">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCode}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 11.2 — Commit**

```bash
git add src/components/TopBar.tsx
git commit -m "feat: add TopBar (New/Open/Save/Copy Code/Load Code/Example)"
```

---

## Task 12 — Side Panel (Object Tree)

**Files:** Create `src/components/ConcreteList.tsx`, `src/components/RebarGroupList.tsx`, `src/components/SidePanel.tsx`

- [ ] **Step 12.1 — Write `src/components/ConcreteList.tsx`**

```tsx
import { useState } from 'react'
import { useModelStore } from '../store/modelStore'

export default function ConcreteList() {
  const { model, selectedId, setSelectedId } = useModelStore()
  const [open, setOpen] = useState(true)

  return (
    <section>
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-200"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Concrete</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>

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

- [ ] **Step 12.2 — Write `src/components/RebarGroupList.tsx`**

```tsx
import { useState } from 'react'
import { useModelStore } from '../store/modelStore'

export default function RebarGroupList() {
  const { model, selectedId, setSelectedId } = useModelStore()
  const [open, setOpen] = useState(true)

  return (
    <section>
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-200"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Rebar Groups</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <ul>
          {model.rebarGroups.length === 0 && (
            <li className="px-4 py-1 text-xs text-neutral-600 italic">— empty —</li>
          )}
          {model.rebarGroups.map((g) => (
            <li
              key={g.id}
              onClick={() => setSelectedId(selectedId === g.id ? null : g.id)}
              className={`px-4 py-1.5 text-xs cursor-pointer flex items-center gap-2 ${
                selectedId === g.id
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: g.color }}
              />
              {g.name}
              {!g.visible && <span className="ml-auto text-neutral-600">hidden</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
```

- [ ] **Step 12.3 — Write `src/components/SidePanel.tsx`**

```tsx
import ConcreteList from './ConcreteList'
import RebarGroupList from './RebarGroupList'

export default function SidePanel() {
  return (
    <aside className="w-72 shrink-0 bg-neutral-950 border-l border-neutral-800 flex flex-col overflow-y-auto">
      <ConcreteList />
      <div className="border-t border-neutral-800" />
      <RebarGroupList />
    </aside>
  )
}
```

- [ ] **Step 12.4 — Commit**

```bash
git add src/components/ConcreteList.tsx src/components/RebarGroupList.tsx src/components/SidePanel.tsx
git commit -m "feat: add side panel with collapsible concrete and rebar object tree"
```

---

## Task 13 — Wire App Together

**Files:** Modify `src/App.tsx`

- [ ] **Step 13.1 — Replace stub `src/App.tsx` with full layout**

```tsx
import TopBar from './components/TopBar'
import Viewport from './components/Viewport'
import SidePanel from './components/SidePanel'

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Viewport />
        <SidePanel />
      </div>
    </div>
  )
}
```

- [ ] **Step 13.2 — Run dev server and verify**

```bash
npm run dev
```

Expected:
- App loads with dark layout
- 3D viewport shows: grey grid, axis gizmo, semi-transparent grey column, amber main bars (2×2 grid), green stirrups
- Left/right rotation with mouse, scroll to zoom
- Iso/Top/Front/Side buttons snap the camera
- Side panel shows collapsible "Concrete" and "Rebar Groups" sections with colour dots
- Clicking an item highlights its row
- Save button downloads `rebar-model.json`
- Open button can load that file back
- Copy Code copies a base64 string; Load Code dialog can paste it back

- [ ] **Step 13.3 — Final Phase 1 commit**

```bash
git add src/App.tsx
git commit -m "feat: wire App layout — Phase 1 complete"
```

---

## Self-Review

### Spec Coverage

| Requirement | Covered by |
|---|---|
| Vite + React + TS + Tailwind + Three.js + Zustand + pako | Task 1 |
| Layout: Top Bar + 3D viewport + right sidebar | Tasks 11–13 |
| 3D scene: bg, grid, OrbitControls | Task 9 |
| Axis gizmo (X/Y/Z coloured) | Task 6 |
| View presets: Iso/Top/Front/Side | Task 9+10 |
| Hardcoded sample model renders | Tasks 3, 7, 8 |
| Right panel object tree (collapse/expand) | Task 12 |
| JSON export (download) | Task 5 |
| JSON import (file picker) | Task 5+11 |
| Copy Code (pako→base64→clipboard) | Tasks 5+11 |
| Load Code (dialog, decompress, load) | Tasks 5+11 |
| All types match spec interface | Task 2 |
| Dark mode, Linear/Vercel aesthetic | All UI tasks |
| Units: mm | Task 2 (types) + Task 3 (sample values) |

### Placeholder Scan
No TBDs, TODOs, or "similar to Task N" references found.

### Type Consistency
- `RebarArray` union `type` literals: `'single' | 'linear' | 'circular' | 'spiral'` — consistent across types.ts, sampleModel.ts, rebarRenderer.ts
- `ConcreteElement.type`: `'box' | 'cylinder'` — consistent across types.ts, concreteRenderer.ts
- `SceneManager.setView(preset: ViewPreset)` — `ViewPreset` exported from scene.ts, imported in Viewport.tsx
- `useModelStore` action names: `setModel`, `updateConcrete`, `addConcrete`, `removeConcrete`, `updateRebarGroup`, `addRebarGroup`, `removeRebarGroup`, `setSelectedId` — used consistently across components
