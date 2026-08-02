export interface MenuItem {
  id: number;
  title: string;
  price: number;
  imageURLs: (string | File)[];
  calories?: number;
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: number;
  name_ru: string;
  name_en: string;
  sort_order: number;
  createdAt: string;
}

export interface NewsItem {
  id: number;
  title: string;
  preview?: string;
  description?: string;
  imageURLs: (string | File)[];
  createdAt: string;
  updatedAt: string;
  postedAt: string;
}
