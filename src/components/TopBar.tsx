import { useRef, useState } from 'react'
import { useModelStore } from '../store/modelStore'
import { exportJSON, importJSON } from '../io/serialize'
import { encode, decode } from '../io/shortcode'
import { sampleModel } from '../examples/sampleModel'

export default function TopBar() {
  const { model, setModel } = useModelStore()
  const showEdges = useModelStore((s) => s.showEdges)
  const setShowEdges = useModelStore((s) => s.setShowEdges)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleNew = () => {
    if (confirm('Start a new empty model? Unsaved changes will be lost.')) {
      setModel({ version: '1.0', units: 'mm', concrete: [], rebarGroups: [] })
    }
  }

  const handleSave = () => exportJSON(model)

  const handleOpen = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const m = importJSON(ev.target!.result as string)
        setModel(m)
      } catch (err) {
        alert(`Failed to load file: ${(err as Error).message}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCopyCode = async () => {
    const code = encode(model)
    await navigator.clipboard.writeText(code)
    // Brief visual feedback via window title flicker
    const prev = document.title
    document.title = 'Copied!'
    setTimeout(() => (document.title = prev), 1000)
  }

  const handleLoadCode = () => {
    setCodeInput('')
    setError(null)
    setShowLoadDialog(true)
  }

  const handleApplyCode = () => {
    try {
      const m = decode(codeInput.trim())
      setModel(m)
      setShowLoadDialog(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleLoadExample = () => {
    setModel(sampleModel)
  }

  return (
    <>
      <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-3 gap-2 text-xs shrink-0">
        <span className="text-neutral-400 font-medium mr-2">3D Rebar Detail</span>

        {[
          { label: 'New', onClick: handleNew },
          { label: 'Open', onClick: handleOpen },
          { label: 'Save', onClick: handleSave },
          { label: 'Copy Code', onClick: handleCopyCode },
          { label: 'Load Code', onClick: handleLoadCode },
          { label: 'Example', onClick: handleLoadExample },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300 hover:text-neutral-100"
          >
            {label}
          </button>
        ))}

        <div className="w-px h-5 bg-neutral-700 mx-1" />

        <button
          onClick={() => setShowEdges(!showEdges)}
          title={showEdges ? 'Hide outline edges' : 'Show outline edges'}
          className={`px-2.5 py-1 border rounded ${
            showEdges
              ? 'bg-neutral-700 border-neutral-600 text-neutral-100'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Edges
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Load Code dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-5 w-[480px] flex flex-col gap-3">
            <div className="text-sm font-medium text-neutral-200">Load from Code</div>
            <textarea
              className="bg-neutral-800 border border-neutral-700 rounded p-2 text-xs font-mono text-neutral-300 resize-none h-28 focus:outline-none focus:border-neutral-500"
              placeholder="Paste shortcode here…"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />
            {error && <div className="text-xs text-red-400">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCode}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
