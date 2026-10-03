'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/services/categoriesService';
import { productsService } from '@/services/productsService';
import { dashboardService } from '@/services/dashboardService';
import { cmsService } from '@/services/cmsService';
import { Product, Category } from '@/types';

// Query Keys
export const queryKeys = {
  categories: ['categories'] as const,
  category: (idOrSlug: string) => ['category', idOrSlug] as const,
  products: (params?: Record<string, any>) => ['products', params] as const,
  product: (idOrSlug: string) => ['product', idOrSlug] as const,
  featuredProducts: ['products', 'featured'] as const,
  dashboardStats: ['dashboard-stats'] as const,
  announcement: ['announcement'] as const,
};

// =========================================================================
// Category Queries & Mutations
// =========================================================================
export function useCategoriesQuery(initialData?: Category[]) {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesService.getAll(),
    initialData,
  });
}

export function useCategoryQuery(idOrSlug: string, initialData?: Category | null) {
  return useQuery({
    queryKey: queryKeys.category(idOrSlug),
    queryFn: () => categoriesService.getById(idOrSlug),
    initialData: initialData ?? undefined,
    enabled: Boolean(idOrSlug),
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: Partial<Category>) => categoriesService.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      categoriesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

// =========================================================================
// Product Queries & Mutations
// =========================================================================
export function useProductsQuery(
  params?: { category?: string; search?: string; inStock?: boolean; featured?: boolean },
  initialData?: Product[]
) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => productsService.getAll(params),
    initialData,
  });
}

export function useProductQuery(idOrSlug: string, initialData?: Product | null) {
  return useQuery({
    queryKey: queryKeys.product(idOrSlug),
    queryFn: () => productsService.getById(idOrSlug),
    initialData: initialData ?? undefined,
    enabled: Boolean(idOrSlug),
  });
}

export function useFeaturedProductsQuery() {
  return useQuery({
    queryKey: queryKeys.featuredProducts,
    queryFn: async () => {
      const data = await productsService.getAll({ featured: true });
      return data.filter((p: Product) => p.featured === true && p.inStock !== false).slice(0, 8);
    },
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: Partial<Product>) => productsService.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<Product> }) =>
      productsService.update(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// =========================================================================
// Dashboard & CMS Queries
// =========================================================================
export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => dashboardService.getStats(),
  });
}

export function useAnnouncementQuery() {
  return useQuery({
    queryKey: queryKeys.announcement,
    queryFn: () => cmsService.getAnnouncement(),
  });
}
