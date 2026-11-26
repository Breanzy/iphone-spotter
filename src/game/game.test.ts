import { describe, expect, it } from 'vitest'
import { ASSETS } from '../catalog/assets'
import { PHONES } from '../catalog/phones'
import { buildGame } from './game'

// Small deterministic PRNG (mulberry32) so failures are reproducible.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const base = { catalog: PHONES, showable: PHONES, questionCount: 10, choiceCount: 4 }

describe('buildGame', () => {
  it('makes 10 Questions with 4 Choices, the shown Phone among them once', () => {
    for (let s = 0; s < 50; s++) {
      const game = buildGame({ ...base, random: seeded(s) })
      expect(game).toHaveLength(10)
      for (const q of game) {
        expect(q.choices).toHaveLength(4)
        expect(q.choices.filter((c) => c.id === q.phone.id)).toHaveLength(1)
        expect(new Set(q.choices.map((c) => c.id)).size).toBe(4)
        expect(q.phone.finishes).toContain(q.finish)
      }
    }
  })

  it('never shows the same Phone twice in a Game', () => {
    const game = buildGame({ ...base, random: seeded(7) })
    expect(new Set(game.map((q) => q.phone.id)).size).toBe(game.length)
  })

  it('only shows showable Phones but draws Distractors from the whole Catalog', () => {
    const showable = PHONES.slice(0, 3)
    const seenDistractors = new Set<string>()
    for (let s = 0; s < 50; s++) {
      const game = buildGame({ ...base, showable, random: seeded(s) })
      expect(game).toHaveLength(3)
      for (const q of game) {
        expect(showable).toContain(q.phone)
        q.choices.forEach((c) => c.id !== q.phone.id && seenDistractors.add(c.id))
      }
    }
    expect([...seenDistractors].some((id) => !showable.some((p) => p.id === id))).toBe(true)
  })

  it('uses the fixed Finish when a Phone has one', () => {
    const iphone4 = PHONES.find((p) => p.id === 'iphone-4')!
    const black = iphone4.finishes.find((f) => f.name === 'Black')!
    for (let s = 0; s < 20; s++) {
      const [q] = buildGame({ ...base, showable: [iphone4], random: seeded(s), fixedFinish: () => black })
      expect(q.finish).toBe(black)
    }
  })

  it('every Asset points at a real Phone, and unpaintable ones name a real native Finish', () => {
    for (const a of ASSETS) {
      const phone = PHONES.find((p) => p.id === a.phoneId)
      expect(phone, a.phoneId).toBeDefined()
      if (a.bodyMaterials.length === 0) {
        expect(phone!.finishes.map((f) => f.name), a.phoneId).toContain(a.nativeFinish)
      }
    }
  })

  it('every Catalog Phone has an id, a Finish and a Tell', () => {
    expect(new Set(PHONES.map((p) => p.id)).size).toBe(PHONES.length)
    for (const p of PHONES) {
      expect(p.finishes.length, p.id).toBeGreaterThan(0)
      expect(p.tells.length, p.id).toBeGreaterThan(0)
    }
  })
})
