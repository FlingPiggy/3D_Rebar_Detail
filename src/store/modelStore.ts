import { create } from 'zustand'
import type { Model, ConcreteElement, RebarGroup } from '../types'
import { sampleModel } from '../examples/sampleModel'

interface ModelStore {
  model: Model
  selectedId: string | null

  // ── Snap-align state ──────────────────────────────────────────────────────
  alignMode: null | 'source' | 'target'
  alignElementId: string | null
  alignSource: [number, number, number] | null

  setModel: (m: Model) => void
  setSelectedId: (id: string | null) => void

  updateConcrete: (id: string, patch: Partial<ConcreteElement>) => void
  addConcrete: (el: ConcreteElement) => void
  removeConcrete: (id: string) => void

  updateRebarGroup: (id: string, patch: Partial<RebarGroup>) => void
  addRebarGroup: (g: RebarGroup) => void
  removeRebarGroup: (id: string) => void

  startAlign: (elementId: string) => void
  setAlignSource: (point: [number, number, number]) => void
  applyAlign: (target: [number, number, number]) => void
  cancelAlign: () => void
}

export const useModelStore = create<ModelStore>((set) => ({
  model: sampleModel,
  selectedId: null,
  alignMode: null,
  alignElementId: null,
  alignSource: null,

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
