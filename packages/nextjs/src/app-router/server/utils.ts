import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export const buildRequestLike = () => {
  try {
    console.log(NextRequest);
    return new NextRequest('https://placeholder.com', { headers: headers() });
  } catch (e: any) {
    if (
      e &&
      'message' in e &&
      typeof e.message === 'string' &&
      e.message.toLowerCase().includes('Dynamic server usage'.toLowerCase())
    ) {
      throw e;
    }

    throw new Error(
      `Clerk: auth() and currentUser() are only supported in App Router (/app directory).\nIf you're using /pages, try getAuth() instead.\nOriginal error: ${e}`,
    );
  }
};
