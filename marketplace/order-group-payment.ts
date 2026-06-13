import type { Event } from '../core.ts'
import { amountCurrency, parseEventJson, type MarketplaceAmount, type PaymentProofEvidence } from './helper.ts'
import type { ParsedOrder } from './order.ts'
import type { ParsedPayment } from './payment-lifecycle.ts'
import { resolvePaymentAmount } from './payment-amount.ts'
import { paymentProofParamsDecryptor, resolvePaymentProof, resolvePaymentProofEvidence } from './payment-proof.ts'
import { reduceOrderGroup } from './order-group-core.ts'
import { resolveOrderGroupParticipants } from './order-group-resolution.ts'
import { validateMarketplaceOrder } from './order-validation.ts'
import type {
  PaymentValidationContext,
  ParsedOrderGroup,
  ReduceOrderGroupOptions,
  ResolveAndValidateOrderGroupOptions,
  ValidateOrderGroupPaymentsOptions,
  ValidatedOrderGroup,
} from './order-group-types.ts'
import type { MarketplaceOrderValidationResult } from './order-validation.ts'
import type {
  MarketplacePaymentValidationPolicy,
  MarketplacePaymentValidationRequest,
  MarketplacePaymentValidationResult,
} from './payment-validation.ts'
import {
  isPaymentValidationAccepted,
  normalizePaymentValidationResult,
} from './payment-validation.ts'
import { isMarketplaceDriverEncryptedPaymentProofParams } from '@sudonym-btc/marketplace-driver-interface'

async function paymentValidationPolicy(
  policies: MarketplacePaymentValidationPolicy[],
  request: MarketplacePaymentValidationRequest,
): Promise<MarketplacePaymentValidationPolicy | undefined> {
  const driver = request.proof.driver
  if (!driver) return undefined
  for (const policy of policies) {
    const policyDriver = policy.driver ?? policy.id ?? policy.method
    if (policyDriver !== driver && policyDriver !== '*') continue
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
    const parsed = parseEventJson(event, 'arbitrationService')
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
  payment: ParsedPayment
  amount: MarketplaceAmount
  paymentProof: PaymentProofEvidence
  decryptParams?: MarketplacePaymentValidationRequest['decryptParams']
  arbitrationService?: Event
  now?: number
}): MarketplacePaymentValidationRequest {
  const params = isMarketplaceDriverEncryptedPaymentProofParams(context.paymentProof.params)
    ? {}
    : context.paymentProof.params as Record<string, unknown>
  const serviceParams = serviceParamsFrom(context.arbitrationService ?? context.group.payment?.content.proof?.arbitration?.arbitrationService)
  return {
    driver: context.paymentProof.driver,
    proof: context.paymentProof,
    ...(context.decryptParams ? { decryptParams: context.decryptParams } : {}),
    expected: {
      settlementId: context.group.id,
      tradeId: context.group.tradeId,
      listingAnchor: context.group.listingAnchor,
      amount: context.amount,
      asset: {
        currency: amountCurrency(context.amount),
        denomination: context.amount.denomination,
        decimals: context.amount.decimals,
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
        arbiter: {
          pubkey: context.group.arbiterPubkeys[0],
          address: stringParam(params, 'arbiterAddress'),
        },
      },
      ...(stringParam(params, 'escrowFee')
        ? {
            fee: {
              value: stringParam(params, 'escrowFee')!,
              currency: amountCurrency(context.amount),
              denomination: context.amount.denomination,
              decimals: context.amount.decimals,
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
  const validPaymentId = isPaymentValidationAccepted(payment) ? payment.proofEventId : undefined
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
  order: MarketplaceOrderValidationResult | undefined,
  options: ValidateOrderGroupPaymentsOptions,
): ValidatedOrderGroup {
  return {
    group: groupWithPaymentValidation(group, payment, options.reduceOptions),
    payment,
    ...(order ? { order } : {}),
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
  let paymentProof = paymentEvent?.content.proof?.paymentProof ?? undefined
  let paymentProofResolutionError: string | undefined
  if (paymentEvent && !paymentProof && paymentEvent.content.sealedProof) {
    const proofResolution = await resolvePaymentProof(paymentEvent, {
      signer: options.signer,
      signerPubkey: options.signerPubkey,
    })
    if (proofResolution.status === 'resolved' && proofResolution.proof?.paymentProof) {
      paymentProof = proofResolution.proof.paymentProof
    } else {
      paymentProofResolutionError = proofResolution.error ?? 'Payment proof could not be resolved'
    }
  }
  const driver = paymentProof?.driver ?? 'none'
  const context: PaymentValidationContext = {
    group,
    ...(options.resolved ? { resolved: options.resolved } : {}),
    ...(buyerOrder ? { buyerOrder } : {}),
    ...(paymentProof ? { paymentProof } : {}),
    ...(options.listing ? { listing: options.listing } : {}),
    ...(options.paymentMethod ? { paymentMethod: options.paymentMethod } : {}),
    ...(options.arbitrationService ? { arbitrationService: options.arbitrationService } : {}),
    ...(options.signer ? { signer: options.signer } : {}),
    ...(options.signerPubkey ? { signerPubkey: options.signerPubkey } : {}),
    ...(options.now !== undefined ? { now: options.now } : {}),
  }

  if (!order || !paymentEvent || !paymentProof) {
    const payment: MarketplacePaymentValidationResult = {
      driver,
      status: 'unverifiable',
      ...(buyerOrder ? { orderEventId: buyerOrder.event.id } : {}),
      ...(paymentEvent ? { proofEventId: paymentEvent.event.id } : {}),
      error: paymentProofResolutionError ?? 'No payment event to validate',
    }
    const orderValidation = order
      ? validateMarketplaceOrder({
          order,
          payments: [payment],
          settlementId: group.id,
          tradeId: group.tradeId,
          ...(options.now !== undefined ? { now: options.now } : {}),
        })
      : undefined
    return validatedOrderGroupResult(group, payment, orderValidation, options)
  }

  const amountResolution = await resolvePaymentAmount(paymentEvent, {
    signer: context.signer,
    signerPubkey: context.signerPubkey,
  })
  if (amountResolution.status !== 'resolved' || !amountResolution.amount) {
    const payment: MarketplacePaymentValidationResult = {
      driver,
      status: 'unverifiable',
      orderEventId: buyerOrder?.event.id,
      proofEventId: paymentEvent.event.id,
      error: paymentProofResolutionError ?? amountResolution.error ?? 'Payment amount could not be resolved',
    }
    const orderValidation = validateMarketplaceOrder({
      order,
      payments: [payment],
      settlementId: group.id,
      tradeId: group.tradeId,
      ...(context.now !== undefined ? { now: context.now } : {}),
    })
    return validatedOrderGroupResult(group, payment, orderValidation, options)
  }

  const decryptParams = paymentProofParamsDecryptor({
    keys: paymentEvent.paymentProofKeys,
    signer: context.signer,
    signerPubkey: context.signerPubkey,
  })
  const proofResolution = await resolvePaymentProofEvidence(paymentProof, {
    keys: paymentEvent.paymentProofKeys,
    signer: context.signer,
    signerPubkey: context.signerPubkey,
  })
  if (proofResolution.status !== 'resolved' || !proofResolution.proof) {
    const payment: MarketplacePaymentValidationResult = {
      driver,
      status: 'unverifiable',
      orderEventId: buyerOrder?.event.id,
      proofEventId: paymentEvent.event.id,
      error: paymentProofResolutionError ?? proofResolution.error ?? 'Payment proof could not be resolved',
    }
    const orderValidation = validateMarketplaceOrder({
      order,
      payments: [payment],
      settlementId: group.id,
      tradeId: group.tradeId,
      ...(context.now !== undefined ? { now: context.now } : {}),
    })
    return validatedOrderGroupResult(group, payment, orderValidation, options)
  }
  const request = paymentValidationRequest({
    group,
    order,
    payment: paymentEvent,
    amount: amountResolution.amount,
    paymentProof: proofResolution.proof,
    decryptParams,
    ...(context.arbitrationService ? { arbitrationService: context.arbitrationService } : {}),
    ...(context.now !== undefined ? { now: context.now } : {}),
  })
  const policy = await paymentValidationPolicy(options.policies ?? [], request)
  if (!policy) {
    const payment: MarketplacePaymentValidationResult = {
      driver,
      status: 'unverifiable',
      orderEventId: buyerOrder?.event.id,
      proofEventId: paymentEvent.event.id,
      error: `No payment validation policy for driver: ${driver}`,
    }
    const orderValidation = validateMarketplaceOrder({
      order,
      payments: [payment],
      settlementId: group.id,
      tradeId: group.tradeId,
      ...(context.now !== undefined ? { now: context.now } : {}),
    })
    return validatedOrderGroupResult(group, payment, orderValidation, options)
  }

  let payment: MarketplacePaymentValidationResult
  try {
    const policyPayment = await policy.validatePayment(request)
    payment = normalizePaymentValidationResult({
      ...policyPayment,
      driver: policyPayment.driver ?? driver,
      orderEventId: policyPayment.orderEventId ?? buyerOrder?.event.id,
      proofEventId: policyPayment.proofEventId ?? paymentEvent.event.id,
    }, amountResolution.amount)
  } catch (err) {
    payment = {
      driver,
      status: 'unverifiable',
      orderEventId: buyerOrder?.event.id,
      proofEventId: paymentEvent.event.id,
      error: err instanceof Error ? err.message : 'Payment validation failed',
    }
  }

  const orderValidation = validateMarketplaceOrder({
    order,
    payments: [payment],
    settlementId: group.id,
    tradeId: group.tradeId,
    ...(context.now !== undefined ? { now: context.now } : {}),
  })
  return validatedOrderGroupResult(group, payment, orderValidation, options)
}

export async function resolveAndValidateOrderGroup(
  group: ParsedOrderGroup,
  options: ResolveAndValidateOrderGroupOptions = {},
): Promise<ValidatedOrderGroup> {
  const resolved = await resolveOrderGroupParticipants(group, options)
  return validateOrderGroupPayments(group, { ...options, resolved })
}
