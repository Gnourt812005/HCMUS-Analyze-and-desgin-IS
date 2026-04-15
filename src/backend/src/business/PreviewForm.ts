export class PreviewForm {
  formId: string;
  roomId: string;
  userId: string;
  previewDatetime: string;
  createdDatetime: string;
  status: 'complete' | 'canceled' | 'ongoing';
  staffId: string | null;

  constructor(data: Partial<PreviewForm>) {
    this.formId = data.formId || '';
    this.roomId = data.roomId || '';
    this.userId = data.userId || '';
    this.previewDatetime = data.previewDatetime || '';
    this.createdDatetime = data.createdDatetime || new Date().toISOString();
    this.status = data.status || 'ongoing';
    this.staffId = data.staffId || null;
  }
}
