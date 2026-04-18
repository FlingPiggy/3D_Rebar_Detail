import { useRef, useState } from 'react'
import { useModelStore } from '../store/modelStore'
import type { ConcreteElement } from '../types'

export default function ConcreteList() {
  const { model, selectedId, setSelectedId, addConcrete,
          setAllConcreteVisible, reorderConcrete } = useModelStore()
  const [open, setOpen] = useState(true)
  const [adding, setAdding] = useState(false)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const dragSrc = useRef<number | null>(null)

  const allVisible = model.concrete.length > 0 && model.concrete.every((el) => el.visible)

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
        {/* Show/hide all */}
        <button
          onClick={() => setAllConcreteVisible(!allVisible)}
          title={allVisible ? 'Hide all' : 'Show all'}
          className="px-2 py-2 text-neutral-500 hover:text-neutral-200 text-sm leading-none"
        >
          {allVisible ? '◉' : '○'}
        </button>
        {/* Add */}
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
          {model.concrete.map((el, index) => (
            <li
              key={el.id}
              draggable
              onDragStart={() => { dragSrc.current = index }}
              onDragEnd={() => { setDragOver(null); dragSrc.current = null }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(index) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault()
                if (dragSrc.current !== null && dragSrc.current !== index) {
                  reorderConcrete(dragSrc.current, index)
                }
                setDragOver(null)
              }}
              onClick={() => setSelectedId(selectedId === el.id ? null : el.id)}
              className={`px-4 py-1.5 text-xs cursor-pointer flex items-center gap-2 border-t-2 transition-colors ${
                dragOver === index ? 'border-blue-500' : 'border-transparent'
              } ${
                selectedId === el.id
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span className="text-neutral-600 cursor-grab select-none">⠿</span>
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
