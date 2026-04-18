import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useModelStore } from '../store/modelStore'
import { SceneManager, type ViewPreset } from '../three/scene'
import { getAllSnapPoints, nearestSnapPoint, groundHit } from '../three/snapPoints'

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
  const selectedId = useModelStore((s) => s.selectedId)
  const showEdges = useModelStore((s) => s.showEdges)
  const alignMode = useModelStore((s) => s.alignMode)
  const alignSource = useModelStore((s) => s.alignSource)
  const { setAlignSource, applyAlign, cancelAlign } = useModelStore.getState()

  // ── Scene lifecycle ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!
    const container = containerRef.current!
    const sm = new SceneManager(canvas)
    sceneRef.current = sm
    sm.resize(container.clientWidth, container.clientHeight)

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      sm.resize(width, height)
    })
    ro.observe(container)

    return () => { ro.disconnect(); sm.dispose() }
  }, [])

  // ── Re-render on model change ─────────────────────────────────────────────
  useEffect(() => {
    sceneRef.current?.setModel(model, showEdges)
  }, [model, showEdges])

  // ── Anchor marker ─────────────────────────────────────────────────────────
  useEffect(() => {
    const sm = sceneRef.current
    if (!sm) return
    if (!selectedId) { sm.setAnchorMarker(null); return }
    const concrete = model.concrete.find((c) => c.id === selectedId)
    if (concrete) { sm.setAnchorMarker(new THREE.Vector3(...concrete.origin)); return }
    const rebar = model.rebarGroups.find((r) => r.id === selectedId)
    if (rebar) { sm.setAnchorMarker(new THREE.Vector3(...rebar.origin)); return }
    sm.setAnchorMarker(null)
  }, [selectedId, model])

  // ── Snap-align click handler ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const sm = sceneRef.current
    if (!canvas || !sm || !alignMode) return

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(ndc, sm.camera)

      // Try snapping to a concrete vertex first, fall back to ground plane
      const snapPts = getAllSnapPoints(model.concrete)
      const snapped = nearestSnapPoint(raycaster.ray, snapPts)
        ?? groundHit(raycaster.ray)

      if (!snapped) return
      const p: [number, number, number] = [
        Math.round(snapped.x),
        Math.round(snapped.y),
        Math.round(snapped.z),
      ]

      if (alignMode === 'source') setAlignSource(p)
      else applyAlign(p)
    }

    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [alignMode, model.concrete, setAlignSource, applyAlign])

  // ── Escape cancels align ──────────────────────────────────────────────────
  useEffect(() => {
    if (!alignMode) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cancelAlign() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [alignMode, cancelAlign])

  const handleView = (preset: ViewPreset) => {
    sceneRef.current?.setView(preset)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#111827]">
      <canvas ref={canvasRef} className="w-full h-full" style={{ cursor: alignMode ? 'crosshair' : 'default' }} />

      {/* Snap-align status overlay */}
      {alignMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-900/90 border border-neutral-700 rounded px-4 py-2 text-xs text-neutral-200 pointer-events-none select-none">
          {alignMode === 'source' && 'Click a point on this element to use as source'}
          {alignMode === 'target' && (
            <>
              Source: ({alignSource?.map((v) => v.toFixed(0)).join(', ')})
              &nbsp;— Click target point
            </>
          )}
          <span className="ml-3 text-neutral-500">Esc to cancel</span>
        </div>
      )}

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
