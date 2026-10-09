import { useLanguage } from '../../i18n/LanguageContext'
export default function ProjectMeta({project, reveal = false}) {
  const { t } = useLanguage()
  const fields = [
    ['BRAND', project.brand],
    ['Role', project.role?.filter(Boolean).join(' / ')],
    [project.softwareLabel || 'Tools', project.software?.filter(tool => tool && tool !== '—').join(' / ')],
    ['Year', project.year && project.year !== '—' ? project.year : null],
    ['WEBSITE', project.externalLink],
  ].filter(([, value]) => value)

  if (!fields.length) return null

  return <dl className="project-meta">{fields.map(([label, value]) => <div key={label} data-project-reveal={reveal ? '' : undefined}><dt>{t(label)}</dt><dd>{label === 'WEBSITE' ? <a href={value} target="_blank" rel="noopener noreferrer">{t(project.externalLinkLabel || 'WEBSITE')} </a> : t(value)}</dd></div>)}</dl>
}
