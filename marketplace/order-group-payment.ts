import type { Event } from '../core.ts'
import { parseEventJson, type PaymentProofEvidence } from './helper.ts'
import type { ParsedOrder } from './order.ts'
import { reduceOrderGroup } from './order-group-core.ts'
import { resolveOrderGroupParticipants } from './order-group-resolution.ts'
import type {
  PaymentValidationContext,
  ParsedOrderGroup,
  ReduceOrderGroupOptions,
  ResolveAndValidateOrderGroupOptions,
  ValidateOrderGroupPaymentsOptions,
  ValidatedOrderGroup,
} from './order-group-types.ts'
import type {
  MarketplacePaymentValidationPolicy,
  MarketplacePaymentValidationRequest,
  MarketplacePaymentValidationResult,
} from './payment-validation.ts'

async function paymentValidationPolicy(
  policies: MarketplacePaymentValidationPolicy[],
  request: MarketplacePaymentValidationRequest,
): Promise<MarketplacePaymentValidationPolicy | undefined> {
  const method = request.proof.method
  if (!method) return undefined
  for (const policy of policies) {
    if (policy.method !== method && policy.method !== '*') continue
    try {
      if (policy.canValidate && !(await policy.canValidate(request))) continue
    } catch (_) {
      continue
    }
    return policy
  }
  return undefined
}

function stringParam(params: Record<string, unknown>, name: string): string | undefined {
  const value = params[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function numberParam(params: Record<string, unknown>, name: string): number | undefined {
  const value = params[name]
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined
}

function serviceParamsFrom(event: Event | string | undefined): Record<string, unknown> {
  if (!event) return {}
  try {
    const parsed = parseEventJson(event, 'escrowService')
    const content = JSON.parse(parsed.content) as Record<string, unknown>
    if (content.params && typeof content.params === 'object' && !Array.isArray(content.params)) {
      return content.params as Record<string, unknown>
    }
  } catch (_) {
    return {}
  }
  return {}
}

export function paymentValidationRequest(context: {
  group: ParsedOrderGroup
  order: ParsedOrder
  paymentProof: PaymentProofEvidence
  escrowService?: Event
  now?: number
}): MarketplacePaymentValidationRequest {
  const params = context.paymentProof.params
  const serviceParams = serviceParamsFrom(context.escrowService ?? context.group.payment?.content.proof.escrow?.escrowService)
  return {
    method: context.paymentProof.method,
    proof: context.paymentProof,
    expected: {
      settlementId: context.group.id,
      tradeId: context.group.tradeId,
      listingAnchor: context.group.listingAnchor,
      ...(context.order.content.amount ? { amount: context.order.content.amount } : {}),
      asset: {
        denomination: context.order.content.amount?.denomination,
        decimals: context.order.content.amount?.decimals,
        assetId: stringParam(params, 'assetId'),
      },
      contract: {
        type: typeof serviceParams.type === 'string' ? serviceParams.type : undefined,
        chainId: numberParam(params, 'chainId') ?? numberParam(serviceParams, 'chainId'),
        address: stringParam(params, 'contractAddress') ?? stringParam(serviceParams, 'contractAddress'),
        bytecodeHash: stringParam(params, 'contractBytecodeHash') ?? stringParam(serviceParams, 'contractBytecodeHash'),
        params: serviceParams,
      },
      participants: {
        buyer: {
          pubkey: context.group.buyerOrder?.event.pubkey,
          address: stringParam(params, 'buyerAddress'),
        },
        seller: {
          pubkey: context.group.sellerPubkey,
          address: stringParam(params, 'sellerAddress'),
        },
        escrow: {
          pubkey: context.group.escrowPubkeys[0],
          address: stringParam(params, 'arbiterAddress'),
        },
      },
      ...(stringParam(params, 'escrowFee')
        ? {
            fee: {
              value: stringParam(params, 'escrowFee')!,
              denomination: context.order.content.amount?.denomination ?? '',
              decimals: context.order.content.amount?.decimals ?? 0,
            },
          }
        : {}),
    },
    ...(context.now !== undefined ? { now: context.now } : {}),
  }
}

function groupWithPaymentValidation(
  group: ParsedOrderGroup,
  payment: MarketplacePaymentValidationResult,
  reduceOptions: ReduceOrderGroupOptions | undefined,
): ParsedOrderGroup {
  const validPaymentId = payment.status === 'valid' ? payment.proofEventId : undefined
  return reduceOrderGroup(group.events, {
    ...reduceOptions,
    isPaymentValid: (candidate, context) =>
      (validPaymentId !== undefined && candidate.event.id === validPaymentId) ||
      reduceOptions?.isPaymentValid?.(candidate, context) === true,
  })
}

function validatedOrderGroupResult(
  group: ParsedOrderGroup,
  payment: MarketplacePaymentValidationResult,
  options: ValidateOrderGroupPaymentsOptions,
): ValidatedOrderGroup {
  return {
    group: groupWithPaymentValidation(group, payment, options.reduceOptions),
    payment,
    ...(options.resolved ? { resolved: options.resolved } : {}),
  }
}

export async function validateOrderGroupPayments(
  group: ParsedOrderGroup,
  options: ValidateOrderGroupPaymentsOptions = {},
): Promise<ValidatedOrderGroup> {
  const buyerOrder = group.buyerOrder
  const order = buyerOrder ?? group.orders[0]
  const paymentEvent = group.payment
  const paymentProof = paymentEvent?.content.proof.paymentProof ?? undefined
  const method = paymentProof?.method ?? 'none'
  const context: PaymentValidationContext = {
    group,
    ...(options.resolved ? { resolved: options.resolved } : {}),
    ...(buyerOrder ? { buyerOrder } : {}),
    ...(paymentProof ? { paymentProof } : {}),
    ...(options.listing ?? paymentEvent?.content.proof.listing
      ? { listing: options.listing ?? paymentEvent?.content.proof.listing }
      : {}),
    ...(options.paymentMethod ? { paymentMethod: options.paymentMethod } : {}),
    ...(options.escrowService ? { escrowService: options.escrowService } : {}),
    ...(options.now !== undefined ? { now: options.now } : {}),
  }

  if (!order || !paymentEvent || !paymentProof) {
    const payment: MarketplacePaymentValidationResult = {
      method,
      status: 'unverifiable',
      ...(buyerOrder ? { orderEventId: buyerOrder.event.id } : {}),
      ...(paymentEvent ? { proofEventId: paymentEvent.event.id } : {}),
      error: 'No payment event to validate',
    }
    return validatedOrderGroupResult(group, payment, options)
  }

  const request = paymentValidationRequest({
    group,
    order,
    paymentProof,
    ...(context.escrowService ? { escrowService: context.escrowService } : {}),
    ...(context.now !== undefined ? { now: context.now } : {}),
  })
  const policy = await paymentValidationPolicy(options.policies ?? [], request)
  if (!policy) {
    const payment: MarketplacePaymentValidationResult = {
      method,
      status: 'unverifiable',
      orderEventId: buyerOrder?.event.id,
      proofEventId: paymentEvent.event.id,
      error: `No payment validation policy for method: ${method}`,
    }
    return validatedOrderGroupResult(group, payment, options)
  }

  let payment: MarketplacePaymentValidationResult
  try {
    const policyPayment = await policy.validatePayment(request)
    payment = {
      ...policyPayment,
      method: policyPayment.method ?? method,
      orderEventId: policyPayment.orderEventId ?? buyerOrder?.event.id,
      proofEventId: policyPayment.proofEventId ?? paymentEvent.event.id,
    }
  } catch (err) {
    payment = {
      method,
      status: 'unverifiable',
      orderEventId: buyerOrder?.event.id,
      proofEventId: paymentEvent.event.id,
      error: err instanceof Error ? err.message : 'Payment validation failed',
    }
  }

  return validatedOrderGroupResult(group, payment, options)
}

export async function resolveAndValidateOrderGroup(
  group: ParsedOrderGroup,
  options: ResolveAndValidateOrderGroupOptions = {},
): Promise<ValidatedOrderGroup> {
  const resolved = await resolveOrderGroupParticipants(group, options)
  return validateOrderGroupPayments(group, { ...options, resolved })
}
