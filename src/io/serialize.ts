import type { Model } from '../types'

/** Trigger a JSON file download in the browser. */
export function exportJSON(model: Model): void {
  const json = JSON.stringify(model, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rebar-model.json'
  a.click()
  URL.revokeObjectURL(url)
}

/** Parse a JSON string into a Model. Throws on invalid input. */
export function importJSON(text: string): Model {
  const parsed = JSON.parse(text) as Model
  if (parsed.version !== '1.0') throw new Error('Unsupported model version')
  return parsed
}
