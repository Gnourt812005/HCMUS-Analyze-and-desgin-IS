import { dbClient } from './DatabaseClient';

export interface OrderRecord {
  id: string;
  userEmail: string;
  dormName: string;
  roomName: string;
  bedNumbers: string[];
  totalAmount: number;
  type: 'DEPOSIT' | 'FULL';
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  createdAt: string;
  hasFullPayment?: boolean;
}

export class OrderDB {
  static async getOrdersByUser(email: string): Promise<OrderRecord[]> {
    const query = `
      SELECT 
        rf.id,
        rf.user_email,
        d.name as dorm_name,
        r.name as room_name,
        array_agg(b.bed_number) as bed_numbers,
        rf.total_amount,
        rf.type,
        COALESCE(p.status, 'PENDING') as payment_status,
        rf.created_at,
        EXISTS (
          SELECT 1 FROM rental_forms rf2
          JOIN rental_form_beds rfb2 ON rf2.id = rfb2.rental_form_id
          JOIN payments p2 ON p2.rental_form_id = rf2.id
          WHERE rf2.user_email = rf.user_email
            AND rf2.type = 'FULL'
            AND p2.status = 'SUCCESS'
            AND rfb2.bed_id IN (
              SELECT bed_id FROM rental_form_beds rfb3 WHERE rfb3.rental_form_id = rf.id
            )
        ) as has_full_payment
      FROM rental_forms rf
      JOIN rental_form_beds rfb ON rf.id = rfb.rental_form_id
      JOIN beds b ON rfb.bed_id = b.id
      JOIN rooms r ON b.room_id = r.id
      JOIN dorms d ON r.dorm_id = d.id
      LEFT JOIN payments p ON p.rental_form_id = rf.id
      WHERE rf.user_email = $1
      GROUP BY rf.id, rf.user_email, d.name, r.name, rf.total_amount, rf.type, p.status, rf.created_at
      ORDER BY rf.created_at DESC
    `;

    try {
      const result = await dbClient.query(query, [email]);
      return result.rows.map((row: any) => ({
        id: row.id,
        userEmail: row.user_email,
        dormName: row.dorm_name,
        roomName: row.room_name,
        bedNumbers: row.bed_numbers,
        totalAmount: Number(row.total_amount),
        type: row.type,
        paymentStatus: row.payment_status,
        createdAt: row.createdAt || row.created_at,
        hasFullPayment: row.has_full_payment
      }));
    } catch (error) {
      console.error('Error fetching orders by user:', error);
      return [];
    }
  }

  static async getAllOrders(): Promise<OrderRecord[]> {
    const query = `
      SELECT 
        rf.id,
        rf.user_email,
        d.name as dorm_name,
        r.name as room_name,
        array_agg(b.bed_number) as bed_numbers,
        rf.total_amount,
        rf.type,
        COALESCE(p.status, 'PENDING') as payment_status,
        rf.created_at
      FROM rental_forms rf
      JOIN rental_form_beds rfb ON rf.id = rfb.rental_form_id
      JOIN beds b ON rfb.bed_id = b.id
      JOIN rooms r ON b.room_id = r.id
      JOIN dorms d ON r.dorm_id = d.id
      LEFT JOIN payments p ON p.rental_form_id = rf.id
      GROUP BY rf.id, rf.user_email, d.name, r.name, rf.total_amount, rf.type, p.status, rf.created_at
      ORDER BY rf.created_at DESC
    `;

    try {
      const result = await dbClient.query(query);
      return result.rows.map((row: any) => ({
        id: row.id,
        userEmail: row.user_email,
        dormName: row.dorm_name,
        roomName: row.room_name,
        bedNumbers: row.bed_numbers,
        totalAmount: Number(row.total_amount),
        type: row.type,
        paymentStatus: row.payment_status,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }
}
