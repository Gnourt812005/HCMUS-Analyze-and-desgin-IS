export class PreviewFormUser {
  userId: string;
  previewFormId: string;

  constructor(userId: string, previewFormId: string) {
    this.userId = userId;
    this.previewFormId = previewFormId;
  }
}

export class PreviewForm_UserDB {
  private static MOCK_RECORDS: PreviewFormUser[] = [
    new PreviewFormUser('test@gmail.com', 'prev-1'),
    new PreviewFormUser('test@gmail.com', 'prev-2'),
    new PreviewFormUser('test2@gmail.com', 'prev-3'),
  ];

  static async getFormsByUserId(userId: string): Promise<string[]> {
    return this.MOCK_RECORDS.filter(r => r.userId === userId).map(r => r.previewFormId);
  }

  static async insert(userId: string, previewFormId: string): Promise<boolean> {
    this.MOCK_RECORDS.push(new PreviewFormUser(userId, previewFormId));
    return true;
  }
}

