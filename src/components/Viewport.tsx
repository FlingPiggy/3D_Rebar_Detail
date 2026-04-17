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
