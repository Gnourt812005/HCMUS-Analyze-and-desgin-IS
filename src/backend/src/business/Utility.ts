import { UtilityDTO, GetUtilityDto, CreateUtilityDto } from '@dormarch/shared';
import { UtilityDB } from '../database/UtilityDB';

export class Utility {
    static async fetchAll(query: GetUtilityDto): Promise<{ utilities: UtilityDTO[], total: number }> {
        return await UtilityDB.fetchAll(query);
    }

    static async fetchById(id: string): Promise<UtilityDTO | null> {
        return await UtilityDB.fetchById(id);
    }

    static async create(data: CreateUtilityDto): Promise<UtilityDTO> {
        return await UtilityDB.create(data);
    }

    static async update(id: string, title: string): Promise<boolean> {
        return await UtilityDB.update(id, title);
    }

    static async delete(id: string): Promise<boolean> {
        const isAttached = await UtilityDB.isAttached(id);
        if (isAttached) {
            throw new Error('Không thể xóa tiện ích này vì đã được gán cho một số phòng hoặc cơ sở.');
        }
        return await UtilityDB.delete(id);
    }
}
