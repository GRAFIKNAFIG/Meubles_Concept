import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { wardrobeProjectRepo } from '../db'
import type { WardrobeProject } from '../types'
import styles from './WardrobeProjects.module.css'

export default function WardrobeProjects() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<WardrobeProject[]>([])

  const load = async () => {
    const all = await wardrobeProjectRepo.getAll()
    setProjects(all.slice().reverse())
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    const now = Date.now()
    const p: WardrobeProject = {
      id: crypto.randomUUID(),
      name: t('wardrobe.newProject'),
      roomLengthMm: 3000,
      roomWidthMm: 600,
      createdAt: now,
      updatedAt: now,
    }
    await wardrobeProjectRepo.save(p)
    navigate(`/wardrobe/${p.id}`)
  }

  const del = async (id: string) => {
    if (!confirm(t('wardrobe.confirmDelete'))) return
    await wardrobeProjectRepo.delete(id)
    load()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>{t('wardrobe.title')}</h2>
        <button className={styles.btn} onClick={create}>{t('wardrobe.new')}</button>
      </div>
      {projects.length === 0 && <p className={styles.empty}>{t('wardrobe.empty')}</p>}
      <div className={styles.grid}>
        {projects.map(p => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardInfo}>
              <strong>{p.name}</strong>
              <span>{p.roomLengthMm} × {p.roomWidthMm} mm</span>
            </div>
            <div className={styles.cardActions}>
              <Link to={`/wardrobe/${p.id}`} className={styles.openBtn}>{t('wardrobe.open')}</Link>
              <button onClick={() => del(p.id)} className={styles.delBtn}>{t('wardrobe.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
