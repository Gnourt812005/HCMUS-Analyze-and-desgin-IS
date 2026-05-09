import { DatabaseClient } from './DatabaseClient';
import { DormFeeDTO, CreateDormFeeDTO, UpdateDormFeeDTO } from '@dormarch/shared';

const dbClient = DatabaseClient.getInstance();

export class DormFeeDB {
    static async fetchByDormId(dormId: string): Promise<DormFeeDTO | null> {
        const query = `
            SELECT dorm_id, water_fee, electricity_fee, wifi_fee, cleaning_fee
            FROM dorm_fees
            WHERE dorm_id = $1
        `;
        try {
            const result = await dbClient.query(query, [dormId]);
            if (result.rows.length === 0) return null;
            const row = result.rows[0];
            return {
                dormId: row.dorm_id,
                waterFee: Number(row.water_fee || 0),
                electricityFee: Number(row.electricity_fee || 0),
                wifiFee: Number(row.wifi_fee || 0),
                cleaningFee: Number(row.cleaning_fee || 0)
            };
        } catch (error) {
            console.error("Error in DormFeeDB.fetchByDormId:", error);
            return null;
        }
    }

    static async create(data: CreateDormFeeDTO): Promise<DormFeeDTO> {
        const query = `
            INSERT INTO dorm_fees (dorm_id, water_fee, electricity_fee, wifi_fee, cleaning_fee)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING dorm_id, water_fee, electricity_fee, wifi_fee, cleaning_fee
        `;
        const values = [data.dormId, data.waterFee, data.electricityFee, data.wifiFee, data.cleaningFee];
        const result = await dbClient.query(query, values);
        const row = result.rows[0];
        return {
            dormId: row.dorm_id,
            waterFee: Number(row.water_fee || 0),
            electricityFee: Number(row.electricity_fee || 0),
            wifiFee: Number(row.wifi_fee || 0),
            cleaningFee: Number(row.cleaning_fee || 0)
        };
    }

    static async update(dormId: string, data: UpdateDormFeeDTO): Promise<boolean> {
        const fields = [];
        const values = [];
        let counter = 1;

        if (data.waterFee !== undefined) { fields.push(`water_fee = $${counter++}`); values.push(data.waterFee); }
        if (data.electricityFee !== undefined) { fields.push(`electricity_fee = $${counter++}`); values.push(data.electricityFee); }
        if (data.wifiFee !== undefined) { fields.push(`wifi_fee = $${counter++}`); values.push(data.wifiFee); }
        if (data.cleaningFee !== undefined) { fields.push(`cleaning_fee = $${counter++}`); values.push(data.cleaningFee); }

        if (fields.length === 0) return false;

        values.push(dormId);
        const query = `UPDATE dorm_fees SET ${fields.join(', ')} WHERE dorm_id = $${counter}`;
        
        const result = await dbClient.query(query, values);
        return (result.rowCount ?? 0) > 0;
    }

    static async delete(dormId: string): Promise<boolean> {
        const query = `DELETE FROM dorm_fees WHERE dorm_id = $1`;
        const result = await dbClient.query(query, [dormId]);
        return (result.rowCount ?? 0) > 0;
    }
}
