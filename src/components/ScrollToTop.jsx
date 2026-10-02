import { useLanguage } from '../i18n/LanguageContext'
import { useEffect, useState } from 'react'

const modalSelector = 'dialog[open], [aria-modal="true"]:not(dialog)'

export default function ScrollToTop() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('.hero')
    if (!hero) return undefined
    let pastHero = hero.getBoundingClientRect().bottom <= 0
    let lastVisible = false
    const update = () => {
      const next = pastHero && !document.querySelector(modalSelector)
      if (next !== lastVisible) { lastVisible = next; setVisible(next) }
    }
    const intersection = new IntersectionObserver(([entry]) => {
      pastHero = entry.boundingClientRect.bottom <= 0
      update()
    }, { threshold: 0 })
    intersection.observe(hero)
    const mutations = new MutationObserver(records => {
      const involvesModal = records.some(record => record.type === 'attributes'
        ? record.target.matches('dialog')
        : [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === 1 && (node.matches('dialog, [aria-modal="true"]') || node.querySelector('dialog, [aria-modal="true"]'))))
      if (involvesModal) update()
    })
    mutations.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] })
    update()
    return () => { intersection.disconnect(); mutations.disconnect() }
  }, [])

  const goToTop = () => {
    if (document.querySelector(modalSelector)) return
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return <button type="button" className={`scroll-to-top${visible ? ' is-visible' : ''}`} onClick={goToTop} aria-label={t("Scroll to top")} aria-hidden={!visible} tabIndex={visible ? 0 : -1} disabled={!visible}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
  </button>
}
