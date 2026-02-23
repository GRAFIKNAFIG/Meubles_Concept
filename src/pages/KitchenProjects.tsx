import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { kitchenProjectRepo } from '../db'
import type { KitchenProject } from '../types'
import styles from './KitchenProjects.module.css'

export default function KitchenProjects() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<KitchenProject[]>([])

  const load = async () => {
    const all = await kitchenProjectRepo.getAll()
    setProjects(all.slice().reverse())
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    const now = Date.now()
    const p: KitchenProject = {
      id: crypto.randomUUID(),
      name: t('kitchen.newProject'),
      roomLengthMm: 4000,
      roomWidthMm: 3000,
      createdAt: now,
      updatedAt: now,
    }
    await kitchenProjectRepo.save(p)
    navigate(`/kitchen/${p.id}`)
  }

  const del = async (id: string) => {
    if (!confirm(t('kitchen.confirmDelete'))) return
    await kitchenProjectRepo.delete(id)
    load()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>{t('kitchen.title')}</h2>
        <button className={styles.btn} onClick={create}>{t('kitchen.new')}</button>
      </div>
      {projects.length === 0 && <p className={styles.empty}>{t('kitchen.empty')}</p>}
      <div className={styles.grid}>
        {projects.map(p => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardInfo}>
              <strong>{p.name}</strong>
              <span>{p.roomLengthMm} × {p.roomWidthMm} mm</span>
            </div>
            <div className={styles.cardActions}>
              <Link to={`/kitchen/${p.id}`} className={styles.openBtn}>{t('kitchen.open')}</Link>
              <button onClick={() => del(p.id)} className={styles.delBtn}>{t('kitchen.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
