import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://127.0.0.1:4000';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const res = await fetch(`${BACKEND_URL}/api/inquiries?${searchParams.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    console.error('Failed to proxy inquiries GET', e);
  }
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(err, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
}
