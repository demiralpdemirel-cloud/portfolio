import { bilingual } from '../i18n/translations'
export const projectMediaDimensions = {
  'media/projects/interior-study/living-room.webp': [1800, 1800],
  'media/projects/interior-study/dark-living-room.webp': [1800, 1800],
  'media/projects/interior-study/bathroom.webp': [1800, 1800],
  'media/projects/interior-study/kitchen.webp': [1800, 1013],
}

export const projectCategories = [
  { id: 'all', label: 'ALL' },
  { id: 'vfx', label: 'VFX & COMPOSITING' },
  { id: 'cgi', label: '3D / CGI' },
  { id: 'archviz', label: 'ARCHVIZ' },
  { id: 'modeling', label: 'MODELING' },
  { id: 'motion', label: 'MOTION' },
  { id: 'personal', label: 'PERSONAL' },
]

export const projects = [
  {
    id: 'project-001', number: '001', title: 'EVGA RTX 3090', year: null, date: null,
    categories: ['MODELING / PRODUCT', '3D / CGI', 'PERSONAL PROJECTS'], primaryCategory: '3D / PRODUCT', categoryIds: ['modeling', 'cgi', 'personal'],
    role: ['3D Artist'], software: ['Blender'], description: bilingual('The second project in my personal hardware series. I recreated the EVGA RTX 3090 from my own PC setup in 3D and developed a cinematic product animation around the model.'), credits: [], presentation: 'video', featured: true, personal: true,
    cover: 'media/projects/evga-rtx-3090/poster.webp', media: [], video: { src: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/evga-rtx-3090.mp4', poster: 'media/projects/evga-rtx-3090/poster.webp' }, breakdownVideo: null, sequence: null, beforeAfter: null, breakdownStages: [], externalLink: null, placeholder: false,
  },
  {
    id: 'project-002', number: '002', title: 'KEYBOARD', year: null, date: null,
    categories: ['MODELING / PRODUCT', '3D / CGI', 'PERSONAL PROJECTS'], primaryCategory: '3D / PRODUCT', categoryIds: ['modeling', 'cgi', 'personal'],
    role: ['3D Artist'], software: ['Blender'], description: bilingual('The first project in my personal product animation series. I recreated my own AJAZZ AK992 keyboard in 3D and produced a clean product animation based on the real hardware I use.'), credits: [], presentation: 'video', featured: true, personal: true,
    cover: 'media/projects/keyboard-study/poster.webp', media: [], video: { src: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/keyboard.mp4', poster: 'media/projects/keyboard-study/poster.webp' }, breakdownVideo: null, sequence: null, beforeAfter: null, breakdownStages: [], externalLink: null, placeholder: false,
  },
  {
    id: 'project-003', number: '003', title: 'INTERIOR', year: null, date: null,
    categories: ['ENVIRONMENT & ARCHVIZ', '3D / CGI', 'PERSONAL PROJECTS'], primaryCategory: 'ARCHVIZ', categoryIds: ['archviz', 'cgi', 'personal'],
    role: ['3D Artist', 'Environment Artist'], software: ['Blender'], description: bilingual('A personal interior and architectural visualization piece spanning bathroom, living room and kitchen spaces.'), credits: [], presentation: 'environment', featured: true, personal: true,
    cover: 'media/projects/interior-study/living-room.webp', media: ['media/projects/interior-study/living-room.webp', 'media/projects/interior-study/dark-living-room.webp', 'media/projects/interior-study/bathroom.webp', 'media/projects/interior-study/kitchen.webp'], video: { src: 'media/projects/interior-study/home-design.mp4', poster: 'media/projects/interior-study/poster.webp' }, breakdownVideo: null, sequence: null, beforeAfter: null, breakdownStages: [], externalLink: null, placeholder: false,
  },
  {
    id: 'project-004', number: '004', title: 'MARIO / ARCADE', year: null, date: null,
    categories: ['3D / CGI', 'MOTION DESIGN', 'PERSONAL PROJECTS'], primaryCategory: '3D / MOTION', categoryIds: ['cgi', 'motion', 'personal'],
    role: ['3D Artist', 'Motion Artist'], software: ['Blender'], description: bilingual('A personal Mario arcade environment piece with a vertical hero animation and a separate artist-made breakdown video.'), credits: [], presentation: 'video', featured: false, personal: true,
    cover: 'media/projects/mario-arcade/poster.webp', media: [], video: { src: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/mario-arcade.mp4', poster: 'media/projects/mario-arcade/poster.webp' }, breakdownVideo: { src: 'media/projects/mario-arcade/mario-arcade-breakdown.mp4', poster: 'media/projects/mario-arcade/poster.webp' }, sequence: null, beforeAfter: null, breakdownStages: [], externalLink: null, placeholder: false,
  },
  {
    id: 'project-005', number: '005', title: 'STAR WARS / IMPACT', year: null, date: null,
    categories: ['VFX & COMPOSITING', 'PERSONAL PROJECTS'], primaryCategory: 'VFX / COMPOSITING', categoryIds: ['vfx', 'personal'],
    role: ['VFX Artist', 'Compositor'], software: [], description: bilingual('A personal live-action VFX piece showing a destructive impact on a city building.'), credits: [], presentation: 'video', featured: false, personal: true,
    cover: 'media/projects/star-wars-vfx/poster.webp', media: [], video: { src: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/star-wars-vfx.mp4', poster: 'media/projects/star-wars-vfx/poster.webp' }, breakdownVideo: null, sequence: null, beforeAfter: null, breakdownStages: [], externalLink: null, placeholder: false,
  },
]
