import { PreviewForm } from '../business/PreviewForm';

export class PreviewFormDB {
  private static MOCK_PREVIEWS: PreviewForm[] = [
    new PreviewForm({
      formId: "prev-1",
      roomId: "101",
      userId: "test@gmail.com",
      previewDatetime: new Date(Date.now() + 86400000).toISOString(), // + 1 day
      createdDatetime: new Date().toISOString(),
      status: "ongoing",
      staffId: null
    })
  ];

  static async insert(data: PreviewForm): Promise<boolean> {
    this.MOCK_PREVIEWS.push(data);
    return true;
  }

  static async getAll(): Promise<PreviewForm[]> {
    return this.MOCK_PREVIEWS;
  }
}
