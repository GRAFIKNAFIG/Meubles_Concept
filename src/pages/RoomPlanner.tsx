import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { roomRepo, designRepo } from '../db'
import type { Room, Design, RoomItem } from '../types'
import styles from './RoomPlanner.module.css'

const SCALE = 0.1 // mm to px

function newRoom(): Room {
  const now = Date.now()
  return { id: crypto.randomUUID(), name: 'Nouvelle pièce', length: 5000, width: 4000, height: 2500, items: [], createdAt: now, updatedAt: now }
}

export default function RoomPlanner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [room, setRoom] = useState<Room>(newRoom())
  const [designs, setDesigns] = useState<Design[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    designRepo.getAll().then(setDesigns)
    if (id) roomRepo.get(id).then(r => { if (r) setRoom(r) })
  }, [id])

  const updateRoom = <K extends keyof Room>(key: K, value: Room[K]) => {
    setRoom(prev => ({ ...prev, [key]: value, updatedAt: Date.now() }))
  }

  const save = async () => {
    await roomRepo.save(room)
    if (!id) navigate(`/planner/${room.id}`, { replace: true })
  }

  const addItem = (designId: string) => {
    const item: RoomItem = { designId, x: 200, y: 200, rotation: 0 }
    updateRoom('items', [...room.items, item])
  }

  const removeItem = (idx: number) => {
    updateRoom('items', room.items.filter((_, i) => i !== idx))
  }

  return (
    <div className={styles.planner}>
      <div className={styles.sidebar}>
        <h2>{t('planner.title')}</h2>
        <label>{t('planner.name')}
          <input value={room.name} onChange={e => updateRoom('name', e.target.value)} />
        </label>
        <label>{t('planner.length')} (mm)
          <input type="number" value={room.length} onChange={e => updateRoom('length', +e.target.value)} />
        </label>
        <label>{t('planner.width')} (mm)
          <input type="number" value={room.width} onChange={e => updateRoom('width', +e.target.value)} />
        </label>

        <h3>{t('planner.addFurniture')}</h3>
        {designs.map(d => (
          <button key={d.id} className={styles.addBtn} onClick={() => addItem(d.id)}>+ {d.name}</button>
        ))}

        <h3>{t('planner.placed')}</h3>
        {room.items.map((item, idx) => {
          const d = designs.find(x => x.id === item.designId)
          return (
            <div key={idx} className={styles.placedItem}>
              <span>{d?.name ?? '?'}</span>
              <button onClick={() => removeItem(idx)} className={styles.removeBtn}>✕</button>
            </div>
          )
        })}

        <button className={styles.saveBtn} onClick={save}>{t('planner.save')}</button>
      </div>

      <div className={styles.canvas}>
        <svg
          width={room.length * SCALE}
          height={room.width * SCALE}
          style={{ background: '#fff', border: '2px solid #1e293b' }}
        >
          {room.items.map((item, idx) => {
            const d = designs.find(x => x.id === item.designId)
            if (!d) return null
            return (
              <g
                key={idx}
                transform={`translate(${item.x * SCALE},${item.y * SCALE}) rotate(${item.rotation})`}
                onClick={() => setSelectedId(item.designId)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  width={d.width * SCALE}
                  height={d.depth * SCALE}
                  fill={selectedId === item.designId ? '#bfdbfe' : '#dbeafe'}
                  stroke="#2563eb"
                  strokeWidth={1}
                />
                <text x={4} y={14} fontSize={10} fill="#1e293b">{d.name}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
