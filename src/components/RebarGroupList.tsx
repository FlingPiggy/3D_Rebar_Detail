import { useRef, useState } from 'react'
import { useModelStore } from '../store/modelStore'
import type { RebarGroup } from '../types'

export default function RebarGroupList() {
  const { model, selectedId, setSelectedId, addRebarGroup,
          setAllRebarVisible, reorderRebarGroups } = useModelStore()
  const [open, setOpen] = useState(true)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const dragSrc = useRef<number | null>(null)

  const allVisible = model.rebarGroups.length > 0 && model.rebarGroups.every((g) => g.visible)

  const handleAdd = () => {
    const id = `rebar_${Date.now()}`
    const g: RebarGroup = {
      id,
      name: 'New Rebar',
      visible: true,
      color: '#f59e0b',
      origin: [0, 0, 0],
      shape: { plane: 'XZ', path: [[0, 0], [0, 1000]], anchorIndex: 0 },
      array: { type: 'single' },
    }
    addRebarGroup(g)
    setSelectedId(id)
  }

  return (
    <section>
      <div className="flex items-center">
        <button
          className="flex-1 flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-200"
          onClick={() => setOpen((o) => !o)}
        >
          <span>Rebar Groups</span>
          <span>{open ? '▾' : '▸'}</span>
        </button>
        {/* Show/hide all */}
        <button
          onClick={() => setAllRebarVisible(!allVisible)}
          title={allVisible ? 'Hide all' : 'Show all'}
          className="px-2 py-2 text-neutral-500 hover:text-neutral-200 text-sm leading-none"
        >
          {allVisible ? '◉' : '○'}
        </button>
        {/* Add */}
        <button
          onClick={handleAdd}
          className="px-2 py-2 text-neutral-500 hover:text-neutral-200 text-sm leading-none"
          title="Add rebar group"
        >
          +
        </button>
      </div>

      {open && (
        <ul>
          {model.rebarGroups.length === 0 && (
            <li className="px-4 py-1 text-xs text-neutral-600 italic">— empty —</li>
          )}
          {model.rebarGroups.map((g, index) => (
            <li
              key={g.id}
              draggable
              onDragStart={() => { dragSrc.current = index }}
              onDragEnd={() => { setDragOver(null); dragSrc.current = null }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(index) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault()
                if (dragSrc.current !== null && dragSrc.current !== index) {
                  reorderRebarGroups(dragSrc.current, index)
                }
                setDragOver(null)
              }}
              onClick={() => setSelectedId(selectedId === g.id ? null : g.id)}
              className={`px-4 py-1.5 text-xs cursor-pointer flex items-center gap-2 border-t-2 transition-colors ${
                dragOver === index ? 'border-blue-500' : 'border-transparent'
              } ${
                selectedId === g.id
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span className="text-neutral-600 cursor-grab select-none">⠿</span>
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
