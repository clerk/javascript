import { reverificationErrorResponse } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

const COOKIE = 'swingset-mock-delete';

export async function POST() {
  const store = await cookies();

  // First call: ask for step-up. After the card completes, the same fetcher is retried.
  if (store.get(COOKIE)?.value !== '1') {
    store.set(COOKIE, '1', { path: '/', maxAge: 120, sameSite: 'lax' });
    return reverificationErrorResponse('strict');
  }

  store.delete(COOKIE);
  return Response.json({ ok: true, at: new Date().toISOString() });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(COOKIE);
  return new Response(null, { status: 204 });
}
