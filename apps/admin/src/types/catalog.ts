export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  sku: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ProductImageInput {
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductPayload {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  isActive?: boolean;
  categoryId: string;
  images?: ProductImageInput[];
}
