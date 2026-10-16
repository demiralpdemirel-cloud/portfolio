import { clamp01 as clamp, lerp as mix, smooth } from './poses.js'
import { solveRig, toWorld } from './rig.js'
import { ballistic,minimumJerk } from './kinetics.js'

export const COMBO_PHRASES = [
  [{ a: 0, attack: 'jab', defend: 'dodge', hit: false }, { a: 0, attack: 'cross', defend: 'block', hit: false }, { a: 1, attack: 'kick', defend: 'stagger', hit: true }, { a: 0, attack: 'spin', defend: 'backflip', hit: false }, { a: 1, attack: 'cross', defend: 'stagger', hit: true }, { a: 0, attack: 'jab', defend: 'parry', hit: false }],
  [{ a: 1, attack: 'cross', defend: 'parry', hit: false }, { a: 0, attack: 'jab', defend: 'dodge', hit: false }, { a: 0, attack: 'kick', defend: 'block', hit: false }, { a: 0, attack: 'spin', defend: 'slide', hit: false }, { a: 1, attack: 'cross', defend: 'stagger', hit: true }, { a: 0, attack: 'kick', defend: 'stagger', hit: true }],
  [{ a: 0, attack: 'cross', defend: 'block', hit: false }, { a: 1, attack: 'jab', defend: 'dodge', hit: false }, { a: 1, attack: 'spin', defend: 'backflip', hit: false }, { a: 0, attack: 'kick', defend: 'stagger', hit: true }, { a: 1, attack: 'jab', defend: 'parry', hit: false }, { a: 1, attack: 'cross', defend: 'stagger', hit: true }],
]
export const flight = (a, b, t, height = 90) => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) - 4 * height * t * (1 - t) })
export const platformPoint = (p, index, fraction = .5) => ({ x: p[index].x + p[index].width * fraction, y: p[index].y })
const point = (a, b, q) => ({ x: mix(a.x, b.x, q), y: mix(a.y, b.y, q) })
const phase = (t, start, end) => clamp((t - start) / (end - start))
const contactPhase = action => action === 'kick' || action === 'spin' || action === 'sword' ? .49 : action === 'cross' ? .45 : .43
const rightEdge = (p, inset) => p.x + p.width - inset

// Shared by intent and collision windows. Short probing jabs, longer committed
// kicks and unequal recovery beats replace the previous metronomic six clips.
const schedules=new WeakMap()
export function combatSchedule(plan) {
  if(schedules.has(plan))return schedules.get(plan)
  const clips=plan.combat||COMBO_PHRASES[0]
  const weights=clips.map(c=>({jab:.49,cross:.72,kick:.77,spin:.92}[c.attack]||.7)*(c.a?1.08:.92))
  const total=weights.reduce((a,b)=>a+b,0)
  let start=8
  const beats=clips.map((clip,i)=>{const end=i===clips.length-1?12:start+4*weights[i]/total;const beat={clip,start,end};start=end;return beat})
  schedules.set(plan,beats)
  return beats
}

// Both actors share a phrase and its contact time, never independent random loops.
function exchange(actors, bases, clip, q, scale, clock, weapon = false) {
  const attacker = clip.a, defender = 1 - attacker, hitAt = contactPhase(clip.attack)
  const lunge = Math.sin(clamp(q / .7) * Math.PI) * 6 * scale
  Object.assign(actors[attacker], bases[attacker], { pose: clip.attack, phase: q, x: bases[attacker].x + actors[attacker].face * lunge })
  // This is intent only. A damaging reaction is owned by the contact resolver.
  const defensePhase=phase(q,.08,.96)
  Object.assign(actors[defender], bases[defender], { pose: clip.defend === 'stagger' ? 'watch' : clip.defend, phase: defensePhase })
  if (clip.defend === 'backflip') actors[defender].y -= Math.sin(defensePhase * Math.PI) * 31 * scale
  if (clip.defend === 'slide') actors[defender].x -= actors[defender].face * Math.sin(defensePhase * Math.PI) * 12 * scale
  if (clip.defend === 'dodge') actors[defender].x -= actors[defender].face * Math.sin(defensePhase * Math.PI) * (weapon ? 43 : 23) * scale
  if (weapon) {
    actors.forEach(f => { f.weapon = 'sword' })
    if (clip.defend === 'parry' && q > hitAt - .19 && q < hitAt + .28) {
      const common = { x: (actors[0].x + actors[1].x) * .5, y: bases[0].y - 68 * scale }
      actors.forEach(f => { f.clash = common; f.clashWeight=q<hitAt?smooth(phase(q,hitAt-.19,hitAt)):1-smooth(phase(q,hitAt,hitAt+.28)) })
    }
  }
  return null
}
function move(actor, a, b, t, begin, end, action = 'run') {
  const q = phase(t, begin, end)
  Object.assign(actor, point(a, b, minimumJerk(q)), { pose: q >= 1 ? 'idle' : action, phase: q, originX: a.x, face: Math.sign(b.x - a.x) || actor.face })
}
function leap(actor, a, b, t, begin, end, scale, action = 'jump', height = 80) {
  const q = phase(t, begin, end)
  // Ensure both a real ascent and a descending landing, including tall mobile
  // gaps. Otherwise a high destination could stop a still-rising character.
  const arc = Math.max(height * scale, Math.abs(b.y - a.y) / 4 + 28 * scale)
  Object.assign(actor, ballistic(a,b,t-begin,end-begin,arc), { pose: action, phase: q,airborne:q>0&&q<1 })
}
function horizontalApproach(actor,a,b,t,begin,end) {
  const q=phase(t,begin,end),duration=end-begin,delta=b.x-a.x
  actor.x=mix(a.x,b.x,smooth(q))
  actor.velocity.x=q===1?0:delta*6*q*(1-q)/duration
  actor.acceleration.x=q===1?0:delta*6*(1-2*q)/(duration*duration)
}
function ascend(actor, a, b, t, scale) {
  if (t < 12.22) Object.assign(actor, a, { pose: 'crouch', phase: phase(t, 12, 12.22) })
  else if (t < 13.65) leap(actor, a, b, t, 12.22, 13.65, scale, 'jump', 78)
  else Object.assign(actor, b, { pose: 'land', phase: phase(t, 13.65, 14) })
}

export function evaluateChoreography(plan, platforms, time) {
  const t = Math.max(0, time), w = plan.winner, l = 1 - w
  const width = Math.max(...platforms.map(p => p.x + p.width)) - Math.min(...platforms.map(p => p.x))
  const scale = width < 600 ? .76 : 1.04
  const start = [platformPoint(platforms, 0, .25), platformPoint(platforms, 2, .75)]
  const floor = platformPoint(platforms, plan.route), duel = [{ x: floor.x - 23 * scale, y: floor.y }, { x: floor.x + 23 * scale, y: floor.y }]
  // Mirrored routes keep each fighter facing the exchange, not snapping toward
  // a flying opponent every time their horizontal positions cross.
  let highIndex = w ? 2 : 0
  if(plan.finisher==='grapple'&&floor.y-platforms[highIndex].y<140*scale)highIndex=[1,0,2].find(i=>floor.y-platforms[i].y>=140*scale)??highIndex
  const high = platformPoint(platforms, highIndex, w ? .7 : .3)
  const actors = start.map((p, id) => ({ ...p, pose: 'sit', phase: 0, clock: t*(id?1.07:.93)+(id?1.37:0), face: id ? -1 : 1, scale, angle: 0, weapon: null, originX: p.x }))
  let stage = 'IDLE', projectile = null, rope = null, charge = null, impact = null, droppedSword = null, contact = null
  const set = (id, p, action, begin, end) => Object.assign(actors[id], p, { pose: action, phase: phase(t, begin, end) })
  if (t >= 1.8 && t < 4) {
    stage = 'PROVOCATION'
    set(0, start[0], t < 2.25 ? 'stand' : 'throw', t < 2.25 ? 1.8 : 2.25, t < 2.25 ? 2.25 : 3.3)
    if (t > 2.85) set(1, start[1], t < 3.35 ? 'dodge' : 'stand', t < 3.35 ? 2.85 : 3.35, t < 3.35 ? 3.35 : 4)
    if (plan.opening === 'throw' && t >= 2.796 && t < 3.296) projectile = { ...flight({ x: start[0].x + 28 * scale, y: start[0].y - 48 * scale }, { x: start[1].x, y: start[1].y - 38 * scale }, phase(t, 2.796, 3.296), 16 * scale), kind: 'stone' }
  }
  if (t >= 4 && t < 8) {
    stage = 'CHASE'
    actors.forEach((actor, id) => {
      const origin = platforms[id ? 2 : 0], target = platforms[plan.route]
      const direction = Math.sign(duel[id].x - start[id].x) || 1
      const exit = { x: direction > 0 ? rightEdge(origin, 26 * scale) : origin.x + 26 * scale, y: origin.y }
      const entry = { x: target.x + target.width * (id ? .77 : .23), y: target.y }
      const begin=4+id*.42,runEnd=4.55+id*.36,launch=4.78+id*.4,land=6.35+id*.42,settle=6.7+id*.42
      if(t<begin)set(id,start[id],'watch',4,begin)
      else if (t < runEnd) move(actor, start[id], exit, t, begin, runEnd)
      else if (t < launch) set(id, exit, 'crouch', runEnd, launch)
      else if (t < land) leap(actor, exit, entry, t, launch, land, scale, 'jump', id?68:85)
      else if (t < settle) set(id, entry, 'land', land, settle)
      else if (t < 7.8) move(actor, entry, duel[id], t, settle, 7.8, 'walk')
      else set(id, duel[id], 'guard', 7.8, 8)
    })
  }
  if (t >= 8 && t < 12) {
    stage = 'COMBAT'; actors.forEach((actor, i) => Object.assign(actor, duel[i], { face: i ? -1 : 1 }))
    const beat=combatSchedule(plan).find(beat=>t<beat.end)
    contact = exchange(actors, duel, beat.clip, phase(t,beat.start,beat.end), scale, t)
  }
  const hit = plan.finisher === 'archery' || plan.finisher === 'grapple' ? 17.3 : 18.5
  if (t >= 12) {
    stage = t < 14 ? 'CLIMAX' : t < 20 ? 'FINISHER' : 'VICTORY'
    actors.forEach((actor, i) => Object.assign(actor, duel[i], { pose: i===l?'watch':'idle', phase:phase(t,12,14), face: i ? -1 : 1 }))
    if (plan.finisher === 'archery') {
      if (t < 14) ascend(actors[w], duel[w], high, t, scale)
      else set(w, high, t < 16 ? 'aim' : 'release', t < 16 ? 14 : 16, t < 16 ? 16 : 16.7)
      actors[w].face = Math.sign(duel[l].x - high.x) || 1
      const aim = Math.atan2(duel[l].y - 46 * scale - (high.y - 50 * scale), Math.abs(duel[l].x - high.x))
      actors[w].aimAngle = aim
      if (t >= 14 && t < 18.8) actors[w].weapon = 'bow'
      actors[w].weaponBlend = smooth(phase(t,14,14.2))*(1-smooth(phase(t,18.55,18.8)))
      if (t > 16.75) set(l, duel[l], 'dodge', 16.75, 17.3)
      if (t >= 16 && t < hit) {
        const archer = { ...actors[w], ...high, pose: 'aim', phase: 1, weapon: 'bow' }
        const launch = toWorld(archer, solveRig(archer).hands[1])
        const target = { x: duel[l].x, y: duel[l].y - 30 * scale }, q = phase(t, 16, hit)
        projectile = { ...flight(launch, target, q, 18 * scale), kind: 'arrow', angle: Math.atan2(target.y - launch.y - 72 * scale * (1 - 2 * q), target.x - launch.x) * 180 / Math.PI }
      }
    } else if (plan.finisher === 'sword') {
      const spread = duel.map((p, i) => ({ x: floor.x + (i ? 57 : -57) * scale, y: p.y }))
      if (t < 14) actors.forEach((actor,i)=>{
        const first=i===w,draw=first?12:12.46,drawEnd=first?12.42:12.92,backEnd=first?13.08:13.46,advanceEnd=first?13.7:14
        if(t<draw)set(i,duel[i],'watch',12,draw)
        else if(t<drawEnd)set(i,duel[i],'draw',draw,drawEnd)
        else if(t<backEnd){move(actor,duel[i],spread[i],t,drawEnd,backEnd,'walk');actor.face=i?-1:1}
        else if(t<advanceEnd)move(actor,spread[i],duel[i],t,backEnd,advanceEnd,first?'walk':'run')
        else set(i,duel[i],'watch',advanceEnd,14)
      })
      else if (t < 18) {
        const index = Math.min(5, Math.floor((t - 14) * 1.5)), q = ((t - 14) * 1.5) % 1
        contact = exchange(actors, duel, { a: index % 2 ? l : w, attack: 'sword', defend: index === 2 ? 'dodge' : 'parry', hit: false }, q, scale, t, true)
      } else {
        set(w, duel[w], 'sword', 18, 19.02); actors[w].phase = t < hit ? phase(t, 18, hit) * .49 : .49 + phase(t, hit, 19.1) * .51
        set(l, duel[l], t < 18.2 ? 'block' : 'guard', 18, hit)
      }
      actors.forEach((actor,i) => { if (t >= (i===w?12:12.46) && t < hit) actor.weapon = 'sword' })
      if (t >= hit && t < 19.4) actors[w].weapon = 'sword'
    } else if (plan.finisher === 'grapple') {
      const anchor = { x: rightEdge(platforms[highIndex], 8), y: high.y - 4 }
      const radius = Math.max(55, floor.y - anchor.y - 92 * scale)
      const left = Math.min(...platforms.map(p => p.x)) + 34 + 16*scale, right = Math.max(...platforms.map(p => p.x + p.width)) - 34 - 16*scale
      const bound = angle => Math.asin(Math.max(-.8, Math.min(.8, (Math.max(left, Math.min(right, anchor.x + Math.sin(angle) * radius)) - anchor.x) / radius)))
      const sign = w ? -1 : 1, entry = bound(-sign * .66), exit = bound(sign * .58)
      const swing = q => { const theta = mix(entry, exit, (1 - Math.cos(q * Math.PI)) / 2); const grip = { x: anchor.x + Math.sin(theta) * radius, y: anchor.y + Math.cos(theta) * radius }; return { x: grip.x - sign * 16 * scale, y: grip.y + 62 * scale, grip } }
      const launch = swing(0), release = swing(1), kick = { x: duel[l].x - sign * 24 * scale, y: floor.y - 4 * scale }
      if (t < 13) set(w, duel[w], 'aim', 12, 13)
      else if (t < 14) { leap(actors[w], duel[w], launch, t, 13, 14, scale, 'jump', 35); horizontalApproach(actors[w],duel[w],launch,t,13,13.8) }
      else if (t < 15.8) { const q = phase(t, 14, 15.8); Object.assign(actors[w], swing(q), { pose: 'swing', phase: q }) }
      else if (t < hit) { leap(actors[w], release, kick, t, 15.8, hit, scale, 'aerialKick', 48); actors[w].phase=phase(t,15.8,hit)*.49 }
      else if (t < 17.85) leap(actors[w], kick, duel[w], t, hit, 17.85, scale, 'jump', 22)
      else set(w, duel[w], 'land', 17.85, 18.3)
      if(t>=13.55&&t<14){actors[w].reachGrip=launch.grip;actors[w].gripWeight=smooth(phase(t,13.55,13.85))}
      if (t > 12.65 && t < 15.8) {
        const grip = actors[w].grip || toWorld(actors[w], solveRig(actors[w]).hands[1])
        rope = { a: anchor, b: grip, progress: phase(t, 12.65, 13), owner:w }
      }
    } else if (plan.finisher === 'trap') {
      const plant = { x: floor.x - (w ? -20 : 20) * scale, y: floor.y }
      if (t < 13.4) { move(actors[w], duel[w], plant, t, 12, 12.3, 'walk'); actors[w].pose = 'plant'; actors[w].phase = phase(t, 12, 13.4) }
      else if (t < 14) set(w, plant, 'guard', 13.4, 14)
      else if (t < 15.65) leap(actors[w], plant, high, t, 14, 15.65, scale, 'jump', 80)
      else if (t < 16) set(w, high, 'land', 15.65, 16)
      else set(w, high, 'guard', 16, hit)
      if (t > 14.5) move(actors[l], duel[l], floor, t, 14.5, 17.5, 'walk')
      if (t > 13 && t < hit) charge = { ...floor, warning: t > 17.5 }
    } else {
      const edge = { x: rightEdge(platforms[highIndex], 9), y: high.y }
      const ledgeTop = { x: edge.x - 22 * scale, y: high.y }
      const approach = w ? -1 : 1
      const hanging = { x: edge.x - approach * 17 * scale, y: edge.y + 62 * scale }
      if (t < 12.2) set(w, duel[w], 'crouch', 12, 12.2)
      else if (t < 13.15) { leap(actors[w], duel[w], hanging, t, 12.2, 13.15, scale, 'jump', 75); horizontalApproach(actors[w],duel[w],hanging,t,12.2,12.95) }
      else if (t < 13.4) { set(w, hanging, 'hang', 13.15, 13.4); actors[w].grip = edge; actors[w].face = approach }
      else if (t < 14) {
        const q = phase(t, 13.4, 14), top = { x: hanging.x, y: high.y }
        Object.assign(actors[w], q < .65 ? point(hanging, top, smooth(q / .65)) : point(top, ledgeTop, smooth((q - .65) / .35)), { pose: 'pullup', phase: q, face: approach })
        if (q <= .65) actors[w].grip = edge
      }
      else if (t < 15.2) leap(actors[w], ledgeTop, duel[w], t, 14, 15.2, scale, 'backflip', 70)
      else if (t < 15.5) set(w, duel[w], 'land', 15.2, 15.5)
      else if (t < 16.1) contact = exchange(actors, duel, { a: l, attack: 'kick', defend: 'slide', hit: false }, phase(t, 15.5, 16.1), scale, t)
      else if (t < 16.7) contact = exchange(actors, duel, { a: w, attack: 'cross', defend: 'stagger', hit: true }, phase(t, 16.1, 16.7), scale, t)
      else if (t < 16.95) set(w, duel[w], 'crouch', 16.7, 16.95)
      else if (t < hit) {
        const kick = { x: duel[l].x - (w ? -24 : 24) * scale, y: floor.y - 8 * scale }
        leap(actors[w], duel[w], kick, t, 16.95, hit, scale, 'aerialKick', 72); actors[w].phase = phase(t, 16.95, hit) * .49
      } else {
        const kick = { x: duel[l].x - (w ? -24 : 24) * scale, y: floor.y - 8 * scale }
        if (t < 19.05) leap(actors[w], kick, duel[w], t, hit, 19.05, scale, 'jump', 20)
        else set(w, duel[w], 'land', 19.05, 19.4)
      }
      if(t>=12.8&&t<13.15){actors[w].reachGrip=edge;actors[w].gripWeight=smooth(phase(t,12.8,13.1))}
    }
  }
  return { fighters: actors, stage, projectile, rope, charge, impact, droppedSword, contact }
}
