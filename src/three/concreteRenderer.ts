import * as THREE from 'three'
import type { ConcreteElement } from '../types'

const DEG2RAD = Math.PI / 180

/** Build a Three.js Group containing meshes for all concrete elements. */
export function buildConcreteMeshes(elements: ConcreteElement[]): THREE.Group {
  const group = new THREE.Group()
  group.name = 'concrete'

  elements.forEach((el) => {
    if (!el.visible) return
    const mesh = buildSingleConcrete(el)
    mesh.userData.id = el.id
    group.add(mesh)
  })

  return group
}

function buildSingleConcrete(el: ConcreteElement): THREE.Group {
  const g = new THREE.Group()
  g.name = el.id

  let geometry: THREE.BufferGeometry

  if (el.type === 'box') {
    geometry = new THREE.BoxGeometry(el.dimensions.x, el.dimensions.y, el.dimensions.z)
  } else {
    // cylinder: x=diameter, z=height
    const r = el.dimensions.x / 2
    geometry = new THREE.CylinderGeometry(r, r, el.dimensions.z, 32)
    // CylinderGeometry is Y-up; rotate to Z-up
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  }

  // Semi-transparent fill
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(el.color),
    transparent: true,
    opacity: el.opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  g.add(mesh)

  // Wireframe edges for legibility
  const edgesMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(el.color).multiplyScalar(1.5),
    transparent: true,
    opacity: Math.min(el.opacity * 3, 0.9),
  })
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgesMat)
  g.add(edges)

  // Place at origin; box pivot is at centre → shift by half-z so origin is at base
  const halfZ = el.dimensions.z / 2
  g.position.set(el.origin[0], el.origin[1], el.origin[2] + halfZ)
  g.rotation.set(
    el.rotation[0] * DEG2RAD,
    el.rotation[1] * DEG2RAD,
    el.rotation[2] * DEG2RAD
  )

  return g
}
