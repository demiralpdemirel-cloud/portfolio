const pages = [
  { id: 'home', type: 'section', label: 'HOME / HERO' },
  { id: 'about', type: 'section', label: 'ABOUT', navLabel: 'ABOUT' },
  { id: 'showreel', type: 'section', label: 'SHOWREEL & BREAKDOWNS', navLabel: 'SHOWREEL' },
  { id: 'brand-films', type: 'section', label: 'BRAND & PRODUCT FILMS', navLabel: 'BRAND FILMS' },
  { id: 'project-001', type: 'project', label: 'EVGA RTX 3090' },
  { id: 'project-002', type: 'project', label: 'KEYBOARD' },
  { id: 'xpomatch', type: 'project', label: 'XPOMATCH' },
  { id: 'aselsan-film', type: 'project', label: 'ASELSAN' },
  { id: 'work', type: 'section', label: 'PERSONAL WORK', navLabel: 'PERSONAL WORK' },
  { id: 'sofa-modeling', type: 'project', label: 'SOFA MODELING' },
  { id: 'cafe-environment', type: 'project', label: 'CAFE ENVIRONMENT' },
  { id: 'project-003', type: 'project', label: 'INTERIOR' },
  { id: 'project-004', type: 'project', label: 'MARIO / ARCADE' },
  { id: 'project-005', type: 'project', label: 'STAR WARS / IMPACT' },
  { id: 'beylikduzu-kultur-merkezi', type: 'project', label: 'BEYLİKDÜZÜ CULTURAL CENTER' },
  { id: 'education', type: 'section', label: 'EDUCATION', navLabel: 'EDUCATION' },
  { id: 'capabilities', type: 'section', label: 'CAPABILITIES', navLabel: 'CAPABILITIES' },
  { id: 'contact', type: 'section', label: 'CONTACT', navLabel: 'CONTACT' },
]

export const pageRegistry = pages.map((page, index) => ({ ...page, index: index + 1 }))
