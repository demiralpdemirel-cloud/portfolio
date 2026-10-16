import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createFight, sampleFight, FINISHERS, skeleton, flight, shouldAnimateBattle, solveRig, twoBoneIK, BONES, toWorld, appearanceAlpha } from '../src/motion/profileBattle.js'
import { evaluateChoreography, combatSchedule } from '../src/motion/battle/choreography.js'
import { springStep,ballistic,minimumJerk,recoilDisplacement } from '../src/motion/battle/kinetics.js'
import { locomotionPose, ACTION_POSES, authoredPose } from '../src/motion/battle/poses.js'
import { AnimationController } from '../src/motion/battle/controller.js'
import { CombatController, combatLedger, overlaps, PRIORITY, statePriority, applyContacts } from '../src/motion/battle/combat.js'

const platforms = [
  { x: 0, y: 110, width: 310 }, { x: 340, y: 172, width: 310 },
  { x: 680, y: 128, width: 310 }, { x: 170, y: 420, width: 310 },
  { x: 510, y: 456, width: 480 },
]
for (const finisher of FINISHERS) for (const winner of [0, 1]) {
  test(`battle ${finisher} / winner ${winner}: finite, continuous, deterministic, correct result`, () => {
    const plan = createFight({ seed: 702, finisher, winner })
    assert.deepEqual(plan, createFight({ seed: 702, finisher, winner }))
    let previous = sampleFight(plan, platforms, 0), maximumStep = 0
    for (let step = 1; step <= 2500; step++) {
      const frame = sampleFight(plan, platforms, step / 100)
      frame.fighters.forEach((f, i) => {
        assert.ok(Number.isFinite(f.x) && Number.isFinite(f.y))
        maximumStep = Math.max(maximumStep, Math.hypot(f.x - previous.fighters[i].x, f.y - previous.fighters[i].y))
      })
      previous = frame
    }
    assert.ok(maximumStep < 15, `unexpected teleport: ${maximumStep}px in 10ms`)
    assert.equal(previous.fighters[winner].pose, 'victory')
    assert.equal(previous.fighters[1 - winner].pose, 'defeated')
    assert.equal(previous.stage, 'VICTORY')
    assert.equal(previous.fighters[1 - winner].y, platforms[4].y)
  })
}
test('choreography has repeatable variety, fair winner coin flip and no per-frame randomness', () => {
  const plans = Array.from({ length: 50 }, (_, seed) => createFight({ seed, winner: seed % 2 }))
  assert.equal(new Set(plans.map(p => p.finisher)).size, 5)
  assert.equal(new Set(plans.map(p => p.route)).size, 2)
  const source = readFileSync('src/motion/profileBattle.js', 'utf8')
  assert.match(source, /winner = Math\.random\(\) < \.5 \? 0 : 1/)
  assert.doesNotMatch(source.slice(source.indexOf('export function sampleFight')), /Math\.random/)
})
test('projectile reaches opponent and grapple anchors to an actual higher card', () => {
  const bow = createFight({ seed: 1, winner: 0, finisher: 'archery' })
  const contact = combatLedger(bow,platforms).events.find(e=>e.terminal)
  assert.ok(contact&&overlaps(contact.hitbox,contact.hurtbox))
  const rope = sampleFight(createFight({ seed: 1, winner: 1, finisher: 'grapple' }), platforms, 15.5).rope
  assert.equal(rope.a.y, platforms[2].y - 4)
  assert.equal(rope.progress, 1)
  const a = { x: 10, y: 100 }, b = { x: 50, y: 300 }
  assert.deepEqual(flight(a, b, 0), a); assert.deepEqual(flight(a, b, 1), b)
})
test('articulated poses have independent limbs, finite joints and pose variety', () => {
  const poses = ['idle', 'sit', 'run', 'walk', 'jump', 'land', 'crouch', 'dodge', 'roll', 'punch', 'kick', 'block', 'stagger', 'defeated', 'victory', 'aim']
  for (const pose of poses) {
    const rig = skeleton(pose, .3)
    assert.equal(rig.paths.length, 5); assert.equal(rig.joints.length, 13)
    assert.ok(rig.paths.flat(2).every(Number.isFinite))
  }
  assert.notDeepEqual(skeleton('run', .1).paths, skeleton('run', .3).paths)
  assert.notDeepEqual(skeleton('sit', .1).paths, skeleton('victory', .1).paths)
})
test('two-bone IK preserves lengths and reaches reachable hands / feet exactly', () => {
  for (const target of [[12, 24], [-10, 15], [28, -8], [0, 2]]) {
    const rig = twoBoneIK([0, 0], target, 17, 17, -1)
    assert.ok(Math.abs(Math.hypot(...rig.joint) - 17) < 1e-8)
    assert.ok(Math.abs(Math.hypot(rig.end[0] - rig.joint[0], rig.end[1] - rig.joint[1]) - 17) < 1e-8)
    assert.ok(Math.hypot(rig.end[0] - target[0], rig.end[1] - target[1]) < .001)
  }
  const far = twoBoneIK([0, 0], [200, 0], 17, 17)
  assert.equal(far.reachable, false); assert.ok(far.end[0] <= 34)
})
test('walk and run lock each stance foot in world space, including reversed travel and acceleration', () => {
  for (const action of ['walk', 'run']) for (const face of [-1, 1]) {
    const held = [null, null]; let contacts = 0
    for (let n = 0; n <= 600; n++) {
      const x = 100 + face * (n / 600) ** 2 * 170
      const fighter = { x, y: 400, originX: 100, scale: .8, face, pose: action }
      const control = locomotionPose(fighter), rig = solveRig(fighter)
      for (let i = 0; i < 2; i++) {
        if (control.feet[i][1] === 0) {
          const foot = toWorld(fighter, rig.feet[i])
          assert.ok(Math.abs(foot.y - 400) < .001, 'stance foot is not on the platform')
          if (held[i]) assert.ok(Math.abs(held[i].x - foot.x) < .001, 'stance foot slid across the platform')
          held[i] = foot; contacts++
        } else held[i] = null
      }
    }
    assert.ok(contacts > 100)
  }
  assert.notDeepEqual(locomotionPose({x:10,originX:0,scale:1,face:1,pose:'walk'}), locomotionPose({x:10,originX:0,scale:1,face:1,pose:'run'}))
})
test('every authored pose has constant arm / leg lengths at 0.25x inspection intervals', () => {
  const distance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1])
  for(const action of Object.keys(ACTION_POSES)) for(let n=0;n<=240;n++) {
    const rig = solveRig({pose:action,phase:n/240,clock:n/60,x:0,y:0,scale:1,face:1})
    for (const path of rig.paths.slice(1,3)) { assert.ok(Math.abs(distance(path[0],path[1])-BONES.upperArm)<.001); assert.ok(Math.abs(distance(path[1],path[2])-BONES.forearm)<.001) }
    for (const path of rig.paths.slice(3,5)) { assert.ok(Math.abs(distance(path[0],path[1])-BONES.thigh)<.001); assert.ok(Math.abs(distance(path[1],path[2])-BONES.calf)<.001) }
  }
})
test('weapon handles are attached to hands; parry events use overlapping weapon / guard geometry', () => {
  for(const winner of [0,1]) {
    const plan=createFight({seed:702,finisher:'sword',winner}), frame=sampleFight(plan,platforms,14+.49/1.5)
    for(const actor of frame.fighters) {
      const rig=solveRig(actor), point=toWorld(actor,rig.weapon.tip)
      assert.deepEqual(rig.weapon.origin,rig.hands[1])
      assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y))
    }
    const clashes=combatLedger(plan,platforms).events.filter(e=>e.id.startsWith('sword-')&&e.blocked)
    assert.ok(clashes.length>=4)
    clashes.forEach(e=>assert.ok(overlaps(e.hitbox,e.hurtbox)))
  }
})
test('grappling hand remains attached to a constant-length pendulum rope', () => {
  for(const winner of [0,1]) {
    const plan=createFight({seed:702,finisher:'grapple',winner}); let length=null
    for(let n=0;n<180;n++) {
      const t=14+n/100,frame=sampleFight(plan,platforms,t), actor=frame.fighters[winner], hand=toWorld(actor,frame.rigs[winner].hands[1])
      assert.ok(Math.hypot(hand.x-frame.rope.b.x,hand.y-frame.rope.b.y)<.001)
      const now=Math.hypot(frame.rope.a.x-hand.x,frame.rope.a.y-hand.y)
      if(length!==null)assert.ok(Math.abs(now-length)<.001)
      length=now
    }
  }
})
test('pose controller blends controls before IK rather than stretching solved joints', () => {
  const controller=new AnimationController()
  const first={pose:'idle',phase:0,clock:0,x:0,y:0,scale:1,face:1}
  controller.sample(first,0)
  const before=controller.sample({...first,pose:'jab',phase:.15},.1)
  const after=controller.sample({...first,pose:'jab',phase:.2},.116)
  assert.ok(Math.hypot(before.head[0]-after.head[0],before.head[1]-after.head[1])<4)
  for(const path of after.paths.slice(1,3))assert.ok(Math.abs(Math.hypot(path[0][0]-path[1][0],path[0][1]-path[1][1])-17)<.001)
})
test('all 10 scenarios have continuous joint motion at 60Hz / 0.25x, not just continuous roots', () => {
  for(const finisher of FINISHERS)for(const winner of [0,1]) {
    const plan=createFight({seed:702,finisher,winner})
    let previous=null
    for(let frame=0;frame<=6000;frame++) {
      const time=frame/240, sample=sampleFight(plan,platforms,time)
      sample.rigs.forEach(rig=>rig.arms.forEach(a=>assert.ok(a.headClearance>=8.999,`${finisher}/${winner} arm crosses head at ${time}`)))
      const points=sample.fighters.map((actor,i)=>sample.rigs[i].joints.map(p=>toWorld(actor,p)))
      if(previous)points.forEach((joints,i)=>joints.forEach((p,j)=>assert.ok(Math.hypot(p.x-previous[i][j].x,p.y-previous[i][j].y)<15,`${finisher}/${winner} joint popped at ${time}`)))
      if(previous)points.forEach((joints,i)=>[7,8].forEach(j=>assert.ok(Math.hypot(joints[j].x-previous[i][j].x,joints[j].y-previous[i][j].y)<6,`${finisher}/${winner} wrist snapped at ${time}`)))
      previous=points
    }
  }
})
test('1x / 0.5x / 0.25x render schedules produce the same actual contact ledger and final result',()=>{
  for(const finisher of FINISHERS)for(const winner of [0,1]) {
    const plan=createFight({seed:702,winner,finisher});let expected=null
    for(const rate of [1,.5,.25]) {
      const engine=new CombatController(plan,platforms),count=Math.round(25*60/rate)
      for(let n=0;n<=count;n++)engine.sample(n*rate/60)
      const events=engine.events.map(({id,time,blocked})=>({id,time,blocked}))
      if(expected)assert.deepEqual(events,expected);else expected=events
      assert.equal(engine.frame.fighters[winner].pose,'victory')
    }
  }
})
test('paired attacks trigger reactions only at contact; evasions have no pretend impact', () => {
  const plan=createFight({seed:702,winner:0}), event=combatLedger(plan,platforms).events.find(e=>!e.blocked&&!e.terminal)
  const before=sampleFight(plan,platforms,event.time-.001), after=sampleFight(plan,platforms,event.time)
  assert.ok(!before.fighters[event.defender].pose.startsWith('hit'));assert.ok(after.fighters[event.defender].pose.startsWith('hit'))
  assert.ok(after.impact)
  const dodge=combatSchedule(plan).find(c=>c.clip.defend==='dodge')
  assert.equal(sampleFight(plan,platforms,(dodge.start+dodge.end)/2).impact,null)
})
test('actors have independent breathing clocks, traversal departures and weapon preparation',()=>{
  const plan=createFight({seed:702,winner:0,finisher:'sword'})
  const idle=evaluateChoreography(plan,platforms,1)
  assert.notEqual(idle.fighters[0].clock,idle.fighters[1].clock)
  for(const time of [4.2,4.85,6.5,12.2,12.65,13.8]) {
    const frame=evaluateChoreography(plan,platforms,time)
    assert.notEqual(frame.fighters[0].pose,frame.fighters[1].pose,`mirrored action at ${time}`)
  }
  for(let n=0;n<=25*120;n++) {
    const frame=evaluateChoreography(plan,platforms,n/120)
    const [a,b]=frame.fighters
    if(['jump','crouch','land','run','draw'].includes(a.pose)&&a.pose===b.pose)assert.notEqual(a.phase,b.phase,`synchronized ${a.pose} at ${n/120}`)
  }
})
test('combat has unequal readable beats and collision windows share the exact authored schedule',()=>{
  const plan=createFight({seed:702,winner:0}),beats=combatSchedule(plan)
  assert.equal(beats[0].start,8);assert.equal(beats.at(-1).end,12)
  assert.ok(new Set(beats.map(b=>(b.end-b.start).toFixed(3))).size>=3)
  const attacks=new CombatController(plan,platforms).attacks
  beats.forEach((beat,i)=>{assert.equal(attacks[i].start,beat.start);assert.equal(attacks[i].end,beat.end);if(i)assert.equal(beat.start,beats[i-1].end)})
})
test('Play is opt-in, has a clean hidden initial scene and reveals actors on different beats',()=>{
  const source=readFileSync('src/components/ProfileBattle.jsx','utf8')
  assert.match(source,/autoStart = false/)
  assert.match(source,/hidden=\{!autoStart\}/)
  assert.match(source,/started && !userPaused/)
  assert.match(source,/play\.current\.addEventListener\('click',togglePlay\)/)
  assert.match(source,/playButton\.removeEventListener\('click',togglePlay\)/)
  assert.equal(appearanceAlpha(0,0),0);assert.equal(appearanceAlpha(1,0),0)
  assert.ok(appearanceAlpha(0,.2)>appearanceAlpha(1,.2))
  assert.equal(appearanceAlpha(0,1),1);assert.equal(appearanceAlpha(1,1),1)
  assert.equal(appearanceAlpha(1,0,true),1)
})
test('every actual confirmed hit immediately owns the target, once per attack ID, for all finishers and winners',()=>{
  for(const finisher of FINISHERS)for(const winner of [0,1]) {
    const plan=createFight({seed:702,winner,finisher}),ledger=combatLedger(plan,platforms)
    assert.ok(ledger.events.some(e=>e.terminal&&!e.blocked),`${finisher}/${winner} missed finisher`)
    assert.equal(new Set(ledger.events.map(e=>e.id)).size,ledger.events.length)
    for(const event of ledger.events) {
      assert.ok(event.time>=event.activeStart&&event.time<=event.activeEnd)
      assert.ok(overlaps(event.hitbox,event.hurtbox))
      const actor=sampleFight(plan,platforms,event.time).fighters[event.defender]
      assert.equal(actor.pose,event.blocked?'blockRecoil':{jab:'hitLight',cross:'hitHeavy',kick:'hitKick',spin:'hitKick',sword:'hitSword',arrow:'hitHeavy',aerialKick:'hitKick',explosion:'hitExplosion'}[event.move])
      assert.equal(actor.priority,PRIORITY.REACTION)
    }
  }
})
test('both IK arms have a fixed pole, finite reach and head clearance in every authored pose',()=>{
  for(const action of Object.keys(ACTION_POSES))for(let n=0;n<=240;n++) {
    const rig=solveRig({pose:action,phase:n/240,x:0,y:0,scale:1,face:1})
    rig.arms.forEach((a,i)=>{
      assert.equal(a.bend,1)
      assert.ok(a.headClearance>=8.999,`${action}/${n} arm ${i} crosses head`)
      const p=rig.paths[i+1],reach=Math.hypot(p[2][0]-p[0][0],p[2][1]-p[0][1])
      assert.ok(reach>=13.999&&reach<=33.801)
    })
  }
})
test('arm springs preserve velocity through a changed target and bound acceleration instead of snapping',()=>{
  let state={position:0,velocity:0}
  const dt=1/240
  for(let n=0;n<240;n++) {
    const target=n<120?2:-1,previous=state
    state=springStep(state.position,state.velocity,target,dt)
    assert.ok(Math.abs(state.velocity-previous.velocity)<=900*dt+1e-8)
    assert.ok(Math.abs(state.position-previous.position)<=30*dt+1e-8)
    if(n===120)assert.ok(Math.abs(state.position-previous.position)<.05,'reversal teleported')
  }
  assert.ok(Math.abs(state.position+1)<.005)
})
test('authored hand arcs have continuous angular velocity across intermediate keys',()=>{
  const difference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b)),h=1e-6
  for(const [action,keys] of Object.entries(ACTION_POSES))for(const key of keys.slice(1,-1)) {
    const before=authoredPose(action,key.at-h),at=authoredPose(action,key.at),after=authoredPose(action,key.at+h)
    for(let arm=0;arm<2;arm++)for(let bone=0;bone<2;bone++) {
      const incoming=difference(at.armAngles[arm][bone],before.armAngles[arm][bone])/h
      const outgoing=difference(after.armAngles[arm][bone],at.armAngles[arm][bone])/h
      assert.ok(Math.abs(incoming-outgoing)<.05,`${action} arm ${arm}/${bone} velocity kink at ${key.at}`)
    }
  }
})
test('ballistic trajectories conserve horizontal momentum and use constant gravity',()=>{
  const a={x:20,y:100},b={x:230,y:310},duration=1.7,height=140
  const first=ballistic(a,b,0,duration,height),last=ballistic(a,b,duration,duration,height)
  assert.ok(Math.hypot(first.x-a.x,first.y-a.y)<1e-8)
  assert.ok(Math.hypot(last.x-b.x,last.y-b.y)<1e-8)
  for(let n=1;n<=100;n++) {
    const t=n/100*duration,s=ballistic(a,b,t,duration,height),previous=ballistic(a,b,t-.001,duration,height)
    assert.equal(s.velocity.x,first.velocity.x)
    assert.ok(Math.abs((s.velocity.y-previous.velocity.y)/.001-first.acceleration.y)<1e-6)
  }
  assert.ok(first.velocity.y<0&&last.velocity.y>0)
})
test('ground acceleration eases to rest and mass-sensitive recoil recovers without a velocity snap',()=>{
  const h=.0001
  assert.ok(Math.abs(minimumJerk(h)/h)<.001)
  assert.ok(Math.abs((1-minimumJerk(1-h))/h)<.001)
  assert.equal(recoilDisplacement(0,.4,8),0);assert.equal(recoilDisplacement(.4,.4,8),0)
  assert.ok(recoilDisplacement(.08,.4,8)>recoilDisplacement(.08,.4,8,1.12))
  assert.ok(recoilDisplacement(.4-h,.4,8)/h<.001)
})
test('ordinary overlap outside an attack window never causes damage; defeat wins all state priorities',()=>{
  assert.equal(statePriority('defeated'),5);assert.equal(statePriority('hitHeavy'),4)
  assert.equal(statePriority('jab'),3);assert.equal(statePriority('land'),2)
  assert.equal(statePriority('run'),1);assert.equal(statePriority('idle'),0)
  const plan=createFight({seed:702,winner:0}),frame=sampleFight(plan,platforms,0)
  frame.fighters[0].x=frame.fighters[1].x
  assert.equal(applyContacts(frame,[],0,platforms,plan).contact,null)
  const victim={...frame.fighters[1],pose:'defeated'}
  const next=applyContacts({...frame,fighters:[frame.fighters[0],victim]},[{id:'test',attacker:0,defender:1,move:'jab',time:0,point:[0,0]}],.01,platforms,plan)
  assert.equal(next.fighters[1].pose,'defeated')
})
test('ledge grip reaches actual card edge, and jumps descend before landing on mobile', () => {
  for(const winner of [0,1]) {
    const plan=createFight({seed:702,finisher:'parkour',winner})
    for(let t=13.15;t<13.79;t+=.01) {
      const actor=sampleFight(plan,platforms,t).fighters[winner]
      if(actor.grip){const hand=toWorld(actor,solveRig(actor).hands[1]);assert.ok(Math.hypot(hand.x-actor.grip.x,hand.y-actor.grip.y)<.001)}
    }
  }
  const mobile=[{x:0,y:100,width:156},{x:172,y:155,width:156},{x:0,y:420,width:156},{x:172,y:460,width:156},{x:0,y:760,width:328}]
  const plan=createFight({seed:702,finisher:'archery',winner:0})
  assert.ok(sampleFight(plan,mobile,13.64).fighters[0].y<sampleFight(plan,mobile,13.65).fighters[0].y)
})
test('local scheduler cleans up and never scrolls, reinitializes page or modifies Steam', () => {
  const source = readFileSync('src/components/ProfileBattle.jsx', 'utf8')
  assert.match(source, /IntersectionObserver/); assert.match(source, /ResizeObserver/)
  assert.match(source, /visibilitychange/); assert.match(source, /prefers-reduced-motion/)
  assert.match(source, /gsap\.ticker\.remove\(tick\)/)
  assert.doesNotMatch(source, /scrollTo|ScrollTrigger|setInterval|setState|requestAnimationFrame/)
  assert.match(readFileSync('src/styles/profile-battle.css', 'utf8'), /pointer-events:none/)
  const app = readFileSync('src/App.jsx', 'utf8')
  assert.match(app, /<ProfileBattle>[\s\S]*<SteamPlaytime \/>[\s\S]*<\/ProfileBattle>/)
})
test('offscreen, hidden, reduced-motion and finished scenes cannot schedule work', () => {
  const state = { visible: true, hidden: false, reduced: false, time: 4, duration: 25 }
  assert.equal(shouldAnimateBattle(state), true)
  for (const change of [{ visible: false }, { hidden: true }, { reduced: true }, { time: 25 }]) assert.equal(shouldAnimateBattle({ ...state, ...change }), false)
})
test('mobile choreography stays within the real platform width for every finisher and both routes', () => {
  const mobile = [{x:0,y:100,width:156},{x:172,y:155,width:156},{x:0,y:420,width:156},{x:172,y:460,width:156},{x:0,y:760,width:328}]
  for (const finisher of FINISHERS) for (const winner of [0,1]) for (const route of [3,4]) {
    const plan = { ...createFight({seed:43,finisher,winner}), route }
    for(let t=0;t<=25;t+=.05) for(const fighter of sampleFight(plan,mobile,t).fighters) assert.ok(fighter.x>=24 && fighter.x<=304, `${finisher} ${winner} x=${fighter.x}`)
    const end=sampleFight(plan,mobile,25)
    assert.equal(end.fighters[winner].pose,'victory',`${finisher}/${winner}/${route} mobile finisher missed`)
    assert.equal(end.fighters[1-winner].pose,'defeated')
  }
})
