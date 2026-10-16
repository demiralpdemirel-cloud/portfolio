import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

test('profile retains its static cards, links and Steam integration without combat', () => {
  const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const profile = source.slice(source.indexOf('<section id="profile"'), source.indexOf('<section id="work"'))
  assert.match(profile, /className="profile-stage"><div className="profile-track"/)
  for (const content of ['CURRENT STUDIO', 'professionalLinks.map', 'instagram.handle', '<SteamPlaytime />']) assert.ok(profile.includes(content))
  assert.doesNotMatch(source, /ProfilePerformance|ProfileBattle|profile-battle|profile-platforms|referenceFight/)
  assert.doesNotMatch(profile, /<svg|<button|REPLAY|COMBAT|data-fight/)
  assert.match(source, /styles\/profile-cards.css/)
})

test('archived battle source and fixtures are absent from the portfolio', () => {
  for (const path of ['src/components/ProfilePerformance.jsx', 'src/components/ProfileBattle.jsx', 'src/motion/fights/director.js', 'src/motion/referenceFight/timeline.js', 'src/styles/profile-platforms.css', 'tests/fixtures/fight-director.html', 'tests/fixtures/reference-fight.html']) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), false, path)
  }
  const css = readFileSync(new URL('../src/styles/profile-cards.css', import.meta.url), 'utf8')
  assert.match(css, /@media\(max-width:700px\)/)
  assert.match(css, /prefers-reduced-motion/)
  assert.doesNotMatch(css, /performance-overlay|data-reference-actor/)
})
