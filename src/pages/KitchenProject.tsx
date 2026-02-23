import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import type { Cabinet, KitchenProject as KP, PanelType, PanelColor, CabinetVariant } from '../types'
import { kitchenProjectRepo, cabinetRepo } from '../db'
import CabinetViewer3D from '../components/CabinetViewer3D'
import { generateCutList, groupCutList } from '../utils/cutList'
import { exportCutListPDF } from '../utils/pdfExport'
import i18n from '../i18n'
import styles from './KitchenProject.module.css'

function uuid() { return crypto.randomUUID() }

const PANEL_TYPES: PanelType[] = ['MDF', 'MELAMINE']
const PANEL_COLORS: PanelColor[] = ['WOOD','WHITE','BROWN','BLACK','GRAY','BLUE','GREEN','RED']
const VARIANTS: CabinetVariant[] = ['base','wall','tall']

type CabinetForm = Omit<Cabinet, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>

const DEFAULT_FORM: CabinetForm = {
  name: '',
  variant: 'base',
  widthMm: 600,
  depthMm: 560,
  heightMm: 720,
  panelThicknessMm: 18,
  shelvesCount: 0,
  panelType: 'MDF',
  panelColor: 'WOOD',
  backPanelThicknessMm: 3,
  backPanelEnabled: true,
}

type Tab = 'cabinets' | 'cutlist'

export default function KitchenProject() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<KP | null>(null)
  const [cabinets, setCabinets] = useState<Cabinet[]>([])
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<CabinetForm>({ ...DEFAULT_FORM })
  const [tab, setTab] = useState<Tab>('cabinets')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    kitchenProjectRepo.get(id).then(p => {
      if (!p) { navigate('/kitchen'); return }
      setProject(p)
    })
    cabinetRepo.getAllByProject(id).then(cs => {
      const sorted = cs.slice().sort((a, b) => a.createdAt - b.createdAt)
      setCabinets(sorted)
      if (sorted.length > 0) setSelectedCabinet(sorted[0])
    })
  }, [id, navigate])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  function openAddForm() {
    setEditId(null)
    setForm({ ...DEFAULT_FORM })
    setShowForm(true)
  }

  function openEditForm(cab: Cabinet) {
    setEditId(cab.id)
    setForm({
      name: cab.name, variant: cab.variant,
      widthMm: cab.widthMm, depthMm: cab.depthMm, heightMm: cab.heightMm,
      panelThicknessMm: cab.panelThicknessMm, shelvesCount: cab.shelvesCount,
      panelType: cab.panelType, panelColor: cab.panelColor,
      backPanelThicknessMm: cab.backPanelThicknessMm, backPanelEnabled: cab.backPanelEnabled,
    })
    setShowForm(true)
  }

  async function handleSaveCabinet() {
    if (!form.name.trim() || !id) return
    const now = Date.now()
    if (editId) {
      const existing = cabinets.find(c => c.id === editId)!
      const updated: Cabinet = { ...existing, ...form, updatedAt: now }
      await cabinetRepo.save(updated)
      setCabinets(prev => prev.map(c => c.id === editId ? updated : c))
      if (selectedCabinet?.id === editId) setSelectedCabinet(updated)
    } else {
      const cab: Cabinet = { ...form, id: uuid(), projectId: id, createdAt: now, updatedAt: now }
      await cabinetRepo.save(cab)
      setCabinets(prev => [...prev, cab])
      setSelectedCabinet(cab)
    }
    setShowForm(false)
    showToast(t('kitchen.cabinet_saved'))
  }

  async function handleDeleteCabinet(cabId: string) {
    if (!confirm(t('kitchen.delete_cabinet_confirm'))) return
    await cabinetRepo.delete(cabId)
    setCabinets(prev => {
      const next = prev.filter(c => c.id !== cabId)
      if (selectedCabinet?.id === cabId) setSelectedCabinet(next[0] ?? null)
      return next
    })
  }

  function handleExportPDF() {
    if (!project) return
    const items = generateCutList(cabinets)
    const grouped = groupCutList(items)
    exportCutListPDF(project, grouped, i18n.language)
    showToast(t('kitchen.pdf_exported'))
  }

  const cutItems = groupCutList(generateCutList(cabinets))

  if (!project) return <p style={{ padding: '2rem' }}>{t('common.loading')}</p>

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/kitchen')}>← {t('kitchen.projects_title')}</button>
        <h1 className={styles.title}>🍳 {project.name}</h1>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'cabinets' ? styles.tabActive : ''}`} onClick={() => setTab('cabinets')}>
          {t('kitchen.tab_cabinets')}
        </button>
        <button className={`${styles.tab} ${tab === 'cutlist' ? styles.tabActive : ''}`} onClick={() => setTab('cutlist')}>
          {t('kitchen.tab_cutlist')} {cabinets.length > 0 && `(${cutItems.reduce((s,i) => s+i.qty, 0)})`}
        </button>
      </div>

      {tab === 'cabinets' && (
        <div className={styles.cabinetLayout}>
          <aside className={styles.sidePanel}>
            <button className={styles.btnAdd} onClick={openAddForm}>+ {t('kitchen.add_cabinet')}</button>
            <div className={styles.cabinetList}>
              {cabinets.length === 0 && <p className={styles.empty}>{t('kitchen.no_cabinets')}</p>}
              {cabinets.map(cab => (
                <div key={cab.id}
                  className={`${styles.cabinetRow} ${selectedCabinet?.id === cab.id ? styles.cabinetRowSelected : ''}`}
                  onClick={() => setSelectedCabinet(cab)}>
                  <div className={styles.cabinetInfo}>
                    <span className={styles.cabinetName}>{cab.name}</span>
                    <span className={styles.cabinetDims}>{cab.widthMm}×{cab.depthMm}×{cab.heightMm} mm</span>
                  </div>
                  <div className={styles.cabinetActions}>
                    <button className={styles.btnIconEdit} onClick={e => { e.stopPropagation(); openEditForm(cab) }}>✏️</button>
                    <button className={styles.btnIconDelete} onClick={e => { e.stopPropagation(); handleDeleteCabinet(cab.id) }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className={styles.viewer}>
            {selectedCabinet ? (
              <>
                <div className={styles.viewerHeader}>
                  <strong>{selectedCabinet.name}</strong>
                  <span className={styles.viewerMeta}>
                    {selectedCabinet.widthMm}×{selectedCabinet.depthMm}×{selectedCabinet.heightMm} mm
                    · {t(`kitchen.color_${selectedCabinet.panelColor.toLowerCase()}`)}
                    · {t(`kitchen.panel_type_${selectedCabinet.panelType.toLowerCase()}`)}
                  </span>
                </div>
                <div style={{ flex: 1, minHeight: 350 }}>
                  <CabinetViewer3D cabinet={selectedCabinet} />
                </div>
              </>
            ) : (
              <div className={styles.viewerEmpty}>{t('kitchen.select_cabinet_hint')}</div>
            )}
          </div>
        </div>
      )}

      {tab === 'cutlist' && (
        <div className={styles.cutlistWrapper}>
          <div className={styles.cutlistActions}>
            <button className={styles.btnExport} onClick={handleExportPDF} disabled={cabinets.length === 0}>
              ⬇ {t('kitchen.download_pdf')}
            </button>
          </div>
          {cutItems.length === 0 ? (
            <p className={styles.empty}>{t('kitchen.no_cabinets')}</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('kitchen.col_qty')}</th>
                    <th>{t('kitchen.col_part')}</th>
                    <th>{t('kitchen.col_length')}</th>
                    <th>{t('kitchen.col_width')}</th>
                    <th>{t('kitchen.col_thickness')}</th>
                    <th>{t('kitchen.col_panel_type')}</th>
                    <th>{t('kitchen.col_color')}</th>
                    <th>{t('kitchen.col_cabinet')}</th>
                  </tr>
                </thead>
                <tbody>
                  {cutItems.map((item, i) => (
                    <tr key={i}>
                      <td className={styles.tdQty}>{item.qty}</td>
                      <td>{item.partName}</td>
                      <td>{item.lengthMm}</td>
                      <td>{item.widthMm}</td>
                      <td>{item.thicknessMm}</td>
                      <td>{t(`kitchen.panel_type_${item.panelType.toLowerCase()}`)}</td>
                      <td>{t(`kitchen.color_${item.panelColor.toLowerCase()}`)}</td>
                      <td className={styles.tdCabinet}>{item.cabinetNames.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={8} className={styles.tfootTotal}>
                      {t('kitchen.total_pieces')}: <strong>{cutItems.reduce((s,i) => s+i.qty, 0)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>{editId ? t('kitchen.edit_cabinet') : t('kitchen.add_cabinet')}</h2>
            <div className={styles.formGrid}>
              <label>{t('kitchen.cabinet_name')}
                <input className={styles.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </label>
              <label>{t('kitchen.cabinet_variant')}
                <select className={styles.input} value={form.variant} onChange={e => setForm(p => ({ ...p, variant: e.target.value as CabinetVariant }))}>
                  {VARIANTS.map(v => <option key={v} value={v}>{t(`kitchen.variant_${v}`)}</option>)}
                </select>
              </label>
              <label>{t('kitchen.width_mm')}
                <input className={styles.input} type="number" min={100} max={3000} value={form.widthMm}
                  onChange={e => setForm(p => ({ ...p, widthMm: Number(e.target.value) }))} />
              </label>
              <label>{t('kitchen.depth_mm')}
                <input className={styles.input} type="number" min={100} max={1000} value={form.depthMm}
                  onChange={e => setForm(p => ({ ...p, depthMm: Number(e.target.value) }))} />
              </label>
              <label>{t('kitchen.height_mm')}
                <input className={styles.input} type="number" min={100} max={3000} value={form.heightMm}
                  onChange={e => setForm(p => ({ ...p, heightMm: Number(e.target.value) }))} />
              </label>
              <label>{t('kitchen.panel_thickness_mm')}
                <input className={styles.input} type="number" min={6} max={50} value={form.panelThicknessMm}
                  onChange={e => setForm(p => ({ ...p, panelThicknessMm: Number(e.target.value) }))} />
              </label>
              <label>{t('kitchen.shelves_count')}
                <input className={styles.input} type="number" min={0} max={20} value={form.shelvesCount}
                  onChange={e => setForm(p => ({ ...p, shelvesCount: Number(e.target.value) }))} />
              </label>
              <label>{t('kitchen.panel_type')}
                <select className={styles.input} value={form.panelType} onChange={e => setForm(p => ({ ...p, panelType: e.target.value as PanelType }))}>
                  {PANEL_TYPES.map(pt => <option key={pt} value={pt}>{t(`kitchen.panel_type_${pt.toLowerCase()}`)}</option>)}
                </select>
              </label>
              <label>{t('kitchen.panel_color')}
                <select className={styles.input} value={form.panelColor} onChange={e => setForm(p => ({ ...p, panelColor: e.target.value as PanelColor }))}>
                  {PANEL_COLORS.map(c => <option key={c} value={c}>{t(`kitchen.color_${c.toLowerCase()}`)}</option>)}
                </select>
              </label>
              <label>{t('kitchen.back_panel_thickness')}
                <input className={styles.input} type="number" min={2} max={18} value={form.backPanelThicknessMm}
                  onChange={e => setForm(p => ({ ...p, backPanelThicknessMm: Number(e.target.value) }))} />
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.backPanelEnabled}
                  onChange={e => setForm(p => ({ ...p, backPanelEnabled: e.target.checked }))} />
                {t('kitchen.back_panel_enabled')}
              </label>
            </div>
            <div className={styles.formActions}>
              <button className={styles.btnPrimary} onClick={handleSaveCabinet}>{t('common.save')}</button>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
