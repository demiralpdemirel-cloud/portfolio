import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { createFight, sampleFight, mix, shouldAnimateBattle, toWorld, appearanceAlpha } from '../motion/profileBattle.js'
import { createBattleDebug } from '../motion/battle/debug.js'
import '../styles/profile-battle.css'

function Fighter({ color }) {
  return <g data-fighter style={{ color }} stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <g data-rig>
      <path data-trail strokeOpacity=".18" strokeWidth="7"/>
      <circle data-head r="7" fill="#0b1117" />
      {Array.from({ length: 5 }, (_, i) => <path data-limb key={i} strokeWidth={i === 0 ? 3.4 : 2.8} />)}
      <path data-weapon-trail strokeOpacity=".22" strokeWidth="5"/>
      <g data-sword><path d="M-4 0 H32 M0 -5 V5"/><path d="M5 -1 H31" stroke="white" strokeOpacity=".6" strokeWidth="1"/></g>
      <g data-bow><path d="M0 -17 Q13 0 0 17"/></g><path data-bow-string strokeWidth="1"/>
    </g>
  </g>
}

export default function ProfileBattle({ children, createPlan = createFight, initialTime = 0, playbackRate = 1, paused = false, debug = false, autoStart = false }) {
  const root = useRef(null), replay = useRef(null), play = useRef(null), refreshControls=useRef(null), languageRef=useRef(null)
  const { language } = useLanguage()
  languageRef.current=language
  useEffect(() => {
    const arena = root.current, svg = arena.querySelector('svg'), label = arena.querySelector('[data-battle-label]')
    const actors = [...svg.querySelectorAll('[data-fighter]')].map(node => ({ node, rig: node.querySelector('[data-rig]'), head: node.querySelector('[data-head]'), limbs: [...node.querySelectorAll('[data-limb]')], sword: node.querySelector('[data-sword]'), bow: node.querySelector('[data-bow]'), string: node.querySelector('[data-bow-string]'), trail: node.querySelector('[data-trail]'), weaponTrail: node.querySelector('[data-weapon-trail]'), history: [], weaponHistory: [] }))
    const arrow = svg.querySelector('[data-projectile]'), rope = svg.querySelector('[data-rope]'), charge = svg.querySelector('[data-charge]'), burst = svg.querySelector('[data-burst]'), particles = [...svg.querySelectorAll('[data-spark]')], ring = svg.querySelector('[data-ring]'), droppedSword = svg.querySelector('[data-dropped-sword]'), smoke = svg.querySelector('[data-smoke]')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const debugPaint=import.meta.env.DEV&&debug?createBattleDebug(svg.querySelector('[data-battle-debug]')):null
    let platforms = [], plan = createPlan(), elapsed = initialTime, visible = false, running = false, lastStage = '', disposed = false, scale = .92, holdRemaining=0, lastContact=null, started=autoStart, userPaused=false, lastControls=''
    const updateControls=()=>{
      const language=languageRef.current
      const finished=elapsed>=plan.duration
      const signature=`${language}/${started}/${finished}/${userPaused}/${paused}`
      if(signature===lastControls)return
      lastControls=signature
      arena.dataset.started=String(started)
      arena.dataset.playback=!started?'ready':finished?'finished':userPaused||paused?'paused':'playing'
      play.current.textContent=!started||finished?(language==='tr'?'OYNA':'PLAY')+' ▶':userPaused||paused?(language==='tr'?'DEVAM ET':'RESUME')+' ▶':(language==='tr'?'DURAKLAT':'PAUSE')+' Ⅱ'
      replay.current.disabled=!started
    }
    const paint = () => {
      updateControls()
      svg.toggleAttribute('hidden',!started)
      if(!started){arena.dataset.time=elapsed.toFixed(2);arena.dataset.running='false';arena.dataset.phase='READY';label.textContent=languageRef.current==='tr'?'BAŞLATMAK İÇİN OYNA':'PRESS PLAY TO BEGIN';return}
      if (!platforms.length) return
      const frame = sampleFight(plan, platforms, reduced.matches ? 0 : elapsed)
      if (frame.stage !== lastStage) { lastStage = frame.stage; label.textContent = reduced.matches ? 'CYAN / EMBER' : frame.stage === 'VICTORY' ? `${plan.winner ? 'EMBER' : 'CYAN'} / VICTORY` : `${frame.stage} / ${plan.finisher.toUpperCase()}`; arena.dataset.phase = frame.stage }
      arena.dataset.running = String(running); arena.dataset.time = elapsed.toFixed(2)
      const renderedHands=[],renderedRigs=[]
      frame.fighters.forEach((fighter, id) => {
        const a = actors[id], bones = frame.rigs[id]
        renderedRigs[id]=bones
        a.node.setAttribute('transform', `translate(${fighter.x} ${fighter.y}) scale(${fighter.scale})`)
        a.node.dataset.action = fighter.pose
        a.node.setAttribute('opacity',appearanceAlpha(id,elapsed,reduced.matches))
        renderedHands[id]=toWorld(fighter,bones.hands[1])
        a.rig.setAttribute('transform', `scale(${fighter.face} 1)`)
        a.head.setAttribute('cx', bones.head[0]); a.head.setAttribute('cy', bones.head[1])
        bones.paths.forEach((points, i) => a.limbs[i].setAttribute('d', points.map((p, j) => `${j ? 'L' : 'M'}${p.join(' ')}`).join(' ')))
        a.sword.style.display = fighter.weapon === 'sword' ? '' : 'none'; a.bow.style.display = fighter.weapon === 'bow' ? '' : 'none'
        a.string.style.display = fighter.weapon === 'bow' ? '' : 'none'
        if (bones.weapon) {
          const { origin, angle, kind, tip } = bones.weapon
          const transform = `translate(${origin[0]} ${origin[1]}) rotate(${angle * 180 / Math.PI})`
          ;(kind === 'bow' ? a.bow : a.sword).setAttribute('transform', transform)
          if (kind === 'bow') {
            const end = sign => [origin[0] + Math.cos(angle + Math.PI / 2) * 17 * sign, origin[1] + Math.sin(angle + Math.PI / 2) * 17 * sign]
            a.string.setAttribute('d', `M${end(-1).join(' ')} L${bones.hands[0].join(' ')} L${end(1).join(' ')}`)
          }
          a.weaponHistory.push(toWorld(fighter, tip)); if (a.weaponHistory.length > 5) a.weaponHistory.shift()
        } else a.weaponHistory.length = 0
        a.history.push({ x: fighter.x, y: fighter.y - 26 * fighter.scale }); if (a.history.length > 4) a.history.shift()
        const path = history => history.map((p, i) => `${i ? 'L' : 'M'}${(p.x - fighter.x) / (fighter.face * fighter.scale)} ${(p.y - fighter.y) / fighter.scale}`).join(' ')
        a.trail.style.display = ['jump', 'aerialKick', 'run', 'backflip', 'frontflip'].includes(fighter.pose) && !reduced.matches ? '' : 'none'
        a.trail.setAttribute('d', path(a.history)); a.weaponTrail.setAttribute('d', path(a.weaponHistory))
      })
      if(debugPaint)debugPaint(frame,renderedRigs,elapsed)
      if(frame.contact&&frame.contact.id!==lastContact){lastContact=frame.contact.id;holdRemaining=frame.contact.blocked?18:45}
      arrow.style.display = frame.projectile ? '' : 'none'
      if (frame.projectile) { const p = frame.projectile; arrow.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.angle || 0})`); arrow.querySelector('path').style.display = p.kind === 'arrow' ? '' : 'none' }
      rope.style.display = frame.rope ? '' : 'none'
      if (frame.rope) { const { a, progress } = frame.rope, b=renderedHands[frame.rope.owner]||frame.rope.b; rope.setAttribute('d', `M${b.x} ${b.y} L${mix(b.x, a.x, progress)} ${mix(b.y, a.y, progress)}`) }
      charge.style.display = frame.charge ? '' : 'none'
      if (frame.charge) { charge.setAttribute('transform', `translate(${frame.charge.x} ${frame.charge.y - 4})`); charge.setAttribute('fill', frame.charge.warning ? '#ff704b' : '#9ceaff') }
      burst.style.display = frame.impact ? '' : 'none'
      droppedSword.style.display = frame.droppedSword ? '' : 'none'
      if (frame.droppedSword) droppedSword.setAttribute('transform', `translate(${frame.droppedSword.x} ${frame.droppedSword.y}) rotate(${frame.droppedSword.angle})`)
      svg.style.transform = frame.impact ? `translate(${Math.sin(frame.impact.age * 90) * (1 - frame.impact.age / .65) * 1.7}px,0)` : ''
      if (frame.impact) {
        const hit = frame.impact, q = Math.min(1, hit.age / .65)
        burst.setAttribute('transform', `translate(${hit.x} ${hit.y})`); burst.setAttribute('opacity', 1 - q)
        ring.setAttribute('r', 5 + q * 65 * hit.power)
        smoke.style.display = frame.impact.kind === 'explosion' ? '' : 'none'; smoke.setAttribute('transform', `scale(${.4 + q * 1.5})`)
        particles.forEach((node, i) => { node.style.display = scale < 1 && i > 8 ? 'none' : ''; const theta = i * 2.39996, distance = (8 + q * 55) * hit.power; node.setAttribute('x1', Math.cos(theta) * distance); node.setAttribute('y1', Math.sin(theta) * distance + q * q * 16); node.setAttribute('x2', Math.cos(theta) * (distance + 5)); node.setAttribute('y2', Math.sin(theta) * (distance + 5) + q * q * 16) })
      }
    }
    const tick = (_, delta) => {
      if(holdRemaining>0){holdRemaining-=delta;return}
      elapsed = Math.min(plan.duration, elapsed + Math.min(delta, 40) / 1000 * playbackRate); paint(); if (elapsed >= plan.duration) stop()
    }
    const stop = () => { gsap.ticker.remove(tick); running = false; arena.dataset.running = 'false' }
    const sync = () => { if (!disposed && started && !userPaused && !paused && shouldAnimateBattle({ visible, hidden: document.hidden, reduced: reduced.matches, time: elapsed, duration: plan.duration })) { if (!running) { gsap.ticker.add(tick); running = true } } else stop(); paint() }
    refreshControls.current=paint
    const measure = () => {
      const bounds = arena.getBoundingClientRect()
      scale = bounds.width < 600 ? .76 : 1.04
      platforms = [...arena.querySelectorAll('.profile-panel')].map(card => { const r = card.getBoundingClientRect(); return { x: r.left - bounds.left, y: r.top - bounds.top, width: r.width, height: r.height } })
      svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`); paint()
    }
    const observer = new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= .08; sync() }, { threshold: .08 })
    const resize = new ResizeObserver(measure)
    observer.observe(arena); resize.observe(arena); arena.querySelectorAll('.profile-panel').forEach(card => resize.observe(card))
    const restart = () => { started=true;userPaused=false;plan = createPlan(); elapsed = initialTime; lastStage = '';holdRemaining=0;lastContact=null; actors.forEach(a => { a.history.length = 0; a.weaponHistory.length = 0 }); sync() }
    const togglePlay=()=>{if(!started||elapsed>=plan.duration){restart();return}userPaused=!userPaused;sync()}
    replay.current.addEventListener('click', restart)
    play.current.addEventListener('click',togglePlay)
    document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync)
    measure()
    const button = replay.current,playButton=play.current
    return () => { disposed = true; stop();refreshControls.current=null; observer.disconnect(); resize.disconnect(); button.removeEventListener('click', restart);playButton.removeEventListener('click',togglePlay); document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync) }
  }, [createPlan, initialTime, playbackRate, paused, debug, autoStart])
  useEffect(()=>{refreshControls.current?.()},[language])
  return <div className="profile-arena" ref={root}>
    <div className="profile-battle-caption"><span>CHARACTER STUDY / 01</span><span data-battle-label>CYAN / EMBER</span><div className="profile-battle-controls"><button ref={play} type="button" aria-controls="profile-battle-scene">{language === 'tr' ? 'OYNA ▶' : 'PLAY ▶'}</button><button ref={replay} type="button" disabled={!autoStart}>{language === 'tr' ? 'TEKRAR OYNAT' : 'REPLAY'} ↺</button></div></div>
    <div className="profile-track">{children}</div>
    <svg id="profile-battle-scene" className="profile-battle-overlay" hidden={!autoStart} aria-hidden="true" preserveAspectRatio="none">
      <path data-rope stroke="#b6dfed" strokeWidth="1.3" fill="none"/>
      <Fighter color="#81edff"/><Fighter color="#ff795c"/>
      <g data-projectile fill="#e7f8ff" stroke="#e7f8ff"><circle r="2"/><path d="M-17 0 H12 L6 -4 M12 0 L6 4" fill="none"/></g>
      <rect data-charge width="12" height="6" rx="2"/>
      <path data-dropped-sword d="M-10 0 H20 M-5 -4 V4" stroke="#d1edf6" strokeWidth="2"/>
      <g data-burst stroke="#b5f1ff" fill="none"><g data-smoke fill="#7c8a95" stroke="none" opacity=".22"><circle r="18"/><circle cx="-17" cy="-12" r="15"/><circle cx="18" cy="-10" r="14"/></g><circle data-ring strokeWidth="1"/>{Array.from({ length: 18 }, (_, i) => <line data-spark key={i} stroke={i % 3 ? '#e0faff' : '#ff9865'} strokeWidth="1.5"/>)}</g>
      {import.meta.env.DEV&&debug&&<g data-battle-debug fill="none"/>}
    </svg>
  </div>
}
