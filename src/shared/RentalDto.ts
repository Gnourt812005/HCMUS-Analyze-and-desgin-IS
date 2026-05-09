export type PaymentAction = 'DEPOSIT' | 'FULL_PAYMENT';
export type PaymentMethod = 'BANK' | 'EWALLET';
export type PaymentVerificationOutcome = 'success' | 'timeout' | 'cancel';
export type PaymentSessionStatus = 'QR_READY' | 'VERIFYING' | 'TIMEOUT' | 'FAILED' | 'SUCCESS' | 'COMPLETED';

export interface ApiEnvelopeDTO<T> {
  message: string;
  status: number;
  data: T;
}

export interface RentalConditionDTO {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface PolicyContentDTO {
  policyId: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface PolicyAgreementRequestDTO {
  customerId: string;
}

export interface PolicyAgreementDTO {
  customerId: string;
  agreedAt: string;
}

export interface RentalEligibilityRequestDTO {
  roomId: string;
  bedIds: string[];
  idCard: string;
}

export interface RentalEligibilityDTO {
  eligible: boolean;
  reasons: string[];
  alreadyDeposited: boolean;
  lockBedSelection: boolean;
  existingRegistrationId?: string;
}

export interface ServiceItemDTO {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface RentalRegistrationRequestDTO {
  roomId: string;
  bedIds: string[];
  customerName: string;
  idCard: string;
  phone: string;
  email: string;
  rentalMonths: number;
  acceptedConditions: boolean;
  services: ServiceItemDTO[];
  action: PaymentAction;
}

export interface SummaryItemDTO {
  label: string;
  amount: number;
}

export interface RentalRegistrationDTO {
  registrationId: string;
  roomId: string;
  bedIds: string[];
  roomPrice: number;
  alreadyDeposited: boolean;
  summary: SummaryItemDTO[];
}

export interface BedOptionDTO {
  id: string;
  roomId: string;
  bedNumber: string;
  status: 'AVAILABLE' | 'DEPOSITED' | 'BOOKED';
  price: number;
}

export interface PaymentPreviewRequestDTO {
  registrationId: string;
  action: PaymentAction;
}

export interface PaymentPreviewDTO {
  registrationId: string;
  action: PaymentAction;
  items: SummaryItemDTO[];
  totalAmount: number;
}

export interface ConfirmPaymentRequestDTO {
  registrationId: string;
  action: PaymentAction;
  method: PaymentMethod;
}

export interface ConfirmPaymentDTO {
  success: boolean;
  invoiceId: string;
}

export interface CreatePaymentCodeRequestDTO {
  registrationId: string;
  action: PaymentAction;
  method: PaymentMethod;
}

export interface PaymentSessionDTO {
  sessionId: string;
  registrationId: string;
  action: PaymentAction;
  method: PaymentMethod;
  status: PaymentSessionStatus;
  qrCode: string;
  expiresAt: string;
  message?: string;
  invoiceId?: string;
}

export interface VerifyPaymentRequestDTO {
  sessionId: string;
  outcome?: PaymentVerificationOutcome;
}

export interface RetryPaymentRequestDTO {
  sessionId: string;
}

export interface FinalizePaymentRequestDTO {
  sessionId: string;
}
