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
