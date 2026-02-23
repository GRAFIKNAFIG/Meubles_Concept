import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import type { Design, Room, RoomItem } from '../types'
import { designRepo, roomRepo } from '../db'
import styles from './RoomPlanner.module.css'

function uuid() { return crypto.randomUUID() }

const SCALE = 0.1 // mm → px (1mm = 0.1px, so 1000mm = 100px)
const GRID_MM = 100

function mmToPx(mm: number) { return mm * SCALE }
function pxToMm(px: number) { return Math.round(px / SCALE) }
function snapToGrid(mm: number) { return Math.round(mm / GRID_MM) * GRID_MM }

interface DragState {
  itemIndex: number
  startMouseX: number
  startMouseY: number
  startItemX: number
  startItemY: number
}

function rectsOverlap(
  ax: number, ay: number, aw: number, ad: number,
  bx: number, by: number, bw: number, bd: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bd && ay + ad > by
}

function checkOverlaps(items: RoomItem[], designs: Map<string, Design>): boolean {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j]
      const da = designs.get(a.designId)
      const db = designs.get(b.designId)
      if (!da || !db) continue
      if (rectsOverlap(a.x, a.y, da.width, da.depth, b.x, b.y, db.width, db.depth)) return true
    }
  }
  return false
}

const DEFAULT_ROOM: Omit<Room, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Ma pièce',
  length: 5000,
  width: 4000,
  height: 2500,
  items: [],
}

export default function RoomPlanner() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()

  const [roomForm, setRoomForm] = useState({ ...DEFAULT_ROOM })
  const [items, setItems] = useState<RoomItem[]>([])
  const [designs, setDesigns] = useState<Design[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [gridSnap, setGridSnap] = useState(true)
  const [hasOverlap, setHasOverlap] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const createdAtRef = useRef<number | null>(null)

  const designMap = useRef<Map<string, Design>>(new Map())

  useEffect(() => {
    designRepo.getAll().then(ds => {
      setDesigns(ds)
      const m = new Map<string, Design>()
      ds.forEach(d => m.set(d.id, d))
      designMap.current = m
    })
  }, [])

  useEffect(() => {
    if (id) {
      roomRepo.get(id).then(r => {
        if (r) {
          createdAtRef.current = r.createdAt
          setRoomForm({ name: r.name, length: r.length, width: r.width, height: r.height, items: r.items })
          setItems(r.items)
        }
      })
    }
  }, [id])

  useEffect(() => {
    setHasOverlap(checkOverlaps(items, designMap.current))
  }, [items])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function handleSave() {
    const now = Date.now()
    const room: Room = {
      ...roomForm,
      items,
      id: id || uuid(),
      createdAt: id ? (createdAtRef.current ?? now) : now,
      updatedAt: now,
    }
    await roomRepo.save(room)
    showToast(t('planner.saved_ok'))
    if (!id) navigate(`/planner/${room.id}`)
  }

  function addItem(designId: string) {
    const design = designMap.current.get(designId)
    if (!design) return
    const newItem: RoomItem = {
      designId,
      x: snapToGrid(roomForm.length / 2 - design.width / 2),
      y: snapToGrid(roomForm.width / 2 - design.depth / 2),
      rotation: 0,
    }
    setItems(prev => [...prev, newItem])
    setSelectedIdx(items.length)
    setShowAddMenu(false)
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
    if (selectedIdx === idx) setSelectedIdx(null)
  }

  function updateItemField(idx: number, field: keyof RoomItem, value: number) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it))
  }

  const onMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedIdx(idx)
    dragRef.current = {
      itemIndex: idx,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startItemX: items[idx].x,
      startItemY: items[idx].y,
    }
  }, [items])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = pxToMm(e.clientX - drag.startMouseX)
    const dy = pxToMm(e.clientY - drag.startMouseY)
    let newX = drag.startItemX + dx
    let newY = drag.startItemY + dy
    if (gridSnap) { newX = snapToGrid(newX); newY = snapToGrid(newY) }
    const design = designMap.current.get(dragRef.current ? items[drag.itemIndex]?.designId ?? '' : '')
    const fw = design?.width ?? 0
    const fd = design?.depth ?? 0
    newX = Math.max(0, Math.min(newX, roomForm.length - fw))
    newY = Math.max(0, Math.min(newY, roomForm.width - fd))
    setItems(prev => prev.map((it, i) => i === drag.itemIndex ? { ...it, x: newX, y: newY } : it))
  }, [gridSnap, roomForm.length, roomForm.width, items])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const roomW = mmToPx(roomForm.length)
  const roomH = mmToPx(roomForm.width)

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{t('planner.title')}</h1>

      {/* Room dimensions */}
      <div className={styles.roomForm}>
        <div className={styles.field}>
          <label>{t('planner.room_name')}</label>
          <input className={styles.input} value={roomForm.name}
            onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className={styles.field}>
          <label>{t('planner.room_length')}</label>
          <input className={styles.input} type="number" min={500} max={20000} value={roomForm.length}
            onChange={e => setRoomForm(p => ({ ...p, length: Number(e.target.value) }))} />
        </div>
        <div className={styles.field}>
          <label>{t('planner.room_width')}</label>
          <input className={styles.input} type="number" min={500} max={20000} value={roomForm.width}
            onChange={e => setRoomForm(p => ({ ...p, width: Number(e.target.value) }))} />
        </div>
        <div className={styles.field}>
          <label>{t('planner.room_height')}</label>
          <input className={styles.input} type="number" min={200} max={5000} value={roomForm.height}
            onChange={e => setRoomForm(p => ({ ...p, height: Number(e.target.value) }))} />
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.relative}>
          <button className={styles.btnAdd} onClick={() => setShowAddMenu(v => !v)}>
            + {t('planner.add_furniture')}
          </button>
          {showAddMenu && (
            <div className={styles.dropdown}>
              {designs.length === 0
                ? <p className={styles.dropdownEmpty}>{t('planner.no_designs')}</p>
                : designs.map(d => (
                  <button key={d.id} className={styles.dropdownItem} onClick={() => addItem(d.id)}>
                    {d.name} <span className={styles.dropdownDims}>{d.width}×{d.depth}mm</span>
                  </button>
                ))
              }
            </div>
          )}
        </div>
        <label className={styles.snapLabel}>
          <input type="checkbox" checked={gridSnap} onChange={e => setGridSnap(e.target.checked)} />
          {t('planner.grid_snap')}
        </label>
        {hasOverlap && <span className={styles.overlapWarning}>⚠ {t('planner.overlap_warning')}</span>}
        <button className={styles.btnSave} onClick={handleSave}>{t('planner.save_room')}</button>
      </div>

      <div className={styles.plannerLayout}>
        {/* Canvas */}
        <div className={styles.canvasWrapper}>
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{ width: roomW, height: roomH }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Grid lines */}
            {Array.from({ length: Math.floor(roomForm.length / GRID_MM) + 1 }, (_, i) => (
              <div key={`v${i}`} className={styles.gridLine} style={{
                left: mmToPx(i * GRID_MM), top: 0, width: 1, height: '100%', position: 'absolute'
              }} />
            ))}
            {Array.from({ length: Math.floor(roomForm.width / GRID_MM) + 1 }, (_, i) => (
              <div key={`h${i}`} className={styles.gridLine} style={{
                top: mmToPx(i * GRID_MM), left: 0, height: 1, width: '100%', position: 'absolute'
              }} />
            ))}

            {/* Furniture items */}
            {items.map((item, idx) => {
              const design = designMap.current.get(item.designId)
              if (!design) return null
              const iw = mmToPx(design.width)
              const ih = mmToPx(design.depth)
              return (
                <div
                  key={idx}
                  className={`${styles.furnitureItem} ${selectedIdx === idx ? styles.furnitureItemSelected : ''}`}
                  style={{
                    left: mmToPx(item.x),
                    top: mmToPx(item.y),
                    width: iw,
                    height: ih,
                    transform: `rotate(${item.rotation}deg)`,
                    position: 'absolute',
                  }}
                  onMouseDown={e => onMouseDown(e, idx)}
                >
                  <span className={styles.furnitureName}>{design.name}</span>
                </div>
              )
            })}
          </div>
          <div className={styles.canvasDims}>
            {roomForm.length} × {roomForm.width} mm
          </div>
        </div>

        {/* Item list / properties */}
        <aside className={styles.itemPanel}>
          {items.length === 0
            ? <p className={styles.empty}>{t('planner.no_furniture')}</p>
            : items.map((item, idx) => {
              const design = designMap.current.get(item.designId)
              return (
                <div key={idx}
                  className={`${styles.itemRow} ${selectedIdx === idx ? styles.itemRowSelected : ''}`}
                  onClick={() => setSelectedIdx(idx)}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{design?.name ?? item.designId}</span>
                    <span className={styles.itemPos}>X:{item.x} Y:{item.y} R:{item.rotation}°</span>
                  </div>
                  {selectedIdx === idx && (
                    <div className={styles.itemEdit}>
                      <label>{t('planner.x_pos')}
                        <input type="number" className={styles.smallInput} value={item.x}
                          onChange={e => updateItemField(idx, 'x', Number(e.target.value))} />
                      </label>
                      <label>{t('planner.y_pos')}
                        <input type="number" className={styles.smallInput} value={item.y}
                          onChange={e => updateItemField(idx, 'y', Number(e.target.value))} />
                      </label>
                      <label>{t('planner.rotation')}
                        <input type="number" step={15} className={styles.smallInput} value={item.rotation}
                          onChange={e => updateItemField(idx, 'rotation', Number(e.target.value))} />
                      </label>
                      <button className={styles.btnRemove} onClick={() => removeItem(idx)}>
                        {t('planner.remove')}
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          }
        </aside>
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
