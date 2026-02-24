export async function svgElementToPngDataUrl(svg: SVGSVGElement, scale = 2): Promise<string> {
  const cloned = svg.cloneNode(true) as SVGSVGElement

  // Ensure width/height attributes exist
  if (!cloned.getAttribute('width')) cloned.setAttribute('width', String(svg.clientWidth || svg.getBoundingClientRect().width))
  if (!cloned.getAttribute('height')) cloned.setAttribute('height', String(svg.clientHeight || svg.getBoundingClientRect().height))

  const serializer = new XMLSerializer()
  const svgText = serializer.serializeToString(cloned)
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load SVG image for export'))
    })

    const w = img.width * scale
    const h = img.height * scale
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.floor(w))
    canvas.height = Math.max(1, Math.floor(h))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context not available')

    // white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(url)
  }
}