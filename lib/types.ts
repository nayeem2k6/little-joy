export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  description: string;
  category?: Category | string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  imageUrl?: string;
  stockQuantity?: number;
  stock?: number;
  ageRecommendation?: string;
  safetyInformation?: string;
  averageRating?: number;
}

export interface ApiList<T> {
  data?: T[];
  products?: T[];
  categories?: T[];
  items?: T[];
  pagination?: { page: number; pages: number; total: number };
}

export function productId(product: Product): string {
  return product._id || product.id || product.slug || "";
}

export function productStock(product: Product): number {
  return product.stockQuantity ?? product.stock ?? 0;
}

export function productImage(product: Product): string | undefined {
  return product.images?.[0] || product.imageUrl;
}
