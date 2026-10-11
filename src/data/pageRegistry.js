// Catalog cards are modal entry points, not separate full-page chapters.
const pages = [
  { id:'home', type:'section', label:'HOME / HERO' },
  { id:'about', type:'section', label:'ABOUT', navLabel:'ABOUT' },
  { id:'showreel', type:'section', label:'SHOWREEL & BREAKDOWNS', navLabel:'SHOWREEL' },
  { id:'work', type:'section', label:'SELECTED WORKS', navLabel:'WORKS' },
  { id:'education', type:'section', label:'EDUCATION', navLabel:'EDUCATION' },
  { id:'capabilities', type:'section', label:'CAPABILITIES', navLabel:'CAPABILITIES' },
  { id:'contact', type:'section', label:'CONTACT', navLabel:'CONTACT' },
]
export const pageRegistry = pages.map((page,index) => ({...page,index:index+1}))
