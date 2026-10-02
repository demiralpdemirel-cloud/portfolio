import { bilingual } from '../i18n/translations'
import { siteConfig } from './siteConfig'

export const CURRENT_COMPANY = 'GeniusPark VFX'

export const professionalProfile = {
  currentCompany: {
    name: CURRENT_COMPANY,
    url: 'https://www.geniuspark.com.tr/',
    period: '2023 — TODAY',
  },
  instagram: siteConfig.instagram,
  professionalLinks: [
    {
      id: 'linkedin',
      label: 'LINKEDIN',
      name: 'LinkedIn',
      subtitle: bilingual('PROFESSIONAL PROFILE'),
      url: 'https://www.linkedin.com/in/demiralp-demirel-1a6b56309/',
    },
    {
      id: 'imdb',
      label: 'IMDb',
      name: 'IMDb',
      subtitle: bilingual('FILM & TV CREDITS'),
      url: 'https://www.imdb.com/name/nm17748059/',
    },
  ],
  softwareHours: [
    {
      id: 'blender',
      name: 'Blender',
      hours: 3914.9,
      source: 'Steam',
      qualifier: 'Minimum tracked hours',
    },
  ],
}
