import { PolicyAgreementDTO, PolicyContentDTO } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

export class PolicyDB {
  private static AGREEMENT_HISTORY = new Map<string, string>();

  static async findActivePolicy(): Promise<PolicyContentDTO> {
    const result = await dbClient.query(
      `
        SELECT id, title, content, created_at
        FROM policies
        WHERE is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
      `
    );

    if (result.rows.length === 0) {
      return {
        policyId: 'NO_POLICY',
        title: 'Chưa có quy định',
        content: 'Hệ thống chưa cấu hình quy định đang áp dụng.',
        updatedAt: new Date().toISOString()
      };
    }

    const row = result.rows[0];
    return {
      policyId: row.id,
      title: row.title,
      content: row.content,
      updatedAt: row.created_at
    };
  }

  static async saveAgreement(customerId: string): Promise<PolicyAgreementDTO> {
    await this.findActivePolicy();
    const agreedAt = new Date().toISOString();
    this.AGREEMENT_HISTORY.set(customerId, agreedAt);

    return {
      customerId,
      agreedAt
    };
  }

  static async hasAgreement(customerId: string): Promise<boolean> {
    return this.AGREEMENT_HISTORY.has(customerId);
  }
}
