import test from 'node:test'
import assert from 'node:assert/strict'
import { extractPublicBlender, validatePublicPlaytime, PUBLIC_FRESH_MS } from '../src/utils/publicSteam.js'
import { validatePlaytime, hoursFormatter } from '../src/utils/steamPlaytime.js'
import { readFileSync } from 'node:fs'
const now = Date.parse('2026-10-15T12:00:00Z')
// Synthetic fixtures test parser behavior, not a claimed user reading.
const game = (id, amount) => `<div class="recent_game"><div class="game_info"><a href="https://steamcommunity.com/app/${id}">App</a><div class="game_info_details">${amount} hrs on record<br>last played</div></div></div>`
test('public parser binds record to Blender and parses English thousands/decimals without exact minutes',()=>{
  for(const [text,hours] of [['1,234',1234],['9,876.5',9876.5],['0',0]]) {
    const value=extractPublicBlender(game(999,'99')+game(365670,text)+game(111,'7'),now)
    assert.equal(value.hours,hours)
    assert.equal(value.minutes,undefined)
    assert.equal(value.precision,'displayed-hours')
    assert.equal(validatePlaytime(value,now).source,'steam-community')
  }
})
test('login/private/missing/malformed records never become zero or borrow another game time',()=>{
  for(const html of ['<html>Sign In</html>',game(999,'123'),game(365670,'?'),game(36567000,'100'),game(365670,'-10')]) assert.throws(()=>extractPublicBlender(html,now))
  assert.throws(()=>extractPublicBlender(game(999,'123')+'<a href="https://steamcommunity.com/app/365670">Comment link</a>',now))
  assert.equal(hoursFormatter('en',true).format(1234),'1,234')
  assert.equal(hoursFormatter('tr',true).format(1234),'1.234')
})
test('last verified public hours survive outages honestly with original timestamp',()=>{
  const value=extractPublicBlender(game(365670,'1,234'),now)
  assert.equal(validatePublicPlaytime(value,now+PUBLIC_FRESH_MS).stale,true)
  assert.equal(validatePublicPlaytime(value,now+365*86400000).updatedAt,value.updatedAt)
  for(const patch of [{appId:1},{steamId:'other'},{profileUrl:'https://evil.example'},{hours:-1},{hours:Infinity},{precision:'minutes'},{updatedAt:'invalid'}]) assert.throws(()=>validatePublicPlaytime({...value,...patch},now))
})
test('public sync and Pages schedules need no API key, cookie or elevated Git permissions',()=>{
  const script=readFileSync(new URL('../scripts/sync-steam-public.mjs',import.meta.url),'utf8')
  assert.doesNotMatch(script,/STEAM_API_KEY|Cookie:|credentials:|execSync|git commit/)
  const workflow=readFileSync(new URL('../.github/workflows/deploy.yml',import.meta.url),'utf8')
  assert.match(workflow,/17 \*\/2 \* \* \*/)
  assert.match(workflow,/npm run steam:sync/)
  assert.match(workflow,/contents: read/)
})
