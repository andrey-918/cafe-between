export interface MenuItem {
  id: number;
  title: string;
  price: number;
  imageURLs: string[];
  calories?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: number;
  title: string;
  description?: string;
  imageURLs?: string[];
  createdAt: string;
  updatedAt: string;
  postedAt: string;
}
