export type HandoverType = 'IN' | 'OUT';
export type EquipmentStatus = 'Tốt' | 'Hư hỏng' | 'Mất';

export interface HandoverUtilityStatusDTO {
  utilityId: string;
  title: string;
  status: EquipmentStatus;
}

export interface HandoverBedDTO {
  bedId: string;
  bedNumber: string;
  utilities: HandoverUtilityStatusDTO[];
}

export interface HandoverReportDTO {
  id: string;
  handoverCode: string | null;
  contractId: string;
  contractCode: string | null;
  customerName: string;
  roomName: string;
  type: HandoverType;
  createdAt: string;
  beds: HandoverBedDTO[];
  note: string;
}

export interface BedForHandoverDTO {
  id: string;
  bedNumber: string;
  utilities: { utilityId: string; title: string }[];
}

export interface ActiveContractForHandoverDTO {
  contractId: string;
  contractCode: string | null;
  customerName: string;
  roomName: string;
  beds: BedForHandoverDTO[];
}

export interface CreateHandoverBedDTO {
  bedId: string;
  utilities: {
    utilityId: string;
    title: string;
    status: EquipmentStatus;
  }[];
}

export interface CreateHandoverDTO {
  contractId: string;
  type: HandoverType;
  beds: CreateHandoverBedDTO[];
  note: string;
}
