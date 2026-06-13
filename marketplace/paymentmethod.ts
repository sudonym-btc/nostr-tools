import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { MarketplacePaymentMethod } from '../kinds.ts'
import { decodeMarketplaceEvent, type MarketplaceInvalidEventHandler } from './event-decoder.ts'
import { canonicalCurrency, isEvmAddress, now, tagValues } from './helper.ts'

export type AcceptedPaymentForm = {
  currency?: string
  denomination: string
  assetId: string
  appId?: string
}

export type ParsedPaymentMethod = {
  event: Event
  trustedArbiterPubkeys: string[]
  supportedContractBytecodeHashes: string[]
  acceptedPaymentForms: AcceptedPaymentForm[]
  evmAddress?: string
  evmAddressProof?: string
  cashuPubkey?: string
}

export type PaymentMethodTemplate = {
  trustedArbiterPubkeys?: string[]
  supportedContractBytecodeHashes?: string[]
  acceptedPaymentForms?: AcceptedPaymentForm[]
  evmAddress?: string
  evmAddressProof?: string
  cashuPubkey?: string
  extraTags?: string[][]
  createdAt?: number
}

export type PaymentMethodFindQuery = {
  author?: string
  trustedArbiterPubkey?: string
  contractBytecodeHash?: string
  currency?: string
  denomination?: string
  assetId?: string
  limit?: number
}

export type PaymentMethodFindOptions = {
  maxWait?: number
  oninvalid?: MarketplaceInvalidEventHandler
}

export function canonicalAssetId(assetId: string): string {
  const cashu = assetId.match(/^cashu:([^:]+):(.+)$/)
  if (cashu) {
    const [, unit, rawMintUrl] = cashu
    try {
      const mintUrl = new URL(rawMintUrl)
      mintUrl.protocol = mintUrl.protocol.toLowerCase()
      mintUrl.hostname = mintUrl.hostname.toLowerCase()
      if (mintUrl.pathname === '/') mintUrl.pathname = ''
      return `cashu:${unit.toLowerCase()}:${mintUrl.toString().replace(/\/$/, '')}`
    } catch {
      return `cashu:${unit.toLowerCase()}:${rawMintUrl.replace(/\/+$/, '')}`
    }
  }
  const separator = assetId.indexOf(':')
  if (separator === -1) return assetId
  const chainId = assetId.slice(0, separator)
  const address = assetId.slice(separator + 1)
  return address.startsWith('0x') || address.startsWith('0X') ? `${chainId}:${address.toLowerCase()}` : assetId
}

export function evmAddressOwnershipMessage(opts: { nostrPubkey: string; evmAddress: string }): string {
  return ['EVM address ownership proof', `nostr:${opts.nostrPubkey}`, `evm:address:${opts.evmAddress}`].join('\n')
}

export function evmAddressTag(address: string, eip191Proof?: string): string[] {
  return ['i', `evm:address:${address}`, ...(eip191Proof ? [`eip191:${eip191Proof}`] : [])]
}

export function cashuPubkeyTag(pubkey: string): string[] {
  return ['i', `cashu:p2pk:${pubkey}`]
}

function sameAssetId(left: string, right: string): boolean {
  return canonicalAssetId(left) === canonicalAssetId(right)
}

function denomination(value: string | undefined): string {
  return (value ?? '').toUpperCase()
}

export function normalizePaymentFormForNostr(form: AcceptedPaymentForm): AcceptedPaymentForm {
  const currency = canonicalCurrency(form.currency ?? form.denomination)
  return {
    currency,
    denomination: currency,
    assetId: form.assetId,
    ...(form.appId ? { appId: form.appId } : {}),
  }
}

function isBtcSatPair(left: string | undefined, right: string | undefined): boolean {
  const a = denomination(left)
  const b = denomination(right)
  return (a === 'BTC' && b === 'SAT') || (a === 'SAT' && b === 'BTC')
}

function denominationMatches(left: string, right: string): boolean {
  return canonicalCurrency(left) === canonicalCurrency(right) || isBtcSatPair(left, right)
}

export function validatePaymentMethodEvent(event: Event): boolean {
  try {
    parsePaymentMethodEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parsePaymentMethodEvent(event: Event): ParsedPaymentMethod {
  if (event.kind !== MarketplacePaymentMethod) throw new Error('Invalid payment method kind')
  const acceptedPaymentForms = event.tags
    .filter(tag => tag[0] === 'o')
    .map(tag => {
      if (tag.length < 3) throw new Error('Invalid payment form tag')
      return normalizePaymentFormForNostr({ denomination: tag[1], assetId: tag[2], ...(tag[3] ? { appId: tag[3] } : {}) })
    })
  const evmClaim = [...event.tags].reverse().find(tag => tag[0] === 'i' && tag[1]?.startsWith('evm:address:'))
  const parsedEvmAddress = evmClaim?.[1]?.slice('evm:address:'.length)
  if (parsedEvmAddress !== undefined && !isEvmAddress(parsedEvmAddress)) throw new Error('Invalid EVM address')
  const proof = evmClaim?.[2]
  const cashuClaim = [...event.tags].reverse().find(tag => tag[0] === 'i' && tag[1]?.startsWith('cashu:p2pk:'))
  const cashuPubkey = cashuClaim?.[1]?.slice('cashu:p2pk:'.length)
  return {
    event,
    trustedArbiterPubkeys: tagValues(event, 'p'),
    supportedContractBytecodeHashes: tagValues(event, 'c'),
    acceptedPaymentForms,
    ...(parsedEvmAddress ? { evmAddress: parsedEvmAddress } : {}),
    ...(proof ? { evmAddressProof: proof.startsWith('eip191:') ? proof.slice('eip191:'.length) : proof } : {}),
    ...(cashuPubkey ? { cashuPubkey } : {}),
  }
}

export function generatePaymentMethodEventTemplate(method: PaymentMethodTemplate): EventTemplate {
  return {
    kind: MarketplacePaymentMethod,
    created_at: method.createdAt ?? now(),
    content: '',
    tags: [
      ...(method.trustedArbiterPubkeys ?? []).map(pubkey => ['p', pubkey]),
      ...(method.supportedContractBytecodeHashes ?? []).map(hash => ['c', hash]),
      ...(method.acceptedPaymentForms ?? []).map(form => {
        const normalized = normalizePaymentFormForNostr(form)
        return [
          'o',
          normalized.denomination,
          normalized.assetId,
          ...(normalized.appId ? [normalized.appId] : []),
        ]
      }),
      ...(method.evmAddress ? [evmAddressTag(method.evmAddress, method.evmAddressProof)] : []),
      ...(method.cashuPubkey ? [cashuPubkeyTag(method.cashuPubkey)] : []),
      ...(method.extraTags ?? []),
    ],
  }
}

export function paymentMethodFilter(query: PaymentMethodFindQuery = {}): Filter {
  const filter: Filter = {
    kinds: [MarketplacePaymentMethod],
    authors: query.author ? [query.author] : undefined,
    limit: query.limit ?? 1,
  }
  if (query.trustedArbiterPubkey) filter['#p'] = [query.trustedArbiterPubkey]
  if (query.contractBytecodeHash) filter['#c'] = [query.contractBytecodeHash]
  return filter
}

export async function findPaymentMethod(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: PaymentMethodFindQuery = {},
  options: PaymentMethodFindOptions = {},
): Promise<ParsedPaymentMethod | null> {
  const events = await pool.querySync(relays, paymentMethodFilter(query), options)
  const methods: ParsedPaymentMethod[] = []
  for (const event of events) {
    const decoded = decodeMarketplaceEvent(event, parsePaymentMethodEvent, {
      source: 'paymentMethod.findOne',
      oninvalid: options.oninvalid,
    })
    if (decoded.ok) methods.push(decoded.value)
  }
  return (
    methods.find(method => {
      const queryCurrency = query.currency ?? query.denomination
      if (queryCurrency && !method.acceptedPaymentForms.some(form => denominationMatches(form.currency ?? form.denomination, queryCurrency)))
        return false
      if (
        query.assetId &&
        !method.acceptedPaymentForms.some(form =>
          queryCurrency
            ? denominationMatches(form.currency ?? form.denomination, queryCurrency) && sameAssetId(form.assetId, query.assetId!)
            : sameAssetId(form.assetId, query.assetId!),
        )
      ) {
        return false
      }
      return true
    }) ?? null
  )
}

export const paymentMethod = {
  parse: parsePaymentMethodEvent,
  validate: validatePaymentMethodEvent,
  template: generatePaymentMethodEventTemplate,
  filter: paymentMethodFilter,
  findOne: findPaymentMethod,
  canonicalAssetId,
  evmAddressOwnershipMessage,
  evmAddressTag,
  cashuPubkeyTag,
}
