import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

export default function LanguageSwitcher() {
  const { i18n: i18next } = useTranslation()

  const toggle = () => {
    const next = i18next.language === 'fr' ? 'ro' : 'fr'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <button
      onClick={toggle}
      style={{
        background: '#334155',
        color: '#f8fafc',
        border: 'none',
        padding: '0.25rem 0.75rem',
        borderRadius: 4,
        fontSize: '0.85rem',
        cursor: 'pointer'
      }}
    >
      {i18next.language === 'fr' ? 'RO' : 'FR'}
    </button>
  )
}
