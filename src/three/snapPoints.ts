import * as THREE from 'three'
import type { ConcreteElement } from '../types'

const DEG2RAD = Math.PI / 180

/** Compute world-space snap points for a single concrete element:
 *  8 corners + top/bottom face centres for box,
 *  top/bottom centre + 8 perimeter points per end for cylinder. */
export function getElementSnapPoints(el: ConcreteElement): THREE.Vector3[] {
  const halfZ = el.dimensions.z / 2
  // The renderer places the group centre at origin + (0,0,halfZ)
  const centre = new THREE.Vector3(el.origin[0], el.origin[1], el.origin[2] + halfZ)
  const rotMat = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(el.rotation[0] * DEG2RAD, el.rotation[1] * DEG2RAD, el.rotation[2] * DEG2RAD),
  )

  const local: THREE.Vector3[] = []

  if (el.type === 'box') {
    const hx = el.dimensions.x / 2
    const hy = el.dimensions.y / 2
    // 8 corners
    for (const sx of [-hx, hx]) for (const sy of [-hy, hy]) for (const sz of [-halfZ, halfZ]) {
      local.push(new THREE.Vector3(sx, sy, sz))
    }
    // Top & bottom face centres
    local.push(new THREE.Vector3(0, 0,  halfZ))
    local.push(new THREE.Vector3(0, 0, -halfZ))
    // Top & bottom edge midpoints
    for (const [sx, sy] of [[-hx, 0], [hx, 0], [0, -hy], [0, hy]]) {
      local.push(new THREE.Vector3(sx, sy,  halfZ))
      local.push(new THREE.Vector3(sx, sy, -halfZ))
    }
  } else {
    // Cylinder: top & bottom centres + 8 perimeter points each
    const r = el.dimensions.x / 2
    local.push(new THREE.Vector3(0, 0,  halfZ))
    local.push(new THREE.Vector3(0, 0, -halfZ))
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 2 * Math.PI
      local.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r,  halfZ))
      local.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -halfZ))
    }
  }

  return local.map((p) => p.applyMatrix4(rotMat).add(centre))
}

/** Return all snap points for all visible concrete elements. */
export function getAllSnapPoints(elements: ConcreteElement[]): THREE.Vector3[] {
  return elements.filter((e) => e.visible).flatMap(getElementSnapPoints)
}

/** Find the snap point closest to a ray within `threshold` mm, or null. */
export function nearestSnapPoint(
  ray: THREE.Ray,
  points: THREE.Vector3[],
  threshold = 300,
): THREE.Vector3 | null {
  let best: THREE.Vector3 | null = null
  let bestDist = threshold
  for (const p of points) {
    const d = ray.distanceToPoint(p)
    if (d < bestDist) { bestDist = d; best = p }
  }
  return best
}

/** Intersect ray with the Z = 0 ground plane; returns null if parallel or behind camera. */
export function groundHit(ray: THREE.Ray): THREE.Vector3 | null {
  if (Math.abs(ray.direction.z) < 1e-6) return null
  const t = -ray.origin.z / ray.direction.z
  if (t <= 0) return null
  return ray.at(t, new THREE.Vector3())
}
