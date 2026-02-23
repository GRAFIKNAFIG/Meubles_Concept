import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { designRepo } from '../db'
import type { Design, FurnitureType, MaterialPreset } from '../types'
import Viewer3D from '../components/Viewer3D'
import styles from './Studio.module.css'

function newDesign(): Design {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    name: 'Nouveau meuble',
    type: 'shelf',
    width: 800,
    depth: 400,
    height: 1800,
    panelThickness: 18,
    shelvesCount: 3,
    backPanel: true,
    toeKick: 100,
    material: 'wood',
    createdAt: now,
    updatedAt: now,
  }
}

export default function Studio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [design, setDesign] = useState<Design>(newDesign())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (id) {
      designRepo.get(id).then(d => { if (d) setDesign(d) })
    }
  }, [id])

  const update = <K extends keyof Design>(key: K, value: Design[K]) => {
    setDesign(prev => ({ ...prev, [key]: value, updatedAt: Date.now() }))
    setSaved(false)
  }

  const save = async () => {
    await designRepo.save(design)
    setSaved(true)
    if (!id) navigate(`/studio/${design.id}`, { replace: true })
  }

  return (
    <div className={styles.studio}>
      <div className={styles.panel}>
        <h2>{t('studio.title')}</h2>

        <label>{t('studio.name')}
          <input value={design.name} onChange={e => update('name', e.target.value)} />
        </label>

        <label>{t('studio.type')}
          <select value={design.type} onChange={e => update('type', e.target.value as FurnitureType)}>
            <option value="shelf">{t('studio.typeShelf')}</option>
            <option value="wardrobe">{t('studio.typeWardrobe')}</option>
          </select>
        </label>

        <label>{t('studio.material')}
          <select value={design.material} onChange={e => update('material', e.target.value as MaterialPreset)}>
            <option value="wood">{t('studio.materialWood')}</option>
            <option value="lacquer">{t('studio.materialLacquer')}</option>
            <option value="metal">{t('studio.materialMetal')}</option>
          </select>
        </label>

        <label>{t('studio.width')} (mm)
          <input type="number" value={design.width} onChange={e => update('width', +e.target.value)} />
        </label>
        <label>{t('studio.depth')} (mm)
          <input type="number" value={design.depth} onChange={e => update('depth', +e.target.value)} />
        </label>
        <label>{t('studio.height')} (mm)
          <input type="number" value={design.height} onChange={e => update('height', +e.target.value)} />
        </label>
        <label>{t('studio.panelThickness')} (mm)
          <input type="number" value={design.panelThickness} onChange={e => update('panelThickness', +e.target.value)} />
        </label>
        <label>{t('studio.shelves')}
          <input type="number" value={design.shelvesCount} onChange={e => update('shelvesCount', +e.target.value)} />
        </label>
        <label>{t('studio.toeKick')} (mm)
          <input type="number" value={design.toeKick} onChange={e => update('toeKick', +e.target.value)} />
        </label>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={design.backPanel} onChange={e => update('backPanel', e.target.checked)} />
          {t('studio.backPanel')}
        </label>

        <button className={styles.saveBtn} onClick={save}>{t('studio.save')}</button>
        {saved && <span className={styles.savedMsg}>{t('studio.saved')}</span>}
      </div>

      <div className={styles.viewer}>
        <Viewer3D design={design} />
      </div>
    </div>
  )
}
