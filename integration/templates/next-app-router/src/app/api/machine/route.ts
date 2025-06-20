import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId, ...rest } = await auth({ acceptsToken: 'api_key' });

  console.log('userId', userId);
  console.log('rest', rest);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ userId });
}

export async function POST() {
  const authObject = await auth({ acceptsToken: ['api_key', 'session_token'] });

  if (!authObject.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ userId: authObject.userId });
}
