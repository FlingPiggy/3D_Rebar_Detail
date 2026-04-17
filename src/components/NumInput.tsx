import { useState, useEffect } from 'react'

interface NumInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
}

/** Compact labelled number field. Uses local draft state so the user can
 *  freely clear/type intermediate values; commits to onChange on blur or Enter. */
export default function NumInput({ label, value, onChange, step = 1, min, max }: NumInputProps) {
  const [draft, setDraft] = useState(String(value))

  // Sync when the parent value changes from outside (e.g. alignment snap)
  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = (raw: string) => {
    const v = parseFloat(raw)
    if (!isNaN(v)) {
      onChange(v)
    } else {
      setDraft(String(value)) // revert to last valid
    }
  }

  return (
    <label className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] text-neutral-500 uppercase tracking-wide">{label}</span>
      <input
        type="number"
        value={draft}
        step={step}
        min={min}
        max={max}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
        }}
        className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  )
}
