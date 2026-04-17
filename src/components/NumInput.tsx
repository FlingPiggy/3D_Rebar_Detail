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
