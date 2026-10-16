import { poseFor, solveRig } from './rig.js'
import { interpolatePose, smooth } from './poses.js'

// Cross-fades controls BEFORE FK / IK, so bone lengths and weapon grips survive.
// There is no interpolation of already-solved elbows or knees.
export class AnimationController {
  constructor() { this.reset() }
  reset() { this.action = null; this.control = null; this.from = null; this.changed = 0; this.lastTime = -1; this.elbowPoles=null; this.targetAngles=null; this.constraintAngles={};this.lastVelocity=null;this.landingImpulse=0 }
  sample(fighter, time) {
    if (time < this.lastTime) this.reset()
    const next = {...poseFor(fighter)}
    if(fighter.airborne&&['jump','aerialKick'].includes(fighter.pose)&&fighter.velocity) {
      const lean=Math.max(-.12,Math.min(.12,fighter.velocity.x/(fighter.scale*fighter.face)*.00045))
      next.lean+=lean;next.neckTilt-=lean*.4
    }
    const unwrap=(angle,around)=>angle+Math.round((around-angle)/(Math.PI*2))*Math.PI*2
    next.armAngles=next.armAngles.map((arm,i)=>arm.map((angle,j)=>this.targetAngles?unwrap(angle,this.targetAngles[i][j]):angle))
    if (fighter.pose !== this.action) {
      if(fighter.pose==='land')this.landingImpulse=Math.min(4,Math.max(0,this.lastVelocity?.y||0)/fighter.scale*.012)
      this.from = this.control ? { ...this.control } : null
      this.action = fighter.pose; this.changed = time
      if (this.from) this.from.rotation += Math.round((next.rotation - this.from.rotation) / (Math.PI * 2)) * Math.PI * 2
      if(this.from)this.from.armAngles=this.from.armAngles.map((arm,i)=>arm.map((angle,j)=>unwrap(angle,next.armAngles[i][j])))
    }
    const reacting=fighter.pose.startsWith('hit')||fighter.pose==='blockRecoil'
    const duration = reacting ? .055 : ['jab', 'cross', 'sword', 'stagger', 'land'].includes(fighter.pose) ? .055 : .13
    const progress = smooth((time - this.changed) / duration)
    let control = this.from && progress < 1 ? interpolatePose(this.from, next, progress, false) : next
    if(this.from&&time-this.changed<.13) {
      // The trunk leads; head and extremities follow on separate time scales.
      // Blend controls, never solved joints: the final IK still owns every bone.
      for(const [keys,seconds] of [[['pelvis','lean','neckTilt'],reacting?.055:.075],[['headTilt'],reacting?.072:.1],[['armAngles'],reacting?.095:.11],[['feet'],reacting?.12:.13]]) {
        const blend=interpolatePose(this.from,next,smooth((time-this.changed)/seconds),false)
        for(const key of keys)control[key]=blend[key]
      }
    }
    if (fighter.pose === 'run' || fighter.pose === 'walk') {
      // A planted foot must never be shifted by the pose cross-fade.
      control.feet = control.feet.map((foot, i) => next.feet[i][1] === 0 ? next.feet[i] : foot)
    }
    if(fighter.pose==='land')control={...control,pelvis:[control.pelvis[0],control.pelvis[1]+Math.sin(Math.PI*fighter.phase)*Math.exp(-4*fighter.phase)*this.landingImpulse]}
    if(fighter.airborne&&fighter.velocity)this.lastVelocity=fighter.velocity
    this.constraintAngles.dt=this.lastTime<0?0:Math.max(0,time-this.lastTime)
    this.control = control; this.lastTime = time
    this.targetAngles=next.armAngles
    if(!fighter.reachGrip)delete this.constraintAngles.reach
    if(!fighter.clash)delete this.constraintAngles.clash
    if(fighter.weapon!=='bow')delete this.constraintAngles.bow
    const rig=solveRig(fighter, control, this.elbowPoles,this.constraintAngles)
    this.elbowPoles=rig.elbowPoles
    return rig
  }
}
