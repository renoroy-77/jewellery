import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://127.0.0.1:4000';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const cleanId = id.replace(/^#+/, '');
    const res = await fetch(`${BACKEND_URL}/api/inquiries/${encodeURIComponent(cleanId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.replace(/^#+/, '');
    const res = await fetch(`${BACKEND_URL}/api/inquiries/${encodeURIComponent(cleanId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
