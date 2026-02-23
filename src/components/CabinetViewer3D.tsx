import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Cabinet } from '../types'
import { buildCabinetGroup } from '../utils/cabinetGeometry'

interface Props {
  cabinet: Cabinet
}

export default function CabinetViewer3D({ cabinet }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f4f8)

    const w = mount.clientWidth || 400
    const h = mount.clientHeight || 300
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    scene.add(dirLight)
    const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.4)
    fillLight.position.set(-5, 2, -5)
    scene.add(fillLight)

    scene.add(new THREE.GridHelper(20, 20, 0xcccccc, 0xe5e5e5))

    const group = buildCabinetGroup(cabinet)
    scene.add(group)

    const box = new THREE.Box3().setFromObject(group)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const dist = maxDim * 2.0
    const isoDir = new THREE.Vector3(1, 1, 1).normalize()
    camera.position.copy(center).addScaledVector(isoDir, dist)
    camera.lookAt(center)
    controls.target.copy(center)
    controls.update()

    const ro = new ResizeObserver(() => {
      const w2 = mount.clientWidth
      const h2 = mount.clientHeight
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
      renderer.setSize(w2, h2)
    })
    ro.observe(mount)

    const animate = () => {
      animRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [cabinet])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: 300 }} />
}
