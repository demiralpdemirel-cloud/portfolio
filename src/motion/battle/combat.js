import { evaluateChoreography, flight, platformPoint, combatSchedule } from './choreography.js'
import { solveRig, toWorld, pointSegmentDistance } from './rig.js'
import { clamp01 } from './poses.js'
import { AnimationController } from './controller.js'
import { recoilDisplacement } from './kinetics.js'

export const PRIORITY = Object.freeze({ IDLE:0, LOCOMOTION:1, TRAVERSAL:2, COMBAT:3, REACTION:4, DEFEATED:5 })
export function statePriority(pose) {
  if(pose==='defeated')return PRIORITY.DEFEATED
  if(pose.startsWith('hit')||pose==='blockRecoil')return PRIORITY.REACTION
  if(['guard','watch','jab','cross','kick','spin','sword','aim','release','block','parry','dodge','slide','aerialKick'].includes(pose))return PRIORITY.COMBAT
  if(['jump','land','fall','hang','pullup','swing','backflip','frontflip','aerialKick','crouch'].includes(pose))return PRIORITY.TRAVERSAL
  return ['run','walk'].includes(pose)?PRIORITY.LOCOMOTION:PRIORITY.IDLE
}
const wp=(actor,p)=>{const v=toWorld(actor,p);return [v.x,v.y]}
const capsule=(a,b,r,kind)=>({a,b,r,kind})
export function hurtboxes(actor,rig=solveRig(actor)) {
  return [capsule(wp(actor,rig.head),wp(actor,rig.head),7*actor.scale,'head'),capsule(wp(actor,rig.neck),wp(actor,rig.pelvis),5*actor.scale,'torso')]
}
export function overlaps(a,b) {
  // Segment intersection plus endpoint distances handles crossing capsules.
  const cross=(u,v,w)=>(v[0]-u[0])*(w[1]-u[1])-(v[1]-u[1])*(w[0]-u[0])
  const intersects=cross(a.a,a.b,b.a)*cross(a.a,a.b,b.b)<=0&&cross(b.a,b.b,a.a)*cross(b.a,b.b,a.b)<=0
    &&Math.max(Math.min(a.a[0],a.b[0]),Math.min(b.a[0],b.b[0]))<=Math.min(Math.max(a.a[0],a.b[0]),Math.max(b.a[0],b.b[0]))
    &&Math.max(Math.min(a.a[1],a.b[1]),Math.min(b.a[1],b.b[1]))<=Math.min(Math.max(a.a[1],a.b[1]),Math.max(b.a[1],b.b[1]))
  return intersects||Math.min(pointSegmentDistance(a.a,b.a,b.b),pointSegmentDistance(a.b,b.a,b.b),pointSegmentDistance(b.a,a.a,a.b),pointSegmentDistance(b.b,a.a,a.b))<=a.r+b.r
}
export function attackHitbox(attack,frame,rigs) {
  const actor=frame.fighters[attack.attacker],rig=rigs[attack.attacker],s=actor.scale
  if(attack.move==='arrow') {
    const p=frame.projectile
    if(!p||p.kind!=='arrow')return null
    const angle=p.angle*Math.PI/180
    return capsule([p.x-8*Math.cos(angle),p.y-8*Math.sin(angle)],[p.x+12*Math.cos(angle),p.y+12*Math.sin(angle)],2*s,'arrow')
  }
  if(attack.move==='explosion')return frame.charge?capsule([frame.charge.x,frame.charge.y-16*s],[frame.charge.x,frame.charge.y-16*s],32*s,'explosion'):null
  if(attack.move==='sword')return rig.weapon?capsule(wp(actor,rig.weapon.origin),wp(actor,rig.weapon.tip),2.5*s,'blade'):null
  const kick=['kick','spin','aerialKick'].includes(attack.move)
  const path=rig.paths[kick?4:attack.move==='cross'?1:2]
  // Only distal shin / forearm is active; a resting shoulder is not a weapon.
  const start=path[1].map((v,i)=>(v+path[2][i])*.5)
  return capsule(wp(actor,start),wp(actor,path[2]),(kick?4:3.5)*s,kick?'shin':'fist')
}
function descriptor(id,attacker,move,start,end,activeStart,activeEnd,terminal=false) {
  return {id,attacker,defender:1-attacker,move,start,end,startup:activeStart-start,activeStart,activeEnd,recovery:end-activeEnd,terminal}
}
export function describeAttacks(plan) {
  const attacks=combatSchedule(plan).map(({clip,start,end},i)=>descriptor(`exchange-${i}`,clip.a,clip.attack,start,end,start+.28*(end-start),start+.68*(end-start)))
  const w=plan.winner,l=1-w
  if(plan.finisher==='sword') {
    for(let i=0;i<6;i++)attacks.push(descriptor(`sword-${i}`,i%2?l:w,'sword',14+i/1.5,14+(i+1)/1.5,14+(i+.31)/1.5,14+(i+.66)/1.5))
    attacks.push(descriptor('final',w,'sword',18,19.1,18.38,18.499,true))
  } else if(plan.finisher==='archery')attacks.push(descriptor('final',w,'arrow',14,17.3,16,17.2999,true))
  else if(plan.finisher==='grapple')attacks.push(descriptor('final',w,'aerialKick',15.8,18.3,16.8,17.2999,true))
  else if(plan.finisher==='trap')attacks.push(descriptor('final',w,'explosion',13,19,18.49,18.4999,true))
  else {
    attacks.push(descriptor('parkour-evade',l,'kick',15.5,16.1,15.68,15.94))
    attacks.push(descriptor('parkour-cross',w,'cross',16.1,16.7,16.28,16.53))
    attacks.push(descriptor('final',w,'aerialKick',16.95,19.4,18.1,18.4999,true))
  }
  return attacks
}
const reactions={jab:['hitLight',.24,3],cross:['hitHeavy',.35,8],kick:['hitKick',.36,7],spin:['hitKick',.36,7],aerialKick:['hitKick',.4,8],sword:['hitSword',.32,7],arrow:['hitHeavy',.36,6],explosion:['hitExplosion',.5,15]}
export function applyContacts(frame,events,time,platforms,plan) {
  frame.impact=null;frame.contact=null;frame.hitstop=0
  for(const event of events) {
    const age=time-event.time
    if(age<0)continue
    const actor=frame.fighters[event.defender],[reaction,duration,impulse]=event.blocked?['blockRecoil',.2,2]:reactions[event.move]
    if(age<duration && statePriority(actor.pose)<PRIORITY.DEFEATED) {
      Object.assign(actor,{pose:reaction,phase:clamp01(age/duration),reaction:event.id})
      actor.x-=actor.face*recoilDisplacement(age,duration,impulse,event.defender?1.12:1)*actor.scale
      delete actor.clash;delete actor.grip;delete actor.reachGrip
    }
    if(age<.065)frame.hitstop=event.blocked?.018:.045
    if(age<.23){frame.contact=event;frame.impact={x:event.point[0],y:event.point[1],age,power:event.blocked?.18:event.move==='explosion'?.9:.35,kind:event.blocked?'clash':event.move==='explosion'?'explosion':'hit'}}
    if(event.terminal&&!event.blocked) {
      if(event.move==='arrow')frame.projectile=null
      if(event.move==='explosion')frame.charge=null
      const lower=platforms.reduce((best,p,i)=>p.y>platforms[best].y?i:best,0),landing=platformPoint(platforms,lower,event.defender?.7:.3)
      const q=clamp01(age/1.2),travel=flight(event.root,landing,q,42*actor.scale)
      Object.assign(actor,travel,{pose:age<.32?reaction:age<1.2?'fall':'defeated',phase:age<.32?age/.32:age<1.2?(age-.32)/.88:clamp01((age-1.2)/.3)})
      if(time>=20)frame.fighters[event.attacker].pose='victory'
      if(plan.finisher==='sword'&&age<1.2)frame.droppedSword={...flight({x:event.root.x,y:event.root.y-38*actor.scale},{x:event.root.x+(event.defender?30:-30)*actor.scale,y:event.root.y},q,20),angle:age*310}
    }
  }
  frame.fighters.forEach(actor=>{actor.priority=statePriority(actor.pose)})
  return frame
}
// A fixed 240Hz simulation clock is independent of display refresh / slow motion.
// Collisions use exactly the rigs this engine renders, including pose blends and
// elbow constraints. Seeking replays this same simulation, never fabricates hits.
export class CombatController {
  constructor(plan,platforms) {this.plan=plan;this.platforms=platforms;this.attacks=describeAttacks(plan);this.reset()}
  reset(){this.tick=-1;this.events=[];this.confirmed=new Set();this.controllers=[new AnimationController(),new AnimationController()];this.frame=null}
  step(t) {
    const frame=applyContacts(evaluateChoreography(this.plan,this.platforms,t),this.events,t,this.platforms,this.plan)
    const rigs=frame.fighters.map((f,i)=>this.controllers[i].sample(f,t))
    for(const attack of this.attacks) {
      if(t<attack.activeStart||t>attack.activeEnd||this.confirmed.has(attack.id)||frame.fighters[attack.attacker].priority>=PRIORITY.REACTION)continue
      const box=attackHitbox(attack,frame,rigs)
      if(!box)continue
      const defender=frame.fighters[attack.defender],rig=rigs[attack.defender]
      if(defender.priority===PRIORITY.DEFEATED)continue
      const guarding=['block','parry','blockRecoil'].includes(defender.pose)
      const guards=guarding?rig.paths.slice(1,3).map(p=>capsule(wp(defender,p[1]),wp(defender,p[2]),4*defender.scale,'guard')):[]
      if(guarding&&rig.weapon)guards.push(capsule(wp(defender,rig.weapon.origin),wp(defender,rig.weapon.tip),3*defender.scale,'guard'))
      const guard=guards.find(b=>overlaps(box,b)),body=hurtboxes(defender,rig).find(b=>overlaps(box,b))
      if(!guard&&!body)continue
      this.events.push({...attack,time:t,blocked:!!guard,hitbox:box,hurtbox:guard||body,point:body?body.a:box.b,root:{x:defender.x,y:defender.y}})
      this.confirmed.add(attack.id)
      // One pose owner: the existing controller resolves the immediate reaction
      // before the SVG receives a single final set of bone coordinates.
      Object.assign(frame,applyContacts(evaluateChoreography(this.plan,this.platforms,t),this.events,t,this.platforms,this.plan))
      rigs[attack.defender]=this.controllers[attack.defender].sample(frame.fighters[attack.defender],t)
    }
    if(t>=20&&!this.events.some(e=>e.terminal&&!e.blocked))frame.stage='RECOVERY'
    if(frame.rope)frame.rope.b=toWorld(frame.fighters[frame.rope.owner],rigs[frame.rope.owner].hands[1])
    frame.rigs=rigs;frame.combat={attacks:this.attacks,events:this.events,misses:this.attacks.filter(a=>a.activeEnd<t&&!this.confirmed.has(a.id)).map(a=>a.id)}
    this.frame=frame
  }
  sample(time) {
    const tick=Math.floor(Math.max(0,time)*240+1e-7)
    if(tick<this.tick)this.reset()
    while(this.tick<tick){this.tick++;this.step(this.tick/240)}
    return this.frame
  }
}
const cache=new WeakMap(),ledgerCache=new WeakMap()
function cachedEngine(plan,platforms) {
  let engine=cache.get(plan)
  if(engine?.platforms!==platforms){engine=new CombatController(plan,platforms);cache.set(plan,engine)}
  return engine
}
export function combatLedger(plan,platforms) {
  let saved=ledgerCache.get(plan)
  if(saved?.platforms===platforms)return saved
  const engine=new CombatController(plan,platforms),frame=engine.sample(plan.duration)
  saved={...frame.combat,platforms};ledgerCache.set(plan,saved);return saved
}
export function sampleCombat(plan,platforms,time) {return cachedEngine(plan,platforms).sample(time)}
