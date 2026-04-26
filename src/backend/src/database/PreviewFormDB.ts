import { PreviewForm } from '../business/PreviewForm';
import { DatabaseClient } from './DatabaseClient';

export class PreviewFormDB {
  private static MOCK_PREVIEWS: PreviewForm[] = [
    new PreviewForm({
      formId: "prev-1",
      roomId: "101",
      userId: "test@gmail.com",
      previewDatetime: new Date(Date.now() + 86400000).toISOString(),
      createdDatetime: new Date().toISOString(),
      status: "pending",
      staffId: "staff@gmail.com"
    }),
    new PreviewForm({
      formId: "prev-2",
      roomId: "301",
      userId: "test@gmail.com",
      previewDatetime: new Date(Date.now() + 86400000 * 2).toISOString(),
      createdDatetime: new Date().toISOString(),
      status: "approved",
      staffId: "staff2@gmail.com"
    }),
    new PreviewForm({
      formId: "prev-3",
      roomId: "102",
      userId: "test2@gmail.com",
      previewDatetime: new Date(Date.now() + 86400000 * 3).toISOString(),
      createdDatetime: new Date().toISOString(),
      status: "pending",
      staffId: null
    })
  ];

  private static mapRowToPreviewForm(row: any): PreviewForm {
    let mappedStatus = row.status || "pending";
    if (row.status === 'PENDING') mappedStatus = "pending";
    else if (row.status === 'CANCELLED' || row.status === 'CANCELLED') mappedStatus = "cancelled";
    else if (row.status === 'APPROVED') mappedStatus = "approved";
    else if (row.status === 'REJECTED') mappedStatus = "rejected";
    
    return new PreviewForm({
      formId: row.id,
      roomId: row.room_id,
      userId: row.user_email,
      previewDatetime: new Date(row.preview_date).toISOString(),
      createdDatetime: new Date(row.created_at).toISOString(),
      status: mappedStatus as any,
      staffId: row.staff_email
    });
  }

  static async getById(formId: string): Promise<PreviewForm | null> {
    const query = `
      SELECT
        id,
        user_email,
        room_id,
        preview_date,
        status,
        staff_email,
        created_at
      FROM preview_forms
      WHERE id = $1
    `;

    try {
      const result = await DatabaseClient.getInstance().query(query, [formId]);
      if (result.rows.length > 0) {
        return this.mapRowToPreviewForm(result.rows[0]);
      }
    } catch (e) {
      console.error("Database fetch failed:", e);
      return null;
    }

    return null;
  }

  static async insert(data: PreviewForm): Promise<boolean> {
    const query = `
      INSERT INTO preview_forms (user_email, room_id, preview_date, status, staff_email, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    try {
      const result = await DatabaseClient.getInstance().query(query, [
        data.userId,
        data.roomId,
        new Date(data.previewDatetime),
        data.status.toUpperCase(),
        data.staffId || null,
        new Date(data.createdDatetime)
      ]);
      
      if (result.rowCount !== 0) return true;
      else return false;

    } catch (e) {
      console.error("Database insert failed:", e);
      return false;
    }
  }

  static async getAll(): Promise<PreviewForm[]> {
    const query = `
      SELECT
        id,
        user_email,
        room_id,
        preview_date,
        status,
        staff_email,
        created_at
      FROM preview_forms
    `;

    try {
      const result = await DatabaseClient.getInstance().query(query);
      if (result.rows.length > 0) {
        return result.rows.map(this.mapRowToPreviewForm);
      }
    } catch (e) {
      console.error("Database fetch failed:", e);
      return [];
    }

    return [];
  }

  static async updateStatus(formId: string, status: string): Promise<boolean> {
    // Check existence first
    const isExist = await DatabaseClient.getInstance().query('SELECT 1 FROM preview_forms WHERE id = $1', [formId]);
    if (isExist.rows.length === 0) return false;

    const query = `
      UPDATE preview_forms
      SET status = $1
      WHERE id = $2
    `;

    try {
      const result = await DatabaseClient.getInstance().query(query, [status.toUpperCase(), formId]);
      return result.rowCount !== 0;
    } catch (e) {
      console.error("Database update failed:", e);
      return false;
    }
  }

  static async updateDatetime(formId: string, previewDatetime: string): Promise<boolean> {
    // Check existence first
    const isExist = await DatabaseClient.getInstance().query('SELECT 1 FROM preview_forms WHERE id = $1 AND status = $2', [formId, 'PENDING']);
    if (isExist.rows.length === 0) {
      console.warn(`Preview form with ID ${formId} does not exist or is not pending.`);
      return false;
    }

    const query = `
      UPDATE preview_forms
      SET preview_date = $1
      WHERE id = $2
    `;

    try {
      const result = await DatabaseClient.getInstance().query(query, [new Date(previewDatetime), formId]);
      return result.rowCount !== 0;
    } catch (e) {
      console.error("Database update failed:", e);
      return false;
    }
  }
}
