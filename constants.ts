
export const BASE_URL = 'https://fe088c2035de.ngrok-free.app/api';

export const API_ENDPOINTS = {
  USER_FIND: (chatId: string) => `${BASE_URL}/user/find-by-chat-id?chat_id=${chatId}`,
  CATEGORY_LIST: `${BASE_URL}/category/list`,
  CATEGORY_ADD: `${BASE_URL}/category/add-category`,
  CATEGORY_EDIT: (id: string) => `${BASE_URL}/category/edit-category/${id}`,
  CATEGORY_DELETE: (id: string) => `${BASE_URL}/category/delete-category/${id}`,
};
