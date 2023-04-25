import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export const buildRequestLike = () => {
  return new NextRequest('https://placeholder.com', { headers: headers() });
};
