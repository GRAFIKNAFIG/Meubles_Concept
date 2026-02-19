import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import type { Room, RoomItem, Design } from '../types'
import { designRepo, roomRepo } from '../db'
import styles from './RoomPlanner.module.css'

function uuid() {
  return crypto.randomUUID()
}

const SCALE = 0.05
const GRID = 100

function snapVal(v: number) { return Math.round(v / GRID) * GRID }

function itemRect(item: RoomItem, designs: Map<string, Design>) {
  const d = designs.get(item.designId)
  if (!d) return null
  const rot = item.rotation % 180 !== 0
  const w = rot ? d.depth : d.width
  const h = rot ? d.width : d.depth
  return { x: item.x, y: item.y, w, h }
}

function hasOverlap(items: RoomItem[], designs: Map<string, Design>): boolean {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = itemRect(items[i], designs)
      const b = itemRect(items[j], designs)
      if (!a || !b) continue
      if (a.x < b.x + b.w && a.x + a.w > b.x &&
          a.y < b.y + b.h && a.y + a.h > b.y) return true
    }
  }
  return false
}

interface DragState { itemIdx: number; startMx: number; startMy: number; origX: number; origY: number }

type RoomState = Omit<Room, 'id' | 'createdAt' | 'updatedAt'>

function omitRoomMeta(r: Room): RoomState {
  return {
    name: r.name,
    length: r.length,
    width: r.width,
    height: r.height,
    items: r.items,
  }
}

export default function RoomPlanner() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState<RoomState>({
    name: '', length: 4000, width: 3000, height: 2500, items: []
  })
  const [designs, setDesigns] = useState<Design[]>([])
  const [designMap, setDesignMap] = useState<Map<string, Design>>(new Map())
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [snapEnabled, setSnapEnabled] = useState(true)
  const dragRef = useRef<DragState | null>(null)
  const snapRef = useRef(snapEnabled)
  snapRef.current = snapEnabled

  useEffect(() => {
    designRepo.getAll().then(ds => {
      setDesigns(ds)
      setDesignMap(new Map(ds.map(d => [d.id, d])))
    })
    if (id) {
      roomRepo.get(id).then(r => {
        if (r) {
          setRoom(omitRoomMeta(r))
        }
      })
    }
  }, [id])

  const overlap = hasOverlap(room.items, designMap)

  function addItem(designId: string) {
    setRoom(prev => ({ ...prev, items: [...prev.items, { designId, x: 0, y: 0, rotation: 0 }] }))
    setShowAddModal(false)
  }

  function removeItem(idx: number) {
    setRoom(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
    if (selectedItem === idx) setSelectedItem(null)
  }

  function rotateItem(idx: number) {
    setRoom(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, rotation: (it.rotation + 90) % 360 } : it)
    }))
  }

  const updatePos = useCallback((idx: number, x: number, y: number) => {
    const xv = snapRef.current ? snapVal(x) : x
    const yv = snapRef.current ? snapVal(y) : y
    setRoom(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, x: Math.max(0, xv), y: Math.max(0, yv) } : it)
    }))
  }, [])

  function onMouseDown(e: React.MouseEvent, idx: number) {
    e.preventDefault()
    setRoom(prev => {
      const it = prev.items[idx]
      if (it) {
        dragRef.current = { itemIdx: idx, startMx: e.clientX, startMy: e.clientY, origX: it.x, origY: it.y }
      }
      return prev
    })
    setSelectedItem(idx)
  }

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return
    const { itemIdx, startMx, startMy, origX, origY } = dragRef.current
    const dx = (e.clientX - startMx) / SCALE
    const dy = (e.clientY - startMy) / SCALE
    updatePos(itemIdx, origX + dx, origY + dy)
  }, [updatePos])

  const onMouseUp = useCallback(() => { dragRef.current = null }, [])

  async function handleSave() {
    if (!room.name.trim()) { showToast(t('studio.validation_required')); return }
    const now = Date.now()
    const r: Room = { ...room, id: id || uuid(), createdAt: now, updatedAt: now }
    await roomRepo.save(r)
    showToast(t('planner.saved_ok'))
    if (!id) navigate(`/planner/${r.id}`)
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const svgW = room.length * SCALE
  const svgH = room.width * SCALE

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{t('planner.title')}</h1>
      <div className={styles.layout}>
        <aside className={styles.panel}>
          <div className={styles.field}>
            <label className={styles.label}>{t('planner.room_name')}</label>
            <input className={styles.input} value={room.name} onChange={e => setRoom(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('planner.room_length')}</label>
            <input className={styles.input} type="number" min={500} max={20000} value={room.length}
              onChange={e => setRoom(p => ({ ...p, length: Number(e.target.value) }))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('planner.room_width')}</label>
            <input className={styles.input} type="number" min={500} max={20000} value={room.width}
              onChange={e => setRoom(p => ({ ...p, width: Number(e.target.value) }))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('planner.room_height')}</label>
            <input className={styles.input} type="number" min={1000} max={6000} value={room.height}
              onChange={e => setRoom(p => ({ ...p, height: Number(e.target.value) }))} />
          </div>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={snapEnabled} onChange={e => setSnapEnabled(e.target.checked)} />
            {t('planner.grid_snap')}
          </label>

          <button className={styles.btnAdd} onClick={() => setShowAddModal(true)}>
            + {t('planner.add_furniture')}
          </button>

          {overlap && (
            <div className={styles.warning}>⚠ {t('planner.overlap_warning')}</div>
          )}

          <div className={styles.itemList}>
            {room.items.length === 0 && <p className={styles.noItem}>{t('planner.no_furniture')}</p>}
            {room.items.map((item, idx) => {
              const d = designMap.get(item.designId)
              return (
                <div key={idx} className={`${styles.itemRow} ${selectedItem === idx ? styles.itemRowSelected : ''}`}
                  onClick={() => setSelectedItem(idx)}>
                  <span className={styles.itemName}>{d?.name || item.designId}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className={styles.btnRotate} onClick={e => { e.stopPropagation(); rotateItem(idx) }}>↻</button>
                    <button className={styles.btnRemove} onClick={e => { e.stopPropagation(); removeItem(idx) }}>✕</button>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedItem !== null && room.items[selectedItem] && (
            <div className={styles.posEdit}>
              <label className={styles.label}>{t('planner.x_pos')}</label>
              <input className={styles.input} type="number" step={snapEnabled ? GRID : 1}
                value={room.items[selectedItem].x}
                onChange={e => updatePos(selectedItem, Number(e.target.value), room.items[selectedItem].y)} />
              <label className={styles.label}>{t('planner.y_pos')}</label>
              <input className={styles.input} type="number" step={snapEnabled ? GRID : 1}
                value={room.items[selectedItem].y}
                onChange={e => updatePos(selectedItem, room.items[selectedItem].x, Number(e.target.value))} />
              <label className={styles.label}>{t('planner.rotation')}</label>
              <select className={styles.input}
                value={room.items[selectedItem].rotation}
                onChange={e => setRoom(prev => ({
                  ...prev, items: prev.items.map((it, i) => i === selectedItem
                    ? { ...it, rotation: Number(e.target.value) } : it)
                }))}>
                {[0,90,180,270].map(r => <option key={r} value={r}>{r}°</option>)}
              </select>
            </div>
          )}

          <button className={styles.btnSave} onClick={handleSave}>{t('planner.save_room')}</button>
        </aside>

        <div className={styles.planWrapper}>
          <svg
            width={svgW}
            height={svgH}
            style={{ border: '2px solid #334155', background: '#f8fafc', display: 'block', maxWidth: '100%' }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {Array.from({ length: Math.ceil(room.length / GRID) + 1 }, (_, i) => (
              <line key={`gx${i}`} x1={i * GRID * SCALE} y1={0} x2={i * GRID * SCALE} y2={svgH}
                stroke="#e2e8f0" strokeWidth={0.5} />
            ))}
            {Array.from({ length: Math.ceil(room.width / GRID) + 1 }, (_, i) => (
              <line key={`gy${i}`} x1={0} y1={i * GRID * SCALE} x2={svgW} y2={i * GRID * SCALE}
                stroke="#e2e8f0" strokeWidth={0.5} />
            ))}
            {room.items.map((item, idx) => {
              const d = designMap.get(item.designId)
              if (!d) return null
              const rot = item.rotation % 180 !== 0
              const w = (rot ? d.depth : d.width) * SCALE
              const h = (rot ? d.width : d.depth) * SCALE
              const isSelected = selectedItem === idx
              return (
                <g key={idx}
                  transform={`translate(${item.x * SCALE}, ${item.y * SCALE})`}
                  onMouseDown={e => onMouseDown(e, idx)}
                  style={{ cursor: 'grab' }}>
                  <rect width={w} height={h}
                    fill={isSelected ? '#bfdbfe' : '#dbeafe'}
                    stroke={isSelected ? '#1d4ed8' : '#3b82f6'}
                    strokeWidth={isSelected ? 2 : 1}
                    rx={2} />
                  <text x={w/2} y={h/2} textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.min(10, w * 0.4, h * 0.4)}
                    fill="#1e3a8a" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {d.name}
                  </text>
                  {item.rotation !== 0 && (
                    <text x={w-4} y={h-3} textAnchor="end" fontSize={7} fill="#64748b"
                      style={{ pointerEvents: 'none' }}>
                      {item.rotation}°
                    </text>
                  )}
                </g>
              )
            })}
            <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize={9} fill="#64748b">
              {room.length} mm
            </text>
            <text x={8} y={svgH / 2} textAnchor="middle" fontSize={9} fill="#64748b"
              transform={`rotate(-90, 8, ${svgH/2})`}>
              {room.width} mm
            </text>
          </svg>
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>{t('planner.select_design')}</h2>
            {designs.length === 0 ? <p>{t('planner.no_designs')}</p> : (
              <div className={styles.designList}>
                {designs.map(d => (
                  <button key={d.id} className={styles.designBtn} onClick={() => addItem(d.id)}>
                    <strong>{d.name}</strong>
                    <span>{d.width}×{d.depth}×{d.height} mm</span>
                  </button>
                ))}
              </div>
            )}
            <button className={styles.btnClose} onClick={() => setShowAddModal(false)}>{t('common.close')}</button>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
