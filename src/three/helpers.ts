import * as THREE from 'three'

/**
 * Build a world-space floor grid (grey lines, 10 m × 10 m, 500 mm cells).
 * The grid lies in the XY plane; Z is up.
 */
export function buildGrid(): THREE.GridHelper {
  // GridHelper lies in the XZ plane by default; rotate so it lies in XY
  const grid = new THREE.GridHelper(10000, 20, 0x374151, 0x1f2937)
  grid.rotation.x = Math.PI / 2
  return grid
}

/**
 * Build a small axis-indicator group (X=red, Y=green, Z=blue arrows).
 * Place this in the scene at a fixed world position for a corner indicator.
 */
export function buildAxisGizmo(): THREE.Group {
  const group = new THREE.Group()
  const length = 100 // mm — visual only, kept small

  const axes: [THREE.Vector3, number][] = [
    [new THREE.Vector3(length, 0, 0), 0xff3333], // X red
    [new THREE.Vector3(0, length, 0), 0x22cc55], // Y green
    [new THREE.Vector3(0, 0, length), 0x3388ff], // Z blue
  ]

  axes.forEach(([dir, color]) => {
    const mat = new THREE.LineBasicMaterial({ color })
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      dir,
    ])
    group.add(new THREE.Line(geo, mat))

    // Arrowhead cone
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(6, 20, 8),
      new THREE.MeshBasicMaterial({ color })
    )
    cone.position.copy(dir)
    // Orient cone along the axis direction
    cone.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    )
    group.add(cone)
  })

  return group
}
