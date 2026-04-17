export interface PreviewFormDTO {
  roomName: string;
  block: string;
  wantedPreviewDate: string;
  wantedPreviewTime: string;
}

export interface ReschedulePreviewFormDTO {
  currentPreviewDate: string;
  currentPreviewTime: string;
  wantedPreviewDate: string;
  wantedPreviewTime: string;
}

export interface PreviewBriefDTO {
  id: string;
  roomName: string;
  dormName: string;
  previewDate: string;
  previewTime: string;
  dormAddress: string;
  status: string;
}

export interface PreviewDetailDTO {
  id: string;
  roomId: string;
  roomName: string;
  dormId: string;
  dormName: string;
  dormAddress: string;
  date: string;
  time: string;
  salesStaff: {
    name: string;
    phone: string;
  } | null;
  createdAt: Date;
}

export interface ClientPreviewDetailDTO {
  id: string;
  roomId: string;
  roomName: string;
  dormId: string;
  dormName: string;
  dormAddress: string;
  date: string;
  time: string;
  customerInfo: {
    name: string;
    phone: string;
  } | null;
  createdAt: Date;
}