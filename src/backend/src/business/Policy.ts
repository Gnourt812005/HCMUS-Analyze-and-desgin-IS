import { PolicyAgreementDTO, PolicyContentDTO } from '@dormarch/shared';
import { PolicyDB } from '../database/PolicyDB';

export class Policy {
  static async getLatestRegulations(dormId?: string): Promise<PolicyContentDTO> {
    if (dormId) {
      return PolicyDB.findPolicyByDormId(dormId);
    }
    return PolicyDB.findActivePolicy();
  }

  static async confirmAgreement(customerId: string): Promise<PolicyAgreementDTO> {
    if (!customerId) {
      throw new Error('Thiếu customerId để lưu xác nhận quy định.');
    }

    return PolicyDB.saveAgreement(customerId);
  }

  static async hasConfirmed(customerId: string): Promise<boolean> {
    return PolicyDB.hasAgreement(customerId);
  }
}
