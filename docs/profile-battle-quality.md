# Profile / Status: humanoid rig, momentum and asymmetric choreography

Local only. No commit, push or deployment. Steam/API data, profile links, CD
catalog, videos, translations and mobile scroll guards are unchanged.

## Humanoid / momentum revision

- Corrected the authored right-arm elbow pole to match the actual IK pole. The
  previous mismatch could send the intermediate wrist arc around the wrong side
  of the shoulder, forcing the head-avoidance solver to correct it abruptly.
- Free arms have a 14-unit minimum reach instead of 8: no tightly collapsed elbow
  folds. Exact ledge/rope grips retain the shorter constrained reach when needed.
- Arm angles use monotone C1 Hermite arcs through authored keys, rather than
  stopping at every intermediate key. Fixed 17/17 lengths and head clearance remain.
- Added `kinetics.js`: bounded-acceleration mass-spring-damper tracking, stored
  angular/radial velocity, moving-grip velocity feed-forward, minimum-jerk ground
  acceleration, constant-gravity ballistic flight and mass-sensitive damped recoil.
- Head-avoidance boundaries are refined continuously instead of visible 2-degree
  projection steps. Contact constraints do not stretch the bones.
- Airborne torso lean follows travel velocity; landing compression responds to
  incoming downward speed. Hit transitions now spread trunk/head/arm follow-through
  over 55/72/95ms instead of the former 18/25/45ms snap-like response. Contact still
  registers immediately, before the final rendered pose.
- Victory is asymmetric and relaxed, with one diagonal raised arm; defeated poses
  lie along the platform instead of propping up in the former angular crab shape.
- Reference reviewed in browser: https://www.youtube.com/watch?v=IrVZW3gTxMs
  (Weapon Master by YeonAnims, Hyun's Dojo Community). The target is readable
  martial-arts silhouettes, follow-through and momentum, not copied animation data.
- This is a physics-informed authored animation system, not an unconstrained
  ragdoll simulation or a claim of matching a hand-animated film's full quality.

## Play and asymmetric timing revision

- Main site starts READY, with the entire decorative SVG hidden and no battle
  ticker/sampling before Play. Play/Pause/Resume sits immediately beside Replay.
  Replay is disabled until first start. Finished Play starts a fresh randomized
  round. Actors fade in on separate 0.26s / +0.16s beats, without a new frame loop.
- Both actors have independent breathing clocks. Runs, anticipation, takeoff,
  flight height, landing and approach now use separate timings. Sword preparation
  is sequential: one draws while the other watches or adjusts distance.
- Combat exchanges have unequal action-dependent durations; a quick probe can
  lead into another attack before the opponent counters. Defender readiness and
  evasions have their own delayed phase, not the attacker's mirrored progress.
- Watching is an authored defensive stance with subtle independent breathing and
  weight transfer, not a frozen idle spectator. Actual contact still owns reactions.
- `combatSchedule` is cached once per immutable plan and shared with hit windows;
  control labels update only when state/language changes, not every frame.
- TR/EN changes preserve the started/paused state and current time. Offscreen and
  hidden-tab suspension remains; reduced motion retains static opt-in figures.
- Reference inspected in browser: https://www.youtube.com/watch?v=cDoo53YgQhY
  (PIERCE., STRENGTH VS SPEED). The direction is contrasting rhythm, clear roles,
  anticipation and recovery; no claim of reproducing the hand-keyed film's quality
  or using its animation data/assets is made.

## Root causes

1. The previous rig drew 11 paths plus joint circles: separate torso fragments,
   fingers and heel/toe geometry made a small silhouette unnecessarily tangled.
2. Free arms bypassed IK. Constrained arms could choose the opposite elbow pole;
   hand targets close to a shoulder/head produced singular folds and head crossings.
3. `clip.hit` and fixed finisher times authored the reaction independently of
   actual limb contact. A visually blended pose could disagree with that timing.
4. A uniform transition cutoff could end a slower ankle blend prematurely. Ledge
   and grapple approaches also reached the grip too late, creating attachment snaps.

## Implementation

- Exactly five body paths: one continuous torso, two three-point arms and two
  three-point legs. One head circle. Hands/ankles are endpoints, without extra
  visible joint circles, fingers or feet. Cyan/orange retained.
- Both arms always pass through two-bone IK: fixed elbow pole, 14–33.8 unit free reach
  (8 minimum for exact grips),
  fixed 17/17 segment lengths, head-clearance projection and time-based angular
  continuity. Legs retain 19/19 lengths and distance-driven planted stance targets.
- Pelvis/torso, head, arms and ankles have separate transition durations. The
  torso leads; limbs follow. All interpolation precedes the final IK pose.
- `CombatController` owns both actors and their event clock. Fixed 240Hz simulation
  substeps make collision timing independent of 60/120Hz rendering and slow motion.
  This is not a second scheduler: the existing single GSAP ticker advances it.
- Every attack has an ID, attacker/target, startup, active interval and recovery.
  Actual solved distal forearm/shin, blade, arrow or explosion capsules are checked
  against head/torso hurtboxes. Forearm/blade guards produce blocks; evasions only
  succeed when geometry actually misses. A resting overlap is not an attack.
- At most one event per attack ID. The actual rendered rig, including pose blends
  and IK constraints, supplies collision geometry. A confirmed event immediately
  resolves the defender through the same pose controller before one SVG write.
  There is no separate preauthored `hit`-flag reaction or guaranteed timed defeat.
- Separate light, heavy, kick, sword, explosion and block recoil poses, controlled
  knockback and 18/45ms block/damage hitstop. Priority is defeat > reaction > combat
  > traversal > locomotion > idle. Confirmed final hits lead into falling/defeat;
  the five original finishers and independent random winner coin flip remain.
- Grapple/ledge horizontal approaches decelerate before attachment; reaching starts
  earlier, the solved hand owns the rope endpoint, and the swing keeps a fixed radius.
- No per-frame React state, new dependency, page scroll, ScrollTrigger refresh or
  global animation reset. Visibility, offscreen, reduced-motion and cleanup gates
  remain. Production emits no debug overlay or controls.

## Files

- `src/components/ProfileBattle.jsx`: bounded SVG renderer and existing ticker.
- `src/motion/profileBattle.js`: public planning / sampling API.
- `src/motion/battle/rig.js`: constrained IK and clean visible anatomy.
- `src/motion/battle/poses.js`: authored body mechanics, gait and distinct reactions.
- `src/motion/battle/controller.js`: one pose owner and per-channel blending.
- `src/motion/battle/choreography.js`: intent, traversal and the existing finishers.
- `src/motion/battle/combat.js`: actual geometry contacts, deduplication and priority.
- `src/motion/battle/debug.js`: development-only reusable joint/length/target,
  hitbox/hurtbox, attack-phase, state and contact visualization.
- `tests/profile-battle.test.mjs`: deterministic rig/contact regression tests.
- `tests/fixtures/profile-battle.{html,jsx}`: dev-only review controls.

The previously added Profile wrapper in `src/App.jsx`, stationary Profile-only
platform change in `src/motion/useScrollWorld.js` and `profile-battle.css` remain.
This revision did not change other sections or the Steam component.

## Local review and validation

- Production-build preview: http://localhost:4186/portfolio/#profile
- Slow motion / debug: http://localhost:4185/portfolio/tests/fixtures/profile-battle.html
- Fixture: five finishers, both winners, 1x / 0.5x / 0.25x, pause, seek and frame step.
- Build: PASS. Existing >500kB main-chunk advisory remains, not a build failure.
- Full suite: 144/144 PASS, including 36 battle tests.
- All ten finisher/winner outcomes: finite roots and correct results. At 240Hz,
  6,001 rendered skeletal samples per scenario verify continuity and head clearance.
- Wrists have a tighter <6 rig-screen-pixel step limit at 240Hz across all ten
  desktop scenarios. Additional tests verify C1 arm-key velocity, bounded spring
  acceleration/velocity continuity, ballistic momentum/gravity, zero-velocity
  ground endpoints and recoil mass response / smooth recovery.
- Fixed bone lengths, fixed poles, planted walk/run ankles, actual contact overlap,
  attack deduplication, immediate reaction priority and nonattack/defeat behavior.
- Identical contact ledgers/results at 1x, 0.5x and 0.25x render schedules.
- Browser desktop and 390x844: all ten outcomes, ten body paths total, no invalid
  SVG coordinates or horizontal overflow. Debug shows CONFIRMED with hitHeavy/P4
  while the opponent remains in cross/P3 at the same contact timeline.
- Fresh production preview: no captured JavaScript console errors; five original
  profile links and Steam reading remain. No production debug nodes.

This is authored, mocap-inspired animation, not motion-capture data. Browser
viewport emulation does not certify physical iPhone/Safari behavior. Hardware FPS,
GPU profiling and subjective animation-studio quality are not claimed; review the
local moving result for art-direction acceptance.
