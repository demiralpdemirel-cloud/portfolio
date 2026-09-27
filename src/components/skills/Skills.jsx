import { skillCategories } from '../../data/skills'

export default function Skills() {
  return <div hidden aria-hidden="true" data-skills-catalog={skillCategories.length} />
}
