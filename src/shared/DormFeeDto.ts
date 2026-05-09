export interface DormFeeDTO {
  dormId: string;
  waterFee: number;
  electricityFee: number;
  wifiFee: number;
  cleaningFee: number;
}

export interface CreateDormFeeDTO extends DormFeeDTO {}

export interface UpdateDormFeeDTO extends Partial<Omit<DormFeeDTO, 'dormId'>> {}
