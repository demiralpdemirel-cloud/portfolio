import { hurtboxes, attackHitbox } from './combat.js'
import { toWorld } from './rig.js'

// Mounted only by the DEV branch. Bounded reusable SVG pool, no frame-time DOM
// creation. None of the debug group / controls is emitted by the production UI.
export function createBattleDebug(group) {
  const make=(tag,count)=>Array.from({length:count},()=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);group.append(n);return n})
  const lines=make('path',60),texts=make('text',40)
  for(const n of texts){n.setAttribute('font-size','9');n.setAttribute('fill','#fff');n.setAttribute('stroke','none')}
  return (frame,rigs,time)=>{
    let line=0,text=0
    const label=(x,y,value)=>{const n=texts[text++];n.setAttribute('x',x);n.setAttribute('y',y);n.textContent=value}
    const box=(a,b,r,color)=>{const n=lines[line++];n.setAttribute('d',`M${a} L${b}`);n.setAttribute('stroke',color);n.setAttribute('stroke-width',Math.max(2,2*r));n.setAttribute('stroke-opacity','.38');n.setAttribute('stroke-linecap','round')}
    frame.fighters.forEach((actor,i)=>{
      const rig=rigs[i],world=p=>{const v=toWorld(actor,p);return [v.x,v.y]}
      rig.joints.forEach(p=>{const v=world(p);box(v,v,2,'#fff')})
      rig.ikTargets.forEach(p=>{const v=world(p);box([v[0]-3,v[1]],[v[0]+3,v[1]],1,'#ff36ed')})
      rig.paths.slice(1).forEach(p=>{for(let j=1;j<p.length;j++){const a=world(p[j-1]),b=world(p[j]);label((a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(p[j][0]-p[j-1][0],p[j][1]-p[j-1][1]).toFixed(0))}})
      hurtboxes(actor,rig).forEach(b=>box(b.a,b.b,b.r,'#4aff89'))
      label(12,100+i*14,`${i?'EMBER':'CYAN'}: ${actor.pose} / P${actor.priority}`)
    })
    let row=0
    for(const attack of frame.combat.attacks)if(time>=attack.start&&time<attack.end){
      const active=time>=attack.activeStart&&time<=attack.activeEnd,b=active?attackHitbox(attack,frame,rigs):null
      if(b)box(b.a,b.b,b.r,'#ff4657')
      label(12,60+row++*12,`${attack.id}: ${active?'ACTIVE':time<attack.activeStart?'STARTUP':'RECOVERY'}`)
    }
    if(frame.contact){const p=frame.contact.point;box(p,p,5,'#fff400');label(12,86,`${frame.contact.id}: ${frame.contact.blocked?'BLOCK':'CONFIRMED'} @ ${frame.contact.time.toFixed(3)}`)}
    for(let i=line;i<lines.length;i++)lines[i].setAttribute('d','')
    for(let i=text;i<texts.length;i++)texts[i].textContent=''
  }
}
