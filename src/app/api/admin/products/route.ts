import { NextResponse } from 'next/server';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { Product, Category } from '@/types';

// In-memory persistent cache for products & categories
let storeProducts: Product[] = [...PRODUCTS];
let storeCategories: Category[] = [...CATEGORIES];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'categories') {
    return NextResponse.json({ categories: storeCategories });
  }

  return NextResponse.json({
    products: storeProducts,
    categories: storeCategories,
    total: storeProducts.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, product, category } = body;

    if (action === 'add_product' && product) {
      const newProduct: Product = {
        ...product,
        id: product.id || `prod-${Date.now()}`,
        slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        rating: product.rating || 5.0,
        reviewsCount: product.reviewsCount || 1,
        inStock: product.inStock !== false,
        images: product.images && product.images.length > 0 ? product.images : ['/assets/cat_ganesha.png'],
        benefits: product.benefits || ['Bestows Divine Grace', 'Attracts Abundance'],
        tags: product.tags || ['Panchaloham', 'Sacred'],
        metalComposition: product.metalComposition || {
          gold: '1.5%',
          silver: '4.0%',
          copper: '78.5%',
          zinc: '12.0%',
          iron: '4.0%',
          purityCertificate: 'Government Assay Certified',
        },
      };

      storeProducts.unshift(newProduct);
      return NextResponse.json({ success: true, product: newProduct });
    }

    if (action === 'update_category' && category) {
      storeCategories = storeCategories.map((c) => (c.id === category.id ? { ...c, ...category } : c));
      return NextResponse.json({ success: true, category });
    }

    return NextResponse.json({ error: 'Invalid POST body' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { product } = body as { product: Product };

    if (!product || !product.id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const index = storeProducts.findIndex((p) => p.id === product.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    storeProducts[index] = { ...storeProducts[index], ...product };
    return NextResponse.json({ success: true, product: storeProducts[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    storeProducts = storeProducts.filter((p) => p.id !== id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
