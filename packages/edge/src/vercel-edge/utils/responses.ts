import { AuthErrorReason } from '@clerk/backend-core';
import { NextResponse } from 'next/server';

export function signedOutResponse() {
  return new NextResponse(JSON.stringify({ error: 'Unauthenticated' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function interstitialResponse(interstitial: string, errorReason?: AuthErrorReason) {
  return new NextResponse(interstitial, {
    headers: { 'Content-Type': 'text/html', 'Auth-Result': errorReason || '' },
    status: 401,
  });
}
