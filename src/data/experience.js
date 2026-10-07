import { bilingual } from '../i18n/translations'
import { CURRENT_COMPANY } from './professionalProfile'
import { productions } from './productions'

export const experience = [
  { title: 'ONBEŞLİLER', period: '2026', summary: '3D ARTIST / COMPOSITING ARTIST', role: ['3D ARTIST', 'COMPOSITING ARTIST'], highlights: [] },
  { title: 'ASELSAN', period: '2025', summary: '3D ARTIST / COMPOSITING ARTIST', role: ['3D ARTIST', 'COMPOSITING ARTIST'], highlights: [] },
  { title: 'EŞREF RÜYA', company: CURRENT_COMPANY, period: '2024', summary: bilingual('Compositing and action-scene VFX work including cleanup, shot integration and environment expansion.'), highlights: ['COMPOSITING', 'ACTION FX', 'CLEANUP'] },
  { title: 'KARDEŞ TAKIMI 1–3', company: CURRENT_COMPANY, period: '2024–2025', summary: bilingual('Built CG environments and assets, tracked live-action plates and finished integrated production shots.'), highlights: ['3D ENVIRONMENTS', 'CAMERA TRACKING', 'SHOT FINISHING'] },
  { title: 'BİR SEVDADIR', company: CURRENT_COMPANY, period: '2024', summary: bilingual('Delivered cleanup, green-screen, CG crowd and environment integration work for production shots.'), highlights: ['CLEANUP', 'GREEN SCREEN', 'CG CROWD'] },
  { title: 'ZAFERİN RENGİ', company: CURRENT_COMPANY, period: '2024', summary: bilingual('Worked across numerous shots on 3D camera tracking, CG crowds and large-scale environment/VFX integration.'), highlights: ['3D CAMERA TRACKING', 'CG CROWD', 'CG ENVIRONMENTS'] },
  { title: 'TEŞKİLAT', company: CURRENT_COMPANY, period: '2023–TODAY', summary: bilingual('Handled extensive compositing work including explosion effects, vehicle integration, cleanup, selective blur and shot finishing.'), highlights: ['COMPOSITING', 'VEHICLE INTEGRATION', 'EXPLOSION FX'] },
  { title: 'KURULUŞ OSMAN', company: CURRENT_COMPANY, period: '2023–TODAY', summary: bilingual('Created large-scale CGI armies and crowd scenes alongside 3D castles, nomadic camps and environment work for cinematic sequences.'), highlights: ['CG ARMIES / CROWD', '3D ENVIRONMENTS', 'CG ENVIRONMENT ASSETS'] },
  { title: 'KURULUŞ ORHAN', summary: productions['kurulus-orhan'].description, highlights: [] },
  { title: 'AŞK VE TAHT', summary: bilingual('Created CGI army and crowd work for production shots.'), highlights: ['CG CROWD / ARMY'] },
]
