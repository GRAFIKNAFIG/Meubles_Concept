import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  const { t } = useTranslation()
  return (
    <div className={styles.home}>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
      <div className={styles.cards}>
        <Link to="/studio" className={styles.card}>
          <h2>{t('nav.studio')}</h2>
          <p>{t('home.studioDesc')}</p>
        </Link>
        <Link to="/showroom" className={styles.card}>
          <h2>{t('nav.showroom')}</h2>
          <p>{t('home.showroomDesc')}</p>
        </Link>
        <Link to="/planner" className={styles.card}>
          <h2>{t('nav.planner')}</h2>
          <p>{t('home.plannerDesc')}</p>
        </Link>
        <Link to="/templates" className={styles.card}>
          <h2>{t('nav.templates')}</h2>
          <p>{t('home.templatesDesc')}</p>
        </Link>
        <Link to="/kitchen" className={styles.card}>
          <h2>{t('nav.kitchen')}</h2>
          <p>{t('home.kitchenDesc')}</p>
        </Link>
        <Link to="/wardrobe" className={styles.card}>
          <h2>{t('nav.wardrobe')}</h2>
          <p>{t('home.wardrobeDesc')}</p>
        </Link>
      </div>
    </div>
  )
}
