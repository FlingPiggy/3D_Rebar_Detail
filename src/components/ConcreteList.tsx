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
