export interface UtilityDTO {
    id: string;
    title: string;
    type: 'ROOM' | 'DORM' | 'BED';
    isLiable: boolean;
    incurredPrice: number;
}

export interface GetUtilityDto {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'ROOM' | 'DORM' | 'BED';
}
