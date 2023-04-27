import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export const buildRequestLike = () => {
  try {
    return new NextRequest('https://placeholder.com', { headers: headers() });
  } catch (e) {
    throw new Error(
      `Clerk: auth() and currentUser() can only be called from a page or API route handler when using App Router (/app directory).\nTry using getAuth() instead.\nOriginal error: ${e}`,
    );
  }
};
