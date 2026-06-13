import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { MarketplaceReview } from '../kinds.ts'
import { decodeMarketplaceEvent, type MarketplaceInvalidEventHandler } from './event-decoder.ts'
import { firstTag, now, requireString, tagValue } from './helper.ts'
import {
  parseParticipantProofKeyTag,
  parseParticipantProofTag,
  participantProofKeyTag,
  participantProofTag,
  resolvePublicParticipantProof,
  type ParticipantProofKeyTag,
  type ParticipantProofResolution,
  type ParticipantProofResolutionStatus,
  type ParticipantProofTag,
} from './participant-proof.ts'

export type ParsedReview = {
  event: Event
  orderGroupId: string
  tradeId: string
  listingAnchor: string
  rating: number
  orderAnchor?: string
  participantProofs: ParticipantProofTag[]
  participantProofKeys: ParticipantProofKeyTag[]
  content: string
}

export type ReviewTemplate = {
  orderGroupId: string
  tradeId: string
  listingAnchor: string
  rating: number
  content?: string
  orderAnchor?: string
  participantProofs?: ParticipantProofTag[]
  participantProofKeys?: ParticipantProofKeyTag[]
  extraTags?: string[][]
  createdAt?: number
}

export type ReviewSearchQuery = {
  listingAnchor?: string
  orderGroupId?: string
  tradeId?: string
  authors?: string[]
  since?: number
  until?: number
  limit?: number
}

export type ReviewSearchOptions = {
  maxWait?: number
  oninvalid?: MarketplaceInvalidEventHandler
}

export type ReviewProofResolutionStatus = ParticipantProofResolutionStatus

export type ReviewProofResolution = ParticipantProofResolution

type ReviewQueryPool = Pick<AbstractSimplePool, 'querySync'>

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function latestReview(left: ParsedReview | undefined, right: ParsedReview): ParsedReview {
  if (!left) return right
  if (right.event.created_at !== left.event.created_at) {
    return right.event.created_at > left.event.created_at ? right : left
  }
  return right.event.id.localeCompare(left.event.id) > 0 ? right : left
}

export function resolveReviewProof(review: ParsedReview): ReviewProofResolution {
  const proof = review.participantProofs.find(candidate => candidate.role === 'buyer') ?? review.participantProofs[0]
  if (!proof) return { status: 'missing' }
  return resolvePublicParticipantProof(proof, {
    listingAnchor: review.listingAnchor,
    tradeId: review.tradeId,
    orderGroupId: review.orderGroupId,
    role: proof.role,
    participantPubkey: proof.participantPubkey,
    requireOrderGroupId: true,
  })
}

export function revealedReviewBuyerPubkey(review: ParsedReview): string | undefined {
  const resolution = resolveReviewProof(review)
  return resolution.status === 'resolved' && resolution.role === 'buyer' ? resolution.realPubkey : undefined
}

export function validateReviewEvent(event: Event): boolean {
  try {
    parseReviewEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseReviewEvent(event: Event): ParsedReview {
  if (event.kind !== MarketplaceReview) throw new Error('Invalid review kind')
  if (firstTag(event, 'review_proof')) throw new Error('review_proof is not supported; use participant_proof')
  const orderGroupId = requireString(tagValue(event, 'd'), 'review order group id')
  const tradeId = requireString(tagValue(event, 'trade'), 'review trade id')
  const listingAnchor = requireString(tagValue(event, 'a'), 'review listing anchor')
  const rating = firstTag(event, 'rating')
  if (!rating || rating.length < 3 || rating[2] !== 'thumb') throw new Error('Invalid rating tag')
  const ratingValue = Number.parseFloat(rating[1])
  if (!Number.isFinite(ratingValue) || ratingValue < 0 || ratingValue > 1) throw new Error('Invalid rating')
  return {
    event,
    orderGroupId,
    tradeId,
    listingAnchor,
    rating: ratingValue,
    orderAnchor: tagValue(event, 'r'),
    participantProofs: event.tags
      .map(parseParticipantProofTag)
      .filter((tag): tag is ParticipantProofTag => tag !== null),
    participantProofKeys: event.tags
      .map(parseParticipantProofKeyTag)
      .filter((tag): tag is ParticipantProofKeyTag => tag !== null),
    content: event.content,
  }
}

export function generateReviewEventTemplate(review: ReviewTemplate): EventTemplate {
  return {
    kind: MarketplaceReview,
    created_at: review.createdAt ?? now(),
    content: review.content ?? '',
    tags: [
      ['d', review.orderGroupId],
      ['trade', review.tradeId],
      ['a', review.listingAnchor],
      ['rating', review.rating.toString(), 'thumb'],
      ...(review.orderAnchor ? [['r', review.orderAnchor]] : []),
      ...(review.participantProofs ?? []).map(participantProofTag),
      ...(review.participantProofKeys ?? []).map(participantProofKeyTag),
      ...(review.extraTags ?? []),
    ],
  }
}

export function reviewSearchFilter(query: ReviewSearchQuery = {}): Filter {
  return {
    kinds: [MarketplaceReview],
    ...(query.listingAnchor ? { '#a': [query.listingAnchor] } : {}),
    ...(query.orderGroupId ? { '#d': [query.orderGroupId] } : {}),
    ...(query.tradeId ? { '#trade': [query.tradeId] } : {}),
    ...(query.authors && query.authors.length > 0 ? { authors: unique(query.authors) } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  }
}

export async function searchReviews(
  pool: ReviewQueryPool,
  relays: string[],
  query: ReviewSearchQuery = {},
  options: ReviewSearchOptions = {},
): Promise<ParsedReview[]> {
  const events = await pool.querySync(relays, reviewSearchFilter(query), options)
  const latestByAuthorAndGroup = new Map<string, ParsedReview>()
  for (const event of events) {
    const decoded = decodeMarketplaceEvent(event, parseReviewEvent, {
      source: 'reviews.search',
      oninvalid: options.oninvalid,
    })
    if (!decoded.ok) continue
    const review = decoded.value
    const key = `${review.event.pubkey}:${review.orderGroupId}`
    latestByAuthorAndGroup.set(key, latestReview(latestByAuthorAndGroup.get(key), review))
  }
  return [...latestByAuthorAndGroup.values()].sort((a, b) => b.event.created_at - a.event.created_at)
}

export const reviews = {
  parse: parseReviewEvent,
  validate: validateReviewEvent,
  template: generateReviewEventTemplate,
  filter: reviewSearchFilter,
  search: searchReviews,
  resolveProof: resolveReviewProof,
  revealedBuyerPubkey: revealedReviewBuyerPubkey,
}
