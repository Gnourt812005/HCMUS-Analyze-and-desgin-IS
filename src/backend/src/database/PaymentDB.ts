import { PaymentAction, PaymentMethod, PaymentSessionDTO, PaymentSessionStatus } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

export interface PaymentInvoice {
  invoiceId: string;
  registrationId: string;
  amount: number;
  action: PaymentAction;
  createdAt: string;
}

export class PaymentDB {
  private static INVOICES: PaymentInvoice[] = [];
  private static SESSIONS: PaymentSessionDTO[] = [];

  private static mapActionToRentalType(action: PaymentAction): 'DEPOSIT' | 'FULL' {
    return action === 'DEPOSIT' ? 'DEPOSIT' : 'FULL';
  }

  static async createInvoice(registrationId: string, amount: number, action: PaymentAction): Promise<string> {
    const method: 'QR' | 'TRANSFER' = action === 'DEPOSIT' ? 'QR' : 'TRANSFER';
    const result = await dbClient.query(
      `
        INSERT INTO payments (rental_form_id, method, amount, status)
        VALUES ($1::uuid, $2::payment_method_type, $3, 'SUCCESS')
        RETURNING id, created_at
      `,
      [registrationId, method, amount]
    );

    const invoiceId = result.rows[0].id;
    this.INVOICES.push({
      invoiceId,
      registrationId,
      amount,
      action,
      createdAt: result.rows[0].created_at || new Date().toISOString()
    });
    return invoiceId;
  }

  static async createSession(registrationId: string, action: PaymentAction, method: PaymentMethod): Promise<PaymentSessionDTO> {
    const now = Date.now();
    const session: PaymentSessionDTO = {
      sessionId: `PAY-${now}`,
      registrationId,
      action,
      method,
      status: 'QR_READY',
      qrCode: `QR-${registrationId}-${now}`,
      expiresAt: new Date(now + 5 * 60 * 1000).toISOString()
    };

    this.SESSIONS.push(session);
    return session;
  }

  static async getSession(sessionId: string): Promise<PaymentSessionDTO | null> {
    const found = this.SESSIONS.find(item => item.sessionId === sessionId);
    return found || null;
  }

  static async updateSessionStatus(sessionId: string, status: PaymentSessionStatus, message?: string): Promise<PaymentSessionDTO> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Không tìm thấy phiên thanh toán.');
    }

    session.status = status;
    session.message = message;
    return session;
  }

  static async regenerateSession(sessionId: string): Promise<PaymentSessionDTO> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Không tìm thấy phiên thanh toán để thử lại.');
    }

    const now = Date.now();
    session.status = 'QR_READY';
    session.qrCode = `QR-${session.registrationId}-${now}`;
    session.expiresAt = new Date(now + 5 * 60 * 1000).toISOString();
    session.message = undefined;
    return session;
  }

  static async attachInvoice(sessionId: string, invoiceId: string): Promise<PaymentSessionDTO> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Không tìm thấy phiên thanh toán để cập nhật hóa đơn.');
    }

    session.invoiceId = invoiceId;
    return session;
  }
}
