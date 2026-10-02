import { useLanguage } from '../../i18n/LanguageContext'
export default function ProjectMeta({project, reveal = false}) {
  const { t } = useLanguage()
  const fields = [
    ['Role', project.role?.filter(Boolean).join(' / ')],
    ['Tools', project.software?.filter(tool => tool && tool !== '—').join(' / ')],
    ['Year', project.year && project.year !== '—' ? project.year : null],
  ].filter(([, value]) => value)

  if (!fields.length) return null

  return <dl className="project-meta">{fields.map(([label, value]) => <div key={label} data-project-reveal={reveal ? '' : undefined}><dt>{t(label)}</dt><dd>{t(value)}</dd></div>)}</dl>
}
