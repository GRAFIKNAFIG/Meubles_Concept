import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import type { Design } from '../types'
import { designRepo } from '../db'
import Viewer3D from '../components/Viewer3D'
import * as THREE from 'three'
import styles from './Studio.module.css'

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

const DEFAULTS: Omit<Design, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  type: 'shelf',
  width: 800,
  depth: 300,
  height: 2000,
  panelThickness: 18,
  shelvesCount: 4,
  backPanel: true,
  toeKick: 100,
  material: 'wood',
}

type FormState = Omit<Design, 'id' | 'createdAt' | 'updatedAt'>

interface FieldDef {
  key: keyof FormState
  min?: number
  max?: number
  step?: number
  type: 'text' | 'number' | 'select' | 'checkbox'
  options?: { value: string; labelKey: string }[]
}

const FIELDS: FieldDef[] = [
  { key: 'name', type: 'text' },
  { key: 'type', type: 'select', options: [
    { value: 'shelf', labelKey: 'studio.type_shelf' },
    { value: 'wardrobe', labelKey: 'studio.type_wardrobe' },
  ]},
  { key: 'width', type: 'number', min: 100, max: 3000, step: 1 },
  { key: 'depth', type: 'number', min: 100, max: 1000, step: 1 },
  { key: 'height', type: 'number', min: 200, max: 3000, step: 1 },
  { key: 'panelThickness', type: 'number', min: 6, max: 50, step: 1 },
  { key: 'shelvesCount', type: 'number', min: 0, max: 20, step: 1 },
  { key: 'toeKick', type: 'number', min: 0, max: 300, step: 1 },
  { key: 'backPanel', type: 'checkbox' },
  { key: 'material', type: 'select', options: [
    { value: 'wood', labelKey: 'studio.mat_wood' },
    { value: 'lacquer', labelKey: 'studio.mat_lacquer' },
    { value: 'metal', labelKey: 'studio.mat_metal' },
  ]},
]

function omitMeta(d: Design): FormState {
  return {
    name: d.name,
    type: d.type,
    width: d.width,
    depth: d.depth,
    height: d.height,
    panelThickness: d.panelThickness,
    shelvesCount: d.shelvesCount,
    backPanel: d.backPanel,
    toeKick: d.toeKick,
    material: d.material,
  }
}

export default function Studio() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({ ...DEFAULTS })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [liveDesign, setLiveDesign] = useState<Design | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    if (id) {
      designRepo.get(id).then(d => {
        if (d) {
          const rest = omitMeta(d)
          setForm(rest)
          setLiveDesign(d)
        }
      })
    } else {
      setLiveDesign({ ...DEFAULTS, id: '__preview__', createdAt: 0, updatedAt: 0, name: 'Preview' })
    }
  }, [id])

  function validate(f: FormState) {
    const errs: Partial<Record<keyof FormState, string>> = {}
    FIELDS.forEach(field => {
      if (field.type === 'number' && field.min !== undefined) {
        const val = f[field.key] as number
        if (val < field.min) errs[field.key] = t('studio.validation_min', { min: field.min })
        if (field.max !== undefined && val > field.max)
          errs[field.key] = t('studio.validation_max', { max: field.max })
      }
    })
    if (!f.name.trim()) errs.name = t('studio.validation_required')
    return errs
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    const next = { ...form, [key]: value }
    setForm(next)
    setErrors(prev => ({ ...prev, [key]: undefined }))
    setLiveDesign({ ...next, id: id || '__preview__', createdAt: 0, updatedAt: Date.now() })
  }

  const handleSceneReady = useCallback((g: THREE.Group) => {
    groupRef.current = g
  }, [])

  async function handleSave() {
    const errs = validate(form)
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return }
    const now = Date.now()
    const design: Design = {
      ...form,
      id: id || uuid(),
      createdAt: id ? (liveDesign?.createdAt ?? now) : now,
      updatedAt: now,
    }
    try {
      await designRepo.save(design)
      showToast(t('studio.saved_ok'))
      if (!id) navigate(`/studio/${design.id}`)
    } catch {
      showToast(t('studio.saved_error'))
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleExport() {
    if (!liveDesign) return
    const { buildFurnitureGroup } = await import('../utils/geometry')
    const { exportGroupAsGlb } = await import('../utils/exportGlb')
    const group = buildFurnitureGroup(liveDesign)
    const name = form.name.trim() || 'meuble'
    await exportGroupAsGlb(group, `${name}.glb`)
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{id ? t('studio.edit_design') : t('studio.new_design')}</h1>
      <div className={styles.layout}>
        <aside className={styles.panel}>
          {FIELDS.map(field => (
            <div key={String(field.key)} className={styles.field}>
              <label className={styles.label}>{t(`studio.${String(field.key)}`)}</label>
              {field.type === 'text' && (
                <input
                  className={styles.input}
                  type="text"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                />
              )}
              {field.type === 'number' && (
                <input
                  className={styles.input}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={form[field.key] as number}
                  onChange={e => updateField(field.key, Number(e.target.value) as FormState[typeof field.key])}
                />
              )}
              {field.type === 'select' && (
                <select
                  className={styles.input}
                  value={form[field.key] as string}
                  onChange={e => updateField(field.key, e.target.value as FormState[typeof field.key])}
                >
                  {field.options?.map(o => (
                    <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                  ))}
                </select>
              )}
              {field.type === 'checkbox' && (
                <input
                  type="checkbox"
                  checked={form[field.key] as boolean}
                  onChange={e => updateField(field.key, e.target.checked as FormState[typeof field.key])}
                />
              )}
              {errors[field.key] && <span className={styles.error}>{errors[field.key]}</span>}
            </div>
          ))}
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={handleSave}>{t('studio.save')}</button>
            <button className={styles.btnSecondary} onClick={handleExport}>{t('studio.export_glb')}</button>
          </div>
        </aside>
        <div className={styles.viewer}>
          {liveDesign && <Viewer3D design={liveDesign} onSceneReady={handleSceneReady} />}
        </div>
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
