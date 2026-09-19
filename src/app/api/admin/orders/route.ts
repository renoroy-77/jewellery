import { NextResponse } from 'next/server';
import { INITIAL_ORDERS, OrderCMS } from '@/data/cmsData';

let storeOrders: OrderCMS[] = [...INITIAL_ORDERS];

export async function GET() {
  return NextResponse.json({
    orders: storeOrders,
    total: storeOrders.length,
  });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Order id and status required' }, { status: 400 });
    }

    const orderIndex = storeOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    storeOrders[orderIndex] = {
      ...storeOrders[orderIndex],
      status,
    };

    return NextResponse.json({
      success: true,
      order: storeOrders[orderIndex],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
