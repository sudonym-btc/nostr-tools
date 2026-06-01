import type { Event, EventTemplate } from '../core.ts'
import { MarketplaceReview } from '../kinds.ts'
import { firstTag, now, requireString, tagValue } from './helper.ts'

export type ParsedReview = {
  event: Event
  orderGroupId: string
  tradeId: string
  listingAnchor: string
  rating: number
  orderAnchor?: string
  reviewProof?: string[]
  content: string
}

export type ReviewTemplate = {
  orderGroupId: string
  tradeId: string
  listingAnchor: string
  rating: number
  content?: string
  orderAnchor?: string
  reviewProof?: string[]
  extraTags?: string[][]
  createdAt?: number
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
    reviewProof: firstTag(event, 'review_proof'),
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
      ...(review.reviewProof ? [review.reviewProof] : []),
      ...(review.extraTags ?? []),
    ],
  }
}

export const reviews = {
  parse: parseReviewEvent,
  validate: validateReviewEvent,
  template: generateReviewEventTemplate,
}
