import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Model } from '../types'
import { buildGrid, buildAxisGizmo } from './helpers'
import { buildConcreteMeshes } from './concreteRenderer'
import { buildRebarMeshes } from './rebarRenderer'

export type ViewPreset = 'iso' | 'top' | 'front' | 'side'

export class SceneManager {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private animId = 0

  // Named groups for easy replacement
  private concreteGroup: THREE.Group | null = null
  private rebarGroup: THREE.Group | null = null

  constructor(canvas: HTMLCanvasElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x111827)

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x111827)

    // Camera — perspective, Z-up world
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1_000_000)
    this.camera.up.set(0, 0, 1)
    this.camera.position.set(3000, -4000, 3000)
    this.camera.lookAt(0, 0, 1000)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5000, 5000, 8000)
    this.scene.add(ambient, dir)

    // Grid
    this.scene.add(buildGrid())

    // Gizmo (corner axis indicator)
    const gizmo = buildAxisGizmo()
    gizmo.position.set(-1800, -1800, 0)
    this.scene.add(gizmo)

    // OrbitControls
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.target.set(0, 0, 1000)
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }

    this.animate()
  }

  /** Replace model geometry. Called whenever the Zustand model changes. */
  setModel(model: Model): void {
    // Remove and dispose old groups
    if (this.concreteGroup) {
      this.scene.remove(this.concreteGroup)
      this.concreteGroup.traverse((o) => {
        if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose()
      })
    }
    if (this.rebarGroup) {
      this.scene.remove(this.rebarGroup)
      this.rebarGroup.traverse((o) => {
        if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose()
      })
    }

    this.concreteGroup = buildConcreteMeshes(model.concrete)
    this.rebarGroup = buildRebarMeshes(model.rebarGroups)
    this.scene.add(this.concreteGroup, this.rebarGroup)
  }

  /** Snap camera to a view preset. */
  setView(preset: ViewPreset): void {
    const target = this.controls.target.clone()
    const dist = 6000

    const positions: Record<ViewPreset, THREE.Vector3> = {
      iso: new THREE.Vector3(target.x + dist, target.y - dist, target.z + dist),
      top: new THREE.Vector3(target.x, target.y, target.z + dist * 1.5),
      front: new THREE.Vector3(target.x, target.y - dist * 1.5, target.z),
      side: new THREE.Vector3(target.x + dist * 1.5, target.y, target.z),
    }

    this.camera.position.copy(positions[preset])
    this.camera.lookAt(target)
    this.controls.update()
  }

  /** Must be called when the container resizes. */
  resize(width: number, height: number): void {
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  dispose(): void {
    cancelAnimationFrame(this.animId)
    this.controls.dispose()
    this.renderer.dispose()
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}
