import * as THREE from 'three'
import type { ConcreteElement } from '../types'
import { geoCenterWorld } from './concreteGeometry'

const DEG2RAD = Math.PI / 180

/** Build a Three.js Group containing meshes for all concrete elements. */
export function buildConcreteMeshes(elements: ConcreteElement[]): THREE.Group {
  const group = new THREE.Group()
  group.name = 'concrete'

  for (const el of elements) {
    if (!el.visible) continue
    const mesh = buildSingleConcrete(el)
    mesh.userData.id = el.id
    group.add(mesh)
  }

  return group
}

// ── Single element ──────────────────────────────────────────────────────────

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
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })))

  g.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({
      color: new THREE.Color(el.color).multiplyScalar(1.5),
      transparent: true,
      opacity: Math.min(el.opacity * 3, 0.9),
    }),
  ))

  g.position.copy(geoCenterWorld(el))
  g.rotation.set(
    el.rotation[0] * DEG2RAD,
    el.rotation[1] * DEG2RAD,
    el.rotation[2] * DEG2RAD,
  )
  return g
}
