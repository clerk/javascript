// import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export const buildRequestLike = () => {
  try {
    // Dynamically import next/headers, otherwise Next12 apps will break
    // because next/headers was introduced in next@13
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { headers } = require('next/headers');
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
