import { DormFeeDTO, UpdateDormFeeDTO } from '@dormarch/shared';
import { DormFeeDB } from '../database/DormFeeDB';

export class DormFee {
    dormId: string;
    waterFee: number;
    electricityFee: number;
    wifiFee: number;
    cleaningFee: number;

    constructor(data: DormFeeDTO) {
        this.dormId = data.dormId;
        this.waterFee = data.waterFee;
        this.electricityFee = data.electricityFee;
        this.wifiFee = data.wifiFee;
        this.cleaningFee = data.cleaningFee;
    }

    toDTO(): DormFeeDTO {
        return {
            dormId: this.dormId,
            waterFee: this.waterFee,
            electricityFee: this.electricityFee,
            wifiFee: this.wifiFee,
            cleaningFee: this.cleaningFee
        };
    }

    static async getByDormId(dormId: string): Promise<DormFee | null> {
        const data = await DormFeeDB.fetchByDormId(dormId);
        if (!data) return null;
        return new DormFee(data);
    }

    static async update(dormId: string, data: UpdateDormFeeDTO): Promise<boolean> {
        // Check if all new values are positive
        if (data.waterFee !== undefined && data.waterFee < 0) throw new Error('Tiền nước không được âm');
        if (data.electricityFee !== undefined && data.electricityFee < 0) throw new Error('Tiền điện không được âm');
        if (data.wifiFee !== undefined && data.wifiFee < 0) throw new Error('Tiền wifi không được âm');
        if (data.cleaningFee !== undefined && data.cleaningFee < 0) throw new Error('Tiền vệ sinh không được âm');

        return await DormFeeDB.update(dormId, data);
    }
}
