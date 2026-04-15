export interface PreviewFormDTO {
  roomName: string;
  block: string;
  wantedPreviewDate: string;
  wantedPreviewTime: string;
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