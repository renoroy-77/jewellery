import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategoriesQuery, useProductsQuery } from '@/hooks/queries/useQueries';
import { categoriesService } from '@/services/categoriesService';
import { productsService } from '@/services/productsService';
import { Category, Product } from '@/types';

// Mock services
jest.mock('@/services/categoriesService');
jest.mock('@/services/productsService');

const mockCategories: Category[] = [
  {
    id: 'lockets',
    slug: 'lockets',
    name: 'Lockets',
    image: 'https://aamadappetti.com/uploads/cat.jpg',
    itemCount: 1,
    description: 'Panchaloham dollars and lockets',
  },
];

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    slug: 'vishnumaya-dollar',
    name: 'Vishnumaya Dollar',
    deity: 'Vishnumaya',
    category: 'lockets',
    price: 2599,
    rating: 5,
    reviewsCount: 1,
    inStock: true,
    description: 'Consecrated jewellery',
    metalComposition: {
      gold: '2.5%',
      silver: '12.5%',
      copper: '65.0%',
      zinc: '15.0%',
      iron: '5.0%',
      purityCertificate: 'Authentic Temple Guild Certified',
    },
    images: ['/img.jpg'],
    benefits: ['Grace'],
    tags: ['vishnumaya'],
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TanStack Query Hooks (Server State Management)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useCategoriesQuery should fetch and return live backend categories', async () => {
    (categoriesService.getAll as jest.Mock).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategoriesQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCategories);
    expect(result.current.data?.length).toBe(1);
    expect(result.current.data?.[0].name).toBe('Lockets');
    expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
  });

  it('useProductsQuery should fetch and return live backend products', async () => {
    (productsService.getAll as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProductsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProducts);
    expect(result.current.data?.length).toBe(1);
    expect(result.current.data?.[0].slug).toBe('vishnumaya-dollar');
    expect(productsService.getAll).toHaveBeenCalledTimes(1);
  });
});
