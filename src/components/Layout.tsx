import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import styles from './Layout.module.css'

export default function Layout() {
  const { t } = useTranslation()
  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <span className={styles.brand}>Meubles Concept</span>
        <div className={styles.links}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>{t('nav.home')}</NavLink>
          <NavLink to="/studio" className={({ isActive }) => isActive ? styles.active : ''}>{t('nav.studio')}</NavLink>
          <NavLink to="/showroom" className={({ isActive }) => isActive ? styles.active : ''}>{t('nav.showroom')}</NavLink>
          <NavLink to="/planner" className={({ isActive }) => isActive ? styles.active : ''}>{t('nav.planner')}</NavLink>
          <NavLink to="/templates" className={({ isActive }) => isActive ? styles.active : ''}>{t('nav.templates')}</NavLink>
          <NavLink to="/kitchen" className={({ isActive }) => isActive ? styles.active : ''}>{t('nav.kitchen')}</NavLink>
          <NavLink to="/wardrobe" className={({ isActive }) => isActive ? styles.active : ''}>{t('nav.wardrobe')}</NavLink>
        </div>
        <LanguageSwitcher />
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
