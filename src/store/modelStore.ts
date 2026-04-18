import { create } from 'zustand'
import type { Model, ConcreteElement, RebarGroup } from '../types'
import { sampleModel } from '../examples/sampleModel'

interface ModelStore {
  model: Model
  selectedId: string | null

  // ── View prefs ────────────────────────────────────────────────────────────
  showEdges: boolean

  // ── Snap-align state ──────────────────────────────────────────────────────
  alignMode: null | 'source' | 'target'
  alignElementId: string | null
  alignSource: [number, number, number] | null

  setModel: (m: Model) => void
  setSelectedId: (id: string | null) => void
  setShowEdges: (v: boolean) => void

  updateConcrete: (id: string, patch: Partial<ConcreteElement>) => void
  addConcrete: (el: ConcreteElement) => void
  removeConcrete: (id: string) => void
  duplicateConcrete: (id: string) => void
  setAllConcreteVisible: (visible: boolean) => void
  reorderConcrete: (from: number, to: number) => void

  updateRebarGroup: (id: string, patch: Partial<RebarGroup>) => void
  addRebarGroup: (g: RebarGroup) => void
  removeRebarGroup: (id: string) => void
  duplicateRebarGroup: (id: string) => void
  setAllRebarVisible: (visible: boolean) => void
  reorderRebarGroups: (from: number, to: number) => void

  startAlign: (elementId: string) => void
  setAlignSource: (point: [number, number, number]) => void
  applyAlign: (target: [number, number, number]) => void
  cancelAlign: () => void
}

export const useModelStore = create<ModelStore>((set) => ({
  model: sampleModel,
  selectedId: null,
  showEdges: true,
  alignMode: null,
  alignElementId: null,
  alignSource: null,

  setModel: (m) => set({ model: m }),
  setSelectedId: (id) => set({ selectedId: id }),
  setShowEdges: (v) => set({ showEdges: v }),

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

  duplicateConcrete: (id) =>
    set((s) => {
      const src = s.model.concrete.find((el) => el.id === id)
      if (!src) return {}
      const copy: ConcreteElement = {
        ...src,
        id: `concrete_${Date.now()}`,
        name: src.name + ' copy',
        origin: [...src.origin] as [number, number, number],
        rotation: [...src.rotation] as [number, number, number],
        anchor: src.anchor
          ? {
              ...src.anchor,
              custom: src.anchor.custom
                ? [...src.anchor.custom] as [number, number, number]
                : undefined,
            }
          : undefined,
      }
      return {
        model: { ...s.model, concrete: [...s.model.concrete, copy] },
        selectedId: copy.id,
      }
    }),

  setAllConcreteVisible: (visible) =>
    set((s) => ({
      model: {
        ...s.model,
        concrete: s.model.concrete.map((el) => ({ ...el, visible })),
      },
    })),

  reorderConcrete: (from, to) =>
    set((s) => {
      const arr = [...s.model.concrete]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return { model: { ...s.model, concrete: arr } }
    }),

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

  duplicateRebarGroup: (id) =>
    set((s) => {
      const src = s.model.rebarGroups.find((g) => g.id === id)
      if (!src) return {}
      const copy: RebarGroup = {
        ...src,
        id: `rebar_${Date.now()}`,
        name: src.name + ' copy',
        origin: [...src.origin] as [number, number, number],
        shape: {
          ...src.shape,
          path: src.shape.path.map((p) => [p[0], p[1]] as [number, number]),
          anchorCustom: src.shape.anchorCustom
            ? [src.shape.anchorCustom[0], src.shape.anchorCustom[1]]
            : undefined,
        },
        array: JSON.parse(JSON.stringify(src.array)),
      }
      return {
        model: { ...s.model, rebarGroups: [...s.model.rebarGroups, copy] },
        selectedId: copy.id,
      }
    }),

  setAllRebarVisible: (visible) =>
    set((s) => ({
      model: {
        ...s.model,
        rebarGroups: s.model.rebarGroups.map((g) => ({ ...g, visible })),
      },
    })),

  reorderRebarGroups: (from, to) =>
    set((s) => {
      const arr = [...s.model.rebarGroups]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return { model: { ...s.model, rebarGroups: arr } }
    }),

  startAlign: (elementId) =>
    set({ alignMode: 'source', alignElementId: elementId, alignSource: null }),

  setAlignSource: (point) =>
    set({ alignSource: point, alignMode: 'target' }),

  applyAlign: (target) =>
    set((s) => {
      if (!s.alignSource || !s.alignElementId) return { alignMode: null, alignSource: null, alignElementId: null }
      const [sx, sy, sz] = s.alignSource
      const [tx, ty, tz] = target
      return {
        model: {
          ...s.model,
          concrete: s.model.concrete.map((el) =>
            el.id === s.alignElementId
              ? { ...el, origin: [el.origin[0] + (tx - sx), el.origin[1] + (ty - sy), el.origin[2] + (tz - sz)] as [number, number, number] }
              : el
          ),
        },
        alignMode: null,
        alignSource: null,
        alignElementId: null,
      }
    }),

  cancelAlign: () =>
    set({ alignMode: null, alignSource: null, alignElementId: null }),
}))
