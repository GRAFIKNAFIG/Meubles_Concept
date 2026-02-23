import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { KitchenProject } from '../types'
import { kitchenProjectRepo } from '../db'
import styles from './KitchenProjects.module.css'

function uuid() { return crypto.randomUUID() }

export default function KitchenProjects() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<KitchenProject[]>([])
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    kitchenProjectRepo.getAll().then(ps => setProjects(ps.slice().reverse()))
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    const now = Date.now()
    const project: KitchenProject = { id: uuid(), name: newName.trim(), createdAt: now, updatedAt: now }
    await kitchenProjectRepo.save(project)
    setProjects(prev => [project, ...prev])
    setNewName('')
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return
    const p = projects.find(p => p.id === id)
    if (!p) return
    const updated = { ...p, name: editName.trim(), updatedAt: Date.now() }
    await kitchenProjectRepo.save(updated)
    setProjects(prev => prev.map(p => p.id === id ? updated : p))
    setEditId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm(t('kitchen.delete_confirm'))) return
    await kitchenProjectRepo.delete(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{t('kitchen.projects_title')}</h1>
      <div className={styles.createRow}>
        <input
          className={styles.input}
          placeholder={t('kitchen.project_name_placeholder')}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button className={styles.btnCreate} onClick={handleCreate}>
          + {t('kitchen.create_project')}
        </button>
      </div>
      {projects.length === 0 && <p className={styles.empty}>{t('kitchen.no_projects')}</p>}
      <div className={styles.list}>
        {projects.map(p => (
          <div key={p.id} className={styles.row}>
            {editId === p.id ? (
              <>
                <input
                  className={styles.input}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(p.id); if (e.key === 'Escape') setEditId(null) }}
                  autoFocus
                />
                <button className={styles.btnSave} onClick={() => handleRename(p.id)}>{t('common.save')}</button>
                <button className={styles.btnCancel} onClick={() => setEditId(null)}>{t('common.cancel')}</button>
              </>
            ) : (
              <>
                <button className={styles.projectName} onClick={() => navigate(`/kitchen/${p.id}`)}>
                  🍳 {p.name}
                </button>
                <span className={styles.projectDate}>{new Date(p.updatedAt).toLocaleDateString()}</span>
                <button className={styles.btnEdit} onClick={() => { setEditId(p.id); setEditName(p.name) }}>✏️</button>
                <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>🗑️</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
