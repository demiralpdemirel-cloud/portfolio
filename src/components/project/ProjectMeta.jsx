export default function ProjectMeta({project}) {
  return <dl className="project-meta"><div><dt>Role</dt><dd>{project.role.join(' / ')}</dd></div><div><dt>Tools</dt><dd>{project.software.join(' / ')}</dd></div><div><dt>Year</dt><dd>{project.year}</dd></div></dl>
}
