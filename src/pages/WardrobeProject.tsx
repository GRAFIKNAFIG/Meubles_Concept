import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { wardrobeProjectRepo, cabinetRepo, cabinetTemplateRepo } from '../db'
import type { WardrobeProject, Cabinet, CabinetVariant, PanelType, PanelColor, FrontsConfig, FrontConfig, HandleType, DoorOption, CabinetTemplate } from '../types'
import { generateCutList } from '../utils/cutList'
import { generateBOM } from '../utils/bom'
import { exportCutListPDF } from '../utils/pdfExport'
import CabinetViewer3D from '../components/CabinetViewer3D'
import styles from './WardrobeProject.module.css'

function defaultFronts(): FrontsConfig {
  return { type: 'doors', overlayMm: 2, gapMm: 2, handleType: 'none', doorOption: 'single', drawersCount: 1, drawersEqualHeight: true }
}

function newCabinet(projectId: string): Cabinet {
  const now = Date.now()
  return {
    id: crypto.randomUUID(), projectId, name: 'Colonne dressing',
    variant: 'tall', widthMm: 600, depthMm: 580, heightMm: 2200,
    panelThicknessMm: 18, shelvesCount: 2, panelType: 'MELAMINE', panelColor: 'WHITE',
    backPanelThicknessMm: 8, backPanelEnabled: true, fronts: defaultFronts(), toeKickMm: 0,
    quantity: 1, createdAt: now, updatedAt: now,
  }
}

type Tab = 'cabinets' | 'cutlist' | 'bom'

export default function WardrobeProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [project, setProject] = useState<WardrobeProject | null>(null)
  const [cabinets, setCabinets] = useState<Cabinet[]>([])
  const [templates, setTemplates] = useState<CabinetTemplate[]>([])
  const [editing, setEditing] = useState<Cabinet | null>(null)
  const [tab, setTab] = useState<Tab>('cabinets')
  const [preview, setPreview] = useState<Cabinet | null>(null)

  const load = async () => {
    if (!id) return
    const p = await wardrobeProjectRepo.get(id)
    if (!p) { navigate('/wardrobe'); return }
    setProject(p)
    const cabs = await cabinetRepo.getByProject(id)
    setCabinets(cabs)
    const tmpl = await cabinetTemplateRepo.getAll()
    setTemplates(tmpl)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [id])

  const saveProject = async (upd: WardrobeProject) => {
    await wardrobeProjectRepo.save(upd)
    setProject(upd)
  }

  const openNew = () => setEditing(newCabinet(id!))
  const openEdit = (c: Cabinet) => setEditing({ ...c })

  const saveCabinet = async () => {
    if (!editing) return
    await cabinetRepo.save({ ...editing, updatedAt: Date.now() })
    setEditing(null)
    load()
  }

  const deleteCabinet = async (cid: string) => {
    if (!confirm(t('wardrobe.confirmDeleteCabinet'))) return
    await cabinetRepo.delete(cid)
    load()
  }

  const addFromTemplate = async (tpl: CabinetTemplate) => {
    const now = Date.now()
    const cab: Cabinet = {
      id: crypto.randomUUID(), projectId: id!, templateId: tpl.id,
      name: tpl.name, variant: tpl.variant, widthMm: tpl.widthMm, depthMm: tpl.depthMm,
      heightMm: tpl.heightMm, panelThicknessMm: tpl.panelThicknessMm, shelvesCount: tpl.shelvesCount,
      panelType: tpl.panelType, panelColor: tpl.panelColor, backPanelThicknessMm: tpl.backPanelThicknessMm,
      backPanelEnabled: tpl.backPanelEnabled, fronts: { ...tpl.fronts }, toeKickMm: tpl.toeKickMm,
      quantity: 1, createdAt: now, updatedAt: now,
    }
    await cabinetRepo.save(cab)
    load()
  }

  const updateEditing = <K extends keyof Cabinet>(key: K, value: Cabinet[K]) => {
    setEditing(prev => prev ? { ...prev, [key]: value } : null)
  }
  const updateFronts = <K extends keyof FrontsConfig>(key: K, value: FrontsConfig[K]) => {
    setEditing(prev => prev ? { ...prev, fronts: { ...prev.fronts, [key]: value } } : null)
  }

  const cutList = generateCutList(cabinets)
  const bom = generateBOM(cabinets)

  if (!project) return <p>{t('common.loading')}</p>

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <input
          className={styles.projectName}
          value={project.name}
          onChange={e => saveProject({ ...project, name: e.target.value, updatedAt: Date.now() })}
        />
        <button className={styles.pdfBtn} onClick={() => exportCutListPDF(project.name, cutList, bom, t)}>
          {t('wardrobe.exportPDF')}
        </button>
      </div>

      <div className={styles.tabs}>
        <button className={tab === 'cabinets' ? styles.activeTab : styles.tabBtn} onClick={() => setTab('cabinets')}>{t('wardrobe.tabCabinets')}</button>
        <button className={tab === 'cutlist' ? styles.activeTab : styles.tabBtn} onClick={() => setTab('cutlist')}>{t('kitchen.tabCutList')}</button>
        <button className={tab === 'bom' ? styles.activeTab : styles.tabBtn} onClick={() => setTab('bom')}>{t('kitchen.tabBOM')}</button>
      </div>

      {tab === 'cabinets' && (
        <div className={styles.cabinetsTab}>
          <div className={styles.actions}>
            <button className={styles.addBtn} onClick={openNew}>{t('wardrobe.addCabinet')}</button>
            {templates.length > 0 && (
              <select className={styles.tplSelect} onChange={e => {
                const tpl = templates.find(x => x.id === e.target.value)
                if (tpl) addFromTemplate(tpl)
                e.target.value = ''
              }} defaultValue="">
                <option value="" disabled>{t('kitchen.addFromTemplate')}</option>
                {templates.map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
              </select>
            )}
          </div>
          <div className={styles.cabinetGrid}>
            {cabinets.map(c => (
              <div key={c.id} className={styles.cabinetCard} onClick={() => setPreview(c)}>
                <strong>{c.name}</strong>
                <span>{c.widthMm} × {c.depthMm} × {c.heightMm} mm</span>
                <span>{t('kitchen.qty')}: {c.quantity}</span>
                <div className={styles.cabinetActions} onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(c)} className={styles.editBtn}>{t('wardrobe.edit')}</button>
                  <button onClick={() => deleteCabinet(c.id)} className={styles.delBtn}>{t('wardrobe.delete')}</button>
                </div>
              </div>
            ))}
          </div>
          {preview && (
            <div className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <span>{preview.name}</span>
                <button onClick={() => setPreview(null)}>✕</button>
              </div>
              <div className={styles.viewer3d}>
                <CabinetViewer3D cabinet={preview} />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'cutlist' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('cutlist.cabinet')}</th>
                <th>{t('cutlist.part')}</th>
                <th>{t('cutlist.qty')}</th>
                <th>{t('cutlist.length')}</th>
                <th>{t('cutlist.width')}</th>
                <th>{t('cutlist.thickness')}</th>
                <th>{t('cutlist.material')}</th>
              </tr>
            </thead>
            <tbody>
              {cutList.map((row, i) => (
                <tr key={i}>
                  <td>{row.cabinetName}</td>
                  <td>{row.partName}</td>
                  <td>{row.qty}</td>
                  <td>{Math.round(row.lengthMm)}</td>
                  <td>{Math.round(row.widthMm)}</td>
                  <td>{row.thicknessMm}</td>
                  <td>{row.panelType} / {row.panelColor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'bom' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('bom.cabinet')}</th>
                <th>{t('bom.ref')}</th>
                <th>{t('bom.description')}</th>
                <th>{t('bom.qty')}</th>
              </tr>
            </thead>
            <tbody>
              {bom.map((row, i) => (
                <tr key={i}>
                  <td>{row.cabinetName}</td>
                  <td>{row.ref}</td>
                  <td>{t(row.labelKey)}</td>
                  <td>{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editing.id ? t('wardrobe.editCabinet') : t('wardrobe.addCabinet')}</h3>
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
              <label>{t('cabinet.quantity')}<input type="number" min={1} value={editing.quantity} onChange={e => updateEditing('quantity', +e.target.value)} /></label>
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
              <button className={styles.saveBtn} onClick={saveCabinet}>{t('wardrobe.save')}</button>
              <button className={styles.cancelBtn} onClick={() => setEditing(null)}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
