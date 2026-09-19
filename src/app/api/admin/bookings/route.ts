import { NextResponse } from 'next/server';
import { INITIAL_BOOKINGS, CONSULTATION_SERVICES } from '@/data/cmsData';
import { BookingItem } from '@/types';

// In-memory persistent cache for server lifecycle
let storeBookings: BookingItem[] = [...INITIAL_BOOKINGS];

export async function GET() {
  const total = storeBookings.length;
  const requested = storeBookings.filter((b) => b.status === 'Requested').length;
  const confirmed = storeBookings.filter((b) => b.status === 'Confirmed').length;
  const completed = storeBookings.filter((b) => b.status === 'Completed').length;

  return NextResponse.json({
    bookings: storeBookings,
    services: CONSULTATION_SERVICES,
    stats: {
      total,
      requested,
      confirmed,
      completed,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      serviceId,
      serviceName,
      devoteeName,
      email,
      phone,
      deity,
      nakshatra,
      mode,
      date,
      timeSlot,
      notes,
    } = body;

    if (!devoteeName || !phone || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'Name, phone, date, and timeSlot are required' },
        { status: 400 }
      );
    }

    const refCode = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking: BookingItem = {
      id: refCode,
      referenceCode: refCode,
      serviceId: serviceId || 'custom-craft',
      serviceName: serviceName || 'Custom Agamic Temple Jewellery Crafting',
      devoteeName,
      email: email || '',
      phone,
      deity: deity || 'Lord Ganesha',
      nakshatra: nakshatra || 'Rohini',
      mode: mode || 'video',
      date,
      timeSlot,
      status: 'Requested',
      notes: notes || '',
      createdAt: new Date().toISOString().split('T')[0],
      assignedConsultant: 'Master Sthapati R. Shanmugam',
    };

    storeBookings.unshift(newBooking);

    return NextResponse.json({
      success: true,
      booking: newBooking,
      referenceCode: refCode,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, assignedConsultant, meetingLink, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const index = storeBookings.findIndex((b) => b.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    storeBookings[index] = {
      ...storeBookings[index],
      ...(status ? { status } : {}),
      ...(assignedConsultant !== undefined ? { assignedConsultant } : {}),
      ...(meetingLink !== undefined ? { meetingLink } : {}),
      ...(notes !== undefined ? { notes } : {}),
    };

    return NextResponse.json({
      success: true,
      booking: storeBookings[index],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
