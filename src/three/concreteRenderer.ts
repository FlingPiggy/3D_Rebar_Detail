import * as THREE from 'three'
import { Brush, Evaluator, ADDITION } from 'three-bvh-csg'
import type { ConcreteElement } from '../types'

const DEG2RAD = Math.PI / 180

/** Build a Three.js Group containing meshes for all concrete elements.
 *  Elements that share the same color are CSG-unioned so overlapping regions
 *  render as a single merged solid rather than doubled-up transparency. */
export function buildConcreteMeshes(elements: ConcreteElement[]): THREE.Group {
  const group = new THREE.Group()
  group.name = 'concrete'

  const visible = elements.filter((el) => el.visible)
  if (visible.length === 0) return group

  // Group by color — only same-color elements are merged
  const byColor = new Map<string, ConcreteElement[]>()
  for (const el of visible) {
    const arr = byColor.get(el.color) ?? []
    arr.push(el)
    byColor.set(el.color, arr)
  }

  for (const [color, els] of byColor) {
    const subGroup = buildColorGroup(els, color)
    group.add(subGroup)
  }

  return group
}

// ── CSG union for a same-color group ─────────────────────────────────────────

function buildColorGroup(elements: ConcreteElement[], color: string): THREE.Group {
  const g = new THREE.Group()

  if (elements.length === 1) {
    const mesh = buildSingleConcrete(elements[0])
    mesh.userData.id = elements[0].id
    g.add(mesh)
    return g
  }

  try {
    const evaluator = new Evaluator()
    evaluator.useGroups = false

    const brushes = elements.map(elementToBrush)
    let result: Brush = brushes[0]
    for (let i = 1; i < brushes.length; i++) {
      result = evaluator.evaluate(result, brushes[i], ADDITION)
    }

    const opacity = elements[0].opacity
    result.material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    const edgesMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(1.5),
      transparent: true,
      opacity: Math.min(opacity * 3, 0.9),
    })
    g.add(result)
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(result.geometry), edgesMat))
  } catch (err) {
    // CSG failed (e.g. degenerate geometry) — fall back to individual meshes
    console.warn('CSG union failed, falling back to individual rendering', err)
    elements.forEach((el) => {
      const mesh = buildSingleConcrete(el)
      mesh.userData.id = el.id
      g.add(mesh)
    })
  }

  return g
}

function elementToBrush(el: ConcreteElement): Brush {
  let geo: THREE.BufferGeometry
  if (el.type === 'box') {
    geo = new THREE.BoxGeometry(el.dimensions.x, el.dimensions.y, el.dimensions.z)
  } else {
    const r = el.dimensions.x / 2
    geo = new THREE.CylinderGeometry(r, r, el.dimensions.z, 32)
    geo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  }

  const brush = new Brush(geo, new THREE.MeshStandardMaterial({ color: el.color }))
  const halfZ = el.dimensions.z / 2
  brush.position.set(el.origin[0], el.origin[1], el.origin[2] + halfZ)
  brush.rotation.set(
    el.rotation[0] * DEG2RAD,
    el.rotation[1] * DEG2RAD,
    el.rotation[2] * DEG2RAD,
  )
  brush.updateMatrixWorld()
  return brush
}

// ── Single element (no CSG needed) ───────────────────────────────────────────

function buildSingleConcrete(el: ConcreteElement): THREE.Group {
  const g = new THREE.Group()
  g.name = el.id

  let geometry: THREE.BufferGeometry
  if (el.type === 'box') {
    geometry = new THREE.BoxGeometry(el.dimensions.x, el.dimensions.y, el.dimensions.z)
  } else {
    const r = el.dimensions.x / 2
    geometry = new THREE.CylinderGeometry(r, r, el.dimensions.z, 32)
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  }

  g.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
    color: new THREE.Color(el.color),
    transparent: true,
    opacity: el.opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  })))

  g.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({
      color: new THREE.Color(el.color).multiplyScalar(1.5),
      transparent: true,
      opacity: Math.min(el.opacity * 3, 0.9),
    }),
  ))

  const halfZ = el.dimensions.z / 2
  g.position.set(el.origin[0], el.origin[1], el.origin[2] + halfZ)
  g.rotation.set(
    el.rotation[0] * DEG2RAD,
    el.rotation[1] * DEG2RAD,
    el.rotation[2] * DEG2RAD,
  )
  return g
}
