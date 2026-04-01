import {
  Category,
  CategoryPayload,
  Product,
  ProductPayload
} from '../types/catalog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const adminApi = {
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (payload: CategoryPayload) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCategory: (id: string, payload: Partial<CategoryPayload>) =>
    request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteCategory: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/categories/${id}`, {
      method: 'DELETE'
    }),

  getProducts: () => request<Product[]>('/products'),
  createProduct: (payload: ProductPayload) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateProduct: (id: string, payload: Partial<ProductPayload>) =>
    request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteProduct: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/products/${id}`, {
      method: 'DELETE'
    })
};
