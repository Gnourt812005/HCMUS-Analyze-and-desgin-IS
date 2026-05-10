import { RentalRegistrationRequestDTO } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';
import { RoomDB } from './RoomDB';

export interface RoomBedOption {
  roomId: string;
  bedId: string;
  title: string;
  price: number;
  available: number;
}

export interface RentalRecord extends Omit<RentalRegistrationRequestDTO, 'action'> {
  registrationId: string;
  roomPrice: number;
  alreadyDeposited: boolean;
  action?: RentalRegistrationRequestDTO['action'];
}

export class RentalDB {
  private static async getBedsByRoomId(roomId: string): Promise<Array<{ id: string; roomId: string; bedNumber: string; status: string; price: number }>> {
    const query = `
      SELECT id, room_id, bed_number, status, price
      FROM beds
      WHERE room_id = $1
      ORDER BY bed_number ASC
    `;

    const result = await dbClient.query(query, [roomId]);
    return result.rows.map((row: any) => ({
      id: row.id,
      roomId: row.room_id,
      bedNumber: row.bed_number,
      status: row.status,
      price: Number(row.price || 0)
    }));
  }

  private static async syncRoomAvailableBeds(roomId: string): Promise<void> {
    await RoomDB.syncRoomAvailability(roomId);
  }

  private static async resolveUserEmail(email: string, idCard: string): Promise<string | null> {
    if (idCard) {
      const byCccd = await dbClient.query(
        `SELECT email FROM users WHERE cccd = $1 LIMIT 1`,
        [idCard]
      );
      if (byCccd.rows.length > 0) {
        return byCccd.rows[0].email;
      }
    }

    if (email) {
      const byEmail = await dbClient.query(
        `SELECT email FROM users WHERE email = $1 LIMIT 1`,
        [email]
      );
      if (byEmail.rows.length > 0) {
        return byEmail.rows[0].email;
      }
    }

    return null;
  }

  static async hasDeposit(roomId: string, idCard: string, bedIds?: string[]): Promise<{ alreadyDeposited: boolean, registrationId?: string }> {
    // We check if the user has ANY successful deposit for ANY bed in this room
    const result = await dbClient.query(
      `
        SELECT rf.id
        FROM payments p
        JOIN rental_forms rf ON rf.id = p.rental_form_id
        JOIN rental_form_beds rfb ON rfb.rental_form_id = rf.id
        JOIN beds b ON b.id = rfb.bed_id
        JOIN users u ON u.email = rf.user_email
        WHERE p.status = 'SUCCESS'
          AND rf.type = 'DEPOSIT'
          AND u.cccd = $1
          AND b.room_id = $2
          AND rf.created_at >= NOW() - INTERVAL '24 hours'
          AND NOT EXISTS (
            SELECT 1 FROM rental_forms rf2
            JOIN rental_form_beds rfb2 ON rfb2.rental_form_id = rf2.id
            WHERE rf2.user_email = rf.user_email
              AND rf2.type = 'FULL'
              AND rfb2.bed_id = b.id
          )
        LIMIT 1
      `,
      [idCard, roomId]
    );
    return {
      alreadyDeposited: result.rows.length > 0,
      registrationId: result.rows[0]?.id
    };
  }

  static async getDepositedRoomMap(idCard: string): Promise<Map<string, string>> {
    const result = await dbClient.query(
      `
        SELECT DISTINCT b.room_id, rf.id as registration_id
        FROM payments p
        JOIN rental_forms rf ON rf.id = p.rental_form_id
        JOIN rental_form_beds rfb ON rfb.rental_form_id = rf.id
        JOIN beds b ON b.id = rfb.bed_id
        JOIN users u ON u.email = rf.user_email
        WHERE p.status = 'SUCCESS'
          AND rf.type = 'DEPOSIT'
          AND u.cccd = $1
          AND rf.created_at >= NOW() - INTERVAL '24 hours'
          AND NOT EXISTS (
            SELECT 1 FROM rental_forms rf2
            JOIN rental_form_beds rfb2 ON rfb2.rental_form_id = rf2.id
            WHERE rf2.user_email = rf.user_email
              AND rf2.type = 'FULL'
              AND rfb2.bed_id = b.id
          )
      `,
      [idCard]
    );
    const map = new Map<string, string>();
    result.rows.forEach((row: any) => {
      map.set(row.room_id, row.registration_id);
    });
    return map;
  }

  static async getDepositedRoomIds(idCard: string): Promise<string[]> {
    const map = await this.getDepositedRoomMap(idCard);
    return Array.from(map.keys());
  }

  static async listRoomBedsByDorm(dormId: string): Promise<RoomBedOption[]> {
    const query = `
      SELECT
        r.id AS room_id,
        r.name AS room_name,
        b.id AS bed_id,
        b.bed_number,
        b.status,
        b.price
      FROM rooms r
      JOIN beds b ON b.room_id = r.id
      WHERE r.dorm_id = $1
      ORDER BY r.name ASC, b.bed_number ASC
    `;

    const result = await dbClient.query(query, [dormId]);

    return result.rows.map((row: any) => {
      return {
        roomId: row.room_id,
        bedId: row.bed_id,
        title: `Phòng ${row.room_name} - Giường ${row.bed_number}`,
        price: Number(row.price || 0),
        available: row.status === 'AVAILABLE' ? 1 : 0
      };
    });
  }

  static async areBedsAvailable(roomId: string, bedIds: string[]): Promise<boolean> {
    if (bedIds.length === 0) return false;

    const query = `
      SELECT id, status
      FROM beds
      WHERE room_id = $1 AND id = ANY($2::uuid[])
    `;

    const result = await dbClient.query(query, [roomId, bedIds]);
    if (result.rows.length !== bedIds.length) return false;

    return result.rows.every((row: any) => row.status === 'AVAILABLE');
  }

  static async getBedsTotalPrice(roomId: string, bedIds: string[]): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(price), 0) AS total_price
      FROM beds
      WHERE room_id = $1 AND id = ANY($2::uuid[])
    `;

    const result = await dbClient.query(query, [roomId, bedIds]);
    return Number(result.rows[0]?.total_price || 0);
  }

  static async markDeposited(registrationId: string, roomId: string, bedIds: string[]): Promise<void> {
    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');
      
      // Update beds status
      await client.query(
        `UPDATE beds SET status = 'DEPOSITED' WHERE room_id = $1 AND id = ANY($2::uuid[])`,
        [roomId, bedIds]
      );

      // Update rental form type to DEPOSIT
      await client.query(
        `UPDATE rental_forms SET type = 'DEPOSIT' WHERE id = $1::uuid`,
        [registrationId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await this.syncRoomAvailableBeds(roomId);
  }

  static async markFullyPaid(registrationId: string, userEmail: string, roomPrice: number, bedIds: string[]): Promise<void> {
    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');
      
      const fullId = require('crypto').randomUUID();
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 1);

      // 1. Create a NEW record for FULL hire
      await client.query(
        `
          INSERT INTO rental_forms (id, user_email, deadline, total_amount, type)
          VALUES ($1::uuid, $2, $3, $4, 'FULL')
        `,
        [fullId, userEmail, deadline.toISOString(), roomPrice]
      );

      // 2. Link beds to the FULL record
      for (const bedId of bedIds) {
        await client.query(
          `INSERT INTO rental_form_beds (rental_form_id, bed_id) VALUES ($1::uuid, $2::uuid)`,
          [fullId, bedId]
        );
      }

      // 3. Create a successful payment record for the FULL form 
      // so it shows as SUCCESS in history immediately.
      // We link it to the same registration for reference.
      await client.query(
        `
          INSERT INTO payments (id, rental_form_id, amount, status, method, created_at)
          VALUES ($1::uuid, $2::uuid, $3, 'SUCCESS', 'TRANSFER', NOW())
        `,
        [require('crypto').randomUUID(), fullId, roomPrice]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async markBooked(roomId: string, bedIds: string[]): Promise<void> {
    await dbClient.query(
      `UPDATE beds SET status = 'BOOKED' WHERE room_id = $1 AND id = ANY($2::uuid[])`,
      [roomId, bedIds]
    );

    await this.syncRoomAvailableBeds(roomId);
  }

  static async createRegistration(record: RentalRecord, action: 'DEPOSIT' | 'FULL_PAYMENT'): Promise<void> {
    let userEmail = await this.resolveUserEmail(record.email, record.idCard);
    
    // If user not found in DB, we must create a guest entry so we can track them by CCCD later
    if (!userEmail) {
      await dbClient.query(
        `INSERT INTO users (email, full_name, phone, cccd, role) VALUES ($1, $2, $3, $4, 'GUEST') ON CONFLICT (email) DO NOTHING`,
        [record.email, record.customerName, record.phone, record.idCard]
      );
      userEmail = record.email;
    } else {
      // Ensure the CCCD is up to date for this user so searches by CCCD work
      await dbClient.query(
        `UPDATE users SET cccd = $1 WHERE email = $2 AND (cccd IS NULL OR cccd = '')`,
        [record.idCard, userEmail]
      );
    }

    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');

      const depositAmount = record.roomPrice * 2;
      // We always create the DEPOSIT record as the primary registration entry.
      // If action is FULL_PAYMENT, the payment logic will later call markFullyPaid 
      // which will create the second 'FULL' record.
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);

      await client.query(
        `
          INSERT INTO rental_forms (id, user_email, deadline, total_amount, type)
          VALUES ($1::uuid, $2, $3, $4, 'DEPOSIT')
        `,
        [record.registrationId, userEmail, deadline.toISOString(), depositAmount]
      );

      for (const bedId of record.bedIds) {
        await client.query(
          `INSERT INTO rental_form_beds (rental_form_id, bed_id) VALUES ($1::uuid, $2::uuid)`,
          [record.registrationId, bedId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getRegistration(registrationId: string): Promise<RentalRecord | null> {
    const formResult = await dbClient.query(
      `
        SELECT rf.id,
               rf.user_email,
               rf.deadline,
               rf.created_at,
               rf.total_amount,
               u.cccd AS id_card,
               u.full_name AS customer_name,
               u.phone,
               u.email,
               COALESCE(array_agg(rfb.bed_id::text ORDER BY rfb.bed_id::text), ARRAY[]::text[]) AS bed_ids,
               COALESCE(SUM(b.price), 0) AS room_price,
               (array_agg(b.room_id::text ORDER BY b.room_id::text))[1] AS room_id
        FROM rental_forms rf
        LEFT JOIN users u ON u.email = rf.user_email
        LEFT JOIN rental_form_beds rfb ON rfb.rental_form_id = rf.id
        LEFT JOIN beds b ON b.id = rfb.bed_id
        WHERE rf.id = $1::uuid
        GROUP BY rf.id, rf.user_email, rf.deadline, rf.created_at, rf.total_amount, u.cccd, u.full_name, u.phone, u.email
      `,
      [registrationId]
    );

    if (formResult.rows.length === 0) {
      return null;
    }

    const row = formResult.rows[0];
    const bedIds: string[] = row.bed_ids || [];
    const roomId: string = row.room_id || '';

    // Calculate rental months from deadline and created_at
    const deadline = new Date(row.deadline);
    const createdAt = new Date(row.created_at);
    const rentalMonths = Math.max(1, 
      (deadline.getFullYear() - createdAt.getFullYear()) * 12 + (deadline.getMonth() - createdAt.getMonth())
    );

    let alreadyDeposited = false;
    if (row.user_email && bedIds.length > 0) {
      const depositResult = await dbClient.query(
        `
          SELECT 1
          FROM payments p
          JOIN rental_forms rf ON rf.id = p.rental_form_id
          JOIN rental_form_beds rfb ON rfb.rental_form_id = rf.id
          WHERE p.status = 'SUCCESS'
            AND rf.type = 'DEPOSIT'
            AND rf.user_email = $1
            AND rfb.bed_id = ANY($2::uuid[])
            AND rf.created_at >= NOW() - INTERVAL '24 hours'
          LIMIT 1
        `,
        [row.user_email, bedIds]
      );
      alreadyDeposited = depositResult.rows.length > 0;
    }

    return {
      registrationId: row.id,
      roomId,
      bedIds,
      customerName: row.customer_name || '',
      idCard: row.id_card || '',
      phone: row.phone || '',
      email: row.email || '',
      rentalMonths,
      acceptedConditions: true,
      services: [],
      roomPrice: Number(row.room_price),
      alreadyDeposited
    };
  }

  static async cleanupExpiredRentals(): Promise<number> {
    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');

      // 1. Find expired rental forms
      // - DEPOSIT: created_at < now - 24 hours AND no FULL record for same beds/user
      // - FULL: deadline < now
      const expiredFormsResult = await client.query(`
        SELECT rf.id, rf.type
        FROM rental_forms rf
        WHERE (rf.type = 'DEPOSIT' AND rf.created_at < NOW() - INTERVAL '24 hours'
               AND NOT EXISTS (
                 SELECT 1 
                 FROM rental_forms rf2
                 JOIN rental_form_beds rfb2 ON rf2.id = rfb2.rental_form_id
                 JOIN rental_form_beds rfb1 ON rf.id = rfb1.rental_form_id
                 WHERE rf2.type = 'FULL' 
                   AND rf2.user_email = rf.user_email
                   AND rfb2.bed_id = rfb1.bed_id
               ))
           OR (rf.type = 'FULL' AND rf.deadline < NOW())
      `);

      if (expiredFormsResult.rows.length === 0) {
        await client.query('COMMIT');
        return 0;
      }

      const expiredIds = expiredFormsResult.rows.map((r: any) => r.id);
      console.log(`[Cleanup] Found ${expiredIds.length} expired rentals: ${expiredIds.join(', ')}`);

      // 2. Find beds associated with these expired forms that are NOT already available
      const bedsToResetResult = await client.query(`
        SELECT DISTINCT b.id, b.room_id
        FROM rental_form_beds rfb
        JOIN beds b ON b.id = rfb.bed_id
        WHERE rfb.rental_form_id = ANY($1::uuid[])
          AND b.status IN ('DEPOSITED', 'BOOKED')
      `, [expiredIds]);

      if (bedsToResetResult.rows.length > 0) {
        const bedIds = bedsToResetResult.rows.map((r: any) => r.id);
        const roomIds = Array.from(new Set(bedsToResetResult.rows.map((r: any) => r.room_id)));

        console.log(`[Cleanup] Resetting ${bedIds.length} beds to AVAILABLE.`);

        // Update beds status
        await client.query(
          `UPDATE beds SET status = 'AVAILABLE' WHERE id = ANY($1::uuid[])`,
          [bedIds]
        );

        // Sync rooms/dorms availability
        for (const roomId of roomIds) {
          await RoomDB.syncRoomAvailability(roomId);
        }
      }

      await client.query('COMMIT');
      return expiredIds.length;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[Cleanup] Error during rental cleanup:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getBedsInfoByRentalFormId(rentalFormId: string): Promise<{ roomId: string; bedIds: string[] } | null> {
    try {
      const result = await dbClient.query(
        `SELECT 
          r.id as room_id,
          ARRAY_AGG(b.id) as bed_ids
         FROM rental_form_beds rfb
         JOIN beds b ON b.id = rfb.bed_id
         JOIN rooms r ON r.id = b.room_id
         WHERE rfb.rental_form_id = $1::uuid
         GROUP BY r.id`,
        [rentalFormId]
      );
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        roomId: row.room_id,
        bedIds: row.bed_ids || []
      };
    } catch (error) {
      console.error('Error fetching beds info by rental form:', error);
      return null;
    }
  }
  
  static async getActiveRentalFormsForCheckout(userEmail: string): Promise<any[]> {
    const sql = `
      SELECT
        rf.id as rental_form_id,
        rf.type,
        rf.total_amount,
        rf.deadline,
        c.id as contract_id,
        c.start_date,
        c.stay_duration,
        (SELECT full_name FROM users WHERE email = $1 LIMIT 1) as user_full_name,
        (SELECT d.name FROM rental_form_beds rfb JOIN beds b ON b.id = rfb.bed_id JOIN rooms r ON r.id = b.room_id JOIN dorms d ON d.id = r.dorm_id WHERE rfb.rental_form_id = rf.id LIMIT 1) as dorm_name,
        (SELECT r.name FROM rental_form_beds rfb JOIN beds b ON b.id = rfb.bed_id JOIN rooms r ON r.id = b.room_id WHERE rfb.rental_form_id = rf.id LIMIT 1) as room_name,
        (SELECT r.floor FROM rental_form_beds rfb JOIN beds b ON b.id = rfb.bed_id JOIN rooms r ON r.id = b.room_id WHERE rfb.rental_form_id = rf.id LIMIT 1) as floor,
        (SELECT STRING_AGG(b.bed_number, ', ') FROM rental_form_beds rfb JOIN beds b ON b.id = rfb.bed_id WHERE rfb.rental_form_id = rf.id) as bed_numbers
      FROM rental_forms rf
      LEFT JOIN contracts c ON c.rental_form_id = rf.id
      WHERE rf.user_email = $1
      AND NOT EXISTS (
        SELECT 1 FROM checkout_requests 
        WHERE refund_form_id = rf.id AND status IN ('PENDING', 'PROCESSING', 'LIQUIDATED')
      )
      ORDER BY rf.created_at DESC
    `;
    const result = await dbClient.query(sql, [userEmail]);
    return result.rows.map(this.mapRentalFormRow);
  }

  private static mapRentalFormRow(row: any): any {
    return {
      rentalFormId: row.rental_form_id,
      type: row.type,
      contractId: row.contract_id || undefined,
      startDate: row.start_date || undefined,
      stayDuration: row.stay_duration || undefined,
      dormName: row.dorm_name,
      roomName: row.room_name,
      floor: row.floor,
      bedNumbers: row.bed_numbers,
    };
  }

  static async getRentalFormById(rentalFormId: string): Promise<{ id: string; userEmail: string; type: 'DEPOSIT' | 'FULL'; totalAmount: number; contractId?: string | null } | null> {
    try {
      const result = await dbClient.query(
        `SELECT 
          rf.id, 
          rf.user_email, 
          rf.type, 
          rf.total_amount,
          c.id as contract_id
        FROM rental_forms rf
        LEFT JOIN contracts c ON c.rental_form_id = rf.id
        WHERE rf.id = $1::uuid`,
        [rentalFormId]
      );
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        userEmail: row.user_email,
        type: row.type as 'DEPOSIT' | 'FULL',
        totalAmount: row.total_amount,
        contractId: row.contract_id || null
      };
    } catch (error) {
      console.error('Error fetching rental form:', error);
      return null;
    }
  }
}
