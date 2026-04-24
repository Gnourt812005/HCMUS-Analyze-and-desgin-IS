import { DatabaseClient } from './DatabaseClient';
import { UtilityDTO, GetUtilityDto } from '@dormarch/shared';

const dbClient = DatabaseClient.getInstance();

export class UtilityDB {
    static async fetchAll(query: GetUtilityDto): Promise<{ utilities: UtilityDTO[], total: number }> {
        const { page = 1, limit = 100, search, type } = query;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        const values: any[] = [];
        let counter = 1;

        if (search) {
            whereClause += ` AND title ILIKE $${counter++}`;
            values.push(`%${search}%`);
        }
        
        if (type) {
            whereClause += ` AND type = $${counter++}`;
            values.push(type);
        }

        const listQuery = `
            SELECT id, title, type, is_liable, incurred_price
            FROM utilities
            ${whereClause}
            ORDER BY title ASC
            LIMIT $${counter++} OFFSET $${counter++}
        `;

        const countQuery = `SELECT COUNT(*) FROM utilities ${whereClause}`;

        try {
            const listResult = await dbClient.query(listQuery, [...values, limit, offset]);
            const countResult = await dbClient.query(countQuery, values);

            const utilities = listResult.rows.map((row: any) => ({
                id: row.id,
                title: row.title,
                type: row.type,
                isLiable: row.is_liable,
                incurredPrice: Number(row.incurred_price || 0)
            }));

            return {
                utilities,
                total: parseInt(countResult.rows[0].count)
            };
        } catch (error) {
            console.error("Error in UtilityDB.fetchAll:", error);
            return { utilities: [], total: 0 };
        }
    }

    static async fetchById(id: string): Promise<UtilityDTO | null> {
        const query = `SELECT id, title, type, is_liable, incurred_price FROM utilities WHERE id = $1`;
        try {
            const result = await dbClient.query(query, [id]);
            if (result.rows.length === 0) return null;
            const row = result.rows[0];
            return {
                id: row.id,
                title: row.title,
                type: row.type,
                isLiable: row.is_liable,
                incurredPrice: Number(row.incurred_price || 0)
            };
        } catch (error) {
            console.error("Error in UtilityDB.fetchById:", error);
            return null;
        }
    }
}
