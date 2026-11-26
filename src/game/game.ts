import type { Finish, Phone } from '../catalog/types'

export interface Question {
  phone: Phone
  finish: Finish
  /** Shuffled; contains `phone` exactly once plus Distractors. */
  choices: Phone[]
}

export interface GameOptions {
  catalog: readonly Phone[]
  /** Phones that may be the one shown in a Question. */
  showable: readonly Phone[]
  questionCount: number
  choiceCount: number
  /** Returns a float in [0, 1). Injected so tests are deterministic. */
  random?: () => number
  /** The only Finish a Phone can be shown in, when its Asset can't be repainted. */
  fixedFinish?: (phone: Phone) => Finish | undefined
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Builds a Game. No Phone is shown twice; Distractors come from the whole
 * Catalog, look-alikes included. Shorter than `questionCount` when fewer
 * showable Phones exist.
 */
export function buildGame({
  catalog,
  showable,
  questionCount,
  choiceCount,
  random = Math.random,
  fixedFinish = () => undefined,
}: GameOptions): Question[] {
  if (catalog.length < choiceCount) {
    throw new Error(`Catalog has ${catalog.length} Phones; need at least ${choiceCount} for Choices`)
  }
  return shuffle(showable, random)
    .slice(0, questionCount)
    .map((phone) => {
      const distractors = shuffle(
        catalog.filter((p) => p.id !== phone.id),
        random,
      ).slice(0, choiceCount - 1)
      return {
        phone,
        finish: fixedFinish(phone) ?? phone.finishes[Math.floor(random() * phone.finishes.length)],
        choices: shuffle([phone, ...distractors], random),
      }
    })
}
