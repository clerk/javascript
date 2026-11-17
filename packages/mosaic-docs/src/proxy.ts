import { type NextRequest, NextResponse } from 'next/server';

import { prefersMarkdown } from '@/lib/negotiation';

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  return !pathname.endsWith('.md') && prefersMarkdown(request.headers.get('accept'))
    ? NextResponse.rewrite(new URL(`/llms.mdx${pathname}`, request.url), { headers: { Vary: 'Accept' } })
    : NextResponse.next();
}

export const config = {
  matcher: ['/docs', '/docs/:kind/:slug'],
};
