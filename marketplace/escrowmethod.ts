import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { EscrowMethod } from '../kinds.ts'
import { isEvmAddress, now, tagValues } from './helper.ts'

export type AcceptedPaymentForm = {
  denomination: string
  assetId: string
  appId?: string
}

export type ParsedEscrowMethod = {
  event: Event
  trustedEscrowPubkeys: string[]
  supportedContractBytecodeHashes: string[]
  acceptedPaymentForms: AcceptedPaymentForm[]
  evmAddress?: string
  evmAddressProof?: string
}

export type EscrowMethodTemplate = {
  trustedEscrowPubkeys?: string[]
  supportedContractBytecodeHashes?: string[]
  acceptedPaymentForms?: AcceptedPaymentForm[]
  evmAddress?: string
  evmAddressProof?: string
  extraTags?: string[][]
  createdAt?: number
}

export type EscrowMethodFindQuery = {
  author?: string
  trustedEscrowPubkey?: string
  contractBytecodeHash?: string
  denomination?: string
  assetId?: string
  limit?: number
}

export function canonicalAssetId(assetId: string): string {
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

function sameAssetId(left: string, right: string): boolean {
  return canonicalAssetId(left) === canonicalAssetId(right)
}

export function validateEscrowMethodEvent(event: Event): boolean {
  try {
    parseEscrowMethodEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseEscrowMethodEvent(event: Event): ParsedEscrowMethod {
  if (event.kind !== EscrowMethod) throw new Error('Invalid escrow method kind')
  const acceptedPaymentForms = event.tags
    .filter(tag => tag[0] === 'o')
    .map(tag => {
      if (tag.length < 3) throw new Error('Invalid payment form tag')
      return { denomination: tag[1], assetId: tag[2], ...(tag[3] ? { appId: tag[3] } : {}) }
    })
  const evmClaim = [...event.tags].reverse().find(tag => tag[0] === 'i' && tag[1]?.startsWith('evm:address:'))
  const parsedEvmAddress = evmClaim?.[1]?.slice('evm:address:'.length)
  if (parsedEvmAddress !== undefined && !isEvmAddress(parsedEvmAddress)) throw new Error('Invalid EVM address')
  const proof = evmClaim?.[2]
  return {
    event,
    trustedEscrowPubkeys: tagValues(event, 'p'),
    supportedContractBytecodeHashes: tagValues(event, 'c'),
    acceptedPaymentForms,
    ...(parsedEvmAddress ? { evmAddress: parsedEvmAddress } : {}),
    ...(proof ? { evmAddressProof: proof.startsWith('eip191:') ? proof.slice('eip191:'.length) : proof } : {}),
  }
}

export function generateEscrowMethodEventTemplate(method: EscrowMethodTemplate): EventTemplate {
  return {
    kind: EscrowMethod,
    created_at: method.createdAt ?? now(),
    content: '',
    tags: [
      ...(method.trustedEscrowPubkeys ?? []).map(pubkey => ['p', pubkey]),
      ...(method.supportedContractBytecodeHashes ?? []).map(hash => ['c', hash]),
      ...(method.acceptedPaymentForms ?? []).map(form => [
        'o',
        form.denomination,
        form.assetId,
        ...(form.appId ? [form.appId] : []),
      ]),
      ...(method.evmAddress ? [evmAddressTag(method.evmAddress, method.evmAddressProof)] : []),
      ...(method.extraTags ?? []),
    ],
  }
}

export function escrowMethodFilter(query: EscrowMethodFindQuery = {}): Filter {
  const filter: Filter = {
    kinds: [EscrowMethod],
    authors: query.author ? [query.author] : undefined,
    limit: query.limit ?? 1,
  }
  if (query.trustedEscrowPubkey) filter['#p'] = [query.trustedEscrowPubkey]
  if (query.contractBytecodeHash) filter['#c'] = [query.contractBytecodeHash]
  return filter
}

export async function findEscrowMethod(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: EscrowMethodFindQuery = {},
): Promise<ParsedEscrowMethod | null> {
  const events = await pool.querySync(relays, escrowMethodFilter(query))
  const methods = events.filter(validateEscrowMethodEvent).map(parseEscrowMethodEvent)
  return (
    methods.find(method => {
      if (query.denomination && !method.acceptedPaymentForms.some(form => form.denomination === query.denomination))
        return false
      if (
        query.assetId &&
        !method.acceptedPaymentForms.some(form =>
          query.denomination
            ? form.denomination === query.denomination && sameAssetId(form.assetId, query.assetId!)
            : sameAssetId(form.assetId, query.assetId!),
        )
      ) {
        return false
      }
      return true
    }) ?? null
  )
}

export const escrowMethods = {
  parse: parseEscrowMethodEvent,
  validate: validateEscrowMethodEvent,
  template: generateEscrowMethodEventTemplate,
  filter: escrowMethodFilter,
  findOne: findEscrowMethod,
  canonicalAssetId,
  evmAddressOwnershipMessage,
  evmAddressTag,
}
