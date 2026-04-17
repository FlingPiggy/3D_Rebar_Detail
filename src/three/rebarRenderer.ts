import * as THREE from 'three'
import type { RebarGroup, RebarShape, RebarArray } from '../types'

const TUBE_RADIUS = 8 // mm — visual display radius

/** Build a Three.js Group containing tube meshes for all rebar groups. */
export function buildRebarMeshes(groups: RebarGroup[]): THREE.Group {
  const group = new THREE.Group()
  group.name = 'rebar'

  groups.forEach((rg) => {
    if (!rg.visible) return
    const rgGroup = buildRebarGroupMeshes(rg)
    rgGroup.userData.id = rg.id
    group.add(rgGroup)
  })

  return group
}

// ─── shape → 3D points ────────────────────────────────────────────────────────

/**
 * Convert a 2D path in one of the three cardinal planes into an array of 3D
 * world-space Vector3. The anchorIndex point maps to the group origin.
 */
function shapeTo3D(shape: RebarShape, origin: [number, number, number]): THREE.Vector3[] {
  const anchor = shape.path[shape.anchorIndex]

  return shape.path.map(([a, b]) => {
    const da = a - anchor[0]
    const db = b - anchor[1]
    switch (shape.plane) {
      case 'XY': return new THREE.Vector3(origin[0] + da, origin[1] + db, origin[2])
      case 'XZ': return new THREE.Vector3(origin[0] + da, origin[1], origin[2] + db)
      case 'YZ': return new THREE.Vector3(origin[0], origin[1] + da, origin[2] + db)
    }
  })
}

// ─── array expansion ──────────────────────────────────────────────────────────

/** Returns a list of translation offsets (one per instance). */
function arrayOffsets(array: RebarArray): THREE.Vector3[] {
  if (array.type === 'single') {
    return [new THREE.Vector3(0, 0, 0)]
  }

  if (array.type === 'linear') {
    // Start with one zero offset, then expand along each dir in sequence
    let offsets: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
    for (const dir of array.dirs) {
      const expanded: THREE.Vector3[] = []
      for (const base of offsets) {
        for (let i = 0; i < dir.count; i++) {
          expanded.push(new THREE.Vector3(
            base.x + (dir.axis === 'X' ? i * dir.spacing : 0),
            base.y + (dir.axis === 'Y' ? i * dir.spacing : 0),
            base.z + (dir.axis === 'Z' ? i * dir.spacing : 0),
          ))
        }
      }
      offsets = expanded
    }
    return offsets
  }

  if (array.type === 'circular') {
    const offsets: THREE.Vector3[] = []
    const [cx, cy] = array.center
    const angleStep = (array.totalAngle / array.count) * (Math.PI / 180)
    for (let i = 0; i < array.count; i++) {
      const angle = i * angleStep
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      // Rotate origin around center: result = center + R(θ)*(origin-center)
      const dx = cx * (1 - cos) + cy * sin
      const dy = cy * (1 - cos) - cx * sin
      switch (array.axis) {
        case 'Z': offsets.push(new THREE.Vector3(dx, dy, 0)); break
        case 'X': offsets.push(new THREE.Vector3(0, dx, dy)); break
        case 'Y': offsets.push(new THREE.Vector3(dx, 0, dy)); break
      }
    }
    return offsets
  }

  // spiral handled separately
  return []
}

// ─── tube mesh builders ───────────────────────────────────────────────────────

function makeTube(points: THREE.Vector3[], color: string): THREE.Mesh | null {
  if (points.length < 2) return null
  // Deduplicate consecutive identical points to avoid CatmullRomCurve3 issues
  const unique: THREE.Vector3[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    if (points[i].distanceTo(unique[unique.length - 1]) > 0.01) {
      unique.push(points[i])
    }
  }
  if (unique.length < 2) return null

  const curve = new THREE.CatmullRomCurve3(unique)
  const segments = Math.max(unique.length * 4, 8)
  const geo = new THREE.TubeGeometry(curve, segments, TUBE_RADIUS, 6, false)
  const mat = new THREE.MeshPhongMaterial({ color: new THREE.Color(color) })
  return new THREE.Mesh(geo, mat)
}

function makeSpiralTube(rg: RebarGroup & { array: Extract<RebarGroup['array'], { type: 'spiral' }> }): THREE.Mesh | null {
  const arr = rg.array
  const points: THREE.Vector3[] = []
  const totalAngle = arr.turns * 2 * Math.PI
  const steps = Math.ceil(arr.turns * 64)

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = t * totalAngle
    const x = rg.origin[0] + arr.center[0] + Math.cos(angle) * arr.radius
    const y = rg.origin[1] + arr.center[1] + Math.sin(angle) * arr.radius
    const z = rg.origin[2] + arr.startZ + t * arr.turns * arr.pitch
    points.push(new THREE.Vector3(x, y, z))
  }

  return makeTube(points, rg.color)
}

// ─── group builder ────────────────────────────────────────────────────────────

function buildRebarGroupMeshes(rg: RebarGroup): THREE.Group {
  const g = new THREE.Group()
  g.name = rg.id

  if (rg.array.type === 'spiral') {
    const mesh = makeSpiralTube(rg as RebarGroup & { array: Extract<RebarGroup['array'], { type: 'spiral' }> })
    if (mesh) g.add(mesh)
    return g
  }

  const basePoints = shapeTo3D(rg.shape, rg.origin)
  const offsets = arrayOffsets(rg.array)

  for (const offset of offsets) {
    const pts = basePoints.map((p) => p.clone().add(offset))
    const mesh = makeTube(pts, rg.color)
    if (mesh) g.add(mesh)
  }

  return g
}
