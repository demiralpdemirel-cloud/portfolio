import { useRef, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { clamp, playbackRates, timeLabel } from '../../utils/playerMath'

export function PlayerIcon({ name }) {
  const paths = {
    play: 'M8 5 19 12 8 19Z', pause: 'M8 5v14M16 5v14', replay: 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
    volume: 'M11 5 6 9H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14',
    muted: 'M11 5 6 9H3v6h3l5 4ZM16 9l6 6M22 9l-6 6',
    fullscreen: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5',
    exit: 'M3 8h5V3M21 8h-5V3M8 21v-5H3M16 21v-5h5',
  }
  return <svg className="player-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

export default function PlayerControls({ playing, ended, time, duration, buffered, volume, muted, speed, fullscreen, ambient, togglePlay, toggleMute, setVolume, setSpeed, seek, toggleFullscreen, onInteraction }) {
  const { t } = useLanguage()
  const [menu, setMenu] = useState(false), [hoverTime, setHoverTime] = useState(null)
  const speedButton = useRef(null)
  return <div className="showreel-player__controls" onPointerMove={onInteraction} onFocus={onInteraction}>
    <div className="player-timeline" style={{ '--played': `${duration ? time / duration * 100 : 0}%`, '--buffered': `${duration ? buffered / duration * 100 : 0}%` }} onPointerMove={event => {
      const rect = event.currentTarget.getBoundingClientRect()
      setHoverTime(clamp((event.clientX - rect.left) / rect.width, 0, 1) * duration)
    }} onPointerLeave={() => setHoverTime(null)}>
      <div className="player-timeline__track"><i /><b /></div>
      <input type="range" min="0" max={duration || 1} step="0.1" value={Math.min(time, duration || 0)} disabled={!duration} onChange={event => seek(Number(event.target.value))} aria-label={t('Seek video')} aria-valuetext={`${timeLabel(time)} / ${timeLabel(duration)}`} />
      {hoverTime !== null && duration > 0 && <span className="player-timeline__tooltip" style={{ left: `${clamp(hoverTime / duration * 100, 5, 95)}%` }}>{timeLabel(hoverTime)}</span>}
    </div>
    <div className="player-toolbar">
      <button type="button" onClick={togglePlay} aria-label={t(ended ? 'Replay video' : playing ? 'Pause video' : 'Play video')} title={t('Play / pause (Space)')}><PlayerIcon name={ended ? 'replay' : playing ? 'pause' : 'play'} /></button>
      <span className="showreel-player__time">{timeLabel(time)} / {timeLabel(duration)}</span>
      <div className="player-volume"><button type="button" onClick={toggleMute} aria-label={t(muted || !volume ? 'Unmute video' : 'Mute video')} title={t('Mute / unmute (M)')}><PlayerIcon name={muted || !volume ? 'muted' : 'volume'} /></button><input type="range" min="0" max="1" step=".01" value={muted ? 0 : volume} onChange={event => setVolume(Number(event.target.value))} aria-label={t('Volume')} aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`} /></div>
      <div className="player-speed" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMenu(false) }}>
        <button ref={speedButton} type="button" onClick={() => setMenu(value => !value)} aria-label={t('Playback speed')} aria-expanded={menu} title={t('Playback speed')}>{speed}×</button>
        {menu && <div className="player-speed__menu" role="group" aria-label={t('Playback speed')} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setMenu(false); speedButton.current?.focus() } }}>{playbackRates.map(rate => <button key={rate} type="button" aria-pressed={speed === rate} onClick={() => { setSpeed(rate); setMenu(false); speedButton.current?.focus() }}>{rate}× <span aria-hidden="true">{speed === rate ? '✓' : ''}</span></button>)}</div>}
      </div>
      <button className="player-ambient-toggle" type="button" onClick={ambient.toggle} disabled={!ambient.available} aria-pressed={ambient.enabled && ambient.available} aria-label={t(!ambient.available ? 'Ambient light unavailable for this source' : ambient.enabled ? 'Turn ambient light off' : 'Turn ambient light on')} title={!ambient.available ? t('Ambient light unavailable for this source') : undefined}>{t('LIGHT')}</button>
      <button type="button" onClick={toggleFullscreen} aria-label={t(fullscreen ? 'Exit fullscreen' : 'Open fullscreen')} title={t('Fullscreen (F)')}><PlayerIcon name={fullscreen ? 'exit' : 'fullscreen'} /></button>
    </div>
  </div>
}
