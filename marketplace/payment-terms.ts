import type {
  MarketplaceDriverPaymentTermLock,
  MarketplaceDriverPaymentTermOutput,
  MarketplaceDriverPaymentTermPath,
  MarketplaceDriverPaymentTerms,
} from '@sudonym-btc/marketplace-driver-interface'
import type { PaymentSettlementOutput } from './payment-lifecycle.ts'

export type MarketplacePaymentTermSettlementMode =
  | {
      type: 'chunked'
      chunks: number
    }
  | {
      type: 'continuous'
      denominator: string
    }
  | {
      type: string
      data?: Record<string, unknown>
    }

export type MarketplacePaymentTermSettlementOption = {
  lockId: string
  policyId: string
  pathId: string
  mode: MarketplacePaymentTermSettlementMode
  outputs: PaymentSettlementOutput[]
}

export type MarketplacePaymentTermSplitOption = MarketplacePaymentTermSettlementOption & {
  mode: {
    type: 'chunked'
    chunks: number
  }
  chunk: number
  chunks: number
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function settlementMode(lock: MarketplaceDriverPaymentTermLock): MarketplacePaymentTermSettlementMode | undefined {
  const arbitration = recordValue(lock.conditions?.arbitration)
  const type = typeof arbitration?.type === 'string' ? arbitration.type : undefined
  if (type === 'chunked') {
    const chunks = arbitration?.chunks
    if (typeof chunks === 'number' && Number.isSafeInteger(chunks) && chunks > 0) return { type, chunks }
  }
  if (type === 'continuous') {
    const denominator = arbitration?.denominator
    if (typeof denominator === 'string' && denominator.length > 0) return { type, denominator }
    if (typeof denominator === 'number' && Number.isFinite(denominator) && denominator > 0) {
      return { type, denominator: String(denominator) }
    }
  }
  return type ? { type, data: arbitration } : undefined
}

function settlementOutput(output: MarketplaceDriverPaymentTermOutput): PaymentSettlementOutput {
  return {
    ...(output.role ? { role: output.role } : {}),
    ...(output.id ? { pubkey: output.id } : {}),
    amount: output.amount.value,
    data: { amount: output.amount },
  }
}

function splitPath(path: MarketplaceDriverPaymentTermPath): { chunk: number; chunks: number } | undefined {
  const match = /^split-(\d+)-of-(\d+)$/.exec(path.id)
  if (!match) return undefined
  const chunk = Number.parseInt(match[1]!, 10)
  const chunks = Number.parseInt(match[2]!, 10)
  if (!Number.isSafeInteger(chunk) || !Number.isSafeInteger(chunks) || chunks <= 0 || chunk < 0 || chunk > chunks) {
    return undefined
  }
  return { chunk, chunks }
}

function collectSettlementOptions(
  lock: MarketplaceDriverPaymentTermLock,
  options: MarketplacePaymentTermSettlementOption[],
): void {
  const mode = settlementMode(lock)
  for (const path of lock.paths ?? []) {
    if (path.result.type === 'terminal' && mode) {
      options.push({
        lockId: lock.id,
        policyId: lock.policyId,
        pathId: path.id,
        mode,
        outputs: path.result.outputs.map(settlementOutput),
      })
    } else if (path.result.type === 'lock') {
      collectSettlementOptions(path.result.lock, options)
    }
  }
}

export function paymentTermSettlementOptions(
  terms: MarketplaceDriverPaymentTerms,
): MarketplacePaymentTermSettlementOption[] {
  const options: MarketplacePaymentTermSettlementOption[] = []
  collectSettlementOptions(terms.lock, options)
  return options
}

export function paymentTermSplitOptions(terms: MarketplaceDriverPaymentTerms): MarketplacePaymentTermSplitOption[] {
  return paymentTermSettlementOptions(terms)
    .map(option => {
      if (option.mode.type !== 'chunked' || !('chunks' in option.mode)) return undefined
      const split = splitPath({ id: option.pathId, result: { type: 'terminal', outputs: [] } })
      if (!split) return undefined
      if (split.chunks !== option.mode.chunks) return undefined
      return {
        ...option,
        mode: option.mode,
        chunk: split.chunk,
        chunks: split.chunks,
      }
    })
    .filter((option): option is MarketplacePaymentTermSplitOption => Boolean(option))
}

export const paymentTerms = {
  settlementOptions: paymentTermSettlementOptions,
  splitOptions: paymentTermSplitOptions,
}
