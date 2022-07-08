import { AuthErrorReason } from '@clerk/backend-core';
import { NextResponse } from 'next/server';

// TODO: Generically add error reason only when present, without explicit set on cases
export function signedOutResponse(errorReason?: AuthErrorReason) {
  return new NextResponse(JSON.stringify({ error: 'Unauthenticated' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', 'Auth-Result': errorReason || '' },
  });
}

export function interstitialResponse(interstitial: string, errorReason?: AuthErrorReason) {
  return new NextResponse(interstitial, {
    headers: { 'Content-Type': 'text/html', 'Auth-Result': errorReason || '' },
    status: 401,
  });
}
