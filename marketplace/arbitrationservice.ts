import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { MarketplacePaymentMethod, ArbitrationService, ArbitrationServiceSelection } from '../kinds.ts'
import { decodeMarketplaceEvent, type MarketplaceInvalidEventHandler } from './event-decoder.ts'
import {
  eventToArbitrationContextValue,
  isEvmAddress,
  now,
  parseEventJson,
  parseJsonObject,
  parseNonNegativeIntValue,
  requireString,
  tagValue,
  type ArbitrationType,
} from './helper.ts'

export type ArbitrationFee = {
  ppm: number
  base: string
  min: string
  max: string
  assetOverrides?: Record<string, Omit<ArbitrationFee, 'assetOverrides'>>
}

export type EvmArbitrationServiceParams = {
  arbiterAddress: string
  contractAddress: string
  contractBytecodeHash: string
  chainId: number
}

export type ArbitrationServiceParams = Record<string, unknown> & Partial<EvmArbitrationServiceParams>

export type ArbitrationServiceContent = {
  pubkey: string
  /** Machine-readable policy identifier used for routing and trust matching. */
  policy?: string
  /** Human-readable label only. Never use this field for driver selection. */
  type: ArbitrationType
  maxDuration: number
  fee: ArbitrationFee
  params: ArbitrationServiceParams
}

export type ParsedArbitrationService = {
  event: Event
  d: string
  content: ArbitrationServiceContent
}

export type ArbitrationServiceTemplate = Omit<ArbitrationServiceContent, 'policy'> & {
  /** New service advertisements MUST identify exactly one machine policy. */
  policy: string
  d: string
  extraTags?: string[][]
  createdAt?: number
}

export type ArbitrationServiceFindQuery = {
  author?: string
  policy?: string
  contractBytecodeHash?: string
  serviceType?: ArbitrationType
  chainId?: number
  limit?: number
}

export type ArbitrationServiceSearchOptions = {
  maxWait?: number
  oninvalid?: MarketplaceInvalidEventHandler
}

export type ArbitrationServiceSelectionContent = {
  service: Event
  paymentMethod: Event
}

export type ParsedArbitrationServiceSelection = {
  event: Event
  tradeId: string
  listingAnchor?: string
  content: ArbitrationServiceSelectionContent
}

export type ArbitrationServiceSelectionTemplate = {
  tradeId: string
  listingAnchor?: string
  service: Event | string
  paymentMethod: Event | string
  extraTags?: string[][]
  createdAt?: number
}

function normalizeFee(fee?: Partial<ArbitrationFee>): ArbitrationFee {
  return {
    ppm: fee?.ppm ?? 0,
    base: fee?.base ?? '0',
    min: fee?.min ?? '0',
    max: fee?.max ?? '0',
    ...(fee?.assetOverrides ? { assetOverrides: fee.assetOverrides } : {}),
  }
}

export function calculateArbitrationFee(fee: ArbitrationFee, amount: bigint, asset = 'native'): bigint {
  const selected = fee.assetOverrides?.[asset] ?? fee
  let value = (amount * BigInt(selected.ppm)) / 1000000n + BigInt(selected.base)
  const min = BigInt(selected.min)
  const max = BigInt(selected.max)
  if (min > 0n && value < min) value = min
  if (max > 0n && value > max) value = max
  return value
}

export function validateArbitrationServiceEvent(event: Event): boolean {
  try {
    parseArbitrationServiceEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseArbitrationServiceEvent(event: Event): ParsedArbitrationService {
  if (event.kind !== ArbitrationService) throw new Error('Invalid arbitration service kind')
  const d = requireString(tagValue(event, 'd'), 'arbitration service d tag')
  const json = parseJsonObject(event.content, 'arbitration service')
  const params = json.params
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new Error('Invalid arbitration service params')
  const parsedParams = params as Record<string, unknown>
  const type = requireString(json.type, 'arbitration service type')
  const policy = typeof json.policy === 'string' && json.policy.length > 0 ? json.policy : undefined
  const maxDuration = parseNonNegativeIntValue(json.maxDuration, 'maxDuration')
  const content: ArbitrationServiceContent = {
    pubkey: requireString(json.pubkey, 'arbitration service pubkey'),
    ...(policy ? { policy } : {}),
    type,
    maxDuration,
    fee: normalizeFee(
      json.fee && typeof json.fee === 'object' && !Array.isArray(json.fee)
        ? (json.fee as Partial<ArbitrationFee>)
        : undefined,
    ),
    params: { ...parsedParams },
  }
  const hasEvmParams = policy?.toLowerCase().startsWith('evm:') ||
    ['arbiterAddress', 'contractAddress', 'contractBytecodeHash', 'chainId'].some(key => parsedParams[key] !== undefined)
  if (hasEvmParams) {
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

export function generateArbitrationServiceEventTemplate(service: ArbitrationServiceTemplate): EventTemplate {
  const { d, extraTags, createdAt, ...content } = service
  return {
    kind: ArbitrationService,
    created_at: createdAt ?? now(),
    content: JSON.stringify({ ...content, fee: normalizeFee(content.fee) }),
    tags: [['d', d], ...(extraTags ?? [])],
  }
}

export function arbitrationServiceFilter(query: ArbitrationServiceFindQuery = {}): Filter {
  return { kinds: [ArbitrationService], authors: query.author ? [query.author] : undefined, limit: query.limit ?? 10 }
}

export async function findArbitrationService(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: ArbitrationServiceFindQuery = {},
  options: ArbitrationServiceSearchOptions = {},
): Promise<ParsedArbitrationService | null> {
  return (await searchArbitrationServices(pool, relays, query, options))[0] ?? null
}

export async function searchArbitrationServices(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: ArbitrationServiceFindQuery = {},
  options: ArbitrationServiceSearchOptions = {},
): Promise<ParsedArbitrationService[]> {
  const services: ParsedArbitrationService[] = []
  const events = await pool.querySync(relays, arbitrationServiceFilter(query), options)
  for (const event of events) {
    const decoded = decodeMarketplaceEvent(event, parseArbitrationServiceEvent, {
      source: 'arbitrationServices.search',
      oninvalid: options.oninvalid,
    })
    if (decoded.ok) services.push(decoded.value)
  }
  return services
    .filter(service => {
      if (query.serviceType && service.content.type !== query.serviceType) return false
      if (query.policy && service.content.policy !== query.policy) return false
      if (query.chainId !== undefined && service.content.params.chainId !== query.chainId) return false
      if (query.contractBytecodeHash && service.content.params.contractBytecodeHash !== query.contractBytecodeHash)
        return false
      return true
    })
}

export function parseArbitrationServiceSelectionContent(content: string): ArbitrationServiceSelectionContent {
  const json = parseJsonObject(content, 'arbitration service selection')
  const service = parseEventJson(json.service, 'selected arbitration service')
  const paymentMethod = parseEventJson(json.paymentMethod, 'selected seller payment methods')
  if (service.kind !== ArbitrationService) throw new Error('Invalid selected arbitration service kind')
  if (paymentMethod.kind !== MarketplacePaymentMethod) throw new Error('Invalid selected seller payment methods kind')
  return { service, paymentMethod }
}

export function validateArbitrationServiceSelectionEvent(event: Event): boolean {
  try {
    parseArbitrationServiceSelectionEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseArbitrationServiceSelectionEvent(event: Event): ParsedArbitrationServiceSelection {
  if (event.kind !== ArbitrationServiceSelection) throw new Error('Invalid arbitration service selection kind')
  const tradeId = requireString(tagValue(event, 'd'), 'arbitration service selection trade id')
  const listingAnchor = tagValue(event, 'a')
  return {
    event,
    tradeId,
    ...(listingAnchor ? { listingAnchor } : {}),
    content: parseArbitrationServiceSelectionContent(event.content),
  }
}

export function generateArbitrationServiceSelectionEventTemplate(selection: ArbitrationServiceSelectionTemplate): EventTemplate {
  return {
    kind: ArbitrationServiceSelection,
    created_at: selection.createdAt ?? now(),
    content: JSON.stringify({
      service: eventToArbitrationContextValue(selection.service),
      paymentMethod: eventToArbitrationContextValue(selection.paymentMethod),
    }),
    tags: [
      ['d', selection.tradeId],
      ...(selection.listingAnchor ? [['a', selection.listingAnchor]] : []),
      ...(selection.extraTags ?? []),
    ],
  }
}

export const arbitrationServices = {
  parse: parseArbitrationServiceEvent,
  validate: validateArbitrationServiceEvent,
  template: generateArbitrationServiceEventTemplate,
  filter: arbitrationServiceFilter,
  search: searchArbitrationServices,
  findOne: findArbitrationService,
  calculateFee: calculateArbitrationFee,
}

export const arbitrationServiceSelections = {
  parse: parseArbitrationServiceSelectionEvent,
  validate: validateArbitrationServiceSelectionEvent,
  template: generateArbitrationServiceSelectionEventTemplate,
}
