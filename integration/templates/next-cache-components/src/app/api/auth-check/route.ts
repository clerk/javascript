import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId, sessionId } = await auth();

  return NextResponse.json({
    userId: userId ?? null,
    sessionId: sessionId ?? null,
    isSignedIn: !!userId,
  });
}
