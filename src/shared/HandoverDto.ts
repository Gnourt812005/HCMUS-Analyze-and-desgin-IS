export type HandoverType = 'IN' | 'OUT';
export type EquipmentStatus = 'Tốt' | 'Hư hỏng' | 'Mất';

export interface HandoverBedDTO {
  bedId: string;
  bedNumber: string;
  bedStatus: EquipmentStatus;
  mattressStatus: EquipmentStatus;
  cabinetStatus: EquipmentStatus;
  keyStatus: EquipmentStatus;
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

export interface ActiveContractForHandoverDTO {
  contractId: string;
  contractCode: string | null;
  customerName: string;
  roomName: string;
  beds: { id: string; bedNumber: string }[];
}

export interface CreateHandoverBedDTO {
  bedId: string;
  bedStatus: EquipmentStatus;
  mattressStatus: EquipmentStatus;
  cabinetStatus: EquipmentStatus;
  keyStatus: EquipmentStatus;
}

export interface CreateHandoverDTO {
  contractId: string;
  type: HandoverType;
  beds: CreateHandoverBedDTO[];
  note: string;
}
