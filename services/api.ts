
import { API_ENDPOINTS } from '../constants';
import { User, Category, CategoryRequest } from '../types';

export const apiService = {
  async findUserByChatId(chatId: string): Promise<User> {
    const response = await fetch(API_ENDPOINTS.USER_FIND(chatId));
    if (!response.ok) throw new Error('User not found or connection error');
    return response.json();
  },

  async getCategories(): Promise<Category[]> {
    const response = await fetch(API_ENDPOINTS.CATEGORY_LIST);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async addCategory(data: CategoryRequest): Promise<Category> {
    const response = await fetch(API_ENDPOINTS.CATEGORY_ADD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add category');
    return response.json();
  },

  async editCategory(id: string, data: Partial<CategoryRequest>): Promise<Category> {
    const response = await fetch(API_ENDPOINTS.CATEGORY_EDIT(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to edit category');
    return response.json();
  },

  async deleteCategory(id: string): Promise<string> {
    const response = await fetch(API_ENDPOINTS.CATEGORY_DELETE(id), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.text();
  }
};
