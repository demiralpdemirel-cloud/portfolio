import { COMBO_PHRASES } from './battle/choreography.js'
import { solveRig } from './battle/rig.js'
import { sampleCombat } from './battle/combat.js'
export { flight, platformPoint } from './battle/choreography.js'
export { lerp as mix, clamp01 as clamp } from './battle/poses.js'
export { solveRig, twoBoneIK, forward, toWorld, BONES } from './battle/rig.js'
export const FINISHERS = ['archery', 'sword', 'grapple', 'trap', 'parkour']
export function randomSequence(seed) {
  let value = seed >>> 0
  return () => { value += 0x6D2B79F5; let n = value; n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61); return ((n ^ n >>> 14) >>> 0) / 4294967296 }
}
export const shouldAnimateBattle = ({ visible, hidden, reduced, time, duration }) => visible && !hidden && !reduced && time < duration
export function appearanceAlpha(id,time,reduced=false) {
  if(reduced)return 1
  const q=Math.max(0,Math.min(1,(time-id*.16)/.26))
  return q*q*(3-2*q)
}
export function createFight({ seed = Date.now(), winner = Math.random() < .5 ? 0 : 1, finisher } = {}) {
  const random = randomSequence(seed)
  return { seed, winner, loser: 1 - winner, finisher: finisher || FINISHERS[Math.floor(random() * 5)], opening: random() < .5 ? 'throw' : 'challenge', route: random() < .5 ? 3 : 4, combat: COMBO_PHRASES[Math.floor(random() * COMBO_PHRASES.length)].map(clip => ({ ...clip })), duration: 25 }
}
export function sampleFight(plan, platforms, time) { return sampleCombat(plan, platforms, time) }
export function skeleton(pose, phase) { return solveRig({ pose, phase, clock: phase, x: 0, y: 0, originX: phase * -40, face: 1, scale: 1 }) }
