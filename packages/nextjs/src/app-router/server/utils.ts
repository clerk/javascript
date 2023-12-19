import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export const buildRequestLike = () => {
  try {
    return new NextRequest('https://placeholder.com', { headers: headers() });
  } catch (e: any) {
    if (errorMessageIncludes(e, 'Dynamic server usage')) {
      throw e;
    }

    if (errorMessageIncludes(e, 'requestAsyncStorage')) {
      throw new Error(
        `Clerk: Are you developing on Windows?\nTry installing WSL: https://learn.microsoft.com/en-us/windows/wsl/install\nRelated issue: https://github.com/vercel/next.js/issues/52176\nOriginal error: ${e}`,
      );
    }

    throw new Error(
      `Clerk: auth() and currentUser() are only supported in App Router (/app directory).\nIf you're using /pages, try getAuth() instead.\nOriginal error: ${e}`,
    );
  }
};

const errorMessageIncludes = (e: any, message: string) =>
  e && 'message' in e && typeof e.message === 'string' && e.message.toLowerCase().includes(message.toLowerCase());
