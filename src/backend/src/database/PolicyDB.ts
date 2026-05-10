import { PolicyAgreementDTO, PolicyContentDTO } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

export class PolicyDB {
  private static AGREEMENT_HISTORY = new Map<string, string>();

  static async findActivePolicy(): Promise<PolicyContentDTO> {
    const result = await dbClient.query(
      `
        SELECT p.id, p.title, p.content, p.created_at
        FROM policies p
        WHERE p.is_active = TRUE
          AND EXISTS (SELECT 1 FROM dorms d WHERE d.policy_id = p.id)
        ORDER BY p.created_at DESC
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

  static async findPolicyByDormId(dormId: string): Promise<PolicyContentDTO> {
    const result = await dbClient.query(
      `
        SELECT p.id, p.title, p.content, p.created_at
        FROM dorms d
        JOIN policies p ON d.policy_id = p.id
        WHERE d.id = $1
      `,
      [dormId]
    );

    if (result.rows.length === 0) {
      return this.findActivePolicy();
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
