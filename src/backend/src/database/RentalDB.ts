import { RentalRegistrationRequestDTO } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

export interface RoomBedOption {
  roomId: string;
  bedId: string;
  title: string;
  price: number;
  available: number;
}

export interface RentalRecord extends RentalRegistrationRequestDTO {
  registrationId: string;
  roomPrice: number;
  alreadyDeposited: boolean;
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
    const result = await dbClient.query(
      `SELECT COUNT(*)::int AS available_beds FROM beds WHERE room_id = $1 AND status = 'AVAILABLE'`,
      [roomId]
    );

    await dbClient.query(
      `UPDATE rooms SET available_beds = $1 WHERE id = $2`,
      [Number(result.rows[0]?.available_beds || 0), roomId]
    );
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

  static async hasDeposit(roomId: string, idCard: string, bedIds?: string[]): Promise<boolean> {
    const roomBeds = await this.getBedsByRoomId(roomId);
    const targetBeds = bedIds && bedIds.length > 0 ? bedIds : roomBeds.map((bed) => bed.id);

    if (targetBeds.length === 0) {
      return false;
    }

    const result = await dbClient.query(
      `
        SELECT 1
        FROM payments p
        JOIN rental_forms rf ON rf.id = p.rental_form_id
        JOIN rental_form_beds rfb ON rfb.rental_form_id = rf.id
        JOIN users u ON u.email = rf.user_email
        WHERE p.status = 'SUCCESS'
          AND rf.type = 'DEPOSIT'
          AND u.cccd = $1
          AND rfb.bed_id = ANY($2::uuid[])
        LIMIT 1
      `,
      [idCard, targetBeds]
    );

    return result.rows.length > 0;
  }

  static async listRoomBedsByDorm(dormId: string): Promise<RoomBedOption[]> {
    const query = `
      SELECT
        r.id AS room_id,
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
        title: `Phòng ${row.room_id} - Giường ${row.bed_number}`,
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

  static async markDeposited(roomId: string, idCard: string, bedIds: string[]): Promise<void> {
    await dbClient.query(
      `UPDATE beds SET status = 'DEPOSITED' WHERE room_id = $1 AND id = ANY($2::uuid[])`,
      [roomId, bedIds]
    );

    await this.syncRoomAvailableBeds(roomId);
  }

  static async markBooked(roomId: string, bedIds: string[]): Promise<void> {
    await dbClient.query(
      `UPDATE beds SET status = 'BOOKED' WHERE room_id = $1 AND id = ANY($2::uuid[])`,
      [roomId, bedIds]
    );

    await this.syncRoomAvailableBeds(roomId);
  }

  static async createRegistration(record: RentalRecord): Promise<void> {
    const userEmail = await this.resolveUserEmail(record.email, record.idCard);

    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');

      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + Math.max(1, Number(record.rentalMonths || 1)));

      await client.query(
        `
          INSERT INTO rental_forms (id, user_email, deadline, total_amount, type)
          VALUES ($1::uuid, $2, $3, $4, 'FULL')
        `,
        [record.registrationId, userEmail, deadline.toISOString(), record.roomPrice]
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
               rf.total_amount,
               u.cccd AS id_card,
               COALESCE(array_agg(rfb.bed_id::text ORDER BY rfb.bed_id::text), ARRAY[]::text[]) AS bed_ids,
               COALESCE(SUM(b.price), 0) AS room_price,
           (array_agg(b.room_id::text ORDER BY b.room_id::text))[1] AS room_id
        FROM rental_forms rf
        LEFT JOIN users u ON u.email = rf.user_email
        LEFT JOIN rental_form_beds rfb ON rfb.rental_form_id = rf.id
        LEFT JOIN beds b ON b.id = rfb.bed_id
        WHERE rf.id = $1::uuid
        GROUP BY rf.id, rf.user_email, rf.deadline, rf.total_amount, u.cccd
      `,
      [registrationId]
    );

    if (formResult.rows.length === 0) {
      return null;
    }

    const row = formResult.rows[0];
    const bedIds: string[] = row.bed_ids || [];
    const roomId: string = row.room_id || '';

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
      customerName: '',
      idCard: row.id_card || '',
      phone: '',
      email: row.user_email || '',
      rentalMonths: 1,
      acceptedConditions: true,
      services: [],
      roomPrice: Number(row.room_price || row.total_amount || 0),
      alreadyDeposited
    };
  }
}
