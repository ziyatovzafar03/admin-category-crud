
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  eventCode: string;
  username: string;
  chatId: number;
  status: 'CONFIRMED' | 'PENDING' | 'REJECTED';
}

export type CategoryStatus = 'OPEN' | 'DELETED' | 'ARCHIVED';

export interface Category {
  id: string;
  nameUz: string;
  nameUzCyrillic: string;
  nameRu: string;
  nameEn: string;
  orderIndex: number;
  status: CategoryStatus;
  chatId: number;
  parentId: string | null;
}

export interface CategoryRequest {
  nameUz: string;
  nameUzCyrillic: string;
  nameRu: string;
  nameEn: string;
  orderIndex: number;
  chatId?: number;
  parentId?: string | null;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}
