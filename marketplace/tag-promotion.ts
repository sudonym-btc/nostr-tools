export type TagPromotion =
  | {
      kind: 'direct'
      source: string
      target: string
    }
  | {
      kind: 'boolean'
      source: string
      target: string
    }
  | {
      kind: 'valued'
      source: string
      match: string
      target: string
    }

export const tagPromotion = {
  direct(source: string, target: string): TagPromotion {
    return { kind: 'direct', source, target }
  },
  boolean(source: string, target: string): TagPromotion {
    return { kind: 'boolean', source, target }
  },
  valued(source: string, match: string, target: string): TagPromotion {
    return { kind: 'valued', source, match, target }
  },
}

export function promotedTags(tags: string[][], promotions: readonly TagPromotion[]): string[][] {
  const output: string[][] = []
  for (const promotion of promotions) {
    for (const tag of tags) {
      if (tag[0] !== promotion.source) continue
      if (promotion.kind === 'direct' && tag[1]) output.push([promotion.target, tag[1]])
      if (promotion.kind === 'boolean' && tag.length === 2 && tag[1]) output.push([promotion.target, tag[1]])
      if (promotion.kind === 'valued' && tag[1] === promotion.match && tag[2]) output.push([promotion.target, tag[2]])
    }
  }
  return output
}

export function promotedBooleanCombinations(features: Iterable<string>, target = 'S'): string[][] {
  const sorted = [...new Set(features)].sort()
  const tags: string[][] = []
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      tags.push([target, `${sorted[i]}+${sorted[j]}`])
    }
  }
  return tags
}
