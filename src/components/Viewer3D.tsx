import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Design } from '../types'

interface Props { design: Design }

const MATERIAL_COLORS: Record<string, number> = {
  wood: 0xd4a96a,
  lacquer: 0xffffff,
  metal: 0x9ca3af,
}

export default function Viewer3D({ design }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const el = mountRef.current
    const W = el.clientWidth || 400
    const H = el.clientHeight || 350

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf1f5f9)

    const camera = new THREE.PerspectiveCamera(45, W / H, 1, 50000)
    const maxDim = Math.max(design.width, design.depth, design.height)
    camera.position.set(design.width * 0.8, design.height * 0.8, maxDim * 1.5)
    camera.lookAt(design.width / 2, design.height / 2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    el.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(1, 2, 3)
    scene.add(dirLight)

    const color = MATERIAL_COLORS[design.material] ?? 0xd4a96a
    const mat = new THREE.MeshLambertMaterial({ color })

    const { width: dw, depth: dd, height: dh,
            panelThickness: T, shelvesCount, toeKick, backPanel } = design

    const addBox = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
      mesh.position.set(x + w / 2, y + h / 2, z + d / 2)
      scene.add(mesh)
    }

    addBox(T, dh - toeKick, dd, 0, toeKick, 0)
    addBox(T, dh - toeKick, dd, dw - T, toeKick, 0)
    addBox(dw - 2 * T, T, dd, T, toeKick, 0)
    addBox(dw - 2 * T, T, dd, T, dh - T, 0)

    for (let i = 1; i <= shelvesCount; i++) {
      const sy = toeKick + ((dh - toeKick) / (shelvesCount + 1)) * i - T / 2
      addBox(dw - 2 * T, T, dd - 10, T, sy, 0)
    }

    if (backPanel) {
      addBox(dw, dh, 8, 0, 0, dd - 8)
    }

    // Mouse orbit
    let isDragging = false
    let prevX = 0
    let prevY = 0
    const spherical = { theta: 0, phi: Math.PI / 4 }
    const radius = maxDim * 1.5

    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY }
    const onMouseUp = () => { isDragging = false }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      spherical.theta -= (e.clientX - prevX) * 0.01
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - (e.clientY - prevY) * 0.01))
      prevX = e.clientX
      prevY = e.clientY
      camera.position.set(
        design.width / 2 + radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
        design.height / 2 + radius * Math.cos(spherical.phi),
        radius * Math.sin(spherical.phi) * Math.cos(spherical.theta),
      )
      camera.lookAt(design.width / 2, design.height / 2, 0)
      renderer.render(scene, camera)
    }

    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)

    renderer.render(scene, camera)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [design])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
}
