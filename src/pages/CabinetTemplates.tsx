import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cabinetTemplateRepo, kitchenProjectRepo, wardrobeProjectRepo, cabinetRepo } from '../db'
import type { CabinetTemplate, CabinetVariant, PanelType, PanelColor, FrontsConfig, FrontConfig, HandleType, DoorOption } from '../types'
import CabinetViewer3D from '../components/CabinetViewer3D'
import styles from './CabinetTemplates.module.css'

function defaultFronts(): FrontsConfig {
  return { type: 'doors', overlayMm: 2, gapMm: 2, handleType: 'none', doorOption: 'single', drawersCount: 1, drawersEqualHeight: true }
}

function newTemplate(): CabinetTemplate {
  const now = Date.now()
  return {
    id: crypto.randomUUID(), name: 'Nouveau gabarit', variant: 'base',
    widthMm: 600, depthMm: 560, heightMm: 720, panelThicknessMm: 18, shelvesCount: 1,
    panelType: 'MELAMINE', panelColor: 'WHITE', backPanelThicknessMm: 8, backPanelEnabled: true,
    fronts: defaultFronts(), toeKickMm: 100, createdAt: now, updatedAt: now,
  }
}

export default function CabinetTemplates() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<CabinetTemplate[]>([])
  const [editing, setEditing] = useState<CabinetTemplate | null>(null)
  const [preview, setPreview] = useState<CabinetTemplate | null>(null)
  const [addToProject, setAddToProject] = useState<CabinetTemplate | null>(null)
  const [kitchenProjects, setKitchenProjects] = useState<{ id: string; name: string }[]>([])
  const [wardrobeProjects, setWardrobeProjects] = useState<{ id: string; name: string }[]>([])

  const load = async () => {
    const all = await cabinetTemplateRepo.getAll()
    setTemplates(all.slice().reverse())
    const kp = await kitchenProjectRepo.getAll()
    setKitchenProjects(kp)
    const wp = await wardrobeProjectRepo.getAll()
    setWardrobeProjects(wp)
  }

  useEffect(() => { load() }, [])

  const saveTemplate = async () => {
    if (!editing) return
    await cabinetTemplateRepo.save({ ...editing, updatedAt: Date.now() })
    setEditing(null)
    load()
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm(t('templates.confirmDelete'))) return
    await cabinetTemplateRepo.delete(id)
    load()
  }

  const duplicate = async (tpl: CabinetTemplate) => {
    const now = Date.now()
    await cabinetTemplateRepo.save({ ...tpl, id: crypto.randomUUID(), name: `${tpl.name} (copie)`, createdAt: now, updatedAt: now })
    load()
  }

  const addToProjectAction = async (projectId: string, projectType: 'kitchen' | 'wardrobe') => {
    if (!addToProject) return
    const now = Date.now()
    await cabinetRepo.save({
      id: crypto.randomUUID(), projectId, templateId: addToProject.id,
      name: addToProject.name, variant: addToProject.variant, widthMm: addToProject.widthMm,
      depthMm: addToProject.depthMm, heightMm: addToProject.heightMm, panelThicknessMm: addToProject.panelThicknessMm,
      shelvesCount: addToProject.shelvesCount, panelType: addToProject.panelType, panelColor: addToProject.panelColor,
      backPanelThicknessMm: addToProject.backPanelThicknessMm, backPanelEnabled: addToProject.backPanelEnabled,
      fronts: { ...addToProject.fronts }, toeKickMm: addToProject.toeKickMm, quantity: 1, createdAt: now, updatedAt: now,
    })
    setAddToProject(null)
    navigate(projectType === 'kitchen' ? `/kitchen/${projectId}` : `/wardrobe/${projectId}`)
  }

  const updateEditing = <K extends keyof CabinetTemplate>(key: K, value: CabinetTemplate[K]) => {
    setEditing(prev => prev ? { ...prev, [key]: value } : null)
  }
  const updateFronts = <K extends keyof FrontsConfig>(key: K, value: FrontsConfig[K]) => {
    setEditing(prev => prev ? { ...prev, fronts: { ...prev.fronts, [key]: value } } : null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>{t('templates.title')}</h2>
        <button className={styles.addBtn} onClick={() => setEditing(newTemplate())}>{t('templates.new')}</button>
      </div>
      {templates.length === 0 && <p className={styles.empty}>{t('templates.empty')}</p>}
      <div className={styles.grid}>
        {templates.map(tpl => (
          <div key={tpl.id} className={styles.card} onClick={() => setPreview(tpl)}>
            <strong>{tpl.name}</strong>
            <span>{tpl.widthMm} × {tpl.depthMm} × {tpl.heightMm} mm</span>
            <span className={styles.variant}>{t(`cabinet.variant${tpl.variant.charAt(0).toUpperCase() + tpl.variant.slice(1)}`)}</span>
            <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
              <button onClick={() => setEditing({ ...tpl })} className={styles.editBtn}>{t('templates.edit')}</button>
              <button onClick={() => duplicate(tpl)} className={styles.dupBtn}>{t('templates.duplicate')}</button>
              <button onClick={() => setAddToProject(tpl)} className={styles.addProjectBtn}>{t('templates.addToProject')}</button>
              <button onClick={() => deleteTemplate(tpl.id)} className={styles.delBtn}>{t('templates.delete')}</button>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.previewHeader}>
              <h3>{preview.name}</h3>
              <button onClick={() => setPreview(null)}>✕</button>
            </div>
            <div className={styles.viewer3dWrap}>
              <CabinetViewer3D cabinet={{ ...preview, id: preview.id, projectId: '', quantity: 1 }} />
            </div>
          </div>
        </div>
      )}

      {addToProject && (
        <div className={styles.modal}>
          <div className={styles.modalSmall}>
            <h3>{t('templates.addToProject')}: {addToProject.name}</h3>
            {kitchenProjects.length > 0 && (
              <>
                <p className={styles.groupLabel}>{t('nav.kitchen')}</p>
                {kitchenProjects.map(p => (
                  <button key={p.id} className={styles.projectBtn} onClick={() => addToProjectAction(p.id, 'kitchen')}>{p.name}</button>
                ))}
              </>
            )}
            {wardrobeProjects.length > 0 && (
              <>
                <p className={styles.groupLabel}>{t('nav.wardrobe')}</p>
                {wardrobeProjects.map(p => (
                  <button key={p.id} className={styles.projectBtn} onClick={() => addToProjectAction(p.id, 'wardrobe')}>{p.name}</button>
                ))}
              </>
            )}
            {kitchenProjects.length === 0 && wardrobeProjects.length === 0 && (
              <p className={styles.empty}>{t('templates.noProjects')}</p>
            )}
            <button className={styles.cancelBtn} onClick={() => setAddToProject(null)}>{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {editing && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{t('templates.editTemplate')}</h3>
            <div className={styles.formGrid}>
              <label>{t('cabinet.name')}<input value={editing.name} onChange={e => updateEditing('name', e.target.value)} /></label>
              <label>{t('cabinet.variant')}
                <select value={editing.variant} onChange={e => updateEditing('variant', e.target.value as CabinetVariant)}>
                  <option value="base">{t('cabinet.variantBase')}</option>
                  <option value="wall">{t('cabinet.variantWall')}</option>
                  <option value="tall">{t('cabinet.variantTall')}</option>
                </select>
              </label>
              <label>{t('cabinet.width')} (mm)<input type="number" value={editing.widthMm} onChange={e => updateEditing('widthMm', +e.target.value)} /></label>
              <label>{t('cabinet.depth')} (mm)<input type="number" value={editing.depthMm} onChange={e => updateEditing('depthMm', +e.target.value)} /></label>
              <label>{t('cabinet.height')} (mm)<input type="number" value={editing.heightMm} onChange={e => updateEditing('heightMm', +e.target.value)} /></label>
              <label>{t('cabinet.thickness')} (mm)<input type="number" value={editing.panelThicknessMm} onChange={e => updateEditing('panelThicknessMm', +e.target.value)} /></label>
              <label>{t('cabinet.shelves')}<input type="number" value={editing.shelvesCount} onChange={e => updateEditing('shelvesCount', +e.target.value)} /></label>
              <label>{t('cabinet.toeKick')} (mm)<input type="number" value={editing.toeKickMm} onChange={e => updateEditing('toeKickMm', +e.target.value)} /></label>
              <label>{t('cabinet.panelType')}
                <select value={editing.panelType} onChange={e => updateEditing('panelType', e.target.value as PanelType)}>
                  <option value="MDF">MDF</option>
                  <option value="MELAMINE">MÉLAMINE</option>
                </select>
              </label>
              <label>{t('cabinet.panelColor')}
                <select value={editing.panelColor} onChange={e => updateEditing('panelColor', e.target.value as PanelColor)}>
                  {(['WHITE','WOOD','BROWN','BLACK','GRAY','BLUE','GREEN','RED'] as PanelColor[]).map(c => (
                    <option key={c} value={c}>{t(`cabinet.color${c}`)}</option>
                  ))}
                </select>
              </label>
              <label style={{gridColumn:'1/-1'}}>{t('cabinet.frontsType')}
                <select value={editing.fronts.type} onChange={e => updateFronts('type', e.target.value as FrontConfig)}>
                  <option value="none">{t('cabinet.frontsNone')}</option>
                  <option value="doors">{t('cabinet.frontsDoors')}</option>
                  <option value="drawers">{t('cabinet.frontsDrawers')}</option>
                  <option value="mixed">{t('cabinet.frontsMixed')}</option>
                </select>
              </label>
              {(editing.fronts.type === 'doors' || editing.fronts.type === 'mixed') && (
                <label>{t('cabinet.doorOption')}
                  <select value={editing.fronts.doorOption || 'single'} onChange={e => updateFronts('doorOption', e.target.value as DoorOption)}>
                    <option value="single">{t('cabinet.doorSingle')}</option>
                    <option value="double">{t('cabinet.doorDouble')}</option>
                  </select>
                </label>
              )}
              {(editing.fronts.type === 'drawers' || editing.fronts.type === 'mixed') && (
                <label>{t('cabinet.drawersCount')}<input type="number" min={1} value={editing.fronts.drawersCount || 1} onChange={e => updateFronts('drawersCount', +e.target.value)} /></label>
              )}
              {editing.fronts.type !== 'none' && (
                <label>{t('cabinet.handleType')}
                  <select value={editing.fronts.handleType} onChange={e => updateFronts('handleType', e.target.value as HandleType)}>
                    <option value="none">{t('cabinet.handleNone')}</option>
                    <option value="handle">{t('cabinet.handleHandle')}</option>
                    <option value="push_to_open">{t('cabinet.handlePush')}</option>
                  </select>
                </label>
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={saveTemplate}>{t('templates.save')}</button>
              <button className={styles.cancelBtn} onClick={() => setEditing(null)}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
