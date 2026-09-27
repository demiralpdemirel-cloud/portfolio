const pages = [
  { id: 'home', type: 'section', label: 'HOME / HERO' },
  { id: 'showreel', type: 'section', label: 'VFX SHOWREEL', navLabel: 'SHOWREEL' },
  { id: 'project-001', type: 'project', label: 'EVGA RTX 3090', navLabel: 'WORK' },
  { id: 'project-002', type: 'project', label: 'KEYBOARD' },
  { id: 'project-003', type: 'project', label: 'INTERIOR' },
  { id: 'about', type: 'section', label: 'ABOUT', navLabel: 'ABOUT' },
  { id: 'experience', type: 'section', label: 'EXPERIENCE', navLabel: 'EXPERIENCE' },
  { id: 'capabilities', type: 'section', label: 'CAPABILITIES' },
  { id: 'archive', type: 'section', label: 'PROJECT ARCHIVE' },
  { id: 'contact', type: 'section', label: 'CONTACT', navLabel: 'CONTACT' },
]

export const pageRegistry = pages.map((page, index) => ({ ...page, index: index + 1 }))
