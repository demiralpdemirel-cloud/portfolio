import { authoredPose, idlePose, locomotionPose } from './poses.js'
import { springStep } from './kinetics.js'

export const BONES = { thigh: 19, calf: 19, upperArm: 17, forearm: 17, chest: 19, neck: 5, head: 8 }
const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
export const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
export function forward(origin, angle, length) { return [origin[0] + Math.cos(angle) * length, origin[1] + Math.sin(angle) * length] }
export function twoBoneIK(origin, target, upper, lower, bend = 1) {
  const dx = target[0] - origin[0], dy = target[1] - origin[1]
  const raw = Math.hypot(dx, dy), length = Math.max(.001, Math.min(upper + lower - .0001, Math.max(Math.abs(upper - lower) + .0001, raw)))
  const aim = Math.atan2(dy, dx), offset = Math.acos(Math.max(-1, Math.min(1, (upper * upper + length * length - lower * lower) / (2 * upper * length))))
  const joint = forward(origin, aim + offset * bend, upper), end = forward(origin, aim, length)
  return { joint, end, reachable: Math.abs(raw - length) < .01 }
}
export function toWorld(fighter, point) { return { x: fighter.x + point[0] * fighter.scale * fighter.face, y: fighter.y + point[1] * fighter.scale } }
const fromWorld = (f, p) => [(p.x - f.x) / (f.scale * f.face), (p.y - f.y) / f.scale]
export function pointSegmentDistance(p, a, b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],q=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)))
  return distance(p,[a[0]+dx*q,a[1]+dy*q])
}
// Fixed anatomical pole; never switch to the opposite elbow solution. Project
// unreachable / over-folded targets and keep both segments outside the head.
export function armIK(shoulder, requested, head, bend, side=1, memory, key, gripping=false,tracking=false) {
  let radius=Math.max(gripping?8:14,Math.min(33.8,distance(shoulder,requested)))
  let aim=Math.atan2(requested[1]-shoulder[1],requested[0]-shoulder[0])
  const requestedAngle=aim,requestedRadius=radius
  const previous=memory?.[key]
  let velocity=0,reachVelocity=0,angularAcceleration=0
  if(previous) {
    const dt=Math.max(0,Math.min(1/30,memory.dt??1/60))
    const delta=Math.atan2(Math.sin(aim-previous.angle),Math.cos(aim-previous.angle))
    const targetVelocity=tracking&&dt?Math.atan2(Math.sin(aim-(previous.targetAngle??aim)),Math.cos(aim-(previous.targetAngle??aim)))/dt:0
    const radiusVelocity=tracking&&dt?(radius-(previous.targetRadius??radius))/dt:0
    const angleSpring=springStep(previous.angle,previous.velocity||0,previous.angle+delta,dt,{targetVelocity:Math.max(-30,Math.min(30,targetVelocity))})
    const reachSpring=springStep(previous.radius,previous.reachVelocity||0,radius,dt,{maxAcceleration:8000,maxSpeed:250,targetVelocity:Math.max(-250,Math.min(250,radiusVelocity))})
    aim=angleSpring.position;velocity=angleSpring.velocity;angularAcceleration=angleSpring.acceleration
    radius=Math.max(gripping?8:14,Math.min(33.8,reachSpring.position));reachVelocity=reachSpring.velocity
  }
  const solve=angle=>twoBoneIK(shoulder,forward(shoulder,angle,radius),17,17,bend)
  const clear=arm=>Math.min(pointSegmentDistance(head,shoulder,arm.joint),pointSegmentDistance(head,arm.joint,arm.end))>=9
  let arm=solve(aim)
  if(!clear(arm)) {
    for(let n=1;n<=90;n++) {
      const candidates=previous?[solve(aim+n*Math.PI/90),solve(aim-n*Math.PI/90)]:[solve(aim+side*n*Math.PI/90)]
      const safe=candidates.find(clear)
      if(safe){
        // Refine the collision boundary; don't jump in visible 2-degree steps.
        let invalid=aim,valid=Math.atan2(safe.end[1]-shoulder[1],safe.end[0]-shoulder[0])
        valid=aim+Math.atan2(Math.sin(valid-aim),Math.cos(valid-aim))
        for(let j=0;j<10;j++){const mid=(invalid+valid)*.5;if(clear(solve(mid)))valid=mid;else invalid=mid}
        arm=solve(valid);velocity=0;break
      }
    }
  }
  if(memory)memory[key]={angle:Math.atan2(arm.end[1]-shoulder[1],arm.end[0]-shoulder[0]),radius,velocity,reachVelocity,targetAngle:requestedAngle,targetRadius:requestedRadius}
  return {...arm, requested, bend, angularVelocity:velocity,angularAcceleration, headClearance:Math.min(pointSegmentDistance(head,shoulder,arm.joint),pointSegmentDistance(head,arm.joint,arm.end))}
}
const reachArc=(hand,target,shoulder,weight,memory,key)=>{
  const a=Math.atan2(hand[1]-shoulder[1],hand[0]-shoulder[0]),b=Math.atan2(target[1]-shoulder[1],target[0]-shoulder[0])
  let delta=Math.atan2(Math.sin(b-a),Math.cos(b-a))
  if(memory){if(memory[key]!==undefined)delta+=Math.round((memory[key]-delta)/(Math.PI*2))*Math.PI*2;memory[key]=delta}
  const angle=a+delta*weight
  return forward(shoulder,angle,distance(hand,shoulder)+(distance(target,shoulder)-distance(hand,shoulder))*weight)
}

export function poseFor(fighter) {
  const { pose: action, phase = 0, clock = phase } = fighter
  if(action==='watch') {
    const control=authoredPose('watch',phase),breath=Math.sin(clock*2.05),weight=Math.sin(clock*.83)
    return {...control,pelvis:[control.pelvis[0]+weight*.65,control.pelvis[1]+breath*.3],lean:control.lean+weight*.025,neckTilt:control.neckTilt+Math.sin(clock*1.1)*.025}
  }
  return action === 'sit' || action === 'idle' ? idlePose(clock, action === 'sit') : action === 'run' || action === 'walk' ? locomotionPose(fighter) : authoredPose(action, phase)
}
export function solveRig(fighter, suppliedControl, elbowPoles, constraintAngles) {
  const { pose: action, phase = 0 } = fighter
  let control = suppliedControl || poseFor(fighter)
  const pelvis = [...control.pelvis]
  const chest = forward(pelvis, -Math.PI / 2 + control.lean, BONES.chest)
  const neck = forward(chest, -Math.PI / 2 + control.lean * .5 + control.neckTilt, BONES.neck)
  const head = forward(neck, -Math.PI / 2 + control.headTilt + control.neckTilt, BONES.head)
  const shoulders = [add(chest, [-2.5, 1]), add(chest, [2.5, 1])]
  const hips = [add(pelvis, [-2, 0]), add(pelvis, [2, 0])]
  const fkArms=shoulders.map((shoulder,i)=>{const joint=forward(shoulder,control.armAngles[i][0],BONES.upperArm);return {joint,end:forward(joint,control.armAngles[i][1],BONES.forearm),reachable:true}})
  let hands = fkArms.map(arm => [...arm.end])
  if (fighter.weapon === 'bow') {
    const angle = fighter.aimAngle || 0
    const target = forward(shoulders[1], angle, 29), weight = fighter.weaponBlend ?? 1
    hands[1] = reachArc(hands[1],target,shoulders[1],weight,constraintAngles,'bow')
    if(action==='aim') { const rear=add(shoulders[0],[8*(1-Math.min(1,phase/.72))-8,-6]); hands[0]=hands[0].map((v,i)=>v+(rear[i]-v)*weight) }
  }
  if (fighter.reachGrip) { const target=fromWorld(fighter,fighter.reachGrip); hands[1]=reachArc(hands[1],target,shoulders[1],fighter.gripWeight,constraintAngles,'reach') }
  if (fighter.grip) hands[1] = fromWorld(fighter, fighter.grip)
  if (fighter.clash) {
    const point = fromWorld(fighter, fighter.clash)
    const target=[point[0] - Math.cos(-1.05) * 32, point[1] - Math.sin(-1.05) * 32]
    hands[1]=reachArc(hands[1],target,shoulders[1],fighter.clashWeight??1,constraintAngles,'clash')
  }
  if(fighter.grip&&constraintAngles)delete constraintAngles.arm1
  const arms = hands.map((target,i)=>armIK(shoulders[i],target,head,1,i?1:-1,constraintAngles,`arm${i}`,i===1&&!!fighter.grip,i===1&&!!fighter.reachGrip))
  const legs = control.feet.map((target, i) => twoBoneIK(hips[i], target, BONES.thigh, BONES.calf, control.legBend[i]))
  hands = arms.map(a => a.end)
  let feet = legs.map(l => l.end)
  let paths = [[neck, chest, pelvis], ...arms.map((arm, i) => [shoulders[i], arm.joint, arm.end]), ...legs.map((leg, i) => [hips[i], leg.joint, leg.end])]
  let joints = [neck, chest, pelvis, ...shoulders, ...arms.map(a => a.joint), ...hands, ...legs.map(l => l.joint), ...feet]
  const angle = fighter.rotation ?? control.rotation
  const rotate = p => { const x = p[0] - pelvis[0], y = p[1] - pelvis[1]; return [pelvis[0] + x * Math.cos(angle) - y * Math.sin(angle), pelvis[1] + x * Math.sin(angle) + y * Math.cos(angle)] }
  const rotatedHead = angle ? rotate(head) : head
  if (angle) { paths = paths.map(path => path.map(rotate)); joints = joints.map(rotate); hands = hands.map(rotate); feet=feet.map(rotate) }
  const weaponAngle = fighter.clash ? control.bladeAngle+(-1.05-control.bladeAngle)*(fighter.clashWeight??1) : fighter.weapon === 'bow' ? fighter.aimAngle || 0 : control.bladeAngle
  const weapon = fighter.weapon ? { kind: fighter.weapon, origin: hands[1], angle: weaponAngle + angle, tip: forward(hands[1], weaponAngle + angle, 32) } : null
  return { head: rotatedHead, neck:angle?rotate(neck):neck, chest:angle?rotate(chest):chest, pelvis, paths, joints, hands, feet, weapon, arms, ikTargets:arms.map(a=>angle?rotate(a.requested):a.requested), contacts: legs.map(l => l.reachable), control, elbowPoles:arms.map((arm,i)=>[arm.joint[0]-shoulders[i][0],arm.joint[1]-shoulders[i][1]]) }
}
