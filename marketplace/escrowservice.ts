import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { EscrowMethod, EscrowService, EscrowServiceSelection } from '../kinds.ts'
import {
  eventToEscrowContextValue,
  isEvmAddress,
  now,
  parseEventJson,
  parseJsonObject,
  parseNonNegativeIntValue,
  requireString,
  tagValue,
  type EscrowType,
} from './helper.ts'

export type EscrowFee = {
  ppm: number
  base: string
  min: string
  max: string
  assetOverrides?: Record<string, Omit<EscrowFee, 'assetOverrides'>>
}

export type EvmEscrowServiceParams = {
  arbiterAddress: string
  contractAddress: string
  contractBytecodeHash: string
  chainId: number
}

export type EscrowServiceParams = Record<string, unknown> & Partial<EvmEscrowServiceParams>

export type EscrowServiceContent = {
  pubkey: string
  type: EscrowType
  maxDuration: number
  fee: EscrowFee
  params: EscrowServiceParams
}

export type ParsedEscrowService = {
  event: Event
  d: string
  content: EscrowServiceContent
}

export type EscrowServiceTemplate = EscrowServiceContent & {
  d: string
  extraTags?: string[][]
  createdAt?: number
}

export type EscrowServiceFindQuery = {
  author?: string
  contractBytecodeHash?: string
  serviceType?: EscrowType
  chainId?: number
  limit?: number
}

export type EscrowServiceSelectionContent = {
  service: Event
  sellerMethods: Event
}

export type ParsedEscrowServiceSelection = {
  event: Event
  tradeId: string
  listingAnchor?: string
  content: EscrowServiceSelectionContent
}

export type EscrowServiceSelectionTemplate = {
  tradeId: string
  listingAnchor?: string
  service: Event | string
  sellerMethods: Event | string
  extraTags?: string[][]
  createdAt?: number
}

function normalizeFee(fee?: Partial<EscrowFee>): EscrowFee {
  return {
    ppm: fee?.ppm ?? 0,
    base: fee?.base ?? '0',
    min: fee?.min ?? '0',
    max: fee?.max ?? '0',
    ...(fee?.assetOverrides ? { assetOverrides: fee.assetOverrides } : {}),
  }
}

export function calculateEscrowFee(fee: EscrowFee, amount: bigint, asset = 'native'): bigint {
  const selected = fee.assetOverrides?.[asset] ?? fee
  let value = (amount * BigInt(selected.ppm)) / 1000000n + BigInt(selected.base)
  const min = BigInt(selected.min)
  const max = BigInt(selected.max)
  if (min > 0n && value < min) value = min
  if (max > 0n && value > max) value = max
  return value
}

export function validateEscrowServiceEvent(event: Event): boolean {
  try {
    parseEscrowServiceEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseEscrowServiceEvent(event: Event): ParsedEscrowService {
  if (event.kind !== EscrowService) throw new Error('Invalid escrow service kind')
  const d = requireString(tagValue(event, 'd'), 'escrow service d tag')
  const json = parseJsonObject(event.content, 'escrow service')
  const params = json.params
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new Error('Invalid escrow service params')
  const parsedParams = params as Record<string, unknown>
  const type = requireString(json.type, 'escrow service type')
  const maxDuration = parseNonNegativeIntValue(json.maxDuration, 'maxDuration')
  const content: EscrowServiceContent = {
    pubkey: requireString(json.pubkey, 'escrow service pubkey'),
    type,
    maxDuration,
    fee: normalizeFee(
      json.fee && typeof json.fee === 'object' && !Array.isArray(json.fee)
        ? (json.fee as Partial<EscrowFee>)
        : undefined,
    ),
    params: { ...parsedParams },
  }
  if (type === 'EVM') {
    content.params = {
      ...parsedParams,
      arbiterAddress: requireString(parsedParams.arbiterAddress, 'arbiterAddress'),
      contractAddress: requireString(parsedParams.contractAddress, 'contractAddress'),
      contractBytecodeHash: requireString(parsedParams.contractBytecodeHash, 'contractBytecodeHash'),
      chainId: parseNonNegativeIntValue(parsedParams.chainId, 'chainId'),
    }
    if (!isEvmAddress(content.params.arbiterAddress!)) throw new Error('Invalid arbiterAddress')
    if (!isEvmAddress(content.params.contractAddress!)) throw new Error('Invalid contractAddress')
  }
  return { event, d, content }
}

export function generateEscrowServiceEventTemplate(service: EscrowServiceTemplate): EventTemplate {
  const { d, extraTags, createdAt, ...content } = service
  return {
    kind: EscrowService,
    created_at: createdAt ?? now(),
    content: JSON.stringify({ ...content, fee: normalizeFee(content.fee) }),
    tags: [['d', d], ...(extraTags ?? [])],
  }
}

export function escrowServiceFilter(query: EscrowServiceFindQuery = {}): Filter {
  return { kinds: [EscrowService], authors: query.author ? [query.author] : undefined, limit: query.limit ?? 10 }
}

export async function findEscrowService(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: EscrowServiceFindQuery = {},
): Promise<ParsedEscrowService | null> {
  return (await searchEscrowServices(pool, relays, query))[0] ?? null
}

export async function searchEscrowServices(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: EscrowServiceFindQuery = {},
): Promise<ParsedEscrowService[]> {
  return (await pool.querySync(relays, escrowServiceFilter(query)))
    .filter(validateEscrowServiceEvent)
    .map(parseEscrowServiceEvent)
    .filter(service => {
      if (query.serviceType && service.content.type !== query.serviceType) return false
      if (query.chainId !== undefined && service.content.params.chainId !== query.chainId) return false
      if (query.contractBytecodeHash && service.content.params.contractBytecodeHash !== query.contractBytecodeHash)
        return false
      return true
    })
}

export function parseEscrowServiceSelectionContent(content: string): EscrowServiceSelectionContent {
  const json = parseJsonObject(content, 'escrow service selection')
  const service = parseEventJson(json.service, 'selected escrow service')
  const sellerMethods = parseEventJson(json.sellerMethods, 'selected seller escrow methods')
  if (service.kind !== EscrowService) throw new Error('Invalid selected escrow service kind')
  if (sellerMethods.kind !== EscrowMethod) throw new Error('Invalid selected seller escrow methods kind')
  return { service, sellerMethods }
}

export function validateEscrowServiceSelectionEvent(event: Event): boolean {
  try {
    parseEscrowServiceSelectionEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseEscrowServiceSelectionEvent(event: Event): ParsedEscrowServiceSelection {
  if (event.kind !== EscrowServiceSelection) throw new Error('Invalid escrow service selection kind')
  const tradeId = requireString(tagValue(event, 'd'), 'escrow service selection trade id')
  const listingAnchor = tagValue(event, 'a')
  return {
    event,
    tradeId,
    ...(listingAnchor ? { listingAnchor } : {}),
    content: parseEscrowServiceSelectionContent(event.content),
  }
}

export function generateEscrowServiceSelectionEventTemplate(selection: EscrowServiceSelectionTemplate): EventTemplate {
  return {
    kind: EscrowServiceSelection,
    created_at: selection.createdAt ?? now(),
    content: JSON.stringify({
      service: eventToEscrowContextValue(selection.service),
      sellerMethods: eventToEscrowContextValue(selection.sellerMethods),
    }),
    tags: [
      ['d', selection.tradeId],
      ...(selection.listingAnchor ? [['a', selection.listingAnchor]] : []),
      ...(selection.extraTags ?? []),
    ],
  }
}

export const escrowServices = {
  parse: parseEscrowServiceEvent,
  validate: validateEscrowServiceEvent,
  template: generateEscrowServiceEventTemplate,
  filter: escrowServiceFilter,
  search: searchEscrowServices,
  findOne: findEscrowService,
  calculateFee: calculateEscrowFee,
}

export const escrowServiceSelections = {
  parse: parseEscrowServiceSelectionEvent,
  validate: validateEscrowServiceSelectionEvent,
  template: generateEscrowServiceSelectionEventTemplate,
}
