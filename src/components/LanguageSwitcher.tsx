import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

export default function LanguageSwitcher() {
  const { t } = useTranslation()
  const langs = ['fr', 'ro'] as const
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {langs.map(l => (
        <button
          key={l}
          onClick={() => { i18n.changeLanguage(l); localStorage.setItem('lang', l) }}
          style={{
            padding: '0.3rem 0.6rem',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,.4)',
            background: i18n.language === l ? 'rgba(255,255,255,.25)' : 'transparent',
            color: 'white',
            fontWeight: i18n.language === l ? 700 : 400,
            fontSize: '0.8rem',
          }}
        >
          {t(`lang.${l}`)}
        </button>
      ))}
    </div>
  )
}
