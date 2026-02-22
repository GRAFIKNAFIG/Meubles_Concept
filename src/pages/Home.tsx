import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

const FEATURES = [
  { key: 'studio',   icon: '🛠️', route: '/studio'   },
  { key: 'showroom', icon: '🖼️', route: '/showroom' },
  { key: 'planner',  icon: '📐', route: '/planner'  },
] as const

export default function Home() {
  const { t } = useTranslation()
  const nav = useNavigate()
  return (
    <div className={styles.root}>
      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.badge}>{t('home.app_badge')}</span>
        <h1>{t('home.title')}</h1>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
        <button className={styles.startBtn} onClick={() => nav('/studio')}>
          {t('home.start_cta')} →
        </button>
      </div>

      {/* Feature cards */}
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>{t('home.features_title')}</h2>
        <div className={styles.cards}>
          {FEATURES.map(f => (
            <button
              key={f.key}
              className={styles.card}
              onClick={() => nav(f.route)}
            >
              <span className={styles.icon}>{f.icon}</span>
              <strong>{t(`home.feature_${f.key}_title`)}</strong>
              <span className={styles.cardDesc}>{t(`home.feature_${f.key}_desc`)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Offline note */}
      <p className={styles.offlineNote}>📴 {t('home.feature_offline')}</p>
    </div>
  )
}
