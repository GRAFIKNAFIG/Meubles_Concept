import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { designRepo } from '../db'
import type { Design } from '../types'
import styles from './Showroom.module.css'

export default function Showroom() {
  const { t } = useTranslation()
  const [designs, setDesigns] = useState<Design[]>([])

  const load = async () => {
    const all = await designRepo.getAll()
    setDesigns(all.slice().reverse())
  }

  useEffect(() => { load() }, [])

  const del = async (id: string) => {
    if (!confirm(t('showroom.confirmDelete'))) return
    await designRepo.delete(id)
    load()
  }

  return (
    <div className={styles.showroom}>
      <div className={styles.header}>
        <h2>{t('showroom.title')}</h2>
        <Link to="/studio" className={styles.btn}>{t('showroom.new')}</Link>
      </div>
      {designs.length === 0 && <p className={styles.empty}>{t('showroom.empty')}</p>}
      <div className={styles.grid}>
        {designs.map(d => (
          <div key={d.id} className={styles.card}>
            <div className={styles.cardInfo}>
              <strong>{d.name}</strong>
              <span>{d.width} × {d.depth} × {d.height} mm</span>
              <span className={styles.type}>{t(`studio.type${d.type.charAt(0).toUpperCase() + d.type.slice(1)}`)}</span>
            </div>
            <div className={styles.cardActions}>
              <Link to={`/studio/${d.id}`} className={styles.editBtn}>{t('showroom.edit')}</Link>
              <button onClick={() => del(d.id)} className={styles.delBtn}>{t('showroom.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
