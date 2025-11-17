import type { MenuItem, NewsItem, MenuCategory } from './types';

const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;

export const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${window.location.protocol}//${window.location.host}/uploads/${imagePath}`;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const fetchMenu = async (): Promise<MenuItem[]> => {
  const response = await fetch(`${API_BASE_URL}/menu`);
  if (!response.ok) {
    throw new Error('Failed to fetch menu');
  }
  return response.json();
};

export const fetchMenuCategories = async (): Promise<MenuCategory[]> => {
  const response = await fetch(`${API_BASE_URL}/menu-categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch menu categories');
  }
  return response.json();
};

export const fetchMenuItem = async (id: number): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/menu/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch menu item');
  }
  return response.json();
};

export const createMenuItem = async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> => {
  const formData = new FormData();
  formData.append('title', item.title);
  formData.append('price', item.price.toString());
  formData.append('calories', (item.calories || 0).toString());
  formData.append('description', item.description || '');
  formData.append('category', item.category);
  item.imageURLs.forEach((file) => {
    if (file instanceof File) {
      formData.append('images', file);
    }
  });

  const response = await fetch(`${API_BASE_URL}/admin/menu`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }
  return response.json();
};

export const updateMenuItem = async (id: number, item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const formData = new FormData();
  formData.append('title', item.title);
  formData.append('price', item.price.toString());
  formData.append('calories', (item.calories || 0).toString());
  formData.append('description', item.description || '');
  formData.append('category', item.category);
  const existingImages = item.imageURLs.filter(url => typeof url === 'string') as string[];
  formData.append('existingImages', JSON.stringify(existingImages));
  item.imageURLs.forEach((file) => {
    if (file instanceof File) {
      formData.append('images', file);
    }
  });

  const response = await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }
};

export const fetchNews = async (): Promise<NewsItem[]> => {
  const response = await fetch(`${API_BASE_URL}/news`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
};

export const fetchNewsItem = async (id: number): Promise<NewsItem> => {
  const response = await fetch(`${API_BASE_URL}/news/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news item');
  }
  return response.json();
};

export const createNewsItem = async (item: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsItem> => {
  const formData = new FormData();
  formData.append('title', item.title);
  formData.append('preview', item.preview || '');
  formData.append('description', item.description || '');
  formData.append('postedAt', item.postedAt);
  item.imageURLs.forEach((file) => {
    if (file instanceof File) {
      formData.append('images', file);
    }
  });

  const response = await fetch(`${API_BASE_URL}/admin/news`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to create news item');
  }
  return response.json();
};

export const updateNewsItem = async (id: number, item: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const formData = new FormData();
  formData.append('title', item.title);
  formData.append('preview', item.preview || '');
  formData.append('description', item.description || '');
  formData.append('postedAt', item.postedAt);
  const existingImages = item.imageURLs.filter(url => typeof url === 'string') as string[];
  formData.append('existingImages', JSON.stringify(existingImages));
  item.imageURLs.forEach((file) => {
    if (file instanceof File) {
      formData.append('images', file);
    }
  });

  const response = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to update news item');
  }
};

export const deleteNewsItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete news item');
  }
};

export const updateMenuCategorySortOrder = async (id: number, sortOrder: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/menu-categories/${id}/sort-order`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sort_order: sortOrder }),
  });
  if (!response.ok) {
    throw new Error('Failed to update category sort order');
  }
};
