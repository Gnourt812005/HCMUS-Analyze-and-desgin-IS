import { PreviewForm } from '../business/PreviewForm';

export class PreviewFormDB {
  private static MOCK_PREVIEWS: PreviewForm[] = [
    new PreviewForm({
      formId: "prev-1",
      roomId: "101",
      userId: "test@gmail.com",
      previewDatetime: new Date(Date.now() + 86400000).toISOString(),
      createdDatetime: new Date().toISOString(),
      status: "ongoing",
      staffId: "staff@gmail.com"
    }),
    new PreviewForm({
      formId: "prev-2",
      roomId: "301",
      userId: "test@gmail.com",
      previewDatetime: new Date(Date.now() + 86400000 * 2).toISOString(),
      createdDatetime: new Date().toISOString(),
      status: "complete",
      staffId: "staff2@gmail.com"
    }),
    new PreviewForm({
      formId: "prev-3",
      roomId: "102",
      userId: "test2@gmail.com",
      previewDatetime: new Date(Date.now() + 86400000 * 3).toISOString(),
      createdDatetime: new Date().toISOString(),
      status: "ongoing",
      staffId: null
    })
  ];

  static async getById(formId: string): Promise<PreviewForm | null> {
    return this.MOCK_PREVIEWS.find(f => f.formId === formId) || null;
  }

  static async insert(data: PreviewForm): Promise<boolean> {
    this.MOCK_PREVIEWS.push(data);
    return true;
  }

  static async getAll(): Promise<PreviewForm[]> {
    return this.MOCK_PREVIEWS;
  }

  static async updateStatus(formId: string, status: string): Promise<boolean> {
    const form = this.MOCK_PREVIEWS.find(f => f.formId === formId);
    if (!form) return false;
    form.status = status as any;
    return true;
  }
}
