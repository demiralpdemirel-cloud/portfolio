// Seconds / rig units. Secondary motion is a mass-spring-damper, not a capped
// lerp: velocity survives target changes and acceleration stays bounded.
export const minimumJerk=q=>{q=Math.max(0,Math.min(1,q));return q*q*q*(10+q*(-15+6*q))}
export function springStep(position,velocity,target,dt,{frequency=42,damping=1,maxAcceleration=900,maxSpeed=30,targetVelocity=0}={}) {
  if(dt<=0)return {position,velocity,acceleration:0}
  const acceleration=Math.max(-maxAcceleration,Math.min(maxAcceleration,frequency*frequency*(target-position)+2*damping*frequency*(targetVelocity-velocity)))
  velocity=Math.max(-maxSpeed,Math.min(maxSpeed,velocity+acceleration*dt))
  return {position:position+velocity*dt,velocity,acceleration}
}
export function ballistic(a,b,seconds,duration,height) {
  const t=Math.max(0,Math.min(duration,seconds)),gravity=8*height/(duration*duration)
  const vx=(b.x-a.x)/duration,vy=(b.y-a.y-4*height)/duration
  return {x:a.x+vx*t,y:a.y+vy*t+.5*gravity*t*t,velocity:{x:vx,y:vy+gravity*t},acceleration:{x:0,y:gravity}}
}
export function recoilDisplacement(age,duration,strength,mass=1) {
  if(age<=0||age>=duration)return 0
  const omega=5/duration,impulse=strength*omega*Math.E/mass
  const fade=1-minimumJerk((age/duration-.6)/.4)
  return impulse*age*Math.exp(-omega*age)*fade
}
