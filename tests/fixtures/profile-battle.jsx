// Development-only fixture: Vite's production build has index.html as its sole entry.
import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from '../../src/i18n/LanguageContext.jsx'
import ProfileBattle from '../../src/components/ProfileBattle.jsx'
import SteamPlaytime from '../../src/components/SteamPlaytime.jsx'
import { FINISHERS, createFight } from '../../src/motion/profileBattle.js'
import { professionalProfile as profile } from '../../src/data/professionalProfile.js'
import '../../src/styles/global.css'
import '../../src/styles/scroll.css'
import '../../src/styles/production-lab.css'

function Fixture() {
  const [finisher, setFinisher] = useState('archery'), [winner, setWinner] = useState(0), [time, setTime] = useState(0)
  const [rate, setRate] = useState(.25), [paused, setPaused] = useState(true)
  const [debug,setDebug]=useState(false)
  const createPlan = useMemo(() => () => createFight({ seed: 702, winner, finisher }), [winner, finisher])
  return <main style={{ padding: '24px', maxWidth: 1250, margin: 'auto', colorScheme:'dark' }}>
    <h1>Profile Battle / local QA</h1>
    <label>Finisher <select value={finisher} onChange={e => setFinisher(e.target.value)}>{FINISHERS.map(name => <option key={name}>{name}</option>)}</select></label>{' '}
    <label>Winner <select value={winner} onChange={e => setWinner(Number(e.target.value))}><option value="0">Cyan</option><option value="1">Ember</option></select></label>{' '}
    <label>Seek <input type="number" min="0" max="25" step=".1" value={time} onChange={e => setTime(Number(e.target.value))}/></label>
    <label>Speed <select value={rate} onChange={e=>setRate(Number(e.target.value))}><option value="0.25">0.25x</option><option value="0.5">0.5x</option><option value="1">1x</option></select></label>{' '}
    <label>Debug <input type="checkbox" checked={debug} onChange={e=>setDebug(e.target.checked)}/></label>{' '}
    <label>Paused <input type="checkbox" checked={paused} onChange={e=>setPaused(e.target.checked)}/></label>{' '}
    <button onClick={()=>setTime(t=>Math.max(0,t-1/60))}>Previous frame</button>{' '}<button onClick={()=>setTime(t=>Math.min(25,t+1/60))}>Next frame</button>
    <ProfileBattle createPlan={createPlan} initialTime={time} playbackRate={rate} paused={paused} debug={debug} autoStart>
      <article className="profile-panel"><span>CURRENT STUDIO</span><a href={profile.currentCompany.url}>GeniusPark VFX ↗</a><p>{profile.currentCompany.period}</p></article>
      {profile.professionalLinks.map(link => <article className="profile-panel" key={link.id}><span>{link.label}</span><a href={link.url}>{link.name} ↗</a></article>)}
      <article className="profile-panel"><span>Instagram</span><a href={profile.instagram.url}>{profile.instagram.handle}</a></article>
      <SteamPlaytime/>
    </ProfileBattle>
  </main>
}
const root = import.meta.hot?.data.root || createRoot(document.getElementById('root'))
if (import.meta.hot) import.meta.hot.data.root = root
root.render(<LanguageProvider><Fixture/></LanguageProvider>)
