import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth.protect({ token: 'api_key' });
  return NextResponse.json({ userId });
}

export async function POST() {
  const { userId } = await auth.protect({ token: ['api_key', 'session_token'] });
  return NextResponse.json({ userId });
}
