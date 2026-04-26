import {
  ApiEnvelopeDTO,
  ConfirmPaymentDTO,
  ConfirmPaymentRequestDTO,
  CreatePaymentCodeRequestDTO,
  FinalizePaymentRequestDTO,
  PolicyAgreementDTO,
  PolicyAgreementRequestDTO,
  PolicyContentDTO,
  PaymentPreviewDTO,
  PaymentPreviewRequestDTO,
  PaymentSessionDTO,
  RentalConditionDTO,
  RentalEligibilityDTO,
  RentalEligibilityRequestDTO,
  RentalRegistrationDTO,
  RentalRegistrationRequestDTO,
  RetryPaymentRequestDTO,
  VerifyPaymentRequestDTO
} from '@dormarch/shared';
import { ApiClient } from './ApiClient';

export class RentalService {
  static getLatestPolicy(dormId?: string): Promise<ApiEnvelopeDTO<PolicyContentDTO>> {
    const url = dormId ? `/rentals/policy/latest?dormId=${dormId}` : '/rentals/policy/latest';
    return ApiClient.get<ApiEnvelopeDTO<PolicyContentDTO>>(url);
  }

  static confirmPolicyAgreement(payload: PolicyAgreementRequestDTO): Promise<ApiEnvelopeDTO<PolicyAgreementDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<PolicyAgreementDTO>>('/rentals/policy/confirm', {
      body: JSON.stringify(payload)
    });
  }

  static getConditions(): Promise<ApiEnvelopeDTO<RentalConditionDTO[]>> {
    return ApiClient.get<ApiEnvelopeDTO<RentalConditionDTO[]>>('/rentals/conditions');
  }

  static checkEligibility(payload: RentalEligibilityRequestDTO): Promise<ApiEnvelopeDTO<RentalEligibilityDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<RentalEligibilityDTO>>('/rentals/eligibility-check', {
      body: JSON.stringify(payload)
    });
  }

  static register(payload: RentalRegistrationRequestDTO): Promise<ApiEnvelopeDTO<RentalRegistrationDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<RentalRegistrationDTO>>('/rentals/register', {
      body: JSON.stringify(payload)
    });
  }

  static preview(payload: PaymentPreviewRequestDTO): Promise<ApiEnvelopeDTO<PaymentPreviewDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<PaymentPreviewDTO>>('/rentals/payment-preview', {
      body: JSON.stringify(payload)
    });
  }

  static confirm(payload: ConfirmPaymentRequestDTO): Promise<ApiEnvelopeDTO<ConfirmPaymentDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<ConfirmPaymentDTO>>('/payments/confirm', {
      body: JSON.stringify(payload)
    });
  }

  static createPaymentCode(payload: CreatePaymentCodeRequestDTO): Promise<ApiEnvelopeDTO<PaymentSessionDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<PaymentSessionDTO>>('/payments/create-code', {
      body: JSON.stringify(payload)
    });
  }

  static verifyPayment(payload: VerifyPaymentRequestDTO): Promise<ApiEnvelopeDTO<PaymentSessionDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<PaymentSessionDTO>>('/payments/verify', {
      body: JSON.stringify(payload)
    });
  }

  static getPaymentStatus(sessionId: string): Promise<ApiEnvelopeDTO<PaymentSessionDTO>> {
    return ApiClient.get<ApiEnvelopeDTO<PaymentSessionDTO>>(`/payments/${sessionId}/status`);
  }

  static retryPayment(payload: RetryPaymentRequestDTO): Promise<ApiEnvelopeDTO<PaymentSessionDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<PaymentSessionDTO>>('/payments/retry', {
      body: JSON.stringify(payload)
    });
  }

  static finalizePayment(payload: FinalizePaymentRequestDTO): Promise<ApiEnvelopeDTO<PaymentSessionDTO>> {
    return ApiClient.post<ApiEnvelopeDTO<PaymentSessionDTO>>('/payments/finalize', {
      body: JSON.stringify(payload)
    });
  }
}
