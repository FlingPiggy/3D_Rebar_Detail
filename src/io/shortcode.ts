import pako from 'pako'
import type { Model } from '../types'

/** Compress model to a URL-safe base64 shortcode string. */
export function encode(model: Model): string {
  const json = JSON.stringify(model)
  const compressed = pako.deflate(json)
  // Convert Uint8Array to base64
  let binary = ''
  compressed.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

/** Decompress a shortcode string back into a Model. Throws on failure. */
export function decode(code: string): Model {
  const binary = atob(code)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  const json = pako.inflate(bytes, { to: 'string' })
  const parsed = JSON.parse(json) as Model
  if (parsed.version !== '1.0') throw new Error('Unsupported model version')
  return parsed
}
