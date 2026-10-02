import { useLanguage } from './LanguageContext'

export default function LanguageSwitcher({ inline = false }) {
  const { language, changeLanguage } = useLanguage()
  return <div className={`language-switcher${inline ? ' language-switcher--inline' : ''}`} role="group" aria-label={language === 'tr' ? 'Dil seçimi' : 'Language selection'}>
    <button type="button" lang="tr" aria-label="Türkçe" aria-pressed={language === 'tr'} onClick={() => changeLanguage('tr')}>TR</button>
    <span aria-hidden="true">/</span>
    <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => changeLanguage('en')}>EN</button>
  </div>
}
