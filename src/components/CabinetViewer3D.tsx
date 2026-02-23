import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Cabinet } from '../types'

interface Props { cabinet: Cabinet }

export default function CabinetViewer3D({ cabinet }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const el = mountRef.current
    const W = el.clientWidth || 400
    const H = el.clientHeight || 350

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf1f5f9)

    const camera = new THREE.PerspectiveCamera(45, W / H, 1, 50000)
    const maxDim = Math.max(cabinet.widthMm, cabinet.depthMm, cabinet.heightMm)
    camera.position.set(cabinet.widthMm * 0.8, cabinet.heightMm * 0.8, maxDim * 1.5)
    camera.lookAt(cabinet.widthMm / 2, cabinet.heightMm / 2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    el.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(1, 2, 3)
    scene.add(dirLight)

    const { widthMm: cw, depthMm: cd, heightMm: ch,
            panelThicknessMm: T, shelvesCount,
            backPanelEnabled, backPanelThicknessMm: BT } = cabinet

    const mat = new THREE.MeshLambertMaterial({ color: 0xd4a96a })

    const addBox = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
      mesh.position.set(x + w / 2, y + h / 2, z + d / 2)
      scene.add(mesh)
    }

    addBox(T, ch, cd, 0, 0, 0)
    addBox(T, ch, cd, cw - T, 0, 0)
    addBox(cw - 2 * T, T, cd, T, 0, 0)
    addBox(cw - 2 * T, T, cd, T, ch - T, 0)

    for (let i = 1; i <= shelvesCount; i++) {
      const sy = (ch / (shelvesCount + 1)) * i - T / 2
      addBox(cw - 2 * T, T, cd, T, sy, 0)
    }

    if (backPanelEnabled) {
      addBox(cw, ch, BT, 0, 0, cd - BT)
    }

    renderer.render(scene, camera)

    return () => {
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [cabinet])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
