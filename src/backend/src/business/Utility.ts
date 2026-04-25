import { UtilityDTO, GetUtilityDto } from '@dormarch/shared';
import { UtilityDB } from '../database/UtilityDB';

export class Utility {
    static async fetchAll(query: GetUtilityDto): Promise<{ utilities: UtilityDTO[], total: number }> {
        return await UtilityDB.fetchAll(query);
    }

    static async fetchById(id: string): Promise<UtilityDTO | null> {
        return await UtilityDB.fetchById(id);
    }
}
