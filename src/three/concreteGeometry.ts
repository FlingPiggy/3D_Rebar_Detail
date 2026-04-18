import * as THREE from 'three'
import type { ConcreteElement } from '../types'

const DEG2RAD = Math.PI / 180

/**
 * Returns the anchor's position in the element's LOCAL coordinate system,
 * expressed relative to the geometric center (the Three.js BoxGeometry origin).
 *
 * Local axes:  X = width direction,  Y = depth direction,  Z = height direction.
 * Base center (default anchor) sits at (0, 0, -halfZ).
 */
export function anchorLocalFromCenter(el: ConcreteElement): THREE.Vector3 {
  const hx = el.dimensions.x / 2
  const hy = el.dimensions.y / 2
  const hz = el.dimensions.z / 2
  const a = el.anchor

  if (!a || a.type === 'base') return new THREE.Vector3(0, 0, -hz)
  if (a.type === 'center') return new THREE.Vector3(0, 0, 0)

  if (a.type === 'corner' && a.cornerIndex !== undefined) {
    const i = a.cornerIndex
    return new THREE.Vector3(
      (i & 1) ? hx : -hx,
      (i & 2) ? hy : -hy,
      (i & 4) ? hz : -hz,
    )
  }

  if (a.type === 'custom' && a.custom) return new THREE.Vector3(...a.custom)

  return new THREE.Vector3(0, 0, -hz) // fallback → base
}

/**
 * Returns the world-space position of the element's geometric center,
 * given that el.origin is the world position of the anchor.
 */
export function geoCenterWorld(el: ConcreteElement): THREE.Vector3 {
  const localAnchor = anchorLocalFromCenter(el)
  localAnchor.applyEuler(
    new THREE.Euler(
      el.rotation[0] * DEG2RAD,
      el.rotation[1] * DEG2RAD,
      el.rotation[2] * DEG2RAD,
    ),
  )
  return new THREE.Vector3(
    el.origin[0] - localAnchor.x,
    el.origin[1] - localAnchor.y,
    el.origin[2] - localAnchor.z,
  )
}
