import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

export function exportGroupAsGlb(group: THREE.Group, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter()
    exporter.parse(
      group,
      (result) => {
        const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        resolve()
      },
      (err) => reject(err),
      { binary: true }
    )
  })
}
