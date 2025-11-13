import type { MenuItem, NewsItem } from './types';

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchMenu = async (): Promise<MenuItem[]> => {
  const response = await fetch(`${API_BASE_URL}/menu`);
  if (!response.ok) {
    throw new Error('Failed to fetch menu');
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
  const response = await fetch(`${API_BASE_URL}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }
  return response.json();
};

export const updateMenuItem = async (id: number, item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
    method: 'DELETE',
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

export const createNewsItem = async (item: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt' | 'postedAt'>): Promise<NewsItem> => {
  const response = await fetch(`${API_BASE_URL}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error('Failed to create news item');
  }
  return response.json();
};

export const updateNewsItem = async (id: number, item: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt' | 'postedAt'>): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error('Failed to update news item');
  }
};

export const deleteNewsItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/news/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete news item');
  }
};
