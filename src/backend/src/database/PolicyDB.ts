import { PolicyAgreementDTO, PolicyContentDTO } from '@dormarch/shared';

export class PolicyDB {
  private static ACTIVE_POLICY: PolicyContentDTO = {
    policyId: 'POLICY-2026-01',
    title: 'Quy định thuê phòng ký túc xá',
    content: 'Người thuê phải tuân thủ nội quy, thanh toán đúng hạn và bảo quản tài sản chung.',
    updatedAt: new Date().toISOString()
  };

  private static AGREEMENTS: PolicyAgreementDTO[] = [];

  static async findActivePolicy(): Promise<PolicyContentDTO> {
    return this.ACTIVE_POLICY;
  }

  static async saveAgreement(customerId: string): Promise<PolicyAgreementDTO> {
    const existing = this.AGREEMENTS.find(item => item.customerId === customerId);
    if (existing) {
      existing.agreedAt = new Date().toISOString();
      return existing;
    }

    const newAgreement: PolicyAgreementDTO = {
      customerId,
      agreedAt: new Date().toISOString()
    };

    this.AGREEMENTS.push(newAgreement);
    return newAgreement;
  }

  static async hasAgreement(customerId: string): Promise<boolean> {
    return this.AGREEMENTS.some(item => item.customerId === customerId);
  }
}
