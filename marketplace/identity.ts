import type { OrderGroupRole } from './order-id.ts'
import { deriveMarketplaceTradeMaterial, normalizeMarketplaceSeed } from './seed.ts'

export type MarketplaceOrderIdentity = {
  pubkey?: string
  seed?: string
  roles?: OrderGroupRole[]
  tempKeyWindow?: number
}

const defaultTempKeyWindow = 500

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function safeTempKeyWindow(value: number | undefined): number {
  const window = value ?? 0
  if (!Number.isSafeInteger(window) || window < 0) throw new Error(`Invalid tempKeyWindow: ${value}`)
  return window
}

function identityRoles(identity: MarketplaceOrderIdentity, fallback: OrderGroupRole[] = ['buyer']): OrderGroupRole[] {
  return identity.roles && identity.roles.length > 0 ? identity.roles : fallback
}

export function marketplaceIdentityPubkeys(
  identity: MarketplaceOrderIdentity = {},
  fallbackRoles: OrderGroupRole[] = ['buyer'],
): string[] {
  const pubkeys: string[] = []
  if (identity.pubkey) pubkeys.push(identity.pubkey)
  const tempKeyWindow = safeTempKeyWindow(identity.tempKeyWindow)
  if (identity.seed && tempKeyWindow > 0) {
    const seed = normalizeMarketplaceSeed(identity.seed)
    for (const role of identityRoles(identity, fallbackRoles)) {
      for (let index = 0; index < tempKeyWindow; index += 1) {
        pubkeys.push(deriveMarketplaceTradeMaterial(seed, { index, role }).tradePubkey)
      }
    }
  }
  return unique(pubkeys)
}

export function marketplaceOrderIdentity(identity: MarketplaceOrderIdentity = {}): MarketplaceOrderIdentity {
  return {
    ...identity,
    roles: identity.roles ?? ['buyer', 'seller'],
    tempKeyWindow: identity.tempKeyWindow ?? defaultTempKeyWindow,
  }
}

export function marketplaceAuctionBidIdentity(identity: MarketplaceOrderIdentity = {}): MarketplaceOrderIdentity {
  return {
    ...identity,
    roles: identity.roles ?? ['buyer'],
    tempKeyWindow: identity.tempKeyWindow ?? defaultTempKeyWindow,
  }
}

export const marketplaceIdentity = {
  pubkeys: marketplaceIdentityPubkeys,
  orders: marketplaceOrderIdentity,
  auctionBids: marketplaceAuctionBidIdentity,
}
