import { redirect } from '@clerk/backend';
import { NextResponse } from 'next/server';

const redirectAdapter = (url: string) => NextResponse.redirect(url);
export const { redirectToSignIn, redirectToSignUp } = redirect(redirectAdapter);
