import { Outlet, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import styles from './Layout.module.css'

export default function Layout() {
  const { t } = useTranslation()
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <span className={styles.brand}>🪑 Meubles Concept</span>
          <div className={styles.links}>
            <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/studio" className={({ isActive }) => isActive ? styles.active : ''}>
              {t('nav.studio')}
            </NavLink>
            <NavLink to="/showroom" className={({ isActive }) => isActive ? styles.active : ''}>
              {t('nav.showroom')}
            </NavLink>
            <NavLink to="/planner" className={({ isActive }) => isActive ? styles.active : ''}>
              {t('nav.roomPlanner')}
            </NavLink>
            <NavLink to="/kitchen" className={({ isActive }) => isActive ? styles.active : ''}>
              {t('nav.kitchen')}
            </NavLink>
          </div>
          <LanguageSwitcher />
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
