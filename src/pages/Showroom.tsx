import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Design } from '../types'
import { designRepo } from '../db'
import Viewer3D from '../components/Viewer3D'
import styles from './Showroom.module.css'

export default function Showroom() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [designs, setDesigns] = useState<Design[]>([])
  const [selected, setSelected] = useState<Design | null>(null)

  useEffect(() => {
    designRepo.getAll().then(d => setDesigns(d.slice().reverse()))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm(t('showroom.delete_confirm'))) return
    await designRepo.delete(id)
    setDesigns(prev => prev.filter(d => d.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{t('showroom.title')}</h1>
      {designs.length === 0 && (
        <p className={styles.empty}>{t('showroom.empty')}</p>
      )}
      <div className={styles.grid}>
        {designs.map(d => (
          <div key={d.id} className={`${styles.card} ${selected?.id === d.id ? styles.cardSelected : ''}`}
            onClick={() => setSelected(d)}>
            <div className={styles.cardThumb}>
              <Viewer3D design={d} />
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardName}>{d.name}</h3>
              <p className={styles.cardType}>{t(`showroom.type_${d.type}`)}</p>
              <p className={styles.cardDims}>{d.width} × {d.depth} × {d.height} mm</p>
              <div className={styles.cardActions}>
                <button className={styles.btnEdit} onClick={e => { e.stopPropagation(); navigate(`/studio/${d.id}`) }}>
                  {t('showroom.open_studio')}
                </button>
                <button className={styles.btnDelete} onClick={e => { e.stopPropagation(); handleDelete(d.id) }}>
                  {t('showroom.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <h2>{selected.name}</h2>
            <button onClick={() => setSelected(null)}>✕</button>
          </div>
          <div style={{ height: 400 }}>
            <Viewer3D design={selected} />
          </div>
          <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {t('showroom.dimensions')}: {selected.width} × {selected.depth} × {selected.height} mm
          </p>
        </div>
      )}
    </div>
  )
}
