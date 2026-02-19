import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  const { t } = useTranslation()
  const nav = useNavigate()
  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
      </div>
      <div className={styles.cards}>
        <button className={styles.card} onClick={() => nav('/studio')}>
          <span className={styles.icon}>🛠️</span>
          <span>{t('home.cta_studio')}</span>
        </button>
        <button className={styles.card} onClick={() => nav('/showroom')}>
          <span className={styles.icon}>🖼️</span>
          <span>{t('home.cta_showroom')}</span>
        </button>
        <button className={styles.card} onClick={() => nav('/planner')}>
          <span className={styles.icon}>📐</span>
          <span>{t('home.cta_planner')}</span>
        </button>
      </div>
    </div>
  )
}
