export function createAmbientScheduler({ mobile = false, reduced = false } = {}) {
  const ceiling = reduced ? 12 : mobile ? 24 : 30
  let rate = ceiling, nextSample = -Infinity, lastFrame = null, lastMedia = null
  let average = 0, total = 0, maximum = 0, count = 0, lastRecovery = 0, lastBackoff = -Infinity, overBudget = 0
  return {
    shouldSample(now, metadata) {
      const frame = metadata.presentedFrames, media = metadata.mediaTime
      if (frame !== undefined ? frame === lastFrame : media === lastMedia) return false
      lastFrame = frame; lastMedia = media
      if (now < nextSample - .6) return false
      nextSample = Number.isFinite(nextSample) ? Math.max(nextSample + 1000 / rate, now + 1000 / ceiling - .6) : now + 1000 / rate
      return true
    },
    record(cost, now, budgetMs = 2) {
      average = count < 3 ? cost : average * .9 + cost * .1
      total += cost; maximum = Math.max(maximum, cost); count++
      overBudget = average > budgetMs ? overBudget + 1 : 0
      // Ignore isolated capture/GC spikes. Sustained overload backs off, while
      // a genuinely blocking update immediately protects video playback.
      if (count > 3 && ((overBudget >= 3 && now - lastBackoff > 1000) || cost > 16)) {
        rate = Math.max(reduced ? 8 : mobile ? 10 : 12, cost > 16 ? rate * .65 : rate - 2)
        lastRecovery = now; lastBackoff = now; overBudget = 0
      } else if (average < budgetMs * .6 && now - lastRecovery > 2000) { rate = Math.min(ceiling, rate + 1); lastRecovery = now }
    },
    reset() { nextSample = -Infinity; lastFrame = null; lastMedia = null },
    get rate() { return rate },
    get stats() { return { averageMs: count ? total / count : 0, maxMs: maximum, count } },
  }
}
