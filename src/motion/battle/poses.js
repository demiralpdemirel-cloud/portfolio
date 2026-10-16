// Authored action poses, in rig space (feet at zero, facing right).
// Curves belong to individual phases: anticipation is not eased like contact.
export const clamp01 = n => Math.max(0, Math.min(1, n))
export const lerp = (a, b, t) => a + (b - a) * t
export const smooth = t => { t = clamp01(t); return t * t * (3 - 2 * t) }
const curves = { smooth, linear: t => t, strike: t => 1 - (1 - t) ** 4, settle: t => 1 - (1 - t) ** 3 }
export const basePose = {
  pelvis: [0, -32], lean: .06, neckTilt: -.03, headTilt: 0,
  hands: [[-10, -43], [15, -46]], feet: [[-12, 0], [12, 0]],
  armBend: [1, 1], legBend: [-1, -1],
  rotation: 0, bladeAngle: -1.05,
}
function armAngles(control) {
  const chest=[control.pelvis[0]+Math.sin(control.lean)*19,control.pelvis[1]-Math.cos(control.lean)*19]
  return control.hands.map((hand,i)=>{
    const shoulder=[chest[0]+(i?2.5:-2.5),chest[1]+1],dx=hand[0]-shoulder[0],dy=hand[1]-shoulder[1]
    const reach=Math.max(.001,Math.min(33.9999,Math.hypot(dx,dy)))
    const upper=Math.atan2(dy,dx)+Math.acos(reach/34)*control.armBend[i]
    const elbow=[shoulder[0]+Math.cos(upper)*17,shoulder[1]+Math.sin(upper)*17]
    return [upper,Math.atan2(hand[1]-elbow[1],hand[0]-elbow[0])]
  })
}
const pose = patch => { const value={...basePose,...patch};value.armAngles=patch.armAngles||armAngles(value);return value }
export function interpolatePose(a, b, t, shortestAngles = true) {
  const blend = (x, y) => Array.isArray(x) ? x.map((v, i) => blend(v, y[i])) : lerp(x, y, t)
  return Object.fromEntries(Object.keys(a).map(key => [key,key==='armAngles'&&shortestAngles?a[key].map((arm,i)=>arm.map((angle,j)=>angle+Math.atan2(Math.sin(b[key][i][j]-angle),Math.cos(b[key][i][j]-angle))*t)):blend(a[key], b[key])]))
}
const key = (at, patch, curve = 'smooth') => ({ at, value: pose(patch), curve })
const guard = { pelvis:[0,-30],lean: .16, hands: [[-17, -28], [25, -37]], feet: [[-14, 0], [13, 0]] }
const low = { pelvis: [-5, -20], lean: .45, hands: [[-9, -32], [22, -29]], feet: [[-12, 0], [12, 0]] }
export const ACTION_POSES = {
  watch: [key(0,{...guard,lean:-.06,neckTilt:.04,hands:[[-18,-37],[22,-44]],feet:[[-14,0],[11,0]]}),key(.4,{...guard,lean:.04,headTilt:-.06,hands:[[-15,-39],[21,-45]],feet:[[-14,0],[11,0]]}),key(1,{...guard,lean:-.03,hands:[[-17,-37],[23,-43]],feet:[[-14,0],[11,0]]})],
  hitLight: [key(0, guard), key(.18,{...guard,lean:-.22,headTilt:-.27,neckTilt:-.12},'strike'),key(.48,{...guard,hands:[[-22,-37],[13,-32]],lean:-.16}),key(1,guard,'settle')],
  hitHeavy: [key(0,guard),key(.16,{pelvis:[-5,-28],lean:-.5,headTilt:-.42,hands:[[-17,-39],[12,-38]],feet:[[-16,0],[10,0]]},'strike'),key(.48,{...low,lean:-.25,hands:[[-25,-31],[17,-26]],feet:[[-20,0],[6,-5]]}),key(1,guard,'settle')],
  hitKick: [key(0,guard),key(.17,{pelvis:[-6,-27],lean:.6,headTilt:.24,hands:[[-14,-32],[21,-32]],feet:[[-16,0],[11,-7]]},'strike'),key(.55,{...low,hands:[[-19,-25],[24,-22]]}),key(1,guard,'settle')],
  hitSword: [key(0,guard),key(.14,{...guard,pelvis:[-5,-29],lean:-.48,headTilt:-.3,hands:[[-23,-36],[12,-32]],bladeAngle:1.3},'strike'),key(.55,low),key(1,guard,'settle')],
  hitExplosion: [key(0,guard),key(.12,{pelvis:[-4,-27],lean:-.65,headTilt:-.4,hands:[[-24,-50],[20,-52]],feet:[[-15,-5],[16,-11]],rotation:-.25},'strike'),key(.7,{...low,rotation:-.6}),key(1,low)],
  blockRecoil: [key(0,{...guard,hands:[[13,-53],[24,-44]]}),key(.22,{...guard,lean:-.24,headTilt:-.12,hands:[[7,-51],[19,-42]]},'strike'),key(1,guard,'settle')],
  guard: [key(0, guard), key(1, guard)],
  stand: [key(0, { pelvis: [0, -6], lean: -.14, hands: [[-12, -2], [9, -8]], feet: [[11, 11], [17, 20]] }), key(.45, low), key(1, guard)],
  jab: [key(0, guard), key(.2, { ...guard, pelvis: [-4, -31], lean: -.16, hands: [[-9, -51], [1, -49]] }), key(.43, { ...guard, pelvis: [3, -31], lean: .4, hands: [[1, -47], [38, -48]] }, 'strike'), key(.58, { ...guard, lean: .48, hands: [[-4, -43], [36, -43]] }), key(1, guard, 'settle')],
  cross: [key(0, guard), key(.23, { ...guard, lean: -.28, hands: [[-20, -46], [8, -52]] }), key(.45, { ...guard, pelvis: [4, -30], lean: .5, hands: [[36, -43], [12, -48]] }, 'strike'), key(.64, { ...guard, lean: .36, hands: [[29, -39], [16, -47]] }), key(1, guard, 'settle')],
  kick: [key(0, guard), key(.22, { pelvis: [-4, -30], lean: -.15, feet: [[-12, 0], [11, -14]], hands: [[-12, -48], [10, -47]] }), key(.49, { pelvis: [-2, -29], lean: -.36, feet: [[-12, 0], [34, -30]], hands: [[-20, -47], [6, -49]] }, 'strike'), key(.67, { pelvis: [-1, -29], lean: -.25, feet: [[-12, 0], [24, -21]] }), key(1, guard, 'settle')],
  spin: [key(0, guard), key(.25, { ...low, rotation: -.2 }), key(.5, { pelvis: [0, -25], lean: -.2, feet: [[-12, -9], [35, -28]], hands: [[-24, -38], [10, -48]], rotation: -.15 }, 'strike'), key(.75, { ...low, rotation: .15 }), key(1, guard)],
  block: [key(0, guard), key(.28, { ...guard, pelvis: [-2, -30], lean: -.12, hands: [[14, -56], [25, -47]] }), key(.55, { ...guard, pelvis: [-5, -29], lean: -.23, hands: [[10, -53], [21, -44]] }), key(1, guard)],
  parry: [key(0, guard), key(.25, { ...guard, hands: [[3, -52], [12, -60]], bladeAngle: -.55 }), key(.48, { ...guard, lean: -.12, hands: [[11, -52], [24, -47]], bladeAngle: -1.3 }, 'strike'), key(.72, { ...guard, lean: -.23, hands: [[5, -50], [27, -41]], bladeAngle: -.2 }), key(1, guard)],
  dodge: [key(0, guard), key(.3, { pelvis: [-11, -21], lean: .5, headTilt: -.16, hands: [[-19, -34], [12, -33]], feet: [[-12, 0], [12, 0]] }, 'settle'), key(.65, low), key(1, guard)],
  slide: [key(0, guard), key(.25, { pelvis: [-6, -12], lean: -.65, hands: [[-20, -17], [3, -27]], feet: [[-15, 0], [25, 0]] }, 'settle'), key(.72, { pelvis: [-3, -14], lean: -.4, feet: [[-18, 0], [24, 0]], hands: [[-18, -12], [7, -25]] }), key(1, guard)],
  crouch: [key(0, guard), key(.65, low), key(1, low)],
  jump: [key(0, { ...low, pelvis: [0, -19] }), key(.16, { pelvis: [0, -35], lean: .2, hands: [[-15, -53], [16, -62]], feet: [[-13, -3], [13, -6]] }, 'strike'), key(.48, { pelvis: [0, -31], lean: .13, feet: [[-16, -14], [15, -19]], hands: [[-19, -48], [17, -52]] }), key(.8, { pelvis: [0, -29], lean: .06, feet: [[-12, -6], [12, -3]], hands: [[-20, -40], [20, -43]] }), key(1, { ...low, pelvis: [0, -24], feet: [[-12, 0], [12, 0]] })],
  fall: [key(0, { pelvis: [0, -30], lean: -.12, feet: [[-15, -8], [14, -4]], hands: [[-25, -46], [24, -49]] }), key(1, { ...low, pelvis: [0, -24] })],
  land: [key(0, { ...low, pelvis: [0, -24] }), key(.22, { ...low, pelvis: [0, -17], lean: .48 }, 'strike'), key(.6, { ...guard, pelvis: [0, -30], lean: .18 }, 'settle'), key(1, guard)],
  aerialKick: [key(0, { pelvis: [0, -29], lean: -.25, feet: [[-14, -12], [12, -22]], hands: [[-20, -42], [12, -50]] }), key(.45, { pelvis: [0, -29], lean: -.4, feet: [[-18, -15], [33, -27]], hands: [[-22, -42], [8, -52]] }, 'strike'), key(.76, { pelvis: [0, -28], lean: -.2, feet: [[-12, -12], [29, -22]] }), key(1, { ...low, pelvis: [0, -24] })],
  roll: [key(0, low), key(.22, { pelvis: [0, -16], lean: 1, feet: [[-12, -8], [10, -10]], hands: [[18, -14], [24, -9]], rotation: .2 }), key(.65, { pelvis: [0, -16], lean: .2, feet: [[-12, -8], [10, -10]], hands: [[-13, -27], [14, -24]], rotation: Math.PI * 1.65 }, 'linear'), key(1, { ...guard, rotation: Math.PI * 2 }, 'settle')],
  backflip: [key(0, low), key(.2, { pelvis: [0, -28], lean: -.25, hands: [[-17, -63], [14, -61]], feet: [[-10, -4], [11, -3]], rotation: -.2 }), key(.7, { pelvis: [0, -22], lean: 0, hands: [[-12, -41], [12, -40]], feet: [[-13, -12], [13, -13]], rotation: -Math.PI * 1.65 }, 'linear'), key(1, { ...low, rotation: -Math.PI * 2 }, 'settle')],
  frontflip: [key(0, low), key(.25, { pelvis: [0, -27], lean: .4, hands: [[-10, -49], [14, -53]], feet: [[-12, -8], [12, -13]], rotation: .35 }), key(.7, { pelvis: [0, -21], lean: .2, hands: [[-13, -38], [12, -39]], feet: [[-12, -12], [12, -13]], rotation: Math.PI * 1.6 }, 'linear'), key(1, { ...low, rotation: Math.PI * 2 }, 'settle')],
  stagger: [key(0, guard), key(.12, { pelvis: [-5, -29], lean: -.38, hands: [[-13, -49], [15, -44]], headTilt: -.35 }, 'strike'), key(.32, { pelvis: [-7, -27], lean: -.5, hands: [[-25, -47], [12, -55]], headTilt: -.48 }), key(.7, { ...low, headTilt: -.12 }), key(1, guard)],
  recover: [key(0, { ...low, pelvis: [0, -11], hands: [[-13, 0], [20, -5]] }), key(.45, { ...low, hands: [[-12, 0], [17, -31]] }), key(1, guard)],
  sword: [key(0, guard), key(.22, { ...guard, pelvis: [-4, -31], lean: -.22, hands: [[-5, -51], [1, -62]], bladeAngle: -2.15 }), key(.49, { ...guard, pelvis: [4, -30], lean: .35, hands: [[6, -47], [25, -46]], bladeAngle: -.6 }, 'strike'), key(.7, { ...guard, lean: .44, hands: [[5, -40], [29, -35]], bladeAngle: .7 }), key(1, guard, 'settle')],
  draw: [key(0, { ...guard, hands: [[-12, -36], [-7, -29]], bladeAngle: 1.1 }), key(.55, { ...guard, hands: [[-4, -44], [15, -51]], bladeAngle: -.85 }), key(1, guard)],
  throw: [key(0, guard), key(.3, { ...guard, lean: -.3, hands: [[-10, -39], [-6, -60]] }), key(.52, { ...guard, lean: .4, hands: [[-13, -37], [34, -50]] }, 'strike'), key(.75, { ...guard, lean: .44, hands: [[-12, -33], [30, -36]] }), key(1, guard)],
  aim: [key(0, guard), key(.3, { ...guard, lean: -.08, hands: [[12, -53], [30, -49]] }), key(.72, { ...guard, lean: -.16, hands: [[0, -53], [30, -49]] }), key(1, { ...guard, lean: -.12, hands: [[-3, -53], [30, -49]] })],
  release: [key(0, { ...guard, lean: -.12, hands: [[-12, -58], [30, -49]] }), key(.2, { ...guard, lean: -.2, hands: [[-20, -57], [29, -48]] }, 'strike'), key(1, guard)],
  hang: [key(0, { pelvis: [0, -28], lean: -.14, hands: [[8, -65], [12, -63]], feet: [[-8, -3], [10, -12]] }), key(1, { pelvis: [2, -28], lean: .13, hands: [[8, -65], [12, -63]], feet: [[-8, -9], [13, -6]] })],
  pullup: [key(0, { pelvis: [0, -28], lean: -.14, hands: [[8, -65], [12, -63]], feet: [[-8, -3], [10, -12]] }), key(.35, { pelvis: [0, -25], lean: .35, hands: [[4, -35], [12, -35]], feet: [[-12, -8], [14, -17]] }), key(.65, { pelvis: [0, -14], lean: .8, hands: [[-6, -4], [12, 0]], feet: [[-12, 0], [16, -16]] }), key(1, guard)],
  swing: [key(0, { pelvis: [0, -30], lean: -.25, hands: [[-5, -60], [0, -62]], feet: [[-17, -3], [10, -12]] }), key(.5, { pelvis: [-4, -31], lean: .05, hands: [[-5, -60], [0, -62]], feet: [[-20, -12], [8, -20]] }), key(1, { pelvis: [-3, -30], lean: .3, hands: [[-5, -60], [0, -62]], feet: [[-13, -18], [20, -22]] })],
  plant: [key(0, guard), key(.4, { ...low, pelvis: [0, -16], hands: [[-10, -22], [19, -3]] }), key(.75, { ...low, pelvis: [0, -16], hands: [[-10, -22], [19, -3]] }), key(1, guard)],
  victory: [key(0, guard), key(.5, { pelvis: [1, -31], lean: -.08, hands: [[-18, -24], [29, -64]], feet: [[-13, 0], [12, 0]] }), key(1, { pelvis: [0, -31], lean: -.04, hands: [[-17, -23], [27, -62]], feet: [[-13, 0], [12, 0]] })],
  defeated: [key(0, { pelvis: [0, -10], lean: -1.4, neckTilt:-.7,headTilt:-.6,hands:[[10,-10],[15,-13]],feet:[[20,0],[30,0]] }), key(1, { pelvis:[0,-8],lean:-Math.PI/2,neckTilt:-Math.PI/4,headTilt:-Math.PI/4,hands:[[10,-7],[16,-8]],feet:[[22,0],[32,0]] })],
}

export function authoredPose(action, phase) {
  const keys = ACTION_POSES[action] || ACTION_POSES.guard, p = clamp01(phase)
  let index = keys.findIndex(k => k.at >= p)
  if (index <= 0) return keys[index < 0 ? keys.length - 1 : 0].value
  const a = keys[index - 1], b = keys[index]
  const u=(p-a.at)/(b.at-a.at),result=interpolatePose(a.value,b.value,curves[b.curve](u))
  // C1 hand arcs: keep moving through in-between keys rather than stopping at
  // every keyframe. Monotone Hermite tangents prevent arm-angle overshoots.
  const unwrap=(v,around)=>around+Math.atan2(Math.sin(v-around),Math.cos(v-around))
  const tangent=(left,right)=>left*right<=0?0:2*left*right/(left+right)
  const h=b.at-a.at
  result.armAngles=a.value.armAngles.map((arm,i)=>arm.map((v,j)=>{
    const end=unwrap(b.value.armAngles[i][j],v),slope=(end-v)/h
    const prev=keys[index-2],after=keys[index+1]
    const m0=prev?tangent((v-unwrap(prev.value.armAngles[i][j],v))/(a.at-prev.at),slope):0
    const m1=after?tangent(slope,(unwrap(after.value.armAngles[i][j],end)-end)/(after.at-b.at)):0
    return (2*u*u*u-3*u*u+1)*v+(u*u*u-2*u*u+u)*h*m0+(-2*u*u*u+3*u*u)*end+(u*u*u-u*u)*h*m1
  }))
  return result
}

export function idlePose(time, sitting = false) {
  const breath = Math.sin(time * 2.25), weight = Math.sin(time * .85)
  if (sitting) return pose({ pelvis: [weight * .6, -4], lean: -.12 + breath * .022, neckTilt: Math.sin(time * 1.1) * .09, headTilt: Math.sin(time * .7) * .1,
    hands: [[-12, -1], [12, -2]], feet: [[13 + Math.sin(time * 2) * 2, 23], [20 + Math.sin(time * 1.8 + 1) * 2, 15]], legBend: [-1, -1] })
  return pose({ ...guard, pelvis: [weight * 1.7, -32 + breath * .55], lean: .1 + weight * .035, neckTilt: Math.sin(time * 1.25) * .045, headTilt: Math.sin(time * .7) * .05,
    hands: [[-17 + Math.sin(time * 1.7) * .9, -28 + breath * .6], [25 + Math.sin(time * 1.4) * .8, -37 + breath * .8]] })
}

// Distance, not wall-clock frequency, drives each step. During stance the world
// coordinate rootX + footX * scale * face is mathematically constant.
export function locomotionPose({ x, originX, scale = 1, face = 1, pose: action }) {
  const running = action === 'run', stride = running ? 58 : 34, stance = running ? .42 : .64
  const distance = (x - originX) / scale * face
  const cycle = distance / stride, phase = cycle - Math.floor(cycle)
  const feet = [.5, 0].map(offset => {
    const local = cycle + offset, step = Math.floor(local), q = local - step
    if (q < stance) return [stride * (step + stance * .5 - offset) - distance, 0]
    const swing = (q - stance) / (1 - stance)
    return [lerp(-stride * stance * .5, stride * stance * .5, smooth(swing)), -Math.sin(swing * Math.PI) * (running ? 20 : 10)]
  })
  const bob = running ? Math.sin(phase * Math.PI * 4) * 2.2 : Math.cos(phase * Math.PI * 4) * 1.2
  const arm = Math.sin(phase * Math.PI * 2)
  return pose({ pelvis: [0, (running ? -30 : -32) + bob], lean: running ? .35 : .12, neckTilt: running ? -.14 : -.06,
    feet, hands: running ? [[-arm * 17 - 2, -29 + arm * 5], [arm * 17 + 7, -30 - arm * 5]] : [[-arm * 12 - 3, -34], [arm * 12 + 5, -35]],
    armAngles: [0,1].map(i=>{const upper=Math.PI/2+(i?1:-1)*arm*(running?.85:.5)-(running?.18:0);return [upper,upper-(running?1.4:.3)]}) })
}
